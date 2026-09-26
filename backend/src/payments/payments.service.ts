import { Injectable, Logger, HttpException, BadRequestException, ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { MidtransGateway } from "./gateways/midtrans.service";
import { StripeGateway } from "./gateways/stripe.service";
import { CreatePaymentDto } from "./dtos/create-payment.dto";

interface PaymentResult {
  transactionId: string;
  paymentUrl: string;
  amount: number;
  method: string;
}

interface WebhookResult {
  success: boolean;
  message: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private midtransGateway: MidtransGateway,
    private stripeGateway: StripeGateway,
  ) {}

  async createPayment(orderId: string, createPaymentDto: CreatePaymentDto): Promise<PaymentResult> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.paymentStatus !== "PENDING") {
      throw new ConflictException("Order payment is already processed");
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId, status: "PAID" },
    });

    if (existingPayment) {
      throw new ConflictException("Order already has a successful payment");
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount: order.totalAmount,
        method: createPaymentDto.method,
        status: "PENDING",
         gatewayRef: createPaymentDto.gatewayRef,
       },
     });

    let result: PaymentResult;

    if (createPaymentDto.method === "midtrans") {
      const midtransResult = await this.midtransGateway.createTransaction(
        order,
        createPaymentDto.customerDetails!,
      );
      result = {
        transactionId: midtransResult.transaction_id,
        paymentUrl: midtransResult.redirect_url,
        amount: midtransResult.amount,
        method: midtransResult.payment_method,
      };
    } else if (createPaymentDto.method === "stripe") {
      result = await this.stripeGateway.createPaymentIntent(
        order,
        createPaymentDto.customerDetails!,
      );
    } else {
      throw new BadRequestException("Unsupported payment method");
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayRef: result.transactionId },
    });

    return result;
  }

  async handleMidtransWebhook(payload: any): Promise<WebhookResult> {
    const { order_id, transaction_id, status_code, signature_key } = payload;

    const order = await this.prisma.order.findUnique({
      where: { orderNumber: order_id },
    });

    if (!order) {
      throw new BadRequestException(`Order ${order_id} not found`);
    }

    const isValid = this.midtransGateway.validateSignature(
      order_id,
      status_code,
      transaction_id,
      signature_key,
    );

    if (!isValid) {
      throw new HttpException("Invalid signature", 401);
    }

    const orderStatus = this.midtransGateway.mapMidtransStatus(payload.transaction_status);

    await this.prisma.payment.updateMany({
      where: { orderId: order.id },
      data: {
        gatewayRef: transaction_id,
        payload: payload as any,
        status: orderStatus,
      },
    });

    if (orderStatus === "PAID") {
      await this.processSuccessfulPayment(order.id);
    } else if (orderStatus === "FAILED") {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
    }

    return { success: true, message: "Webhook processed" };
  }

  async handleStripeWebhook(payload: any, signature: string): Promise<WebhookResult> {
    const event = this.stripeGateway.constructWebhookEvent(
      Buffer.from(JSON.stringify(payload)).toString("base64"),
      signature,
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const order = await this.prisma.order.findUnique({
        where: { id: paymentIntent.metadata.orderId },
      });

      if (!order) {
        throw new BadRequestException("Order not found for Stripe webhook");
      }

      await this.prisma.payment.updateMany({
        where: { orderId: order.id },
        data: {
          gatewayRef: paymentIntent.id,
          status: "PAID",
          payload: event as any,
        },
      });

      await this.processSuccessfulPayment(order.id);
    }

    return { success: true, message: "Webhook processed" };
  }

  private async processSuccessfulPayment(orderId: string): Promise<void> {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", shippingStatus: "PROCESSING" },
      include: {
        vendorOrders: {
          include: {
            orderItems: {
              include: {
                variant: { include: { product: true } },
              },
            },
          },
        },
      },
    });

    for (const vendorOrder of order.vendorOrders) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { id: vendorOrder.vendorId },
      });

      if (!vendor) continue;

      const commissionRate = Number(vendor.commissionRate) || 10;
      const commissionAmount = Number(vendorOrder.commissionFee);
      const netAmount = Number(vendorOrder.subtotal) - commissionAmount;

      await this.prisma.walletTransaction.create({
        data: {
          vendorId: vendor.id,
          type: "CREDIT",
          amount: netAmount,
          description: `Payment for order ${order.orderNumber}`,
          referenceId: vendorOrder.id,
          status: "COMPLETED",
        },
      });

      await this.prisma.walletTransaction.create({
        data: {
          vendorId: vendor.id,
          type: "COMMISSION",
          amount: commissionAmount,
          description: `Platform commission for order ${order.orderNumber}`,
          referenceId: vendorOrder.id,
          status: "COMPLETED",
        },
      });
    }
  }

  async getPaymentStatus(orderId: string): Promise<any> {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      throw new BadRequestException("No payment found for this order");
    }

    return { data: payment };
  }
}