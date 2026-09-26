import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a category" })
  async create(@Body("name") name: string, @Body("parentId") parentId?: string) {
    const category = await this.categoriesService.create(name, parentId);
    return { data: category };
  }

  @Get()
  @ApiOperation({ summary: "List all categories" })
  async findAll(@Query("parentId") parentId?: string) {
    const categories = await this.categoriesService.findAll(parentId);
    return { data: categories };
  }

  @Get("tree")
  @ApiOperation({ summary: "Get category tree" })
  async getTree() {
    const tree = await this.categoriesService.getTree();
    return { data: tree };
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get category by slug" })
  async findBySlug(@Param("slug") slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    return { data: category };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get category by ID" })
  async findOne(@Param("id") id: string) {
    const category = await this.categoriesService.findOne(id);
    return { data: category };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update category" })
  async update(@Param("id") id: string, @Body("name") name: string, @Body("parentId") parentId?: string) {
    const category = await this.categoriesService.update(id, name, parentId);
    return { data: category };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete category" })
  async remove(@Param("id") id: string) {
    await this.categoriesService.remove(id);
    return { data: { message: "Category deleted successfully" } };
  }
}
