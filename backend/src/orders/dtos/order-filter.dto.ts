import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import {
  PaymentStatus,
  ShippingStatus,
  VendorOrderStatus,
} from "@prisma/client";

export class OrderFilterDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(ShippingStatus)
  shippingStatus?: ShippingStatus;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class VendorOrderFilterDto {
  @IsOptional()
  @IsEnum(VendorOrderStatus)
  status?: VendorOrderStatus;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class VendorOrderStatusUpdateDto {
  @IsEnum(VendorOrderStatus)
  status: VendorOrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}
