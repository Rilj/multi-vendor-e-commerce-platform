import { IsString, IsOptional, MaxLength, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateVendorDto {
  @IsString()
  @MaxLength(100)
  storeName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  ktpNumber?: string;

  @IsOptional()
  @IsString()
  npwpNumber?: string;

  @IsOptional()
  bankDetails?: Record<string, any>;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  commissionRate?: number;
}
