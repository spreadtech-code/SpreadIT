// C6 monthly cost estimate.
import { paystackNov2026 as schedule } from '../data/feeSchedule';
import { pilotPricing } from '../data/pricing';
import { tunde } from '../data/demoUsers';
import { costTips, monthlyCost } from './monthlyCost';
import type { Plan } from './types';

const naira = (n: number) => Math.round(n * 100);

const cost = (plan: Plan, expectedNaira: number, frequency: 'monthly' | 'twoWeekly' | 'weekly' = 'monthly', pricing = pilotPricing) =>
  monthlyCost({ plan, expectedKobo: naira(expectedNaira), frequency, schedule, pricing });

describe("Tunde's plan, paid monthly (PRD 2.2, C6)", () => {
  const c = cost(tunde.plan, 850_000)!;

  it('costs about ₦875 a month, the same as one payday', () => {
    expect(c.firstPaydayFeesKobo).toBe(naira(875));
    expect(c.monthlyKobo).toBe(naira(875));
  });

  it('is 0.10% of income, below the 1% warning', () => {
    expect(c.percentText).toBe('0.10%');
    expect(c.overLimit).toBe(false);
  });

  it('uses the exact C6 wording', () => {
    expect(c.text).toBe('This plan costs about ₦875 a month (0.10% of your income)');
  });
});

describe('Paid more than once a month', () => {
  // ₦50,000 a week, ₦20,000 once a month, the rest to the everyday account.
  const plan: Plan = {
    rules: [{ id: 'rent', name: 'Rent', kind: 'fixed', amountKobo: naira(20_000), frequency: 'oncePerMonth' }],
    remainder: { name: 'Everyday account' },
  };

  it('charges once-per-month rules on the first payday only', () => {
    const c = cost(plan, 50_000, 'weekly')!;
    // First payday: ₦300 inflow + ₦75 rent + ₦75 remainder. Later: ₦300 inflow + ₦75 remainder.
    expect(c.firstPaydayFeesKobo).toBe(naira(450));
    expect(c.laterPaydayFeesKobo).toBe(naira(375));
    // (12 × 450 + 40 × 375) ÷ 12 = ₦1,700
    expect(c.monthlyKobo).toBe(naira(1_700));
    expect(c.monthlyIncomeKobo).toBe(Math.round((naira(50_000) * 52) / 12));
    expect(c.percentText).toBe('0.78%');
  });

  it('counts 26 paydays a year for every 2 weeks', () => {
    const c = cost(plan, 50_000, 'twoWeekly')!;
    // (12 × 450 + 14 × 375) ÷ 12 = ₦887.50, about ₦888
    expect(c.monthlyKobo).toBe(naira(888));
  });
});

describe('The 1% warning', () => {
  it('shows above 1% of income', () => {
    // ₦20,000 a month, four ₦2,000 rules: ₦200 inflow + 4 × ₦10 + ₦75 on the ₦11,685 remainder
    // (₦25 transfer + ₦50 stamp duty) = ₦315, 1.58%.
    const small = (id: string) => ({ id, name: id, kind: 'fixed' as const, amountKobo: naira(2_000), frequency: 'oncePerMonth' as const });
    const plan: Plan = { rules: ['a', 'b', 'c', 'd'].map(small), remainder: { name: 'Everyday account' } };
    const c = cost(plan, 20_000)!;
    expect(c.monthlyKobo).toBe(naira(315));
    expect(c.percentText).toBe('1.58%');
    expect(c.overLimit).toBe(true);
  });

  it('does not show at exactly 1%', () => {
    // No rules and no remainder: only the ₦300 inflow fee, exactly 1% of ₦30,000.
    const plan: Plan = { rules: [], remainder: null };
    const c = cost(plan, 30_000)!;
    expect(c.monthlyKobo).toBe(naira(300));
    expect(c.percentText).toBe('1.00%');
    expect(c.overLimit).toBe(false);
  });
});

describe('Subscription', () => {
  it('is ₦0 during the pilot (I1)', () => {
    expect(pilotPricing.subscriptionKoboPerMonth).toBe(0);
  });

  it('is added once a month when a price is set', () => {
    const priced = { name: 'Test price', subscriptionKoboPerMonth: naira(1_500) };
    expect(cost(tunde.plan, 850_000, 'monthly', priced)!.monthlyKobo).toBe(naira(875 + 1_500));
  });
});

describe('No estimate', () => {
  it('without an expected amount', () => {
    expect(cost(tunde.plan, 0)).toBeNull();
  });

  it('when the plan has errors', () => {
    const bad: Plan = { rules: [{ id: 'x', name: 'x', kind: 'percent', basisPoints: 15_000 }], remainder: null };
    expect(cost(bad, 850_000)).toBeNull();
  });
});

describe('Cost tips', () => {
  it('take their amounts from the fee schedule', () => {
    const tips = costTips(schedule);
    expect(tips).toHaveLength(3);
    expect(tips[0]).toContain('₦10');
    expect(tips[1]).toContain('₦10,000');
    expect(tips[1]).toContain('₦50 stamp duty');
  });
});
