// S26 Forward mode setup (A9): the user keeps being paid at their current bank
// and, on payday, sends the salary to their SpreadIT account in one transfer.
// - Reminders on the expected pay date: 9am with the account details and Copy,
//   6pm if no qualifying payment has arrived, none after (A9). The times are
//   fixed; users can't change them (founder decision, 24 Nov 2026).
// - Standing-order steps for the user's bank (10 largest Nigerian banks).
// "Use Forward mode" -> S14 when going live (flow 4), otherwise back.
// Also opened from the payday reminders and from Settings.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Clock } from 'lucide-react-native';
import { Button, OptionList, Screen } from '../src/components';
import { partner } from '../src/data/partner';
import { standingOrderBanks, standingOrderSteps } from '../src/data/standingOrders';
import { useBank } from '../src/fakebank/bankStore';
import { dayMonth, payDates } from '../src/lib/payDates';
import { ForwardDetails } from '../src/payday/oneOffParts';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../src/theme/tokens';

export default function ForwardModeSetupScreen() {
  const router = useRouter();
  const income = useApp((s) => s.income);
  const account = useApp((s) => s.spreaditAccount);
  const automationOn = useApp((s) => s.automation.on);
  const saveIncome = useApp((s) => s.saveIncome);
  const offset = useBank((s) => s.clockOffsetMs);
  const [bank, setBank] = useState<string | null>(null);

  const next = income ? payDates(income, new Date(Date.now() + offset)).next : null;
  const inForwardMode = income?.arrival === 'forward';

  const use = () => {
    if (income && !inForwardMode) saveIncome({ ...income, arrival: 'forward' });
    if (!automationOn) router.push('/switch-on-automation');
    else router.back();
  };

  return (
    <Screen
      title="Forward your pay"
      subtitle="Keep getting paid at your bank. On payday, send it here in one transfer. We’ll do the rest."
      footer={
        <>
          <Button label={inForwardMode ? (automationOn ? 'Done' : 'Continue') : 'Use Forward mode'} variant="primary" onPress={use} />
          {inForwardMode ? null : <Button label="Not now" variant="quiet" onPress={() => router.back()} />}
        </>
      }
    >
      <View style={styles.card}>
        <Text style={styles.heading}>Payday nudges</Text>
        <Nudge Icon={Bell} title="9am on payday" text="A reminder with your account details, ready to copy." />
        <Nudge Icon={Clock} title="6pm" text="One more, only if it hasn’t arrived yet." />
        <Text style={styles.muted}>
          {next ? `Your next payday: ${dayMonth(next)}.` : 'Your pay varies, so there’s no set payday to remind you on.'}
        </Text>
      </View>

      {account ? (
        <ForwardDetails text="Send your pay to:" />
      ) : (
        <Text style={styles.body}>Your SpreadIT account details show here once your identity check passes.</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.heading}>Or make it automatic</Text>
        <Text style={styles.muted}>Set a standing order at your bank. Pick yours for the steps.</Text>
        <OptionList accessibilityLabel="Your bank" options={standingOrderBanks.map((b) => ({ value: b, label: b }))} value={bank} onChange={setBank} />
        {bank && account ? (
          <View style={styles.steps} accessible accessibilityLabel={`Steps for ${bank}`}>
            {standingOrderSteps(bank, account).map((step, i) => (
              <Text key={step} style={styles.body}>
                {i + 1}. {step}
              </Text>
            ))}
            <Text style={styles.muted}>General steps. Exact steps for each bank will come from {partner.name}.</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function Nudge({ Icon, title, text }: { Icon: typeof Bell; title: string; text: string }) {
  return (
    <View style={styles.nudge} accessible accessibilityLabel={`${title}. ${text}`}>
      <View style={styles.bubble}>
        <Icon size={size.iconSm} color={colors.primary} strokeWidth={1.75} />
      </View>
      <View style={styles.nudgeText}>
        <Text style={styles.bodyStrong}>{title}</Text>
        <Text style={styles.muted}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[4], gap: space[3], ...shadow.card },
  heading: { ...type.headline, color: colors.ink },
  bodyStrong: { ...type.bodyStrong, color: colors.ink },
  nudge: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  nudgeText: { flex: 1, gap: 2 },
  bubble: {
    width: size.bubbleSm,
    height: size.bubbleSm,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
  steps: { gap: space[2] },
});
