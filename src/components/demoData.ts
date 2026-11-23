// Example data for the hidden Components screen only (stage 1b).
// Tunde's ₦850,000 payday (PRD 2.2), worked out by hand from the CLAUDE.md fee
// rates. Real numbers come from the split engine in stage 2.
//   Transfers: Mum ₦100, Rent ₦100, Tithe ₦100, Savings ₦100, Investment ₦75,
//   Remainder ₦100 (each = transfer fee + ₦50 stamp duty); inflow ₦300. Total ₦875.
import type { PaydayAllocation } from './PaydayCountdown';

export const tundeIncomeKobo = 85_000_000;
export const tundeFeesKobo = 87_500;

export const tundeAllocations: PaydayAllocation[] = [
  { id: 'mum', name: 'Mum', amountKobo: 8_000_000 },
  { id: 'rent', name: 'Rent reserve', amountKobo: 15_000_000 },
  { id: 'tithe', name: 'Tithe', amountKobo: 8_500_000 },
  { id: 'savings', name: 'Savings', amountKobo: 12_750_000 },
  { id: 'investment', name: 'Investment', amountKobo: 5_000_000 },
  { id: 'remainder', name: 'Everyday account', amountKobo: 35_662_500 },
];
