import { defaultCustomRange, presetToRange } from '@/utils/date-range';

const TODAY = new Date(2026, 9, 16, 10, 0, 0); // 16 Oct 2026

describe('presetToRange', () => {
  it.each([
    ['all', {}],
    ['today', { from: '2026-10-16', to: '2026-10-16' }],
    ['7d', { from: '2026-10-10', to: '2026-10-16' }],
    ['30d', { from: '2026-09-17', to: '2026-10-16' }],
  ] as const)('%s resolves to %j', (preset, expected) => {
    expect(presetToRange(preset, TODAY)).toEqual(expected);
  });

  it('crosses month and year boundaries correctly', () => {
    expect(presetToRange('7d', new Date(2026, 2, 3))).toEqual({ from: '2026-02-25', to: '2026-03-03' });
    expect(presetToRange('7d', new Date(2027, 0, 2))).toEqual({ from: '2026-12-27', to: '2027-01-02' });
  });

  it('uses the given custom range, or the last 7 days by default', () => {
    expect(presetToRange('custom', TODAY, { from: '2026-09-01', to: '2026-09-10' })).toEqual({
      from: '2026-09-01',
      to: '2026-09-10',
    });
    expect(presetToRange('custom', TODAY)).toEqual(defaultCustomRange(TODAY));
  });

  it('accepts a single-day custom range', () => {
    expect(presetToRange('custom', TODAY, { from: '2026-10-01', to: '2026-10-01' })).toEqual({
      from: '2026-10-01',
      to: '2026-10-01',
    });
  });

  it('rejects reversed or malformed custom ranges', () => {
    expect(() => presetToRange('custom', TODAY, { from: '2026-10-10', to: '2026-10-01' })).toThrow(
      'Start date must be on or before the end date',
    );
    expect(() => presetToRange('custom', TODAY, { from: '2026-02-30', to: '2026-03-01' })).toThrow(
      'Choose a valid start and end date',
    );
  });
});
