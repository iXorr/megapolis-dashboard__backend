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
import { PaginationDto } from "../../../common/dto/pagination.dto";

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

export class QueryVenuesDto extends PaginationDto {
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
}
