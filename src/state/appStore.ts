// App memory (Zustand), saved on the phone with AsyncStorage so a reload keeps
// the account and plan. Pretend data only: nothing leaves the phone.
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Destination, Plan, Rule, RuleId } from '../engine/types';
import type { SpreaditAccount } from '../fakebank/identity';
import { normalisePhone } from '../lib/forms';
import { prototypeHash, sixDigitCode } from '../lib/secrets';
import { otherDemoDevices, type SignedInDevice } from '../data/devices';
import * as edits from './planEdits';
import { tryPin, type PinResult, type PinState } from './pinLock';
import { changeAlerts, CODE_TRIES, withCooldown, type ChangeAlert, type SensitiveChange } from './sensitiveChanges';

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

/** A6: only the result is kept, never the BVN. */
export interface Identity {
  firstName: string;
  lastName: string;
  passedAt: number;
}

/** D2: the review window before transfers go out. 0 = off (only after 3 split paydays). */
export type ReviewWindowMinutes = 0 | 5 | 15 | 60;

export interface Automation {
  on: boolean;
  reviewWindowMinutes: ReviewWindowMinutes;
  switchedOnAt: number | null;
  /** F1: when Emergency pause was tapped (demo clock); null or missing = not paused. */
  pausedAt?: number | null;
  /** G3: pause reminders sent so far (day 7, day 14). */
  pauseReminders?: number;
}

/** F2: a change waiting for its one-time code (S23). Not saved on the phone. */
export interface PendingChange {
  change: SensitiveChange;
  code: string;
  expiresAt: number;
  wrongCodes: number;
}

export type ChangeCodeResult =
  | { result: 'ok'; alerts: ChangeAlert[] }
  | { result: 'wrong'; triesLeft: number }
  | { result: 'cancelled' }
  | { result: 'expired' }
  | { result: 'none' };

/** G2: notifications the user can switch off. Security and failure alerts can't be. */
export interface NotificationSettings {
  paydaySummarySms: boolean;
}

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
  /** S11: tapped "I understand" (A5). */
  custodyUnderstood: boolean;
  identity: Identity | null;
  /** Times of failed identity checks, for the 3-in-24-hours limit (A6). */
  identityFails: number[];
  /** A7: the user's own account at the partner bank. */
  spreaditAccount: SpreaditAccount | null;
  automation: Automation;
  notifications: NotificationSettings;
  /** F6: other phones signed in to this account (pretend). */
  otherDevices: SignedInDevice[];
  /** A3: "Sign out" in Settings. The next start asks for the password, not the PIN. */
  signedOut: boolean;

  // Not saved: each app start begins locked, and S8 hands a destination back once.
  unlocked: boolean;
  pendingDestination: { for: DestinationFor; destination: Destination } | null;
  pendingChange: PendingChange | null;

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
  understandCustody: () => void;
  identityPassed: (identity: Omit<Identity, 'passedAt'>, account: SpreaditAccount, now: number) => void;
  identityFailed: (now: number) => void;
  switchOnAutomation: (reviewWindowMinutes: ReviewWindowMinutes, now: number) => void;
  setReviewWindow: (minutes: ReviewWindowMinutes) => void;
  /** F1: Emergency pause. Use pauseAutomation in paydayStore, which also holds waiting paydays. */
  pause: (at: number) => void;
  notePauseReminder: () => void;
  /** F2: ask for a one-time code before a sensitive change. */
  requestChange: (change: SensitiveChange) => void;
  resendChangeCode: () => void;
  /** `now` is the real time (code expiry); `at` is the demo clock (F3 wait). */
  submitChangeCode: (code: string, now: number, at: number) => ChangeCodeResult;
  cancelChange: () => void;
  setPaydaySummarySms: (on: boolean) => void;
  signOutDevice: (id: string) => void;
  signOut: () => void;
  lock: () => void;
  resetDemo: () => void;
}

/** F2-F4 apply once automation has been switched on: before that no money moves. */
export const isLive = (s: Pick<AppState, 'automation'>): boolean => s.automation.switchedOnAt !== null;
export const isPaused = (s: Pick<AppState, 'automation'>): boolean => (s.automation.pausedAt ?? null) !== null;

const freshPin: PinState = { pinHash: null, biometric: false, wrongAttempts: 0, lockedUntil: null };

const initial = {
  account: null,
  smsCode: null,
  pin: freshPin,
  income: null,
  plan: edits.emptyPlan,
  fallback: null,
  custodyUnderstood: false,
  identity: null as Identity | null,
  identityFails: [] as number[],
  spreaditAccount: null as SpreaditAccount | null,
  automation: { on: false, reviewWindowMinutes: 15, switchedOnAt: null, pausedAt: null, pauseReminders: 0 } as Automation,
  notifications: { paydaySummarySms: true } as NotificationSettings,
  otherDevices: otherDemoDevices as SignedInDevice[],
  signedOut: false,
  unlocked: false,
  pendingDestination: null,
  pendingChange: null as PendingChange | null,
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
        set({ unlocked: true, signedOut: false });
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

      understandCustody: () => set({ custodyUnderstood: true }),
      identityPassed: (identity, account, now) =>
        set({ identity: { ...identity, passedAt: now }, spreaditAccount: account, identityFails: [] }),
      identityFailed: (now) => set({ identityFails: [...get().identityFails, now] }),
      switchOnAutomation: (reviewWindowMinutes, now) =>
        set({ automation: { on: true, reviewWindowMinutes, switchedOnAt: now, pausedAt: null, pauseReminders: 0 } }),

      setReviewWindow: (minutes) => set({ automation: { ...get().automation, reviewWindowMinutes: minutes } }),
      pause: (at) => set({ automation: { ...get().automation, pausedAt: at, pauseReminders: 0 } }),
      notePauseReminder: () =>
        set({ automation: { ...get().automation, pauseReminders: (get().automation.pauseReminders ?? 0) + 1 } }),

      requestChange: (change) =>
        set({ pendingChange: { change, code: sixDigitCode(), expiresAt: Date.now() + SMS_CODE_MS, wrongCodes: 0 } }),
      resendChangeCode: () => {
        const p = get().pendingChange;
        if (p) set({ pendingChange: { ...p, code: sixDigitCode(), expiresAt: Date.now() + SMS_CODE_MS } });
      },
      submitChangeCode: (code, now, at) => {
        const s = get();
        const p = s.pendingChange;
        if (!p) return { result: 'none' };
        if (now > p.expiresAt) return { result: 'expired' };
        if (code !== p.code) {
          const wrongCodes = p.wrongCodes + 1;
          if (wrongCodes >= CODE_TRIES) {
            set({ pendingChange: null });
            return { result: 'cancelled' };
          }
          set({ pendingChange: { ...p, wrongCodes } });
          return { result: 'wrong', triesLeft: CODE_TRIES - wrongCodes };
        }
        const alerts = changeAlerts(
          p.change,
          { plan: s.plan, fallback: s.fallback, reviewWindowMinutes: s.automation.reviewWindowMinutes },
          at,
        );
        set({ ...applyChange(s, p.change, at), pendingChange: null });
        return { result: 'ok', alerts };
      },
      cancelChange: () => set({ pendingChange: null }),

      setPaydaySummarySms: (on) => set({ notifications: { ...get().notifications, paydaySummarySms: on } }),
      signOutDevice: (id) => set({ otherDevices: get().otherDevices.filter((d) => d.id !== id) }),
      signOut: () => set({ unlocked: false, signedOut: true, pendingChange: null }),

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
        custodyUnderstood: s.custodyUnderstood,
        identity: s.identity,
        identityFails: s.identityFails,
        spreaditAccount: s.spreaditAccount,
        automation: s.automation,
        notifications: s.notifications,
        otherDevices: s.otherDevices,
        signedOut: s.signedOut,
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

/**
 * Where "Switch on automation" leads (flow 4: S11 -> S12 -> S13 -> S14).
 * Steps already done are skipped, so a verified user goes straight to S14.
 */
export function goLiveRoute(
  s: Pick<AppState, 'custodyUnderstood' | 'identity' | 'spreaditAccount'>,
): '/where-your-money-is' | '/identity-check' | '/switch-on-automation' {
  if (!s.custodyUnderstood) return '/where-your-money-is';
  if (!s.identity || !s.spreaditAccount) return '/identity-check';
  return '/switch-on-automation';
}

/**
 * F2/F3: the state after a verified change. A new or changed account starts
 * its 24-hour wait (F3).
 */
export function applyChange(
  s: Pick<AppState, 'plan' | 'fallback' | 'automation'>,
  change: SensitiveChange,
  at: number,
): Partial<Pick<AppState, 'plan' | 'fallback' | 'automation'>> {
  switch (change.kind) {
    case 'saveRule': {
      const before = s.plan.rules.find((r) => r.id === change.rule.id);
      return { plan: edits.upsertRule(s.plan, withCooldown(before, change.rule, at)) };
    }
    case 'deleteRules':
      return { plan: change.ruleIds.reduce(edits.removeRule, s.plan) };
    case 'remainderFallback': {
      const remainder = withCooldown(s.plan.remainder ?? undefined, { name: change.remainderName, destination: change.remainder }, at);
      return { plan: { ...s.plan, remainder }, fallback: change.fallback };
    }
    case 'reviewWindow':
      return { automation: { ...s.automation, reviewWindowMinutes: change.minutes as ReviewWindowMinutes } };
    case 'resume':
      return { automation: { ...s.automation, pausedAt: null, pauseReminders: 0 } };
  }
}
