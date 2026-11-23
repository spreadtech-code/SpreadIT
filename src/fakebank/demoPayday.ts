// TEMPORARY (Home built early, founder decision 23 Nov 2026): a pretend
// "last payday" so Home has something to show before the fake bank can receive
// income. It runs the user's own plan through the split engine at their
// expected amount and marks every transfer Successful.
// Stage 5 replaces this with real fake-bank paydays (receiveIncome, sendTransfer).
import type { FeeSchedule } from '../data/feeSchedule';
import { splitIncome } from '../engine/split';
import type { Destination, Plan, SplitResult } from '../engine/types';
import type { Income } from '../state/appStore';
import { payDates } from '../lib/payDates';

export type DemoTransferStatus = 'Successful' | 'Skipped';

export interface DemoTransfer {
  id: string;
  name: string;
  categoryKey?: string;
  destination?: Destination;
  amountKobo: number;
  status: DemoTransferStatus;
}

export interface DemoPayday {
  /** Always true: Home labels it "Demo payday". */
  demo: true;
  date: Date;
  nextDate: Date | null;
  split: SplitResult;
  /** Every rule in priority order, then the remainder. */
  transfers: DemoTransfer[];
}

/** Null when there is no income set up, or the plan can't be split yet. */
export function demoPayday(plan: Plan, income: Income | null, schedule: FeeSchedule, today: Date): DemoPayday | null {
  if (!income || income.expectedKobo <= 0 || plan.rules.length === 0) return null;
  let split: SplitResult;
  try {
    split = splitIncome({ incomeKobo: income.expectedKobo, expectedKobo: income.expectedKobo, plan, schedule });
  } catch {
    return null;
  }
  const { last, next } = payDates(income, today);
  const byId = new Map(plan.rules.map((r) => [r.id, r]));

  const transfers: DemoTransfer[] = split.lines.map((l) => ({
    id: l.ruleId,
    name: l.name,
    categoryKey: byId.get(l.ruleId)?.categoryKey,
    destination: byId.get(l.ruleId)?.destination,
    amountKobo: l.amountKobo,
    status: l.amountKobo > 0 ? 'Successful' : 'Skipped',
  }));
  if (split.remainder) {
    transfers.push({
      id: 'remainder',
      name: split.remainder.name,
      destination: plan.remainder?.destination,
      amountKobo: split.remainder.amountKobo,
      status: 'Successful',
    });
  }
  return { demo: true, date: last, nextDate: next, split, transfers };
}
