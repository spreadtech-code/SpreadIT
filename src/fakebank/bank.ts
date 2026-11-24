// The fake bank's money side, as pure functions over a BankState.
// src/fakebank/bankStore.ts wraps these in the async calls a real partner has
// (receiveIncome, createRecipient, sendTransfer, getTransferStatus).
//
// How a pretend transfer moves (D6, D7, D10):
// - Pending when instructed; Processing after 2 seconds; Successful after 5 seconds.
// - A temporary failure (demo control) shows Retrying. Retries at 30 seconds,
//   2 minutes and 10 minutes, then every 30 minutes. After 6 hours (72 hours with
//   keep-trying, B15) the money goes to the fallback account: "Sent to fallback".
//   In this prototype a temporary failure never recovers, so the fallback can be shown.
// - A permanent failure (demo control) goes to the fallback account at once.
// - With no fallback account a failed transfer is "Failed" and the money is returned.
// - A reversal (demo control) marks a Successful transfer "Reversed" and returns the amount.
// Prototype simplification: the transfer fee is charged once when the transfer is
// instructed, and covers the fallback transfer too.
import type { FeeSchedule } from '../data/feeSchedule';
import { inflowFee, transferFee } from '../engine/fees';
import { assertKobo } from '../engine/money';

export type TransferStatus =
  | 'Pending'
  | 'Processing'
  | 'Successful'
  | 'Retrying'
  | 'Failed'
  | 'Sent to fallback'
  | 'Reversed';

/** No further change is expected (Reversed can still follow Successful). */
export const FINAL_STATUSES: readonly TransferStatus[] = ['Successful', 'Failed', 'Sent to fallback', 'Reversed'];

export type FailureKind = 'temporary' | 'permanent';

export interface Payment {
  reference: string;
  amountKobo: number;
  /** The partner's inflow fee (C4). */
  feeKobo: number;
  sender: string;
  receivedAt: number;
}

export interface Recipient {
  code: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface Transfer {
  reference: string;
  recipientCode: string;
  amountKobo: number;
  feeKobo: number;
  narration: string;
  createdAt: number;
  status: TransferStatus;
  keepTrying: boolean;
  fallbackRecipientCode: string | null;
  /** Demo controls only: how this transfer will fail. */
  plannedFailure: FailureKind | null;
  failureReason: string | null;
  firstFailedAt: number | null;
  nextAttemptAt: number | null;
  completedAt: number | null;
  reversedAt: number | null;
}

export interface BankState {
  /** The user's SpreadIT account balance. */
  balanceKobo: number;
  payments: Record<string, Payment>;
  recipients: Record<string, Recipient>;
  transfers: Record<string, Transfer>;
  /** Demo controls: the next transfer instructed will fail this way. */
  nextFailure: FailureKind | null;
}

export const emptyBank: BankState = { balanceKobo: 0, payments: {}, recipients: {}, transfers: {}, nextFailure: null };

export const PROCESSING_AFTER_MS = 2_000;
export const SETTLE_AFTER_MS = 5_000;
const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
/** D7 [ASSUMPTION: 6 hours, OQ-17]; B15 keep-trying: 72 hours. */
export const RETRY_LIMIT_MS = 6 * HOUR;
export const KEEP_TRYING_LIMIT_MS = 72 * HOUR;

export const failureReasons: Record<FailureKind, string> = {
  temporary: "The recipient's bank didn't respond",
  permanent: 'The account is closed',
};

/** D7: retry times after the first failure, ending at the limit, when the money goes to fallback. */
export function retryOffsets(limitMs: number): number[] {
  const offsets = [30 * SECOND, 2 * MINUTE, 10 * MINUTE];
  for (let t = 10 * MINUTE + 30 * MINUTE; t < limitMs; t += 30 * MINUTE) offsets.push(t);
  return [...offsets.filter((o) => o < limitMs), limitMs];
}

// ---------- receiveIncome ----------

export function receiveIncome(
  state: BankState,
  notice: { reference: string; amountKobo: number; sender: string; receivedAt: number },
  schedule: FeeSchedule,
): { state: BankState; payment: Payment; duplicate: boolean } {
  assertKobo(notice.amountKobo, 'Payment');
  const existing = state.payments[notice.reference];
  if (existing) return { state, payment: existing, duplicate: true }; // D9
  const payment: Payment = { ...notice, feeKobo: inflowFee(notice.amountKobo, schedule) };
  return {
    state: {
      ...state,
      balanceKobo: state.balanceKobo + payment.amountKobo - payment.feeKobo,
      payments: { ...state.payments, [payment.reference]: payment },
    },
    payment,
    duplicate: false,
  };
}

// ---------- createRecipient ----------

export function recipientCode(r: { bankName: string; accountNumber: string }): string {
  return `RCP_${r.bankName.replace(/\W+/g, '').toUpperCase()}_${r.accountNumber}`;
}

export function createRecipient(
  state: BankState,
  r: Omit<Recipient, 'code'>,
): { state: BankState; recipient: Recipient } {
  const code = recipientCode(r);
  const recipient: Recipient = { code, ...r };
  if (state.recipients[code]) return { state, recipient: state.recipients[code] };
  return { state: { ...state, recipients: { ...state.recipients, [code]: recipient } }, recipient };
}

// ---------- sendTransfer ----------

export type SendResult =
  | { ok: true; state: BankState; transfer: Transfer; duplicate: boolean }
  | { ok: false; reason: 'insufficientFunds' | 'unknownRecipient' };

export function sendTransfer(
  state: BankState,
  t: {
    reference: string;
    recipientCode: string;
    amountKobo: number;
    narration: string;
    keepTrying?: boolean;
    fallbackRecipientCode?: string | null;
  },
  schedule: FeeSchedule,
  now: number,
): SendResult {
  const existing = state.transfers[t.reference];
  if (existing) return { ok: true, state, transfer: existing, duplicate: true }; // D9
  if (!state.recipients[t.recipientCode]) return { ok: false, reason: 'unknownRecipient' };
  const feeKobo = transferFee(t.amountKobo, schedule);
  if (t.amountKobo + feeKobo > state.balanceKobo) return { ok: false, reason: 'insufficientFunds' };

  const transfer: Transfer = {
    reference: t.reference,
    recipientCode: t.recipientCode,
    amountKobo: t.amountKobo,
    feeKobo,
    narration: t.narration,
    createdAt: now,
    status: 'Pending',
    keepTrying: t.keepTrying ?? false,
    fallbackRecipientCode: t.fallbackRecipientCode ?? null,
    plannedFailure: state.nextFailure,
    failureReason: null,
    firstFailedAt: null,
    nextAttemptAt: null,
    completedAt: null,
    reversedAt: null,
  };
  return {
    ok: true,
    duplicate: false,
    transfer,
    state: {
      ...state,
      balanceKobo: state.balanceKobo - t.amountKobo - feeKobo,
      transfers: { ...state.transfers, [t.reference]: transfer },
      nextFailure: null,
    },
  };
}

// ---------- moving transfers along with time ----------

function toFallback(state: BankState, tr: Transfer, at: number): { state: BankState; tr: Transfer } {
  if (tr.fallbackRecipientCode) {
    return { state, tr: { ...tr, status: 'Sent to fallback', completedAt: at, nextAttemptAt: null } };
  }
  // Nowhere to send it: the money (and the unused fee) goes back to the SpreadIT account.
  return {
    state: { ...state, balanceKobo: state.balanceKobo + tr.amountKobo + tr.feeKobo },
    tr: { ...tr, status: 'Failed', completedAt: at, nextAttemptAt: null },
  };
}

function advanceOne(state: BankState, start: Transfer, now: number): { state: BankState; tr: Transfer } {
  let tr = start;
  let s = state;
  for (;;) {
    if (tr.status === 'Pending' && now >= tr.createdAt + PROCESSING_AFTER_MS) {
      tr = { ...tr, status: 'Processing' };
      continue;
    }
    if (tr.status === 'Processing' && now >= tr.createdAt + SETTLE_AFTER_MS) {
      const at = tr.createdAt + SETTLE_AFTER_MS;
      if (tr.plannedFailure === null) {
        tr = { ...tr, status: 'Successful', completedAt: at };
      } else if (tr.plannedFailure === 'permanent') {
        tr = { ...tr, failureReason: failureReasons.permanent, firstFailedAt: at };
        ({ state: s, tr } = toFallback(s, tr, at));
      } else {
        tr = {
          ...tr,
          status: 'Retrying',
          failureReason: failureReasons.temporary,
          firstFailedAt: at,
          nextAttemptAt: at + retryOffsets(tr.keepTrying ? KEEP_TRYING_LIMIT_MS : RETRY_LIMIT_MS)[0],
        };
      }
      continue;
    }
    if (tr.status === 'Retrying' && tr.nextAttemptAt !== null && tr.firstFailedAt !== null && now >= tr.nextAttemptAt) {
      const limit = tr.keepTrying ? KEEP_TRYING_LIMIT_MS : RETRY_LIMIT_MS;
      const done = tr.nextAttemptAt - tr.firstFailedAt;
      if (done >= limit) {
        ({ state: s, tr } = toFallback(s, tr, tr.nextAttemptAt));
        continue;
      }
      const next = retryOffsets(limit).find((o) => o > done)!;
      tr = { ...tr, nextAttemptAt: tr.firstFailedAt + next };
      continue;
    }
    return { state: s, tr };
  }
}

/** Moves every transfer on to where it should be at `now`. */
export function advance(state: BankState, now: number): BankState {
  let s = state;
  let changed = false;
  const transfers = { ...state.transfers };
  for (const ref of Object.keys(state.transfers)) {
    const r = advanceOne(s, state.transfers[ref], now);
    if (r.tr !== state.transfers[ref]) {
      transfers[ref] = r.tr;
      changed = true;
    }
    s = r.state;
  }
  return changed || s !== state ? { ...s, transfers } : state;
}

// ---------- getTransferStatus ----------

export function getTransferStatus(
  state: BankState,
  reference: string,
  now: number,
): { state: BankState; transfer: Transfer | null } {
  const s = advance(state, now);
  return { state: s, transfer: s.transfers[reference] ?? null };
}

// ---------- reversals (D10, demo controls) ----------

/** The partner reports that a Successful transfer was reversed: the amount comes back. */
export function reverseTransfer(state: BankState, reference: string, now: number): BankState {
  const tr = state.transfers[reference];
  if (!tr || tr.status !== 'Successful') return state;
  return {
    ...state,
    balanceKobo: state.balanceKobo + tr.amountKobo,
    transfers: { ...state.transfers, [reference]: { ...tr, status: 'Reversed', reversedAt: now } },
  };
}
