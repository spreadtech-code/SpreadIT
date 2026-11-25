// S24 Emergency pause (F1), shown as "Pause everything": confirm with the PIN ->
// Autopilot paused -> S15.
// While paused no new transfers are sent: a payday counting down is held, and
// new income waits in the SpreadIT account. Transfers already with the bank finish.
// Resuming needs the PIN and a one-time code (S23).
// ?notMe=1: opened from a change alert's "This wasn't me" (F4). That link
// pauses straight away, with no PIN, as a link in an email would.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, CirclePause } from 'lucide-react-native';
import { Button, FieldError, PinField, PIN_LENGTH, Screen } from '../src/components';
import { now } from '../src/fakebank/bankStore';
import { pauseAutomation } from '../src/payday/paydayStore';
import { isPaused, useApp } from '../src/state/appStore';
import { colors, radius, size, space, type } from '../src/theme/tokens';

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
      <Screen title="Autopilot is paused" footer={<Button label="Back to Home" variant="secondary" onPress={home} />}>
        <Text style={styles.body}>Your pay will stay in your SpreadIT account until you resume.</Text>
      </Screen>
    );
  }

  if (!automationOn) {
    return (
      <Screen title="Pause everything" footer={<Button label="Back" variant="secondary" onPress={() => router.back()} />}>
        <Text style={styles.body}>Autopilot isn’t on, so nothing is going out. There’s nothing to pause.</Text>
      </Screen>
    );
  }

  if (notMe) {
    return (
      <Screen
        title="This wasn’t me"
        subtitle="Pause everything now. No money moves until you turn Autopilot back on."
        footer={
          <>
            <Button label="Pause everything" icon={CirclePause} variant="critical" onPress={pauseNow} />
            <Button label="Not now" variant="quiet" onPress={() => router.back()} />
          </>
        }
      >
        <WhatHappens />
        <Text style={styles.body}>Then check your plan. Resuming needs your PIN and a 6-digit code.</Text>
      </Screen>
    );
  }

  const submit = () => {
    if (pin.length < PIN_LENGTH) return setError('Enter your 6-digit PIN first.');
    const outcome = enterPin(pin, Date.now());
    setPin('');
    if (outcome.result === 'wrong') return setError(`Wrong PIN. ${outcome.attemptsLeft} ${outcome.attemptsLeft === 1 ? 'try' : 'tries'} left.`);
    if (outcome.result === 'locked') return setError('Too many wrong PINs. Try again in 30 minutes.');
    pauseNow();
  };

  return (
    <Screen
      title="Pause everything?"
      subtitle="Nothing new goes out until you turn Autopilot back on."
      footer={
        <>
          <Button
            label="Pause everything"
            icon={CirclePause}
            variant="critical"
            disabled={pin.length < PIN_LENGTH}
            accessibilityHint={pin.length < PIN_LENGTH ? 'Enter your 6-digit PIN first.' : undefined}
            onPress={submit}
          />
          <Button label="Not now" variant="quiet" onPress={() => router.back()} />
        </>
      }
    >
      <WhatHappens />
      <PinField
        label="Enter your PIN to pause"
        value={pin}
        onChange={(v) => {
          setPin(v);
          setError(null);
        }}
      />
      {error ? <FieldError message={error} /> : null}
    </Screen>
  );
}

function WhatHappens() {
  const items = [
    'No new transfers go out',
    'A payday counting down is held',
    'Transfers already with the bank still finish',
    'New pay waits in your SpreadIT account',
  ];
  return (
    <View style={styles.well} accessible accessibilityLabel={`What happens: ${items.join('. ')}.`}>
      {items.map((t) => (
        <View key={t} style={styles.item}>
          <Check size={size.iconSm} color={colors.primary} strokeWidth={1.75} />
          <Text style={styles.body}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  well: { backgroundColor: colors.surfaceSunken, borderRadius: radius.lg, padding: space[4], gap: space[3] },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  body: { ...type.body, color: colors.ink, flex: 1 },
});
