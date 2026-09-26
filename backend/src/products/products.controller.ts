import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Headers, HttpCode, HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Product, ProductStatus, UserRole } from "@prisma/client";
import { ProductsService } from "./products.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { GetUser } from "../common/decorators/get-user.decorator";

@ApiTags("products")
@Controller("products")
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiOperation({ summary: "Create a product" })
  async create(
    @GetUser("id") userId: string,
    @GetUser("role") userRole: UserRole,
    @Body() body: any,
  ) {
    const product = await this.productsService.create(body, userId, userRole);
    return { data: product };
  }

  @Get()
  @ApiOperation({ summary: "List products with filters" })
  @ApiQuery({ name: "categoryId", required: false })
  @ApiQuery({ name: "vendorId", required: false })
  @ApiQuery({ name: "minPrice", required: false })
  @ApiQuery({ name: "maxPrice", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "isFeatured", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "sortBy", required: false })
  @ApiQuery({ name: "sortOrder", required: false })
  async findAll(@Query() query: any) {
    const result = await this.productsService.findAll({
      categoryId: query.categoryId,
      vendorId: query.vendorId,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      search: query.search,
      isFeatured: query.isFeatured === "true",
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    return { data: result.data, meta: { total: result.total } };
  }

  @Get("featured")
  @ApiOperation({ summary: "Get featured products" })
  async getFeatured(@Query("limit") limit: number = 12) {
    const products = await this.productsService.getFeatured(Number(limit));
    return { data: products };
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get product by slug" })
  async findBySlug(@Param("slug") slug: string) {
    const product = await this.productsService.findBySlug(slug);
    return { data: product };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product by ID" })
  async findOne(@Param("id") id: string) {
    const product = await this.productsService.findById(id);
    return { data: product };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update product" })
  async update(
    @Param("id") id: string,
    @GetUser("id") userId: string,
    @GetUser("role") userRole: UserRole,
    @Body() body: any,
  ) {
    const product = await this.productsService.update(id, body, userId, userRole);
    return { data: product };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete product" })
  async remove(
    @Param("id") id: string,
    @GetUser("id") userId: string,
    @GetUser("role") userRole: UserRole,
  ) {
    await this.productsService.remove(id, userId, userRole);
    return { data: { message: "Product deleted successfully" } };
  }
}
