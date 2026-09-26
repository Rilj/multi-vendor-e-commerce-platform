import { Controller, Post, Body, Headers, HttpException, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PaymentsService } from "../../payments.service";

@ApiTags("webhooks")
@Controller("webhooks/midtrans")
export class MidtransWebhookController {
  private readonly logger = new Logger(MidtransWebhookController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: "Midtrans webhook handler" })
  async handleWebhook(@Body() payload: any) {
    try {
      return await this.paymentsService.handleMidtransWebhook(payload);
    } catch (error: any) {
      this.logger.error(`Midtrans webhook error: ${error.message}`);
      throw new HttpException(
        { message: "Webhook processing failed" },
        error.status || 500,
      );
    }
  }
}