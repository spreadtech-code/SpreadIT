// Founder additions, 25 Nov 2026: Notifications inbox, Change PIN, the face or
// fingerprint switch, and Forgot password.
import * as bank from '../fakebank/bankStore';
import { dismissAlert, INBOX_LIMIT, markInboxSeen, resetPaydays, securityAlerts, unreadCount, usePaydays } from '../payday/paydayStore';
import { SMS_CODE_MS, useApp } from './appStore';

const app = () => useApp.getState();
const store = () => usePaydays.getState();

beforeEach(() => {
  app().resetDemo();
  bank.resetBank();
  resetPaydays();
  app().signUp({ phone: '08031234567', email: 'tunde@example.com', password: 'first-password', dateOfBirth: '1990-04-12' });
  app().setPin('123456', false);
});

describe('Notifications inbox', () => {
  it('keeps every alert after its pop-down is closed, newest last, and marks security ones', () => {
    securityAlerts([{ title: 'Email and SMS: your plan changed', body: 'Mum changed.' }]);
    const first = store().alerts[0];
    dismissAlert(first.id);
    expect(store().alerts).toHaveLength(0);
    expect(store().inbox).toHaveLength(1);
    expect(store().inbox[0]).toMatchObject({ title: 'Email and SMS: your plan changed', kind: 'security' });
  });

  it('counts unread until the screen is opened', () => {
    securityAlerts([{ title: 'A', body: 'a' }, { title: 'B', body: 'b' }]);
    expect(unreadCount(store())).toBe(2);
    bank.skipAhead(1000);
    markInboxSeen();
    expect(unreadCount(store())).toBe(0);
    bank.skipAhead(1000);
    securityAlerts([{ title: 'C', body: 'c' }]);
    expect(unreadCount(store())).toBe(1);
  });

  it(`keeps only the newest ${INBOX_LIMIT}`, () => {
    securityAlerts(Array.from({ length: INBOX_LIMIT + 5 }, (_, i) => ({ title: `T${i}`, body: '' })));
    expect(store().inbox).toHaveLength(INBOX_LIMIT);
    expect(store().inbox[0].title).toBe('T5');
  });
});

describe('Change PIN', () => {
  it('replaces the PIN and keeps the face or fingerprint choice', () => {
    app().setBiometric(true);
    app().changePin('654321');
    expect(app().enterPin('123456', Date.now()).result).toBe('wrong');
    expect(app().enterPin('654321', Date.now()).result).toBe('ok');
    expect(app().pin.biometric).toBe(true);
  });

  it('the face or fingerprint switch can be turned off and on', () => {
    app().setBiometric(true);
    expect(app().pin.biometric).toBe(true);
    app().setBiometric(false);
    expect(app().pin.biometric).toBe(false);
  });
});

describe('Forgot password', () => {
  it('sends a code only for this phone’s account (phone or email)', () => {
    expect(app().requestPasswordReset('someone@else.com')).toBe(false);
    expect(app().smsCode).toBeNull();
    expect(app().requestPasswordReset('0803 123 4567')).toBe(true);
    expect(app().smsCode?.code).toMatch(/^\d{6}$/);
    expect(app().requestPasswordReset('TUNDE@example.com')).toBe(true);
  });

  it('a wrong or expired code changes nothing', () => {
    app().signOut();
    app().requestPasswordReset('tunde@example.com');
    const { code, expiresAt } = app().smsCode!;
    const wrong = code === '000000' ? '111111' : '000000';
    expect(app().resetPassword(wrong, 'new-password', Date.now())).toBe('wrong');
    expect(app().resetPassword(code, 'new-password', expiresAt + 1)).toBe('expired');
    expect(app().signIn('tunde@example.com', 'new-password')).toBe(false);
    expect(app().signIn('tunde@example.com', 'first-password')).toBe(true);
  });

  it('the right code sets the new password and logs in', () => {
    app().signOut();
    app().requestPasswordReset('08031234567');
    const { code } = app().smsCode!;
    expect(app().resetPassword(code, 'new-password', Date.now() + SMS_CODE_MS - 1)).toBe('ok');
    expect(app().signedOut).toBe(false);
    expect(app().unlocked).toBe(true);
    expect(app().smsCode).toBeNull();
    app().signOut();
    expect(app().signIn('tunde@example.com', 'first-password')).toBe(false);
    expect(app().signIn('tunde@example.com', 'new-password')).toBe(true);
  });
});
