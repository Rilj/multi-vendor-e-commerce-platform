import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { BannersService } from "./banners.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@ApiTags("banners")
@Controller("banners")
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a banner (Admin)" })
  async create(@Body() body: any) {
    const banner = await this.bannersService.create(body);
    return { data: banner };
  }

  @Get()
  @ApiOperation({ summary: "List all banners" })
  async findAll(@Query("activeOnly") activeOnly: boolean = false) {
    const banners = await this.bannersService.findAll(activeOnly);
    return { data: banners };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a banner (Admin)" })
  async update(@Param("id") id: string, @Body() body: any) {
    const banner = await this.bannersService.update(id, body);
    return { data: banner };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a banner (Admin)" })
  async delete(@Param("id") id: string) {
    await this.bannersService.delete(id);
    return { data: { message: "Banner deleted" } };
  }
}