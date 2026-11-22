import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(payload: CreateCategoryDto) {
    return this.prisma.category.create({
      data: payload,
    });
  }

  async getAllCategories() {
    return this.prisma.category.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSingleCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.isDeleted) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async updateCategory(id: string, payload: UpdateCategoryDto) {
    await this.getSingleCategory(id);

    return this.prisma.category.update({
      where: { id },
      data: payload,
    });
  }

  async deleteCategory(id: string) {
    await this.getSingleCategory(id);

    return this.prisma.category.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
