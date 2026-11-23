import { lookUpAccountName, resolveAccountName } from './resolveAccountName';

describe('fake resolveAccountName (B7)', () => {
  it("returns a demo user's real demo name", () => {
    expect(lookUpAccountName('gtbank', '0123454821')).toMatchObject({ ok: true, accountName: 'Folasade Adeyemi', bankName: 'GTBank' });
  });
  it('gives the same made-up name every time for the same number', () => {
    const a = lookUpAccountName('zenith', '1234567891');
    expect(a.ok).toBe(true);
    expect(lookUpAccountName('zenith', '1234567891')).toEqual(a);
  });
  it('says "not found" for numbers ending in 0000', () => {
    expect(lookUpAccountName('gtbank', '1234560000')).toEqual({ ok: false, reason: 'notFound' });
  });
  it('rejects anything but 10 digits, and unknown banks', () => {
    expect(lookUpAccountName('gtbank', '123456789')).toEqual({ ok: false, reason: 'invalidNumber' });
    expect(lookUpAccountName('gtbank', '12345678ab')).toEqual({ ok: false, reason: 'invalidNumber' });
    expect(lookUpAccountName('nobank', '1234567891')).toEqual({ ok: false, reason: 'unknownBank' });
  });
  it('answers within 5 seconds', async () => {
    const started = Date.now();
    await resolveAccountName('gtbank', '1234567891', 10);
    expect(Date.now() - started).toBeLessThan(5_000);
  });
});
