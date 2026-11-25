// Paydays on the phone: income events, the pretend alerts, and the loop that
// moves them along. Every money movement goes through the fake bank's partner
// calls (src/fakebank/bankStore.ts). Pretend money only.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { feeSchedule } from '../data/feeSchedule';
import { transferFee } from '../engine/fees';
import { formatNaira } from '../engine/format';
import type { Destination, RuleId } from '../engine/types';
import { FINAL_STATUSES, type Transfer, type TransferStatus } from '../fakebank/bank';
import * as bank from '../fakebank/bankStore';
import { payDates, dayMonth } from '../lib/payDates';
import { isPaused, useApp } from '../state/appStore';
import { activePlan, type ChangeAlert } from '../state/sensitiveChanges';
import {
  narration,
  paidThisMonth,
  splitFor,
  startEvent,
  transfersFor,
  unsplitKobo,
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

/** B14 "Send extra once" and D13 "Send to my account": transfers outside a payday. */
export interface OneOffTransfer {
  kind: 'extra' | 'toMyAccount';
  /** B14: the rule it was sent for. */
  ruleId?: RuleId;
  name: string;
  categoryKey?: string;
  destination: Destination;
  amountKobo: number;
  feeKobo: number;
  reference: string;
  createdAt: number;
  /** The last status the user was alerted about. */
  alerted?: TransferStatus;
}

interface PaydayStore {
  events: IncomeEvent[];
  alerts: PretendAlert[];
  oneOffs: OneOffTransfer[];
  /** A9: Forward mode reminders sent, per payday ("2026-11-25" -> 1 or 2). */
  forwardReminders: Record<string, number>;
  /** A10: the salary-switch kit is offered once. */
  salaryKitOffered: boolean;
  /** A10: "Is this your salary now?" is asked once, on the first payment from someone else. */
  askedSalaryNow: boolean;
}

const emptyStore: PaydayStore = {
  events: [],
  alerts: [],
  oneOffs: [],
  forwardReminders: {},
  salaryKitOffered: false,
  askedSalaryNow: false,
};

export const usePaydays = create<PaydayStore>()(
  persist((): PaydayStore => emptyStore, {
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

/** F4: the pretend email and SMS for a sensitive change. Tapping it = "This wasn't me". */
export function securityAlerts(alerts: readonly ChangeAlert[]): void {
  for (const a of alerts) alert(a.title, a.body, '/emergency-pause?notMe=1');
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
    alert('Money landed', `${formatNaira(payment.amountKobo)} landed. Autopilot is off, so it wasn’t split.`, '/home');
    return 'automationOff';
  }

  const event = startEvent({
    id: newId('EV'),
    payment,
    expectedKobo: app.income.expectedKobo,
    qualifyingMinimumKobo: app.income.qualifyingMinimumKobo,
    // F3: accounts still in their 24-hour wait are swapped for the previous one.
    plan: activePlan(app.plan, bank.now()),
    paidThisMonth: paidThisMonth(usePaydays.getState().events, payment.receivedAt),
    reviewWindowMinutes: app.automation.reviewWindowMinutes,
    schedule: feeSchedule,
    now: bank.now(),
  });
  // F1: while paused, nothing counts down; the money waits until the user resumes.
  const paused = isPaused(app);
  if (paused && event.stage === 'review') {
    event.stage = 'held';
    event.reviewEndsAt = null;
  }
  usePaydays.setState((s) => ({ events: [...s.events, event] }));
  askIfSalaryNow(payment.sender, payment.amountKobo);

  const amount = formatNaira(event.amountKobo);
  if (paused && event.stage === 'held') {
    alert('Pay landed', `${amount} landed. Autopilot is paused, so it stays in your SpreadIT account until you resume.`, eventRoute(event));
    return 'event';
  }
  if (event.stage === 'askIncome') alert('Is this pay?', `${amount} landed. Should SpreadIT split it?`, eventRoute(event));
  else if (event.stage === 'needsApproval') alert('Short payday', `${amount} landed, less than half your usual. Nothing goes out until you choose.`, eventRoute(event));
  else if (event.stage === 'tooSmall') alert('Money landed', `${amount} landed. This is too small to split.`, '/home');
  else if (app.automation.reviewWindowMinutes === 0) alert('Pay landed', `${amount} landed. Your split is going out now.`, eventRoute(event));
  else alert('Pay landed', `${amount} landed. Your split goes out in ${app.automation.reviewWindowMinutes} minutes.`, eventRoute(event));
  return 'event';
}

/** The user's own name, as on transfers (D15) and forwarded payments. */
function fullName(): string {
  const id = useApp.getState().identity;
  return id ? `${id.firstName} ${id.lastName}` : 'SpreadIT user';
}

/**
 * A10: in Forward mode, the first payment from a sender other than the user's
 * own account asks "Is this your salary now?". Yes stops the reminders (S27).
 */
function askIfSalaryNow(sender: string, amountKobo: number): void {
  const app = useApp.getState();
  if (app.income?.arrival !== 'forward' || usePaydays.getState().askedSalaryNow) return;
  if (sender.trim().toLowerCase() === fullName().toLowerCase()) return;
  usePaydays.setState({ askedSalaryNow: true });
  alert(
    'Is this your salary now?',
    `${formatNaira(amountKobo)} came from ${sender}, not your own account.`,
    `/salary-switch-kit?salaryNow=1&sender=${encodeURIComponent(sender)}`,
  );
}

// ---------- the user's choices ----------

/**
 * S18: No = leave it unsplit. Yes = an income event is created (D1), so the usual
 * rules apply: below 50% of expected it waits for "Run in priority order" (D4, S17);
 * otherwise the review window starts (S16).
 * Founder decision (24 Nov 2026): D1 + D4 win over flow 6's "S18 -> S16".
 */
export function answerIsThisIncome(id: string, yes: boolean): void {
  update(id, (e) => {
    if (e.stage !== 'askIncome') return e;
    if (!yes) return { ...e, stage: 'notIncome' };
    if (e.split.status === 'tooSmall') return { ...e, stage: 'tooSmall' };
    if (e.split.status === 'needsApproval') return { ...e, stage: 'needsApproval' };
    return startReview(e);
  });
}

/** The review window starts, or, while paused (F1), the payday is held. */
function startReview(e: IncomeEvent): IncomeEvent {
  const app = useApp.getState();
  if (isPaused(app)) return { ...e, stage: 'held', reviewEndsAt: null };
  return { ...e, stage: 'review', reviewEndsAt: bank.now() + app.automation.reviewWindowMinutes * 60_000 };
}

/** S17 "Run in priority order": start the review window (S17 -> S16). */
export function runInPriorityOrder(id: string): void {
  update(id, (e) => (e.stage === 'needsApproval' || e.stage === 'held' ? startReview(e) : e));
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

/**
 * F1 Emergency pause: automation stops at once. A payday counting down is held,
 * so nothing is sent until the user resumes and taps "Execute now". Transfers
 * already with the bank finish.
 */
export function pauseAutomation(at: number): void {
  useApp.getState().pause(at);
  usePaydays.setState((s) => ({
    events: s.events.map((e) => (e.stage === 'review' ? { ...e, stage: 'held', reviewEndsAt: null } : e)),
  }));
}

/** S16 "Execute now", or the window closing: send every transfer (D6). Nothing is sent while paused (F1). */
export async function executeEvent(id: string): Promise<void> {
  const e = getEvent(id);
  if (!e || (e.stage !== 'review' && e.stage !== 'held')) return;
  const app = useApp.getState();
  if (isPaused(app)) return;
  const transfers = transfersFor(e, app.fallback);
  update(id, (x) => ({ ...x, stage: 'sending', executedAt: bank.now(), reviewEndsAt: null, transfers }));

  const fallbackCode = app.fallback ? (await bank.createRecipient(app.fallback)).code : null;
  for (const t of transfers) {
    const recipient = await bank.createRecipient(t.destination);
    await bank.sendTransfer({
      reference: t.reference,
      recipientCode: recipient.code,
      amountKobo: t.amountKobo,
      narration: narration(fullName(), t.name),
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
  const againRef = `${reference}-again`;
  const result = await bank.sendTransfer({
    reference: againRef,
    recipientCode: recipient.code,
    amountKobo: tr.amountKobo,
    narration: narration(fullName(), tr.name),
    keepTrying: tr.keepTrying,
    fallbackRecipientCode: fallbackCode,
  });
  if (!result.ok) return result.reason === 'insufficientFunds' ? 'insufficientFunds' : 'notAllowed';
  const again = { ...tr, reference: againRef, resendOf: reference, feeKobo: result.transfer.feeKobo };
  update(eventId, (x) => ({ ...x, stage: 'sending', transfers: [...x.transfers, again] }));
  return 'sent';
}

/** Money a one-off transfer can use: the SpreadIT balance minus paydays waiting to be split. */
export function availableKobo(): number {
  return unsplitKobo(bank.useBank.getState().bank.balanceKobo, usePaydays.getState().events);
}

export type OneOffResult = { result: 'sent'; reference: string } | { result: 'insufficientFunds'; shortKobo: number };

/**
 * B14 "Send extra once" (to a rule's account) and D13 "Send to my account"
 * (to the fallback account). The screen asks for the PIN first. The amount and
 * its fee come from the SpreadIT balance, never from a payday still waiting.
 * The plan is not changed. Allowed while paused: the user sends it themselves.
 */
export async function sendOneOff(input: Omit<OneOffTransfer, 'feeKobo' | 'reference' | 'createdAt' | 'alerted'>): Promise<OneOffResult> {
  const fee = transferFee(input.amountKobo, feeSchedule);
  const short = input.amountKobo + fee - availableKobo();
  if (short > 0) return { result: 'insufficientFunds', shortKobo: short };

  const app = useApp.getState();
  const reference = newId(input.kind === 'extra' ? 'XT' : 'MY');
  const recipient = await bank.createRecipient(input.destination);
  // Money to the user's own account has nowhere else to go if it fails.
  const fallbackCode = input.kind === 'extra' && app.fallback ? (await bank.createRecipient(app.fallback)).code : null;
  const sent = await bank.sendTransfer({
    reference,
    recipientCode: recipient.code,
    amountKobo: input.amountKobo,
    narration: narration(fullName(), input.name),
    fallbackRecipientCode: fallbackCode,
  });
  if (!sent.ok) return { result: 'insufficientFunds', shortKobo: Math.max(1, short) };
  const oneOff: OneOffTransfer = { ...input, feeKobo: sent.transfer.feeKobo, reference, createdAt: bank.now() };
  usePaydays.setState((s) => ({ oneOffs: [...s.oneOffs, oneOff] }));
  return { result: 'sent', reference };
}

/** Paydays where every transfer was Successful (D2 window off, A10 kit offer). */
export function successfulPaydays(events: readonly IncomeEvent[]): number {
  return events.filter(
    (e) => e.stage === 'done' && e.transfers.length > 0 && e.transfers.every((t) => bankTransfer(t.reference)?.status === 'Successful'),
  ).length;
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
  pauseReminder(t);

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
      transferAlert(tr.name, tr.amountKobo, bankTransfer(tr.reference)!, `/payday?event=${e.id}`);
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
      // G2: the SMS copy can be switched off; the push always comes.
      const sms = useApp.getState().notifications.paydaySummarySms ? ' Also sent by SMS.' : '';
      alert('Payday’s done', `${ok} sent${notOk ? `, ${notOk} didn’t go` : ''}. Tap to see where your money went.${sms}`, '/home');
      update(e.id, (x) => ({ ...x, stage: 'done', doneAt: t, alerted }));
    } else if (changed) {
      update(e.id, (x) => ({ ...x, alerted }));
    }
  }

  // One-off transfers (B14, D13): the same failure alerts (D7, D10).
  const oneOffs = usePaydays.getState().oneOffs;
  if (oneOffs.some((o) => bankTransfer(o.reference)?.status !== o.alerted)) {
    usePaydays.setState({
      oneOffs: oneOffs.map((o) => {
        const b = bankTransfer(o.reference);
        if (!b || b.status === o.alerted) return o;
        transferAlert(o.name, o.amountKobo, b, `/transfer-receipt?ref=${o.reference}`);
        return { ...o, alerted: b.status };
      }),
    });
  }

  forwardReminder(t);
  offerSalaryKit();
}

/** D7, D10: a pretend push and SMS when a transfer fails, falls back or is reversed. */
function transferAlert(name: string, amountKobo: number, b: Transfer, route: string): void {
  const amount = formatNaira(amountKobo);
  if (b.status === 'Retrying') alert(`${name}: trying again`, `${amount} didn’t go through yet. ${b.failureReason ?? ''} We’ll keep trying.`, route);
  if (b.status === 'Sent to fallback') alert(`${name}: sent to your backup account`, `${amount} couldn’t reach ${name}. ${b.failureReason ?? ''}`, route);
  if (b.status === 'Failed') alert(`${name}: didn’t go`, `${amount} couldn’t be sent. It’s back in your SpreadIT account.`, route);
  if (b.status === 'Reversed') alert(`${name}: returned`, `The bank returned ${amount}. It’s back in your SpreadIT account.`, route);
}

const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const sameDay = (a: number, b: number) => dayKey(a) === dayKey(b);

/**
 * A9 Forward mode reminders, on the expected pay date: 9am with the SpreadIT
 * account details; 6pm again if no qualifying payment has arrived; none after.
 */
export function forwardRemindersDue(input: {
  t: number;
  isPayday: boolean;
  sent: number;
  arrivedToday: boolean;
}): 'morning' | 'evening' | null {
  if (!input.isPayday) return null;
  const hour = new Date(input.t).getHours();
  if (input.sent === 0 && hour >= 9 && hour < 18) return 'morning';
  if (input.sent <= 1 && hour >= 18 && !input.arrivedToday) return 'evening';
  return null;
}

function forwardReminder(t: number): void {
  const app = useApp.getState();
  const { income, spreaditAccount: account } = app;
  if (!income || income.arrival !== 'forward' || !account || !app.automation.on || isPaused(app)) return;
  const dates = payDates(income, new Date(t));
  const isPayday = dates.next !== null && sameDay(dates.last.getTime(), t);
  const key = dayKey(t);
  const store = usePaydays.getState();
  const sent = store.forwardReminders[key] ?? 0;
  const arrivedToday = store.events.some((e) => sameDay(e.receivedAt, t) && e.amountKobo >= income.qualifyingMinimumKobo);
  const due = forwardRemindersDue({ t, isPayday, sent, arrivedToday });
  if (!due) return;
  const details = `${account.bankName} ${account.accountNumber}, ${account.accountName}`;
  if (due === 'morning') {
    alert('Payday: forward your pay', `Send it to your SpreadIT account in one transfer: ${details}. Tap to copy.`, '/forward-mode-setup');
  } else {
    alert('Your pay hasn’t arrived yet', `Forward it to your SpreadIT account to split it today: ${details}. Tap to copy.`, '/forward-mode-setup');
  }
  usePaydays.setState((s) => ({ forwardReminders: { ...s.forwardReminders, [key]: 2 - (due === 'morning' ? 1 : 0) } }));
}

/** A10: after 2 successful live paydays in Forward mode, offer the kit once. */
function offerSalaryKit(): void {
  const store = usePaydays.getState();
  if (store.salaryKitOffered || useApp.getState().income?.arrival !== 'forward') return;
  if (successfulPaydays(store.events) < 2) return;
  usePaydays.setState({ salaryKitOffered: true });
  alert('Ready to move your salary?', '2 paydays split. Get a letter for HR so your salary comes straight to SpreadIT.', '/salary-switch-kit');
}

const DAY = 24 * 60 * 60 * 1000;

/** G3: 1 reminder at day 7 of a pause and 1 at day 14, none after that. */
export function pauseReminderDue(pausedAt: number | null | undefined, sent: number, t: number): boolean {
  if (pausedAt === null || pausedAt === undefined || sent >= 2) return false;
  return t - pausedAt >= (sent === 0 ? 7 : 14) * DAY;
}

function pauseReminder(t: number): void {
  const app = useApp.getState();
  if (!pauseReminderDue(app.automation.pausedAt, app.automation.pauseReminders ?? 0, t)) return;
  const next = app.income ? payDates(app.income, new Date(t)).next : null;
  alert(
    'Autopilot is paused',
    next ? `Autopilot is paused. Resume before your next payday on ${dayMonth(next)}?` : 'Autopilot is paused. Resume before your next payday?',
    '/verify-change?resume=1',
  );
  app.notePauseReminder();
}

/** Demo controls: clear every payday and alert. */
export function resetPaydays(): void {
  usePaydays.setState(emptyStore);
}
