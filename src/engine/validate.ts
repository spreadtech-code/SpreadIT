// Rule and plan validation (B2, B3, B4, B10). Pure functions.
// The split engine refuses any plan with errors here.
import { formatNaira } from './format';
import type { Plan, Rule } from './types';

export const RULE_LIMITS = {
  minFixedKobo: 100_000, // ₦1,000 (B3)
  maxFixedKobo: 5_000_000_000, // ₦50,000,000 (B3)
  minBasisPoints: 50, // 0.5% (B4)
  maxBasisPoints: 10_000, // 100% (B4)
  stepBasisPoints: 50, // steps of 0.5% (B4)
  maxRules: 15, // B2
  maxNameLength: 30, // B2
} as const;

/** "10.5%" from 1050 basis points. */
export function percentText(basisPoints: number): string {
  const whole = Math.floor(basisPoints / 100);
  const part = basisPoints % 100;
  return part === 0 ? `${whole}%` : `${whole}.${String(part).padStart(2, '0').replace(/0$/, '')}%`;
}

export function ruleErrors(rule: Rule): string[] {
  const errors: string[] = [];
  const name = rule.name.trim();
  if (name.length < 1 || name.length > RULE_LIMITS.maxNameLength) {
    errors.push(`A category name must be 1 to ${RULE_LIMITS.maxNameLength} characters.`);
  }
  if (rule.kind === 'fixed') {
    const a = rule.amountKobo;
    if (!Number.isSafeInteger(a) || a % 100 !== 0) {
      errors.push('Enter a whole naira amount.');
    } else if (a < RULE_LIMITS.minFixedKobo || a > RULE_LIMITS.maxFixedKobo) {
      errors.push(
        `Enter an amount from ${formatNaira(RULE_LIMITS.minFixedKobo)} to ${formatNaira(RULE_LIMITS.maxFixedKobo)}.`,
      );
    }
  } else {
    const b = rule.basisPoints;
    if (
      !Number.isSafeInteger(b) ||
      b < RULE_LIMITS.minBasisPoints ||
      b > RULE_LIMITS.maxBasisPoints ||
      b % RULE_LIMITS.stepBasisPoints !== 0
    ) {
      errors.push('Enter a percentage from 0.5% to 100%, in steps of 0.5%.');
    }
  }
  return errors;
}

/** Problems that make a plan impossible to split. */
export function planErrors(plan: Plan): string[] {
  const errors: string[] = [];
  if (plan.rules.length > RULE_LIMITS.maxRules) {
    errors.push(`A plan can hold up to ${RULE_LIMITS.maxRules} rules.`);
  }
  const seen = new Set<string>();
  for (const rule of plan.rules) {
    const key = rule.name.trim().toLowerCase();
    if (seen.has(key)) errors.push(`You already have a category called ${rule.name.trim()}`);
    seen.add(key);
    for (const e of ruleErrors(rule)) errors.push(`${rule.name}: ${e}`);
  }
  const ids = new Set(plan.rules.map((r) => r.id));
  if (ids.size !== plan.rules.length) errors.push('Two rules share the same id.');

  const totalBasisPoints = plan.rules.reduce((sum, r) => sum + (r.kind === 'percent' ? r.basisPoints : 0), 0);
  if (totalBasisPoints > RULE_LIMITS.maxBasisPoints) {
    errors.push(`Your percentages add up to ${percentText(totalBasisPoints)}. They can't be more than 100%.`);
  }
  return errors;
}
