import { initDatabase } from '@/db/database';
import { getSettings, saveGoals, saveTheme } from '@/db/settings';
import { createTestDb, type TestDb } from '@/test/test-db';
import { DEFAULT_SETTINGS } from '@/types';

describe('settings database functions', () => {
  let t: TestDb;

  beforeEach(async () => {
    t = createTestDb();
    await initDatabase(t.db);
  });
  afterEach(() => t.close());

  it('returns the defaults before anything is saved', async () => {
    expect(await getSettings(t.db)).toEqual(DEFAULT_SETTINGS);
  });

  it('saves and reloads goals and theme', async () => {
    await saveGoals(t.db, { steps: 8000, calories: 400, water: 2500 });
    await saveTheme(t.db, 'dark');

    expect(await getSettings(t.db)).toEqual({ goals: { steps: 8000, calories: 400, water: 2500 }, theme: 'dark' });
  });

  it('overwrites a previous value instead of adding a duplicate row', async () => {
    await saveTheme(t.db, 'dark');
    await saveTheme(t.db, 'light');

    const rows = await t.db.getAllAsync<{ key: string }>("SELECT key FROM settings WHERE key = 'theme'");
    expect(rows).toHaveLength(1);
    expect((await getSettings(t.db)).theme).toBe('light');
  });

  it('falls back to defaults for corrupted values', async () => {
    await t.db.runAsync("INSERT INTO settings (key, value) VALUES ('goal.steps', 'abc'), ('theme', 'purple')");
    expect(await getSettings(t.db)).toEqual(DEFAULT_SETTINGS);
  });
});
