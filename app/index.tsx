import { Redirect } from 'expo-router';
import { nextOnboardingRoute, useApp } from '../src/state/appStore';

// Where the app opens:
// - no account yet: S1 Welcome
// - sign-up not finished: the next onboarding step
// - signed out from Settings: S31 Sign in with the password (A3)
// - otherwise: S32 Unlock with the PIN (A3)
export default function Index() {
  const state = useApp();
  const next = nextOnboardingRoute(state);
  if (next) return <Redirect href={next} />;
  if (state.signedOut) return <Redirect href="/sign-in" />;
  return <Redirect href={state.unlocked ? '/home' : '/unlock'} />;
}
