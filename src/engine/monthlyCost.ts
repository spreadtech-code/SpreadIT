// C6 monthly cost estimate: what the plan costs each month in fees and
// subscription, at the expected amount and pay frequency.
// Pure and deterministic, like the split engine.
//
// How it is worked out:
// - Paydays a year: monthly 12, every 2 weeks 26, weekly 52.
// - The first payday of a month pays every rule. Later paydays in the same
//   month skip once-per-month fixed rules (B5), so they cost less in fees.
// - Fees a month = (12 × first-payday fees + (paydays − 12) × later-payday fees) ÷ 12.
// - Income a month = expected amount × paydays ÷ 12.
// - Everything stays in whole kobo until the final ÷ 12, which rounds to the nearest naira
//   ("about ₦X"). The 1% warning compares exact numbers, so rounding never flips it.
import type { FeeSchedule } from '../data/feeSchedule';
import type { Pricing } from '../data/pricing';
import { formatNaira } from './format';
import { splitIncome } from './split';
import type { Plan } from './types';

export type PayFrequency = 'monthly' | 'twoWeekly' | 'weekly';

export const PAYDAYS_A_YEAR: Record<PayFrequency, number> = { monthly: 12, twoWeekly: 26, weekly: 52 };

/** Above this share of income the line shows as a warning (C6). 100 = 1%. */
export const COST_WARNING_BASIS_POINTS = 100;

export interface MonthlyCost {
  /** Fees on the first payday of a month, when every rule is paid. */
  firstPaydayFeesKobo: number;
  /** Fees on each later payday in the same month (equal to the first for monthly pay). */
  laterPaydayFeesKobo: number;
  /** Fees plus subscription a month, rounded to the nearest naira. */
  monthlyKobo: number;
  /** Expected income a month, rounded to the nearest kobo. */
  monthlyIncomeKobo: number;
  /** Cost as a share of income, e.g. "0.10%". */
  percentText: string;
  /** True when the cost is above 1% of income: show the warning style. */
  overLimit: boolean;
  /** "This plan costs about ₦875 a month (0.10% of your income)" (C6 wording). */
  text: string;
}

/** Returns null when there is no expected amount or the plan has errors. */
export function monthlyCost(input: {
  plan: Plan;
  expectedKobo: number;
  frequency: PayFrequency;
  schedule: FeeSchedule;
  pricing: Pricing;
}): MonthlyCost | null {
  const { plan, expectedKobo, frequency, schedule, pricing } = input;
  if (expectedKobo <= 0) return null;

  let first: number;
  let later: number;
  try {
    const base = { incomeKobo: expectedKobo, expectedKobo, plan, schedule };
    first = splitIncome(base).totalFeesKobo;
    const oncePerMonth = plan.rules
      .filter((r) => r.kind === 'fixed' && r.frequency === 'oncePerMonth')
      .map((r) => r.id);
    later = splitIncome({ ...base, paidThisMonth: oncePerMonth }).totalFeesKobo;
  } catch {
    return null; // the plan has errors; the plan checks already say why
  }

  const paydays = PAYDAYS_A_YEAR[frequency];
  // Both "× 12" so no division happens until the end.
  const costTimes12 = 12 * first + (paydays - 12) * later + 12 * pricing.subscriptionKoboPerMonth;
  const incomeTimes12 = expectedKobo * paydays;

  const monthlyKobo = Math.round(costTimes12 / 1200) * 100;
  const monthlyIncomeKobo = Math.round(incomeTimes12 / 12);
  const hundredthsOfPercent = Math.round((costTimes12 * 10_000) / incomeTimes12);
  const percentText = `${(hundredthsOfPercent / 100).toFixed(2)}%`;
  const overLimit = costTimes12 * 10_000 > incomeTimes12 * COST_WARNING_BASIS_POINTS;

  return {
    firstPaydayFeesKobo: first,
    laterPaydayFeesKobo: later,
    monthlyKobo,
    monthlyIncomeKobo,
    percentText,
    overLimit,
    text: `This plan costs about ${formatNaira(monthlyKobo)} a month (${percentText} of your income)`,
  };
}

/** Tips behind "Ways to lower your costs" (founder-approved, stage 4). Amounts come from the fee schedule. */
export function costTips(schedule: FeeSchedule): string[] {
  const smallest = schedule.transferBands[0];
  const dutyFrom = schedule.stampDuty.fromKobo;
  return [
    `Combine small rules into one. Every transfer costs at least ${formatNaira(smallest.feeKobo)}.`,
    `Keep a transfer under ${formatNaira(dutyFrom)} if you can. From ${formatNaira(dutyFrom)}, each one pays ${formatNaira(schedule.stampDuty.feeKobo)} stamp duty.`,
    'If you are paid more than once a month, set fixed rules to "Once per month" so they are not sent, and charged, on every payday.',
  ];
}
