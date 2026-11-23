import { ageOn, isEmail, isNigerianPhone, normalisePhone, parseDateOfBirth, passwordProblem } from './forms';

const today = new Date(2026, 10, 23); // 23 November 2026

describe('phone numbers', () => {
  it('accepts Nigerian mobiles in local or +234 form', () => {
    expect(isNigerianPhone('08031234567')).toBe(true);
    expect(isNigerianPhone('0803 123 4567')).toBe(true);
    expect(isNigerianPhone('+2348031234567')).toBe(true);
    expect(isNigerianPhone('09121234567')).toBe(true);
    expect(normalisePhone('+234 803 123 4567')).toBe('08031234567');
  });
  it('rejects other numbers', () => {
    expect(isNigerianPhone('0803123456')).toBe(false); // 10 digits
    expect(isNigerianPhone('01234567890')).toBe(false); // landline prefix
    expect(isNigerianPhone('')).toBe(false);
  });
});

describe('email and password', () => {
  it('checks email shape', () => {
    expect(isEmail('tunde@example.com')).toBe(true);
    expect(isEmail('tunde@example')).toBe(false);
    expect(isEmail('tunde example.com')).toBe(false);
  });
  it('needs a password of 8 or more characters', () => {
    expect(passwordProblem('short')).toBe('Use at least 8 characters.');
    expect(passwordProblem('longenough')).toBeNull();
  });
});

describe('date of birth and the age check (A2)', () => {
  it('reads real dates only', () => {
    expect(parseDateOfBirth('5', '3', '1997', today)).toBe('1997-03-05');
    expect(parseDateOfBirth('30', '2', '1997', today)).toBeNull();
    expect(parseDateOfBirth('1', '13', '1997', today)).toBeNull();
    expect(parseDateOfBirth('1', '1', '2030', today)).toBeNull();
    expect(parseDateOfBirth('1', '1', '97', today)).toBeNull();
  });
  it('turns 18 on the 18th birthday, not before', () => {
    expect(ageOn('2008-11-23', today)).toBe(18);
    expect(ageOn('2008-11-24', today)).toBe(17);
    expect(ageOn('1997-03-05', today)).toBe(29);
  });
});
