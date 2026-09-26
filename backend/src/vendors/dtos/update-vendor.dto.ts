import { IsString, IsOptional, MaxLength, IsNumber, Min } from "class-validator";

export class UpdateVendorDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  storeName?: string;

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
  @IsNumber()
  @Min(0)
  commissionRate?: number;
}
