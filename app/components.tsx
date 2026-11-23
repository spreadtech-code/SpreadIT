// Hidden "Components" screen (stage 1b): every component from
// docs/design-system.md in its states, to check on a phone.
// Open it by holding the "Settings" title on the Profile tab for 1 second.
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calculator, Church, Heart, House, PiggyBank, Plus, Send, Settings, ShieldCheck, TrendingUp } from 'lucide-react-native';
import {
  ActivityList,
  AmountField,
  BalanceHero,
  Button,
  InsightCard,
  RuleCard,
  SegmentedControl,
  StatusBadge,
  badgeStates,
  type BadgeState,
} from '../src/components';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';
import { tundeIncomeKobo } from '../src/components/demoData';

const noop = () => {};
const heroActions = [
  { label: 'Simulate', Icon: Calculator, onPress: noop },
  { label: 'Send extra', Icon: Send, onPress: noop },
  { label: 'Add rule', Icon: Plus, onPress: noop },
];

export default function ComponentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ruleType, setRuleType] = useState<'fixed' | 'percent'>('fixed');
  const [amount, setAmount] = useState<number | null>(2_500_000);
  const [stampAmount, setStampAmount] = useState<number | null>(1_050_000);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space[4], paddingBottom: insets.bottom + space[8] },
      ]}
    >
      <Button label="Back" variant="quiet" onPress={() => router.back()} />
      <Text style={styles.title} accessibilityRole="header">
        Components
      </Text>
      <Text style={styles.note}>Hidden check screen. Example numbers only.</Text>

      <Section title="BalanceHero, automation on">
        <BalanceHero
          initials="TA"
          label="Last payday · 25 November"
          amountKobo={35_662_500}
          actions={heroActions}
          automation={{ paused: false, text: 'Automation on · next payday in 30 days' }}
        />
      </Section>
      <Section title="BalanceHero, paused">
        <BalanceHero
          initials="TA"
          label="Last payday · 25 November"
          amountKobo={100_020}
          actions={heroActions}
          automation={{ paused: true }}
        />
      </Section>

      <Section title="InsightCard">
        <InsightCard title="Mum was paid on payday" text="Mum received ₦80,000 on 25 November, 3 months in a row." />
      </Section>

      <Section title="Button">
        <View style={styles.stack}>
          <Button label="Execute now" variant="primary" onPress={noop} />
          <Button label="Pause for review" variant="secondary" onPress={noop} />
          <Button label="Edit plan" variant="quiet" onPress={noop} />
          <Button label="Emergency pause" variant="critical" onPress={noop} />
          <Button label="Emergency cancel" variant="quietCritical" onPress={noop} />
          <Button label="Switch on automation" variant="secondary" disabled onPress={noop} />
          <Text style={styles.note}>The last button is disabled: add a remainder destination first.</Text>
        </View>
      </Section>

      <Section title="StatusBadge, all 11 states">
        <View style={styles.badges}>
          {(Object.keys(badgeStates) as BadgeState[]).map((s) => (
            <StatusBadge key={s} state={s} />
          ))}
        </View>
      </Section>

      <Section title="SegmentedControl">
        <SegmentedControl
          accessibilityLabel="Rule type"
          options={[
            { value: 'fixed', label: 'Fixed amount' },
            { value: 'percent', label: '% of income' },
          ]}
          value={ruleType}
          onChange={setRuleType}
        />
      </Section>

      <Section title="AmountField">
        <View style={styles.stack}>
          <AmountField label="Amount" valueKobo={amount} onChangeKobo={setAmount} helper="Costs ₦75 to send" />
          <AmountField
            label="Amount (stamp-duty hint)"
            valueKobo={stampAmount}
            onChangeKobo={setStampAmount}
            helper="Costs ₦75 to send"
            warning="Send ₦501 less to save ₦50 stamp duty"
          />
          <Text style={styles.note}>Helper and hint text are fixed examples until the fee schedule exists (stage 2).</Text>
        </View>
      </Section>

      <Section title="RuleCard, plan builder">
        <View style={styles.rules}>
          <RuleCard name="Mum" Icon={Heart} ruleType="Fixed" priority={1} bankName="GTBank" accountNumber="0123454821" amountKobo={8_000_000} showDragHandle onPress={noop} />
          <RuleCard name="Rent reserve" Icon={House} ruleType="Fixed" priority={2} bankName="Access" accountNumber="0987651190" amountKobo={15_000_000} showDragHandle onPress={noop} />
        </View>
      </Section>
      <Section title="RuleCard, simulator">
        <View style={styles.rules}>
          <RuleCard name="Tithe" Icon={Church} ruleType="10% of income" priority={3} bankName="Zenith" accountNumber="2210337765" amountKobo={8_500_000} funding="Fully funded" />
          <RuleCard name="Savings" Icon={PiggyBank} ruleType="15% of income" priority={4} bankName="Kuda" accountNumber="2004118832" amountKobo={4_000_000} funding="Partly funded" />
          <RuleCard name="Investment" Icon={TrendingUp} ruleType="Fixed" priority={5} bankName="Opay" accountNumber="8061234410" amountKobo={5_000_000} funding="Skipped" />
        </View>
      </Section>

      <Section title="ActivityList">
        <ActivityList
          title="Activity"
          items={[
            { id: '1', direction: 'in', name: 'Salary', meta: '25 Nov · 9:02am', amountKobo: tundeIncomeKobo },
            { id: '2', direction: 'out', name: 'Mum', meta: 'GTBank ••4821 · 9:17am', amountKobo: 8_000_000, status: 'Successful' },
            { id: '3', direction: 'out', name: 'Rent reserve', meta: 'Access ••1190 · 9:17am', amountKobo: 15_000_000, status: 'Processing' },
            { id: '4', direction: 'out', name: 'Tithe', meta: 'Zenith ••7765 · 9:17am', amountKobo: 8_500_000, status: 'Retrying' },
            { id: '5', direction: 'out', name: 'Savings', meta: 'Kuda ••8832 · 9:17am', amountKobo: 12_750_000, status: 'Failed' },
          ]}
        />
      </Section>
      <Section title="ActivityList, settings rows">
        <ActivityList
          title="Settings"
          items={[
            { id: 's1', Icon: ShieldCheck, name: 'Security', meta: 'PIN, biometric, devices', onPress: noop },
            { id: 's2', Icon: Settings, name: 'Review window', meta: '15 minutes', onPress: noop },
          ]}
        />
      </Section>

      <Section title="PaydayCountdown">
        <Button label="Open full-screen preview" variant="secondary" onPress={() => router.push('/components-payday')} />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: space[5], gap: space[6] },
  title: { ...type.title, color: colors.ink },
  note: { ...type.label, color: colors.inkMuted },
  section: { gap: space[3] },
  sectionTitle: { ...type.headline, color: colors.inkMuted },
  stack: {
    gap: space[2],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[5],
    ...shadow.card,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[5],
    ...shadow.card,
  },
  rules: { gap: space[3] },
});
