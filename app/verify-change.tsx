// S23 Verify change (F2): the 6-digit one-time code for a sensitive change, or
// for resuming after a pause (F1). Submit code -> previous screen.
// - Pretend: the code is shown on screen as a pretend SMS (as on S3). The real
//   app sends it by SMS or reads it from an authenticator app.
// - 3 wrong codes cancel the change. Codes expire after 10 minutes.
// - The change is saved only after the right code; then the pretend email and
//   SMS alert goes out (F4).
// ?resume=1: asks for the PIN first, then the code (F1, G3).
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, FieldError, InsightCard, PinField, PIN_LENGTH, Screen } from '../src/components';
import { now } from '../src/fakebank/bankStore';
import { securityAlerts } from '../src/payday/paydayStore';
import { isPaused, useApp } from '../src/state/appStore';
import { changeTitle } from '../src/state/sensitiveChanges';
import { colors, type } from '../src/theme/tokens';

export default function VerifyChangeScreen() {
  const router = useRouter();
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const pending = useApp((s) => s.pendingChange);
  const plan = useApp((s) => s.plan);
  const paused = useApp((s) => isPaused(s));
  const enterPin = useApp((s) => s.enterPin);
  const requestChange = useApp((s) => s.requestChange);
  const resendChangeCode = useApp((s) => s.resendChangeCode);
  const submitChangeCode = useApp((s) => s.submitChangeCode);
  const cancelChange = useApp((s) => s.cancelChange);

  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const leave = () => (router.canGoBack() ? router.back() : router.navigate('/home'));
  const cancel = () => {
    cancelChange();
    leave();
  };

  // Resume, step 1: the PIN.
  const resumeNeedsPin = resume === '1' && pending?.change.kind !== 'resume';
  if (resumeNeedsPin) {
    if (!paused) {
      return (
        <Screen title="Automation is on" footer={<Button label="Back" variant="secondary" onPress={leave} />}>
          <Text style={styles.body}>Automation isn't paused, so there is nothing to resume.</Text>
        </Screen>
      );
    }
    const onPin = (value: string) => {
      setPin(value);
      if (value.length < PIN_LENGTH) return;
      const outcome = enterPin(value, Date.now());
      setPin('');
      if (outcome.result === 'wrong') return setError(`Wrong PIN. ${outcome.attemptsLeft} ${outcome.attemptsLeft === 1 ? 'try' : 'tries'} left.`);
      if (outcome.result === 'locked') return setError('Too many wrong PINs. Try again in 30 minutes.');
      setError(null);
      requestChange({ kind: 'resume' });
    };
    return (
      <Screen title="Resume automation" subtitle="Enter your PIN. Then we'll send you a one-time code." footer={<Button label="Cancel" variant="quiet" onPress={leave} />}>
        <PinField label="6-digit PIN" value={pin} onChange={onPin} />
        {error ? <FieldError message={error} /> : null}
      </Screen>
    );
  }

  if (!pending) {
    return (
      <Screen title="Verify change" footer={<Button label="Back" variant="secondary" onPress={leave} />}>
        <Text style={styles.body}>Nothing is waiting for a code.</Text>
      </Screen>
    );
  }

  const submit = () => {
    if (code.length < PIN_LENGTH) return setError('Enter all 6 digits.');
    const outcome = submitChangeCode(code, Date.now(), now());
    setCode('');
    if (outcome.result === 'wrong') return setError(`That code isn't right. ${outcome.triesLeft} ${outcome.triesLeft === 1 ? 'try' : 'tries'} left.`);
    if (outcome.result === 'expired') return setError('This code has expired. Tap "Resend code".');
    if (outcome.result === 'cancelled') {
      Alert.alert('Change cancelled', '3 wrong codes. Nothing was changed.');
      return leave();
    }
    if (outcome.result === 'ok') securityAlerts(outcome.alerts);
    leave();
  };

  return (
    <Screen
      title="Enter your one-time code"
      subtitle={changeTitle(pending.change, plan)}
      footer={
        <>
          <Button label="Submit code" variant="primary" onPress={submit} />
          <Button label="Cancel" variant="quiet" onPress={cancel} />
        </>
      }
    >
      <InsightCard
        title="Pretend SMS"
        text={`Your SpreadIT code is ${pending.code}. It expires in 10 minutes. In the real app this comes by SMS or from your authenticator app.`}
      />
      <PinField label="6-digit code" value={code} onChange={setCode} masked={false} error={error} />
      <Button
        label="Resend code"
        variant="quiet"
        onPress={() => {
          resendChangeCode();
          setCode('');
          setError(null);
        }}
      />
      <Text style={styles.muted}>
        {pending.change.kind === 'resume'
          ? 'Once you resume, new income is split by your plan again.'
          : "Nothing is saved until the code is right. We'll email and text you about the change."}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
