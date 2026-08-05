import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class QuerySkusDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: "Фильтр по категории" })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: "Поиск по названию" })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: "name" })
  @IsString()
  @IsOptional()
  sortBy?: string = "name";

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "asc" })
  @IsOptional()
  sortOrder?: "asc" | "desc" = "asc";

  get skip(): number {
    return (this.page! - 1) * this.limit!;
  }
}
