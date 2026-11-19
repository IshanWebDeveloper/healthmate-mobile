import { subDays } from 'date-fns';

import { isValidISODate, toISODate } from '@/utils/date';

export type FilterPreset = 'all' | 'today' | '7d' | '30d' | 'custom';

export interface DateRange {
  from: string;
  to: string;
}

export const FILTER_PRESETS: readonly { value: FilterPreset; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom' },
];

/** Default custom range: the last 7 days, so switching to Custom shows data straight away. */
export function defaultCustomRange(today: Date = new Date()): DateRange {
  return { from: toISODate(subDays(today, 6)), to: toISODate(today) };
}

/**
 * Turns a filter preset into the inclusive date range getRecords() expects.
 * "Last 7 days" includes today, so it starts 6 days back.
 */
export function presetToRange(
  preset: FilterPreset,
  today: Date = new Date(),
  custom?: DateRange,
): { from?: string; to?: string } {
  const todayISO = toISODate(today);

  switch (preset) {
    case 'all':
      return {};
    case 'today':
      return { from: todayISO, to: todayISO };
    case '7d':
      return { from: toISODate(subDays(today, 6)), to: todayISO };
    case '30d':
      return { from: toISODate(subDays(today, 29)), to: todayISO };
    case 'custom': {
      const range = custom ?? defaultCustomRange(today);
      if (!isValidISODate(range.from) || !isValidISODate(range.to)) {
        throw new RangeError('Choose a valid start and end date');
      }
      if (range.from > range.to) {
        throw new RangeError('Start date must be on or before the end date');
      }
      return { from: range.from, to: range.to };
    }
  }
}
