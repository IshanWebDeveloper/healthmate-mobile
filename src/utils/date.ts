import { format, isValid, parse } from 'date-fns';

export const ISO_DATE_FORMAT = 'yyyy-MM-dd';
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Local calendar date as `yyyy-MM-dd` (never UTC, so "today" matches the user's day). */
export function toISODate(date: Date): string {
  return format(date, ISO_DATE_FORMAT);
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

/** Parses `yyyy-MM-dd` strictly; rejects impossible dates like 2026-02-30. */
export function parseISODate(value: string): Date | null {
  if (!ISO_DATE_PATTERN.test(value)) return null;
  const parsed = parse(value, ISO_DATE_FORMAT, new Date());
  return isValid(parsed) && toISODate(parsed) === value ? parsed : null;
}

export function isValidISODate(value: string): boolean {
  return parseISODate(value) !== null;
}

/** ISO dates compare correctly as strings. */
export function isFutureISODate(value: string, now: Date = new Date()): boolean {
  return value > todayISO(now);
}

/** e.g. "Friday, 16 October 2026" for headings. */
export function formatLongDate(value: string): string {
  const parsed = parseISODate(value);
  return parsed ? format(parsed, 'EEEE, d MMMM yyyy') : value;
}

/** e.g. "Fri, 16 Oct 2026" for form fields and compact labels. */
export function formatShortDate(value: string): string {
  const parsed = parseISODate(value);
  return parsed ? format(parsed, 'EEE, d MMM yyyy') : value;
}
