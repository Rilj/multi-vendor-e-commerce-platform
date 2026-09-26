import { Controller, Post, Body, Headers, HttpException, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PaymentsService } from "../../payments.service";

@ApiTags("webhooks")
@Controller("webhooks/stripe")
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: "Stripe webhook handler" })
  async handleWebhook(
    @Body() payload: any,
    @Headers("stripe-signature") signature: string,
  ) {
    try {
      return await this.paymentsService.handleStripeWebhook(payload, signature);
    } catch (error: any) {
      this.logger.error(`Stripe webhook error: ${error.message}`);
      throw new HttpException(
        { message: "Webhook processing failed" },
        error.status || 500,
      );
    }
  }
}