import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { Vendor, VendorStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SlugService } from "../common/utils/slug.service";
import { CreateVendorDto } from "./dtos/create-vendor.dto";
import { UpdateVendorDto } from "./dtos/update-vendor.dto";

@Injectable()
export class VendorsService {
  constructor(
    private prisma: PrismaService,
    private slugService: SlugService,
  ) {}

  async create(userId: string, createVendorDto: CreateVendorDto): Promise<Vendor> {
    const existingVendor = await this.prisma.vendor.findFirst({
      where: { OR: [{ storeName: createVendorDto.storeName }, { userId }] },
    });

    if (existingVendor) {
      throw new BadRequestException("Store name already exists or user already has a vendor account");
    }

    const existingSlugs = await this.prisma.vendor.findMany({
      select: { slug: true, _count: true },
    });
    const usedSlugs = existingSlugs.map((v) => v.slug);
    const slug = this.slugService.generateUnique(createVendorDto.storeName.toLowerCase(), usedSlugs);

    const vendor = await this.prisma.vendor.create({
      data: {
        userId,
        storeName: createVendorDto.storeName,
        slug,
        description: createVendorDto.description,
        logoUrl: createVendorDto.logoUrl,
        bannerUrl: createVendorDto.bannerUrl,
        ktpNumber: createVendorDto.ktpNumber,
        npwpNumber: createVendorDto.npwpNumber,
        bankDetails: createVendorDto.bankDetails,
        commissionRate: createVendorDto.commissionRate,
        status: VendorStatus.PENDING,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.VENDOR },
    });

    return vendor;
  }

  async findAll(status?: VendorStatus): Promise<Vendor[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        products: { select: { id: true, name: true, slug: true, status: true } },
      },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return vendor;
  }

  async findBySlug(slug: string): Promise<Vendor> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { slug },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return vendor;
  }

  async update(userId: string, vendorId: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    if (vendor.userId !== userId) {
      throw new ForbiddenException("You can only update your own vendor profile");
    }

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: updateVendorDto,
    });
  }

  async approveVendor(vendorId: string, status: VendorStatus, notes?: string): Promise<Vendor> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: { status },
    });
  }

  async getVendorOrders(vendorId: string) {
    return this.prisma.vendorOrder.findMany({
      where: { vendorId },
      include: {
        order: {
          include: {
            buyer: { select: { name: true, email: true } },
          },
        },
        orderItems: {
          include: {
            variant: {
              include: {
                product: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
