declare module "passport-local" {
  import { Strategy as PassportStrategy, IStrategyOptions } from "passport";
  export { IStrategyOptions };
  export class Strategy extends PassportStrategy {
    constructor(options: IStrategyOptions, verify: (username: string, password: string, done: (error: any, user?: any) => void) => void);
  }
}

declare module "passport-jwt" {
  import { Strategy as PassportStrategy } from "passport";
  export interface JwtFromRequestFunction {
    (request: any): string | null;
  }
  export interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    ignoreExpiration?: boolean;
    secretOrKey?: string;
    algorithms?: string[];
  }
  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: (payload: any, done: (error: any, user?: any) => void) => void);
  }
  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
    fromBodyField(field: string): JwtFromRequestFunction;
    fromHeader(header: string): JwtFromRequestFunction;
    fromUrlQueryParameter(param: string): JwtFromRequestFunction;
  };
}

declare module "passport-google-oauth20" {
  import { Strategy as PassportStrategy } from "passport";
  export class Strategy extends PassportStrategy {
    constructor(
      options: {
        clientID: string;
        clientSecret: string;
        callbackURL: string;
        scope: string[];
      },
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void,
      ) => void,
    );
  }
}
