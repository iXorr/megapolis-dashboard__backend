import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { VenueType } from "../../../database/entities/venue.entity";

export class CreateVenueDto {
  @ApiProperty({ example: "Ресторан «Волна»" })
  @IsString()
  @Length(1, 255)
  name!: string;

  @ApiProperty({ enum: VenueType, example: VenueType.RESTAURANT })
  @IsEnum(VenueType)
  type!: VenueType;

  @ApiProperty({ example: "Челябинск" })
  @IsString()
  @Length(1, 100)
  city!: string;

  @ApiProperty({ example: "ул. Ленина, 15" })
  @IsString()
  address!: string;

  @ApiProperty({ example: 55.1644 })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: 61.4368 })
  @IsLongitude()
  longitude!: number;

  @ApiPropertyOptional({ example: "2020-05-10" })
  @IsOptional()
  @IsString()
  openedAt?: string;
}

export class QueryVenuesDto {
  @ApiPropertyOptional({ description: "Номер страницы", default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: "Записей на странице", default: 20 })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: VenueType })
  @IsOptional()
  @IsEnum(VenueType)
  type?: VenueType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: "name" })
  @IsOptional()
  @IsString()
  sortBy?: string = "name";

  @ApiPropertyOptional({ enum: ["asc", "desc"], default: "asc" })
  @IsOptional()
  sortOrder?: "asc" | "desc" = "asc";

  get skip(): number {
    return (this.page! - 1) * this.limit!;
  }
}
