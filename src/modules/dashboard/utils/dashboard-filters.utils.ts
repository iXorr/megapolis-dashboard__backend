import { SelectQueryBuilder } from "typeorm";
import { Transaction } from "../../../database/entities/transaction.entity";
import { DashboardFiltersDto } from "../dto/dashboard.dto";
import { resolveDateRange } from "./dashboard-date.utils";

export function applyFilters(
  qb: SelectQueryBuilder<Transaction>,
  filters: DashboardFiltersDto,
): SelectQueryBuilder<Transaction> {
  const { dateFrom, dateTo } = resolveDateRange(filters);
  qb.andWhere("t.transactedAt BETWEEN :dateFrom AND :dateTo", {
    dateFrom,
    dateTo,
  });

  if (filters.venueTypes?.length) {
    qb.andWhere("v.type IN (:...venueTypes)", {
      venueTypes: filters.venueTypes,
    });
  }
  if (filters.venueIds?.length) {
    qb.andWhere("v.id IN (:...venueIds)", {
      venueIds: filters.venueIds,
    });
  }
  if (filters.categoryIds?.length) {
    qb.leftJoin("t.sku", "sku").andWhere(
      "sku.categoryId IN (:...categoryIds)",
      { categoryIds: filters.categoryIds },
    );
  }
  if (filters.search) {
    qb.leftJoin("t.sku", "sku_search").andWhere(
      "sku_search.name ILIKE :search",
      { search: `%${filters.search}%` },
    );
  }

  return qb;
}
