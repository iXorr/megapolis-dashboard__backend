import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transaction } from "../../database/entities/transaction.entity";
import { Venue } from "../../database/entities/venue.entity";
import {
  DashboardFiltersDto,
  DashboardTableDto,
  DrilldownDto,
  DrilldownLevel,
  RevenueTrendDto,
  TableGroupBy,
  TrendGranularity,
  TopVenuesDto,
} from "./dto/dashboard.dto";
import { PaginatedMeta } from "../../common/dto/pagination.dto";
import { applyFilters } from "./utils/dashboard-filters.utils";
import {
  formatDateKey,
  resolveDateRange,
  shiftPeriodBack,
} from "./utils/dashboard-date.utils";
import {
  addTableSelectColumns,
  addTableGroupBy,
  getTableGroupCols,
} from "./utils/dashboard-table.utils";

interface KpiResult {
  revenue: number;
  orderCount: number;
  cost: number;
}

interface TopVenueResult {
  id: string;
  name: string;
  revenue: number;
}

interface TrendRow {
  date: string;
  type: string | null;
  revenue: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txnRepo: Repository<Transaction>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
  ) {}

  async getKpi(filters: DashboardFiltersDto) {
    const { dateFrom, dateTo } = resolveDateRange(filters);
    const prev = shiftPeriodBack(dateFrom, dateTo);

    const [current, topVenue] = await Promise.all([
      this.aggregateKpi(dateFrom, dateTo, filters),
      this.topVenue(dateFrom, dateTo, filters),
    ]);
    const previous = await this.aggregateKpi(prev.from, prev.to, filters);

    return this.buildKpiResponse(current, previous, topVenue);
  }

  async getRevenueTrend(filters: RevenueTrendDto) {
    const granularity = filters.granularity ?? TrendGranularity.DAY;

    const rows: TrendRow[] = await applyFilters(
      this.txnRepo
        .createQueryBuilder("t")
        .leftJoin("t.venue", "v")
        .select(`DATE_TRUNC(:granularity, t.transactedAt)::date`, "date")
        .addSelect("v.type", "type")
        .addSelect("SUM(t.revenue)", "revenue")
        .groupBy("date")
        .addGroupBy("v.type")
        .orderBy("date", "ASC"),
      filters,
    )
      .setParameter("granularity", granularity)
      .getRawMany<TrendRow>();

    const grouped = new Map<
      string,
      { total: number; byType: Record<string, number> }
    >();

    for (const row of rows) {
      const rev = Math.round(parseFloat(row.revenue) * 100) / 100;
      const dateKey = formatDateKey(row.date, granularity);
      const entry = grouped.get(dateKey) ?? { total: 0, byType: {} };
      entry.total += rev;
      if (row.type) {
        entry.byType[row.type] = (entry.byType[row.type] ?? 0) + rev;
      }
      grouped.set(dateKey, entry);
    }

    return Array.from(grouped.entries()).map(([date, v]) => ({
      date,
      total: Math.round(v.total * 100) / 100,
      byType: Object.fromEntries(
        Object.entries(v.byType).map(([k, val]) => [
          k,
          Math.round(val * 100) / 100,
        ]),
      ),
    }));
  }

  async getTopVenues(filters: TopVenuesDto) {
    const limit = filters.limit ?? 10;

    const rows: {
      venue_id: string;
      venue_name: string;
      venue_type: string;
      revenue: string;
      cost: string;
    }[] = await applyFilters(
      this.txnRepo
        .createQueryBuilder("t")
        .leftJoin("t.venue", "v")
        .select("v.id", "venue_id")
        .addSelect("v.name", "venue_name")
        .addSelect("v.type", "venue_type")
        .addSelect("SUM(t.revenue)", "revenue")
        .addSelect("SUM(t.cost)", "cost")
        .groupBy("v.id")
        .addGroupBy("v.name")
        .addGroupBy("v.type")
        .orderBy("revenue", "DESC")
        .limit(limit),
      filters,
    ).getRawMany();

    return rows.map((r) => {
      const rev = parseFloat(r.revenue) || 0;
      const cst = parseFloat(r.cost) || 0;
      return {
        id: r.venue_id,
        name: r.venue_name,
        type: r.venue_type,
        revenue: Math.round(rev * 100) / 100,
        margin: rev ? Math.round(((rev - cst) / rev) * 1000) / 10 : 0,
      };
    });
  }

  async getRevenueStructure(filters: DashboardFiltersDto) {
    const rows: {
      venue_type: string;
      category_name: string;
      revenue: string;
    }[] = await applyFilters(
      this.txnRepo
        .createQueryBuilder("t")
        .leftJoin("t.venue", "v")
        .leftJoin("t.sku", "sku")
        .leftJoin("sku.category", "cat")
        .select("v.type", "venue_type")
        .addSelect("cat.name", "category_name")
        .addSelect("SUM(t.revenue)", "revenue")
        .groupBy("v.type")
        .addGroupBy("cat.name")
        .orderBy("v.type", "ASC")
        .addOrderBy("revenue", "DESC"),
      filters,
    ).getRawMany();

    const byType = new Map<string, { name: string; value: number }[]>();

    for (const r of rows) {
      const rev = Math.round(parseFloat(r.revenue) * 100) / 100;
      const children = byType.get(r.venue_type) ?? [];
      children.push({ name: r.category_name, value: rev });
      byType.set(r.venue_type, children);
    }

    return Array.from(byType.entries()).map(([type, children]) => {
      const total = children.reduce((sum, c) => sum + c.value, 0);
      return {
        name: type,
        value: Math.round(total * 100) / 100,
        children,
      };
    });
  }

  async getHeatmap(filters: DashboardFiltersDto) {
    const rows: {
      day_of_week: string;
      hour: string;
      order_count: string;
      revenue: string;
    }[] = await applyFilters(
      this.txnRepo
        .createQueryBuilder("t")
        .leftJoin("t.venue", "v")
        .select("EXTRACT(DOW FROM t.transactedAt)::int", "day_of_week")
        .addSelect("EXTRACT(HOUR FROM t.transactedAt)::int", "hour")
        .addSelect("COUNT(t.id)", "order_count")
        .addSelect("SUM(t.revenue)", "revenue")
        .groupBy("day_of_week")
        .addGroupBy("hour")
        .orderBy("day_of_week", "ASC")
        .addOrderBy("hour", "ASC"),
      filters,
    ).getRawMany();

    return rows.map((r) => ({
      dayOfWeek: parseInt(r.day_of_week, 10),
      hour: parseInt(r.hour, 10),
      orderCount: parseInt(r.order_count, 10),
      revenue: Math.round(parseFloat(r.revenue) * 100) / 100,
    }));
  }

  async getScatter(filters: DashboardFiltersDto) {
    const rows: {
      sku_id: string;
      sku_name: string;
      category_name: string;
      price: string;
      revenue: string;
      cost: string;
      sold_count: string;
    }[] = await applyFilters(
      this.txnRepo
        .createQueryBuilder("t")
        .leftJoin("t.sku", "sku")
        .leftJoin("sku.category", "cat")
        .select("sku.id", "sku_id")
        .addSelect("sku.name", "sku_name")
        .addSelect("cat.name", "category_name")
        .addSelect("AVG(sku.price)", "price")
        .addSelect("SUM(t.revenue)", "revenue")
        .addSelect("SUM(t.cost)", "cost")
        .addSelect("SUM(t.quantity)", "sold_count")
        .groupBy("sku.id")
        .addGroupBy("sku.name")
        .addGroupBy("cat.name")
        .orderBy("sold_count", "DESC"),
      filters,
    ).getRawMany();

    return rows.map((r) => {
      const rev = parseFloat(r.revenue) || 0;
      const cst = parseFloat(r.cost) || 0;
      return {
        id: r.sku_id,
        name: r.sku_name,
        categoryName: r.category_name,
        price: Math.round(parseFloat(r.price) * 100) / 100,
        margin: rev ? Math.round(((rev - cst) / rev) * 1000) / 10 : 0,
        soldCount: parseInt(r.sold_count, 10),
      };
    });
  }

  async getTable(filters: DashboardTableDto): Promise<{
    data: Record<string, unknown>[];
    meta: PaginatedMeta;
  }> {
    const groupBy = filters.groupBy;
    const defaultSortBy = groupBy ? `${groupBy}_name` : "revenue";

    const orderBy = filters.sortBy ?? defaultSortBy;
    const orderDir: "ASC" | "DESC" =
      filters.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const qb = this.txnRepo
      .createQueryBuilder("t")
      .leftJoin("t.venue", "v")
      .leftJoin("t.sku", "sku")
      .leftJoin("sku.category", "cat");

    const countQb = this.txnRepo
      .createQueryBuilder("t")
      .leftJoin("t.venue", "v")
      .leftJoin("t.sku", "sku")
      .leftJoin("sku.category", "cat");

    applyFilters(qb, filters);
    applyFilters(countQb, filters);

    addTableSelectColumns(qb, groupBy);
    addTableGroupBy(qb, groupBy);

    qb.addSelect("SUM(t.revenue)", "revenue")
      .addSelect("SUM(t.quantity)", "quantity")
      .addSelect("SUM(t.cost)", "cost");

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    qb.offset((page - 1) * limit)
      .limit(limit)
      .orderBy(orderBy, orderDir);

    addTableGroupBy(countQb, groupBy);
    countQb.select(
      "COUNT(DISTINCT " + getTableGroupCols(groupBy).join(" || '-' || ") + ")",
      "cnt",
    );

    const totalResult: { cnt?: string }[] = await countQb.getRawMany();
    const total = totalResult.length;

    const rows: Record<string, string>[] = await qb.getRawMany();

    const data = rows.map((r) => {
      const rev = parseFloat(r.revenue) || 0;
      const cst = parseFloat(r.cost) || 0;
      const result: Record<string, unknown> = {
        revenue: Math.round(rev * 100) / 100,
        quantity: parseInt(r.quantity, 10),
        margin: rev ? Math.round(((rev - cst) / rev) * 1000) / 10 : 0,
        marginAmount: Math.round((rev - cst) * 100) / 100,
      };
      if (groupBy === TableGroupBy.VENUE) {
        result.venueName = r.venue_name;
      } else if (groupBy === TableGroupBy.CATEGORY) {
        result.categoryName = r.category_name;
      } else if (groupBy === TableGroupBy.SKU) {
        result.skuName = r.sku_name;
      } else {
        result.venueName = r.venue_name;
        result.categoryName = r.category_name;
        result.skuName = r.sku_name;
      }
      return result;
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDrilldown(filters: DrilldownDto) {
    const { level, parentId } = filters;

    const qb = this.txnRepo
      .createQueryBuilder("t")
      .leftJoin("t.venue", "v")
      .leftJoin("t.sku", "sku")
      .leftJoin("sku.category", "cat");

    let labelCol: string;
    let idCol: string | null = null;
    const groupCols: string[] = [];

    switch (level) {
      case DrilldownLevel.NETWORK:
        labelCol = "v.type";
        groupCols.push("v.type");
        break;
      case DrilldownLevel.VENUE:
        labelCol = "v.name";
        idCol = "v.id";
        groupCols.push("v.id");
        groupCols.push("v.name");
        if (parentId) {
          qb.andWhere("v.type::text = :type", { type: parentId });
        }
        break;
      case DrilldownLevel.CATEGORY:
        labelCol = "cat.name";
        idCol = "cat.id";
        groupCols.push("cat.id");
        groupCols.push("cat.name");
        if (parentId) {
          qb.andWhere("v.id = :venueId", { venueId: parentId });
        }
        break;
      case DrilldownLevel.SKU:
        labelCol = "sku.name";
        idCol = "sku.id";
        groupCols.push("sku.id");
        groupCols.push("sku.name");
        if (parentId) {
          qb.andWhere("cat.id = :categoryId", { categoryId: parentId });
        }
        break;
    }

    const selectParts = [`${labelCol} AS label`];
    if (idCol) {
      selectParts.push(`${idCol} AS id`);
    }
    selectParts.push("SUM(t.revenue) AS revenue");
    selectParts.push("COUNT(t.id) AS order_count");
    selectParts.push("SUM(t.cost) AS cost");

    applyFilters(qb, filters);

    if (groupCols.length) {
      groupCols.reduce(
        (q, col, i) => (i === 0 ? q.groupBy(col) : q.addGroupBy(col)),
        qb,
      );
    }

    const rows: {
      label: string;
      id?: string;
      revenue: string;
      order_count: string;
      cost: string;
    }[] = await qb.select(selectParts).orderBy("revenue", "DESC").getRawMany();

    return rows.map((r) => {
      const rev = parseFloat(r.revenue) || 0;
      const cst = parseFloat(r.cost) || 0;
      return {
        label: r.label,
        id: r.id,
        revenue: Math.round(rev * 100) / 100,
        orderCount: parseInt(r.order_count, 10),
        margin: rev ? Math.round(((rev - cst) / rev) * 1000) / 10 : 0,
      };
    });
  }

  /* ───── KPI helpers ───── */

  private async aggregateKpi(
    from: Date,
    to: Date,
    filters: DashboardFiltersDto,
  ): Promise<KpiResult> {
    const baseQb = this.txnRepo
      .createQueryBuilder("t")
      .leftJoin("t.venue", "v");

    if (filters.categoryIds?.length) {
      baseQb.leftJoin("t.sku", "sku");
    }

    const result = await applyFilters(
      baseQb
        .select("COALESCE(SUM(t.revenue), 0)", "revenue")
        .addSelect("COALESCE(COUNT(t.id), 0)", "orderCount")
        .addSelect("COALESCE(SUM(t.cost), 0)", "cost"),
      { ...filters, dateFrom: from.toISOString(), dateTo: to.toISOString() },
    ).getRawOne<{ revenue: string; orderCount: string; cost: string }>();

    const revenue = parseFloat(result!.revenue) || 0;
    const orderCount = parseInt(result!.orderCount, 10) || 0;
    const cost = parseFloat(result!.cost) || 0;

    return { revenue, orderCount, cost };
  }

  private async topVenue(
    from: Date,
    to: Date,
    filters: DashboardFiltersDto,
  ): Promise<TopVenueResult> {
    const row = await applyFilters(
      this.txnRepo
        .createQueryBuilder("t")
        .leftJoin("t.venue", "v")
        .select("v.id", "id")
        .addSelect("v.name", "name")
        .addSelect("SUM(t.revenue)", "revenue")
        .groupBy("v.id")
        .addGroupBy("v.name")
        .orderBy("revenue", "DESC")
        .limit(1),
      filters,
    ).getRawOne<{ id: string; name: string; revenue: string }>();

    return row
      ? {
          id: row.id,
          name: row.name,
          revenue: Math.round(parseFloat(row.revenue) * 100) / 100,
        }
      : { id: "", name: "", revenue: 0 };
  }

  private buildKpiResponse(
    current: KpiResult,
    previous: KpiResult,
    topVenue: TopVenueResult,
  ) {
    const revenue = this.kpiItem(current.revenue, previous.revenue);
    const avgCheck = this.kpiItem(
      current.orderCount ? current.revenue / current.orderCount : 0,
      previous.orderCount ? previous.revenue / previous.orderCount : 0,
    );
    const orderCount = this.kpiItem(current.orderCount, previous.orderCount);
    const margin = this.kpiItem(
      current.revenue
        ? ((current.revenue - current.cost) / current.revenue) * 100
        : 0,
      previous.revenue
        ? ((previous.revenue - previous.cost) / previous.revenue) * 100
        : 0,
    );

    return { revenue, avgCheck, orderCount, margin, topVenue };
  }

  private kpiItem(current: number, previous: number) {
    const value = Math.round(current * 100) / 100;
    const delta =
      previous !== 0
        ? Math.round(((current - previous) / previous) * 1000) / 10
        : 0;

    let deltaSign: "positive" | "negative" | "neutral" = "neutral";
    if (delta > 0) deltaSign = "positive";
    else if (delta < 0) deltaSign = "negative";

    return { value, delta, deltaSign };
  }
}
