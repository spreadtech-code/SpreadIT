// Plan checks before "Switch on" (B8, B10) and the rule editor's stamp-duty hint (B3).
import type { FeeSchedule } from '../data/feeSchedule';
import { formatNaira } from './format';
import { splitIncome } from './split';
import type { Plan, RuleLine } from './types';
import { planErrors } from './validate';

export interface PlanCheck {
  /** Block "Switch on". */
  errors: string[];
  /** Shown, but the plan can still be switched on. */
  warnings: string[];
  /** Rules that would be Partly funded or Skipped at the expected amount. */
  shortRules: RuleLine[];
  canSwitchOn: boolean;
}

export function checkPlan(plan: Plan, expectedKobo: number, schedule: FeeSchedule): PlanCheck {
  const structural = planErrors(plan);
  const errors = [...structural];
  if (!plan.remainder) errors.push('Choose where leftovers go'); // B8 (PRD: "Choose where leftover money goes")
  if (structural.length > 0) {
    return { errors, warnings: [], shortRules: [], canSwitchOn: false };
  }

  const warnings: string[] = [];
  const atExpected = splitIncome({ incomeKobo: expectedKobo, expectedKobo, plan, schedule });
  const shortRules = atExpected.lines.filter((l) => l.funding !== 'Fully funded');
  if (shortRules.length > 0) {
    const shortfall = shortRules.reduce((sum, l) => sum + l.shortfallKobo, 0);
    const names = shortRules.map((l) => `${l.name} (${l.funding === 'Partly funded' ? 'Part paid' : l.funding})`).join(', ');
    warnings.push(
      `At ${formatNaira(expectedKobo)} your rules are ${formatNaira(shortfall)} short: ${names}.`,
    );
  }
  if (plan.remainder && (atExpected.remainder?.amountKobo ?? 0) === 0) {
    warnings.push('No money left for day-to-day spending'); // B10 wording
  }
  return { errors, warnings, shortRules, canSwitchOn: errors.length === 0 };
}

/**
 * B3: for a fixed amount from ₦10,000 to ₦10,999, "Send ₦[amount − 9,999] less to save ₦50 stamp duty".
 * Returns null outside that range.
 */
export function stampDutyHint(amountKobo: number, schedule: FeeSchedule): string | null {
  const from = schedule.stampDuty.fromKobo;
  const upTo = from + 99_900; // ₦10,999 when stamp duty starts at ₦10,000
  if (amountKobo < from || amountKobo > upTo) return null;
  const less = amountKobo - (from - 100); // amount − ₦9,999
  return `Send ${formatNaira(less)} less to save ${formatNaira(schedule.stampDuty.feeKobo)} stamp duty`;
}
