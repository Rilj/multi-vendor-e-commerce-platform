import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { EmailService } from "../email/email.service";
import { RegisterDto } from "./dtos/register.dto";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { JwtPayload, JwtTokens } from "./types/jwt.types";

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified?: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly emailService: EmailService,
  ) {
    this.jwtSecret = this.configService.get<string>("jwt.secret") ?? "default-secret";
    this.jwtRefreshSecret =
      this.configService.get<string>("jwt.refreshSecret") ?? this.jwtSecret;
    this.accessExpiresIn = this.configService.get<string>("jwt.expiresIn", "7d");
    this.refreshExpiresIn =
      this.configService.get<string>("jwt.refreshExpiresIn", "30d");
  }

  async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ id: string; email: string; name: string; message: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const rounds = this.configService.get<number>("bcrypt.rounds", 12);
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        phone: dto.phone ?? null,
        role: UserRole.BUYER,
      },
    });

    this.sendVerificationEmail(user.id, user.email, user.name).catch((err) =>
      this.logger.error(`Failed to send verification email: ${err.message}`),
    );
    this.logger.log(`User registered: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  }

  private async sendVerificationEmail(userId: string, email: string, _name: string) {
    const token = randomUUID();
    const ttlSeconds = this.parseExpiresToSeconds(
      this.configService.get<string>("email.verifyTtl", "24h"),
    );
    await this.redis.set(`verify_token:${token}`, userId, ttlSeconds);
    await this.emailService.sendVerificationEmail(email, token);
  }

  async verifyEmail(token: string): Promise<{ emailVerified: boolean }> {
    const userId = await this.redis.get(`verify_token:${token}`);
    if (!userId) {
      throw new BadRequestException("Invalid or expired verification token");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    await this.redis.del(`verify_token:${token}`);
    return { emailVerified: true };
  }

  async login(user: AuthenticatedUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const tokens = await this.generateTokens(payload);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = await this.validateRefreshToken(dto.refreshToken);

    await this.revokeRefreshToken(dto.refreshToken);

    const tokens = await this.generateTokens({
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    });
    await this.storeRefreshToken(payload.sub, tokens.refreshToken);

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
      ...tokens,
    };
  }

  async logout(dto: RefreshTokenDto): Promise<{ loggedOut: boolean }> {
    await this.revokeRefreshToken(dto.refreshToken);
    return { loggedOut: true };
  }

  async validateGoogleUser(googleUser: {
    email: string;
    name: string;
    provider: string;
    accessToken: string;
  }): Promise<AuthenticatedUser> {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
      select: { id: true, email: true, name: true, role: true, emailVerified: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email,
          passwordHash: "",
          role: UserRole.BUYER,
          emailVerified: true,
        },
      });
    }

    if (!user.emailVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  private async generateTokens(payload: JwtPayload): Promise<JwtTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtSecret,
        expiresIn: this.accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtRefreshSecret,
        expiresIn: this.refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const ttlSeconds = this.parseExpiresToSeconds(this.refreshExpiresIn);
    await this.redis.set(`rt:${refreshToken}`, userId, ttlSeconds);
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      },
    });
  }

  private async validateRefreshToken(refreshToken: string): Promise<JwtPayload> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const userId = await this.redis.get(`rt:${refreshToken}`);
    if (!userId) {
      throw new UnauthorizedException("Refresh token has been revoked");
    }
    if (userId !== payload.sub) {
      throw new UnauthorizedException("Refresh token mismatch");
    }

    return payload;
  }

  private async revokeRefreshToken(refreshToken: string) {
    await this.redis.del(`rt:${refreshToken}`);
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  private parseExpiresToSeconds(value: string): number {
    const match = /^(\d+)([smhd])?$/.exec(value);
    if (!match) {
      return 60 * 60 * 24 * 30;
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2] ?? "s";
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return amount * (multipliers[unit] ?? 1);
  }
}
