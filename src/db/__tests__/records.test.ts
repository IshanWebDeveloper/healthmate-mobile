import { initDatabase } from '@/db/database';
import { addRecord, deleteRecord, getDailyTotals, getRecord, getRecords, updateRecord } from '@/db/records';
import { createTestDb, type TestDb } from '@/test/test-db';
import type { HealthRecordInput } from '@/types';

const entry = (date: string, steps = 1000, calories = 100, water = 500): HealthRecordInput => ({
  date,
  steps,
  calories,
  water,
});

describe('records database functions', () => {
  let t: TestDb;

  beforeEach(async () => {
    t = createTestDb();
    await initDatabase(t.db);
    // initDatabase seeds sample data; start each test from an empty table.
    await t.db.execAsync('DELETE FROM health_records');
  });
  afterEach(() => t.close());

  it('adds a record and reads it back', async () => {
    await addRecord(t.db, entry('2026-10-15', 7850, 420, 2000));

    const [record] = await getRecords(t.db);
    expect(record).toMatchObject({ date: '2026-10-15', steps: 7850, calories: 420, water: 2000 });
    expect(await getRecord(t.db, record!.id)).toEqual(record);
  });

  it('returns records newest first', async () => {
    await addRecord(t.db, entry('2026-10-10'));
    await addRecord(t.db, entry('2026-10-14'));
    await addRecord(t.db, entry('2026-10-12'));

    expect((await getRecords(t.db)).map((r) => r.date)).toEqual(['2026-10-14', '2026-10-12', '2026-10-10']);
  });

  it('filters by a single date and by an inclusive range', async () => {
    for (const date of ['2026-10-10', '2026-10-12', '2026-10-12', '2026-10-14']) await addRecord(t.db, entry(date));

    expect(await getRecords(t.db, '2026-10-12', '2026-10-12')).toHaveLength(2);
    expect(await getRecords(t.db, '2026-10-11', '2026-10-14')).toHaveLength(3);
    expect(await getRecords(t.db, '2026-10-13')).toHaveLength(1);
    expect(await getRecords(t.db, undefined, '2026-10-11')).toHaveLength(1);
  });

  it('treats filter values as data, not SQL', async () => {
    await addRecord(t.db, entry('2026-10-10'));
    await getRecords(t.db, "2026-10-10'; DROP TABLE health_records; --");
    expect(await getRecords(t.db)).toHaveLength(1);
  });

  it('updates a record', async () => {
    await addRecord(t.db, entry('2026-10-15'));
    const [record] = await getRecords(t.db);

    expect(await updateRecord(t.db, record!.id, entry('2026-10-14', 9000, 450, 2500))).toBe(true);
    expect(await getRecord(t.db, record!.id)).toEqual({ id: record!.id, ...entry('2026-10-14', 9000, 450, 2500) });
  });

  it('reports when there is nothing to update or delete', async () => {
    expect(await updateRecord(t.db, 999, entry('2026-10-15'))).toBe(false);
    expect(await deleteRecord(t.db, 999)).toBe(false);
  });

  it('deletes only the given record', async () => {
    await addRecord(t.db, entry('2026-10-15'));
    await addRecord(t.db, entry('2026-10-15'));
    const [first, second] = await getRecords(t.db);

    expect(await deleteRecord(t.db, first!.id)).toBe(true);
    expect(await getRecord(t.db, first!.id)).toBeNull();
    expect(await getRecord(t.db, second!.id)).not.toBeNull();
  });

  it('sums every entry per day for the dashboard', async () => {
    await addRecord(t.db, entry('2026-10-16', 4000, 200, 750));
    await addRecord(t.db, entry('2026-10-16', 3850, 220, 1250));
    await addRecord(t.db, entry('2026-10-14', 6000, 300, 1500));
    await addRecord(t.db, entry('2026-10-01', 9999, 999, 999)); // outside the range

    expect(await getDailyTotals(t.db, '2026-10-10', '2026-10-16')).toEqual([
      { date: '2026-10-14', steps: 6000, calories: 300, water: 1500, entryCount: 1 },
      { date: '2026-10-16', steps: 7850, calories: 420, water: 2000, entryCount: 2 },
    ]);
  });

  it('rejects invalid values at the database level', async () => {
    await expect(addRecord(t.db, entry('2026-10-15', -1))).rejects.toThrow(/CHECK constraint failed/);
    await expect(addRecord(t.db, entry('15/10/2026'))).rejects.toThrow(/CHECK constraint failed/);
  });
});

describe('initDatabase', () => {
  it('seeds a fresh install once and never reseeds', async () => {
    const t = createTestDb();
    await initDatabase(t.db);
    const seeded = (await getRecords(t.db)).length;
    expect(seeded).toBeGreaterThan(15);

    await initDatabase(t.db); // second launch
    expect(await getRecords(t.db)).toHaveLength(seeded);
    t.close();
  });
});
