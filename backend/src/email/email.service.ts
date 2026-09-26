import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const emailConfig = {
      host: this.configService.get<string>("email.host"),
      port: this.configService.get<number>("email.port", 587),
      secure: false,
      auth: {
        user: this.configService.get<string>("email.user"),
        pass: this.configService.get<string>("email.pass"),
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const from = this.configService.get<string>("email.from");
      await this.transporter.sendMail({ ...options, from });
      this.logger.log(`Email sent to ${options.to}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const baseUrl = this.configService.get<string>("email.from") || "http://localhost:3000";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Email Verification</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${baseUrl}/verify-email?token=${token}" style="display: inline-block; padding: 12px 24px; background-color: #4a6a82; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      </div>
    `;
    await this.sendEmail({
      to,
      subject: "Verify Your Email",
      html,
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const baseUrl = this.configService.get<string>("email.from") || "http://localhost:3000";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below:</p>
        <a href="${baseUrl}/reset-password?token=${token}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      </div>
    `;
    await this.sendEmail({
      to,
      subject: "Password Reset Request",
      html,
    });
  }

  async sendOrderConfirmationEmail(
    to: string,
    order: { orderNumber: string; totalAmount: number },
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Order Confirmation</h1>
        <p>Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
        <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
        <p>We will notify you when your order ships.</p>
      </div>
    `;
    await this.sendEmail({
      to,
      subject: `Order #${order.orderNumber} Confirmation`,
      html,
    });
  }
}