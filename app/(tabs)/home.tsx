// S15 Home dashboard (E1), v4 layout (Figma "S15 Home").
// E1: latest income amount and date, allocation by category, status of each
// transfer, unsplit balance, next expected pay date, the Autopilot label and
// the Pause everything button (PRD "Emergency pause"; app words in docs/copy.md).
// - Autopilot off: a prompt to turn it on.
// - Paused (F1): "Autopilot paused" in the chip, the pause message and Resume
//   (PIN + one-time code, S23).
// - A payday waiting for the user (review window, short payday, "Is this pay?",
//   held) shows as a card at the top with the way to act on it.
// - "Where it went": the last split payday as a donut with a legend.
// - "Recent activity": the payday, each transfer with its live status, and the
//   latest one-off transfers (B14, D13).
// Hold the greeting for 1 second to open the hidden Demo controls.
// Goes to: S10 (Simulate), S28 (Send extra), S7 (Add rule), S16-S18 (a waiting
// payday), S20 (Details), S21 (a transfer), S29 (Move to your account), S6, S19, S24.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, Calculator, CirclePause, Plus, Send, Wallet } from 'lucide-react-native';
import { ActivityList, BalanceHero, Button, feeColour, InsightCard, leftoverColour, SectionHeader, SplitDonut, SplitLegend, type ActivityItem, type SplitSlice } from '../../src/components';
import { floatingNavInset } from '../../src/components/FloatingNav';
import { formatNaira } from '../../src/engine/format';
import { useBank } from '../../src/fakebank/bankStore';
import { automationText, dayMonth, payDates } from '../../src/lib/payDates';
import { unsplitKobo, WAITING_STAGES, type IncomeEvent } from '../../src/payday/events';
import { useNow } from '../../src/payday/PaydayRunner';
import { bankTransfer, eventRoute, unreadCount, usePaydays } from '../../src/payday/paydayStore';
import { transferItems } from '../../src/payday/transferItems';
import { goLiveRoute, isPaused, useApp } from '../../src/state/appStore';
import { colors, layout, radius, shadow, size, space, type } from '../../src/theme/tokens';

export default function HomeDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const plan = useApp((s) => s.plan);
  const income = useApp((s) => s.income);
  const identity = useApp((s) => s.identity);
  const automationOn = useApp((s) => s.automation.on);
  const paused = useApp((s) => isPaused(s));
  const events = usePaydays((s) => s.events);
  const oneOffs = usePaydays((s) => s.oneOffs);
  const unread = usePaydays(unreadCount);
  const balance = useBank((s) => s.bank.balanceKobo);
  useBank((s) => s.bank.transfers); // re-render when a status changes
  const t = useNow();
  const today = new Date(t);

  const newestFirst = [...events].sort((a, b) => b.receivedAt - a.receivedAt);
  const waiting = newestFirst.filter((e) => WAITING_STAGES.includes(e.stage));
  const lastSplit = newestFirst.find((e) => e.stage === 'sending' || e.stage === 'done');
  const unsplit = unsplitKobo(balance, events);
  const next = income ? payDates(income, today).next : null;

  const greeting = identity ? `Hi, ${identity.firstName}` : 'Hi there';
  const status = !automationOn
    ? 'Autopilot is off.'
    : paused
      ? 'Everything is paused.'
      : waiting.length > 0
        ? 'A payday needs you.'
        : lastSplit
          ? lastSplit.stage === 'done'
            ? 'Payday’s done. Everything’s sent.'
            : 'Your payday is going out.'
          : 'Waiting for your next payday.';

  const heroActions = [
    { label: 'Simulate', Icon: Calculator, onPress: () => router.push('/payday-simulator') },
    { label: 'Send extra', Icon: Send, onPress: () => router.push('/send-extra-once') },
    { label: 'Add a rule', Icon: Plus, onPress: () => router.push('/rule-editor?custom=1') },
  ];

  const oneOffItems: ActivityItem[] = [...oneOffs]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3)
    .map((o) => ({
      id: o.reference,
      name: o.kind === 'extra' ? `Extra for ${o.name}` : o.name,
      meta: dayMonth(new Date(o.createdAt)),
      direction: 'out' as const,
      amountKobo: o.amountKobo,
      status: bankTransfer(o.reference)?.status ?? 'Pending',
      onPress: () => router.push(`/transfer-receipt?ref=${o.reference}`),
    }));

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4], paddingBottom: floatingNavInset(insets.bottom) }]}
    >
      <BalanceHero
        greeting={greeting}
        status={status}
        label={lastSplit ? `Last payday · ${dayMonth(new Date(lastSplit.receivedAt))}` : 'No payday yet'}
        amountKobo={lastSplit?.amountKobo ?? 0}
        actions={heroActions}
        autopilot={
          !automationOn
            ? { state: 'off', text: 'Autopilot off' }
            : paused
              ? { state: 'paused', text: 'Autopilot paused' }
              : { state: 'on', text: automationText(next, today) }
        }
        onGreetingLongPress={() => router.push('/demo-controls')}
        onBellPress={() => router.push('/notifications')}
        unread={unread}
      />

      {!automationOn ? (
        <View style={styles.card} accessibilityRole="summary">
          <Text style={styles.cardTitle}>Autopilot is off</Text>
          <Text style={styles.body}>
            {plan.rules.length > 0
              ? 'Turn it on and your next payday will be split by your plan.'
              : 'Add at least one rule to your plan, then turn on Autopilot.'}
          </Text>
          {plan.rules.length > 0 ? (
            <Button label="Turn on Autopilot" variant="primary" onPress={() => router.push(goLiveRoute(useApp.getState()))} />
          ) : null}
        </View>
      ) : null}

      {automationOn && paused ? (
        <View style={styles.card} accessibilityRole="summary">
          <Text style={styles.cardTitle}>Autopilot paused</Text>
          <Text style={styles.body}>Your pay will stay in your SpreadIT account until you resume.</Text>
          <Button label="Resume" variant="primary" accessibilityHint="Needs your PIN and a 6-digit code." onPress={() => router.push('/verify-change?resume=1')} />
        </View>
      ) : null}

      {waiting.map((e) => (
        <WaitingCard key={e.id} event={e} now={t} />
      ))}

      {lastSplit ? (
        <WhereItWent event={lastSplit} />
      ) : automationOn && waiting.length === 0 ? (
        <InsightCard title="Waiting for your next payday" text="When your pay reaches your SpreadIT account, you’ll see it here." />
      ) : null}

      <View style={styles.card}>
        <Fact
          Icon={Wallet}
          label="Unsplit money"
          value={formatNaira(unsplit)}
          detail={unsplit > 0 ? 'In your SpreadIT account, not in any split.' : 'Nothing waiting. Every naira was split.'}
        />
        {unsplit > 0 ? <Button label="Move to your account" variant="secondary" onPress={() => router.push('/send-to-my-account')} /> : null}
        <View style={styles.hairline} />
        <Fact
          Icon={CalendarDays}
          label="Next payday"
          value={next ? dayMonth(next) : 'When pay lands'}
          detail={next ? undefined : 'Your pay varies, so there’s no set date.'}
        />
      </View>

      {lastSplit || oneOffItems.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="Recent activity" action="See all" onPress={() => router.navigate('/income-history')} />
          <RecentActivity event={lastSplit} now={t} extra={oneOffItems} />
        </View>
      ) : null}

      {automationOn && !paused ? (
        <Button
          label="Pause everything"
          icon={CirclePause}
          variant="critical"
          accessibilityHint="Stops Autopilot. You will need your PIN."
          onPress={() => router.push('/emergency-pause')}
        />
      ) : null}
    </ScrollView>
  );
}

/** A payday that needs the user: review window, short payday, "Is this pay?" or held. */
function WaitingCard({ event, now }: { event: IncomeEvent; now: number }) {
  const router = useRouter();
  const amount = formatNaira(event.amountKobo);
  const open = () => router.push(eventRoute(event) as never);
  let title = '';
  let text = '';
  let action = 'Open payday';
  if (event.stage === 'review') {
    const s = Math.max(0, Math.floor(((event.reviewEndsAt ?? now) - now) / 1000));
    title = `${amount} just landed`;
    text = `Your split goes out in ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}.`;
  } else if (event.stage === 'needsApproval') {
    title = `Short payday: ${amount}`;
    text = 'Less than half of what you expect. Nothing goes out until you choose.';
    action = 'Review it';
  } else if (event.stage === 'askIncome') {
    title = 'Is this pay?';
    text = `${amount} arrived, below your minimum for a payday.`;
    action = 'Answer';
  } else {
    title = `${amount} on hold, not split yet`;
    text = 'Nothing goes out until you split it.';
    action = 'Split now';
  }
  return (
    <View style={[styles.card, styles.waiting]} accessibilityRole="summary">
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.body}>{text}</Text>
      <Button label={action} variant="primary" onPress={open} />
      {event.stage === 'held' ? <Button label="Move to your account" variant="quiet" onPress={() => router.push('/send-to-my-account')} /> : null}
    </View>
  );
}

/** The last split payday as a donut: each rule, the leftovers and the bank fees. */
function WhereItWent({ event }: { event: IncomeEvent }) {
  const router = useRouter();
  const slices: SplitSlice[] = [
    ...event.transfers.map((tr) => ({ id: tr.reference, name: tr.name, amountKobo: tr.amountKobo, colour: tr.id === 'remainder' ? leftoverColour : undefined })),
    { id: 'fees', name: 'Bank fees', amountKobo: event.split.totalFeesKobo, colour: feeColour },
  ];
  return (
    <View style={styles.card}>
      <SectionHeader title="Where it went" action="Details" onPress={() => router.push(`/income-event?event=${event.id}`)} />
      <SplitDonut slices={slices} centre={formatNaira(event.amountKobo)} caption={`split ${slices.length} ways`} />
      <SplitLegend slices={slices} />
    </View>
  );
}

function RecentActivity({ event, now, extra }: { event?: IncomeEvent; now: number; extra: ActivityItem[] }) {
  const router = useRouter();
  const items: ActivityItem[] = event
    ? [
        { id: 'income', name: 'Pay in', meta: dayMonth(new Date(event.receivedAt)), direction: 'in', amountKobo: event.amountKobo, onPress: () => router.push(`/income-event?event=${event.id}`) },
        ...transferItems(event, now, (ref) => router.push(`/transfer-receipt?event=${event.id}&ref=${ref}`)).slice(0, 3),
      ]
    : [];
  return <ActivityList items={[...extra, ...items]} />;
}

function Fact({ Icon, label, value, detail }: { Icon: typeof Wallet; label: string; value: string; detail?: string }) {
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}.${detail ? ` ${detail}` : ''}`}>
      <View style={styles.bubble}>
        <Icon size={size.icon} color={colors.primary} strokeWidth={1.75} />
      </View>
      <View style={styles.factText}>
        <Text style={styles.factLabel}>{label}</Text>
        {detail ? <Text style={styles.muted}>{detail}</Text> : null}
      </View>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.screenPadding, gap: space[6] },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[4], gap: space[4], ...shadow.card },
  waiting: { borderWidth: 1, borderColor: colors.brandMid },
  cardTitle: { ...type.headline, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  section: { gap: space[2] },
  fact: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: size.touchMin },
  bubble: {
    width: size.bubble,
    height: size.bubble,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factText: { flex: 1, gap: space[1] },
  factLabel: { ...type.bodyStrong, color: colors.ink },
  factValue: { ...type.amountMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  muted: { ...type.label, color: colors.inkMuted },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
});
