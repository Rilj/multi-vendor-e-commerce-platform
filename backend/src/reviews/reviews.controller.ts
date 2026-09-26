import { Controller, Get, Post, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ReviewsService } from "./reviews.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { GetUser } from "../common/decorators/get-user.decorator";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a review" })
  async create(
    @GetUser("id") userId: string,
    @Body() body: any,
  ) {
    const review = await this.reviewsService.create(userId, body);
    return { data: review };
  }

  @Get("product/:productId")
  @ApiOperation({ summary: "Get reviews for a product" })
  async findByProduct(@Param("productId") productId: string) {
    const reviews = await this.reviewsService.findByProduct(productId);
    return { data: reviews };
  }

  @Get("vendor/:vendorId")
  @ApiOperation({ summary: "Get reviews for a vendor" })
  async findByVendor(@Param("vendorId") vendorId: string) {
    const reviews = await this.reviewsService.findByVendor(vendorId);
    return { data: reviews };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a review" })
  async delete(
    @Param("id") reviewId: string,
    @GetUser("id") userId: string,
    @GetUser("role") userRole: string,
  ) {
    await this.reviewsService.delete(reviewId, userId, userRole);
    return { data: { message: "Review deleted" } };
  }
}