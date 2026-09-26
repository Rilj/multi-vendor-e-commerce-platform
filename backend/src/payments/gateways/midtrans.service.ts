import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Order } from "@prisma/client";
import crypto from "crypto";
import axios from "axios";

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface MidtransTransactionResult {
  transaction_id: string;
  redirect_url: string;
  amount: number;
  payment_method: string;
}

@Injectable()
export class MidtransGateway {
  private readonly logger = new Logger(MidtransGateway.name);
  private readonly serverKey: string;
  private readonly isProduction: boolean;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.serverKey = this.configService.get<string>("midtrans.serverKey") || "";
    this.isProduction = this.configService.get<boolean>("midtrans.isProduction") || false;
    this.baseUrl = this.isProduction
      ? "https://api.midtrans.com/v2"
      : "https://api.sandbox.midtrans.com/v2";
  }

  async createTransaction(
    order: Order,
    customerDetails: CustomerDetails,
  ): Promise<MidtransTransactionResult> {
    const transactionData = {
      order_id: order.orderNumber,
      gross_amount: Number(order.totalAmount),
      customer_details: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      credit_card: {
        secure: true,
      },
    };

    const auth = Buffer.from(this.serverKey).toString("base64");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/charge`,
        transactionData,
        { headers },
      );

      return {
        transaction_id: response.data.transaction_id,
        redirect_url: response.data.redirect_url,
        amount: Number(order.totalAmount),
        payment_method: response.data.payment_type || "midtrans",
      };
    } catch (error: any) {
      this.logger.error(`Midtrans error: ${error.message}`);
      throw new BadRequestException("Payment gateway error");
    }
  }

  validateSignature(
    orderId: string,
    statusCode: string,
    transactionId: string,
    signatureKey: string,
  ): boolean {
    const data = `${orderId}${statusCode}${transactionId}`;
    const expectedSignature = crypto
      .createHmac("sha512", this.serverKey)
      .update(data)
      .digest("hex");

    return expectedSignature === signatureKey;
  }

  mapMidtransStatus(transactionStatus: string): "PAID" | "PENDING" | "FAILED" | "REFUNDED" {
    const statusMap: Record<string, "PAID" | "PENDING" | "FAILED" | "REFUNDED"> = {
      settlement: "PAID",
      capture: "PAID",
      authorize: "PAID",
      pending: "PENDING",
      deny: "FAILED",
      cancel: "FAILED",
      expire: "FAILED",
      refund: "REFUNDED",
      partial_refund: "REFUNDED",
      chargeback: "FAILED",
    };

    return statusMap[transactionStatus] || "PENDING";
  }
}