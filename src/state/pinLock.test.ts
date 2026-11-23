import { LOCK_MS, tryPin, type PinState } from './pinLock';

const start: PinState = { pinHash: 'right', biometric: false, wrongAttempts: 0, lockedUntil: null };

describe('PIN lock (A3)', () => {
  it('lets the right PIN in and clears wrong attempts', () => {
    const afterWrong = tryPin(start, 'nope', 0).next;
    const r = tryPin(afterWrong, 'right', 1);
    expect(r.outcome).toEqual({ result: 'ok' });
    expect(r.next.wrongAttempts).toBe(0);
  });

  it('counts down attempts, then locks for 30 minutes on the 5th wrong PIN', () => {
    let s = start;
    const left: number[] = [];
    for (let i = 0; i < 4; i++) {
      const r = tryPin(s, 'nope', 1000);
      if (r.outcome.result === 'wrong') left.push(r.outcome.attemptsLeft);
      s = r.next;
    }
    expect(left).toEqual([4, 3, 2, 1]);
    const fifth = tryPin(s, 'nope', 1000);
    expect(fifth.outcome).toEqual({ result: 'locked', until: 1000 + LOCK_MS });
  });

  it('refuses even the right PIN while locked, and works again after 30 minutes', () => {
    const locked: PinState = { ...start, wrongAttempts: 5, lockedUntil: LOCK_MS };
    expect(tryPin(locked, 'right', LOCK_MS - 1).outcome.result).toBe('locked');
    const after = tryPin(locked, 'right', LOCK_MS);
    expect(after.outcome.result).toBe('ok');
    expect(after.next).toMatchObject({ wrongAttempts: 0, lockedUntil: null });
  });
});
