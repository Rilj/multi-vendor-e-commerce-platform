import {
  IsString,
  IsOptional,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAddressDto {
  @ApiPropertyOptional({ example: "Home" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  label?: string;

  @ApiProperty({ example: "John Smith", maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: "+6281234567890" })
  @IsString()
  phone: string;

  @ApiProperty({ example: "Jl. Merdeka No. 1", maxLength: 255 })
  @IsString()
  @MaxLength(255)
  address: string;

  @ApiPropertyOptional({ example: "Jakarta" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "Central Jakarta" })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: "DKI Jakarta" })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: "10110" })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ type: Number, example: -6.2000024 })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ type: Number, example: 106.816494 })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
