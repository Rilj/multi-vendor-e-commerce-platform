import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { GetUser } from "../common/decorators/get-user.decorator";
import { GetVendor } from "../common/decorators/get-vendor.decorator";
import { UserRole } from "@prisma/client";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { OrderFilterDto, VendorOrderFilterDto, VendorOrderStatusUpdateDto } from "./dtos/order-filter.dto";

@ApiTags("orders")
@UseGuards(JwtAuthGuard)
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: "Create a new order from selected items" })
  createOrder(
    @GetUser() buyer: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(createOrderDto, buyer);
  }

  @Get()
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: "List the authenticated buyer's orders" })
  findMyOrders(
    @GetUser("id") buyerId: string,
    @Query() filter: OrderFilterDto,
  ) {
    return this.ordersService.findMyOrders(buyerId, filter);
  }

  @Get(":id")
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: "Get a single order by id (buyer ownership)" })
  findOne(@Param("id") id: string, @GetUser("id") buyerId: string) {
    return this.ordersService.findOne(id, buyerId);
  }
}

@ApiTags("vendor-orders")
@UseGuards(JwtAuthGuard)
@Controller("vendor/orders")
export class VendorOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(UserRole.VENDOR)
  @ApiOperation({ summary: "List orders for the authenticated vendor" })
  findVendorOrders(
    @GetVendor("id") vendorId: string,
    @Query() filter: VendorOrderFilterDto,
  ) {
    return this.ordersService.findVendorOrders(vendorId, filter);
  }

  @Get(":id")
  @Roles(UserRole.VENDOR)
  @ApiOperation({ summary: "Get a single vendor order by id" })
  findVendorOrder(
    @Param("id") id: string,
    @GetVendor("id") vendorId: string,
  ) {
    return this.ordersService.findVendorOrder(id, vendorId);
  }

  @Patch(":id/status")
  @Roles(UserRole.VENDOR)
  @ApiOperation({
    summary: "Update a vendor order status (PROCESSING, SHIPPED with tracking)",
  })
  updateVendorOrderStatus(
    @Param("id") id: string,
    @GetVendor("id") vendorId: string,
    @Body() dto: VendorOrderStatusUpdateDto,
  ) {
    return this.ordersService.updateVendorOrderStatus(id, vendorId, dto);
  }
}
