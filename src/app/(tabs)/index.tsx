import { MetricCard } from "@/components/metric-card";
import { WeeklyChart } from "@/components/weekly-chart";
import { useDashboard } from "@/hooks/use-dashboard";
import { formatLongDate, todayISO } from "@/utils/date";

import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  FAB,
  HelperText,
  Text,
} from "react-native-paper";

const DashboardScreen = () => {
  const { week, today, entries, goals, loading, error, load } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  // Reload whenever the tab gains focus, e.g. after adding a record or changing goals.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text variant="titleMedium" accessibilityRole="header">
          {formatLongDate(todayISO())}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {entries
            ? `${entries} ${entries === 1 ? "entry" : "entries"} logged today`
            : "Nothing logged yet today"}
        </Text>

        {error ? (
          <View style={styles.error}>
            <HelperText type="error" visible>
              {error}
            </HelperText>
            <Button mode="text" onPress={() => void load()}>
              Try again
            </Button>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator
            style={styles.loading}
            accessibilityLabel="Loading today’s summary"
          />
        ) : (
          <>
            <MetricCard
              metric="steps"
              value={today?.steps ?? 0}
              goal={goals.steps}
            />
            <MetricCard
              metric="calories"
              value={today?.calories ?? 0}
              goal={goals.calories}
            />
            <MetricCard
              metric="water"
              value={today?.water ?? 0}
              goal={goals.water}
            />
            {week.length ? <WeeklyChart week={week} goals={goals} /> : null}
          </>
        )}
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        accessibilityLabel="Add record"
        onPress={() =>
          router.push({ pathname: "/record/[id]", params: { id: "new" } })
        }
      />
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 12, paddingBottom: 96 },
  subtitle: { opacity: 0.7, marginBottom: 8 },
  error: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loading: { marginTop: 48 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
