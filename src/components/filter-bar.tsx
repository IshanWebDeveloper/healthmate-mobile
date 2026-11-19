import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { Chip } from 'react-native-paper';

import { DateField } from '@/components/date-field';
import { parseISODate } from '@/utils/date';
import { FILTER_PRESETS, type DateRange, type FilterPreset } from '@/utils/date-range';

interface FilterBarProps {
  preset: FilterPreset;
  custom: DateRange;
  onPresetChange(preset: FilterPreset): void;
  onCustomChange(range: DateRange): void;
}

/** Quick date presets, plus From/To pickers when "Custom" is selected. */
export function FilterBar({ preset, custom, onPresetChange, onCustomChange }: FilterBarProps) {
  const today = new Date();
  const chipsRef = useRef<ScrollViewInstance>(null);

  // "Custom" is the last chip and can sit off-screen; bring it into view when it's selected (e.g. from the header's calendar icon).
  useEffect(() => {
    if (preset === 'custom') chipsRef.current?.scrollToEnd({ animated: true });
  }, [preset]);

  return (
    <View style={styles.container}>
      <ScrollView ref={chipsRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FILTER_PRESETS.map((p) => (
          <Chip
            key={p.value}
            selected={preset === p.value}
            showSelectedOverlay
            onPress={() => onPresetChange(p.value)}
            accessibilityState={{ selected: preset === p.value }}
          >
            {p.label}
          </Chip>
        ))}
      </ScrollView>

      {preset === 'custom' ? (
        <View style={styles.range}>
          <View style={styles.flex}>
            <DateField
              label="From"
              value={custom.from}
              maximumDate={parseISODate(custom.to) ?? today}
              onChange={(from) => onCustomChange({ ...custom, from })}
            />
          </View>
          <View style={styles.flex}>
            <DateField
              label="To"
              value={custom.to}
              minimumDate={parseISODate(custom.from) ?? undefined}
              maximumDate={today}
              onChange={(to) => onCustomChange({ ...custom, to })}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, paddingBottom: 12 },
  chips: { gap: 8, paddingHorizontal: 16 },
  range: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  flex: { flex: 1 },
});
