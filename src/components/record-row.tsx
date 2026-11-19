import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Text, TouchableRipple } from "react-native-paper";

import { useAppTheme } from "@/theme/use-app-theme";
import type { HealthRecord } from "@/types";
import { formatShortDate } from "@/utils/date";

interface RecordRowProps {
  record: HealthRecord;
  onPress(): void;
  onDelete(): void;
}

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const formatNumber = (value: number) => value.toLocaleString("en-US");

/** One health entry: its date, the three metrics (each icon in its semantic colour) and a chevron. Swipe left to reveal Delete. */
export function RecordRow({ record, onPress, onDelete }: RecordRowProps) {
  const theme = useAppTheme();
  const metrics: {
    icon: IconName;
    value: string;
    color: string;
    label: string;
  }[] = [
    {
      icon: "shoe-print",
      value: `${formatNumber(record.steps)} steps`,
      color: theme.metrics.steps,
      label: "steps",
    },
    {
      icon: "fire",
      value: `${formatNumber(record.calories)} kcal`,
      color: theme.metrics.calories,
      label: "calories burned",
    },
    {
      icon: "water",
      value: `${formatNumber(record.water)} ml`,
      color: theme.metrics.water,
      label: "water",
    },
  ];

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={(_progress, _translation, swipeable) => (
        <TouchableRipple
          onPress={() => {
            swipeable.close();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel="Delete record"
          style={[styles.deleteAction, { backgroundColor: theme.colors.error }]}
        >
          <View style={styles.deleteContent}>
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={theme.colors.onError}
            />
            <Text variant="labelLarge" style={{ color: theme.colors.onError }}>
              Delete
            </Text>
          </View>
        </TouchableRipple>
      )}
    >
      <TouchableRipple
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${formatShortDate(record.date)}: ${record.steps} steps, ${record.calories} kilocalories, ${record.water} millilitres`}
        accessibilityHint="Opens the record to edit. Swipe left to delete."
        accessibilityActions={[{ name: "delete", label: "Delete record" }]}
        onAccessibilityAction={(e) =>
          e.nativeEvent.actionName === "delete" && onDelete()
        }
        style={[
          styles.row,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.text}>
            <Text variant="titleMedium">{formatShortDate(record.date)}</Text>
            <View style={styles.metrics}>
              {metrics.map((m) => (
                <View key={m.label} style={styles.metric}>
                  <MaterialCommunityIcons
                    name={m.icon}
                    size={16}
                    color={m.color}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {m.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </TouchableRipple>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: { flexDirection: "row", alignItems: "center", gap: 12 },
  text: { flex: 1, gap: 4 },
  metrics: { flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 2 },
  metric: { flexDirection: "row", alignItems: "center", gap: 4 },
  deleteAction: { width: 112, justifyContent: "center" },
  deleteContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
