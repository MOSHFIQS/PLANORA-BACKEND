import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../generated/prisma/enums";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Public()
  @Get(":id")
  async getSingleCategory(@Param("id") id: string) {
    return this.categoryService.getSingleCategory(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async createCategory(@Body() payload: CreateCategoryDto) {
    return this.categoryService.createCategory(payload);
  }

  @Patch(":id")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateCategory(
    @Param("id") id: string,
    @Body() payload: UpdateCategoryDto
  ) {
    return this.categoryService.updateCategory(id, payload);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async deleteCategory(@Param("id") id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
