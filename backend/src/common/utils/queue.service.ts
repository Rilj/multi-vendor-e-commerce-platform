import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue, Job } from "bullmq";
import { RedisService } from "../../redis/redis.service";

export interface EmailJobData {
  type: "verification" | "password_reset" | "order_confirmation" | "shipment_update";
  to: string;
  orderId?: string;
  token?: string;
}

export interface PdfJobData {
  type: "invoice" | "packing_slip" | "shipping_label";
  orderId: string;
}

export interface WebhookJobData {
  type: string;
  orderId: string;
  payload: any;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private emailQueue: Queue;
  private pdfQueue: Queue;
  private webhookQueue: Queue;

  constructor(private redisService: RedisService) {
    const client = this.redisService.getClient();
    const connection = { host: "localhost", port: 6379 };

    this.emailQueue = new Queue("email", { connection });
    this.pdfQueue = new Queue("pdf", { connection });
    this.webhookQueue = new Queue("webhook", { connection });
  }

  async addEmailJob(data: EmailJobData): Promise<Job> {
    return this.emailQueue.add("send-email", data);
  }

  async addPdfJob(data: PdfJobData): Promise<Job> {
    return this.pdfQueue.add("generate-pdf", data);
  }

  async addWebhookJob(data: WebhookJobData): Promise<Job> {
    return this.webhookQueue.add("process-webhook", data);
  }

  getEmailQueue(): Queue {
    return this.emailQueue;
  }

  getPdfQueue(): Queue {
    return this.pdfQueue;
  }

  getWebhookQueue(): Queue {
    return this.webhookQueue;
  }
}
