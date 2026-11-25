// Stage 7a: Emergency pause and resume (F1), one-time codes (F2), the 24-hour
// account wait (F3), change alerts (F4), auto-lock (F5), pause reminders (G3),
// notification settings (G2) and sign out (A3, F6).
import { tunde } from '../data/demoUsers';
import type { Destination, Rule } from '../engine/types';
import * as bank from '../fakebank/bankStore';
import { openAccount } from '../fakebank/identity';
import { AUTO_LOCK_MS, shouldLock } from '../lib/autoLock';
import {
  bankTransfer,
  executeEvent,
  handlePaymentNotice,
  latestEvent,
  pauseAutomation,
  pauseReminderDue,
  resetPaydays,
  runInPriorityOrder,
  securityAlerts,
  tick,
  usePaydays,
} from '../payday/paydayStore';
import { isLive, isPaused, useApp } from './appStore';
import { activeDestination, activePlan, changeAlerts, COOLDOWN_MS, cooldownText, withCooldown } from './sensitiveChanges';

const naira = (n: number) => Math.round(n * 100);
const app = () => useApp.getState();
const latest = () => latestEvent(usePaydays.getState().events)!;
const alerts = () => usePaydays.getState().alerts;
let ref = 0;
const pay = (amountNaira: number) =>
  handlePaymentNotice({ reference: `SEC${++ref}`, amountKobo: naira(amountNaira), sender: 'Employer' });
async function after(ms: number) {
  bank.skipAhead(ms);
  await tick();
}
const DAY = 24 * 60 * 60 * 1000;

const fallback: Destination = { bankName: 'Kuda', accountNumber: '2004118832', accountName: 'Tunde Adeyemi' };
const newMumAccount: Destination = { bankName: 'Access Bank', accountNumber: '0691234567', accountName: 'Funke Adeyemi' };
const mum = () => app().plan.rules.find((r) => r.name === 'Mum')!;

/** Submits whatever code is pending, with the right code. */
const rightCode = () => app().submitChangeCode(app().pendingChange!.code, Date.now(), bank.now());

beforeEach(() => {
  app().resetDemo();
  bank.resetBank();
  resetPaydays();
  useApp.setState({
    plan: tunde.plan,
    fallback,
    income: {
      type: 'regular',
      expectedKobo: tunde.expectedKobo,
      frequency: 'monthly',
      payDayOfMonth: 25,
      payWeekday: null,
      qualifyingMinimumKobo: tunde.qualifyingMinimumKobo,
      arrival: 'direct',
      weeklyBatching: false,
    },
  });
  const person = { firstName: 'Tunde', lastName: 'Adeyemi' };
  app().identityPassed(person, openAccount({ ...person, phone: '08031234567' }), Date.now());
  app().switchOnAutomation(15, Date.now());
});

describe('Emergency pause (F1)', () => {
  it('during the review window: nothing is sent, even after the window would have closed', async () => {
    await pay(850_000);
    expect(latest().stage).toBe('review');
    pauseAutomation(bank.now());
    expect(isPaused(app())).toBe(true);
    expect(latest().stage).toBe('held');

    await after(60 * 60_000);
    await executeEvent(latest().id); // "Execute now" while paused
    expect(latest().stage).toBe('held');
    expect(latest().transfers).toHaveLength(0);
  });

  it('income arriving while paused is held, with an alert saying so', async () => {
    pauseAutomation(bank.now());
    await pay(850_000);
    expect(latest().stage).toBe('held');
    expect(alerts().at(-1)!.body).toContain('Autopilot is paused');
    runInPriorityOrder(latest().id); // still held while paused
    expect(latest().stage).toBe('held');
  });

  it('transfers already with the bank finish', async () => {
    await pay(850_000);
    await executeEvent(latest().id);
    pauseAutomation(bank.now());
    await after(5_000);
    expect(latest().transfers.every((t) => bankTransfer(t.reference)?.status === 'Successful')).toBe(true);
  });

  it('resuming needs a one-time code; then "Execute now" sends the held payday', async () => {
    await pay(850_000);
    pauseAutomation(bank.now());
    app().requestChange({ kind: 'resume' });
    expect(app().submitChangeCode('000000' === app().pendingChange!.code ? '111111' : '000000', Date.now(), bank.now()).result).toBe('wrong');
    expect(isPaused(app())).toBe(true);
    expect(rightCode().result).toBe('ok');
    expect(isPaused(app())).toBe(false);
    await executeEvent(latest().id);
    expect(latest().stage).toBe('sending');
  });
});

describe('Pause reminders (G3)', () => {
  it('1 push at day 7, 1 at day 14, none after', async () => {
    pauseAutomation(bank.now());
    const count = () => alerts().filter((a) => a.title === 'Autopilot is paused').length;
    await after(6 * DAY);
    expect(count()).toBe(0);
    await after(DAY);
    expect(count()).toBe(1);
    expect(alerts().at(-1)!.body).toMatch(/^Autopilot is paused\. Resume before your next payday on \d+ \w+\?$/);
    expect(alerts().at(-1)!.route).toBe('/verify-change?resume=1');
    await after(7 * DAY);
    expect(count()).toBe(2);
    await after(30 * DAY);
    expect(count()).toBe(2);
  });

  it('pauseReminderDue', () => {
    expect(pauseReminderDue(null, 0, 100 * DAY)).toBe(false);
    expect(pauseReminderDue(0, 0, 7 * DAY)).toBe(true);
    expect(pauseReminderDue(0, 1, 13 * DAY)).toBe(false);
    expect(pauseReminderDue(0, 1, 14 * DAY)).toBe(true);
    expect(pauseReminderDue(0, 2, 99 * DAY)).toBe(false);
  });
});

describe('One-time codes (F2)', () => {
  it('only once automation is live', () => {
    expect(isLive(app())).toBe(true);
    app().resetDemo();
    expect(isLive(app())).toBe(false);
  });

  it('a change is saved only after the right code', () => {
    const changed: Rule = { ...mum(), destination: newMumAccount };
    app().requestChange({ kind: 'saveRule', rule: changed });
    expect(mum().destination?.accountNumber).not.toBe(newMumAccount.accountNumber);
    const outcome = rightCode();
    expect(outcome.result).toBe('ok');
    expect(mum().destination).toEqual(newMumAccount);
    expect(app().pendingChange).toBeNull();
  });

  it('3 wrong codes cancel the change', () => {
    app().requestChange({ kind: 'reviewWindow', minutes: 60 });
    const wrong = app().pendingChange!.code === '000000' ? '111111' : '000000';
    expect(app().submitChangeCode(wrong, Date.now(), bank.now())).toEqual({ result: 'wrong', triesLeft: 2 });
    expect(app().submitChangeCode(wrong, Date.now(), bank.now())).toEqual({ result: 'wrong', triesLeft: 1 });
    expect(app().submitChangeCode(wrong, Date.now(), bank.now())).toEqual({ result: 'cancelled' });
    expect(app().pendingChange).toBeNull();
    expect(app().automation.reviewWindowMinutes).toBe(15);
  });

  it('an expired code is refused', () => {
    app().requestChange({ kind: 'reviewWindow', minutes: 60 });
    const code = app().pendingChange!.code;
    expect(app().submitChangeCode(code, Date.now() + 11 * 60_000, bank.now()).result).toBe('expired');
    expect(app().automation.reviewWindowMinutes).toBe(15);
  });

  it('deleting rules and changing the fallback account go through the code too', () => {
    const before = app().plan.rules.length;
    app().requestChange({ kind: 'deleteRules', ruleIds: [mum().id] });
    rightCode();
    expect(app().plan.rules).toHaveLength(before - 1);

    const newFallback: Destination = { bankName: 'Opay', accountNumber: '8031234567', accountName: 'Tunde Adeyemi' };
    app().requestChange({ kind: 'remainderFallback', remainderName: 'Everyday spending', remainder: app().plan.remainder!.destination!, fallback: newFallback });
    rightCode();
    expect(app().fallback).toEqual(newFallback);
  });
});

describe('24-hour wait for a new account (F3)', () => {
  it('a payday inside the 24 hours pays the old account; after, the new one', async () => {
    const oldAccount = mum().destination!;
    app().requestChange({ kind: 'saveRule', rule: { ...mum(), destination: newMumAccount } });
    rightCode();
    expect(cooldownText(mum(), bank.now())).toMatch(/^New account active on \d+ \w+, /);

    await pay(850_000);
    await executeEvent(latest().id);
    const first = latest().transfers.find((t) => t.name === 'Mum')!;
    expect(first.destination).toEqual(oldAccount);

    await after(DAY);
    expect(cooldownText(mum(), bank.now())).toBeNull();
    // Mum is once a month, so a 2nd payday this month skips her (B5); the
    // payday's plan shows which account she would be paid to.
    await pay(850_000);
    expect(latest().plan.rules.find((r) => r.name === 'Mum')!.destination).toEqual(newMumAccount);
  });

  it('a brand-new rule pays the fallback account for its first 24 hours', () => {
    const rule: Rule = { id: 'new', name: 'School fees', kind: 'fixed', amountKobo: naira(20_000), frequency: 'everyIncome', destination: newMumAccount };
    const after = withCooldown(undefined, rule, 1_000);
    expect(after.destinationActiveFrom).toBe(1_000 + COOLDOWN_MS);
    expect(activeDestination(after, 1_000)).toBeUndefined(); // -> fallback
    expect(activeDestination(after, 1_000 + COOLDOWN_MS)).toEqual(newMumAccount);
  });

  it('an edit that keeps the same account keeps any wait already running, and starts none', () => {
    const rule: Rule = { id: 'r', name: 'Mum', kind: 'fixed', amountKobo: 1, frequency: 'everyIncome', destination: newMumAccount };
    expect(withCooldown(rule, { ...rule, amountKobo: 2 }, 5).destinationActiveFrom).toBeUndefined();
    const waiting = withCooldown(undefined, rule, 5);
    expect(withCooldown(waiting, { ...rule, amountKobo: 2 }, 10).destinationActiveFrom).toBe(5 + COOLDOWN_MS);
  });

  it('activePlan swaps every waiting account, the remainder too', () => {
    const old = { name: 'Everyday', destination: fallback };
    const plan = { rules: [], remainder: withCooldown(old, { name: 'Everyday', destination: newMumAccount }, 0) };
    expect(activePlan(plan, 1).remainder!.destination).toEqual(fallback);
    expect(activePlan(plan, COOLDOWN_MS).remainder!.destination).toEqual(newMumAccount);
  });
});

describe('Change alerts (F4)', () => {
  it('name the rule and the old and new account, last 4 digits only, with "This wasn\'t me"', () => {
    const before = { plan: app().plan, fallback, reviewWindowMinutes: 15 };
    const [a] = changeAlerts({ kind: 'saveRule', rule: { ...mum(), destination: newMumAccount } }, before, 0);
    const oldDigits = mum().destination!.accountNumber;
    expect(a.body).toContain('Mum: account changed from');
    expect(a.body).toContain(`••${oldDigits.slice(-4)}`);
    expect(a.body).toContain('Access Bank ••4567');
    expect(a.body).not.toContain(newMumAccount.accountNumber);
    expect(a.body).not.toContain(oldDigits);
    expect(a.body).toContain('Wasn’t you?');
  });

  it('tapping the alert opens "This wasn\'t me", which pauses', () => {
    securityAlerts([{ title: 't', body: 'b' }]);
    expect(alerts().at(-1)!.route).toBe('/emergency-pause?notMe=1');
  });
});

describe('Settings', () => {
  it('auto-lock after 5 minutes in the background (F5)', () => {
    expect(shouldLock(AUTO_LOCK_MS - 1)).toBe(false);
    expect(shouldLock(AUTO_LOCK_MS)).toBe(true);
  });

  it('payday summary SMS can be switched off (G2)', async () => {
    await pay(850_000);
    await executeEvent(latest().id);
    await after(5_000);
    expect(alerts().find((a) => a.title === 'Payday’s done')!.body).toContain('Also sent by SMS.');

    app().setPaydaySummarySms(false);
    await pay(850_000);
    await executeEvent(latest().id);
    await after(5_000);
    expect(alerts().filter((a) => a.title === 'Payday’s done').at(-1)!.body).not.toContain('SMS');
  });

  it('sign out ends the session; the next start asks for the password (A3)', () => {
    useApp.setState({ unlocked: true });
    app().signOut();
    expect(app().unlocked).toBe(false);
    expect(app().signedOut).toBe(true);
  });

  it('signing out another phone removes it (F6)', () => {
    expect(app().otherDevices).toHaveLength(1);
    app().signOutDevice(app().otherDevices[0].id);
    expect(app().otherDevices).toHaveLength(0);
  });

});
