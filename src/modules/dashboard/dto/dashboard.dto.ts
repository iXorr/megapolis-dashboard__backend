import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Max,
} from "class-validator";
import { DateRangeDto } from "../../../common/dto/date-range.dto";
import { SortOrder } from "../../../common/dto/pagination.dto";

const toArray = ({
  value,
  obj,
  key,
}: {
  value: unknown;
  obj?: Record<string, unknown>;
  key: string;
}): unknown[] => {
  const actual = value ?? obj?.[`${key}[]`];
  return actual == null ? [] : Array.isArray(actual) ? actual : [actual];
};

export enum TrendGranularity {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

export class DashboardFiltersDto extends DateRangeDto {
  @ApiPropertyOptional({
    description: "Типы заведений",
    isArray: true,
    enum: ["restaurant", "bar", "cinema"],
  })
  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  venueTypes?: string[];

  @ApiPropertyOptional({
    description: "ID конкретных заведений",
    isArray: true,
  })
  @Transform(toArray)
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  venueIds?: string[];

  @ApiPropertyOptional({ description: "ID категорий", isArray: true })
  @Transform(toArray)
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({ description: "Поиск по названию SKU" })
  @IsString()
  @IsOptional()
  search?: string;
}

export class KpiItemDto {
  @ApiProperty({ example: 12450000 })
  value!: number;

  @ApiProperty({ example: 12.3 })
  delta!: number;

  @ApiProperty({
    enum: ["positive", "negative", "neutral"],
    example: "positive",
  })
  deltaSign!: "positive" | "negative" | "neutral";
}

export class TopVenueDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "Ресторан «Волна»" })
  name!: string;

  @ApiProperty({ example: 3200000 })
  revenue!: number;
}

export class KpiResponseDto {
  @ApiProperty({ type: KpiItemDto })
  revenue!: KpiItemDto;

  @ApiProperty({ type: KpiItemDto })
  avgCheck!: KpiItemDto;

  @ApiProperty({ type: KpiItemDto })
  orderCount!: KpiItemDto;

  @ApiProperty({ type: KpiItemDto })
  margin!: KpiItemDto;

  @ApiProperty({ type: TopVenueDto })
  topVenue!: TopVenueDto;
}

export class RevenueTrendDto extends DashboardFiltersDto {
  @ApiPropertyOptional({
    description: "Гранулярность (день/неделя/месяц)",
    enum: TrendGranularity,
    default: TrendGranularity.DAY,
  })
  @IsEnum(TrendGranularity)
  @IsOptional()
  granularity?: TrendGranularity = TrendGranularity.DAY;
}

export class RevenueTrendItemDto {
  @ApiProperty({ example: "2026-07-01" })
  date!: string;

  @ApiProperty({ example: 420000 })
  total!: number;

  @ApiProperty({ example: { restaurant: 300000, bar: 120000 } })
  byType!: Record<string, number>;
}

export class TopVenuesDto extends DashboardFiltersDto {
  @ApiPropertyOptional({
    description: "Кол-во возвращаемых заведений",
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;
}

export class TopVenueItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty({ example: 3200000 })
  revenue!: number;

  @ApiProperty({ example: 45.2 })
  margin!: number;
}

export class SunburstItemDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  value!: number;

  @ApiPropertyOptional({ type: [Object], isArray: true })
  children?: SunburstItemDto[];
}

export class HeatmapItemDto {
  @ApiProperty({ example: 1 })
  dayOfWeek!: number;

  @ApiProperty({ example: 12 })
  hour!: number;

  @ApiProperty({ example: 340 })
  orderCount!: number;

  @ApiProperty({ example: 145000 })
  revenue!: number;
}

export class ScatterItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: "Стейк Рибай" })
  name!: string;

  @ApiProperty({ example: "Горячие блюда" })
  categoryName!: string;

  @ApiProperty({ example: 1200 })
  price!: number;

  @ApiProperty({ example: 48.5 })
  margin!: number;

  @ApiProperty({ example: 230 })
  soldCount!: number;
}

export enum TableGroupBy {
  VENUE = "venue",
  CATEGORY = "category",
  SKU = "sku",
}

export class DashboardTableDto extends DashboardFiltersDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: "Поле сортировки" })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    enum: TableGroupBy,
    description: "Поле для группировки",
  })
  @IsEnum(TableGroupBy)
  @IsOptional()
  groupBy?: TableGroupBy;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  get skip(): number {
    return (this.page! - 1) * this.limit!;
  }
}

export enum DrilldownLevel {
  NETWORK = "network",
  VENUE = "venue",
  CATEGORY = "category",
  SKU = "sku",
}

export class DrilldownDto extends DashboardFiltersDto {
  @ApiProperty({ enum: DrilldownLevel, description: "Уровень детализации" })
  @IsEnum(DrilldownLevel)
  level!: DrilldownLevel;

  @ApiPropertyOptional({
    description:
      "ID родительской сущности (type для level=venue, venueId для level=category, categoryId для level=sku)",
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}

export class DrilldownItemDto {
  @ApiProperty({ example: "Рестораны" })
  label!: string;

  @ApiProperty({ example: "2026-08-01" })
  id?: string;

  @ApiProperty({ example: 7500000 })
  revenue!: number;

  @ApiProperty({ example: 3200 })
  orderCount!: number;

  @ApiProperty({ example: 44.5 })
  margin!: number;
}
