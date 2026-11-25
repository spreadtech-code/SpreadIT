// Hidden "Components" screen (stage 1b): every component from
// docs/design-system.md in its states, to check on a phone.
// Open it by holding the "Profile" title on the Profile tab for 1 second.
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bot, Calculator, Church, CirclePause, Clock, Heart, House, Landmark, LogOut, PiggyBank, Plus, Send, Settings, ShieldCheck, TrendingUp } from 'lucide-react-native';
import {
  AccountCard,
  ActivityList,
  AmountField,
  Chip,
  InfoRow,
  Notice,
  SectionHeader,
  SettingsGroup,
  SettingsRow,
  SplitDonut,
  SplitLegend,
  feeColour,
  leftoverColour,
  CostEstimate,
  Slider,
  BalanceHero,
  Button,
  InsightCard,
  OptionList,
  PinField,
  RuleCard,
  SegmentedControl,
  StatusBadge,
  TextField,
  Toggle,
  badgeStates,
  type BadgeState,
} from '../src/components';
import { useApp } from '../src/state/appStore';
import { resetBank } from '../src/fakebank/bankStore';
import { resetPaydays } from '../src/payday/paydayStore';
import { colors, layout, radius, shadow, space, type } from '../src/theme/tokens';
import { tundeIncomeKobo } from '../src/components/demoData';
import { feeSchedule } from '../src/data/feeSchedule';
import { transferCostText } from '../src/engine/fees';
import { stampDutyHint } from '../src/engine/planChecks';
import { costTips } from '../src/engine/monthlyCost';

const noop = () => {};
const heroActions = [
  { label: 'Simulate', Icon: Calculator, onPress: noop },
  { label: 'Send extra', Icon: Send, onPress: noop },
  { label: 'Add a rule', Icon: Plus, onPress: noop },
];
const tundeSlices = [
  { id: 'mum', name: 'Mum', amountKobo: 8_000_000 },
  { id: 'rent', name: 'Rent', amountKobo: 15_000_000 },
  { id: 'tithe', name: 'Tithe', amountKobo: 8_500_000 },
  { id: 'savings', name: 'Savings', amountKobo: 12_750_000 },
  { id: 'invest', name: 'Investment', amountKobo: 5_000_000 },
  { id: 'left', name: 'Leftovers', amountKobo: 35_662_500, colour: leftoverColour },
  { id: 'fees', name: 'Bank fees', amountKobo: 87_500, colour: feeColour },
];

export default function ComponentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ruleType, setRuleType] = useState<'fixed' | 'percent'>('fixed');
  const [amount, setAmount] = useState<number | null>(2_500_000);
  const [stampAmount, setStampAmount] = useState<number | null>(1_050_000);
  const [text, setText] = useState('');
  const [pin, setPin] = useState('');
  const [toggle, setToggle] = useState(true);
  const [option, setOption] = useState<'monthly' | 'twoWeekly'>('monthly');
  const [pct, setPct] = useState(100);
  const resetDemo = useApp((s) => s.resetDemo);

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

      <Section title="BalanceHero, Autopilot on">
        <BalanceHero
          greeting="Hi, Tunde"
          status="Payday’s done. Everything’s sent."
          label="Last payday · 25 November"
          amountKobo={85_000_000}
          actions={heroActions}
          autopilot={{ state: 'on', text: 'Autopilot on · next payday 25 Dec' }}
          onBellPress={noop}
        />
      </Section>
      <Section title="BalanceHero, paused">
        <BalanceHero
          greeting="Hi, Tunde"
          status="Everything is paused."
          label="Last payday · 25 November"
          amountKobo={100_020}
          actions={heroActions}
          autopilot={{ state: 'paused', text: 'Autopilot paused' }}
        />
      </Section>

      <Section title="SplitDonut and legend">
        <View style={styles.stack}>
          <SectionHeader title="Where it went" action="Details" onPress={noop} />
          <SplitDonut slices={tundeSlices} centre="₦850,000" caption="split 7 ways" />
          <SplitLegend slices={tundeSlices} />
        </View>
      </Section>

      <Section title="Notice">
        <View style={styles.rules}>
          <Notice text="Changes start from your next payday." />
          <Notice tone="warning" text="Stamp duty: ₦50 on transfers of ₦10,000 or more." />
          <Notice tone="critical" text="That PIN didn’t match. Try again." />
        </View>
      </Section>

      <Section title="Chip">
        <View style={styles.chips}>
          <Chip label="₦500k" onPress={noop} />
          <Chip label="₦850k" selected onPress={noop} />
          <Chip label="₦1.2m" onPress={noop} />
        </View>
      </Section>

      <Section title="AccountCard, InfoRow">
        <AccountCard accountName="Folasade Adeyemi" bankName="GTBank" accountNumber="0123454821" onChange={noop} />
        <View style={styles.stack}>
          <InfoRow label="Amount" value="₦80,000" />
          <InfoRow label="Fee" value="₦50" />
          <InfoRow label="Total" value="₦80,050" strong />
        </View>
      </Section>

      <Section title="SettingsGroup and SettingsRow">
        <SettingsGroup title="Autopilot">
          <SettingsRow label="Autopilot" Icon={Bot} value="On" onPress={noop} />
          <SettingsRow label="Review time" Icon={Clock} value="15 min" onPress={noop} />
          <SettingsRow label="Your SpreadIT account" Icon={Landmark} value="••5678" onPress={noop} />
        </SettingsGroup>
        <SettingsGroup>
          <SettingsRow label="Pause everything" Icon={CirclePause} tone="critical" onPress={noop} />
          <SettingsRow label="Log out" Icon={LogOut} tone="critical" onPress={noop} />
        </SettingsGroup>
      </Section>

      <Section title="InsightCard">
        <InsightCard title="Mum was paid on payday" text="Mum received ₦80,000 on 25 November, 3 months in a row." />
      </Section>

      <Section title="Button">
        <View style={styles.stack}>
          <Button label="Send it now" variant="primary" onPress={noop} />
          <Button label="Send extra" icon={Send} variant="accent" onPress={noop} />
          <Button label="Hold for review" variant="secondary" onPress={noop} />
          <Button label="Edit plan" variant="quiet" onPress={noop} />
          <Button label="Pause everything" icon={CirclePause} variant="critical" onPress={noop} />
          <Button label="Stop this payday" variant="quietCritical" onPress={noop} />
          <Button label="Turn on Autopilot" variant="primary" disabled onPress={noop} />
          <Text style={styles.note}>The last button is disabled: add a leftovers account first.</Text>
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
            { value: 'percent', label: '% of pay' },
          ]}
          value={ruleType}
          onChange={setRuleType}
        />
      </Section>

      <Section title="AmountField">
        <View style={styles.stack}>
          <AmountField label="Amount" valueKobo={amount} onChangeKobo={setAmount} {...costProps(amount)} />
          <AmountField
            label="Amount (try ₦10,000 to ₦10,999)"
            valueKobo={stampAmount}
            onChangeKobo={setStampAmount}
            {...costProps(stampAmount)}
          />
          <Text style={styles.note}>Cost and stamp-duty hint come from the fee schedule as you type.</Text>
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
          <RuleCard name="Tithe" Icon={Church} ruleType="10% of pay" priority={3} bankName="Zenith" accountNumber="2210337765" amountKobo={8_500_000} funding="Fully funded" />
          <RuleCard name="Savings" Icon={PiggyBank} ruleType="15% of pay" priority={4} bankName="Kuda" accountNumber="2004118832" amountKobo={4_000_000} funding="Partly funded" />
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
            { id: 's2', Icon: Settings, name: 'Review time', meta: '15 minutes', onPress: noop },
          ]}
        />
      </Section>

      <Section title="TextField, PinField, Toggle, OptionList (stage 3)">
        <View style={styles.stack}>
          <TextField label="Email" value={text} onChangeText={setText} placeholder="name@example.com" helper="Helper text sits here." />
          <TextField label="With an error" value="tunde@" onChangeText={noop} error="Enter an email address, like name@example.com." />
          <PinField label="6-digit PIN" value={pin} onChange={setPin} autoFocus={false} />
          <Toggle label="Keep trying if it fails" description="On is deep teal." value={toggle} onValueChange={setToggle} />
          <Toggle label="Disabled switch" value={false} onValueChange={noop} disabled disabledReason="Shown greyed out with the reason." />
        </View>
        <OptionList
          accessibilityLabel="Pay frequency"
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'twoWeekly', label: 'Every 2 weeks', description: 'Rows can carry a description.' },
          ]}
          value={option}
          onChange={setOption}
        />
      </Section>

      <Section title="Slider, CostEstimate (stage 4)">
        <View style={styles.stack}>
          <Slider
            label="What if you're paid"
            valueText={`${pct}% of expected`}
            value={pct}
            min={10}
            max={150}
            step={10}
            onChange={setPct}
            minText="10%"
            maxText="150%"
          />
          <CostEstimate text="This plan costs about ₦875 a month (0.10% of your pay)" overLimit={false} tips={[]} />
          <CostEstimate text="This plan costs about ₦315 a month (1.58% of your pay)" overLimit tips={costTips(feeSchedule)} />
        </View>
      </Section>

      <Section title="Demo data">
        <Button
          label="Reset demo data"
          variant="critical"
          onPress={() => {
            resetDemo();
            resetPaydays();
            resetBank();
            if (router.canDismiss()) router.dismissAll();
            router.replace('/welcome');
          }}
        />
        <Text style={styles.note}>Deletes the pretend account, plan, paydays and fake bank on this phone and goes back to Welcome.</Text>
      </Section>

      <Section title="Demo controls">
        <Button label="Open Demo controls" variant="secondary" onPress={() => router.push('/demo-controls')} />
        <Text style={styles.note}>Also opens by holding the greeting on Home for 1 second.</Text>
      </Section>

      <Section title="PaydayCountdown">
        <Button label="Open full-screen preview" variant="secondary" onPress={() => router.push('/components-payday')} />
      </Section>
    </ScrollView>
  );
}

/** The AmountField helper and stamp-duty hint, from the fee schedule (B3). */
function costProps(kobo: number | null): { helper: string; warning?: string } {
  if (!kobo) return { helper: 'Enter an amount to see what it costs to send' };
  return {
    helper: transferCostText(kobo, feeSchedule),
    warning: stampDutyHint(kobo, feeSchedule) ?? undefined,
  };
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
  content: { paddingHorizontal: layout.screenPadding, gap: space[6] },
  title: { ...type.title, color: colors.ink },
  note: { ...type.label, color: colors.inkMuted },
  section: { gap: space[3] },
  sectionTitle: { ...type.headline, color: colors.inkMuted },
  stack: {
    gap: space[2],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[4],
    ...shadow.card,
  },
  chips: { flexDirection: 'row', gap: space[2] },
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
