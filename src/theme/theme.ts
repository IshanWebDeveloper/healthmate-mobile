import {
  DarkTheme as NavDark,
  DefaultTheme as NavLight,
  type Theme as NavTheme,
} from "expo-router";
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from "react-native-paper";

/**
 * Semantic colours for each metric, used consistently on cards, list rows,
 * form fields and charts: water = blue, calories = red, steps = green.
 */
export interface MetricPalette {
  steps: string;
  calories: string;
  water: string;
  stepsContainer: string;
  caloriesContainer: string;
  waterContainer: string;
}

export type AppTheme = MD3Theme & { metrics: MetricPalette };

const lightMetrics: MetricPalette = {
  steps: "#2E7D32",
  calories: "#D32F2F",
  water: "#1565C0",
  stepsContainer: "#E3F2E4",
  caloriesContainer: "#FDE7E7",
  waterContainer: "#E3EEFB",
};

const darkMetrics: MetricPalette = {
  steps: "#81C784",
  calories: "#EF9A9A",
  water: "#90CAF9",
  stepsContainer: "#1F3321",
  caloriesContainer: "#3D2222",
  waterContainer: "#1C2D42",
};

export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#00796B",
    onPrimary: "#FFFFFF",
    primaryContainer: "#B2DFDB",
    onPrimaryContainer: "#00201C",
    secondary: "#4A635F",
    secondaryContainer: "#CCE8E3",
    onSecondaryContainer: "#05201C",
    background: "#F7FAF9",
    surface: "#F7FAF9",
    // Teal-tinted surfaces; Paper's defaults are derived from its purple seed colour.
    elevation: {
      level0: "transparent",
      level1: "#EEF5F3",
      level2: "#E8F1EF",
      level3: "#E2EDEA",
      level4: "#E0ECE9",
      level5: "#DCE9E6",
    },
  },
  metrics: lightMetrics,
};

export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4DB6AC",
    onPrimary: "#00382F",
    primaryContainer: "#005048",
    onPrimaryContainer: "#B2DFDB",
    secondary: "#B1CCC7",
    secondaryContainer: "#334B47",
    onSecondaryContainer: "#CCE8E3",
    background: "#101413",
    surface: "#101413",
    elevation: {
      level0: "transparent",
      level1: "#161D1C",
      level2: "#1A2221",
      level3: "#1E2726",
      level4: "#1F2928",
      level5: "#222D2B",
    },
  },
  metrics: darkMetrics,
};

export type ThemePreference = "system" | "light" | "dark";

/** Picks the theme to render: an explicit preference wins over the OS setting. */
export function resolveTheme(
  preference: ThemePreference,
  systemScheme: string | null | undefined,
): AppTheme {
  const dark =
    preference === "system" ? systemScheme === "dark" : preference === "dark";
  return dark ? darkTheme : lightTheme;
}

/** Keeps headers and tab bars in sync with the Paper theme. */
export function toNavigationTheme(theme: AppTheme): NavTheme {
  const base = theme.dark ? NavDark : NavLight;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.elevation.level2,
      text: theme.colors.onSurface,
      border: theme.colors.outlineVariant,
    },
  };
}
