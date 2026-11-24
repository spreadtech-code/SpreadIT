// F5 Auto-lock: after 5 minutes in the background, the app needs the PIN to open.
// Uses React Native's own AppState (no extra library).
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../state/appStore';

export const AUTO_LOCK_MS = 5 * 60 * 1000;

/** True when time away from the app is long enough to lock it. */
export const shouldLock = (awayMs: number): boolean => awayMs >= AUTO_LOCK_MS;

/** Locks the app and shows S32 Unlock (A3). */
export function lockNow(router: ReturnType<typeof useRouter>): void {
  const s = useApp.getState();
  if (!s.unlocked || !s.pin.pinHash) return;
  s.lock();
  router.push('/unlock');
}

export function useAutoLock(): void {
  const router = useRouter();
  useEffect(() => {
    let leftAt: number | null = null;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') leftAt = Date.now();
      else if (state === 'active' && leftAt !== null) {
        const away = Date.now() - leftAt;
        leftAt = null;
        if (shouldLock(away)) lockNow(router);
      }
    });
    return () => sub.remove();
  }, [router]);
}
