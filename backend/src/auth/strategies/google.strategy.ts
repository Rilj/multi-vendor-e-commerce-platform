import { Strategy } from "passport-google-oauth20";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface GoogleUser {
  email: string;
  name: string;
  provider: string;
  accessToken: string;
}

interface GoogleProfile {
  id: string;
  displayName: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>("google.clientId"),
      clientSecret: configService.get<string>("google.clientSecret"),
      callbackURL: "/api/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    if (!profile) {
      return done(new InternalServerErrorException("Google profile not returned"));
    }

    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new InternalServerErrorException("Google email not returned"));
    }

    const user: GoogleUser = {
      email,
      name: profile.displayName,
      provider: "google",
      accessToken,
    };

    done(null, user);
  }
}
