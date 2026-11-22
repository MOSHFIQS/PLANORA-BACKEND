import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { CategoryService } from "./category.service";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../generated/prisma/enums";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@ApiTags("Category")
@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Get all event categories" })
  @ApiResponse({ status: 200, description: "List of all categories returned successfully" })
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get single category by ID" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({ status: 200, description: "Category details returned successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async getSingleCategory(@Param("id") id: string) {
    return this.categoryService.getSingleCategory(id);
  }

  @Post()
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Create new category (Admin/SuperAdmin)" })
  @ApiResponse({ status: 201, description: "Category created successfully" })
  async createCategory(@Body() payload: CreateCategoryDto) {
    return this.categoryService.createCategory(payload);
  }

  @Patch(":id")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Update category by ID (Admin/SuperAdmin)" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({ status: 200, description: "Category updated successfully" })
  async updateCategory(
    @Param("id") id: string,
    @Body() payload: UpdateCategoryDto
  ) {
    return this.categoryService.updateCategory(id, payload);
  }

  @Delete(":id")
  @ApiBearerAuth("bearer")
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: "Delete category by ID (Admin/SuperAdmin)" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({ status: 200, description: "Category deleted successfully" })
  async deleteCategory(@Param("id") id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
