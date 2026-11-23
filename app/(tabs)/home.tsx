// S15 Home dashboard (E1), built early (founder decision, 23 Nov 2026).
// E1: latest income amount and date, allocation by category, status of each
// transfer, unsplit balance, next expected pay date, Automation On label and
// the Emergency pause button.
// Automation off (not switched on yet): no payday, a prompt to switch on.
// Automation on: until stage 5b the payday is a DEMO worked out from the
// user's own plan (src/fakebank/demoPayday.ts).
// Goes to: S10 (Simulate), S28 (Send extra), S7 (Add rule), S20 (Open event),
// S21 (a transfer), S29 (Send to my account), S6 (Open plan), S19 (history), S24 (pause).
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, Calculator, Plus, Receipt, Send, Wallet } from 'lucide-react-native';
import { ActivityList, BalanceHero, Button, InsightCard, categoryIcon, type ActivityItem } from '../../src/components';
import { floatingNavInset } from '../../src/components/FloatingNav';
import { feeSchedule } from '../../src/data/feeSchedule';
import { formatNaira, maskAccount } from '../../src/engine/format';
import { demoPayday } from '../../src/fakebank/demoPayday';
import { automationText, dayMonth } from '../../src/lib/payDates';
import { goLiveRoute, useApp } from '../../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../../src/theme/tokens';

export default function HomeDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const plan = useApp((s) => s.plan);
  const income = useApp((s) => s.income);
  const account = useApp((s) => s.account);
  const identity = useApp((s) => s.identity);
  const automationOn = useApp((s) => s.automation.on);

  const today = new Date();
  const payday = automationOn ? demoPayday(plan, income, feeSchedule, today) : null;
  // The name comes from the identity check (A6); before that, the email.
  const initials = identity
    ? `${identity.firstName[0]}${identity.lastName[0]}`.toUpperCase()
    : (account?.email.slice(0, 2) ?? 'SI').toUpperCase();

  const heroActions = [
    { label: 'Simulate', Icon: Calculator, onPress: () => router.push('/payday-simulator') },
    { label: 'Send extra', Icon: Send, onPress: () => router.push('/send-extra-once') },
    { label: 'Add rule', Icon: Plus, onPress: () => router.push('/rule-editor?custom=1') },
  ];

  const nav = { paddingTop: insets.top + space[4], paddingBottom: floatingNavInset(insets.bottom) };

  if (!payday) {
    const hasRules = plan.rules.length > 0;
    return (
      <ScrollView style={styles.page} contentContainerStyle={[styles.content, nav]}>
        <BalanceHero
          initials={initials}
          label="No payday yet"
          amountKobo={0}
          actions={heroActions}
          automation={
            automationOn
              ? { paused: false, text: 'Automation on' }
              : { paused: false, off: true, text: 'Automation off' }
          }
        />
        {automationOn ? (
          <InsightCard title="Nothing to show yet" text="Add at least one rule to your plan. Your payday will show here." />
        ) : (
          <InsightCard
            title="Automation is off"
            text={
              hasRules
                ? 'Switch it on and your next payday will be split by your plan.'
                : 'Add at least one rule to your plan, then switch on automation.'
            }
          />
        )}
        {!automationOn && hasRules ? (
          <Button
            label="Switch on automation"
            variant="secondary"
            onPress={() => router.push(goLiveRoute(useApp.getState()))}
          />
        ) : null}
        <Button label="Open plan" variant="secondary" onPress={() => router.navigate('/plan-builder')} />
        <Button label="Try the simulator" variant="quiet" onPress={() => router.push('/payday-simulator')} />
      </ScrollView>
    );
  }

  const { split, transfers } = payday;
  const date = dayMonth(payday.date);
  const first = transfers.find((t) => t.status === 'Successful' && t.id !== 'remainder');

  const items: ActivityItem[] = [
    {
      id: 'income',
      name: 'Payday',
      meta: date,
      direction: 'in',
      amountKobo: split.incomeKobo,
      onPress: () => router.push('/income-event'),
    },
    ...transfers.map(
      (t): ActivityItem => ({
        id: t.id,
        name: t.name,
        meta: t.destination ? `${t.destination.bankName} ${maskAccount(t.destination.accountNumber)}` : 'No account yet',
        direction: 'out',
        amountKobo: t.amountKobo,
        status: t.status,
        Icon: t.id === 'remainder' ? Wallet : categoryIcon(t.categoryKey),
        onPress: () => router.push('/transfer-receipt'),
      }),
    ),
    {
      id: 'fees',
      name: 'Bank fees',
      meta: `${formatNaira(split.inflowFeeKobo)} to receive + ${formatNaira(split.totalFeesKobo - split.inflowFeeKobo)} to send`,
      direction: 'out',
      amountKobo: split.totalFeesKobo,
      Icon: Receipt,
    },
  ];

  return (
    <ScrollView style={styles.page} contentContainerStyle={[styles.content, nav]}>
      <BalanceHero
        initials={initials}
        label={`Last payday · ${date}`}
        amountKobo={split.incomeKobo}
        actions={heroActions}
        automation={{ paused: false, text: automationText(payday.nextDate, today) }}
      />

      <Text style={styles.demo} accessibilityRole="text">
        Demo payday: pretend money, worked out from your plan.
      </Text>

      {first ? (
        <InsightCard title={`${first.name} paid`} text={`${first.name} got ${formatNaira(first.amountKobo)} on ${date}.`} />
      ) : null}

      <ActivityList title="Where it went" items={items} />
      <Button label="Open event" variant="quiet" onPress={() => router.push('/income-event')} />

      <View style={styles.card}>
        <Fact
          Icon={Wallet}
          label="Unsplit money"
          value={formatNaira(split.unsplitKobo)}
          detail={split.unsplitKobo > 0 ? 'Too little to be worth the fee to send.' : 'Nothing waiting. Every naira was split.'}
        />
        <Button
          label="Send to my account"
          variant="secondary"
          disabled={split.unsplitKobo === 0}
          onPress={() => router.push('/send-to-my-account')}
        />
        <View style={styles.hairline} />
        <Fact
          Icon={CalendarDays}
          label="Next payday"
          value={payday.nextDate ? dayMonth(payday.nextDate) : 'When income arrives'}
          detail={payday.nextDate ? undefined : 'Your income varies, so there is no set date.'}
        />
      </View>

      <View style={styles.links}>
        <Button label="Open plan" variant="secondary" onPress={() => router.navigate('/plan-builder')} />
        <Button label="Income history" variant="secondary" onPress={() => router.navigate('/income-history')} />
      </View>

      <Button
        label="Emergency pause"
        variant="critical"
        accessibilityHint="Stops all automation. You will need your PIN."
        onPress={() => router.push('/emergency-pause')}
      />
    </ScrollView>
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
  content: { paddingHorizontal: space[5], gap: space[4] },
  demo: { ...type.label, color: colors.inkMuted, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[3], ...shadow.card },
  fact: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: size.touchMin },
  iconCircle: {
    width: size.iconCircle,
    height: size.iconCircle,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
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
