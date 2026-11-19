import { format, startOfWeek, subWeeks } from 'date-fns';

import type { HealthRecord } from '@/types';
import { parseISODate, toISODate, todayISO } from '@/utils/date';

export interface RecordSection {
  /** Section header, e.g. "Today", "This week", "Last week" or "September 2026". */
  title: string;
  data: HealthRecord[];
}

/** Which header a record's date falls under. Weeks start on Monday. */
function periodTitle(date: string, now: Date): string {
  const thisWeek = startOfWeek(now, { weekStartsOn: 1 });
  if (date === todayISO(now)) return 'Today';
  if (date >= toISODate(thisWeek)) return 'This week';
  if (date >= toISODate(subWeeks(thisWeek, 1))) return 'Last week';
  const parsed = parseISODate(date);
  return parsed ? format(parsed, 'MMMM yyyy') : date;
}

/**
 * Groups an already-sorted (newest first) list into Today / This week /
 * Last week / one section per older month, preserving order. Used by the
 * SectionList on the Records screen.
 */
export function groupRecordsByPeriod(records: readonly HealthRecord[], now: Date = new Date()): RecordSection[] {
  const sections: RecordSection[] = [];
  for (const record of records) {
    const title = periodTitle(record.date, now);
    const last = sections[sections.length - 1];
    if (last && last.title === title) {
      last.data.push(record);
    } else {
      sections.push({ title, data: [record] });
    }
  }
  return sections;
}
