import { Controller, Get, Patch, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { SettingsService } from "./settings.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@ApiTags("settings")
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: "Get public settings" })
  async getPublicSettings() {
    const settings = await this.settingsService.getPublicSettings();
    return { data: settings };
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all settings (Admin)" })
  async getSettings() {
    const settings = await this.settingsService.getSettings();
    return { data: settings };
  }

  @Patch("admin")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update settings (Admin)" })
  async updateSettings(@Body() body: any) {
    const settings = await this.settingsService.updateSettings(body);
    return { data: settings };
  }
}