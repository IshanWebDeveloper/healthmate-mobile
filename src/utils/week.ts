import { subDays } from "date-fns";

import { toISODate } from "@/utils/date";
import { DailyTotals } from "@/types";

/** The last `days` calendar dates ending today, oldest first, as `yyyy-MM-dd`. */
export function lastNDays(days: number, now: Date = new Date()): string[] {
  return Array.from({ length: days }, (_, i) =>
    toISODate(subDays(now, days - 1 - i)),
  );
}

/**
 * getDailyTotals() only returns days that have entries. Charts need one bar per
 * day, so fill the gaps with zero totals while keeping the given date order.
 */
export function fillDays(
  summaries: readonly DailyTotals[],
  dates: readonly string[],
): DailyTotals[] {
  const byDate = new Map(summaries.map((s) => [s.date, s]));
  return dates.map(
    (date) =>
      byDate.get(date) ?? {
        date,
        steps: 0,
        calories: 0,
        water: 0,
        entryCount: 0,
      },
  );
}

/** Fraction of a goal reached, clamped to 0..1 for progress bars. */
export function goalProgress(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(Math.max(value / goal, 0), 1);
}
