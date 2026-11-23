// The split engine: one pure, deterministic function (CLAUDE.md rule 5).
// The same income, plan and fee schedule always give the same result.
// It never touches the UI or the fake bank.
//
// How a payday is split (PRD B4-B6, B13, C3, C4, D4, D5 and founder decisions, 23 Nov 2026):
// 1. The inflow fee comes off the top.
// 2. Rules are funded in priority order, fixed and percentage together. Each
//    rule is funded only if its amount plus its own transfer fee fits.
//    - Percentage rules use gross income, rounded down to the kobo.
//    - A rule that cannot be fully funded sends what fits (Partly funded),
//      unless that is under ₦1,000, in which case it is Skipped.
//    - After the first rule that runs short, every lower rule is Skipped.
//    - Once-per-month fixed rules already paid this month are Skipped; so are
//      rules the user chose to skip once. Their money flows on.
// 3. The remainder gets the largest amount that fits with its own fee.
// 4. Anything left (a few naira that would cost more to send) stays unsplit.
// Allocations + fees + unsplit always equal income to the kobo; if not, it throws.
import type { FeeSchedule } from '../data/feeSchedule';
import { inflowFee, maxSendable, transferFee } from './fees';
import { assertKobo, shareDown } from './money';
import { planErrors } from './validate';
import type { Plan, RuleId, RuleLine, SplitResult } from './types';

/** A partial payment smaller than this is Skipped instead (founder decision; = the B3 minimum). */
export const MIN_PARTIAL_KOBO = 100_000;

export interface SplitInput {
  incomeKobo: number;
  /** The user's expected amount per payday (A8). */
  expectedKobo: number;
  plan: Plan;
  schedule: FeeSchedule;
  /** Once-per-month fixed rules already paid this calendar month (B5). */
  paidThisMonth?: readonly RuleId[];
  /** Rules the user chose to skip for this payday only (B13). */
  skipOnce?: readonly RuleId[];
}

export function splitIncome(input: SplitInput): SplitResult {
  const { incomeKobo, expectedKobo, plan, schedule } = input;
  assertKobo(incomeKobo, 'Income');
  assertKobo(expectedKobo, 'Expected amount');
  const errors = planErrors(plan);
  if (errors.length > 0) throw new Error(`Plan can't be split: ${errors.join(' ')}`);

  const paid = new Set(input.paidThisMonth ?? []);
  const skip = new Set(input.skipOnce ?? []);

  const inflow = inflowFee(incomeKobo, schedule);
  let available = incomeKobo - inflow;
  let ranShort = false;

  const lines: RuleLine[] = plan.rules.map((rule, index) => {
    const priority = index + 1;
    const targetKobo =
      rule.kind === 'fixed' ? rule.amountKobo : shareDown(incomeKobo, rule.basisPoints);
    const base = { ruleId: rule.id, name: rule.name, priority, targetKobo };
    const skipped = (reason: RuleLine['reason'], shortfallKobo: number): RuleLine => ({
      ...base,
      amountKobo: 0,
      feeKobo: 0,
      funding: 'Skipped',
      reason,
      shortfallKobo,
    });

    if (skip.has(rule.id)) return skipped('Skipped by you', 0);
    if (rule.kind === 'fixed' && rule.frequency === 'oncePerMonth' && paid.has(rule.id)) {
      return skipped('Already paid this month', 0);
    }
    if (targetKobo === 0) return skipped('Not enough money', 0);
    if (ranShort) return skipped('Not enough money', targetKobo);

    const fullFee = transferFee(targetKobo, schedule);
    if (targetKobo + fullFee <= available) {
      available -= targetKobo + fullFee;
      return { ...base, amountKobo: targetKobo, feeKobo: fullFee, funding: 'Fully funded', shortfallKobo: 0 };
    }

    ranShort = true;
    const partial = Math.min(targetKobo, maxSendable(available, schedule));
    if (partial < MIN_PARTIAL_KOBO) return skipped('Not enough money', targetKobo);
    const fee = transferFee(partial, schedule);
    available -= partial + fee;
    return {
      ...base,
      amountKobo: partial,
      feeKobo: fee,
      funding: 'Partly funded',
      shortfallKobo: targetKobo - partial,
    };
  });

  let remainder: SplitResult['remainder'] = null;
  if (plan.remainder && available > 0) {
    const amount = maxSendable(available, schedule);
    if (amount > 0) {
      const fee = transferFee(amount, schedule);
      available -= amount + fee;
      remainder = { name: plan.remainder.name, amountKobo: amount, feeKobo: fee };
    }
  }

  const transferFees = lines.reduce((sum, l) => sum + l.feeKobo, 0) + (remainder?.feeKobo ?? 0);
  const totalFeesKobo = inflow + transferFees;
  const sentAnything = remainder !== null || lines.some((l) => l.amountKobo > 0);

  const result: SplitResult = {
    incomeKobo,
    expectedKobo,
    status: !sentAnything ? 'tooSmall' : incomeKobo * 2 < expectedKobo ? 'needsApproval' : 'ready',
    inflowFeeKobo: inflow,
    lines,
    remainder,
    unsplitKobo: available,
    totalFeesKobo,
  };
  assertBalances(result);
  return result;
}

/** Allocations + fees + unsplit must equal income to the kobo (CLAUDE.md rule 7). */
export function assertBalances(r: SplitResult): void {
  const allocated = r.lines.reduce((sum, l) => sum + l.amountKobo, 0) + (r.remainder?.amountKobo ?? 0);
  const total = allocated + r.totalFeesKobo + r.unsplitKobo;
  if (total !== r.incomeKobo || r.unsplitKobo < 0) {
    throw new Error(`Split does not balance: ${total} kobo accounted for, ${r.incomeKobo} received`);
  }
}
