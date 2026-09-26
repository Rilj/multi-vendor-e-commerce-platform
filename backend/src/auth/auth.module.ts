import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PrismaModule } from "../prisma/prisma.module";
import { RedisModule } from "../redis/redis.module";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("jwt.secret") ?? "default-secret",
        signOptions: {
          expiresIn: configService.get<string>("jwt.expiresIn", "7d"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    LocalAuthGuard,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [JwtModule, AuthService, LocalAuthGuard, JwtAuthGuard],
})
export class AuthModule {}
