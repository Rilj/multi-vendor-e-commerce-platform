import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface SettingsData {
  commissionRate?: number;
  shippingMethods?: Array<{ name: string; code: string; cost: number; estimatedDays: string }>;
  paymentMethods?: Array<{ name: string; code: string; enabled: boolean }>;
  taxRate?: number;
  currency?: string;
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  minOrderAmount?: number;
  maxOrderAmount?: number;
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(): Promise<SettingsData> {
    const settings = await this.prisma.setting.findMany();

    const result: SettingsData = {};
    settings.forEach((s) => {
      const value = s.value as any;
      Object.assign(result, value);
    });

    if (Object.keys(result).length === 0) {
      return this.getDefaultSettings();
    }

    return result;
  }

  async updateSettings(settings: SettingsData): Promise<SettingsData> {
    const existing = await this.prisma.setting.findFirst();
    if (existing) {
      await this.prisma.setting.update({
        where: { id: existing.id },
        data: { value: settings as any },
      });
    } else {
      await this.prisma.setting.create({
        data: { key: "global", value: settings as any },
      });
    }

    return settings;
  }

  async getPublicSettings(): Promise<SettingsData> {
    const allSettings = await this.getSettings();
    const publicKeys: (keyof SettingsData)[] = [
      "commissionRate",
      "shippingMethods",
      "paymentMethods",
      "taxRate",
      "currency",
      "siteName",
      "siteDescription",
      "contactEmail",
      "contactPhone",
      "minOrderAmount",
      "maxOrderAmount",
    ];

    const publicSettings: SettingsData = {};
    publicKeys.forEach((key) => {
      if (allSettings[key] !== undefined) {
        (publicSettings as any)[key] = (allSettings as any)[key];
      }
    });

    return publicSettings;
  }

  private getDefaultSettings(): SettingsData {
    return {
      commissionRate: 10.0,
      shippingMethods: [
        { name: "Standard", code: "standard", cost: 5000, estimatedDays: "3-5" },
        { name: "Express", code: "express", cost: 15000, estimatedDays: "1-2" },
        { name: "Same Day", code: "same_day", cost: 25000, estimatedDays: "0-1" },
      ],
      paymentMethods: [
        { name: "Credit Card", code: "credit_card", enabled: true },
        { name: "Bank Transfer", code: "bank_transfer", enabled: true },
        { name: "E-Wallet", code: "e_wallet", enabled: true },
        { name: "QRIS", code: "qris", enabled: true },
      ],
      taxRate: 0.0,
      currency: "IDR",
      siteName: "Multi-Vendor E-Commerce",
      siteDescription: "Enterprise-grade multi-vendor e-commerce platform",
      contactEmail: "support@mvecommerce.com",
      contactPhone: "+6281234567890",
      minOrderAmount: 0,
      maxOrderAmount: 100000000,
    };
  }
}