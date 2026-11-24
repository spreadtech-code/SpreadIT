// Pay dates shown on Home (E1).
import { automationText, dayMonth, daysBetween, payDates } from './payDates';

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const monthly = (payDayOfMonth: number) => ({ frequency: 'monthly' as const, payDayOfMonth, payWeekday: null });

describe('Monthly pay', () => {
  it('after payday: last is this month, next is next month', () => {
    const p = payDates(monthly(25), day(2026, 11, 26));
    expect(p.last).toEqual(day(2026, 11, 25));
    expect(p.next).toEqual(day(2026, 12, 25));
  });

  it('before payday: last is last month', () => {
    const p = payDates(monthly(25), day(2026, 11, 23));
    expect(p.last).toEqual(day(2026, 10, 25));
    expect(p.next).toEqual(day(2026, 11, 25));
  });

  it('on payday: today is the last payday', () => {
    expect(payDates(monthly(25), day(2026, 11, 25)).last).toEqual(day(2026, 11, 25));
  });

  it('the 31st moves to the last day of shorter months', () => {
    const p = payDates(monthly(31), day(2026, 11, 15));
    expect(p.last).toEqual(day(2026, 10, 31));
    expect(p.next).toEqual(day(2026, 11, 30));
  });

  it('crosses the year end', () => {
    expect(payDates(monthly(25), day(2026, 12, 28)).next).toEqual(day(2027, 1, 25));
  });
});

describe('Weekly and 2-weekly pay', () => {
  // 23 November 2026 is a Monday.
  it('weekly on Friday', () => {
    const p = payDates({ frequency: 'weekly', payDayOfMonth: null, payWeekday: 5 }, day(2026, 11, 23));
    expect(p.last).toEqual(day(2026, 11, 20));
    expect(p.next).toEqual(day(2026, 11, 27));
  });

  it('every 2 weeks on Monday, paid today', () => {
    const p = payDates({ frequency: 'twoWeekly', payDayOfMonth: null, payWeekday: 1 }, day(2026, 11, 23));
    expect(p.last).toEqual(day(2026, 11, 23));
    expect(p.next).toEqual(day(2026, 12, 7));
  });
});

describe('Income that varies', () => {
  it('has no next pay date', () => {
    expect(payDates({ frequency: 'weekly', payDayOfMonth: null, payWeekday: null }, day(2026, 11, 23)).next).toBeNull();
  });
});

describe('Words', () => {
  it('writes dates as "25 November"', () => {
    expect(dayMonth(day(2026, 11, 25))).toBe('25 November');
  });

  it('counts calendar days', () => {
    expect(daysBetween(day(2026, 11, 25), day(2026, 12, 25))).toBe(30);
  });

  it('writes the callout', () => {
    const today = day(2026, 11, 25);
    expect(automationText(day(2026, 12, 25), today)).toBe('Automation on · next payday in 30 days');
    expect(automationText(day(2026, 11, 26), today)).toBe('Automation on · next payday tomorrow');
    expect(automationText(today, today)).toBe('Automation on · payday today');
    expect(automationText(null, today)).toBe('Automation on');
  });
});
