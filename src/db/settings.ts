import type { SQLiteDatabase } from "expo-sqlite";

import type { ThemePreference } from "@/theme/theme";
import { DEFAULT_SETTINGS, type AppSettings, type DailyGoals } from "@/types";

// Settings are stored as key/value rows, so adding a new setting never needs a schema change.
const UPSERT = `INSERT INTO settings (key, value) VALUES (?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value`;

const THEMES: ThemePreference[] = ["system", "light", "dark"];

/** Reads saved settings, falling back to the defaults for anything missing or invalid. */
export async function getSettings(db: SQLiteDatabase): Promise<AppSettings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    "SELECT key, value FROM settings",
  );
  const saved = new Map(rows.map((row) => [row.key, row.value]));

  const goal = (key: keyof DailyGoals) => {
    const value = Number(saved.get(`goal.${key}`));
    return Number.isInteger(value) && value > 0
      ? value
      : DEFAULT_SETTINGS.goals[key];
  };
  const theme = saved.get("theme") as ThemePreference | undefined;

  return {
    goals: {
      steps: goal("steps"),
      calories: goal("calories"),
      water: goal("water"),
    },
    theme: theme && THEMES.includes(theme) ? theme : DEFAULT_SETTINGS.theme,
  };
}

export async function saveTheme(
  db: SQLiteDatabase,
  theme: ThemePreference,
): Promise<void> {
  await db.runAsync(UPSERT, ["theme", theme]);
}
