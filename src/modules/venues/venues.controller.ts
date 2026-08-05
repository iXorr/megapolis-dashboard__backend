import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Venue } from "../../database/entities/venue.entity";
import { QueryVenuesDto } from "./dto/venue.dto";
import { VenuesService } from "./venues.service";

@ApiTags("Venues")
@Controller("venues")
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get()
  @ApiOperation({ summary: "Список заведений с пагинацией и фильтрами" })
  findAll(@Query() query: QueryVenuesDto): Promise<{
    data: Venue[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    return this.venuesService.findAll(query);
  }

  @Get("types")
  @ApiOperation({ summary: "Список уникальных типов заведений" })
  getTypes(): Promise<string[]> {
    return this.venuesService.getTypes();
  }

  @Get(":id")
  @ApiOperation({ summary: "Детальная информация о заведении" })
  findOne(@Param("id") id: string): Promise<Venue> {
    return this.venuesService.findOne(id);
  }
}
