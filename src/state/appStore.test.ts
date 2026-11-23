import { nextOnboardingRoute, SMS_CODE_MS, useApp } from './appStore';

const store = () => useApp.getState();

beforeEach(() => store().resetDemo());

describe('sign-up and onboarding order (A1, S1-S5)', () => {
  it('walks Welcome -> Verify -> Set PIN -> Income setup -> done', () => {
    expect(nextOnboardingRoute(store())).toBe('/welcome');
    store().signUp({ phone: '+234 803 123 4567', email: 'Tunde@Example.com', password: 'password1', dateOfBirth: '1997-03-05' });
    expect(store().account).toMatchObject({ phone: '08031234567', email: 'tunde@example.com' });
    expect(store().account?.passwordHash).not.toBe('password1');
    expect(nextOnboardingRoute(store())).toBe('/verify-phone-email');

    store().sendSmsCode();
    const code = store().smsCode!.code;
    expect(store().verifySmsCode(code, Date.now())).toBe('ok');
    expect(nextOnboardingRoute(store())).toBe('/verify-phone-email'); // email still to confirm
    store().confirmEmail();
    expect(nextOnboardingRoute(store())).toBe('/set-pin');

    store().setPin('123456', true);
    expect(store().pin.pinHash).not.toBe('123456');
    expect(nextOnboardingRoute(store())).toBe('/income-setup');

    store().saveIncome({
      type: 'regular',
      expectedKobo: 85_000_000,
      frequency: 'monthly',
      payDayOfMonth: 25,
      payWeekday: null,
      qualifyingMinimumKobo: 42_500_000,
      arrival: 'forward',
      weeklyBatching: false,
    });
    expect(nextOnboardingRoute(store())).toBeNull();
  });
});

describe('SMS code (A1)', () => {
  beforeEach(() => {
    store().signUp({ phone: '08031234567', email: 'a@b.co', password: 'password1', dateOfBirth: '1990-01-01' });
    store().sendSmsCode();
  });
  it('is 6 digits', () => {
    expect(store().smsCode!.code).toMatch(/^\d{6}$/);
  });
  it('rejects a wrong code', () => {
    const wrong = store().smsCode!.code === '000000' ? '111111' : '000000';
    expect(store().verifySmsCode(wrong, Date.now())).toBe('wrong');
  });
  it('expires after 10 minutes', () => {
    const { code, expiresAt } = store().smsCode!;
    expect(expiresAt - Date.now()).toBeLessThanOrEqual(SMS_CODE_MS);
    expect(store().verifySmsCode(code, expiresAt + 1)).toBe('expired');
  });
});

describe('sign in (S31) and unlock (S32)', () => {
  beforeEach(() => {
    store().signUp({ phone: '08031234567', email: 'tunde@example.com', password: 'password1', dateOfBirth: '1990-01-01' });
    store().setPin('123456', false);
    store().lock();
  });
  it('signs in with phone or email and the right password', () => {
    expect(store().signIn('tunde@example.com', 'wrongpass')).toBe(false);
    expect(store().unlocked).toBe(false);
    expect(store().signIn('+2348031234567', 'password1')).toBe(true);
    expect(store().unlocked).toBe(true);
  });
  it('unlocks with the right PIN only', () => {
    expect(store().enterPin('000000', Date.now()).result).toBe('wrong');
    expect(store().unlocked).toBe(false);
    expect(store().enterPin('123456', Date.now()).result).toBe('ok');
    expect(store().unlocked).toBe(true);
  });
});

describe('destination hand-back from S8', () => {
  it('is taken once, only by the screen it was meant for', () => {
    const d = { bankName: 'GTBank', accountNumber: '0123454821', accountName: 'Folasade Adeyemi' };
    store().offerDestination('fallback', d);
    expect(store().takeDestination('rule')).toBeNull();
    expect(store().takeDestination('fallback')).toEqual(d);
    expect(store().takeDestination('fallback')).toBeNull();
  });
});
