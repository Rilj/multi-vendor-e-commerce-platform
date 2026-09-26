import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Order } from "@prisma/client";
import Stripe from "stripe";

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface StripePaymentResult {
  transactionId: string;
  paymentUrl: string;
  amount: number;
  method: string;
}

@Injectable()
export class StripeGateway {
  private readonly logger = new Logger(StripeGateway.name);
  private readonly stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>("stripe.secretKey") || "";
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });
  }

  async createPaymentIntent(
    order: Order,
    customerDetails: CustomerDetails,
  ): Promise<StripePaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: "usd",
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      description: `Order ${order.orderNumber}`,
      receipt_email: customerDetails.email,
      shipping: {
        name: `${customerDetails.firstName} ${customerDetails.lastName}`,
        phone: customerDetails.phone,
        address: {
          line1: "Address not provided",
          postal_code: "00000",
          city: "City",
          state: "State",
          country: "US",
        },
      },
    });

    return {
      transactionId: paymentIntent.id,
      paymentUrl: paymentIntent.client_secret || "",
      amount: Number(order.totalAmount),
      method: "stripe",
    };
  }

  constructWebhookEvent(payload: string, signature: string): any {
    const webhookSecret = this.configService.get<string>("stripe.webhookSecret") || "";
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error: any) {
      this.logger.error(`Stripe webhook error: ${error.message}`);
      throw new BadRequestException("Invalid webhook signature");
    }
  }
}
