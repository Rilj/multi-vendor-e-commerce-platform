import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: any;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Invalid authorization header");
    }

    const token = authHeader.split(" ")[1];

    try {
      const secret = this.configService.get<string>("jwt.secret");
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          vendor: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        vendor: user.vendor,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
