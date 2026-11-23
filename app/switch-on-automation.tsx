// S14 Switch on automation: final plan check, review window length (D2) and
// the price (I1: free during the pilot). "Switch on" goes to S15 Home.
// D2: the window is 5, 15 or 60 minutes (default 15). Switching it off is only
// offered after 3 successful automated paydays, so it isn't offered here.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeCheck } from 'lucide-react-native';
import { Button, CostEstimate, FieldError, OptionList, Screen } from '../src/components';
import { feeSchedule } from '../src/data/feeSchedule';
import { pricing } from '../src/data/pricing';
import { costTips, monthlyCost } from '../src/engine/monthlyCost';
import { checkPlan } from '../src/engine/planChecks';
import { goLiveRoute, useApp, type ReviewWindowMinutes } from '../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../src/theme/tokens';

const windows = [
  { value: '5', label: '5 minutes' },
  { value: '15', label: '15 minutes', description: 'Recommended' },
  { value: '60', label: '60 minutes' },
] as const;

export default function SwitchOnAutomationScreen() {
  const router = useRouter();
  const state = useApp();
  const { plan, income, fallback, automation, switchOnAutomation } = state;
  const [minutes, setMinutes] = useState<'5' | '15' | '60'>(String(automation.reviewWindowMinutes) as '5' | '15' | '60');

  const expected = income?.expectedKobo ?? 0;
  const check = checkPlan(plan, expected, feeSchedule);
  const errors = [...check.errors];
  if (plan.rules.length === 0) errors.push('Add at least one rule to your plan.');
  if (!fallback) errors.push('Add a fallback account before you switch on automation.');
  const notReady = goLiveRoute(state) !== '/switch-on-automation';
  if (notReady) errors.push('Finish the identity check first.');

  const cost = income
    ? monthlyCost({ plan, expectedKobo: expected, frequency: income.frequency, schedule: feeSchedule, pricing })
    : null;

  const switchOn = () => {
    switchOnAutomation(Number(minutes) as ReviewWindowMinutes, Date.now());
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/home');
  };

  return (
    <Screen
      title="Switch on automation"
      subtitle="Your next payday will be split by your plan."
      footer={
        <>
          <Button label="Switch on" variant="primary" disabled={errors.length > 0} onPress={switchOn} />
          {errors.length > 0 ? <Text style={styles.muted}>Fix the problems above to switch on.</Text> : null}
        </>
      }
    >
      <View style={styles.section}>
        <Text style={styles.heading}>Plan check</Text>
        {errors.length === 0 ? (
          <View style={styles.okRow} accessible accessibilityLabel={`Plan check passed. ${plan.rules.length} rules ready.`}>
            <BadgeCheck size={size.icon} color={colors.success} strokeWidth={1.75} />
            <Text style={styles.okText}>Your plan is ready: {plan.rules.length} rules, leftover to {plan.remainder?.name}.</Text>
          </View>
        ) : (
          <>
            {errors.map((e) => (
              <FieldError key={e} message={e} />
            ))}
            <Button label="Open plan" variant="quiet" onPress={() => router.navigate('/plan-builder')} />
          </>
        )}
        {check.warnings.map((w) => (
          <Text key={w} style={styles.muted}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Review window</Text>
        <Text style={styles.muted}>
          When income arrives, you get this long to execute, pause or cancel before money goes out.
        </Text>
        <OptionList accessibilityLabel="Review window" options={windows} value={minutes} onChange={setMinutes} />
      </View>

      <View style={[styles.section, styles.card]}>
        <Text style={styles.heading}>Price</Text>
        <Text style={styles.price}>{pricing.name}</Text>
        <Text style={styles.muted}>No payment needed. Bank fees still apply to each payday.</Text>
        {cost ? <CostEstimate text={cost.text} overLimit={cost.overLimit} tips={costTips(feeSchedule)} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space[2] },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], ...shadow.card },
  heading: { ...type.titleSm, color: colors.ink },
  price: { ...type.headline, color: colors.ink },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  okText: { ...type.body, color: colors.ink, flex: 1 },
  muted: { ...type.label, color: colors.inkMuted },
});
