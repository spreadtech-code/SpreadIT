// E4 Monthly summary: what SpreadIT did in one calendar month, worked out
// from the income history and the fake bank's transfers, so every total
// matches the history to the kobo. Pure.
import { categoryByKey } from '../data/categories';
import { formatNaira } from '../engine/format';
import type { Transfer } from '../fakebank/bank';
import type { EventTransfer, IncomeEvent } from './events';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface SummaryLine {
  name: string;
  kobo: number;
}

export interface MonthlySummary {
  /** "November 2026" */
  label: string;
  /** Every payment that arrived in the month, split or not. */
  receivedKobo: number;
  paymentsCount: number;
  /** Money that reached its account (Successful), by category, largest first. */
  sentByCategory: SummaryLine[];
  sentTotalKobo: number;
  /** Money that went to the fallback account instead (D7). */
  sentToFallbackKobo: number;
  /** Inflow fees on payments received + transfer fees on transfers sent (refunded fees left out). */
  feesKobo: number;
  /** Family transfers that reached their account on the day the income arrived. */
  familyPaymentsDelivered: number;
  /** Savings that reached their account since the user's first payday, up to the end of this month. */
  savingsSinceJoinedKobo: number;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/** The month before the one `at` falls in. */
export function previousMonth(at: number): { year: number; month: number } {
  const d = new Date(at);
  const m = d.getMonth() - 1;
  return m < 0 ? { year: d.getFullYear() - 1, month: 11 } : { year: d.getFullYear(), month: m };
}

const inMonth = (t: number | null | undefined, year: number, month: number) => {
  if (t == null) return false;
  const d = new Date(t);
  return d.getFullYear() === year && d.getMonth() === month;
};
const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();

function lineName(tr: EventTransfer): string {
  if (tr.id === 'remainder') return tr.name;
  return (tr.categoryKey && categoryByKey(tr.categoryKey)?.name) || tr.name;
}

export function monthlySummary(
  events: readonly IncomeEvent[],
  transfers: Readonly<Record<string, Transfer>>,
  year: number,
  month: number,
): MonthlySummary {
  const endOfMonth = new Date(year, month + 1, 1).getTime();
  const received = events.filter((e) => inMonth(e.receivedAt, year, month));

  const byName = new Map<string, number>();
  let sentToFallbackKobo = 0;
  let transferFees = 0;
  let familyPaymentsDelivered = 0;
  let savingsSinceJoinedKobo = 0;

  for (const e of events) {
    for (const tr of e.transfers) {
      const b = transfers[tr.reference];
      if (!b) continue;
      // A Failed transfer's fee was given back (src/fakebank/bank.ts), so it isn't a cost.
      if (inMonth(b.createdAt, year, month) && b.status !== 'Failed') transferFees += b.feeKobo;
      if (b.status === 'Successful' && tr.categoryKey === 'savings' && (b.completedAt ?? 0) < endOfMonth) {
        savingsSinceJoinedKobo += tr.amountKobo;
      }
      if (!inMonth(b.completedAt, year, month)) continue;
      if (b.status === 'Successful') {
        const name = lineName(tr);
        byName.set(name, (byName.get(name) ?? 0) + tr.amountKobo);
        if (tr.categoryKey === 'family' && sameDay(b.completedAt!, e.receivedAt)) familyPaymentsDelivered++;
      }
      if (b.status === 'Sent to fallback') sentToFallbackKobo += tr.amountKobo;
    }
  }

  const sentByCategory = [...byName.entries()].map(([name, kobo]) => ({ name, kobo })).sort((a, b) => b.kobo - a.kobo);
  return {
    label: monthLabel(year, month),
    receivedKobo: received.reduce((s, e) => s + e.amountKobo, 0),
    paymentsCount: received.length,
    sentByCategory,
    sentTotalKobo: sentByCategory.reduce((s, l) => s + l.kobo, 0),
    sentToFallbackKobo,
    feesKobo: received.reduce((s, e) => s + e.split.inflowFeeKobo, 0) + transferFees,
    familyPaymentsDelivered,
    savingsSinceJoinedKobo,
  };
}

/** E4 "Share" (as text for now): amounts hidden unless the user chooses to show them. */
export function summaryShareText(s: MonthlySummary, showAmounts: boolean): string {
  const amount = (k: number) => (showAmounts ? formatNaira(k) : '₦•••••');
  return [
    `My SpreadIT summary for ${s.label}`,
    `Received: ${amount(s.receivedKobo)} (${s.paymentsCount} ${s.paymentsCount === 1 ? 'payment' : 'payments'})`,
    ...s.sentByCategory.map((l) => `${l.name}: ${amount(l.kobo)}`),
    `Family payments delivered on payday: ${s.familyPaymentsDelivered}`,
    `Bank fees: ${amount(s.feesKobo)}`,
  ].join('\n');
}
