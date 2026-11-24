// Paydays on the phone: income events, the pretend alerts, and the loop that
// moves them along. Every money movement goes through the fake bank's partner
// calls (src/fakebank/bankStore.ts). Pretend money only.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { feeSchedule } from '../data/feeSchedule';
import { formatNaira } from '../engine/format';
import type { RuleId } from '../engine/types';
import { FINAL_STATUSES, type Transfer, type TransferStatus } from '../fakebank/bank';
import * as bank from '../fakebank/bankStore';
import { useApp } from '../state/appStore';
import {
  narration,
  paidThisMonth,
  splitFor,
  startEvent,
  transfersFor,
  type IncomeEvent,
} from './events';

/** A pretend push notification, shown as a banner (G1, D1, D7, D10). */
export interface PretendAlert {
  id: string;
  title: string;
  body: string;
  /** Where tapping it goes. */
  route: string;
  createdAt: number;
}

interface PaydayStore {
  events: IncomeEvent[];
  alerts: PretendAlert[];
}

export const usePaydays = create<PaydayStore>()(
  persist((): PaydayStore => ({ events: [], alerts: [] }), {
    name: 'spreadit-paydays-v1',
    storage: createJSONStorage(() => AsyncStorage),
  }),
);

let counter = 0;
const newId = (prefix: string) => `${prefix}${bank.now().toString(36)}${(counter++).toString(36)}`;

function alert(title: string, body: string, route: string): void {
  const a: PretendAlert = { id: newId('AL'), title, body, route, createdAt: bank.now() };
  usePaydays.setState((s) => ({ alerts: [...s.alerts, a] }));
}

export function dismissAlert(id: string): void {
  usePaydays.setState((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) }));
}

function update(id: string, change: (e: IncomeEvent) => IncomeEvent): void {
  usePaydays.setState((s) => ({ events: s.events.map((e) => (e.id === id ? change(e) : e)) }));
}

export function getEvent(id: string): IncomeEvent | undefined {
  return usePaydays.getState().events.find((e) => e.id === id);
}

/** The event to show on Home and S16: the newest one. */
export function latestEvent(events: readonly IncomeEvent[]): IncomeEvent | undefined {
  return [...events].sort((a, b) => b.receivedAt - a.receivedAt)[0];
}

export const eventRoute = (e: IncomeEvent): string => {
  if (e.stage === 'askIncome') return `/is-this-income?event=${e.id}`;
  if (e.stage === 'needsApproval') return `/short-payday-review?event=${e.id}`;
  return `/payday?event=${e.id}`;
};

// ---------- money arrives ----------

export type NoticeResult = 'duplicate' | 'automationOff' | 'event';

/** The partner's payment notice: money arrived in the SpreadIT account (D1, D9). */
export async function handlePaymentNotice(notice: {
  reference: string;
  amountKobo: number;
  sender: string;
}): Promise<NoticeResult> {
  const { payment, duplicate } = await bank.receiveIncome(notice);
  // D9: a repeated notice never makes a second event.
  if (duplicate || usePaydays.getState().events.some((e) => e.paymentRef === payment.reference)) return 'duplicate';

  const app = useApp.getState();
  if (!app.automation.on || !app.income) {
    alert('Money received', `${formatNaira(payment.amountKobo)} arrived. Automation is off, so it wasn't split.`, '/home');
    return 'automationOff';
  }

  const event = startEvent({
    id: newId('EV'),
    payment,
    expectedKobo: app.income.expectedKobo,
    qualifyingMinimumKobo: app.income.qualifyingMinimumKobo,
    plan: app.plan,
    paidThisMonth: paidThisMonth(usePaydays.getState().events, payment.receivedAt),
    reviewWindowMinutes: app.automation.reviewWindowMinutes,
    schedule: feeSchedule,
    now: bank.now(),
  });
  usePaydays.setState((s) => ({ events: [...s.events, event] }));

  const amount = formatNaira(event.amountKobo);
  if (event.stage === 'askIncome') alert('Is this income?', `${amount} arrived. Should SpreadIT split it?`, eventRoute(event));
  else if (event.stage === 'needsApproval') alert('Short payday', `${amount} arrived, less than half of what you expect. Nothing is sent until you say so.`, eventRoute(event));
  else if (event.stage === 'tooSmall') alert('Money received', `${amount} arrived. This payment is too small to split.`, '/home');
  else alert('Income received', `${amount} arrived. Your split goes out in ${app.automation.reviewWindowMinutes} minutes.`, eventRoute(event));
  return 'event';
}

// ---------- the user's choices ----------

/**
 * S18: No = leave it unsplit. Yes = an income event is created (D1), so the usual
 * rules apply: below 50% of expected it waits for "Run in priority order" (D4, S17);
 * otherwise the review window starts (S16).
 * Founder decision (24 Nov 2026): D1 + D4 win over flow 6's "S18 -> S16".
 */
export function answerIsThisIncome(id: string, yes: boolean): void {
  const minutes = useApp.getState().automation.reviewWindowMinutes;
  update(id, (e) => {
    if (e.stage !== 'askIncome') return e;
    if (!yes) return { ...e, stage: 'notIncome' };
    if (e.split.status === 'tooSmall') return { ...e, stage: 'tooSmall' };
    if (e.split.status === 'needsApproval') return { ...e, stage: 'needsApproval' };
    return { ...e, stage: 'review', reviewEndsAt: bank.now() + minutes * 60_000 };
  });
}

/** S17 "Run in priority order": start the review window (S17 -> S16). */
export function runInPriorityOrder(id: string): void {
  const minutes = useApp.getState().automation.reviewWindowMinutes;
  update(id, (e) =>
    e.stage === 'needsApproval' || e.stage === 'held'
      ? { ...e, stage: 'review', reviewEndsAt: bank.now() + minutes * 60_000 }
      : e,
  );
}

/** S17 "Adjust this payday": skip rules for this payday only; the split is worked out again. */
export function setSkipOnce(id: string, skipOnce: RuleId[]): void {
  update(id, (e) => {
    if (e.stage === 'sending' || e.stage === 'done') return e;
    const next = { ...e, skipOnce };
    return { ...next, split: splitFor(next, feeSchedule) };
  });
}

/** S17 "Hold" and S16 "Pause for review": nothing is sent until the user says so. */
export function holdEvent(id: string): void {
  update(id, (e) => (e.stage === 'review' || e.stage === 'needsApproval' ? { ...e, stage: 'held', reviewEndsAt: null } : e));
}

/** S16 "Emergency cancel": nothing is sent; the money stays unsplit. */
export function cancelEvent(id: string): void {
  update(id, (e) => (e.stage === 'sending' || e.stage === 'done' ? e : { ...e, stage: 'cancelled', reviewEndsAt: null }));
}

/** S16 "Execute now", or the window closing: send every transfer (D6). */
export async function executeEvent(id: string): Promise<void> {
  const e = getEvent(id);
  if (!e || (e.stage !== 'review' && e.stage !== 'held')) return;
  const app = useApp.getState();
  const transfers = transfersFor(e, app.fallback);
  update(id, (x) => ({ ...x, stage: 'sending', executedAt: bank.now(), reviewEndsAt: null, transfers }));

  const fallbackCode = app.fallback ? (await bank.createRecipient(app.fallback)).code : null;
  const fullName = app.identity ? `${app.identity.firstName} ${app.identity.lastName}` : 'SpreadIT user';
  for (const t of transfers) {
    const recipient = await bank.createRecipient(t.destination);
    await bank.sendTransfer({
      reference: t.reference,
      recipientCode: recipient.code,
      amountKobo: t.amountKobo,
      narration: narration(fullName, t.name),
      keepTrying: t.keepTrying,
      fallbackRecipientCode: fallbackCode,
    });
  }
  // B13: "Skip next payday" applies once.
  for (const ruleId of e.plan.rules.filter((r) => r.skipNextPayday).map((r) => r.id)) app.setSkipNext(ruleId, false);
}

/** D8: only these can be sent again: their money is back in the SpreadIT account. */
export const CAN_SEND_AGAIN: readonly TransferStatus[] = ['Failed', 'Reversed'];

export type SendAgainResult = 'sent' | 'insufficientFunds' | 'notAllowed';

/**
 * D8 "Send again": the same amount to the same account, from the SpreadIT
 * balance. The screen asks for the PIN first. Adds a new transfer to the event.
 */
export async function sendAgain(eventId: string, reference: string): Promise<SendAgainResult> {
  const e = getEvent(eventId);
  const tr = e?.transfers.find((x) => x.reference === reference);
  const status = bankTransfer(reference)?.status;
  if (!e || !tr || !status || !CAN_SEND_AGAIN.includes(status)) return 'notAllowed';
  // Each transfer can be sent again once; a failed resend has its own row.
  if (e.transfers.some((x) => x.resendOf === reference)) return 'notAllowed';

  const app = useApp.getState();
  const fallbackCode = app.fallback ? (await bank.createRecipient(app.fallback)).code : null;
  const recipient = await bank.createRecipient(tr.destination);
  const fullName = app.identity ? `${app.identity.firstName} ${app.identity.lastName}` : 'SpreadIT user';
  const againRef = `${reference}-again`;
  const result = await bank.sendTransfer({
    reference: againRef,
    recipientCode: recipient.code,
    amountKobo: tr.amountKobo,
    narration: narration(fullName, tr.name),
    keepTrying: tr.keepTrying,
    fallbackRecipientCode: fallbackCode,
  });
  if (!result.ok) return result.reason === 'insufficientFunds' ? 'insufficientFunds' : 'notAllowed';
  const again = { ...tr, reference: againRef, resendOf: reference, feeKobo: result.transfer.feeKobo };
  update(eventId, (x) => ({ ...x, stage: 'sending', transfers: [...x.transfers, again] }));
  return 'sent';
}

/** E4 demo: the "1st of the month, 10am" alert that opens the monthly summary. */
export function monthlySummaryAlert(label: string): void {
  alert(`Your ${label} summary`, 'See what SpreadIT did with your money.', '/monthly-summary');
}

// ---------- the loop ----------

/** The fake bank's transfer, for showing its status. */
export function bankTransfer(reference: string): Transfer | undefined {
  return bank.useBank.getState().bank.transfers[reference];
}

const isFinal = (s: TransferStatus) => FINAL_STATUSES.includes(s);

/**
 * Runs every second while the app is open:
 * - moves the fake bank's transfers along;
 * - sends paydays whose review window has closed;
 * - alerts on Retrying, Sent to fallback, Reversed (D7, D10) and on a finished split (G1).
 */
let ticking = false;
export async function tick(): Promise<void> {
  if (ticking) return; // the last tick is still running
  ticking = true;
  try {
    await tickOnce();
  } finally {
    ticking = false;
  }
}

async function tickOnce(): Promise<void> {
  bank.advanceBank();
  const t = bank.now();

  for (const e of usePaydays.getState().events) {
    if (e.stage === 'review' && e.reviewEndsAt !== null && t >= e.reviewEndsAt) await executeEvent(e.id);
  }

  for (const e of usePaydays.getState().events) {
    if (e.stage !== 'sending' && e.stage !== 'done') continue;
    const alerted = { ...e.alerted };
    let changed = false;
    for (const tr of e.transfers) {
      const status = bankTransfer(tr.reference)?.status;
      if (!status || alerted[tr.reference] === status) continue;
      const b = bankTransfer(tr.reference)!;
      const amount = formatNaira(tr.amountKobo);
      if (status === 'Retrying') alert(`${tr.name}: retrying`, `${amount} didn't go through yet. ${b.failureReason ?? ''} We'll keep trying.`, `/payday?event=${e.id}`);
      if (status === 'Sent to fallback') alert(`${tr.name}: sent to your fallback account`, `${amount} couldn't reach ${tr.name}. ${b.failureReason ?? ''}`, `/payday?event=${e.id}`);
      if (status === 'Failed') alert(`${tr.name}: failed`, `${amount} couldn't be sent. It's back in your SpreadIT account.`, `/payday?event=${e.id}`);
      if (status === 'Reversed') alert(`${tr.name}: reversed`, `The bank reversed ${amount}. It's back in your SpreadIT account.`, `/payday?event=${e.id}`);
      alerted[tr.reference] = status;
      changed = true;
    }
    const allFinal = e.transfers.every((tr) => {
      const s = bankTransfer(tr.reference)?.status;
      return s !== undefined && isFinal(s);
    });
    if (e.stage === 'sending' && allFinal) {
      const ok = e.transfers.filter((tr) => bankTransfer(tr.reference)?.status === 'Successful').length;
      const notOk = e.transfers.length - ok;
      alert('Payday split', `${ok} successful${notOk ? `, ${notOk} not successful` : ''}. Tap to see where your money went.`, '/home');
      update(e.id, (x) => ({ ...x, stage: 'done', doneAt: t, alerted }));
    } else if (changed) {
      update(e.id, (x) => ({ ...x, alerted }));
    }
  }
}

/** Demo controls: clear every payday and alert. */
export function resetPaydays(): void {
  usePaydays.setState({ events: [], alerts: [] });
}
