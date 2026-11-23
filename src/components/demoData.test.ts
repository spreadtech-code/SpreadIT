import { tundeAllocations, tundeFeesKobo, tundeIncomeKobo } from './demoData';

// The Components screen example payday (from the engine) must balance and cost ₦875.
it('example payday: allocations + fees = income', () => {
  const allocated = tundeAllocations.reduce((sum, a) => sum + a.amountKobo, 0);
  expect(allocated + tundeFeesKobo).toBe(tundeIncomeKobo);
  expect(tundeFeesKobo).toBe(87_500); // ₦875, PRD 4.1
});
