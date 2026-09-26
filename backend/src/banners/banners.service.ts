import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface BannerWithStats {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    position?: number;
    isActive?: boolean;
  }): Promise<BannerWithStats> {
    const banner = await this.prisma.banner.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        position: data.position || 0,
        isActive: data.isActive ?? true,
      },
    });

    return this.toResponse(banner);
  }

  async findAll(activeOnly: boolean = false): Promise<BannerWithStats[]> {
    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const banners = await this.prisma.banner.findMany({
      where,
      orderBy: { position: "asc" },
    });

    return banners.map((b) => this.toResponse(b));
  }

  async update(id: string, data: {
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
    position?: number;
    isActive?: boolean;
  }): Promise<BannerWithStats> {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException("Banner not found");
    }

    const updated = await this.prisma.banner.update({
      where: { id },
      data,
    });

    return this.toResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException("Banner not found");
    }

    await this.prisma.banner.delete({
      where: { id },
    });
  }

  private toResponse(banner: any): BannerWithStats {
    return {
      id: banner.id,
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      position: banner.position,
      isActive: banner.isActive,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  }
}