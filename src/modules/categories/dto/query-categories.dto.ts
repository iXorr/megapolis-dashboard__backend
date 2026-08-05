import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryCategoriesDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Поиск по названию" })
  @IsString()
  @IsOptional()
  search?: string;
}
