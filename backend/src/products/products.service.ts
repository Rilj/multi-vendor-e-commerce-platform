import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { Product, ProductVariant, ProductStatus, Prisma, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { SlugService } from "../common/utils/slug.service";
import { RedisService } from "../redis/redis.service";

export interface ProductFilterOptions {
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  isFeatured?: boolean;
  status?: ProductStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

interface CreateProductData {
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  vendorId?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  variants?: Array<{
    sku?: string;
    attributes: Record<string, any>;
    price: number;
    stockQuantity: number;
    weight?: number;
    dimensions?: any;
  }>;
  images?: Array<{ url: string; alt?: string }>;
}

interface UpdateProductData {
  name?: string;
  description?: string;
  basePrice?: number;
  categoryId?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private slugService: SlugService,
    private redisService: RedisService,
  ) {}

  async create(data: CreateProductData, userId: string, userRole: UserRole): Promise<Product> {
    const existingSlugs = (await this.prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug);
    const slug = this.slugService.generateUnique(data.name, existingSlugs);

    let vendorId: string | undefined;
    if (userRole !== UserRole.ADMIN) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId },
      });
      if (!vendor || vendor.status !== "APPROVED") {
        throw new ForbiddenException("You must have an approved vendor account to create products");
      }
      vendorId = vendor.id;
    } else {
      vendorId = data.vendorId;
    }

    if (!vendorId) {
      throw new BadRequestException("Vendor ID is required");
    }

    const product = await this.prisma.product.create({
      data: {
        vendorId,
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        basePrice: data.basePrice,
        status: data.status || ProductStatus.ACTIVE,
        isFeatured: data.isFeatured || false,
      },
    });

    if (data.variants && data.variants.length > 0) {
      for (const variant of data.variants) {
        await this.prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: variant.sku || this.slugService.generateSKU(vendorId!, product.id, 0),
            attributes: variant.attributes as any,
            price: variant.price,
            stockQuantity: variant.stockQuantity,
            weight: variant.weight,
            dimensions: variant.dimensions as any,
          },
        });
      }
    }

    if (data.images && data.images.length > 0) {
      const variant = await this.prisma.productVariant.findFirst({
        where: { productId: product.id },
      });
      if (variant) {
        for (let i = 0; i < data.images.length; i++) {
          await this.prisma.productImage.create({
            data: {
              productVariantId: variant.id,
              url: data.images[i].url,
              alt: data.images[i].alt || data.name,
              position: i,
              isPrimary: i === 0,
            },
          });
        }
      }
    }

    return this.findById(product.id);
  }

  async findById(id: string): Promise<any> {
    const cacheKey = `product:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const product: any = await this.prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
          select: { id: true, storeName: true, slug: true, logoUrl: true, rating: true } as any,
        },
        category: true,
        variants: {
          include: {
            images: { orderBy: { position: "asc" } },
          },
        },
        reviews: {
          select: { rating: true, id: true },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const avgRating = (product.reviews as any[]).length > 0
      ? (product.reviews as any[]).reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
      : 0;

    const result = {
      ...product,
      avgRating,
      reviewCount: product._count.reviews,
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 3600);

    return result;
  }

  async findBySlug(slug: string): Promise<any> {
    const product: any = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        vendor: {
          select: { id: true, storeName: true, slug: true, logoUrl: true, description: true },
        },
        category: true,
        variants: {
          include: {
            images: { orderBy: { position: "asc" } },
          },
        },
        reviews: {
          include: {
            user: { select: { name: true } },
            images: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async findAll(options: ProductFilterOptions): Promise<{ data: Product[]; total: number }> {
    const { page = 1, limit = 20, ...filters } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: filters.status || ProductStatus.ACTIVE,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.variants = {
        some: {
          OR: [
            filters.minPrice !== undefined
              ? { price: { gte: filters.minPrice } }
              : {},
            filters.maxPrice !== undefined
              ? { price: { lte: filters.maxPrice } }
              : {},
          ].filter((cond) => Object.keys(cond).length > 0),
        },
      };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (filters.sortBy) {
      if (filters.sortBy === "price") {
        orderBy.variants = { _count: filters.sortOrder || "desc" };
      } else {
        (orderBy as any)[filters.sortBy] = filters.sortOrder || "desc";
      }
    } else {
      orderBy.createdAt = "desc";
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          vendor: { select: { storeName: true, slug: true, logoUrl: true } },
          variants: {
            include: {
              images: { take: 1, orderBy: { position: "asc" } },
              _count: true,
            },
          },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const results = products.map((p: any) => ({
      ...p,
      avgRating: p._count?.reviews,
    }));

    return { data: results, total };
  }

  async getFeatured(limit: number = 12): Promise<Product[]> {
    const cacheKey = "products:featured";
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const products = await this.prisma.product.findMany({
      where: { isFeatured: true, status: ProductStatus.ACTIVE },
      include: {
        vendor: { select: { storeName: true, slug: true, logoUrl: true } },
        variants: {
          include: { images: { orderBy: { position: "asc" } } },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    await this.redisService.set(cacheKey, JSON.stringify(products), 3600);

    return products as Product[];
  }

  async incrementViewCount(id: string): Promise<void> {
    const cacheKey = `product:views:${id}`;
    const views = await this.redisService.incr(cacheKey);
    if (views % 10 === 0) {
      await this.prisma.product.update({
        where: { id },
        data: { viewCount: { increment: 10 } },
      });
    }
  }

  async update(
    id: string,
    data: UpdateProductData,
    userId: string,
    userRole: UserRole,
  ): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (userRole !== UserRole.ADMIN && product.vendor.userId !== userId) {
      throw new ForbiddenException("You can only update your own products");
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        status: data.status,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId,
      },
    });

    await this.redisService.del(`product:${id}`);

    return this.findById(updated.id);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (userRole !== UserRole.ADMIN && product.vendor.userId !== userId) {
      throw new ForbiddenException("You can only delete your own products");
    }

    await this.prisma.product.delete({
      where: { id },
    });

    await this.redisService.del(`product:${id}`);
  }

  async uploadImages(productId: string, files: Array<any>): Promise<any[]> {
    const product: any = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const compressed = await this.compressImage(files[i].buffer);
      const uploadResult = await this.storageService.uploadBuffer(
        compressed,
        files[i].originalname,
        `products/${productId}`,
      );
      results.push(uploadResult);
    }

    return results;
  }

  private async compressImage(buffer: Buffer): Promise<Buffer> {
    try {
      const sharp = require("sharp");
      const instance = sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      return instance;
    } catch {
      return buffer;
    }
  }
}

