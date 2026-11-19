import { z } from "zod";
import { isFutureISODate, isValidISODate, todayISO } from "./utils/date";
import { HealthRecord } from "./types";

export const RECORD_LIMITS = {
  steps: 100_000,
  calories: 10_000,
  water: 20_000,
} as const;

const isoDate = z
  .string()
  .trim()
  .min(1, "Date is required")
  .refine(isValidISODate, "Enter a valid date (YYYY-MM-DD)")
  .refine((value) => !isFutureISODate(value), "Date cannot be in the future");

/**
 * Text inputs produce strings, so each number field checks the raw text and
 * then converts it to a whole number between `min` and `max`.
 */
const wholeNumber = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => !v.startsWith("-"), `${label} cannot be negative`)
    .refine(
      (v) => v.startsWith("-") || /^\d+$/.test(v),
      `${label} must be a whole number`,
    )
    .transform((v) => Number(v))
    .pipe(
      z
        .number()
        .min(
          min,
          min === 0
            ? `${label} cannot be negative`
            : `${label} must be at least ${min}`,
        )
        .max(max, `${label} cannot exceed ${max.toLocaleString("en-US")}`),
    );

/** Add/Edit record form: string inputs in, HealthRecordInput out. */
export const recordFormSchema = z.object({
  date: isoDate,
  steps: wholeNumber("Steps", 0, RECORD_LIMITS.steps),
  calories: wholeNumber("Calories", 0, RECORD_LIMITS.calories),
  water: wholeNumber("Water", 0, RECORD_LIMITS.water),
});

export type RecordFormValues = z.input<typeof recordFormSchema>;

/** Blank Add form, dated today. */
export function emptyFormValues(): RecordFormValues {
  return { date: todayISO(), steps: "", calories: "", water: "" };
}

/** Edit form prefilled from a saved record. */
export function toFormValues(record: HealthRecord): RecordFormValues {
  return {
    date: record.date,
    steps: String(record.steps),
    calories: String(record.calories),
    water: String(record.water),
  };
}

/** Daily goals form: string inputs in, DailyGoals out. */
export const goalsFormSchema = z.object({
  steps: wholeNumber("Steps goal", 1, RECORD_LIMITS.steps),
  calories: wholeNumber("Calories goal", 1, RECORD_LIMITS.calories),
  water: wholeNumber("Water goal", 1, RECORD_LIMITS.water),
});

export type GoalsFormValues = z.input<typeof goalsFormSchema>;
