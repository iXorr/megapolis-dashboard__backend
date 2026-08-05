import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Transaction } from "../../database/entities/transaction.entity";
import { Venue } from "../../database/entities/venue.entity";
import {
  DashboardFiltersDto,
  RevenueTrendDto,
  TrendGranularity,
} from "./dto/dashboard.dto";

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
    const { dateFrom, dateTo } = this.resolveDateRange(filters);
    const prev = this.shiftPeriodBack(dateFrom, dateTo);

    const [current, topVenue] = await Promise.all([
      this.aggregateKpi(dateFrom, dateTo, filters),
      this.topVenue(dateFrom, dateTo, filters),
    ]);
    const previous = await this.aggregateKpi(prev.from, prev.to, filters);

    return this.buildKpiResponse(current, previous, topVenue);
  }

  async getRevenueTrend(filters: RevenueTrendDto) {
    const granularity = filters.granularity ?? TrendGranularity.DAY;

    const rows: TrendRow[] = await this.applyFilters(
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
      const dateKey = this.formatDateKey(row.date, granularity);
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

  /* ───── helpers ───── */

  private formatDateKey(raw: string, granularity: TrendGranularity): string {
    const d = new Date(raw);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    if (granularity === TrendGranularity.MONTH) return `${y}-${m}`;
    if (granularity === TrendGranularity.WEEK) return `${y}-${m}-${day}`;
    return `${y}-${m}-${day}`;
  }

  private resolveDateRange(filters: DashboardFiltersDto): {
    dateFrom: Date;
    dateTo: Date;
  } {
    const to = filters.dateTo ? new Date(filters.dateTo) : new Date();
    to.setHours(23, 59, 59, 999);

    const from = filters.dateFrom
      ? new Date(filters.dateFrom)
      : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    from.setHours(0, 0, 0, 0);

    return { dateFrom: from, dateTo: to };
  }

  private shiftPeriodBack(from: Date, to: Date): { from: Date; to: Date } {
    const duration = to.getTime() - from.getTime();
    return {
      from: new Date(from.getTime() - duration),
      to: new Date(to.getTime() - duration),
    };
  }

  private applyFilters(
    qb: SelectQueryBuilder<Transaction>,
    filters: DashboardFiltersDto,
  ): SelectQueryBuilder<Transaction> {
    const { dateFrom, dateTo } = this.resolveDateRange(filters);
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
        {
          categoryIds: filters.categoryIds,
        },
      );
    }
    if (filters.search) {
      qb.leftJoin("t.sku", "sku_search").andWhere(
        "sku_search.name ILIKE :search",
        {
          search: `%${filters.search}%`,
        },
      );
    }

    return qb;
  }

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

    const result = await this.applyFilters(
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
    const row = await this.applyFilters(
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
