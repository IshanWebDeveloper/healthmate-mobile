import { niceMax } from '@/components/weekly-chart';
import { fillDays, goalProgress, lastNDays } from '@/utils/week';

const TODAY = new Date(2026, 9, 16, 10, 0, 0);

describe('lastNDays', () => {
  it('lists the last seven days ending today, oldest first', () => {
    expect(lastNDays(7, TODAY)).toEqual([
      '2026-10-10',
      '2026-10-11',
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
    ]);
  });

  it('crosses month boundaries', () => {
    expect(lastNDays(3, new Date(2026, 10, 1))).toEqual(['2026-10-30', '2026-10-31', '2026-11-01']);
  });
});

describe('fillDays', () => {
  it('fills days without entries with zero totals', () => {
    const summary = { date: '2026-10-15', steps: 5000, calories: 300, water: 1500, entryCount: 2 };

    expect(fillDays([summary], ['2026-10-14', '2026-10-15', '2026-10-16'])).toEqual([
      { date: '2026-10-14', steps: 0, calories: 0, water: 0, entryCount: 0 },
      summary,
      { date: '2026-10-16', steps: 0, calories: 0, water: 0, entryCount: 0 },
    ]);
  });
});

describe('niceMax', () => {
  it.each([
    [11550, 12000],
    [10500, 12000],
    [525, 600],
    [2100, 2400],
    [0, 4],
  ])('rounds %d up to %d', (peak, expected) => {
    expect(niceMax(peak)).toBe(expected);
  });
});

describe('goalProgress', () => {
  it.each([
    [5000, 10000, 0.5],
    [12000, 10000, 1],
    [0, 10000, 0],
    [100, 0, 0],
  ])('%d of %d is %d', (value, goal, expected) => {
    expect(goalProgress(value, goal)).toBe(expected);
  });
});
