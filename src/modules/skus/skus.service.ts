import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Sku } from "../../database/entities/sku.entity";
import { QuerySkusDto } from "./dto/sku.dto";

import { isValidUUID } from "../../common/utils/uuid.utils";

@Injectable()
export class SkusService {
  constructor(
    @InjectRepository(Sku)
    private readonly skuRepo: Repository<Sku>,
  ) {}

  async findAll(query: QuerySkusDto): Promise<{
    data: Sku[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const where: Record<string, unknown> = {};

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const [data, total] = await this.skuRepo.findAndCount({
      where,
      skip: query.skip,
      take: query.limit,
      relations: ["category"],
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

  async findOne(id: string): Promise<Sku> {
    if (!isValidUUID(id))
      throw new BadRequestException(`Некорректный UUID: ${id}`);
    const sku = await this.skuRepo.findOne({
      where: { id },
      relations: ["category"],
    });
    if (!sku) throw new NotFoundException(`SKU с id ${id} не найден`);
    return sku;
  }
}
