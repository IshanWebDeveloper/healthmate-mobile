import type { ThemePreference } from "@/theme/theme";

/** One row of the health_records table. */
export interface HealthRecord {
  id: number;
  /** `yyyy-MM-dd` */
  date: string;
  steps: number;
  /** kcal burned */
  calories: number;
  /** millilitres */
  water: number;
}

/** Fields the user can create or edit. */
export type HealthRecordInput = Omit<HealthRecord, "id">;

/** Totals for one calendar day, summed across all of that day's entries. */
export interface DailyTotals {
  date: string;
  steps: number;
  calories: number;
  water: number;
  entryCount: number;
}

/** Daily targets the dashboard measures progress against. */
export interface DailyGoals {
  steps: number;
  calories: number;
  water: number;
}

export interface AppSettings {
  goals: DailyGoals;
  theme: ThemePreference;
}

/** Used until the user saves their own goals (common public-health targets). */
export const DEFAULT_SETTINGS: AppSettings = {
  goals: { steps: 10_000, calories: 500, water: 2_000 },
  theme: "system",
};
