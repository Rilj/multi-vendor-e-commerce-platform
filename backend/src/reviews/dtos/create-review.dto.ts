import { IsString, IsNumber, Min, Max, IsOptional, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsString()
  vendorId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  images?: { url: string }[];
}