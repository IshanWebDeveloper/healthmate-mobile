import { subDays } from 'date-fns';
import type { SQLiteDatabase } from 'expo-sqlite';

import { toISODate } from '@/utils/date';

const SEED_DAYS = 21;

/** Random whole number between min and max (inclusive). */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Fills an empty database with one sample record per day for the last 21 days,
 * so the dashboard and records list have something to show on first launch.
 */
export async function seedIfEmpty(db: SQLiteDatabase): Promise<void> {
  // 1. Only seed when the table has no records yet.
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM health_records');
  if ((row?.count ?? 0) > 0) return;

  // 2. Insert one record per day, all in a single transaction.
  await db.withTransactionAsync(async () => {
    for (let daysAgo = SEED_DAYS - 1; daysAgo >= 0; daysAgo--) {
      const date = toISODate(subDays(new Date(), daysAgo));
      const steps = randomBetween(3500, 12500);
      const calories = randomBetween(1800, 2600);
      const water = randomBetween(1250, 3000);

      await db.runAsync('INSERT INTO health_records (date, steps, calories, water) VALUES (?, ?, ?, ?)', [
        date,
        steps,
        calories,
        water,
      ]);
    }
  });
}
