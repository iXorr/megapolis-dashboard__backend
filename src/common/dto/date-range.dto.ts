import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

@ValidatorConstraint({ name: "IsDateRange", async: false })
class IsDateRangeConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const { dateFrom, dateTo } = args.object as Record<string, string>;
    if (!dateFrom || !dateTo) return true;
    return new Date(dateFrom) <= new Date(dateTo);
  }

  defaultMessage() {
    return "dateFrom не может быть позже dateTo";
  }
}

export class DateRangeDto {
  @ApiPropertyOptional({
    description: "Начало периода (ISO 8601)",
    example: "2026-01-01",
  })
  @IsDateString()
  @IsOptional()
  @Validate(IsDateRangeConstraint)
  dateFrom?: string;

  @ApiPropertyOptional({
    description: "Конец периода (ISO 8601)",
    example: "2026-12-31",
  })
  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
