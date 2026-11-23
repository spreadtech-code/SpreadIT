// Fake bank identity check (A6) and account opening (A7).
import { partner } from '../data/partner';
import { accountDetailsText, checkIdentity, identityLockedOut, openAccount, tidyName } from './identity';

const person = { firstName: 'tunde', lastName: 'ADEYEMI' };

describe('Identity check (A6)', () => {
  it('passes a normal BVN and tidies the name', () => {
    expect(checkIdentity({ bvn: '22345678901', ...person })).toEqual({ ok: true, firstName: 'Tunde', lastName: 'Adeyemi' });
  });

  it.each([
    ['22345678000', 'bvnNotFound'],
    ['22345678111', 'nameMismatch'],
    ['22345678222', 'dobMismatch'],
    ['1234', 'invalidBvn'],
    ['2234567890a', 'invalidBvn'],
  ])('BVN %s fails with %s', (bvn, reason) => {
    expect(checkIdentity({ bvn, ...person })).toEqual({ ok: false, reason });
  });

  it('locks out after 3 fails in 24 hours, and lets go after', () => {
    const now = 1_000_000_000_000;
    const hour = 60 * 60 * 1000;
    expect(identityLockedOut([now - hour, now - 2 * hour], now)).toBe(false);
    expect(identityLockedOut([now - hour, now - 2 * hour, now - 3 * hour], now)).toBe(true);
    expect(identityLockedOut([now - 25 * hour, now - 2 * hour, now - 3 * hour], now)).toBe(false);
  });
});

describe('SpreadIT account (A7)', () => {
  const p = { firstName: 'Tunde', lastName: 'Adeyemi', phone: '+2348031234567' };

  it("is in the user's own name at the partner, with no SpreadIT prefix", () => {
    const a = openAccount(p);
    expect(a.bankName).toBe(partner.name);
    expect(a.accountName).toBe('Tunde Adeyemi');
    expect(a.accountNumber).toMatch(/^\d{10}$/);
  });

  it('gives the same person the same number every time', () => {
    expect(openAccount(p).accountNumber).toBe(openAccount({ ...p }).accountNumber);
    expect(openAccount({ ...p, phone: '+2348039999999' }).accountNumber).not.toBe(openAccount(p).accountNumber);
  });

  it('copies all 3 details in one go', () => {
    const text = accountDetailsText(openAccount(p));
    expect(text).toContain(partner.name);
    expect(text).toContain('Tunde Adeyemi');
    expect(text.split('\n')).toHaveLength(3);
  });

  it('tidies names', () => {
    expect(tidyName('  aDAEZE   mary ')).toBe('Adaeze Mary');
  });
});
