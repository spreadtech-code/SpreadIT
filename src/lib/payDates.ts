// Pay-date maths for Home (E1): the last and next expected payday, and how
// dates are written. Pure: "today" is always passed in, never read here.
import type { Income } from '../state/appStore';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight at the start of the given day, local time. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** A day of the month, moved back to the last day in shorter months (31 -> 30 November). */
function dayInMonth(year: number, month: number, day: number): Date {
  const last = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, last));
}

/** "25 November" */
export function dayMonth(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Whole days from `from` to `to`, by calendar date. */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

export interface PayDates {
  /** The most recent payday on or before today. */
  last: Date;
  /** The next expected payday after today, or null when pay has no set date (income varies). */
  next: Date | null;
}

export function payDates(income: Pick<Income, 'frequency' | 'payDayOfMonth' | 'payWeekday'>, today: Date): PayDates {
  const t = startOfDay(today);

  if (income.frequency === 'monthly' && income.payDayOfMonth) {
    const thisMonth = dayInMonth(t.getFullYear(), t.getMonth(), income.payDayOfMonth);
    if (thisMonth <= t) {
      return { last: thisMonth, next: dayInMonth(t.getFullYear(), t.getMonth() + 1, income.payDayOfMonth) };
    }
    return { last: dayInMonth(t.getFullYear(), t.getMonth() - 1, income.payDayOfMonth), next: thisMonth };
  }

  if (income.frequency !== 'monthly' && income.payWeekday) {
    // payWeekday: 1 = Monday ... 5 = Friday. Date.getDay(): 0 = Sunday ... 6 = Saturday.
    const back = (t.getDay() - income.payWeekday + 7) % 7;
    const last = new Date(t.getFullYear(), t.getMonth(), t.getDate() - back);
    const gap = income.frequency === 'weekly' ? 7 : 14;
    const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + gap);
    return { last, next };
  }

  // Income that varies has no set pay date.
  return { last: t, next: null };
}

/** The callout on Home: "Automation on · next payday in 30 days". */
export function automationText(next: Date | null, today: Date): string {
  if (!next) return 'Automation on';
  const days = daysBetween(today, next);
  if (days <= 0) return 'Automation on · payday today';
  if (days === 1) return 'Automation on · next payday tomorrow';
  return `Automation on · next payday in ${days} days`;
}
