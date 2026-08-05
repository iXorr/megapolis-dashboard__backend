import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export class PaginationDto {
  @ApiPropertyOptional({
    description: "Номер страницы",
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Количество записей на странице",
    default: 20,
    minimum: 1,
    maximum: 100,
  })
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
    description: "Направление сортировки",
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.ASC;

  get skip(): number {
    return (this.page! - 1) * this.limit!;
  }
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
