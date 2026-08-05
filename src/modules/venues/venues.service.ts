import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, ILike, Repository } from "typeorm";
import { Venue } from "../../database/entities/venue.entity";
import { CreateVenueDto, QueryVenuesDto } from "./dto/venue.dto";

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    str,
  );
}

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
  ) {}

  async findAll(query: QueryVenuesDto): Promise<{
    data: Venue[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const where: FindManyOptions<Venue>["where"] = {};

    if (query.type) where.type = query.type;
    if (query.city) where.city = query.city;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [data, total] = await this.venueRepo.findAndCount({
      where,
      skip: query.skip,
      take: query.limit,
      order: { [query.sortBy ?? "name"]: query.sortOrder },
    });

    return {
      data,
      meta: {
        page: query.page!,
        limit: query.limit!,
        total,
        totalPages: Math.ceil(total / query.limit!),
      },
    };
  }

  async findOne(id: string): Promise<Venue> {
    if (!isValidUUID(id))
      throw new BadRequestException(`Некорректный UUID: ${id}`);
    const venue = await this.venueRepo.findOne({ where: { id } });
    if (!venue) throw new NotFoundException(`Заведение с id ${id} не найдено`);
    return venue;
  }

  async getTypes(): Promise<string[]> {
    const rows = await this.venueRepo
      .createQueryBuilder("venue")
      .select("DISTINCT venue.type", "type")
      .getRawMany<{ type: string }>();
    return rows.map((r) => r.type);
  }

  async create(dto: CreateVenueDto): Promise<Venue> {
    const venue = this.venueRepo.create({
      ...dto,
      openedAt: dto.openedAt ? new Date(dto.openedAt) : null,
    });
    return this.venueRepo.save(venue);
  }
}
