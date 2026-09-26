import { IsString, IsEmail, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Str0ngP@ssw0rd",
    minLength: 6,
    description: "Plain-text password",
  })
  @IsString()
  @MinLength(6)
  password: string;
}
