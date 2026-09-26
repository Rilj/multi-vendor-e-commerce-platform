import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from "class-validator";

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone?: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
