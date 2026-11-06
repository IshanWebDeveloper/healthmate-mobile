import { Stack, ThemeProvider } from "expo-router";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";

import { resolveTheme, toNavigationTheme } from "@/theme/theme";
import { useSettingsStore } from "@/store/settings-store";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { DATABASE_NAME, initDatabase } from "@/db/database";

/** Loads the saved settings, then renders the app with the chosen theme. */
function ThemedApp() {
  const db = useSQLiteContext();
  const loaded = useSettingsStore((s) => s.loaded);
  const load = useSettingsStore((s) => s.load);
  const preference = useSettingsStore((s) => s.settings.theme);
  const theme = resolveTheme(preference, useColorScheme());

  useEffect(() => {
    void load(db);
  }, [db, load]);

  if (!loaded) return <LoadingScreen message="Loading your settings…" />;

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={toNavigationTheme(theme)}>
        <StatusBar style={theme.dark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="record/[id]"
            options={{ presentation: "modal", headerShown: true }}
          />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  // The OS theme styles the loading screen until the saved preference is known.
  const systemTheme = resolveTheme("system", useColorScheme());

  return (
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider theme={systemTheme}>
        <Suspense
          fallback={<LoadingScreen message="Preparing your health data…" />}
        >
          <SQLiteProvider
            databaseName={DATABASE_NAME}
            onInit={initDatabase}
            useSuspense
          >
            <ThemedApp />
          </SQLiteProvider>
        </Suspense>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
