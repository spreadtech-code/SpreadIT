// Fake bank: look up the name on an account (B7). Same shape a real partner's
// "resolve account" call would have, so the engineer can swap it later.
//
// Pretend rules, so every case can be tried on the phone:
// - The demo users' accounts return their real demo names.
// - An account number ending in 0000 is "not found".
// - Any other 10-digit number returns a made-up Nigerian name, always the same
//   name for the same number.
import { bankById } from '../data/banks';
import { demoUsers } from '../data/demoUsers';

export type ResolveResult =
  | { ok: true; bankId: string; bankName: string; accountNumber: string; accountName: string }
  | { ok: false; reason: 'invalidNumber' | 'unknownBank' | 'notFound' };

const firstNames = ['Adaeze', 'Babatunde', 'Chinedu', 'Damilola', 'Efosa', 'Funmilayo', 'Garba', 'Halima', 'Ifeoma', 'Jide', 'Kemi', 'Musa', 'Ngozi', 'Olumide', 'Precious', 'Zainab'];
const lastNames = ['Adebayo', 'Bello', 'Chukwu', 'Danjuma', 'Eze', 'Fashola', 'Ibrahim', 'Johnson', 'Lawal', 'Mohammed', 'Nnamdi', 'Okonkwo', 'Oyelaran', 'Suleiman', 'Udoh', 'Yusuf'];

const knownAccounts = new Map<string, string>(
  demoUsers.flatMap((u) => [
    ...u.plan.rules.flatMap((r) => (r.destination ? [[r.destination.accountNumber, r.destination.accountName] as const] : [])),
    ...(u.plan.remainder?.destination
      ? [[u.plan.remainder.destination.accountNumber, u.plan.remainder.destination.accountName] as const]
      : []),
  ]),
);

/** The lookup itself, with no waiting. Exported for tests. */
export function lookUpAccountName(bankId: string, accountNumber: string): ResolveResult {
  if (!/^\d{10}$/.test(accountNumber)) return { ok: false, reason: 'invalidNumber' };
  const bank = bankById(bankId);
  if (!bank) return { ok: false, reason: 'unknownBank' };
  if (accountNumber.endsWith('0000')) return { ok: false, reason: 'notFound' };
  const known = knownAccounts.get(accountNumber);
  const digits = accountNumber.split('').map(Number);
  const first = firstNames[(digits[6] * 10 + digits[7]) % firstNames.length];
  const last = lastNames[(digits[8] * 10 + digits[9]) % lastNames.length];
  return { ok: true, bankId, bankName: bank.name, accountNumber, accountName: known ?? `${first} ${last}` };
}

/** Looks up the account name, after a short pretend network wait. */
export function resolveAccountName(bankId: string, accountNumber: string, delayMs = 900): Promise<ResolveResult> {
  return new Promise((resolve) => setTimeout(() => resolve(lookUpAccountName(bankId, accountNumber)), delayMs));
}
