import { IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
  @ApiProperty({
    description: "Current plain-text password",
    example: "Str0ngP@ssw0rd",
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: "New plain-text password",
    example: "N3wStr0ngP@ssw0rd",
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
