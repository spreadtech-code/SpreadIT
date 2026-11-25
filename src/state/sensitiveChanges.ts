// Sensitive changes (F2, F3, F4). Pure functions, used by the app store and S23.
// - F2: once automation has been switched on, changes to rules, destinations,
//   the fallback account and the review window are saved only after a 6-digit
//   one-time code. 3 wrong codes cancel the change. Resuming after a pause
//   (F1) needs the PIN and a code too.
//   Before going live no money moves, so plan building needs no code
//   (prototype choice, 24 Nov 2026). Reordering rules by dragging needs no
//   code (founder decision, 24 Nov 2026).
// - F3: a new or changed account for a rule or for leftover money becomes
//   active 24 hours later; until then paydays pay the previous account, or the
//   fallback account if there was none. The fallback account itself has no
//   wait: it needs the code and sends an alert only (founder decision, 24 Nov 2026).
// - F4: each change sends a pretend email and SMS naming the rule and the old
//   and new account (last 4 digits only), with "This wasn't me".
import { formatNaira, maskAccount } from '../engine/format';
import type { Destination, DestinationCooldown, Plan, Rule, RuleId } from '../engine/types';
import { percentText } from '../engine/validate';
import { dayMonth } from '../lib/payDates';
import { timeText } from '../lib/splitText';

export const COOLDOWN_MS = 24 * 60 * 60 * 1000;
/** F2: a wrong code this many times cancels the change. */
export const CODE_TRIES = 3;

export type SensitiveChange =
  | { kind: 'saveRule'; rule: Rule }
  | { kind: 'deleteRules'; ruleIds: RuleId[] }
  | { kind: 'remainderFallback'; remainderName: string; remainder: Destination; fallback: Destination | null }
  | { kind: 'reviewWindow'; minutes: number }
  | { kind: 'resume' };

export const sameAccount = (a?: Destination | null, b?: Destination | null): boolean =>
  (a?.bankName ?? null) === (b?.bankName ?? null) && (a?.accountNumber ?? null) === (b?.accountNumber ?? null);

export const accountText = (d?: Destination | null): string => (d ? `${d.bankName} ${maskAccount(d.accountNumber)}` : 'your backup account');

/** F3: the account a payday pays at this moment. */
export function activeDestination(x: DestinationCooldown, now: number): Destination | undefined {
  if (x.destinationActiveFrom !== undefined && now < x.destinationActiveFrom) return x.previousDestination;
  return x.destination;
}

/** F3: "New account active on 25 Nov, 3:04 pm", or null when there is no wait. */
export function cooldownText(x: DestinationCooldown, now: number): string | null {
  if (x.destinationActiveFrom === undefined || now >= x.destinationActiveFrom) return null;
  return `New account active on ${dayMonth(new Date(x.destinationActiveFrom))}, ${timeText(x.destinationActiveFrom)}`;
}

/**
 * F3: carries the wait over to the new version of a rule or remainder.
 * Same account: keeps any wait already running. New account: starts a 24-hour
 * wait, paying the account active right now until then.
 */
export function withCooldown<T extends DestinationCooldown>(before: DestinationCooldown | undefined, after: T, now: number): T {
  const { destinationActiveFrom: _a, previousDestination: _p, ...rest } = after;
  if (sameAccount(before?.destination, after.destination)) {
    return {
      ...rest,
      ...(before?.destinationActiveFrom !== undefined ? { destinationActiveFrom: before.destinationActiveFrom } : {}),
      ...(before?.previousDestination ? { previousDestination: before.previousDestination } : {}),
    } as T;
  }
  if (!after.destination) return rest as T;
  const previous = before ? activeDestination(before, now) : undefined;
  return { ...rest, destinationActiveFrom: now + COOLDOWN_MS, ...(previous ? { previousDestination: previous } : {}) } as T;
}

/** The plan a payday uses: every account still in its 24-hour wait is swapped for the previous one (F3). */
export function activePlan(plan: Plan, now: number): Plan {
  const swap = <T extends DestinationCooldown>(x: T): T => ({ ...x, destination: activeDestination(x, now) });
  return {
    rules: plan.rules.map(swap),
    remainder: plan.remainder ? swap(plan.remainder) : null,
  };
}

/** For S23: what the code is for. */
export function changeTitle(change: SensitiveChange, plan: Plan): string {
  switch (change.kind) {
    case 'saveRule':
      return plan.rules.some((r) => r.id === change.rule.id) ? `Save changes to ${change.rule.name}` : `Add ${change.rule.name} to your plan`;
    case 'deleteRules': {
      const names = plan.rules.filter((r) => change.ruleIds.includes(r.id)).map((r) => r.name);
      return `Take ${names.join(', ') || 'this rule'} out of your plan`;
    }
    case 'remainderFallback':
      return 'Save leftovers and backup account';
    case 'reviewWindow':
      return `Set your review time to ${windowText(change.minutes)}`;
    case 'resume':
      return 'Resume Autopilot';
  }
}

export const windowText = (minutes: number): string => (minutes === 0 ? 'off' : `${minutes} minutes`);

const ruleAmountText = (r: Rule): string => (r.kind === 'fixed' ? formatNaira(r.amountKobo) : `${percentText(r.basisPoints)} of pay`);

export interface ChangeAlert {
  title: string;
  body: string;
}

/**
 * F4: the pretend email and SMS for a change, worked out before it is saved so
 * the old account can be named. Accounts show the last 4 digits only.
 */
export function changeAlerts(
  change: SensitiveChange,
  before: { plan: Plan; fallback: Destination | null; reviewWindowMinutes: number },
  now: number,
): ChangeAlert[] {
  const title = 'Email and SMS: your plan changed';
  const wasnt = 'Wasn’t you? Tap to pause everything.';
  const active = `New account active on ${dayMonth(new Date(now + COOLDOWN_MS))}, ${timeText(now + COOLDOWN_MS)}.`;
  switch (change.kind) {
    case 'saveRule': {
      const old = before.plan.rules.find((r) => r.id === change.rule.id);
      const r = change.rule;
      if (!old) return [{ title, body: `New rule ${r.name}: ${ruleAmountText(r)} to ${accountText(r.destination)}. ${r.destination ? `${active} ` : ''}${wasnt}` }];
      if (!sameAccount(old.destination, r.destination)) {
        return [{ title, body: `${r.name}: account changed from ${accountText(old.destination)} to ${accountText(r.destination)}. ${r.destination ? `${active} ` : ''}${wasnt}` }];
      }
      return [{ title, body: `${r.name} changed: now ${ruleAmountText(r)} to ${accountText(r.destination)}. ${wasnt}` }];
    }
    case 'deleteRules': {
      const names = before.plan.rules.filter((r) => change.ruleIds.includes(r.id)).map((r) => r.name);
      return [{ title, body: `${names.join(', ')} taken out of your plan. ${wasnt}` }];
    }
    case 'remainderFallback': {
      const out: ChangeAlert[] = [];
      const oldRemainder = before.plan.remainder;
      if (!sameAccount(oldRemainder?.destination, change.remainder)) {
        out.push({ title, body: `Leftovers: account changed from ${accountText(oldRemainder?.destination)} to ${accountText(change.remainder)}. ${active} ${wasnt}` });
      } else if (oldRemainder?.name !== change.remainderName) {
        out.push({ title, body: `Leftovers are now called ${change.remainderName}. ${wasnt}` });
      }
      if (!sameAccount(before.fallback, change.fallback)) {
        out.push({
          title: 'Email and SMS: backup account changed',
          body: `Backup account changed from ${before.fallback ? accountText(before.fallback) : 'none'} to ${change.fallback ? accountText(change.fallback) : 'none'}. ${wasnt}`,
        });
      }
      return out;
    }
    case 'reviewWindow':
      return [
        {
          title: 'Email and SMS: review time changed',
          body: `Your review time changed from ${windowText(before.reviewWindowMinutes)} to ${windowText(change.minutes)}. ${wasnt}`,
        },
      ];
    case 'resume':
      return [];
  }
}
