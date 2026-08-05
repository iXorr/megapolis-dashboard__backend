import { DashboardFiltersDto, TrendGranularity } from "../dto/dashboard.dto";

export function formatDateKey(
  raw: string,
  granularity: TrendGranularity,
): string {
  const d = new Date(raw);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (granularity === TrendGranularity.MONTH) return `${y}-${m}`;
  if (granularity === TrendGranularity.WEEK) return `${y}-${m}-${day}`;
  return `${y}-${m}-${day}`;
}

export function resolveDateRange(filters: DashboardFiltersDto): {
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

export function shiftPeriodBack(
  from: Date,
  to: Date,
): { from: Date; to: Date } {
  const duration = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - duration),
    to: new Date(to.getTime() - duration),
  };
}
