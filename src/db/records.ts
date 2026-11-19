import type { SQLiteDatabase } from 'expo-sqlite';

import type { DailyTotals, HealthRecord, HealthRecordInput } from '@/types';

// Every value reaches SQLite as a bound `?` parameter, never by string
// concatenation, so user input cannot change a query (SQL injection).

/** All records, newest first. Pass `from`/`to` (inclusive, `yyyy-MM-dd`) to filter by date. */
export async function getRecords(db: SQLiteDatabase, from?: string, to?: string): Promise<HealthRecord[]> {
  const conditions: string[] = [];
  const params: string[] = [];
  if (from) {
    conditions.push('date >= ?');
    params.push(from);
  }
  if (to) {
    conditions.push('date <= ?');
    params.push(to);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  return db.getAllAsync<HealthRecord>(
    `SELECT id, date, steps, calories, water FROM health_records ${where} ORDER BY date DESC, id DESC`,
    params,
  );
}

export async function getRecord(db: SQLiteDatabase, id: number): Promise<HealthRecord | null> {
  return db.getFirstAsync<HealthRecord>('SELECT id, date, steps, calories, water FROM health_records WHERE id = ?', [id]);
}

export async function addRecord(db: SQLiteDatabase, record: HealthRecordInput): Promise<void> {
  await db.runAsync('INSERT INTO health_records (date, steps, calories, water) VALUES (?, ?, ?, ?)', [
    record.date,
    record.steps,
    record.calories,
    record.water,
  ]);
}

/** Returns false if no record has that id (e.g. it was deleted in the meantime). */
export async function updateRecord(db: SQLiteDatabase, id: number, record: HealthRecordInput): Promise<boolean> {
  const result = await db.runAsync('UPDATE health_records SET date = ?, steps = ?, calories = ?, water = ? WHERE id = ?', [
    record.date,
    record.steps,
    record.calories,
    record.water,
    id,
  ]);
  return result.changes > 0;
}

/** Returns false if no record has that id. */
export async function deleteRecord(db: SQLiteDatabase, id: number): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM health_records WHERE id = ?', [id]);
  return result.changes > 0;
}

/** One row of totals per day that has entries, oldest first, between `from` and `to` inclusive. */
export async function getDailyTotals(db: SQLiteDatabase, from: string, to: string): Promise<DailyTotals[]> {
  return db.getAllAsync<DailyTotals>(
    `SELECT date,
            SUM(steps) AS steps, SUM(calories) AS calories, SUM(water) AS water,
            COUNT(*) AS entryCount
       FROM health_records
      WHERE date BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date ASC`,
    [from, to],
  );
}
