import { endOfMonth, format, startOfMonth, startOfQuarter, startOfYear, subMonths } from "date-fns";

import type { StatementPeriod } from "@/types";

export type StatementPeriodKey = Exclude<StatementPeriod, "custom">;

const DATE_FORMAT = "yyyy-MM-dd";

export function getThisMonthDates(): { fromDate: string; toDate: string } {
  const now = new Date();
  return {
    fromDate: format(startOfMonth(now), DATE_FORMAT),
    toDate: format(now, DATE_FORMAT),
  };
}

export function getLastMonthDates(): { fromDate: string; toDate: string } {
  const lastMonth = subMonths(new Date(), 1);
  return {
    fromDate: format(startOfMonth(lastMonth), DATE_FORMAT),
    toDate: format(endOfMonth(lastMonth), DATE_FORMAT),
  };
}

export function getQTDDates(): { fromDate: string; toDate: string } {
  const now = new Date();
  return {
    fromDate: format(startOfQuarter(now), DATE_FORMAT),
    toDate: format(now, DATE_FORMAT),
  };
}

export function getYTDDates(): { fromDate: string; toDate: string } {
  const now = new Date();
  return {
    fromDate: format(startOfYear(now), DATE_FORMAT),
    toDate: format(now, DATE_FORMAT),
  };
}

const PERIOD_GETTERS: Record<StatementPeriodKey, () => { fromDate: string; toDate: string }> = {
  this_month: getThisMonthDates,
  last_month: getLastMonthDates,
  qtd: getQTDDates,
  ytd: getYTDDates,
};

export function getMatchingPeriod(fromDate: string, toDate: string): StatementPeriodKey | null {
  if (!fromDate || !toDate) return null;
  for (const [period, getter] of Object.entries(PERIOD_GETTERS)) {
    const { fromDate: pFrom, toDate: pTo } = getter();
    if (fromDate === pFrom && toDate === pTo) return period as StatementPeriodKey;
  }
  return null;
}
