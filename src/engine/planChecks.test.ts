import { paystackNov2026 as schedule } from '../data/feeSchedule';
import { demoUsers, tunde } from '../data/demoUsers';
import { checkPlan, stampDutyHint } from './planChecks';
import type { Plan, Rule } from './types';
import { percentText, ruleErrors } from './validate';

const naira = (n: number) => Math.round(n * 100);
const fixed = (id: string, amountNaira: number): Rule => ({
  id,
  name: id,
  kind: 'fixed',
  amountKobo: naira(amountNaira),
  frequency: 'oncePerMonth',
});
const everyday = { name: 'Everyday account' };

describe('Stamp-duty hint (B3)', () => {
  it.each([
    [9_999, null],
    [10_000, 'Send ₦1 less to save ₦50 stamp duty'],
    [10_500, 'Send ₦501 less to save ₦50 stamp duty'],
    [10_999, 'Send ₦1,000 less to save ₦50 stamp duty'],
    [11_000, null],
  ])('₦%i -> %s', (amount, hint) => {
    expect(stampDutyHint(naira(amount), schedule)).toBe(hint);
  });
});

describe('Rule limits (B3, B4)', () => {
  it('accepts fixed amounts from ₦1,000 to ₦50,000,000 in whole naira', () => {
    expect(ruleErrors(fixed('A', 1_000))).toEqual([]);
    expect(ruleErrors(fixed('A', 50_000_000))).toEqual([]);
    expect(ruleErrors(fixed('A', 999))).not.toEqual([]);
    expect(ruleErrors(fixed('A', 50_000_001))).not.toEqual([]);
    expect(ruleErrors(fixed('A', 1_000.5))).toEqual(['Enter a whole naira amount.']);
  });
  it('accepts 0.5% to 100% in steps of 0.5%', () => {
    const pct = (bp: number): Rule => ({ id: 'P', name: 'P', kind: 'percent', basisPoints: bp });
    expect(ruleErrors(pct(50))).toEqual([]);
    expect(ruleErrors(pct(10_000))).toEqual([]);
    expect(ruleErrors(pct(25))).not.toEqual([]);
    expect(ruleErrors(pct(1_025))).not.toEqual([]);
    expect(ruleErrors(pct(10_050))).not.toEqual([]);
  });
  it('accepts names of 1 to 30 characters', () => {
    expect(ruleErrors({ ...fixed('A', 1_000), name: '' })).not.toEqual([]);
    expect(ruleErrors({ ...fixed('A', 1_000), name: 'x'.repeat(31) })).not.toEqual([]);
  });
  it('writes percentages plainly', () => {
    expect(percentText(1_000)).toBe('10%');
    expect(percentText(1_050)).toBe('10.5%');
    expect(percentText(50)).toBe('0.5%');
  });
});

describe('Plan checks before "Switch on" (B8, B10)', () => {
  it('passes all four demo plans with no errors', () => {
    for (const u of demoUsers) {
      expect(checkPlan(u.plan, u.expectedKobo, schedule).errors).toEqual([]);
    }
  });

  it("gives Tunde's plan no warnings", () => {
    expect(checkPlan(tunde.plan, tunde.expectedKobo, schedule)).toMatchObject({ warnings: [], canSwitchOn: true });
  });

  it('blocks percentages over 100% and shows the total', () => {
    const plan: Plan = {
      rules: [
        { id: 'A', name: 'A', kind: 'percent', basisPoints: 6_000 },
        { id: 'B', name: 'B', kind: 'percent', basisPoints: 4_500 },
      ],
      remainder: everyday,
    };
    const c = checkPlan(plan, naira(100_000), schedule);
    expect(c.canSwitchOn).toBe(false);
    expect(c.errors).toContain("Your percentages add up to 105%. They can't be more than 100%.");
  });

  it('blocks a plan with no remainder destination', () => {
    const c = checkPlan({ ...tunde.plan, remainder: null }, tunde.expectedKobo, schedule);
    expect(c.canSwitchOn).toBe(false);
    expect(c.errors).toContain('Choose where leftover money goes');
  });

  it('rejects two categories with the same name (B2)', () => {
    const plan: Plan = { rules: [fixed('Rent', 1_000), { ...fixed('Rent2', 1_000), name: 'rent' }], remainder: everyday };
    expect(checkPlan(plan, naira(100_000), schedule).errors).toContain('You already have a category called rent');
  });

  it('warns about a shortfall at the expected amount and lists the short rules', () => {
    const plan: Plan = { rules: [fixed('Rent', 300_000), fixed('Car', 200_000)], remainder: everyday };
    const c = checkPlan(plan, naira(400_000), schedule);
    expect(c.canSwitchOn).toBe(true);
    expect(c.shortRules.map((l) => [l.name, l.funding])).toEqual([['Car', 'Partly funded']]);
    expect(c.warnings[0]).toMatch(/^At ₦400,000 your rules are ₦100,500 short: Car \(Partly funded\)\.$/);
  });

  it('warns when nothing is left for day-to-day spending', () => {
    // ₦100,000 − ₦300 inflow − (₦99,600 + ₦100 fee) = ₦0 left
    const plan: Plan = { rules: [fixed('Everything', 99_600)], remainder: everyday };
    const c = checkPlan(plan, naira(100_000), schedule);
    expect(c.warnings).toEqual(['No money left for day-to-day spending']);
    expect(c.canSwitchOn).toBe(true);
  });
});
