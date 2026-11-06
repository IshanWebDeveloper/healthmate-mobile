import type { SQLiteDatabase } from 'expo-sqlite';

import { seedIfEmpty } from './seed';

export const DATABASE_NAME = 'healthmate.db';

/**
 * Passed to <SQLiteProvider onInit>, so it finishes before any screen renders.
 * Creates the tables on first launch and fills a fresh install with sample data.
 */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS health_records (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      date     TEXT    NOT NULL CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
      steps    INTEGER NOT NULL DEFAULT 0 CHECK (steps >= 0),
      calories INTEGER NOT NULL DEFAULT 0 CHECK (calories >= 0),
      water    INTEGER NOT NULL DEFAULT 0 CHECK (water >= 0)
    );
    CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records (date);

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  await seedIfEmpty(db);
}
