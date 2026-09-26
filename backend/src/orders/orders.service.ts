import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SlugService } from "../common/utils/slug.service";
import { QueueService } from "../common/utils/queue.service";
import { RedisService } from "../redis/redis.service";
import { PaginationResponseDto } from "../common/dtos/pagination.dto";
import { CreateOrderDto } from "./dtos/create-order.dto";
import {
  OrderFilterDto,
  VendorOrderFilterDto,
  VendorOrderStatusUpdateDto,
} from "./dtos/order-filter.dto";
import {
  Order,
  PaymentStatus,
  Prisma,
  ShippingStatus,
  VendorOrder,
  VendorOrderStatus,
} from "@prisma/client";

interface VendorGroup {
  vendorId: string;
  commissionRate: Prisma.Decimal;
  items: {
    variantId: string;
    quantity: number;
    price: Prisma.Decimal;
  }[];
}

interface StatusTransition {
  [key: string]: VendorOrderStatus[];
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly flatShippingFee = new Prisma.Decimal(10);

  private readonly allowedTransitions: StatusTransition = {
    [VendorOrderStatus.PENDING]: [
      VendorOrderStatus.PROCESSING,
      VendorOrderStatus.SHIPPED,
      VendorOrderStatus.CANCELLED,
      VendorOrderStatus.RETURNED,
    ],
    [VendorOrderStatus.PROCESSING]: [
      VendorOrderStatus.SHIPPED,
      VendorOrderStatus.CANCELLED,
    ],
    [VendorOrderStatus.SHIPPED]: [
      VendorOrderStatus.DELIVERED,
      VendorOrderStatus.RETURNED,
    ],
    [VendorOrderStatus.DELIVERED]: [VendorOrderStatus.RETURNED],
    [VendorOrderStatus.CANCELLED]: [],
    [VendorOrderStatus.RETURNED]: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly slugService: SlugService,
    private readonly queueService: QueueService,
    private readonly redisService: RedisService,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    buyer: any,
  ): Promise<Order> {
    const { items, shippingAddress, notes } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException("Order must contain at least one item");
    }

    return await this.prisma.$transaction(async (tx) => {
      const variantIds = [...new Set(items.map((i) => i.productVariantId))];

      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: { include: { vendor: true } } },
      });

      if (variants.length !== variantIds.length) {
        throw new BadRequestException("One or more product variants were not found");
      }

      const variantMap = new Map(variants.map((v) => [v.id, v]));

      for (const item of items) {
        const variant = variantMap.get(item.productVariantId);
        if (!variant) {
          throw new BadRequestException(
            `Variant ${item.productVariantId} not found`,
          );
        }
        if (variant.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for variant ${variant.sku}`,
          );
        }
      }

      const groups: VendorGroup[] = [];
      const groupMap = new Map<string, VendorGroup>();

      for (const item of items) {
        const variant = variantMap.get(item.productVariantId)!;
        const vendor = variant.product.vendor;
        if (!groupMap.has(vendor.id)) {
          const group: VendorGroup = {
            vendorId: vendor.id,
            commissionRate: vendor.commissionRate ?? this.defaultCommissionRate(),
            items: [],
          };
          groupMap.set(vendor.id, group);
          groups.push(group);
        }
        groupMap.get(vendor.id)!.items.push({
          variantId: variant.id,
          quantity: item.quantity,
          price: variant.price,
        });
      }

      let orderTotal = new Prisma.Decimal(0);
      let orderShippingFee = new Prisma.Decimal(0);
      let orderTax = new Prisma.Decimal(0);
      let orderDiscount = new Prisma.Decimal(0);

      const vendorOrderPayloads = groups.map((group) => {
        let subtotal = new Prisma.Decimal(0);
        for (const gi of group.items) {
          subtotal = subtotal.add(gi.price.mul(gi.quantity));
        }

        const shippingFee = this.flatShippingFee;
        const taxAmount = new Prisma.Decimal(0);
        const discountAmount = new Prisma.Decimal(0);
        const commissionFee = new Prisma.Decimal(0);
        const totalAmount = subtotal
          .add(shippingFee)
          .add(taxAmount)
          .sub(discountAmount)
          .sub(commissionFee);

        orderTotal = orderTotal.add(totalAmount);
        orderShippingFee = orderShippingFee.add(shippingFee);
        orderTax = orderTax.add(taxAmount);
        orderDiscount = orderDiscount.add(discountAmount);

        return {
          vendorId: group.vendorId,
          subtotal,
          shippingFee,
          taxAmount,
          commissionFee,
          discountAmount,
          totalAmount,
          items: group.items,
        };
      });

      const orderNumber = await this.generateUniqueOrderNumber(tx);

      const order = await tx.order.create({
        data: {
          buyerId: buyer.id,
          orderNumber,
          totalAmount: orderTotal,
          paymentStatus: PaymentStatus.PENDING,
          shippingStatus: ShippingStatus.PENDING,
           shippingAddress: shippingAddress as any,
          shippingFee: orderShippingFee,
          taxAmount: orderTax,
          discountAmount: orderDiscount,
          notes,
          vendorOrders: {
            create: vendorOrderPayloads.map((vo) => ({
              vendorId: vo.vendorId,
              subtotal: vo.subtotal,
              shippingFee: vo.shippingFee,
              taxAmount: vo.taxAmount,
              commissionFee: vo.commissionFee,
              discountAmount: vo.discountAmount,
              totalAmount: vo.totalAmount,
              status: VendorOrderStatus.PENDING,
              orderItems: {
                create: vo.items.map((i) => ({
                  productVariantId: i.variantId,
                  quantity: i.quantity,
                  unitPrice: i.price,
                  totalPrice: i.price.mul(i.quantity),
                })),
              },
            })),
          },
        },
        include: {
          vendorOrders: {
            include: { orderItems: true },
          },
        },
      });

      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: buyer.id } });

      await this.redisService
        .del(`cart:${buyer.id}`)
        .catch((err) =>
          this.logger.warn(
            `Failed to invalidate cart cache for ${buyer.id}: ${err.message}`,
          ),
        );

      this.logger.log(`Order ${orderNumber} created for buyer ${buyer.id}`);

      return order;
    });
  }

  private defaultCommissionRate(): Prisma.Decimal {
    return new Prisma.Decimal(10);
  }

  private async generateUniqueOrderNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const orderNumber = this.slugService.generateOrderNumber();
      const existing = await tx.order.findUnique({
        where: { orderNumber },
        select: { id: true },
      });
      if (!existing) {
        return orderNumber;
      }
    }
    throw new BadRequestException("Could not generate a unique order number");
  }

  async findMyOrders(
    buyerId: string,
    filter: OrderFilterDto,
  ): Promise<PaginationResponseDto<Order>> {
    const { page = 1, limit = 20, paymentStatus, shippingStatus, fromDate, toDate, search } =
      filter;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { buyerId };

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (shippingStatus) {
      where.shippingStatus = shippingStatus;
    }
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          vendorOrders: {
            include: {
              orderItems: {
                include: { variant: { include: { product: true } } },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string, buyerId: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        vendorOrders: {
          include: {
            vendor: true,
            orderItems: {
              include: {
                variant: {
                  include: { product: { include: { vendor: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.buyerId !== buyerId) {
      throw new ForbiddenException("You do not have access to this order");
    }

    return order;
  }

  async findVendorOrders(
    vendorId: string,
    filter: VendorOrderFilterDto,
  ): Promise<PaginationResponseDto<VendorOrder>> {
    const { page = 1, limit = 20, status, orderNumber } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.VendorOrderWhereInput = { vendorId };

    if (status) {
      where.status = status;
    }
    if (orderNumber) {
      where.order = { orderNumber: { contains: orderNumber, mode: "insensitive" } };
    }

    const [data, total] = await Promise.all([
      this.prisma.vendorOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          order: true,
          orderItems: {
            include: {
              variant: { include: { product: true } },
            },
          },
        },
      }),
      this.prisma.vendorOrder.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findVendorOrder(
    vendorOrderId: string,
    vendorId: string,
  ): Promise<VendorOrder> {
    const vendorOrder = await this.prisma.vendorOrder.findUnique({
      where: { id: vendorOrderId },
      include: {
        order: true,
        orderItems: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });

    if (!vendorOrder) {
      throw new NotFoundException("Vendor order not found");
    }

    if (vendorOrder.vendorId !== vendorId) {
      throw new ForbiddenException(
        "You do not have access to this vendor order",
      );
    }

    return vendorOrder;
  }

  async updateVendorOrderStatus(
    vendorOrderId: string,
    vendorId: string,
    dto: VendorOrderStatusUpdateDto,
  ): Promise<VendorOrder> {
    const { status, trackingNumber } = dto;

    const vendorOrder = await this.prisma.vendorOrder.findUnique({
      where: { id: vendorOrderId },
    });

    if (!vendorOrder) {
      throw new NotFoundException("Vendor order not found");
    }

    if (vendorOrder.vendorId !== vendorId) {
      throw new ForbiddenException(
        "You do not have access to this vendor order",
      );
    }

    const allowed = this.allowedTransitions[vendorOrder.status] || [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition vendor order from ${vendorOrder.status} to ${status}`,
      );
    }

    if (status === VendorOrderStatus.SHIPPED && !trackingNumber) {
      throw new BadRequestException(
        "A tracking number is required when shipping an order",
      );
    }

    const data: Prisma.VendorOrderUpdateInput = { status };

    if (status === VendorOrderStatus.SHIPPED && trackingNumber) {
      data.trackingNumber = trackingNumber;
      data.shippedAt = new Date();
    }
    if (status === VendorOrderStatus.DELIVERED) {
      data.deliveredAt = new Date();
    }

    const updated = await this.prisma.vendorOrder.update({
      where: { id: vendorOrderId },
      data,
      include: { order: true },
    });

    await this.syncOrderShippingStatus(vendorOrder.orderId);

    if (status === VendorOrderStatus.SHIPPED) {
      await this.queueService
        .addEmailJob({
          type: "shipment_update",
          to: "",
          orderId: vendorOrder.orderId,
        })
        .catch((err) =>
          this.logger.warn(`Failed to enqueue shipment update: ${err.message}`),
        );
    }

    this.logger.log(
      `Vendor order ${vendorOrderId} status updated to ${status}`,
    );

    return updated;
  }

  private async syncOrderShippingStatus(orderId: string): Promise<void> {
    const vendorOrders = await this.prisma.vendorOrder.findMany({
      where: { orderId },
      select: { status: true },
    });

    const statuses = vendorOrders.map((vo) => vo.status);
    const orderStatus = this.computeOrderShippingStatus(statuses);

    await this.prisma.order.update({
      where: { id: orderId },
      data: { shippingStatus: orderStatus },
    });
  }

  private computeOrderShippingStatus(
    statuses: VendorOrderStatus[],
  ): ShippingStatus {
    if (statuses.length === 0) {
      return ShippingStatus.PENDING;
    }

    if (statuses.every((s) => s === VendorOrderStatus.DELIVERED)) {
      return ShippingStatus.DELIVERED;
    }
    if (statuses.every((s) => s === VendorOrderStatus.CANCELLED)) {
      return ShippingStatus.CANCELLED;
    }
    if (statuses.every((s) => s === VendorOrderStatus.RETURNED)) {
      return ShippingStatus.RETURNED;
    }
    if (statuses.some((s) => s === VendorOrderStatus.SHIPPED)) {
      return ShippingStatus.SHIPPED;
    }
    if (statuses.some((s) => s === VendorOrderStatus.PROCESSING)) {
      return ShippingStatus.PROCESSING;
    }
    return ShippingStatus.PENDING;
  }

  async getOrderVendorOrders(orderId: string): Promise<VendorOrder[]> {
    return this.prisma.vendorOrder.findMany({
      where: { orderId },
      include: { orderItems: true },
    });
  }
}
