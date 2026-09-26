import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { GetUser } from "../common/decorators/get-user.decorator";

@ApiTags("payments")
  @Controller("payments")
  @ApiBearerAuth()
  export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(":orderId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create payment for order" })
  async createPayment(
    @Param("orderId") orderId: string,
    @Body() body: any,
  ) {
    const result = await this.paymentsService.createPayment(orderId, body);
    return { data: result };
  }

  @Get("order/:orderId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get payment status for order" })
  async getPaymentStatus(@Param("orderId") orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }
}