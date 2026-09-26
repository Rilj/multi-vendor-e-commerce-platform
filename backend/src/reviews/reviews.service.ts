import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dtos/create-review.dto";

export interface ReviewWithDetails {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: { id: string; name: string };
  images: { url: string }[];
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewWithDetails> {
    const { productId, vendorId, rating, title, comment, images } = createReviewDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    if (vendorId !== product.vendorId) {
      throw new BadRequestException("Vendor does not own this product");
    }

    const purchased = await this.prisma.orderItem.findFirst({
      where: {
        vendorOrder: {
          order: {
            buyerId: userId,
            paymentStatus: "PAID",
          },
        },
        variant: { productId },
      },
    });

    const review = await this.prisma.review.create({
      data: {
        productId,
        userId,
        vendorId,
        rating,
        title: title || null,
        comment: comment || null,
        isVerifiedPurchase: !!purchased,
      },
      include: {
        user: { select: { id: true, name: true } },
        images: true,
      },
    });

    await this.updateVendorRating(vendorId);

    return {
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt,
      user: review.user,
      images: review.images,
    };
  }

  async findByProduct(productId: string): Promise<ReviewWithDetails[]> {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true } },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase,
      createdAt: r.createdAt,
      user: r.user as any,
      images: r.images as any,
    }));
  }

  async findByVendor(vendorId: string): Promise<ReviewWithDetails[]> {
    const reviews = await this.prisma.review.findMany({
      where: { vendorId },
      include: {
        user: { select: { id: true, name: true } },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase,
      createdAt: r.createdAt,
      user: r.user as any,
      images: r.images as any,
    }));
  }

  async delete(reviewId: string, userId: string, userRole: string): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId && userRole !== "ADMIN" && userRole !== "SUPPORT_ADMIN") {
      throw new ForbiddenException("You can only delete your own reviews");
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    await this.updateVendorRating(review.vendorId);
  }

  private async updateVendorRating(vendorId: string): Promise<void> {
    const result = await this.prisma.review.aggregate({
      where: { vendorId },
      _avg: { rating: true },
    });

    const avgRating = result._avg.rating || 0;

    await this.prisma.vendor.update({
      where: { id: vendorId },
      data: { rating: Number(avgRating) } as any,
    });
  }
}
