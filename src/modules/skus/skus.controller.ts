import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Sku } from "../../database/entities/sku.entity";
import { QuerySkusDto } from "./dto/sku.dto";
import { SkusService } from "./skus.service";

@ApiTags("SKUs")
@Controller("skus")
export class SkusController {
  constructor(private readonly skusService: SkusService) {}

  @Get()
  @ApiOperation({ summary: "Список SKU с пагинацией и фильтрами" })
  findAll(@Query() query: QuerySkusDto): Promise<{
    data: Sku[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.skusService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Детали SKU" })
  findOne(@Param("id") id: string): Promise<Sku> {
    return this.skusService.findOne(id);
  }
}
