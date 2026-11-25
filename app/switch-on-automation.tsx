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
import { colors, radius, size, space, type } from '../src/theme/tokens';

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
  if (!fallback) errors.push('Add a backup account before you turn on Autopilot.');
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
      title="Turn on Autopilot"
      subtitle="From your next payday, SpreadIT splits it for you."
      footer={
        <>
          <Button
            label="Turn on Autopilot"
            variant="primary"
            disabled={errors.length > 0}
            accessibilityHint={errors.length > 0 ? 'Fix the problems above first.' : undefined}
            onPress={switchOn}
          />
          {errors.length > 0 ? <Text style={styles.muted}>Fix the problems above to turn it on.</Text> : null}
        </>
      }
    >
      <View style={styles.section}>
        {errors.length === 0 ? (
          <View style={styles.ready} accessible accessibilityLabel={`Plan ready. ${plan.rules.length} rules, leftovers to ${plan.remainder?.name}.`}>
            <View style={styles.okRow}>
              <BadgeCheck size={size.iconSm} color={colors.success} strokeWidth={1.75} />
              <Text style={styles.okWord}>Plan ready</Text>
            </View>
            <Text style={styles.okText}>
              {plan.rules.length} rules · leftovers to {plan.remainder?.name}
            </Text>
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
        <Text style={styles.heading}>Time to check each payday</Text>
        <Text style={styles.muted}>You can send early, hold or stop before anything moves.</Text>
        <OptionList accessibilityLabel="Time to check each payday" options={windows} value={minutes} onChange={setMinutes} />
      </View>

      <View style={[styles.section, styles.card]}>
        <Text style={styles.price}>{pricing.name}</Text>
        <Text style={styles.muted}>No payment needed. Bank fees still apply to each payday.</Text>
        {cost ? <CostEstimate text={cost.text} overLimit={cost.overLimit} tips={costTips(feeSchedule)} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space[2] },
  card: { backgroundColor: colors.surfaceSunken, borderRadius: radius.lg, padding: space[4] },
  ready: { backgroundColor: colors.brandSoft, borderRadius: radius.lg, padding: space[4], gap: space[2] },
  heading: { ...type.headline, color: colors.ink },
  price: { ...type.headline, color: colors.ink },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  okWord: { ...type.labelStrong, color: colors.success },
  okText: { ...type.bodyStrong, color: colors.onBrand },
  muted: { ...type.label, color: colors.inkMuted },
});
