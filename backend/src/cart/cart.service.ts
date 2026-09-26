import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { CartItem, ProductVariant, ProductStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

export interface CartItemWithDetails {
  productId: string;
  productName: string;
  vendorId: string;
  vendorStoreName: string;
  variantId: string;
  variantSku: string;
  variantAttributes: Record<string, any>;
  price: number;
  image: string | null;
  quantity: number;
  maxStock: number;
  totalPrice: number;
}

export interface CartVendorGroup {
  vendorId: string;
  vendorStoreName: string;
  vendorLogoUrl: string | null;
  items: CartItemWithDetails[];
  subtotal: number;
}

export interface CartSummary {
  vendors: CartVendorGroup[];
  total: number;
  itemCount: number;
}

@Injectable()
export class CartService {
  private readonly CART_REDIS_PREFIX = "cart:";

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async addToCart(userId: string, variantId: string, quantity: number = 1): Promise<CartItem> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            vendor: { select: { id: true, storeName: true } },
            category: true,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException("Product variant not found");
    }

    if (variant.product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException("Product is not available");
    }

    if (variant.stockQuantity < quantity) {
      throw new BadRequestException(
        `Only ${variant.stockQuantity} items in stock`,
      );
    }

    const cartItem = await this.prisma.cartItem.upsert({
      where: {
        userId_productVariantId: {
          userId,
          productVariantId: variantId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId,
        productVariantId: variantId,
        quantity,
      },
    });

    await this.syncCartToRedis(userId);

    return cartItem;
  }

  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<CartItem> {
    if (quantity < 1) {
      throw new BadRequestException("Quantity must be at least 1");
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: { variant: true },
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    if (quantity > cartItem.variant.stockQuantity) {
      throw new BadRequestException(
        `Only ${cartItem.variant.stockQuantity} items in stock`,
      );
    }

    const updated = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    await this.syncCartToRedis(userId);

    return updated;
  }

  async removeFromCart(userId: string, itemId: string): Promise<void> {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    await this.syncCartToRedis(userId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });

    await this.redisService.del(`${this.CART_REDIS_PREFIX}${userId}`);
  }

  async getCart(userId: string): Promise<CartSummary> {
    const cached = await this.redisService.get(`${this.CART_REDIS_PREFIX}${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            images: { take: 1, orderBy: { position: "asc" } },
            product: {
              include: {
                vendor: { select: { id: true, storeName: true, logoUrl: true } },
              },
            },
          },
        },
      },
    });

    const summary = this.buildCartSummary(cartItems);
    await this.redisService.set(
      `${this.CART_REDIS_PREFIX}${userId}`,
      JSON.stringify(summary),
      86400,
    );

    return summary;
  }

  private buildCartSummary(cartItems: any[]): CartSummary {
    const vendorGroups = new Map<string, CartVendorGroup>();
    let total = 0;
    let itemCount = 0;

    cartItems.forEach((item) => {
      const vendorId = item.variant.product.vendor.id;
      const vendorStoreName = item.variant.product.vendor.storeName;
      const vendorLogoUrl = item.variant.product.vendor.logoUrl;

      if (!vendorGroups.has(vendorId)) {
        vendorGroups.set(vendorId, {
          vendorId,
          vendorStoreName,
          vendorLogoUrl,
          items: [],
          subtotal: 0,
        });
      }

      const group = vendorGroups.get(vendorId)!;
      const price = Number(item.variant.price);
      const quantity = item.quantity;
      const itemTotal = price * quantity;

      group.items.push({
        productId: item.variant.product.id,
        productName: item.variant.product.name,
        vendorId,
        vendorStoreName,
        variantId: item.variant.id,
        variantSku: item.variant.sku,
        variantAttributes: item.variant.attributes as Record<string, any>,
        price,
        image: item.variant.images[0]?.url || null,
        quantity,
        maxStock: item.variant.stockQuantity,
        totalPrice: itemTotal,
      });

      group.subtotal += itemTotal;
      total += itemTotal;
      itemCount += quantity;
    });

    return {
      vendors: Array.from(vendorGroups.values()),
      total,
      itemCount,
    };
  }

  private async syncCartToRedis(userId: string): Promise<void> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            images: { take: 1 },
            product: {
              include: {
                vendor: { select: { id: true, storeName: true, logoUrl: true } },
              },
            },
          },
        },
      },
    });

    const summary = this.buildCartSummary(cartItems);
    await this.redisService.set(
      `${this.CART_REDIS_PREFIX}${userId}`,
      JSON.stringify(summary),
      86400,
    );
  }
}
