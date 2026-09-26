import { IsString, IsEnum, IsOptional } from "class-validator";
import { VendorStatus, PayoutStatus } from "@prisma/client";

export class ApproveVendorDto {
  @IsEnum(VendorStatus)
  status: VendorStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApprovePayoutDto {
  @IsEnum(PayoutStatus)
  status: PayoutStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}