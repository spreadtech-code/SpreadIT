// Stage 7b: Send extra once (B14), Send to my account (D13), Forward mode
// reminders (A9), salary-switch kit (A10), and one-offs in the monthly summary (E4).
import { tunde } from '../data/demoUsers';
import { paystackNov2026 as schedule } from '../data/feeSchedule';
import { standingOrderBanks } from '../data/standingOrders';
import { maxSendable, transferFee } from '../engine/fees';
import * as bank from '../fakebank/bankStore';
import { openAccount } from '../fakebank/identity';
import { hrLetter } from '../lib/hrLetter';
import { payDates } from '../lib/payDates';
import { useApp } from '../state/appStore';
import {
  answerIsThisIncome,
  availableKobo,
  bankTransfer,
  executeEvent,
  forwardRemindersDue,
  handlePaymentNotice,
  latestEvent,
  resetPaydays,
  sendOneOff,
  tick,
  usePaydays,
} from './paydayStore';
import { monthlySummary } from './summary';

const naira = (n: number) => Math.round(n * 100);
const app = () => useApp.getState();
const store = () => usePaydays.getState();
const latest = () => latestEvent(store().events)!;
const titles = () => store().alerts.map((a) => a.title);
let ref = 0;
const pay = (amountNaira: number, sender = 'Tunde Adeyemi') =>
  handlePaymentNotice({ reference: `B7${++ref}`, amountKobo: naira(amountNaira), sender });
async function after(ms: number) {
  bank.skipAhead(ms);
  await tick();
}
/** Moves the demo clock to `hour` o'clock on Tunde's next payday (the 25th). */
async function toNextPayday(hour: number) {
  const next = payDates(app().income!, new Date(bank.now())).next!;
  const target = new Date(next.getFullYear(), next.getMonth(), next.getDate(), hour).getTime();
  await after(target - bank.now());
}

const fallback = { bankName: 'Kuda', accountNumber: '2004118832', accountName: 'Tunde Adeyemi' };
const mum = () => app().plan.rules.find((r) => r.name === 'Mum')!;

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
      arrival: 'forward',
      weeklyBatching: false,
    },
  });
  const person = { firstName: 'Tunde', lastName: 'Adeyemi' };
  app().identityPassed(person, openAccount({ ...person, phone: '08031234567' }), Date.now());
  app().switchOnAutomation(15, Date.now());
});

/** Puts unsplit money in the account: a payment Tunde says isn't income. */
async function unsplit(amountNaira: number) {
  await pay(amountNaira, 'A friend');
  answerIsThisIncome(latest().id, false);
}

describe('Send extra once (B14)', () => {
  it("sends to the rule's account from the balance; the plan is unchanged", async () => {
    await unsplit(80_000);
    const planBefore = app().plan;
    const before = availableKobo();
    const out = await sendOneOff({ kind: 'extra', ruleId: mum().id, name: 'Mum', categoryKey: 'family', destination: mum().destination!, amountKobo: naira(50_000) });
    expect(out.result).toBe('sent');
    expect(availableKobo()).toBe(before - naira(50_000) - transferFee(naira(50_000), schedule));
    expect(app().plan).toBe(planBefore);
    await after(5_000);
    const o = store().oneOffs[0];
    expect(bankTransfer(o.reference)?.status).toBe('Successful');
    expect(bankTransfer(o.reference)?.narration).toBe('From Tunde Adeyemi – Mum');
  });

  it('too little in the balance: nothing is sent, and the shortfall is given', async () => {
    await unsplit(30_000);
    const available = availableKobo();
    const out = await sendOneOff({ kind: 'extra', name: 'Mum', destination: mum().destination!, amountKobo: naira(50_000) });
    expect(out).toEqual({ result: 'insufficientFunds', shortKobo: naira(50_000) + transferFee(naira(50_000), schedule) - available });
    expect(store().oneOffs).toHaveLength(0);
  });

  it("never uses a payday that's still waiting to be split", async () => {
    await pay(850_000); // in its review window
    expect(availableKobo()).toBe(0);
    const out = await sendOneOff({ kind: 'extra', name: 'Mum', destination: mum().destination!, amountKobo: naira(1_000) });
    expect(out.result).toBe('insufficientFunds');
  });
});

describe('Send to my account (D13)', () => {
  it('sends up to the unsplit balance, leaving room for the fee', async () => {
    await unsplit(30_000);
    const most = maxSendable(availableKobo(), schedule);
    const out = await sendOneOff({ kind: 'toMyAccount', name: 'To my account', destination: fallback, amountKobo: most });
    expect(out.result).toBe('sent');
    expect(availableKobo()).toBeLessThan(transferFee(1, schedule) + 1);
    await after(5_000);
    expect(bankTransfer(store().oneOffs[0].reference)?.status).toBe('Successful');
  });

  it('a ₦1 transfer is allowed', async () => {
    await unsplit(30_000);
    expect((await sendOneOff({ kind: 'toMyAccount', name: 'To my account', destination: fallback, amountKobo: 100 })).result).toBe('sent');
  });
});

describe('Monthly summary with one-offs (E4)', () => {
  it('an extra adds to its category; money moved out shows as "To my account"; fees count', async () => {
    await unsplit(100_000);
    await sendOneOff({ kind: 'extra', ruleId: mum().id, name: 'Mum', categoryKey: 'family', destination: mum().destination!, amountKobo: naira(20_000) });
    await sendOneOff({ kind: 'toMyAccount', name: 'To my account', destination: fallback, amountKobo: naira(5_000) });
    await after(5_000);
    const t = new Date(bank.now());
    const s = monthlySummary(store().events, bank.useBank.getState().bank.transfers, t.getFullYear(), t.getMonth(), store().oneOffs);
    expect(s.sentByCategory).toEqual(
      expect.arrayContaining([
        { name: 'Black Tax / Family Support', kobo: naira(20_000) },
        { name: 'To my account', kobo: naira(5_000) },
      ]),
    );
    expect(s.feesKobo).toBe(latest().split.inflowFeeKobo + transferFee(naira(20_000), schedule) + transferFee(naira(5_000), schedule));
  });
});

describe('Forward mode reminders (A9)', () => {
  it('forwardRemindersDue: 9am, then 6pm only if nothing arrived, none after', () => {
    const at = (h: number) => new Date(2026, 10, 25, h).getTime();
    expect(forwardRemindersDue({ t: at(8), isPayday: true, sent: 0, arrivedToday: false })).toBeNull();
    expect(forwardRemindersDue({ t: at(9), isPayday: true, sent: 0, arrivedToday: false })).toBe('morning');
    expect(forwardRemindersDue({ t: at(12), isPayday: true, sent: 1, arrivedToday: false })).toBeNull();
    expect(forwardRemindersDue({ t: at(18), isPayday: true, sent: 1, arrivedToday: false })).toBe('evening');
    expect(forwardRemindersDue({ t: at(18), isPayday: true, sent: 1, arrivedToday: true })).toBeNull();
    expect(forwardRemindersDue({ t: at(20), isPayday: true, sent: 2, arrivedToday: false })).toBeNull();
    expect(forwardRemindersDue({ t: at(9), isPayday: false, sent: 0, arrivedToday: false })).toBeNull();
  });

  it('on payday: one 9am push with the account details', async () => {
    await toNextPayday(9);
    expect(titles()).toContain('Payday: forward your pay');
    const morning = store().alerts.find((a) => a.title === 'Payday: forward your pay')!;
    expect(morning.body).toContain(app().spreaditAccount!.accountNumber);
    expect(morning.route).toBe('/forward-mode-setup');
    await after(60 * 60_000);
    expect(titles().filter((x) => x === 'Payday: forward your pay')).toHaveLength(1);
  });

  it('no 6pm push when the salary was forwarded', async () => {
    await toNextPayday(9);
    await pay(850_000);
    await after(9 * 60 * 60_000); // 6pm
    expect(titles()).not.toContain('Your pay hasn’t arrived yet');
  });

  it('6pm push when nothing came, and none after', async () => {
    await toNextPayday(9);
    await after(9 * 60 * 60_000); // 6pm
    expect(titles()).toContain('Your pay hasn’t arrived yet');
    await after(3 * 60 * 60_000);
    expect(titles().filter((x) => x === 'Your pay hasn’t arrived yet')).toHaveLength(1);
  });

  it('no reminders when income is paid in directly', async () => {
    useApp.setState({ income: { ...app().income!, arrival: 'direct' } });
    await toNextPayday(9);
    await after(9 * 60 * 60_000);
    expect(titles().some((x) => x.startsWith('Payday: forward') || x.startsWith("Your salary hasn't"))).toBe(false);
  });

  it('standing-order steps cover 10 banks', () => {
    expect(standingOrderBanks).toHaveLength(10);
  });
});

describe('Salary-switch kit (A10)', () => {
  it('is offered once, after 2 successful paydays', async () => {
    for (let i = 0; i < 2; i++) {
      await pay(850_000);
      await executeEvent(latest().id);
      await after(5_000);
    }
    expect(titles().filter((x) => x === 'Ready to move your salary?')).toHaveLength(1);
    await pay(850_000);
    await executeEvent(latest().id);
    await after(5_000);
    expect(titles().filter((x) => x === 'Ready to move your salary?')).toHaveLength(1);
  });

  it('asks "Is this your salary now?" once, on the first payment from someone else', async () => {
    await pay(850_000, 'Tunde Adeyemi');
    expect(titles()).not.toContain('Is this your salary now?');
    await pay(850_000, 'Acme Ltd Payroll');
    await pay(850_000, 'Acme Ltd Payroll');
    expect(titles().filter((x) => x === 'Is this your salary now?')).toHaveLength(1);
  });

  it('the letter has the full name, account name, number, bank and date', () => {
    const account = app().spreaditAccount!;
    const letter = hrLetter({ fullName: 'Tunde Adeyemi', account, effectiveFrom: new Date(2026, 11, 25), today: new Date(2026, 10, 24) });
    expect(letter).toContain('Full name: Tunde Adeyemi');
    expect(letter).toContain(`Account name: ${account.accountName}`);
    expect(letter).toContain(`Account number: ${account.accountNumber}`);
    expect(letter).toContain(`Bank: ${account.bankName}`);
    expect(letter).toContain('starting from 25 December 2026');
  });
});
