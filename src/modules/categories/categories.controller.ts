import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Category } from "../../database/entities/category.entity";
import { CategoriesService } from "./categories.service";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: "Список категорий с пагинацией" })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  findAll(
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ): Promise<{
    data: Category[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.categoriesService.findAll(
      search,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Детали категории" })
  findOne(@Param("id") id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }
}
