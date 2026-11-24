// Paydays end to end on the fake bank: D1, D2, D4, D5, D6, D7, D9, D10, D11, B5, B12, B13, D15.
import { paystackNov2026 as schedule } from '../data/feeSchedule';
import { tunde } from '../data/demoUsers';
import * as bank from '../fakebank/bankStore';
import { openAccount } from '../fakebank/identity';
import { useApp } from '../state/appStore';
import { narration, startEvent, unsplitKobo } from './events';
import {
  answerIsThisIncome,
  cancelEvent,
  executeEvent,
  handlePaymentNotice,
  holdEvent,
  latestEvent,
  resetPaydays,
  runInPriorityOrder,
  setSkipOnce,
  tick,
  usePaydays,
  bankTransfer,
} from './paydayStore';

const naira = (n: number) => Math.round(n * 100);
const app = () => useApp.getState();
const events = () => usePaydays.getState().events;
const latest = () => latestEvent(events())!;
const statuses = () => latest().transfers.map((t) => bankTransfer(t.reference)?.status);
let ref = 0;
const pay = (amountNaira: number, reference = `PAY${++ref}`) =>
  handlePaymentNotice({ reference, amountKobo: naira(amountNaira), sender: 'Employer' });

/** Moves the demo clock and runs the payday loop. */
async function after(ms: number) {
  bank.skipAhead(ms);
  await tick();
}

const fallback = { bankName: 'Kuda', accountNumber: '2004118832', accountName: 'Tunde Adeyemi' };

beforeEach(() => {
  app().resetDemo();
  bank.resetBank();
  resetPaydays();
  // Tunde, switched on with a 15-minute window.
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

describe('A normal payday (D2, D6)', () => {
  it('counts down, then sends every transfer, which all end Successful', async () => {
    expect(await pay(850_000)).toBe('event');
    expect(latest().stage).toBe('review');
    expect(usePaydays.getState().alerts.map((a) => a.title)).toContain('Income received');

    await after(14 * 60_000);
    expect(latest().stage).toBe('review'); // window still open
    await after(60_000);
    expect(latest().stage).toBe('sending');
    expect(latest().transfers).toHaveLength(6);

    await after(5_000);
    expect(statuses().every((s) => s === 'Successful')).toBe(true);
    expect(latest().stage).toBe('done');
    expect(usePaydays.getState().alerts.map((a) => a.title)).toContain('Payday split');
    // Only kobo that would cost more to send stay behind.
    expect(bank.balanceKobo()).toBe(latest().split.unsplitKobo);
  });

  it('"Execute now" sends at once', async () => {
    await pay(850_000);
    await executeEvent(latest().id);
    expect(latest().stage).toBe('sending');
  });

  it('D15: narration is "From Tunde Adeyemi – Mum"', () => {
    expect(narration('Tunde Adeyemi', 'Mum')).toBe('From Tunde Adeyemi – Mum');
    expect(narration('Tunde Adeyemi', 'A very long rule name that goes on and on').length).toBeLessThanOrEqual(50);
  });
});

describe('D9: no duplicates', () => {
  it('the same payment notice 10 times makes 1 event and 1 set of transfers', async () => {
    for (let i = 0; i < 10; i++) await pay(850_000, 'SAME');
    expect(events()).toHaveLength(1);
    await executeEvent(latest().id);
    await executeEvent(latest().id);
    expect(Object.keys(bank.useBank.getState().bank.transfers)).toHaveLength(6);
  });
});

describe('Short payday (D4)', () => {
  // Below 50% but above the qualifying minimum, so the event starts without "Is this income?".
  beforeEach(() => useApp.setState({ income: { ...app().income!, qualifyingMinimumKobo: naira(100_000) } }));

  it('below 50%: paused until "Run in priority order"', async () => {
    await pay(400_000);
    expect(latest().stage).toBe('needsApproval');
    await after(60 * 60_000);
    expect(latest().stage).toBe('needsApproval'); // nothing sent
    runInPriorityOrder(latest().id);
    expect(latest().stage).toBe('review');
  });

  it('"Adjust this payday" skips a rule once and works the split out again', async () => {
    await pay(400_000);
    const before = latest().split;
    setSkipOnce(latest().id, ['tunde-rent']);
    const rent = latest().split.lines.find((l) => l.ruleId === 'tunde-rent')!;
    expect(rent.funding).toBe('Skipped');
    expect(rent.reason).toBe('Skipped by you');
    expect(latest().split).not.toEqual(before);
  });

  it('"Hold" keeps it unsent; the money is not counted as unsplit', async () => {
    await pay(400_000);
    holdEvent(latest().id);
    expect(latest().stage).toBe('held');
    expect(unsplitKobo(bank.balanceKobo(), events())).toBe(0);
  });

  it('50% to 99%: runs in priority order with no approval; the remainder takes the cut', async () => {
    await pay(500_000);
    expect(latest().stage).toBe('review');
    expect(latest().split.lines.every((l) => l.funding)).toBe(true);
    expect(latest().split.remainder!.amountKobo).toBeLessThan(naira(500_000 - 405_000));
  });
});

describe('Below the qualifying minimum (D1)', () => {
  it('asks "Is this income?"; No leaves it unsplit', async () => {
    await pay(30_000);
    expect(latest().stage).toBe('askIncome');
    answerIsThisIncome(latest().id, false);
    expect(latest().stage).toBe('notIncome');
    expect(unsplitKobo(bank.balanceKobo(), events())).toBe(naira(30_000 - 300));
  });

  it('Yes on a payment under 50% of expected: waits for "Run in priority order" (D1 + D4)', async () => {
    await pay(30_000);
    answerIsThisIncome(latest().id, true);
    expect(latest().stage).toBe('needsApproval');
  });

  it('Yes on a payment at 50% or more: starts the review window', async () => {
    useApp.setState({ income: { ...app().income!, qualifyingMinimumKobo: naira(900_000) } });
    await pay(850_000);
    expect(latest().stage).toBe('askIncome');
    answerIsThisIncome(latest().id, true);
    expect(latest().stage).toBe('review');
  });
});

describe('Larger payday (D5)', () => {
  it('the extra goes to the remainder', async () => {
    await pay(1_000_000);
    expect(latest().split.remainder?.amountKobo).toBe(naira(469_125));
  });
});

describe('Once-per-month rules (B5, D11)', () => {
  it('a second payday in the month skips them', async () => {
    await pay(850_000);
    await executeEvent(latest().id);
    await pay(850_000);
    const mum = latest().split.lines.find((l) => l.ruleId === 'tunde-mum')!;
    expect(mum.funding).toBe('Skipped');
    expect(mum.reason).toBe('Already paid this month');
  });
});

describe('Plan changes wait for the next payday (B12)', () => {
  it('the event keeps the plan it started with', async () => {
    await pay(850_000);
    app().deleteRule('tunde-mum');
    expect(latest().plan.rules.some((r) => r.id === 'tunde-mum')).toBe(true);
  });
});

describe('Emergency cancel', () => {
  it('sends nothing and leaves the money unsplit', async () => {
    await pay(850_000);
    cancelEvent(latest().id);
    await after(20 * 60_000);
    expect(latest().stage).toBe('cancelled');
    expect(Object.keys(bank.useBank.getState().bank.transfers)).toHaveLength(0);
  });
});

describe('Failures and reversals (D7, D10)', () => {
  it('a temporary failure shows Retrying, then Sent to fallback after 6 hours, with alerts', async () => {
    await pay(850_000);
    bank.failNextTransfer('temporary');
    await executeEvent(latest().id);
    await after(5_000);
    expect(statuses()[0]).toBe('Retrying');
    expect(usePaydays.getState().alerts.some((a) => a.title === 'Mum: retrying')).toBe(true);
    expect(latest().stage).toBe('sending'); // not finished while retrying
    await after(6 * 60 * 60_000);
    expect(statuses()[0]).toBe('Sent to fallback');
    expect(latest().stage).toBe('done');
  });

  it('a reversal marks the transfer Reversed and returns the money', async () => {
    await pay(850_000);
    await executeEvent(latest().id);
    await after(5_000);
    const before = bank.balanceKobo();
    const reversed = bank.reverseLastSuccessful();
    await tick();
    expect(reversed).not.toBeNull();
    expect(bankTransfer(reversed!)?.status).toBe('Reversed');
    expect(bank.balanceKobo()).toBeGreaterThan(before);
    expect(usePaydays.getState().alerts.some((a) => a.title.endsWith('reversed'))).toBe(true);
  });
});

describe('Automation off', () => {
  it('money arrives but is not split', async () => {
    useApp.setState({ automation: { on: false, reviewWindowMinutes: 15, switchedOnAt: null } });
    expect(await pay(850_000)).toBe('automationOff');
    expect(events()).toHaveLength(0);
  });
});

describe('startEvent', () => {
  it('fees larger than the income: too small to split', () => {
    const e = startEvent({
      id: 'E',
      payment: { reference: 'P', amountKobo: 50, sender: 'x', receivedAt: 0 },
      expectedKobo: tunde.expectedKobo,
      qualifyingMinimumKobo: 0,
      plan: tunde.plan,
      paidThisMonth: [],
      reviewWindowMinutes: 15,
      schedule,
      now: 0,
    });
    expect(e.stage).toBe('tooSmall');
  });
});
