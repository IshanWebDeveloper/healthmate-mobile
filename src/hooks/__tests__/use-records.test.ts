import { act, renderHook } from "@testing-library/react-native";
import { subDays } from "date-fns";

import { initDatabase } from "@/db/database";
import { addRecord, getRecords } from "@/db/records";
import { useRecords } from "@/hooks/use-records";
import { toISODate } from "@/utils/date";
import { createTestDb, TestDb } from "@/test/test-db";

// The hook gets its database from SQLiteProvider; give it the in-memory test database instead.
let mockDb: TestDb["db"];
jest.mock("expo-sqlite", () => ({ useSQLiteContext: () => mockDb }));

const today = toISODate(new Date());
const tenDaysAgo = toISODate(subDays(new Date(), 10));

describe("useRecords", () => {
  let t: TestDb;

  beforeEach(async () => {
    t = createTestDb();
    mockDb = t.db;
    await initDatabase(t.db);
    await t.db.execAsync("DELETE FROM health_records");
    await addRecord(t.db, {
      date: tenDaysAgo,
      steps: 1000,
      calories: 100,
      water: 500,
    });
    await addRecord(t.db, {
      date: today,
      steps: 3000,
      calories: 300,
      water: 1500,
    });
  });
  afterEach(() => t.close());

  it("loads every record, newest first", async () => {
    const { result } = await renderHook(() => useRecords());
    expect(result.current.loading).toBe(true);

    await act(() => result.current.load());

    expect(result.current.loading).toBe(false);
    expect(result.current.records.map((r) => r.date)).toEqual([
      today,
      tenDaysAgo,
    ]);
  });

  it("applies a date filter", async () => {
    const { result } = await renderHook(() => useRecords());

    await act(() => result.current.setPreset("today"));
    await act(() => result.current.load());

    expect(result.current.records.map((r) => r.date)).toEqual([today]);
  });

  it("shows a readable error for a reversed custom range", async () => {
    const { result } = await renderHook(() => useRecords());

    await act(() =>
      result.current.setCustomRange({ from: today, to: tenDaysAgo }),
    );
    await act(() => result.current.load());

    expect(result.current.preset).toBe("custom");
    expect(result.current.error).toBe(
      "Start date must be on or before the end date",
    );
  });

  it("keeps the record when the delete is cancelled", async () => {
    const { result } = await renderHook(() => useRecords());
    await act(() => result.current.load());
    const target = result.current.records[0]!;

    await act(() => result.current.requestDelete(target));
    expect(result.current.pendingDelete).toEqual(target);

    await act(() => result.current.cancelDelete());
    expect(result.current.pendingDelete).toBeNull();
    expect(await getRecords(t.db)).toHaveLength(2);
  });

  it("deletes a record after confirmation and puts it back on undo", async () => {
    const { result } = await renderHook(() => useRecords());
    await act(() => result.current.load());
    const target = result.current.records[0]!;

    await act(() => result.current.requestDelete(target));
    expect(await getRecords(t.db)).toHaveLength(2); // nothing deleted until confirmed

    await act(() => result.current.confirmDelete());
    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.records).toHaveLength(1);
    expect(result.current.lastDeleted).toEqual(target);

    await act(() => result.current.undoDelete());
    expect(result.current.lastDeleted).toBeNull();
    expect(result.current.records).toHaveLength(2);
    const { id: _id, ...values } = target;
    expect(await getRecords(t.db, today, today)).toEqual([
      expect.objectContaining(values),
    ]);
  });
});
