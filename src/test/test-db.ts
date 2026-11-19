/// <reference types="node" />
import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Test-only stand-in for expo-sqlite's SQLiteDatabase, backed by Node's built-in
 * SQLite (Node >= 22.13) in memory. It implements just the methods the app's
 * db functions use, so tests run the app's real SQL against a real database.
 * Loaded with getBuiltinModule so Jest's module resolver never sees `node:sqlite`.
 */
const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as typeof import('node:sqlite');

type Param = string | number | null;

export interface TestDb {
  db: SQLiteDatabase;
  close(): void;
}

export function createTestDb(): TestDb {
  const sqlite = new DatabaseSync(':memory:');

  const db = {
    async execAsync(sql: string) {
      sqlite.exec(sql);
    },
    async runAsync(sql: string, params: Param[] = []) {
      const result = sqlite.prepare(sql).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    async getAllAsync(sql: string, params: Param[] = []) {
      return sqlite.prepare(sql).all(...params);
    },
    async getFirstAsync(sql: string, params: Param[] = []) {
      return sqlite.prepare(sql).get(...params) ?? null;
    },
    async withTransactionAsync(task: () => Promise<void>) {
      sqlite.exec('BEGIN');
      try {
        await task();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };

  return { db: db as unknown as SQLiteDatabase, close: () => sqlite.close() };
}
