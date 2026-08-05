import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Category } from "../../database/entities/category.entity";

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    str,
  );
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(
    search?: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: Category[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const where = search ? { name: ILike(`%${search}%`) } : {};
    const [data, total] = await this.categoryRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { name: "asc" },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Category> {
    if (!isValidUUID(id))
      throw new BadRequestException(`Некорректный UUID: ${id}`);
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ["skus"],
    });
    if (!category)
      throw new NotFoundException(`Категория с id ${id} не найдена`);
    return category;
  }
}
