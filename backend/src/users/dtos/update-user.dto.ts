import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "Jane Doe", minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: "jane@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: "+6281234567890",
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone?: string;
}
