import { Injectable, Logger, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserRole, VendorStatus, PayoutStatus } from "@prisma/client";

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVendors: number;
  pendingPayouts: number;
  recentOrders: any[];
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenueResult,
      pendingVendors,
      pendingPayouts,
      recentOrders,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vendor.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID" },
      }),
      this.prisma.vendor.count({ where: { status: VendorStatus.PENDING } }),
      this.prisma.payoutRequest.count({ where: { status: PayoutStatus.PENDING } }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { select: { name: true, email: true } },
          vendorOrders: { select: { vendor: { select: { storeName: true } } } },
        },
      }),
    ]);

    return {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue: Number(totalRevenueResult._sum.totalAmount || 0),
      pendingVendors,
      pendingPayouts,
      recentOrders,
    };
  }

  async getUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          vendor: { select: { id: true, storeName: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        vendor: true,
        addresses: true,
        orders: { take: 10, orderBy: { createdAt: "desc" } },
      },
    });

    if (!user) {
      throw new ForbiddenException("User not found");
    }

    return user;
  }

  async blockUser(id: string, isBlocked: boolean = true) {
    return this.prisma.user.update({
      where: { id },
      data: { emailVerified: !isBlocked },
    });
  }

  async approveVendor(vendorId: string, status: VendorStatus, notes?: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new ForbiddenException("Vendor not found");
    }

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: { status },
    });
  }

  async getVendors(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, createdAt: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.vendor.count(),
    ]);

    return {
      data: vendors,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPayouts(page: number = 1, limit: number = 20, status?: PayoutStatus) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [payouts, total] = await Promise.all([
      this.prisma.payoutRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          vendor: { select: { id: true, storeName: true, slug: true, user: { select: { name: true, email: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payoutRequest.count({ where }),
    ]);

    return {
      data: payouts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async approvePayout(payoutId: string, status: PayoutStatus) {
    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new ForbiddenException("Payout not found");
    }

    return this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: { status, processedAt: new Date() },
    });
  }

  async getDisputes(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { paymentStatus: "REFUNDED" },
        skip,
        take: limit,
        include: {
          buyer: { select: { name: true, email: true } },
          vendorOrders: { select: { vendor: { select: { storeName: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count({ where: { paymentStatus: "REFUNDED" } }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}