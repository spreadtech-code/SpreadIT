// A3: 5 wrong PINs in a row lock sign-in for 30 minutes. Pure functions.
export const MAX_WRONG_PINS = 5;
export const LOCK_MS = 30 * 60 * 1000;

export interface PinState {
  pinHash: string | null;
  biometric: boolean;
  wrongAttempts: number;
  /** Time (ms) until which sign-in is locked, or null. */
  lockedUntil: number | null;
}

export type PinResult =
  | { result: 'ok' }
  | { result: 'wrong'; attemptsLeft: number }
  | { result: 'locked'; until: number };

export function tryPin(state: PinState, enteredHash: string, now: number): { outcome: PinResult; next: PinState } {
  if (state.lockedUntil !== null && now < state.lockedUntil) {
    return { outcome: { result: 'locked', until: state.lockedUntil }, next: state };
  }
  const fresh = state.lockedUntil !== null ? { ...state, lockedUntil: null, wrongAttempts: 0 } : state;
  if (enteredHash === fresh.pinHash) {
    return { outcome: { result: 'ok' }, next: { ...fresh, wrongAttempts: 0, lockedUntil: null } };
  }
  const wrongAttempts = fresh.wrongAttempts + 1;
  if (wrongAttempts >= MAX_WRONG_PINS) {
    const until = now + LOCK_MS;
    return { outcome: { result: 'locked', until }, next: { ...fresh, wrongAttempts, lockedUntil: until } };
  }
  return {
    outcome: { result: 'wrong', attemptsLeft: MAX_WRONG_PINS - wrongAttempts },
    next: { ...fresh, wrongAttempts },
  };
}
