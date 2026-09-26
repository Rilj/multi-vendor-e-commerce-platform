import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Category } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SlugService } from "../common/utils/slug.service";

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private slugService: SlugService,
  ) {}

  async create(name: string, parentId?: string): Promise<Category> {
    const existingSlugs = (await this.prisma.category.findMany({
      select: { slug: true },
    })).map((c) => c.slug);
    const slug = this.slugService.generateUnique(name, existingSlugs);

    if (parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BadRequestException("Parent category not found");
      }
    }

    return this.prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null,
      },
    });
  }

  async findAll(parentId?: string): Promise<Category[]> {
    const where: any = {};
    if (parentId === "null" || parentId === undefined) {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    return this.prisma.category.findMany({
      where,
      include: {
        children: {
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          take: 8,
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            variants: {
              take: 1,
              select: {
                images: { take: 1, select: { url: true } },
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async update(id: string, name: string, parentId?: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const data: any = { name };
    if (parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new BadRequestException("Parent category not found");
      }
      data.parentId = parentId;
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: { select: { id: true } } },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (category.children.length > 0) {
      throw new BadRequestException("Cannot delete category with subcategories");
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }

  async getTree(): Promise<Category[]> {
    const allCategories = await this.prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    const categoryMap = new Map<string, any>();
    const rootCategories: any[] = [];

    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    allCategories.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id));
        }
      } else {
        rootCategories.push(categoryMap.get(cat.id));
      }
    });

    return rootCategories;
  }
}
