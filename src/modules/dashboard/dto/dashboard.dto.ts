import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { DateRangeDto } from "../../../common/dto/date-range.dto";

export enum TrendGranularity {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

export class DashboardFiltersDto extends DateRangeDto {
  @ApiPropertyOptional({
    description: "Типы заведений",
    isArray: true,
    enum: ["restaurant", "bar", "cinema", "food_court"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  venueTypes?: string[];

  @ApiPropertyOptional({
    description: "ID конкретных заведений",
    isArray: true,
  })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  venueIds?: string[];

  @ApiPropertyOptional({ description: "ID категорий", isArray: true })
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
