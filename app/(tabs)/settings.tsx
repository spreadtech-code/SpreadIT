// S22 Settings, shown as "Profile" (A3, A8, D2, F1, F5, F6, G2). v4 layout
// (Figma "S22 Profile"): a profile card, then grouped cards of rows.
// - Autopilot (PRD "Automation"): On / Paused / Off. Off -> turn on (S11...);
//   Paused -> Resume (S23). Pause everything (S24) sits in the last group.
// - Review time (PRD "review window", D2): 5, 15 or 60 minutes in a sheet. "Off"
//   appears only after 3 successful paydays. Once live, a change needs a
//   one-time code (F2, S23).
// - Pay arrives by (A8): Forward mode or paid in directly, in a sheet.
// - Your money: the SpreadIT account (S13), Move unsplit money (S29), and in
//   Forward mode the setup (S26) and the salary-switch kit (S27).
// - Notifications (G2): payday summary SMS can be switched off. Security and
//   failed-transfer alerts are always on and say so.
// - Security: auto-lock after 5 minutes (F5) and signed-in phones with
//   "Log out" for each (F6), in a sheet.
// - Log out of this phone (A3, PRD "Sign out").
// Hidden: hold the "Profile" title for 1 second to open the Components screen.
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Bot,
  CirclePause,
  CirclePlay,
  Clock,
  Forward,
  Landmark,
  LifeBuoy,
  Lock,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react-native';
import { Button, OptionList, SegmentedControl, SettingsGroup, SettingsRow, Sheet } from '../../src/components';
import { floatingNavInset } from '../../src/components/FloatingNav';
import { formatNaira, maskAccount } from '../../src/engine/format';
import { useBank } from '../../src/fakebank/bankStore';
import { dayMonth } from '../../src/lib/payDates';
import { timeText } from '../../src/lib/splitText';
import { unsplitKobo } from '../../src/payday/events';
import { successfulPaydays, usePaydays } from '../../src/payday/paydayStore';
import { goLiveRoute, isLive, isPaused, useApp, type Income, type ReviewWindowMinutes } from '../../src/state/appStore';
import { colors, layout, radius, shadow, size, space, type } from '../../src/theme/tokens';

/** D2: the review window can be switched off after this many successful automated paydays. */
const PAYDAYS_BEFORE_WINDOW_OFF = 3;

type WindowOption = '0' | '5' | '15' | '60';
type OpenSheet = null | 'review' | 'arrival' | 'phones';

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
  const spreaditAccount = useApp((s) => s.spreaditAccount);
  const events = usePaydays((s) => s.events);
  const balance = useBank((s) => s.bank.balanceKobo);
  const { saveIncome, setReviewWindow, requestChange, setPaydaySummarySms, signOutDevice, signOut } = useApp.getState();
  const [sheet, setSheet] = useState<OpenSheet>(null);

  const successful = successfulPaydays(events);
  const canSwitchWindowOff = successful >= PAYDAYS_BEFORE_WINDOW_OFF || automation.reviewWindowMinutes === 0;
  const unsplit = unsplitKobo(balance, events);
  const thisPhone = Platform.OS === 'ios' ? 'This iPhone' : 'This Android phone';

  const changeWindow = (value: WindowOption) => {
    const minutes = Number(value) as ReviewWindowMinutes;
    if (minutes === automation.reviewWindowMinutes) return;
    setSheet(null);
    if (live) {
      requestChange({ kind: 'reviewWindow', minutes });
      router.push('/verify-change');
    } else setReviewWindow(minutes);
  };

  const changeArrival = (arrival: Income['arrival']) => {
    if (income && arrival !== income.arrival) saveIncome({ ...income, arrival });
    setSheet(null);
  };

  const confirmLogOut = () =>
    Alert.alert('Log out of this phone?', "You'll need your phone number or email and password to log in again.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          signOut();
          if (router.canDismiss()) router.dismissAll();
          router.replace('/sign-in');
        },
      },
    ]);

  const name = identity ? `${identity.firstName} ${identity.lastName}` : 'Your profile';
  const initials = identity
    ? `${identity.firstName[0]}${identity.lastName[0]}`.toUpperCase()
    : (account?.email.slice(0, 2) ?? 'SI').toUpperCase();
  const autopilotValue = !automation.on ? 'Off' : paused ? 'Paused' : 'On';
  const windowText = automation.reviewWindowMinutes === 0 ? 'Off' : `${automation.reviewWindowMinutes} min`;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4], paddingBottom: floatingNavInset(insets.bottom) }]}
    >
      <Pressable onLongPress={() => router.push('/components')} delayLongPress={1000}>
        <Text style={styles.title} accessibilityRole="header">
          Profile
        </Text>
      </Pressable>

      <View style={styles.profile} accessible accessibilityLabel={[name, account?.phone, account?.email].filter(Boolean).join(', ')}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>{name}</Text>
          {account?.phone ? <Text style={styles.muted}>{account.phone}</Text> : null}
          {account?.email ? <Text style={styles.muted}>{account.email}</Text> : null}
        </View>
      </View>

      <SettingsGroup title="Autopilot">
        <SettingsRow
          label="Autopilot"
          Icon={Bot}
          value={autopilotValue}
          accessibilityHint={
            !automation.on ? 'Turns on Autopilot.' : paused ? `Paused since ${dayMonth(new Date(automation.pausedAt!))}, ${timeText(automation.pausedAt!)}.` : undefined
          }
          onPress={!automation.on ? () => router.push(goLiveRoute(useApp.getState())) : undefined}
        />
        <SettingsRow label="Review time" Icon={Clock} value={windowText} onPress={() => setSheet('review')} />
        {income ? (
          <SettingsRow
            label="Pay arrives by"
            Icon={ArrowLeftRight}
            value={income.arrival === 'forward' ? 'Forwarded' : 'Paid in'}
            onPress={() => setSheet('arrival')}
          />
        ) : null}
      </SettingsGroup>

      <SettingsGroup title="Your money">
        <SettingsRow
          label="Your SpreadIT account"
          Icon={Landmark}
          value={spreaditAccount ? maskAccount(spreaditAccount.accountNumber) : 'Not open yet'}
          onPress={() => router.push('/your-spreadit-account')}
        />
        <SettingsRow label="Move unsplit money" Icon={Wallet} value={formatNaira(unsplit)} onPress={() => router.push('/send-to-my-account')} />
        {income?.arrival === 'forward' ? <SettingsRow label="Forward mode setup" Icon={Forward} onPress={() => router.push('/forward-mode-setup')} /> : null}
        {income?.arrival === 'forward' ? (
          <SettingsRow label="Move your salary here" Icon={ArrowUpRight} onPress={() => router.push('/salary-switch-kit')} />
        ) : null}
      </SettingsGroup>

      <SettingsGroup title="Notifications">
        <SettingsRow
          label="Payday summary by SMS"
          Icon={MessageSquare}
          accessibilityHint="A text when your split is done. You always get the push."
          switchValue={notifications.paydaySummarySms}
          onSwitch={setPaydaySummarySms}
        />
        <SettingsRow label="Security alerts" Icon={ShieldCheck} value="Always on" accessibilityHint="They tell you about changes to your plan and accounts." />
        <SettingsRow label="Failed transfer alerts" Icon={Bell} value="Always on" accessibilityHint="You always hear when money doesn’t reach someone." />
      </SettingsGroup>

      <SettingsGroup title="Security">
        <SettingsRow label="Auto-lock" Icon={Lock} value="5 min" accessibilityHint="After 5 minutes in the background, SpreadIT asks for your PIN." />
        <SettingsRow label="Signed-in phones" Icon={Smartphone} value={String(otherDevices.length + 1)} onPress={() => setSheet('phones')} />
      </SettingsGroup>

      <SettingsGroup title="Help">
        <SettingsRow label="Get help" Icon={LifeBuoy} onPress={() => router.push('/get-help')} />
      </SettingsGroup>

      <SettingsGroup>
        {automation.on && paused ? (
          <SettingsRow label="Resume Autopilot" Icon={CirclePlay} accessibilityHint="Needs your PIN and a one-time code." onPress={() => router.push('/verify-change?resume=1')} />
        ) : automation.on ? (
          <SettingsRow
            label="Pause everything"
            Icon={CirclePause}
            tone="critical"
            accessibilityHint="Stops Autopilot. You will need your PIN."
            onPress={() => router.push('/emergency-pause')}
          />
        ) : null}
        <SettingsRow label="Log out" Icon={LogOut} tone="critical" onPress={confirmLogOut} />
      </SettingsGroup>

      <Text style={styles.version}>SpreadIT 1.1 · Prototype</Text>

      <Sheet visible={sheet === 'review'} title="Review time" onClose={() => setSheet(null)} closeLabel="Done">
        <Text style={styles.body}>
          Time to check a payday before the money goes out.{live ? ' Changing it needs a one-time code.' : ''}
        </Text>
        <SegmentedControl<WindowOption>
          accessibilityLabel="Review time"
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
            You can turn it off after {PAYDAYS_BEFORE_WINDOW_OFF} paydays go through ({successful} so far).
          </Text>
        ) : null}
      </Sheet>

      {income ? (
        <Sheet visible={sheet === 'arrival'} title="Pay arrives by" onClose={() => setSheet(null)} closeLabel="Done">
          <OptionList
            accessibilityLabel="Pay arrives by"
            options={[
              { value: 'forward', label: 'Forward mode', description: 'You get paid at your bank, then send it to SpreadIT in one transfer.' },
              { value: 'direct', label: 'Paid in directly', description: 'Your pay goes straight into your SpreadIT account.' },
            ]}
            value={income.arrival}
            onChange={changeArrival}
          />
        </Sheet>
      ) : null}

      <Sheet visible={sheet === 'phones'} title="Signed-in phones" onClose={() => setSheet(null)} closeLabel="Done">
        <Device model={thisPhone} lastUsed="Now" />
        {otherDevices.map((d) => (
          <Device
            key={d.id}
            model={d.model}
            lastUsed={`${dayMonth(new Date(d.lastUsedAt))}, ${timeText(d.lastUsedAt)}`}
            onLogOut={() =>
              Alert.alert(`Log out ${d.model}?`, 'That phone will need the password to log in again.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log out', style: 'destructive', onPress: () => signOutDevice(d.id) },
              ])
            }
          />
        ))}
      </Sheet>
    </ScrollView>
  );
}

function Device({ model, lastUsed, onLogOut }: { model: string; lastUsed: string; onLogOut?: () => void }) {
  return (
    <View style={styles.device}>
      <View style={styles.deviceText} accessible accessibilityLabel={`${model}, last used ${lastUsed}`}>
        <Text style={styles.bodyStrong}>{model}</Text>
        <Text style={styles.muted}>Last used: {lastUsed}</Text>
      </View>
      {onLogOut ? <Button label="Log out" variant="quietCritical" fill={false} accessibilityLabel={`Log out ${model}`} onPress={onLogOut} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.screenPadding, gap: space[5] },
  title: { ...type.title, color: colors.ink },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  avatar: {
    width: size.buttonHeight,
    height: size.buttonHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...type.headline, color: colors.onBrand },
  profileText: { flex: 1, gap: 2 },
  name: { ...type.headline, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  bodyStrong: { ...type.bodyStrong, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
  version: { ...type.label, color: colors.inkFaint, textAlign: 'center' },
  device: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: size.touchMin },
  deviceText: { flex: 1, gap: space[1] },
});
