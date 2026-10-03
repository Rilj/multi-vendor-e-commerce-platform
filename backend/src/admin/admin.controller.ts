import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole, VendorStatus, PayoutStatus } from "@prisma/client";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.FINANCE_ADMIN, UserRole.SUPPORT_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get admin dashboard stats" })
  async getDashboard() {
    const stats = await this.adminService.getDashboardStats();
    return { data: stats };
  }

  @Get("users")
  @ApiOperation({ summary: "List all users" })
  async getUsers(@Query("page") page: number = 1, @Query("limit") limit: number = 20) {
    return this.adminService.getUsers(Number(page), Number(limit));
  }

  @Get("users/:id")
  @ApiOperation({ summary: "Get user details" })
  async getUserDetail(@Param("id") id: string) {
    const user = await this.adminService.getUserDetail(id);
    return { data: user };
  }

  @Patch("users/:id/block")
  @ApiOperation({ summary: "Block/unblock user" })
  async blockUser(@Param("id") id: string, @Body("block") block: boolean = true) {
    const user = await this.adminService.blockUser(id, block);
    return { data: { message: `User ${block ? "blocked" : "unblocked"}` } };
  }

  @Patch("vendors/:id/approve")
  @ApiOperation({ summary: "Approve/reject vendor" })
  async approveVendor(
    @Param("id") vendorId: string,
    @Body("status") status: VendorStatus,
    @Body("notes") notes?: string,
  ) {
    const vendor = await this.adminService.approveVendor(vendorId, status, notes);
    return { data: vendor };
  }

  @Get("vendors")
  @ApiOperation({ summary: "List all vendors" })
  async getVendors(@Query("page") page: number = 1, @Query("limit") limit: number = 20) {
    return this.adminService.getVendors(Number(page), Number(limit));
  }

  @Get("payouts")
  @ApiOperation({ summary: "List payout requests" })
  async getPayouts(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("status") status?: PayoutStatus,
  ) {
    return this.adminService.getPayouts(Number(page), Number(limit), status);
  }

  @Patch("payouts/:id/approve")
  @Roles(UserRole.ADMIN, UserRole.FINANCE_ADMIN)
  @ApiOperation({ summary: "Approve/reject payout" })
  async approvePayout(
    @Param("id") payoutId: string,
    @Body("status") status: PayoutStatus,
  ) {
    const payout = await this.adminService.approvePayout(payoutId, status);
    return { data: payout };
  }

  @Get("disputes")
  @ApiOperation({ summary: "List disputes/refunds" })
  async getDisputes(@Query("page") page: number = 1, @Query("limit") limit: number = 20) {
    return this.adminService.getDisputes(Number(page), Number(limit));
  }
}