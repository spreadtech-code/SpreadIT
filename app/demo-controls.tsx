// Hidden "Demo controls" (stage 5): fire pretend paydays and bank events, and
// move the demo clock, so every payday flow can be tried on the phone.
// Open it by holding the "SpreadIT" name on Home for 1 second.
// Everything here goes through the fake bank's partner calls. Pretend money only.
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Screen } from '../src/components';
import { formatNaira } from '../src/engine/format';
import { failNextTransfer, now, resetBank, reverseLastSuccessful, skipAhead, useBank } from '../src/fakebank/bankStore';
import { handlePaymentNotice, monthlySummaryAlert, resetPaydays, tick } from '../src/payday/paydayStore';
import { monthLabel, previousMonth } from '../src/payday/summary';
import { lockNow } from '../src/lib/autoLock';
import { isPaused, useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

const MINUTE = 60_000;
let lastReference: string | null = null;

export default function DemoControlsScreen() {
  const router = useRouter();
  const income = useApp((s) => s.income);
  const automationOn = useApp((s) => s.automation.on);
  const paused = useApp((s) => isPaused(s));
  const identity = useApp((s) => s.identity);
  const balance = useBank((s) => s.bank.balanceKobo);
  const offset = useBank((s) => s.clockOffsetMs);
  const nextFailure = useBank((s) => s.bank.nextFailure);
  const [message, setMessage] = useState<string | null>(null);

  const expected = income?.expectedKobo ?? 85_000_000;
  const minimum = income?.qualifyingMinimumKobo ?? 0;
  const sender = income?.arrival === 'forward' && identity ? `${identity.firstName} ${identity.lastName}` : 'Employer payroll';
  const wholeNaira = (kobo: number) => Math.max(100_000, Math.floor(kobo / 100) * 100);

  const fire = async (label: string, amountKobo: number) => {
    lastReference = `DEMO${Date.now().toString(36)}`;
    const result = await handlePaymentNotice({ reference: lastReference, amountKobo, sender });
    setMessage(
      result === 'automationOff'
        ? `${label}: ${formatNaira(amountKobo)} arrived. Automation is off, so it wasn't split.`
        : `${label}: ${formatNaira(amountKobo)} sent to your SpreadIT account. Watch for the alert.`,
    );
  };

  const resend = async () => {
    if (!lastReference) return setMessage('Fire a payday first.');
    const result = await handlePaymentNotice({ reference: lastReference, amountKobo: 1, sender });
    setMessage(result === 'duplicate' ? 'Same payment notice sent again: ignored. No second split (D9).' : 'Sent.');
  };

  const skip = async (ms: number, label: string) => {
    skipAhead(ms);
    await tick();
    setMessage(`Skipped ahead ${label}.`);
  };

  const days = Math.floor(offset / (24 * 60 * MINUTE));
  const hours = Math.floor((offset % (24 * 60 * MINUTE)) / (60 * MINUTE));
  const mins = Math.floor((offset % (60 * MINUTE)) / MINUTE);

  return (
    <Screen title="Demo controls" subtitle="Pretend bank events for trying the payday flows. Not part of the real app.">
      <View style={styles.card} accessible>
        <Text style={styles.line}>Automation: {!automationOn ? 'Off' : paused ? 'Paused' : 'On'}</Text>
        <Text style={styles.line}>SpreadIT account balance: {formatNaira(balance)}</Text>
        <Text style={styles.line}>Demo clock: {offset === 0 ? 'real time' : `${days ? `${days}d ` : ''}${hours}h ${mins}m ahead`}</Text>
        {nextFailure ? <Text style={styles.line}>Next transfer will fail: {nextFailure}</Text> : null}
      </View>

      {message ? (
        <Text style={styles.message} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}

      <Section title="Money in">
        <Button label={`Payday (${formatNaira(expected)})`} variant="secondary" onPress={() => fire('Payday', expected)} />
        <Button label={`Short payday, 40% (${formatNaira(wholeNaira(expected * 0.4))})`} variant="secondary" onPress={() => fire('Short payday', wholeNaira(expected * 0.4))} />
        <Button label={`Larger payday, 130% (${formatNaira(wholeNaira(expected * 1.3))})`} variant="secondary" onPress={() => fire('Larger payday', wholeNaira(expected * 1.3))} />
        <Button
          label={`Payment below the minimum (${formatNaira(wholeNaira(Math.min(3_000_000, minimum / 2)))})`}
          variant="secondary"
          onPress={() => fire('Below the minimum', wholeNaira(Math.min(3_000_000, minimum / 2)))}
        />
        <Button label="Send the last payment notice again" variant="secondary" onPress={resend} />
        {minimum >= expected / 2 ? (
          <Text style={styles.note}>
            Your qualifying minimum is {formatNaira(minimum)}, so a short payday asks "Is this income?" first. Tap Yes to reach the short payday review.
          </Text>
        ) : null}
      </Section>

      <Section title="Transfers">
        <Button label="Next transfer fails (temporary)" variant="secondary" onPress={() => { failNextTransfer('temporary'); setMessage('The next transfer sent will fail and retry.'); }} />
        <Button label="Next transfer fails (permanent)" variant="secondary" onPress={() => { failNextTransfer('permanent'); setMessage('The next transfer sent will go to your fallback account.'); }} />
        <Button
          label="Reverse the last successful transfer"
          variant="secondary"
          onPress={async () => {
            const ref = reverseLastSuccessful();
            await tick();
            setMessage(ref ? 'The bank reversed the last successful transfer.' : 'No successful transfer to reverse yet.');
          }}
        />
      </Section>

      <Section title="Notifications">
        <Button
          label="Monthly summary alert"
          variant="secondary"
          onPress={() => {
            const m = previousMonth(now());
            monthlySummaryAlert(monthLabel(m.year, m.month));
            setMessage('Sent the "1st of the month" summary alert.');
          }}
        />
      </Section>

      <Section title="Demo clock">
        <Button label="Skip ahead 1 minute" variant="secondary" onPress={() => skip(MINUTE, '1 minute')} />
        <Button label="Skip ahead 15 minutes" variant="secondary" onPress={() => skip(15 * MINUTE, '15 minutes')} />
        <Button label="Skip ahead 6 hours" variant="secondary" onPress={() => skip(6 * 60 * MINUTE, '6 hours')} />
        <Button label="Skip ahead 1 day" variant="secondary" onPress={() => skip(24 * 60 * MINUTE, '1 day')} />
        <Button label="Skip ahead 7 days" variant="secondary" onPress={() => skip(7 * 24 * 60 * MINUTE, '7 days')} />
        <Text style={styles.note}>1 day ends a new account's 24-hour wait (F3). 7 days brings a pause reminder (G3).</Text>
      </Section>

      <Section title="Security">
        <Button label="Lock the app now" variant="secondary" onPress={() => lockNow(router)} />
        <Text style={styles.note}>The same as leaving SpreadIT in the background for 5 minutes (F5).</Text>
      </Section>

      <Section title="Start again">
        <Button
          label="Clear paydays and the fake bank"
          variant="critical"
          onPress={() => {
            resetPaydays();
            resetBank();
            setMessage('Paydays and the fake bank are cleared. Your account and plan are kept.');
          }}
        />
        <Button label="Back" variant="quiet" onPress={() => router.back()} />
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[1], ...shadow.card },
  line: { ...type.body, color: colors.ink },
  message: { ...type.bodyStrong, color: colors.brandStrong },
  section: { gap: space[2] },
  heading: { ...type.titleSm, color: colors.ink },
  note: { ...type.label, color: colors.inkMuted },
});
