import { tundeAllocations, tundeFeesKobo, tundeIncomeKobo } from './demoData';

// The Components screen's example payday must balance to the kobo (CLAUDE.md rule 7).
it('example payday: allocations + fees = income', () => {
  const allocated = tundeAllocations.reduce((sum, a) => sum + a.amountKobo, 0);
  expect(allocated + tundeFeesKobo).toBe(tundeIncomeKobo);
  expect(tundeFeesKobo).toBe(87_500); // ₦875, PRD 4.1
});
