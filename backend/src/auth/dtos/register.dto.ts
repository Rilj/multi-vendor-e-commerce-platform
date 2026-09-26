import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "John Doe", minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Str0ngP@ssw0rd",
    minLength: 8,
    maxLength: 128,
    description: "Plain-text password (hashed with bcrypt before storage)",
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({
    required: false,
    example: "+6281234567890",
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone?: string;
}
