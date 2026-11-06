import type { ThemePreference } from "@/theme/theme";

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
