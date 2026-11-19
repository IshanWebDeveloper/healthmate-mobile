import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getDailyTotals } from '@/db/records';
import { useSettingsStore } from '@/store/settings-store';
import type { DailyTotals } from '@/types';
import { fillDays, lastNDays } from '@/utils/week';

const CHART_DAYS = 7;

/** ViewModel for the Dashboard: the last 7 days of totals, today's totals and the user's goals. */
export function useDashboard() {
  const db = useSQLiteContext();
  const goals = useSettingsStore((s) => s.settings.goals);
  const [week, setWeek] = useState<DailyTotals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const dates = lastNDays(CHART_DAYS);
    try {
      const totals = await getDailyTotals(db, dates[0]!, dates[dates.length - 1]!);
      setWeek(fillDays(totals, dates));
      setError(null);
    } catch {
      setError('Could not load today’s summary.');
    }
    setLoading(false);
  }, [db]);

  // The last day in the week is today.
  const today = week[week.length - 1];

  return { week, today, entries: today?.entryCount ?? 0, goals, loading, error, load };
}
