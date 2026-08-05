import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class DateRangeDto {
  @ApiPropertyOptional({
    description: "Начало периода (ISO 8601)",
    example: "2026-01-01",
  })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: "Конец периода (ISO 8601)",
    example: "2026-12-31",
  })
  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
