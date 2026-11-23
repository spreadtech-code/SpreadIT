// The split engine tests CLAUDE.md requires before any payday screen is built,
// plus a balance check across many incomes.
import { paystackNov2026 as schedule } from '../data/feeSchedule';
import { chiamaka, demoUsers, tunde } from '../data/demoUsers';
import { splitIncome, MIN_PARTIAL_KOBO } from './split';
import type { Plan, SplitResult } from './types';

const naira = (n: number) => Math.round(n * 100); // test helper: naira -> kobo

const split = (incomeNaira: number, expectedNaira: number, plan: Plan, extra = {}) =>
  splitIncome({ incomeKobo: naira(incomeNaira), expectedKobo: naira(expectedNaira), plan, schedule, ...extra });

const byName = (r: SplitResult) => Object.fromEntries(r.lines.map((l) => [l.name, l]));

const total = (r: SplitResult) =>
  r.lines.reduce((s, l) => s + l.amountKobo, 0) + (r.remainder?.amountKobo ?? 0) + r.totalFeesKobo + r.unsplitKobo;

const fixed = (id: string, amountNaira: number) => ({
  id,
  name: id,
  kind: 'fixed' as const,
  amountKobo: naira(amountNaira),
  frequency: 'oncePerMonth' as const,
});
const percent = (id: string, pct: number) => ({ id, name: id, kind: 'percent' as const, basisPoints: pct * 100 });
const everyday = { name: 'Everyday account' };

describe("Tunde's ₦850,000 payday (PRD 2.2, C4)", () => {
  const r = split(850_000, 850_000, tunde.plan);

  it('costs ₦875 in fees: ₦300 inflow plus ₦575 transfers', () => {
    expect(r.inflowFeeKobo).toBe(naira(300));
    expect(r.totalFeesKobo).toBe(naira(875));
  });

  it('sends the right amount, with the right fee, to each rule', () => {
    const lines = r.lines.map((l) => [l.name, l.amountKobo, l.feeKobo, l.funding]);
    expect(lines).toEqual([
      ['Mum', naira(80_000), naira(100), 'Fully funded'],
      ['Rent', naira(150_000), naira(100), 'Fully funded'],
      ['Tithe', naira(85_000), naira(100), 'Fully funded'],
      ['Savings', naira(127_500), naira(100), 'Fully funded'],
      ['Investment', naira(50_000), naira(75), 'Fully funded'],
    ]);
    expect(r.remainder).toEqual({ name: 'Everyday account', amountKobo: naira(356_625), feeKobo: naira(100) });
    expect(r.unsplitKobo).toBe(0);
    expect(r.status).toBe('ready');
  });

  it('balances to the kobo', () => {
    expect(total(r)).toBe(naira(850_000));
  });
});

describe('Percentages use gross income (B4)', () => {
  it('takes 10% of the full amount received, before fees', () => {
    expect(byName(split(850_000, 850_000, tunde.plan)).Tithe.amountKobo).toBe(naira(85_000));
    expect(byName(split(500_000, 500_000, tunde.plan)).Tithe.amountKobo).toBe(naira(50_000));
  });
  it('rounds a part-kobo percentage down', () => {
    const plan: Plan = { rules: [percent('half', 0.5)], remainder: everyday };
    // 0.5% of ₦1,234.57 = 617.285 kobo -> 617
    const r = splitIncome({ incomeKobo: 123_457, expectedKobo: 123_457, plan, schedule });
    expect(r.lines[0].targetKobo).toBe(617);
  });
});

describe('Short payday (D4)', () => {
  it('pauses for approval below 50% of expected', () => {
    expect(split(400_000, 850_000, tunde.plan).status).toBe('needsApproval');
    expect(split(424_999.99, 850_000, tunde.plan).status).toBe('needsApproval');
  });

  it('runs at exactly 50%, and up to 99%', () => {
    expect(split(425_000, 850_000, tunde.plan).status).toBe('ready');
    expect(split(841_500, 850_000, tunde.plan).status).toBe('ready');
  });

  it('still works out every label while paused, for the review screen', () => {
    const r = split(300_000, 850_000, tunde.plan);
    // ₦300,000 − ₦300 inflow − Mum ₦80,100 − Rent ₦150,100 − Tithe ₦30,075 = ₦39,425 left
    expect(r.lines.map((l) => [l.name, l.funding, l.amountKobo])).toEqual([
      ['Mum', 'Fully funded', naira(80_000)],
      ['Rent', 'Fully funded', naira(150_000)],
      ['Tithe', 'Fully funded', naira(30_000)],
      ['Savings', 'Partly funded', naira(39_350)],
      ['Investment', 'Skipped', 0],
    ]);
    expect(total(r)).toBe(naira(300_000));
  });

  it("labels Chiamaka's ₦210,000 payday (50%): last rule Partly funded with its shortfall", () => {
    const r = split(210_000, 420_000, chiamaka.plan);
    expect(r.status).toBe('ready');
    expect(r.lines.map((l) => [l.name, l.amountKobo, l.feeKobo, l.funding, l.shortfallKobo])).toEqual([
      ['Parents', naira(40_000), naira(75), 'Fully funded', 0],
      ["Siblings' school fees", naira(60_000), naira(100), 'Fully funded', 0],
      ['Tithe', naira(21_000), naira(75), 'Fully funded', 0],
      ['Transport', naira(60_000), naira(100), 'Fully funded', 0],
      ['Savings', naira(28_275), naira(75), 'Partly funded', naira(1_725)],
    ]);
    expect(r.remainder).toBeNull();
    expect(total(r)).toBe(naira(210_000));
  });

  it('skips every rule below the first one that runs short', () => {
    const plan: Plan = { rules: [fixed('A', 100_000), fixed('B', 50_000), fixed('C', 20_000)], remainder: everyday };
    const r = split(150_000, 200_000, plan);
    expect(r.lines.map((l) => [l.name, l.amountKobo, l.funding, l.reason, l.shortfallKobo])).toEqual([
      ['A', naira(100_000), 'Fully funded', undefined, 0],
      ['B', naira(49_525), 'Partly funded', undefined, naira(475)],
      ['C', 0, 'Skipped', 'Not enough money', naira(20_000)],
    ]);
  });

  it('skips a partial under ₦1,000 and sends that money to the remainder', () => {
    const plan: Plan = { rules: [fixed('A', 100_000), fixed('B', 50_000)], remainder: everyday };
    const r = split(101_000, 150_000, plan);
    expect(byName(r).B).toMatchObject({ amountKobo: 0, funding: 'Skipped', reason: 'Not enough money' });
    expect(MIN_PARTIAL_KOBO).toBe(naira(1_000));
    expect(r.remainder).toEqual({ name: 'Everyday account', amountKobo: naira(590), feeKobo: naira(10) });
    expect(total(r)).toBe(naira(101_000));
  });
});

describe('Larger payday (D5)', () => {
  it('pays fixed rules their set amount, percentages on the actual amount, and the extra to the remainder', () => {
    const r = split(1_000_000, 850_000, tunde.plan);
    const l = byName(r);
    expect(l.Mum.amountKobo).toBe(naira(80_000));
    expect(l.Rent.amountKobo).toBe(naira(150_000));
    expect(l.Investment.amountKobo).toBe(naira(50_000));
    expect(l.Tithe.amountKobo).toBe(naira(100_000));
    expect(l.Savings.amountKobo).toBe(naira(150_000));
    expect(r.remainder?.amountKobo).toBe(naira(469_125)); // 1,000,000 − 530,000 − 875
    expect(r.status).toBe('ready');
  });
});

describe('Priority order: fixed and percentage rules together (B6)', () => {
  it('funds whichever rule comes first, whatever its type', () => {
    const percentFirst: Plan = { rules: [percent('P', 50), fixed('F', 300_000)], remainder: everyday };
    const fixedFirst: Plan = { rules: [fixed('F', 300_000), percent('P', 50)], remainder: everyday };

    const a = split(400_000, 400_000, percentFirst);
    expect(a.lines.map((l) => [l.name, l.funding, l.amountKobo])).toEqual([
      ['P', 'Fully funded', naira(200_000)],
      ['F', 'Partly funded', naira(199_500)],
    ]);
    const b = split(400_000, 400_000, fixedFirst);
    expect(b.lines.map((l) => [l.name, l.funding, l.amountKobo])).toEqual([
      ['F', 'Fully funded', naira(300_000)],
      ['P', 'Partly funded', naira(99_500)],
    ]);
  });
});

describe('Once-per-month fixed rules (B5)', () => {
  const paidThisMonth = ['tunde-mum', 'tunde-rent', 'tunde-investment'];

  it('skip on the second income in a month, and their money goes to the remainder', () => {
    const r = split(850_000, 850_000, tunde.plan, { paidThisMonth });
    const l = byName(r);
    for (const name of ['Mum', 'Rent', 'Investment']) {
      expect(l[name]).toMatchObject({ amountKobo: 0, funding: 'Skipped', reason: 'Already paid this month' });
    }
    expect(l.Tithe.amountKobo).toBe(naira(85_000));
    expect(l.Savings.amountKobo).toBe(naira(127_500));
    expect(r.remainder?.amountKobo).toBe(naira(636_900)); // 850,000 − 300 − 85,100 − 127,600 − ₦100 fee
    expect(total(r)).toBe(naira(850_000));
  });

  it('do not skip "every income" rules', () => {
    const plan: Plan = {
      rules: [{ ...fixed('A', 10_000), frequency: 'everyIncome' }],
      remainder: everyday,
    };
    expect(split(100_000, 100_000, plan, { paidThisMonth: ['A'] }).lines[0].funding).toBe('Fully funded');
  });
});

describe('Skip a rule once (B13)', () => {
  it('marks the rule "Skipped by you" and adds its money to the remainder', () => {
    const r = split(850_000, 850_000, tunde.plan, { skipOnce: ['tunde-mum'] });
    expect(byName(r).Mum).toMatchObject({ funding: 'Skipped', reason: 'Skipped by you', amountKobo: 0 });
    expect(r.remainder?.amountKobo).toBe(naira(436_725)); // 356,625 + 80,000 + Mum's ₦100 fee
  });
});

describe('Plans the engine refuses (B10)', () => {
  it('rejects percentages over 100%', () => {
    const plan: Plan = { rules: [percent('A', 60), percent('B', 50)], remainder: everyday };
    expect(() => split(100_000, 100_000, plan)).toThrow('Your percentages add up to 110%');
  });
  it('accepts exactly 100%', () => {
    const plan: Plan = { rules: [percent('A', 60), percent('B', 40)], remainder: everyday };
    expect(() => split(100_000, 100_000, plan)).not.toThrow();
  });
});

describe('Payment too small to split (PRD 5.2)', () => {
  it('sends nothing and keeps the money unsplit', () => {
    const r = split(5, 850_000, tunde.plan);
    expect(r.status).toBe('tooSmall');
    expect(r.remainder).toBeNull();
    expect(r.lines.every((l) => l.amountKobo === 0)).toBe(true);
    expect(r.unsplitKobo).toBe(naira(5) - r.inflowFeeKobo);
  });
});

describe('Allocations + fees + unsplit = income, to the kobo (CLAUDE.md rule 7)', () => {
  // A fixed pseudo-random sequence, so every run checks the same incomes.
  function* incomes(seed: number, count: number) {
    let x = seed;
    for (let i = 0; i < count; i++) {
      x = (x * 1_103_515_245 + 12_345) % 2_147_483_648;
      yield 1 + (x % naira(3_000_000)); // 1 kobo to ₦3,000,000
    }
  }

  it.each(demoUsers.map((u) => [u.firstName, u] as const))('holds for %s on 1,000 incomes', (_, user) => {
    const allFixed = user.plan.rules.filter((r) => r.kind === 'fixed').map((r) => r.id);
    let i = 0;
    for (const incomeKobo of incomes(user.firstName.length * 7_919, 1_000)) {
      const paidThisMonth = i % 3 === 0 ? allFixed : [];
      const skipOnce = i % 5 === 0 ? [user.plan.rules[0].id] : [];
      const r = splitIncome({ incomeKobo, expectedKobo: user.expectedKobo, plan: user.plan, schedule, paidThisMonth, skipOnce });
      expect(total(r)).toBe(incomeKobo);
      expect(r.unsplitKobo).toBeGreaterThanOrEqual(0);
      for (const l of r.lines) {
        expect(Number.isSafeInteger(l.amountKobo)).toBe(true);
        expect(l.amountKobo).toBeLessThanOrEqual(l.targetKobo);
        if (l.funding === 'Partly funded') expect(l.amountKobo).toBeGreaterThanOrEqual(MIN_PARTIAL_KOBO);
      }
      i++;
    }
  });
});

describe('Deterministic (CLAUDE.md rule 5)', () => {
  it('gives the same result for the same inputs', () => {
    expect(split(612_345.67, 850_000, tunde.plan)).toEqual(split(612_345.67, 850_000, tunde.plan));
  });
});
