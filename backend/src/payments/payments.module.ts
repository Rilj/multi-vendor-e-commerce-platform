import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { MidtransWebhookController } from "./webhook/midtrans/midtrans-webhook.controller";
import { StripeWebhookController } from "./webhook/stripe/stripe-webhook.controller";
import { MidtransGateway } from "./gateways/midtrans.service";
import { StripeGateway } from "./gateways/stripe.service";

@Module({
  controllers: [PaymentsController, MidtransWebhookController, StripeWebhookController],
  providers: [PaymentsService, MidtransGateway, StripeGateway],
  exports: [PaymentsService],
})
export class PaymentsModule {}