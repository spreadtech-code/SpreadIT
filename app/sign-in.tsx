// S31 Sign in (founder addition): phone or email + password -> S15 Home.
// Prototype: checks the one account saved on this phone. A real server comes later.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, FieldError, Screen, TextField } from '../src/components';
import { nextOnboardingRoute, useApp } from '../src/state/appStore';

export default function SignInScreen() {
  const router = useRouter();
  const signIn = useApp((s) => s.signIn);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!id.trim() || !password) return setError('Enter your phone number or email, and your password.');
    if (!signIn(id, password)) {
      return setError("Those details don't match a SpreadIT account on this phone.");
    }
    const next = nextOnboardingRoute(useApp.getState());
    if (router.canDismiss()) router.dismissAll();
    router.replace(next ?? '/home');
  };

  return (
    <Screen title="Sign in" footer={<Button label="Sign in" variant="primary" onPress={submit} />}>
      <TextField label="Phone number or email" value={id} onChangeText={setId} keyboardType="email-address" autoComplete="username" textContentType="username" autoFocus />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" onSubmitEditing={submit} />
      {error ? <FieldError message={error} /> : null}
    </Screen>
  );
}
