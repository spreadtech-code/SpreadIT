// S32 Unlock (founder addition, A3): the PIN when the app reopens -> S15 Home.
// 5 wrong PINs in a row lock sign-in for 30 minutes and (pretend) send an SMS alert.
// Also shown by auto-lock (F5). Back and the swipe-back gesture are blocked here,
// so a locked app can't be opened without the PIN.
import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, FieldError, PinField, PIN_LENGTH, Screen } from '../src/components';
import { useApp } from '../src/state/appStore';

function timeText(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
}

export default function UnlockScreen() {
  const router = useRouter();
  const enterPin = useApp((s) => s.enterPin);
  const lockedUntil = useApp((s) => s.pin.lockedUntil);
  const firstName = useApp((s) => s.identity?.firstName);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(
    lockedUntil && Date.now() < lockedUntil ? lockedText(lockedUntil) : null,
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const onChange = (value: string) => {
    setPin(value);
    if (value.length < PIN_LENGTH) return;
    const outcome = enterPin(value, Date.now());
    setPin('');
    if (outcome.result === 'ok') {
      if (router.canDismiss()) router.dismissAll();
      router.replace('/home');
    } else if (outcome.result === 'wrong') {
      setError(`Wrong PIN. ${outcome.attemptsLeft} ${outcome.attemptsLeft === 1 ? 'try' : 'tries'} left.`);
    } else {
      setError(lockedText(outcome.until));
    }
  };

  return (
    <Screen
      title={firstName ? `Hi again, ${firstName}` : 'Welcome back'}
      subtitle="Enter your PIN to open SpreadIT."
      onBack={null}
      footer={<Button label="Log in with password" variant="quiet" onPress={() => router.push('/sign-in')} />}
    >
      <Stack.Screen options={{ gestureEnabled: false }} />
      <PinField label="6-digit PIN" value={pin} onChange={onChange} />
      {error ? <FieldError message={error} /> : null}
    </Screen>
  );
}

function lockedText(until: number): string {
  return `Too many wrong PINs. Try again at ${timeText(until)}. We’ve sent an SMS alert to your phone.`;
}
