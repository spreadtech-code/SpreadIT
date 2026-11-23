// Example data for the hidden Components screen only.
// Tunde's ₦850,000 payday (PRD 2.2), worked out by the split engine.
import { feeSchedule } from '../data/feeSchedule';
import { tunde } from '../data/demoUsers';
import { splitIncome } from '../engine/split';
import type { PaydayAllocation } from './PaydayCountdown';

const payday = splitIncome({
  incomeKobo: tunde.expectedKobo,
  expectedKobo: tunde.expectedKobo,
  plan: tunde.plan,
  schedule: feeSchedule,
});

export const tundeIncomeKobo = payday.incomeKobo;
export const tundeFeesKobo = payday.totalFeesKobo;
export const tundeAllocations: PaydayAllocation[] = [
  ...payday.lines.map((l) => ({ id: l.ruleId, name: l.name, amountKobo: l.amountKobo })),
  ...(payday.remainder
    ? [{ id: 'remainder', name: payday.remainder.name, amountKobo: payday.remainder.amountKobo }]
    : []),
];
