import Constants from "expo-constants";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  Card,
  HelperText,
  SegmentedButtons,
  Snackbar,
  Text,
} from "react-native-paper";

import { GoalsForm, toGoalsFormValues } from "@/components/goals-form";
import { useSettingsStore } from "@/store/settings-store";
import type { ThemePreference } from "@/theme/theme";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: string }[] =
  [
    { value: "system", label: "System", icon: "theme-light-dark" },
    { value: "light", label: "Light", icon: "white-balance-sunny" },
    { value: "dark", label: "Dark", icon: "weather-night" },
  ];

/** Settings: daily goals for the dashboard and the light/dark theme preference. */
export default function SettingsScreen() {
  const db = useSQLiteContext();
  const goals = useSettingsStore((s) => s.settings.goals);
  const theme = useSettingsStore((s) => s.settings.theme);
  const saveGoals = useSettingsStore((s) => s.saveGoals);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}

        <Card mode="outlined" style={styles.card}>
          <Card.Title
            title="Daily goals"
            subtitle="Your dashboard tracks progress against these"
          />
          <Card.Content>
            <GoalsForm
              defaultValues={toGoalsFormValues(goals)}
              onSubmit={async (values) => {
                await saveGoals(db, values);
                setSaved(true);
              }}
            />
          </Card.Content>
        </Card>

        <Card mode="outlined" style={styles.card}>
          <Card.Title
            title="Appearance"
            subtitle="System follows your phone’s dark mode setting"
          />
          <Card.Content>
            <SegmentedButtons
              value={theme}
              onValueChange={(v) =>
                setTheme(db, v as ThemePreference).then(
                  () => setError(null),
                  () => setError("Could not save the theme."),
                )
              }
              buttons={THEME_OPTIONS.map((o) => ({
                ...o,
                accessibilityLabel: `${o.label} theme`,
              }))}
            />
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.version}>
          HealthMate {Constants.expoConfig?.version ?? ""} · Data is stored only
          on this device
        </Text>
      </ScrollView>
      <Snackbar
        visible={saved}
        onDismiss={() => setSaved(false)}
        duration={3000}
      >
        Goals saved
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 16, paddingBottom: 48 },
  card: { borderRadius: 20 },
  version: { textAlign: "center", opacity: 0.6, marginTop: 8 },
});
