// Income events: what SpreadIT does when money arrives (D1-D5, D9, D11, B5, B12, B13).
// Pure functions; src/payday/paydayStore.ts runs them against the fake bank.
//
// When a payment arrives (automation on):
// - Below the qualifying minimum: ask "Is this income?" (D1, S18). Yes = split it.
// - Fees larger than the income: "This payment is too small to split"; it stays unsplit.
// - Below 50% of expected: pause until "Run in priority order" (D4, S17).
// - Otherwise: the review window counts down (D2, S16), then the transfers go out.
// The event keeps the plan it started with; later plan changes wait for the next payday (B12).
import type { FeeSchedule } from '../data/feeSchedule';
import { partner } from '../data/partner';
import { splitIncome } from '../engine/split';
import type { Destination, Plan, RuleId, SplitResult } from '../engine/types';
import type { TransferStatus } from '../fakebank/bank';

export type EventStage =
  | 'askIncome' // S18: below the qualifying minimum, waiting for Yes or No
  | 'needsApproval' // S17: below 50% of expected
  | 'review' // S16: the review window is counting down
  | 'held' // paused for review, or held from S17: nothing sent
  | 'sending' // transfers are with the bank
  | 'done' // every transfer reached a final status
  | 'notIncome' // the user said No on S18: stays unsplit
  | 'cancelled' // Emergency cancel: stays unsplit
  | 'tooSmall'; // fees are larger than the income: stays unsplit

export interface EventTransfer {
  /** The rule id, or "remainder". */
  id: string;
  name: string;
  categoryKey?: string;
  destination: Destination;
  /** True when the rule had no account, so it went straight to the fallback account. */
  toFallback: boolean;
  amountKobo: number;
  feeKobo: number;
  /** One reference per event and rule, so a repeat never sends twice (D9). */
  reference: string;
  keepTrying: boolean;
  /** D8: set when this is a "Send again" of an earlier transfer (its reference). */
  resendOf?: string;
}

export interface IncomeEvent {
  id: string;
  paymentRef: string;
  amountKobo: number;
  sender: string;
  receivedAt: number;
  stage: EventStage;
  expectedKobo: number;
  /** The plan as it was when the income arrived (B12). */
  plan: Plan;
  /** Once-per-month rules already paid this month (B5). */
  paidThisMonth: RuleId[];
  /** Rules skipped for this payday only (B13 or "Adjust this payday"). */
  skipOnce: RuleId[];
  split: SplitResult;
  reviewEndsAt: number | null;
  executedAt: number | null;
  doneAt: number | null;
  transfers: EventTransfer[];
  /** The last status the user was alerted about, per transfer reference. */
  alerted: Record<string, TransferStatus>;
}

/** States where the money is in the account but not split yet. */
export const WAITING_STAGES: readonly EventStage[] = ['askIncome', 'needsApproval', 'review', 'held'];

export function splitFor(
  e: Pick<IncomeEvent, 'amountKobo' | 'expectedKobo' | 'plan' | 'paidThisMonth' | 'skipOnce'>,
  schedule: FeeSchedule,
): SplitResult {
  return splitIncome({
    incomeKobo: e.amountKobo,
    expectedKobo: e.expectedKobo,
    plan: e.plan,
    schedule,
    paidThisMonth: e.paidThisMonth,
    skipOnce: e.skipOnce,
  });
}

/** B5: once-per-month fixed rules already sent in an event this calendar month. */
export function paidThisMonth(events: readonly IncomeEvent[], at: number): RuleId[] {
  const d = new Date(at);
  const ids = new Set<RuleId>();
  for (const e of events) {
    if (e.stage !== 'sending' && e.stage !== 'done') continue;
    const when = new Date(e.executedAt ?? e.receivedAt);
    if (when.getFullYear() !== d.getFullYear() || when.getMonth() !== d.getMonth()) continue;
    for (const line of e.split.lines) {
      const rule = e.plan.rules.find((r) => r.id === line.ruleId);
      if (rule?.kind === 'fixed' && rule.frequency === 'oncePerMonth' && line.amountKobo > 0) ids.add(rule.id);
    }
  }
  return [...ids];
}

export function startEvent(input: {
  id: string;
  payment: { reference: string; amountKobo: number; sender: string; receivedAt: number };
  expectedKobo: number;
  qualifyingMinimumKobo: number;
  plan: Plan;
  paidThisMonth: RuleId[];
  reviewWindowMinutes: number;
  schedule: FeeSchedule;
  now: number;
}): IncomeEvent {
  const { payment, plan } = input;
  const base = {
    id: input.id,
    paymentRef: payment.reference,
    amountKobo: payment.amountKobo,
    sender: payment.sender,
    receivedAt: payment.receivedAt,
    expectedKobo: input.expectedKobo,
    plan,
    paidThisMonth: input.paidThisMonth,
    // B13: rules the user set to skip on the next payday.
    skipOnce: plan.rules.filter((r) => r.skipNextPayday).map((r) => r.id),
    reviewEndsAt: null,
    executedAt: null,
    doneAt: null,
    transfers: [],
    alerted: {},
  };
  const split = splitFor(base, input.schedule);
  let stage: EventStage;
  if (payment.amountKobo < input.qualifyingMinimumKobo) stage = 'askIncome';
  else if (split.status === 'tooSmall') stage = 'tooSmall';
  else if (split.status === 'needsApproval') stage = 'needsApproval';
  else stage = 'review';
  return {
    ...base,
    split,
    stage,
    reviewEndsAt: stage === 'review' ? input.now + input.reviewWindowMinutes * 60_000 : null,
  };
}

/** D15: "From Tunde Adeyemi – Mum", cut to the partner's limit. */
export function narration(fullName: string, ruleName: string): string {
  return `From ${fullName} – ${ruleName}`.slice(0, partner.narrationMaxChars);
}

/** The transfers to send for an event: every funded rule, then the remainder. */
export function transfersFor(e: IncomeEvent, fallback: Destination | null): EventTransfer[] {
  const out: EventTransfer[] = [];
  const add = (id: string, name: string, dest: Destination | undefined, amountKobo: number, feeKobo: number, extra: Partial<EventTransfer>) => {
    if (amountKobo <= 0) return;
    const destination = dest ?? fallback;
    if (!destination) return; // nowhere to send it: stays unsplit
    out.push({
      id,
      name,
      destination,
      toFallback: !dest,
      amountKobo,
      feeKobo,
      reference: `${e.id}-${id}`,
      keepTrying: false,
      ...extra,
    });
  };
  for (const line of e.split.lines) {
    const rule = e.plan.rules.find((r) => r.id === line.ruleId);
    add(line.ruleId, line.name, rule?.destination, line.amountKobo, line.feeKobo, {
      categoryKey: rule?.categoryKey,
      keepTrying: rule?.keepTrying ?? false,
    });
  }
  if (e.split.remainder) {
    add('remainder', e.split.remainder.name, e.plan.remainder?.destination, e.split.remainder.amountKobo, e.split.remainder.feeKobo, {});
  }
  return out;
}

/** Money in the SpreadIT account that isn't part of a payday waiting to be split. */
export function unsplitKobo(balanceKobo: number, events: readonly IncomeEvent[]): number {
  const waiting = events
    .filter((e) => WAITING_STAGES.includes(e.stage))
    .reduce((sum, e) => sum + e.amountKobo - e.split.inflowFeeKobo, 0);
  return Math.max(0, balanceKobo - waiting);
}

/** Each payday's state in words, for history and detail screens (status never by colour alone). */
export const stageText: Record<EventStage, string> = {
  askIncome: 'Is this income?',
  needsApproval: 'Needs your OK',
  review: 'Waiting to send',
  held: 'Held, not split yet',
  sending: 'Sending',
  done: 'Split',
  notIncome: 'Not income, not split',
  cancelled: 'Cancelled, not split',
  tooSmall: 'Too small to split',
};
