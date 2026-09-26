import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { GetUser } from "../common/decorators/get-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import { CreateAddressDto } from "./dtos/create-address.dto";
import { UpdateAddressDto } from "./dtos/update-address.dto";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  getProfile(@GetUser("id") userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch("profile")
  @ApiOperation({ summary: "Update current user profile" })
  updateProfile(
    @GetUser("id") userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch("password")
  @ApiOperation({ summary: "Change current user password" })
  changePassword(
    @GetUser("id") userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @Get("addresses")
  @ApiOperation({ summary: "List current user addresses" })
  getAddresses(@GetUser("id") userId: string) {
    return this.usersService.getAddresses(userId);
  }

  @Post("addresses")
  @ApiOperation({ summary: "Create a new address" })
  createAddress(
    @GetUser("id") userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.usersService.createAddress(userId, dto);
  }

  @Get("addresses/:id")
  @ApiOperation({ summary: "Get a single address" })
  getAddress(
    @GetUser("id") userId: string,
    @Param("id") addressId: string,
  ) {
    return this.usersService.getAddress(userId, addressId);
  }

  @Patch("addresses/:id")
  @ApiOperation({ summary: "Update an address" })
  updateAddress(
    @GetUser("id") userId: string,
    @Param("id") addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(userId, addressId, dto);
  }

  @Delete("addresses/:id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete an address" })
  deleteAddress(
    @GetUser("id") userId: string,
    @Param("id") addressId: string,
  ) {
    return this.usersService.deleteAddress(userId, addressId);
  }

  @Patch("addresses/:id/default")
  @ApiOperation({ summary: "Set an address as the default" })
  setDefaultAddress(
    @GetUser("id") userId: string,
    @Param("id") addressId: string,
  ) {
    return this.usersService.setDefaultAddress(userId, addressId);
  }
}
