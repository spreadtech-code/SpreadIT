// S15 Home dashboard (E1).
// E1: latest income amount and date, allocation by category, status of each
// transfer, unsplit balance, next expected pay date, Automation On label and
// the Emergency pause button.
// - Automation off: a prompt to switch on.
// - Paused (F1): "Automation paused" in the hero, the pause message and Resume
//   (PIN + one-time code, S23).
// - A payday waiting for the user (review window, short payday, "Is this
//   income?", held) shows as a card at the top with the way to act on it.
// - The last split payday shows where the money went, with live statuses.
// - "Sent from your balance": the latest one-off transfers (B14, D13).
// Hold the "SpreadIT" name for 1 second to open the hidden Demo controls.
// Goes to: S10 (Simulate), S28 (Send extra), S7 (Add rule), S16-S18 (a waiting
// payday), S20 (Open event), S21 (a transfer), S29 (Send to my account), S6, S19, S24.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, Calculator, Plus, Receipt, Send, Wallet } from 'lucide-react-native';
import { ActivityList, BalanceHero, Button, InsightCard, type ActivityItem } from '../../src/components';
import { floatingNavInset } from '../../src/components/FloatingNav';
import { formatNaira } from '../../src/engine/format';
import { useBank } from '../../src/fakebank/bankStore';
import { automationText, dayMonth, payDates } from '../../src/lib/payDates';
import { unsplitKobo, WAITING_STAGES, type IncomeEvent } from '../../src/payday/events';
import { useNow } from '../../src/payday/PaydayRunner';
import { bankTransfer, eventRoute, usePaydays } from '../../src/payday/paydayStore';
import { transferItems } from '../../src/payday/transferItems';
import { goLiveRoute, isPaused, useApp } from '../../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../../src/theme/tokens';

export default function HomeDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const plan = useApp((s) => s.plan);
  const income = useApp((s) => s.income);
  const account = useApp((s) => s.account);
  const identity = useApp((s) => s.identity);
  const automationOn = useApp((s) => s.automation.on);
  const paused = useApp((s) => isPaused(s));
  const events = usePaydays((s) => s.events);
  const oneOffs = usePaydays((s) => s.oneOffs);
  const balance = useBank((s) => s.bank.balanceKobo);
  useBank((s) => s.bank.transfers); // re-render when a status changes
  const t = useNow();
  const today = new Date(t);

  // The name comes from the identity check (A6); before that, the email.
  const initials = identity
    ? `${identity.firstName[0]}${identity.lastName[0]}`.toUpperCase()
    : (account?.email.slice(0, 2) ?? 'SI').toUpperCase();

  const newestFirst = [...events].sort((a, b) => b.receivedAt - a.receivedAt);
  const waiting = newestFirst.filter((e) => WAITING_STAGES.includes(e.stage));
  const lastSplit = newestFirst.find((e) => e.stage === 'sending' || e.stage === 'done');
  const unsplit = unsplitKobo(balance, events);
  const next = income ? payDates(income, today).next : null;

  // Design system v3: the middle action is the round "+" button.
  const heroActions = [
    { label: 'Simulate', Icon: Calculator, onPress: () => router.push('/payday-simulator') },
    { label: 'Add rule', Icon: Plus, onPress: () => router.push('/rule-editor?custom=1') },
    { label: 'Send extra', Icon: Send, onPress: () => router.push('/send-extra-once') },
  ];

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4], paddingBottom: floatingNavInset(insets.bottom) }]}
    >
      <View style={styles.heroBleed}>
        <BalanceHero
          initials={initials}
          label={lastSplit ? `Last payday · ${dayMonth(new Date(lastSplit.receivedAt))}` : 'No payday yet'}
          amountKobo={lastSplit?.amountKobo ?? 0}
          actions={heroActions}
          automation={
            !automationOn
              ? { paused: false, off: true, text: 'Automation off' }
              : paused
                ? { paused: true }
                : { paused: false, text: automationText(next, today) }
          }
          onWordmarkLongPress={() => router.push('/demo-controls')}
          onSettingsPress={() => router.navigate('/settings')}
        />
      </View>

      {!automationOn ? (
        <>
          <InsightCard
            title="Automation is off"
            text={
              plan.rules.length > 0
                ? 'Switch it on and your next payday will be split by your plan.'
                : 'Add at least one rule to your plan, then switch on automation.'
            }
          />
          {plan.rules.length > 0 ? (
            <Button label="Switch on automation" variant="secondary" onPress={() => router.push(goLiveRoute(useApp.getState()))} />
          ) : null}
        </>
      ) : null}

      {automationOn && paused ? (
        <View style={styles.card} accessibilityRole="summary">
          <Text style={styles.cardTitle}>Automation paused</Text>
          <Text style={styles.body}>Income will stay in your SpreadIT account until you resume.</Text>
          <Button label="Resume" variant="secondary" accessibilityHint="Needs your PIN and a one-time code." onPress={() => router.push('/verify-change?resume=1')} />
        </View>
      ) : null}

      {waiting.map((e) => (
        <WaitingCard key={e.id} event={e} now={t} />
      ))}

      {lastSplit ? (
        <LastPayday event={lastSplit} now={t} />
      ) : automationOn && waiting.length === 0 ? (
        <InsightCard title="Waiting for your next payday" text="When income reaches your SpreadIT account, you'll see it here." />
      ) : null}

      {oneOffs.length > 0 ? (
        <ActivityList
          title="Sent from your balance"
          items={[...oneOffs]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 3)
            .map((o) => ({
              id: o.reference,
              name: o.kind === 'extra' ? `Extra for ${o.name}` : o.name,
              meta: `${dayMonth(new Date(o.createdAt))} · ${bankTransfer(o.reference)?.status ?? 'Pending'}`,
              direction: 'out' as const,
              amountKobo: o.amountKobo,
              onPress: () => router.push(`/transfer-receipt?ref=${o.reference}`),
            }))}
        />
      ) : null}

      <View style={styles.card}>
        <Fact
          Icon={Wallet}
          label="Unsplit money"
          value={formatNaira(unsplit)}
          detail={unsplit > 0 ? 'In your SpreadIT account, not part of any split.' : 'Nothing waiting. Every naira was split.'}
        />
        <Button label="Send to my account" variant="secondary" disabled={unsplit === 0} onPress={() => router.push('/send-to-my-account')} />
        <View style={styles.hairline} />
        <Fact
          Icon={CalendarDays}
          label="Next payday"
          value={next ? dayMonth(next) : 'When income arrives'}
          detail={next ? undefined : 'Your income varies, so there is no set date.'}
        />
      </View>

      <View style={styles.links}>
        <Button label="Open plan" variant="secondary" onPress={() => router.navigate('/plan-builder')} />
        <Button label="Income history" variant="secondary" onPress={() => router.navigate('/income-history')} />
      </View>

      {automationOn && !paused ? (
        <Button
          label="Emergency pause"
          variant="critical"
          accessibilityHint="Stops all automation. You will need your PIN."
          onPress={() => router.push('/emergency-pause')}
        />
      ) : null}
    </ScrollView>
  );
}

/** A payday that needs the user: review window, short payday, "Is this income?" or held. */
function WaitingCard({ event, now }: { event: IncomeEvent; now: number }) {
  const router = useRouter();
  const amount = formatNaira(event.amountKobo);
  const open = () => router.push(eventRoute(event) as never);
  let title = '';
  let text = '';
  let action = 'Open payday';
  if (event.stage === 'review') {
    const s = Math.max(0, Math.floor(((event.reviewEndsAt ?? now) - now) / 1000));
    title = `${amount} received`;
    text = `Your split goes out in ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}.`;
  } else if (event.stage === 'needsApproval') {
    title = `Short payday: ${amount}`;
    text = 'Less than half of what you expect. Nothing is sent until you choose.';
    action = 'Review it';
  } else if (event.stage === 'askIncome') {
    title = 'Is this income?';
    text = `${amount} arrived, below your qualifying minimum.`;
    action = 'Answer';
  } else {
    title = `${amount} held, not split yet`;
    text = 'Nothing is sent until you split it.';
    action = 'Split now';
  }
  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.body}>{text}</Text>
      <Button label={action} variant="secondary" onPress={open} />
      {event.stage === 'held' ? (
        <Button label="Send to my account" variant="quiet" onPress={() => router.push('/send-to-my-account')} />
      ) : null}
    </View>
  );
}

function LastPayday({ event, now }: { event: IncomeEvent; now: number }) {
  const router = useRouter();
  const date = dayMonth(new Date(event.receivedAt));
  const first = event.transfers.find((tr) => tr.id !== 'remainder' && bankTransfer(tr.reference)?.status === 'Successful');
  const items: ActivityItem[] = [
    { id: 'income', name: 'Payday', meta: date, direction: 'in', amountKobo: event.amountKobo, onPress: () => router.push(`/income-event?event=${event.id}`) },
    ...transferItems(event, now, (ref) => router.push(`/transfer-receipt?event=${event.id}&ref=${ref}`)),
    {
      id: 'fees',
      name: 'Bank fees',
      meta: `${formatNaira(event.split.inflowFeeKobo)} to receive + ${formatNaira(event.split.totalFeesKobo - event.split.inflowFeeKobo)} to send`,
      direction: 'out',
      amountKobo: event.split.totalFeesKobo,
      Icon: Receipt,
    },
  ];
  return (
    <>
      {first ? <InsightCard title={`${first.name} paid`} text={`${first.name} got ${formatNaira(first.amountKobo)} on ${date}.`} /> : null}
      <ActivityList title="Where it went" items={items} />
      <Button label="Open event" variant="quiet" onPress={() => router.push(`/income-event?event=${event.id}`)} />
    </>
  );
}

function Fact({ Icon, label, value, detail }: { Icon: typeof Wallet; label: string; value: string; detail?: string }) {
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}.${detail ? ` ${detail}` : ''}`}>
      <View style={styles.iconCircle}>
        <Icon size={size.icon} color={colors.ink} strokeWidth={1.75} />
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
  // The black hero sits closer to the screen edges than the rest, as in the reference.
  heroBleed: { marginHorizontal: -space[3] },
  content: { paddingHorizontal: space[5], gap: space[4] },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[3], ...shadow.card },
  cardTitle: { ...type.headline, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  fact: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: size.touchMin },
  iconCircle: {
    width: size.iconCircle,
    height: size.iconCircle,
    borderRadius: radius.pill,
    backgroundColor: colors.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factText: { flex: 1, gap: space[1] },
  factLabel: { ...type.headline, color: colors.ink },
  factValue: { ...type.amountMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  muted: { ...type.label, color: colors.inkMuted },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  links: { gap: space[2] },
});
