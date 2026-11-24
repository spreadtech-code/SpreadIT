// S22 Settings (A3, A8, D2, F1, F5, F6, G2), on the Profile tab:
// - Automation: On / Paused / Off, with Emergency pause (S24) or Resume (S23).
// - Review window: 5, 15 or 60 minutes. "Off" appears only after 3 successful
//   automated paydays (D2). Once live, a change needs a one-time code (F2, S23).
// - How income arrives (A8): Forward mode or paid in directly.
// - Notifications (G2): payday summary SMS can be switched off. Security and
//   failure alerts can't: their switches are greyed out with the reason.
// - Security: auto-lock (F5) and signed-in phones with "Sign out" (F6).
// - Sign out of this phone (A3).
// Hidden: hold the "Settings" title for 1 second to open the Components screen.
import type { ReactNode } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, OptionList, SegmentedControl, Toggle } from '../../src/components';
import { floatingNavInset } from '../../src/components/FloatingNav';
import { dayMonth } from '../../src/lib/payDates';
import { timeText } from '../../src/lib/splitText';
import { bankTransfer, usePaydays } from '../../src/payday/paydayStore';
import { goLiveRoute, isLive, isPaused, useApp, type Income, type ReviewWindowMinutes } from '../../src/state/appStore';
import { colors, radius, shadow, space, type } from '../../src/theme/tokens';

/** D2: the review window can be switched off after this many successful automated paydays. */
const PAYDAYS_BEFORE_WINDOW_OFF = 3;

type WindowOption = '0' | '5' | '15' | '60';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const account = useApp((s) => s.account);
  const identity = useApp((s) => s.identity);
  const income = useApp((s) => s.income);
  const automation = useApp((s) => s.automation);
  const paused = useApp((s) => isPaused(s));
  const live = useApp((s) => isLive(s));
  const notifications = useApp((s) => s.notifications);
  const otherDevices = useApp((s) => s.otherDevices);
  const events = usePaydays((s) => s.events);
  const { saveIncome, setReviewWindow, requestChange, setPaydaySummarySms, signOutDevice, signOut } = useApp.getState();

  const successfulPaydays = events.filter(
    (e) => e.stage === 'done' && e.transfers.length > 0 && e.transfers.every((t) => bankTransfer(t.reference)?.status === 'Successful'),
  ).length;
  const canSwitchWindowOff = successfulPaydays >= PAYDAYS_BEFORE_WINDOW_OFF || automation.reviewWindowMinutes === 0;

  const changeWindow = (value: WindowOption) => {
    const minutes = Number(value) as ReviewWindowMinutes;
    if (minutes === automation.reviewWindowMinutes) return;
    if (live) {
      requestChange({ kind: 'reviewWindow', minutes });
      router.push('/verify-change');
    } else setReviewWindow(minutes);
  };

  const changeArrival = (arrival: Income['arrival']) => {
    if (income && arrival !== income.arrival) saveIncome({ ...income, arrival });
  };

  const confirmSignOut = () =>
    Alert.alert('Sign out of this phone?', "You'll need your phone number or email and password to sign in again.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          signOut();
          if (router.canDismiss()) router.dismissAll();
          router.replace('/sign-in');
        },
      },
    ]);

  const name = identity ? `${identity.firstName} ${identity.lastName}` : null;
  const automationStatus = !automation.on
    ? 'Off'
    : paused
      ? `Paused since ${dayMonth(new Date(automation.pausedAt!))}, ${timeText(automation.pausedAt!)}`
      : 'On';

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4], paddingBottom: floatingNavInset(insets.bottom) }]}
    >
      <Pressable onLongPress={() => router.push('/components')} delayLongPress={1000}>
        <Text style={styles.title} accessibilityRole="header">
          Settings
        </Text>
      </Pressable>

      <View style={styles.card} accessible accessibilityLabel={[name, account?.phone, account?.email].filter(Boolean).join(', ')}>
        {name ? <Text style={styles.cardTitle}>{name}</Text> : null}
        <Text style={styles.body}>{account?.phone}</Text>
        <Text style={styles.body}>{account?.email}</Text>
      </View>

      <Section title="Automation">
        <Row label="Status" value={automationStatus} />
        {!automation.on ? (
          <Button label="Switch on automation" variant="secondary" onPress={() => router.push(goLiveRoute(useApp.getState()))} />
        ) : paused ? (
          <Button label="Resume" variant="secondary" accessibilityHint="Needs your PIN and a one-time code." onPress={() => router.push('/verify-change?resume=1')} />
        ) : (
          <Button label="Emergency pause" variant="critical" accessibilityHint="Stops all automation. You will need your PIN." onPress={() => router.push('/emergency-pause')} />
        )}
      </Section>

      <Section title="Review window">
        <Text style={styles.muted}>Time to check a payday before the transfers go out.{live ? ' Changing it needs a one-time code.' : ''}</Text>
        <SegmentedControl<WindowOption>
          accessibilityLabel="Review window"
          options={[
            { value: '5', label: '5 min' },
            { value: '15', label: '15 min' },
            { value: '60', label: '60 min' },
            ...(canSwitchWindowOff ? [{ value: '0' as const, label: 'Off' }] : []),
          ]}
          value={String(automation.reviewWindowMinutes) as WindowOption}
          onChange={changeWindow}
        />
        {!canSwitchWindowOff ? (
          <Text style={styles.muted}>
            You can switch it off after {PAYDAYS_BEFORE_WINDOW_OFF} successful paydays ({successfulPaydays} so far).
          </Text>
        ) : null}
      </Section>

      {income ? (
        <Section title="How income arrives">
          <OptionList
            accessibilityLabel="How income arrives"
            options={[
              { value: 'forward', label: 'Forward mode', description: 'You get paid at your bank, then send it to SpreadIT in one transfer.' },
              { value: 'direct', label: 'Paid in directly', description: 'Your income is paid straight into your SpreadIT account.' },
            ]}
            value={income.arrival}
            onChange={changeArrival}
          />
          {income.arrival === 'forward' ? (
            <Button label="Forward mode setup" variant="quiet" onPress={() => router.push('/forward-mode-setup')} />
          ) : null}
        </Section>
      ) : null}

      <Section title="Notifications">
        <Toggle
          label="Payday summary by SMS"
          description="A text when your split is done. You always get the push."
          value={notifications.paydaySummarySms}
          onValueChange={setPaydaySummarySms}
        />
        <Toggle
          label="Security alerts"
          value
          onValueChange={() => {}}
          disabled
          disabledReason="Always on. They tell you about changes to your plan and accounts."
        />
        <Toggle
          label="Failed transfer alerts"
          value
          onValueChange={() => {}}
          disabled
          disabledReason="Always on. You always hear when money doesn't reach someone."
        />
      </Section>

      <Section title="Security">
        <Row label="Auto-lock" value="After 5 minutes" />
        <Text style={styles.muted}>When SpreadIT has been in the background for 5 minutes, it asks for your PIN.</Text>
        <Text style={styles.subheading}>Signed-in phones</Text>
        <Device model={Platform.OS === 'ios' ? 'This iPhone' : 'This Android phone'} lastUsed="Now" />
        {otherDevices.map((d) => (
          <Device
            key={d.id}
            model={d.model}
            lastUsed={`${dayMonth(new Date(d.lastUsedAt))}, ${timeText(d.lastUsedAt)}`}
            onSignOut={() =>
              Alert.alert(`Sign out ${d.model}?`, 'That phone will need the password to sign in again.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign out', style: 'destructive', onPress: () => signOutDevice(d.id) },
              ])
            }
          />
        ))}
      </Section>

      <Button label="Get help" variant="secondary" onPress={() => router.push('/get-help')} />
      <Button label="Sign out" variant="quietCritical" onPress={confirmSignOut} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.body}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Device({ model, lastUsed, onSignOut }: { model: string; lastUsed: string; onSignOut?: () => void }) {
  return (
    <View style={styles.device}>
      <View style={styles.deviceText} accessible accessibilityLabel={`${model}, last used ${lastUsed}`}>
        <Text style={styles.bodyStrong}>{model}</Text>
        <Text style={styles.muted}>Last used: {lastUsed}</Text>
      </View>
      {onSignOut ? <Button label="Sign out" variant="quiet" accessibilityLabel={`Sign out ${model}`} onPress={onSignOut} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: space[5], gap: space[4] },
  title: { ...type.title, color: colors.ink },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[3], ...shadow.card },
  cardTitle: { ...type.titleSm, color: colors.ink },
  subheading: { ...type.headline, color: colors.ink, marginTop: space[2] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3] },
  body: { ...type.body, color: colors.ink },
  bodyStrong: { ...type.bodyStrong, color: colors.ink },
  value: { ...type.bodyStrong, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  muted: { ...type.label, color: colors.inkMuted },
  device: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  deviceText: { flex: 1, gap: space[1] },
});
