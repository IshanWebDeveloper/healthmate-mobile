import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, SectionList, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router/js-tabs";
import {
  ActivityIndicator,
  FAB,
  HelperText,
  IconButton,
  Snackbar,
  Text,
} from "react-native-paper";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { RecordRow } from "@/components/record-row";
import { useRecords } from "@/hooks/use-records";
import { useAppTheme } from "@/theme/use-app-theme";
import { groupRecordsByPeriod } from "@/utils/group-records";

const openRecord = (id: number | "new") =>
  router.push({ pathname: "/record/[id]", params: { id: String(id) } });

/** Records list grouped by period (Today, This week, ...), with date filters and delete + undo. State and actions live in useRecords(). */
export default function RecordsScreen() {
  const theme = useAppTheme();
  const {
    records,
    loading,
    error,
    preset,
    custom,
    pendingDelete,
    lastDeleted,
    load,
    setPreset,
    setCustomRange,
    clearFilter,
    requestDelete,
    cancelDelete,
    confirmDelete,
    undoDelete,
    dismissUndo,
  } = useRecords();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const sections = useMemo(() => groupRecordsByPeriod(records), [records]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* The calendar icon jumps straight to a custom From/To range. */}
      <Tabs.Screen
        options={{
          headerRight: () => (
            <IconButton
              icon="calendar-range"
              selected={preset === "custom"}
              onPress={() => setPreset("custom")}
              accessibilityLabel="Choose a date range"
            />
          ),
        }}
      />
      <FilterBar
        preset={preset}
        custom={custom}
        onPresetChange={setPreset}
        onCustomChange={setCustomRange}
      />
      {error ? (
        <HelperText type="error" visible style={styles.error}>
          {error}
        </HelperText>
      ) : null}

      <SectionList
        sections={sections.map((s) => ({ ...s, key: s.title }))}
        keyExtractor={(item) => String(item.id)}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <Text
            variant="labelMedium"
            style={[
              styles.header,
              {
                backgroundColor: theme.colors.surfaceVariant,
                color: theme.colors.onSurfaceVariant,
              },
            ]}
            accessibilityRole="header"
          >
            {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={({ item }) => (
          <RecordRow
            record={item}
            onPress={() => openRecord(item.id)}
            onDelete={() => requestDelete(item)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loading} />
          ) : preset !== "all" ? (
            <EmptyState
              icon="calendar-search"
              title="No records in this range"
              message="Try a different date range, or add a record for one of these days."
              actionLabel="Clear filter"
              onAction={clearFilter}
            />
          ) : (
            <EmptyState
              icon="clipboard-text-outline"
              title="No records yet"
              message="Log your steps, calories and water to start building your history."
              actionLabel="Add your first record"
              onAction={() => openRecord("new")}
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => openRecord("new")}
        accessibilityLabel="Add record"
      />
      <ConfirmDialog
        visible={!!pendingDelete}
        title="Delete this record?"
        message="You can undo this straight after."
        confirmLabel="Delete"
        onConfirm={() => void confirmDelete()}
        onDismiss={cancelDelete}
      />
      <Snackbar
        visible={!!lastDeleted}
        onDismiss={dismissUndo}
        duration={5000}
        action={{ label: "Undo", onPress: () => void undoDelete() }}
      >
        Record deleted
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  error: { paddingHorizontal: 16 },
  header: { paddingHorizontal: 16, paddingVertical: 6, letterSpacing: 0.5 },
  list: { paddingBottom: 96, flexGrow: 1 },
  loading: { marginTop: 48 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
