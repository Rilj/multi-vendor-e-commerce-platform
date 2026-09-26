import { IsString, IsOptional, IsEnum } from "class-validator";

export class CreatePaymentDto {
  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  gatewayRef?: string;

  @IsOptional()
  customerDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}