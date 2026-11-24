// S24 Emergency pause (F1): confirm with the PIN -> automation Paused -> S15.
// While paused no new transfers are sent: a payday counting down is held, and
// new income waits in the SpreadIT account. Transfers already with the bank finish.
// Resuming needs the PIN and a one-time code (S23).
// ?notMe=1: opened from a change alert's "This wasn't me" (F4). That link
// pauses straight away, with no PIN, as a link in an email would.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, FieldError, PinField, PIN_LENGTH, Screen } from '../src/components';
import { now } from '../src/fakebank/bankStore';
import { pauseAutomation } from '../src/payday/paydayStore';
import { isPaused, useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

export default function EmergencyPauseScreen() {
  const router = useRouter();
  const { notMe } = useLocalSearchParams<{ notMe?: string }>();
  const enterPin = useApp((s) => s.enterPin);
  const paused = useApp((s) => isPaused(s));
  const automationOn = useApp((s) => s.automation.on);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const home = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/home');
  };
  const pauseNow = () => {
    pauseAutomation(now());
    home();
  };

  if (paused) {
    return (
      <Screen title="Automation is paused" footer={<Button label="Back to Home" variant="secondary" onPress={home} />}>
        <Text style={styles.body}>Income will stay in your SpreadIT account until you resume.</Text>
      </Screen>
    );
  }

  if (!automationOn) {
    return (
      <Screen title="Emergency pause" footer={<Button label="Back" variant="secondary" onPress={() => router.back()} />}>
        <Text style={styles.body}>Automation isn't switched on, so nothing is being sent. There is nothing to pause.</Text>
      </Screen>
    );
  }

  if (notMe) {
    return (
      <Screen
        title="This wasn't me"
        subtitle="Pause automation now. No money moves until you resume."
        footer={
          <>
            <Button label="Pause automation" variant="critical" onPress={pauseNow} />
            <Button label="Cancel" variant="quiet" onPress={() => router.back()} />
          </>
        }
      >
        <WhatHappens />
        <Text style={styles.body}>Then check your plan. Resuming needs your PIN and a one-time code.</Text>
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
    pauseNow();
  };

  return (
    <Screen
      title="Emergency pause"
      subtitle="Stops all automation. Enter your PIN to pause."
      footer={<Button label="Cancel" variant="quiet" onPress={() => router.back()} />}
    >
      <WhatHappens />
      <PinField label="6-digit PIN" value={pin} onChange={onPin} />
      {error ? <FieldError message={error} /> : null}
    </Screen>
  );
}

function WhatHappens() {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>What happens</Text>
      <Text style={styles.body}>• No new transfers are sent.</Text>
      <Text style={styles.body}>• A payday counting down is held. Nothing goes out.</Text>
      <Text style={styles.body}>• Transfers already with the bank finish.</Text>
      <Text style={styles.body}>• New income stays in your SpreadIT account.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[2], ...shadow.card },
  heading: { ...type.titleSm, color: colors.ink },
  body: { ...type.body, color: colors.ink },
});
