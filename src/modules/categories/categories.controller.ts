import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Category } from "../../database/entities/category.entity";
import { CategoriesService } from "./categories.service";
import { QueryCategoriesDto } from "./dto/query-categories.dto";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: "Список категорий с пагинацией" })
  findAll(@Query() query: QueryCategoriesDto): Promise<{
    data: Category[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.categoriesService.findAll(
      query.search,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Детали категории" })
  findOne(@Param("id") id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }
}
