import { SelectQueryBuilder } from "typeorm";
import { Transaction } from "../../../database/entities/transaction.entity";
import { TableGroupBy } from "../dto/dashboard.dto";

export function addTableSelectColumns(
  qb: SelectQueryBuilder<Transaction>,
  groupBy?: TableGroupBy,
): void {
  switch (groupBy) {
    case TableGroupBy.VENUE:
      qb.select("v.name", "venue_name").addSelect("v.city", "venue_city");
      break;
    case TableGroupBy.CATEGORY:
      qb.select("cat.name", "category_name");
      break;
    case TableGroupBy.SKU:
      qb.select("sku.name", "sku_name");
      break;
    default:
      qb.select("v.name", "venue_name")
        .addSelect("cat.name", "category_name")
        .addSelect("sku.name", "sku_name");
  }
}

export function addTableGroupBy(
  qb: SelectQueryBuilder<Transaction>,
  groupBy?: TableGroupBy,
): void {
  const cols = getTableGroupCols(groupBy);
  for (let i = 0; i < cols.length; i++) {
    if (i === 0) {
      qb.groupBy(cols[i]);
    } else {
      qb.addGroupBy(cols[i]);
    }
  }
}

export function getTableGroupCols(groupBy?: TableGroupBy): string[] {
  switch (groupBy) {
    case TableGroupBy.VENUE:
      return ["v.id", "v.name", "v.city"];
    case TableGroupBy.CATEGORY:
      return ["cat.id", "cat.name"];
    case TableGroupBy.SKU:
      return ["sku.id", "sku.name"];
    default:
      return ["v.id", "v.name", "cat.id", "cat.name", "sku.id", "sku.name"];
  }
}
