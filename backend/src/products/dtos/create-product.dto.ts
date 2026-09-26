import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";
import { ProductStatus } from "@prisma/client";

export class CreateVariantDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsNotEmpty()
  attributes: Record<string, any>;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  dimensions?: Record<string, any>;
}

export class CreateImageDataDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  alt?: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDataDto)
  images?: CreateImageDataDto[];
}
