import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useRef, useState } from "react";

import { addRecord, deleteRecord, getRecords } from "@/db/records";
import type { HealthRecord } from "@/types";
import {
  defaultCustomRange,
  presetToRange,
  type DateRange,
  type FilterPreset,
} from "@/utils/date-range";

/**
 * ViewModel for the Records screen: holds the list, the active date filter, the
 * record waiting for delete confirmation and the last deleted record (for Undo),
 * and exposes the actions the screen calls.
 * The screen only renders what this hook returns.
 */
export function useRecords() {
  const db = useSQLiteContext();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<FilterPreset>("all");
  const [custom, setCustom] = useState<DateRange>(defaultCustomRange);
  const [pendingDelete, setPendingDelete] = useState<HealthRecord | null>(null);
  const [lastDeleted, setLastDeleted] = useState<HealthRecord | null>(null);

  // Each load gets a number. If the user changes the filter again before a
  // query finishes, the older, slower result is ignored instead of shown.
  const latestLoad = useRef(0);

  const load = useCallback(async () => {
    const thisLoad = ++latestLoad.current;
    try {
      const range = presetToRange(preset, new Date(), custom);
      const rows = await getRecords(db, range.from, range.to);
      if (thisLoad !== latestLoad.current) return;
      setRecords(rows);
      setError(null);
    } catch (e) {
      if (thisLoad !== latestLoad.current) return;
      setError(
        e instanceof RangeError ? e.message : "Could not load your records.",
      );
    }
    setLoading(false);
  }, [db, preset, custom]);

  const setCustomRange = (range: DateRange) => {
    setPreset("custom");
    setCustom(range);
  };

  // Deleting asks first: requestDelete opens the dialog, confirmDelete deletes.
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const record = pendingDelete;
    setPendingDelete(null);
    try {
      if (await deleteRecord(db, record.id)) setLastDeleted(record);
    } catch {
      setError("Could not delete the record.");
    }
    await load();
  };

  // Undo adds the deleted values back as a new row (it gets a new id).
  const undoDelete = async () => {
    if (!lastDeleted) return;
    const { id: _oldId, ...values } = lastDeleted;
    setLastDeleted(null);
    try {
      await addRecord(db, values);
    } catch {
      setError("Could not restore the record.");
    }
    await load();
  };

  return {
    records,
    loading,
    error,
    preset,
    custom,
    pendingDelete,
    lastDeleted,
    load,
    setPreset,
    setCustomRange,
    clearFilter: () => setPreset("all"),
    requestDelete: (record: HealthRecord) => setPendingDelete(record),
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
    undoDelete,
    dismissUndo: () => setLastDeleted(null),
  };
}
