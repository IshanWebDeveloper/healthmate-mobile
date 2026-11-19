import type { HealthRecord } from '@/types';
import { groupRecordsByPeriod } from '@/utils/group-records';

const record = (id: number, date: string): HealthRecord => ({
  id,
  date,
  steps: 0,
  calories: 0,
  water: 0,
});

// Friday 16 October 2026; that week starts on Monday 12 October.
const NOW = new Date(2026, 9, 16, 12);

describe('groupRecordsByPeriod', () => {
  it('returns no sections for an empty list', () => {
    expect(groupRecordsByPeriod([], NOW)).toEqual([]);
  });

  it('groups into today, this week, last week and older months, keeping order', () => {
    const sections = groupRecordsByPeriod(
      [
        record(9, '2026-10-16'),
        record(8, '2026-10-16'),
        record(7, '2026-10-15'),
        record(6, '2026-10-12'), // Monday: still this week
        record(5, '2026-10-11'), // Sunday: last week
        record(4, '2026-10-05'),
        record(3, '2026-10-04'), // before last week, same month
        record(2, '2026-09-30'),
        record(1, '2025-12-31'),
      ],
      NOW,
    );

    expect(sections.map((s) => [s.title, s.data.map((r) => r.id)])).toEqual([
      ['Today', [9, 8]],
      ['This week', [7, 6]],
      ['Last week', [5, 4]],
      ['October 2026', [3]],
      ['September 2026', [2]],
      ['December 2025', [1]],
    ]);
  });

  it('starts with This week when nothing is logged today', () => {
    expect(groupRecordsByPeriod([record(1, '2026-10-14')], NOW).map((s) => s.title)).toEqual(['This week']);
  });
});
