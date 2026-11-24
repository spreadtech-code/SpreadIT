// Mounted once in the root layout:
// - runs the payday loop every second while the app is open (tick);
// - shows the newest pretend alert as a banner over every screen, once unlocked.
// - locks the app after 5 minutes in the background (F5).
// Also exports useNow() for screens that show a live countdown or status.
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { AlertBanner } from '../components/AlertBanner';
import { now, useBank } from '../fakebank/bankStore';
import { useAutoLock } from '../lib/autoLock';
import { useApp } from '../state/appStore';
import { dismissAlert, tick, usePaydays } from './paydayStore';

export function PaydayRunner() {
  const router = useRouter();
  useAutoLock(); // F5
  const unlocked = useApp((s) => s.unlocked);
  const alert = usePaydays((s) => s.alerts[0]);

  useEffect(() => {
    const timer = setInterval(() => {
      tick().catch(() => {}); // a failed tick just tries again next second
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!alert || !unlocked) return null;
  return (
    <AlertBanner
      title={alert.title}
      body={alert.body}
      onClose={() => dismissAlert(alert.id)}
      onOpen={() => {
        dismissAlert(alert.id);
        router.push(alert.route as never);
      }}
    />
  );
}

/** The demo clock's time, updated every second (and at once on "Skip ahead"). */
export function useNow(): number {
  const offset = useBank((s) => s.clockOffsetMs);
  const [t, setT] = useState(now());
  useEffect(() => {
    setT(now());
    const timer = setInterval(() => setT(now()), 1000);
    return () => clearInterval(timer);
  }, [offset]);
  return t;
}

/** True once the fake bank and paydays have loaded from the phone. */
export function usePaydaysHydrated(): boolean {
  const [ready, setReady] = useState(useBank.persist.hasHydrated() && usePaydays.persist.hasHydrated());
  useEffect(() => {
    const check = () => setReady(useBank.persist.hasHydrated() && usePaydays.persist.hasHydrated());
    const a = useBank.persist.onFinishHydration(check);
    const b = usePaydays.persist.onFinishHydration(check);
    check();
    return () => {
      a();
      b();
    };
  }, []);
  return ready;
}
