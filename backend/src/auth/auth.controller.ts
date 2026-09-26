import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user account" })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return {
      user: { id: user.id, email: user.email, name: user.name },
      message: user.message,
    };
  }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: "Authenticate with email and password" })
  @ApiBody({ type: LoginDto })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token using a refresh token" })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @ApiBearerAuth()
  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Revoke the supplied refresh token" })
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }

  @ApiBearerAuth()
  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get the authenticated user profile" })
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post("verify-email")
  @ApiOperation({ summary: "Verify email address using a token" })
  async verifyEmail(@Query("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Initiate Google OAuth2 login" })
  async googleLogin() {
    return { message: "Redirecting to Google..." };
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Google OAuth2 callback" })
  async googleCallback(@Request() req: any) {
    const user = await this.authService.validateGoogleUser(req.user);
    return this.authService.login(user);
  }
}
