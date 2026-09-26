import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Vendor, VendorStatus } from "@prisma/client";
import { VendorsService } from "./vendors.service";
import { CreateVendorDto } from "./dtos/create-vendor.dto";
import { UpdateVendorDto } from "./dtos/update-vendor.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { GetUser } from "../common/decorators/get-user.decorator";
import { UserRole } from "@prisma/client";

@ApiTags("vendors")
@Controller("vendors")
@ApiBearerAuth()
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: "Register as a vendor" })
  async register(
    @GetUser("id") userId: string,
    @Body() createVendorDto: CreateVendorDto,
  ) {
    const vendor = await this.vendorsService.create(userId, createVendorDto);
    return { data: vendor };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiOperation({ summary: "List all vendors (Admin)" })
  async findAll(@Query("status") status?: VendorStatus) {
    const vendors = await this.vendorsService.findAll(status);
    return { data: vendors };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get vendor by ID" })
  async findOne(@Param("id") id: string) {
    const vendor = await this.vendorsService.findOne(id);
    return { data: vendor };
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get vendor by slug" })
  async findBySlug(@Param("slug") slug: string) {
    const vendor = await this.vendorsService.findBySlug(slug);
    return { data: vendor };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.VENDOR)
  @ApiOperation({ summary: "Update vendor profile" })
  async update(
    @GetUser("id") userId: string,
    @Param("id") vendorId: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    const vendor = await this.vendorsService.update(userId, vendorId, updateVendorDto);
    return { data: vendor };
  }

  @Patch(":id/approve")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiOperation({ summary: "Approve/reject vendor (Admin)" })
  async approveVendor(
    @Param("id") vendorId: string,
    @Body("status") status: VendorStatus,
    @Body("notes") notes?: string,
  ) {
    const vendor = await this.vendorsService.approveVendor(vendorId, status, notes);
    return { data: vendor };
  }

  @Get(":id/orders")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.VENDOR)
  @ApiOperation({ summary: "Get vendor's orders" })
  async getVendorOrders(@Param("id") vendorId: string) {
    const orders = await this.vendorsService.getVendorOrders(vendorId);
    return { data: orders };
  }
}
