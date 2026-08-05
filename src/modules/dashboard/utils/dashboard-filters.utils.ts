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
  const hasSkuAlias = qb.expressionMap.joinAttributes.some(
    (join) => join.alias && join.alias.name === "sku",
  );
  if ((filters.categoryIds?.length || filters.search) && !hasSkuAlias) {
    qb.leftJoin("t.sku", "sku");
  }
  if (filters.categoryIds?.length) {
    qb.andWhere("sku.categoryId IN (:...categoryIds)", {
      categoryIds: filters.categoryIds,
    });
  }
  if (filters.search) {
    qb.andWhere("sku.name ILIKE :search", {
      search: `%${filters.search}%`,
    });
  }

  return qb;
}
