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
import { Button, OptionList, Screen } from '../src/components';
import { partner } from '../src/data/partner';
import { standingOrderBanks, standingOrderSteps } from '../src/data/standingOrders';
import { useBank } from '../src/fakebank/bankStore';
import { dayMonth, payDates } from '../src/lib/payDates';
import { ForwardDetails } from '../src/payday/oneOffParts';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

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
      title="Forward mode"
      subtitle="Keep getting paid at your bank. On payday, send your salary here in one transfer. We split it from there."
      footer={
        <>
          <Button label={inForwardMode ? (automationOn ? 'Done' : 'Continue') : 'Use Forward mode'} variant="primary" onPress={use} />
          {inForwardMode ? null : <Button label="Not now" variant="quiet" onPress={() => router.back()} />}
        </>
      }
    >
      <View style={styles.card}>
        <Text style={styles.heading}>Payday reminders</Text>
        <Text style={styles.body}>• 9am on payday: a reminder with your account details, ready to copy.</Text>
        <Text style={styles.body}>• 6pm: one more, only if your salary hasn't arrived.</Text>
        <Text style={styles.muted}>
          {next ? `Your next payday: ${dayMonth(next)}.` : 'Your income varies, so there is no set payday to remind you on.'}
        </Text>
      </View>

      {account ? (
        <ForwardDetails text="Send your salary to:" />
      ) : (
        <Text style={styles.body}>Your SpreadIT account details show here once your identity check passes.</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.heading}>Or set up a standing order</Text>
        <Text style={styles.body}>Your bank can send it for you every payday. Pick your bank to see how.</Text>
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

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[3], ...shadow.card },
  heading: { ...type.titleSm, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
  steps: { gap: space[2] },
});
