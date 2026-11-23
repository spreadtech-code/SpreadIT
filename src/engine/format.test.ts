import { formatNaira, groupThousands, maskAccount, nairaParts } from './format';

describe('formatNaira (CLAUDE.md rule 4)', () => {
  it('shows whole naira with thousands separators', () => {
    expect(formatNaira(85_000_000)).toBe('₦850,000');
    expect(formatNaira(123_456_700)).toBe('₦1,234,567');
    expect(formatNaira(87_500)).toBe('₦875');
    expect(formatNaira(0)).toBe('₦0');
  });

  it('adds kobo only when there are kobo', () => {
    expect(formatNaira(123_456_750)).toBe('₦1,234,567.50');
    expect(formatNaira(5)).toBe('₦0.05');
    expect(formatNaira(100_001)).toBe('₦1,000.01');
  });

  it('marks money in with + and money owed with -', () => {
    expect(formatNaira(8_500_000, { plus: true })).toBe('+₦85,000');
    expect(formatNaira(0, { plus: true })).toBe('₦0');
    expect(formatNaira(-5_000)).toBe('-₦50');
  });

  it('refuses money that is not whole kobo', () => {
    expect(() => formatNaira(10.5)).toThrow();
    expect(() => formatNaira(Number.NaN)).toThrow();
  });
});

describe('nairaParts', () => {
  it('always gives two kobo digits for the hero', () => {
    expect(nairaParts(85_000_000)).toEqual({ sign: '', naira: '₦850,000', kobo: '00' });
    expect(nairaParts(100_020)).toEqual({ sign: '', naira: '₦1,000', kobo: '20' });
  });
});

describe('groupThousands', () => {
  it('groups digits in threes', () => {
    expect(groupThousands(1)).toBe('1');
    expect(groupThousands(1000)).toBe('1,000');
    expect(groupThousands(10_000_000)).toBe('10,000,000');
  });
});

describe('maskAccount', () => {
  it('shows only the last 4 digits', () => {
    expect(maskAccount('0123454821')).toBe('••4821');
    expect(maskAccount('012 345 4821')).toBe('••4821');
  });
});
