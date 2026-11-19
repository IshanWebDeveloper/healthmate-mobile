import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, ProgressBar, Text } from 'react-native-paper';

import { useAppTheme } from '@/theme/use-app-theme';

export type Metric = 'steps' | 'calories' | 'water';

export const METRIC_META: Record<
  Metric,
  { label: string; unit: string; icon: ComponentProps<typeof MaterialCommunityIcons>['name'] }
> = {
  steps: { label: 'Steps', unit: 'steps', icon: 'shoe-print' },
  calories: { label: 'Calories burned', unit: 'kcal', icon: 'fire' },
  water: { label: 'Water intake', unit: 'ml', icon: 'water' },
};

interface MetricCardProps {
  metric: Metric;
  value: number;
  /** Daily target; when set, the card shows progress towards it. */
  goal?: number;
}

/** Colour-coded summary tile for one metric, with optional progress towards a daily goal. */
export function MetricCard({ metric, value, goal }: MetricCardProps) {
  const theme = useAppTheme();
  const meta = METRIC_META[metric];
  const color = theme.metrics[metric];
  const container = theme.metrics[`${metric}Container`];
  const formatted = value.toLocaleString('en-US');

  const hasGoal = goal !== undefined && goal > 0;
  const fraction = hasGoal ? Math.min(value / goal, 1) : 0;
  const percent = hasGoal ? Math.round((value / goal) * 100) : 0;
  const goalText = hasGoal
    ? value >= goal
      ? `Goal of ${goal.toLocaleString('en-US')} reached`
      : `${percent}% of ${goal.toLocaleString('en-US')} ${meta.unit} goal`
    : null;

  return (
    <Card
      mode="contained"
      style={[styles.card, { backgroundColor: container }]}
      accessible
      accessibilityLabel={`${meta.label}: ${formatted} ${meta.unit}${goalText ? `. ${goalText}` : ''}`}
    >
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: color }]}>
            <MaterialCommunityIcons name={meta.icon} size={24} color={theme.colors.surface} />
          </View>
          <View style={styles.text}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {meta.label}
            </Text>
            <Text variant="headlineMedium" style={{ color, fontWeight: '700' }}>
              {formatted}{' '}
              <Text variant="titleSmall" style={{ color }}>
                {meta.unit}
              </Text>
            </Text>
          </View>
        </View>
        {goalText ? (
          <View style={styles.goal}>
            <ProgressBar progress={fraction} color={color} style={[styles.bar, { backgroundColor: `${color}33` }]} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {goalText}
            </Text>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20 },
  content: { gap: 12, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  goal: { gap: 6 },
  bar: { height: 8, borderRadius: 4 },
});
