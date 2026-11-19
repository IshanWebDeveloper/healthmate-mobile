import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { addRecord, deleteRecord, getRecord, updateRecord } from '@/db/records';
import type { HealthRecordInput } from '@/types';
import { emptyFormValues, toFormValues, type RecordFormValues } from '@/validation';

/**
 * ViewModel for the Add/Edit modal. `id` is the route param: "new" for Add,
 * or a record id for Edit. Loads the record for editing and saves or deletes it.
 */
export function useRecordEditor(id: string | undefined) {
  const db = useSQLiteContext();
  const isNew = id === 'new';
  const recordId = Number(id);

  const [initial, setInitial] = useState<RecordFormValues | null>(isNew ? emptyFormValues() : null);
  const [notFound, setNotFound] = useState(!isNew && !Number.isInteger(recordId));
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isNew || !Number.isInteger(recordId)) return;
    let active = true;
    getRecord(db, recordId)
      .then((record) => {
        if (!active) return;
        if (record) setInitial(toFormValues(record));
        else setNotFound(true);
      })
      .catch(() => active && setNotFound(true));
    return () => {
      active = false;
    };
  }, [db, isNew, recordId]);

  /** Returns false if the record was deleted while it was being edited. */
  const save = async (values: HealthRecordInput): Promise<boolean> => {
    if (isNew) {
      await addRecord(db, values);
      return true;
    }
    const updated = await updateRecord(db, recordId, values);
    if (!updated) setNotFound(true);
    return updated;
  };

  /** Called from the confirmation dialog. Returns false if the delete failed, so the screen stays open and shows `error`. */
  const confirmDelete = async (): Promise<boolean> => {
    setConfirmingDelete(false);
    try {
      await deleteRecord(db, recordId);
      return true;
    } catch {
      setError('Could not delete the record.');
      return false;
    }
  };

  return {
    isNew,
    initial,
    notFound,
    error,
    confirmingDelete,
    save,
    requestDelete: () => setConfirmingDelete(true),
    cancelDelete: () => setConfirmingDelete(false),
    confirmDelete,
    dismissError: () => setError(null),
  };
}
