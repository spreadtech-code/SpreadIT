import { paystackNov2026 as schedule } from '../data/feeSchedule';
import { inflowFee, maxSendable, transferCostText, transferFee } from './fees';

const naira = (n: number) => Math.round(n * 100); // test helper: naira -> kobo

describe('inflow fee: 1% of the payment, capped at ₦300', () => {
  it('is 1% below the cap', () => {
    expect(inflowFee(naira(10_000), schedule)).toBe(naira(100));
  });
  it('stops at ₦300', () => {
    expect(inflowFee(naira(30_000), schedule)).toBe(naira(300));
    expect(inflowFee(naira(850_000), schedule)).toBe(naira(300));
  });
  it('rounds a part-kobo fee up', () => {
    expect(inflowFee(1_234_567, schedule)).toBe(12_346); // 1% of ₦12,345.67 = 12,345.67 kobo
    expect(inflowFee(1, schedule)).toBe(1);
  });
});

describe('transfer fee by band, plus ₦50 stamp duty from ₦10,000', () => {
  it.each([
    [naira(1), naira(10)],
    [naira(5_000), naira(10)],
    [naira(5_000) + 1, naira(25)],
    [naira(9_999.99), naira(25)],
    [naira(10_000), naira(75)],
    [naira(50_000), naira(75)],
    [naira(50_000) + 1, naira(100)],
    [naira(850_000), naira(100)],
  ])('%i kobo costs %i kobo', (amount, fee) => {
    expect(transferFee(amount, schedule)).toBe(fee);
  });
  it('refuses a ₦0 transfer', () => {
    expect(() => transferFee(0, schedule)).toThrow();
  });
  it('writes the cost line for the rule editor', () => {
    expect(transferCostText(naira(50_000), schedule)).toBe('Costs ₦75 to send');
  });
});

describe('maxSendable: the biggest transfer that fits with its own fee', () => {
  const fits = (a: number, available: number) => a === 0 || a + transferFee(a, schedule) <= available;

  function check(available: number) {
    const a = maxSendable(available, schedule);
    expect(fits(a, available)).toBe(true);
    // a + fee(a) only ever goes up as a goes up, so if a + 1 doesn't fit, nothing bigger does.
    expect(fits(a + 1, available)).toBe(false);
  }

  it('is right on every kobo around each band edge', () => {
    const edges = [naira(5_000), naira(10_000), naira(50_000)];
    for (const edge of edges) {
      for (let available = edge - 20_000; available <= edge + 20_000; available++) check(available);
    }
  });

  it('is right on a spread of other amounts', () => {
    for (let available = 0; available <= naira(2_000_000); available += 9_973) check(available);
  });

  it('is 0 when not even the smallest fee fits', () => {
    expect(maxSendable(naira(10), schedule)).toBe(0);
    expect(maxSendable(naira(10) + 1, schedule)).toBe(1);
  });
});
