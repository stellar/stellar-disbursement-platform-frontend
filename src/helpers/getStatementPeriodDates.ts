import { endOfMonth, format, startOfMonth, startOfQuarter, startOfYear, subMonths } from "date-fns";

import type { StatementPeriod } from "@/types";

type DateRange = { fromDate: string; toDate: string };

const DATE_FORMAT = "yyyy-MM-dd";

const range = (from: Date, to: Date): DateRange => ({
  fromDate: format(from, DATE_FORMAT),
  toDate: format(to, DATE_FORMAT),
});

/** The date range a statement period preset stands for, ending today unless the period is over. */
export const getStatementPeriodDates = (period: StatementPeriod): DateRange => {
  const now = new Date();
  switch (period) {
    case "this_month":
      return range(startOfMonth(now), now);
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return range(startOfMonth(lastMonth), endOfMonth(lastMonth));
    }
    case "qtd":
      return range(startOfQuarter(now), now);
    case "ytd":
      return range(startOfYear(now), now);
  }
};
