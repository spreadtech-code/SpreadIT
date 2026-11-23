import { Redirect } from 'expo-router';
import { nextOnboardingRoute, useApp } from '../src/state/appStore';

// Where the app opens:
// - no account yet: S1 Welcome
// - sign-up not finished: the next onboarding step
// - otherwise: S32 Unlock with the PIN (A3)
export default function Index() {
  const state = useApp();
  const next = nextOnboardingRoute(state);
  if (next) return <Redirect href={next} />;
  return <Redirect href={state.unlocked ? '/home' : '/unlock'} />;
}
