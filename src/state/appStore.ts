// App memory (Zustand), saved on the phone with AsyncStorage so a reload keeps
// the account and plan. Pretend data only: nothing leaves the phone.
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Destination, Plan, Rule, RuleId } from '../engine/types';
import { normalisePhone } from '../lib/forms';
import { prototypeHash, sixDigitCode } from '../lib/secrets';
import * as edits from './planEdits';
import { tryPin, type PinResult, type PinState } from './pinLock';

export interface Account {
  phone: string;
  email: string;
  passwordHash: string;
  dateOfBirth: string;
  phoneVerified: boolean;
  emailVerified: boolean;
}

/** A8 income setup. */
export interface Income {
  type: 'regular' | 'varies';
  expectedKobo: number;
  frequency: 'monthly' | 'twoWeekly' | 'weekly';
  /** Day of the month (1 to 31) for monthly pay; null otherwise. */
  payDayOfMonth: number | null;
  /** 1 = Monday ... 5 = Friday, for weekly or 2-weekly pay; null otherwise. */
  payWeekday: number | null;
  qualifyingMinimumKobo: number;
  arrival: 'forward' | 'direct';
  /** D14: only for varied income. */
  weeklyBatching: boolean;
}

export type DestinationFor = 'rule' | 'remainder' | 'fallback';

/** S3: the pretend SMS code expires after 10 minutes (A1). */
export const SMS_CODE_MS = 10 * 60 * 1000;

interface AppState {
  account: Account | null;
  smsCode: { code: string; expiresAt: number } | null;
  pin: PinState;
  income: Income | null;
  plan: Plan;
  /** B9: the user's own account for failed transfers and unsplit money. */
  fallback: Destination | null;

  // Not saved: each app start begins locked, and S8 hands a destination back once.
  unlocked: boolean;
  pendingDestination: { for: DestinationFor; destination: Destination } | null;

  signUp: (details: { phone: string; email: string; password: string; dateOfBirth: string }) => void;
  sendSmsCode: () => void;
  verifySmsCode: (code: string, now: number) => 'ok' | 'wrong' | 'expired';
  confirmEmail: () => void;
  setPin: (pin: string, biometric: boolean) => void;
  enterPin: (pin: string, now: number) => PinResult;
  signIn: (phoneOrEmail: string, password: string) => boolean;
  saveIncome: (income: Income) => void;
  saveRule: (rule: Rule) => void;
  deleteRule: (id: RuleId) => void;
  reorderRules: (ids: RuleId[]) => void;
  moveRule: (id: RuleId, delta: -1 | 1) => void;
  setSkipNext: (id: RuleId, skip: boolean) => void;
  saveRemainderAndFallback: (remainderName: string, remainder: Destination, fallback: Destination | null) => void;
  offerDestination: (forWhat: DestinationFor, destination: Destination) => void;
  takeDestination: (forWhat: DestinationFor) => Destination | null;
  lock: () => void;
  resetDemo: () => void;
}

const freshPin: PinState = { pinHash: null, biometric: false, wrongAttempts: 0, lockedUntil: null };

const initial = {
  account: null,
  smsCode: null,
  pin: freshPin,
  income: null,
  plan: edits.emptyPlan,
  fallback: null,
  unlocked: false,
  pendingDestination: null,
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,

      signUp: ({ phone, email, password, dateOfBirth }) =>
        set({
          ...initial,
          account: {
            phone: normalisePhone(phone),
            email: email.trim().toLowerCase(),
            passwordHash: prototypeHash(password),
            dateOfBirth,
            phoneVerified: false,
            emailVerified: false,
          },
          unlocked: true,
        }),

      sendSmsCode: () => set({ smsCode: { code: sixDigitCode(), expiresAt: Date.now() + SMS_CODE_MS } }),

      verifySmsCode: (code, now) => {
        const { smsCode, account } = get();
        if (!smsCode || !account) return 'wrong';
        if (now > smsCode.expiresAt) return 'expired';
        if (code !== smsCode.code) return 'wrong';
        set({ account: { ...account, phoneVerified: true }, smsCode: null });
        return 'ok';
      },

      confirmEmail: () => {
        const { account } = get();
        if (account) set({ account: { ...account, emailVerified: true } });
      },

      setPin: (pin, biometric) =>
        set({ pin: { ...freshPin, pinHash: prototypeHash(pin), biometric } }),

      enterPin: (pin, now) => {
        const { outcome, next } = tryPin(get().pin, prototypeHash(pin), now);
        set({ pin: next, unlocked: outcome.result === 'ok' ? true : get().unlocked });
        return outcome;
      },

      signIn: (phoneOrEmail, password) => {
        const { account } = get();
        if (!account) return false;
        const id = phoneOrEmail.trim().toLowerCase();
        const matches = id === account.email || normalisePhone(id) === account.phone;
        if (!matches || prototypeHash(password) !== account.passwordHash) return false;
        set({ unlocked: true });
        return true;
      },

      saveIncome: (income) => set({ income }),
      saveRule: (rule) => set({ plan: edits.upsertRule(get().plan, rule) }),
      deleteRule: (id) => set({ plan: edits.removeRule(get().plan, id) }),
      reorderRules: (ids) => set({ plan: edits.setOrder(get().plan, ids) }),
      moveRule: (id, delta) => set({ plan: edits.moveRule(get().plan, id, delta) }),
      setSkipNext: (id, skip) => set({ plan: edits.setSkipNext(get().plan, id, skip) }),
      saveRemainderAndFallback: (remainderName, remainder, fallback) =>
        set({ plan: edits.setRemainder(get().plan, remainderName, remainder), fallback }),

      offerDestination: (forWhat, destination) => set({ pendingDestination: { for: forWhat, destination } }),
      takeDestination: (forWhat) => {
        const p = get().pendingDestination;
        if (!p || p.for !== forWhat) return null;
        set({ pendingDestination: null });
        return p.destination;
      },

      lock: () => set({ unlocked: false }),
      resetDemo: () => set({ ...initial }),
    }),
    {
      name: 'spreadit-demo-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        account: s.account,
        smsCode: s.smsCode,
        pin: s.pin,
        income: s.income,
        plan: s.plan,
        fallback: s.fallback,
      }),
    },
  ),
);

/** True once the saved data has been loaded from the phone. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useApp.persist.hasHydrated());
  useEffect(() => {
    const unsubscribe = useApp.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useApp.persist.hasHydrated());
    return unsubscribe;
  }, []);
  return hydrated;
}

/** Where an unfinished sign-up should continue, or null when onboarding is done. */
export function nextOnboardingRoute(s: Pick<AppState, 'account' | 'pin' | 'income'>):
  | '/welcome'
  | '/verify-phone-email'
  | '/set-pin'
  | '/income-setup'
  | null {
  if (!s.account) return '/welcome';
  if (!s.account.phoneVerified || !s.account.emailVerified) return '/verify-phone-email';
  if (!s.pin.pinHash) return '/set-pin';
  if (!s.income) return '/income-setup';
  return null;
}
