// The fake bank as the app sees it: the 5 calls a real partner would offer
// (CLAUDE.md rule 2), async like a real network call. The engineer swaps these
// for the real partner's API behind the same names.
// Its state lives on the phone (pretend money only) and survives a reload.
//
// The demo clock: "Skip ahead" in Demo controls moves the fake bank's time
// forward so countdowns and 6-hour retries can be seen in seconds.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { feeSchedule } from '../data/feeSchedule';
import * as bank from './bank';
import type { BankState, FailureKind, Payment, Recipient, Transfer } from './bank';

interface BankStore {
  bank: BankState;
  /** Demo clock: added to the phone's time. */
  clockOffsetMs: number;
}

export const useBank = create<BankStore>()(
  persist((): BankStore => ({ bank: bank.emptyBank, clockOffsetMs: 0 }), {
    name: 'spreadit-fakebank-v1',
    storage: createJSONStorage(() => AsyncStorage),
  }),
);

/** The current time on the demo clock. */
export function now(): number {
  return Date.now() + useBank.getState().clockOffsetMs;
}

const setBank = (b: BankState) => useBank.setState({ bank: b });

// ---------- the partner calls ----------

/** A payment notice from the partner: money arrived in the SpreadIT account. */
export async function receiveIncome(notice: {
  reference: string;
  amountKobo: number;
  sender: string;
}): Promise<{ payment: Payment; duplicate: boolean }> {
  const r = bank.receiveIncome(useBank.getState().bank, { ...notice, receivedAt: now() }, feeSchedule);
  setBank(r.state);
  return { payment: r.payment, duplicate: r.duplicate };
}

export async function createRecipient(r: Omit<Recipient, 'code'>): Promise<Recipient> {
  const res = bank.createRecipient(useBank.getState().bank, r);
  setBank(res.state);
  return res.recipient;
}

export async function sendTransfer(t: {
  reference: string;
  recipientCode: string;
  amountKobo: number;
  narration: string;
  keepTrying?: boolean;
  fallbackRecipientCode?: string | null;
}): Promise<{ ok: true; transfer: Transfer } | { ok: false; reason: 'insufficientFunds' | 'unknownRecipient' }> {
  const r = bank.sendTransfer(useBank.getState().bank, t, feeSchedule, now());
  if (!r.ok) return r;
  setBank(r.state);
  return { ok: true, transfer: r.transfer };
}

export async function getTransferStatus(reference: string): Promise<Transfer | null> {
  const r = bank.getTransferStatus(useBank.getState().bank, reference, now());
  if (r.state !== useBank.getState().bank) setBank(r.state);
  return r.transfer;
}

// ---------- used by the app's payday loop ----------

/** Moves every transfer on to the current demo time. */
export function advanceBank(): void {
  const s = useBank.getState().bank;
  const next = bank.advance(s, now());
  if (next !== s) setBank(next);
}

export function balanceKobo(): number {
  return useBank.getState().bank.balanceKobo;
}

// ---------- Demo controls only ----------

export function failNextTransfer(kind: FailureKind): void {
  useBank.setState((s) => ({ bank: { ...s.bank, nextFailure: kind } }));
}

/** D10: the partner reports a reversal of the most recent Successful transfer. Returns its reference. */
export function reverseLastSuccessful(): string | null {
  const s = useBank.getState().bank;
  const last = Object.values(s.transfers)
    .filter((t) => t.status === 'Successful')
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0];
  if (!last) return null;
  setBank(bank.reverseTransfer(s, last.reference, now()));
  return last.reference;
}

export function skipAhead(ms: number): void {
  useBank.setState((s) => ({ clockOffsetMs: s.clockOffsetMs + ms }));
}

export function resetBank(): void {
  useBank.setState({ bank: bank.emptyBank, clockOffsetMs: 0 });
}
