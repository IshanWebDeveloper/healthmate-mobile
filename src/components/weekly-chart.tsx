import { format } from 'date-fns';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Card, SegmentedButtons, Text } from 'react-native-paper';

import { METRIC_META, type Metric } from '@/components/metric-card';
import { useAppTheme } from '@/theme/use-app-theme';
import type { DailyGoals, DailyTotals } from '@/types';
import { parseISODate } from '@/utils/date';

const CHART_HEIGHT = 180;
const Y_AXIS_WIDTH = 40;

interface WeeklyChartProps {
  week: readonly DailyTotals[];
  goals: DailyGoals;
}

const dayLabel = (date: string) => {
  const parsed = parseISODate(date);
  return parsed ? format(parsed, 'EEE') : date;
};

const compact = (value: number) => (value >= 1000 ? `${Math.round(value / 100) / 10}k` : String(value));

const SECTIONS = 4;

const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/** Rounds the axis top up so each gridline lands on a round number (e.g. 3k steps, 150 kcal). */
export function niceMax(peak: number, sections = SECTIONS): number {
  if (peak <= 0) return sections;
  const raw = peak / sections;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = NICE_STEPS.map((m) => m * magnitude).find((s) => s >= raw) ?? 10 * magnitude;
  return step * sections;
}

/** Below-goal bars use the metric colour at reduced opacity so they still meet 3:1 contrast. */
const belowGoal = (hex: string) => `${hex}8C`;

/**
 * 7-day bar chart for one metric at a time, with the daily goal as a dashed
 * line. The SVG chart isn't readable by screen readers, so the card carries a
 * text summary of every bar as its accessibility label.
 */
export function WeeklyChart({ week, goals }: WeeklyChartProps) {
  const theme = useAppTheme();
  const [metric, setMetric] = useState<Metric>('steps');
  const [width, setWidth] = useState(0);

  const meta = METRIC_META[metric];
  const color = theme.metrics[metric];
  const goal = goals[metric];
  const maxValue = niceMax(Math.max(goal, ...week.map((d) => d[metric])) * 1.05);

  const plotWidth = Math.max(width - Y_AXIS_WIDTH - 16, 0);
  const slot = week.length ? plotWidth / week.length : 0;
  const barWidth = Math.max(Math.floor(slot * 0.6), 4);
  const spacing = Math.max(Math.floor(slot - barWidth), 2);

  const data = week.map((d) => ({
    value: d[metric],
    label: dayLabel(d.date),
    frontColor: d[metric] >= goal ? color : belowGoal(color),
    labelTextStyle: { color: theme.colors.onSurfaceVariant, fontSize: 11 },
  }));

  const summary = week
    .map((d) => `${dayLabel(d.date)} ${d[metric].toLocaleString('en-US')}`)
    .join(', ');
  const daysMet = week.filter((d) => d[metric] >= goal).length;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleMedium" accessibilityRole="header">
            Last 7 days
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {meta.label} goal met on {daysMet} of {week.length} days
          </Text>
        </View>

        <SegmentedButtons
          value={metric}
          onValueChange={(v) => setMetric(v as Metric)}
          density="small"
          buttons={(Object.keys(METRIC_META) as Metric[]).map((m) => ({
            value: m,
            label: METRIC_META[m].label.split(' ')[0]!,
            icon: METRIC_META[m].icon,
            accessibilityLabel: `Show ${METRIC_META[m].label.toLowerCase()}`,
          }))}
        />

        <View
          onLayout={onLayout}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`${meta.label} per day, in ${meta.unit}: ${summary}. Daily goal ${goal.toLocaleString('en-US')}.`}
          testID="weekly-chart"
        >
          {width > 0 && week.length > 0 ? (
            <BarChart
              data={data}
              height={CHART_HEIGHT}
              width={plotWidth}
              maxValue={maxValue}
              noOfSections={SECTIONS}
              barWidth={barWidth}
              spacing={spacing}
              initialSpacing={spacing / 2}
              barBorderRadius={4}
              yAxisLabelWidth={Y_AXIS_WIDTH}
              formatYLabel={(label) => compact(Number(label))}
              yAxisTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 11 }}
              yAxisThickness={0}
              xAxisColor={theme.colors.outlineVariant}
              rulesColor={theme.colors.outlineVariant}
              showReferenceLine1
              referenceLine1Position={goal}
              referenceLine1Config={{ color, dashWidth: 6, dashGap: 4, thickness: 1.5 }}
              disableScroll
              disablePress
              isAnimated
            />
          ) : (
            <View style={{ height: CHART_HEIGHT }} />
          )}
        </View>

        <View style={styles.legend}>
          <View style={[styles.swatch, { backgroundColor: color }]} />
          <Text variant="bodySmall">Goal met</Text>
          <View style={[styles.swatch, { backgroundColor: belowGoal(color) }]} />
          <Text variant="bodySmall">Below goal</Text>
          <View style={[styles.dash, { borderColor: color }]} />
          <Text variant="bodySmall">
            Goal ({goal.toLocaleString('en-US')} {meta.unit})
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20 },
  content: { gap: 12 },
  header: { gap: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 4 },
  swatch: { width: 12, height: 12, borderRadius: 3, marginLeft: 6 },
  dash: { width: 16, borderTopWidth: 2, borderStyle: 'dashed', marginLeft: 6 },
});
