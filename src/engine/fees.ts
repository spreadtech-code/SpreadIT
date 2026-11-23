// Fees, worked out from a FeeSchedule (src/data/feeSchedule.ts). Pure functions.
import type { FeeSchedule } from '../data/feeSchedule';
import { formatNaira } from './format';
import { assertKobo, shareUp } from './money';

/** Inflow fee on a payment received: rate × payment, rounded up to the kobo, capped. */
export function inflowFee(incomeKobo: number, schedule: FeeSchedule): number {
  assertKobo(incomeKobo, 'Income');
  return Math.min(schedule.inflow.capKobo, shareUp(incomeKobo, schedule.inflow.rateBasisPoints));
}

/** Total cost of one transfer: its band fee plus stamp duty when it applies. */
export function transferFee(amountKobo: number, schedule: FeeSchedule): number {
  assertKobo(amountKobo, 'Transfer');
  if (amountKobo === 0) throw new Error('A transfer must be more than ₦0');
  const band = schedule.transferBands.find((b) => b.upToKobo === null || amountKobo <= b.upToKobo);
  if (!band) throw new Error('Fee schedule has no band for this amount');
  const stamp = amountKobo >= schedule.stampDuty.fromKobo ? schedule.stampDuty.feeKobo : 0;
  return band.feeKobo + stamp;
}

/**
 * The largest transfer that, with its own fee, fits in `availableKobo`.
 * Returns 0 when nothing fits.
 *
 * The fee only changes at band edges, so the answer is either "available minus
 * one of the possible fees" or an amount sitting exactly on an edge.
 */
export function maxSendable(availableKobo: number, schedule: FeeSchedule): number {
  assertKobo(availableKobo, 'Available');
  const edges = [
    ...schedule.transferBands.flatMap((b) => (b.upToKobo === null ? [] : [b.upToKobo])),
    schedule.stampDuty.fromKobo - 1,
  ];
  const fees = new Set<number>();
  for (const b of schedule.transferBands) {
    fees.add(b.feeKobo);
    fees.add(b.feeKobo + schedule.stampDuty.feeKobo);
  }
  const candidates = [...[...fees].map((f) => availableKobo - f), ...edges];
  let best = 0;
  for (const a of candidates) {
    if (a > best && a <= availableKobo && a + transferFee(a, schedule) <= availableKobo) best = a;
  }
  return best;
}

/** The cost line under an amount (B3), e.g. "Costs ₦75 to send". */
export function transferCostText(amountKobo: number, schedule: FeeSchedule): string {
  return `Costs ${formatNaira(transferFee(amountKobo, schedule))} to send`;
}
