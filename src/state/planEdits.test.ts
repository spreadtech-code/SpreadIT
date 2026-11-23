import type { Plan, Rule } from '../engine/types';
import { emptyPlan, moveRule, removeRule, setOrder, setSkipNext, upsertRule } from './planEdits';

const rule = (id: string): Rule => ({ id, name: id, kind: 'fixed', amountKobo: 100_000, frequency: 'oncePerMonth' });
const ids = (p: Plan) => p.rules.map((r) => r.id);
const abc = [rule('a'), rule('b'), rule('c')].reduce(upsertRule, emptyPlan);

describe('plan edits', () => {
  it('adds new rules at the bottom and replaces existing ones in place', () => {
    expect(ids(abc)).toEqual(['a', 'b', 'c']);
    const edited = upsertRule(abc, { ...rule('b'), name: 'B2' });
    expect(edited.rules.map((r) => r.name)).toEqual(['a', 'B2', 'c']);
  });

  it('removes a rule', () => {
    expect(ids(removeRule(abc, 'b'))).toEqual(['a', 'c']);
  });

  it('reorders after a drag and renumbers priorities 1 to n (B6)', () => {
    expect(ids(setOrder(abc, ['c', 'a', 'b']))).toEqual(['c', 'a', 'b']);
    expect(ids(setOrder(abc, ['c']))).toEqual(['c', 'a', 'b']); // missing ids keep their order after
  });

  it('moves a rule up or down, and stops at the ends', () => {
    expect(ids(moveRule(abc, 'b', -1))).toEqual(['b', 'a', 'c']);
    expect(ids(moveRule(abc, 'b', 1))).toEqual(['a', 'c', 'b']);
    expect(ids(moveRule(abc, 'a', -1))).toEqual(['a', 'b', 'c']);
    expect(ids(moveRule(abc, 'c', 1))).toEqual(['a', 'b', 'c']);
  });

  it('marks and clears "skip next payday" (B13)', () => {
    const skipped = setSkipNext(abc, 'a', true);
    expect(skipped.rules[0].skipNextPayday).toBe(true);
    expect(setSkipNext(skipped, 'a', false).rules[0].skipNextPayday).toBe(false);
  });

  it('never changes the plan it was given', () => {
    const before = JSON.stringify(abc);
    moveRule(abc, 'b', -1);
    removeRule(abc, 'a');
    setOrder(abc, ['c', 'b', 'a']);
    expect(JSON.stringify(abc)).toBe(before);
  });
});
