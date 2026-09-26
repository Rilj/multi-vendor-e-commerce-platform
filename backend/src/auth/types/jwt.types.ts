export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken?: string;
}
