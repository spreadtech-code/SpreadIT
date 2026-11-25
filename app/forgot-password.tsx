// Forgot password (founder addition, 25 Nov 2026; Figma "8 · More screens /
// Forgot password"), from Log in (S31).
// 1. Phone or email: if it's this phone's account, a pretend SMS code is sent.
// 2. The 6-digit code and a new password (at least 8 characters). Then you're
//    logged in, a pretend email and SMS says the password changed, and the app
//    carries on where it would after Log in.
// Prototype: checks the one account saved on this phone. A real server comes later.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, FieldError, InsightCard, PinField, PIN_LENGTH, Screen, TextField } from '../src/components';
import { passwordProblem } from '../src/lib/forms';
import { securityAlerts } from '../src/payday/paydayStore';
import { nextOnboardingRoute, useApp } from '../src/state/appStore';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const requestPasswordReset = useApp((s) => s.requestPasswordReset);
  const resetPassword = useApp((s) => s.resetPassword);
  const smsCode = useApp((s) => s.smsCode);
  const [step, setStep] = useState<1 | 2>(1);
  const [id, setId] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    setError(null);
    if (!id.trim()) return setError('Enter your phone number or email.');
    if (!requestPasswordReset(id)) return setError('That doesn’t match a SpreadIT account on this phone.');
    setStep(2);
  };

  const save = () => {
    setError(null);
    if (code.length < PIN_LENGTH) return setError('Enter the 6-digit code.');
    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    const result = resetPassword(code, password, Date.now());
    if (result === 'wrong') return setError('That code isn’t right. Check the text and try again.');
    if (result === 'expired') return setError('This code has expired. Go back and send a new one.');
    securityAlerts([{ title: 'Email and SMS: your password changed', body: 'Your SpreadIT password was reset. Wasn’t you? Tap to pause everything.' }]);
    const next = nextOnboardingRoute(useApp.getState());
    if (router.canDismiss()) router.dismissAll();
    router.replace(next ?? '/home');
  };

  if (step === 1) {
    return (
      <Screen
        step="Step 1 of 2"
        title="Reset your password"
        subtitle="We’ll text you a 6-digit code."
        footer={
          <>
            <Button label="Send code" variant="primary" onPress={send} />
            <Button label="Back to log in" variant="quiet" onPress={() => router.back()} />
          </>
        }
      >
        <TextField label="Phone or email" value={id} onChangeText={setId} keyboardType="email-address" autoComplete="username" textContentType="username" autoFocus onSubmitEditing={send} />
        {error ? <FieldError message={error} /> : null}
      </Screen>
    );
  }

  return (
    <Screen
      step="Step 2 of 2"
      title="Choose a new password"
      subtitle="Enter the code we sent, then your new password."
      onBack={() => { setStep(1); setCode(''); setError(null); }}
      footer={<Button label="Save and log in" variant="primary" onPress={save} />}
    >
      {smsCode ? (
        <InsightCard title="Pretend SMS" text={`Your SpreadIT code is ${smsCode.code}. It expires in 10 minutes. In the real app this comes by SMS.`} />
      ) : null}
      <PinField label="6-digit code" value={code} onChange={setCode} masked={false} />
      <TextField
        label="New password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        helper="At least 8 characters."
        onSubmitEditing={save}
      />
      {error ? <FieldError message={error} /> : null}
      <Button label="Send a new code" variant="quiet" onPress={() => { requestPasswordReset(id); setCode(''); setError(null); }} />
    </Screen>
  );
}
