// Fake bank: the identity check (A6) and opening the user's own account (A7).
// Same shape a real partner's calls would have; the engineer swaps these later.
// SpreadIT keeps only the result, never the BVN (PRD decision 17).
//
// Pretend rules, so every case can be tried on the phone:
// - A BVN must be 11 digits.
// - Ending 000: "BVN not found". Ending 111: "Name doesn't match".
//   Ending 222: "Date of birth doesn't match". Anything else passes.
import { partner } from '../data/partner';

export type IdentityFailReason = 'bvnNotFound' | 'nameMismatch' | 'dobMismatch';

export type IdentityResult =
  | { ok: true; firstName: string; lastName: string }
  | { ok: false; reason: IdentityFailReason | 'invalidBvn' };

/** A6 wording for each fail reason. */
export const identityFailText: Record<IdentityFailReason | 'invalidBvn', string> = {
  bvnNotFound: "We couldn't find this BVN. Check the 11 digits and try again.",
  nameMismatch: "Your name doesn't match the name on this BVN. Use your name exactly as your bank has it.",
  dobMismatch: "Your date of birth doesn't match the one on this BVN.",
  invalidBvn: 'A BVN is 11 digits.',
};

/** "aDAEZE  okafor" -> "Adaeze Okafor" style: trimmed, first letter capital. */
export function tidyName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

/** The check itself, with no waiting. Exported for tests. */
export function checkIdentity(input: { bvn: string; firstName: string; lastName: string }): IdentityResult {
  if (!/^\d{11}$/.test(input.bvn)) return { ok: false, reason: 'invalidBvn' };
  if (input.bvn.endsWith('000')) return { ok: false, reason: 'bvnNotFound' };
  if (input.bvn.endsWith('111')) return { ok: false, reason: 'nameMismatch' };
  if (input.bvn.endsWith('222')) return { ok: false, reason: 'dobMismatch' };
  return { ok: true, firstName: tidyName(input.firstName), lastName: tidyName(input.lastName) };
}

/** Submits the BVN to the partner, after a short pretend wait. */
export function verifyIdentity(
  input: { bvn: string; firstName: string; lastName: string; dateOfBirth: string },
  delayMs = 1500,
): Promise<IdentityResult> {
  return new Promise((resolve) => setTimeout(() => resolve(checkIdentity(input)), delayMs));
}

export interface SpreaditAccount {
  bankName: string;
  accountNumber: string;
  /** The user's own name, with no "SpreadIT" prefix (A7). */
  accountName: string;
}

/** A7: the same person always gets the same pretend 10-digit account number. */
export function openAccount(person: { firstName: string; lastName: string; phone: string }): SpreaditAccount {
  const seed = `${person.firstName.toLowerCase()}|${person.lastName.toLowerCase()}|${person.phone}`;
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1_000_000_000;
  return {
    bankName: partner.name,
    accountNumber: `9${String(h).padStart(9, '0')}`,
    accountName: `${person.firstName} ${person.lastName}`,
  };
}

/** A7 "Copy details" and "Share": the 3 details as text. */
export function accountDetailsText(a: SpreaditAccount): string {
  return `Bank: ${a.bankName}\nAccount number: ${a.accountNumber}\nAccount name: ${a.accountName}`;
}

/** A6: after 3 failed attempts in 24 hours, show the support contact instead. */
export const MAX_FAILS_PER_DAY = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export function identityLockedOut(failedAt: readonly number[], now: number): boolean {
  return failedAt.filter((t) => now - t < DAY_MS).length >= MAX_FAILS_PER_DAY;
}
