import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import {
  DashboardFiltersDto,
  DashboardTableDto,
  DrilldownDto,
  DrilldownItemDto,
  HeatmapItemDto,
  KpiResponseDto,
  RevenueTrendDto,
  RevenueTrendItemDto,
  ScatterItemDto,
  SunburstItemDto,
  TableRowDto,
  TopVenueItemDto,
  TopVenuesDto,
} from "./dto/dashboard.dto";
import { ApiPaginatedResponse } from "../../common/decorators/api-paginated-response";
import { PaginatedMeta } from "../../common/dto/pagination.dto";

@ApiTags("Dashboard")
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

  @Get("top-venues")
  @ApiOperation({
    summary: "Топ-N заведений по выручке",
    description: "Ранжирование заведений по выручке с маржинальностью",
  })
  getTopVenues(@Query() filters: TopVenuesDto): Promise<TopVenueItemDto[]> {
    return this.dashboardService.getTopVenues(filters);
  }

  @Get("revenue-structure")
  @ApiOperation({
    summary: "Структура выручки",
    description:
      "Иерархическая структура для sunburst-диаграммы: тип заведения → категория",
  })
  getRevenueStructure(
    @Query() filters: DashboardFiltersDto,
  ): Promise<SunburstItemDto[]> {
    return this.dashboardService.getRevenueStructure(filters);
  }

  @Get("heatmap")
  @ApiOperation({
    summary: "Тепловая карта загрузки",
    description: "Интенсивность (заказы и выручка) по дням недели и часам",
  })
  getHeatmap(@Query() filters: DashboardFiltersDto): Promise<HeatmapItemDto[]> {
    return this.dashboardService.getHeatmap(filters);
  }

  @Get("scatter")
  @ApiOperation({
    summary: "Scatter-плот: Цена vs Маржинальность SKU",
    description: "Каждая точка — SKU, размер — объём продаж, цвет — категория",
  })
  getScatter(@Query() filters: DashboardFiltersDto): Promise<ScatterItemDto[]> {
    return this.dashboardService.getScatter(filters);
  }

  @Get("table")
  @ApiOperation({
    summary: "Таблица данных дашборда",
    description:
      "Пагинированная таблица с опциональной группировкой по заведению/категории/SKU",
  })
  @ApiPaginatedResponse(TableRowDto)
  getTable(@Query() filters: DashboardTableDto): Promise<{
    data: Record<string, unknown>[];
    meta: PaginatedMeta;
  }> {
    return this.dashboardService.getTable(filters);
  }

  @Get("drilldown")
  @ApiOperation({
    summary: "Drill-down навигация",
    description:
      "Детализация любого уровня: network → venue → category → sku. Параметр level + опциональный parentId",
  })
  getDrilldown(@Query() filters: DrilldownDto): Promise<DrilldownItemDto[]> {
    return this.dashboardService.getDrilldown(filters);
  }
}
