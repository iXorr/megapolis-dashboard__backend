import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import {
  DashboardFiltersDto,
  RevenueTrendDto,
  KpiResponseDto,
  RevenueTrendItemDto,
} from "./dto/dashboard.dto";

@ApiTags("Дашборд")
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("kpi")
  @ApiOperation({
    summary: "KPI-сводка",
    description:
      "Выручка, средний чек, количество заказов, маржинальность, топ-заведение — с дельтами к предыдущему периоду",
  })
  getKpi(@Query() filters: DashboardFiltersDto): Promise<KpiResponseDto> {
    return this.dashboardService.getKpi(filters);
  }

  @Get("revenue-trend")
  @ApiOperation({
    summary: "Динамика выручки",
    description:
      "Ежедневная/еженедельная/ежемесячная динамика с разбивкой по типам заведений",
  })
  getRevenueTrend(
    @Query() filters: RevenueTrendDto,
  ): Promise<RevenueTrendItemDto[]> {
    return this.dashboardService.getRevenueTrend(filters);
  }
}
