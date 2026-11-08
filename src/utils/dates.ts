import type { BusyRange, ISODate } from '../api/types';
import { parseISODate } from './format';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Date → YYYY-MM-DD у локальному часовому поясі. */
export function toISODate(date: Date): ISODate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Кількість ночей між датами заїзду та виїзду (0, якщо діапазон некоректний). */
export function nightsBetween(checkIn?: ISODate, checkOut?: ISODate): number {
  if (!checkIn || !checkOut) return 0;
  const diff = Math.round((parseISODate(checkOut).getTime() - parseISODate(checkIn).getTime()) / MS_PER_DAY);
  return diff > 0 ? diff : 0;
}

/** Перетин напіввідкритих інтервалів [a.check_in, a.check_out) та [b.check_in, b.check_out). */
export function rangesOverlap(a: BusyRange, b: BusyRange): boolean {
  return a.check_in < b.check_out && b.check_in < a.check_out;
}

export function findOverlap(range: BusyRange, busy: BusyRange[]): BusyRange | undefined {
  return busy.find((b) => rangesOverlap(range, b));
}

export function startOfMonthISO(date = new Date()): ISODate {
  return toISODate(new Date(date.getFullYear(), date.getMonth(), 1));
}
