import type { SQLiteDatabase } from "expo-sqlite";
import { create } from "zustand";

import { getSettings, saveGoals, saveTheme } from "@/db/settings";
import type { ThemePreference } from "@/theme/theme";
import { DEFAULT_SETTINGS, type AppSettings } from "@/types";

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  load(db: SQLiteDatabase): Promise<void>;
  saveGoals(db: SQLiteDatabase, goals: AppSettings["goals"]): Promise<void>;
  setTheme(db: SQLiteDatabase, theme: ThemePreference): Promise<void>;
}

/**
 * Settings are shared app-wide: the root
 * layout needs the theme and the
 * dashboard needs the goals, so they live in one global Zustand store.
 */
export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  async load(db) {
    try {
      set({ settings: await getSettings(db) });
    } catch {
      // If reading fails, the app still works on the default settings.
    }
    set({ loaded: true });
  },
  async saveGoals(db, goals) {
    await saveGoals(db, goals);
    set({ settings: { ...get().settings, goals } });
  },

  async setTheme(db, theme) {
    await saveTheme(db, theme);
    set({ settings: { ...get().settings, theme } });
  },
}));
