// S6 Plan builder (B1, B2, B6, B8-B12): categories with switches, rules in
// priority order (drag to reorder), plan summary bar, monthly cost estimate (C6), plan checks.
// Goes to S7 (rule editor), S9 (remainder and fallback), S10 (simulator) and
// the going-live flow (S11, which leads to S14).
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { RotateCcw, TriangleExclamationPoint, Wallet } from 'lucide-react-native';
import { ActivityList, Button, CostEstimate, FieldError, RuleCard, Toggle, categoryIcon } from '../../src/components';
import { floatingNavInset } from '../../src/components/FloatingNav';
import { defaultCategories } from '../../src/data/categories';
import { feeSchedule } from '../../src/data/feeSchedule';
import { pricing } from '../../src/data/pricing';
import { formatNaira, maskAccount } from '../../src/engine/format';
import { costTips, monthlyCost } from '../../src/engine/monthlyCost';
import { shareDown } from '../../src/engine/money';
import { checkPlan } from '../../src/engine/planChecks';
import { splitIncome } from '../../src/engine/split';
import type { Rule } from '../../src/engine/types';
import { percentText, RULE_LIMITS } from '../../src/engine/validate';
import { useNow } from '../../src/payday/PaydayRunner';
import { goLiveRoute, isLive, useApp } from '../../src/state/appStore';
import { cooldownText } from '../../src/state/sensitiveChanges';
import { colors, radius, shadow, size, space, type } from '../../src/theme/tokens';

export default function PlanBuilderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const plan = useApp((s) => s.plan);
  const income = useApp((s) => s.income);
  const fallback = useApp((s) => s.fallback);
  const reorderRules = useApp((s) => s.reorderRules);
  const moveRule = useApp((s) => s.moveRule);
  const deleteRule = useApp((s) => s.deleteRule);
  const requestChange = useApp((s) => s.requestChange);
  const live = useApp((s) => isLive(s));
  const t = useNow();

  const expected = income?.expectedKobo ?? 0;
  const check = checkPlan(plan, expected, feeSchedule);
  const errors = [...check.errors];
  if (!fallback) errors.push('Add a fallback account before you switch on automation.');
  // The split at the expected amount, for the summary bar. None while the plan has errors.
  let atExpected: ReturnType<typeof splitIncome> | null = null;
  try {
    atExpected = splitIncome({ incomeKobo: expected, expectedKobo: expected, plan, schedule: feeSchedule });
  } catch {
    atExpected = null;
  }

  // C6: monthly cost at the expected amount and pay frequency. Recalculated on every change.
  const cost = income
    ? monthlyCost({ plan, expectedKobo: expected, frequency: income.frequency, schedule: feeSchedule, pricing })
    : null;

  const ruleAmount = (r: Rule) => (r.kind === 'fixed' ? r.amountKobo : shareDown(expected, r.basisPoints));

  const switchOff = (rules: Rule[], label: string) => {
    Alert.alert(`Switch off ${label}?`, 'This takes it out of your plan. Changes apply from your next payday.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Switch off',
        style: 'destructive',
        onPress: () => {
          // F2: once live, taking rules out needs a one-time code.
          if (live) {
            requestChange({ kind: 'deleteRules', ruleIds: rules.map((r) => r.id) });
            router.push('/verify-change');
          } else rules.forEach((r) => deleteRule(r.id));
        },
      },
    ]);
  };

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + space[4] }]}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Your plan
        </Text>
        <Text style={styles.subtitle}>Changes apply from your next payday.</Text>
      </View>
      <SummaryBar expectedKobo={expected} split={atExpected} />
      {cost && plan.rules.length > 0 ? (
        <CostEstimate text={cost.text} overLimit={cost.overLimit} tips={costTips(feeSchedule)} />
      ) : null}
      {errors.map((e) => (
        <FieldError key={e} message={e} />
      ))}
      {check.warnings.map((w) => (
        <View key={w} style={styles.warning} accessibilityRole="alert">
          <TriangleExclamationPoint size={size.icon} color={colors.warning} strokeWidth={1.75} />
          <Text style={styles.warningText}>{w}</Text>
        </View>
      ))}
      {plan.rules.length > 0 ? (
        <View style={styles.sectionHead}>
          <Text style={styles.section}>Priority order</Text>
          <Text style={styles.muted}>Hold a rule and drag it to change the order.</Text>
        </View>
      ) : null}
    </View>
  );

  const customRules = plan.rules.filter((r) => !r.categoryKey || r.categoryKey === 'custom');

  const footer = (
    <View style={[styles.footer, { paddingBottom: floatingNavInset(insets.bottom) }]}>
      <ActivityList
        title="Leftover money"
        items={[
          {
            id: 'remainder',
            Icon: Wallet,
            name: plan.remainder?.name ?? 'Choose where leftover money goes',
            meta: plan.remainder?.destination
              ? `${plan.remainder.destination.bankName} ${maskAccount(plan.remainder.destination.accountNumber)}`
              : 'Not set',
            onPress: () => router.push('/remainder-fallback'),
          },
          {
            id: 'fallback',
            Icon: RotateCcw,
            name: 'Fallback account',
            meta: fallback ? `${fallback.bankName} ${maskAccount(fallback.accountNumber)}` : 'Not set',
            onPress: () => router.push('/remainder-fallback'),
          },
        ]}
      />

      <View style={styles.card}>
        <Text style={styles.section}>Categories</Text>
        <Text style={styles.muted}>Switch one on to set its rule.</Text>
        {defaultCategories.map((c) => {
          const rules = plan.rules.filter((r) => r.categoryKey === c.key);
          return (
            <Toggle
              key={c.key}
              label={c.name}
              value={rules.length > 0}
              onValueChange={(on) => (on ? router.push(`/rule-editor?category=${c.key}`) : switchOff(rules, c.name))}
            />
          );
        })}
        {customRules.map((r) => (
          <Toggle key={r.id} label={r.name} value onValueChange={(on) => !on && switchOff([r], r.name)} />
        ))}
      </View>

      <Button
        label="Add category"
        variant="secondary"
        disabled={plan.rules.length >= RULE_LIMITS.maxRules}
        onPress={() => router.push('/rule-editor?custom=1')}
      />
      {plan.rules.length >= RULE_LIMITS.maxRules ? (
        <Text style={styles.muted}>A plan can hold up to {RULE_LIMITS.maxRules} rules.</Text>
      ) : null}
      <Button label="Run simulator" variant="secondary" disabled={plan.rules.length === 0} onPress={() => router.push('/payday-simulator')} />
      <Button
        label="Switch on automation"
        variant="secondary"
        disabled={errors.length > 0 || plan.rules.length === 0}
        onPress={() => router.push(goLiveRoute(useApp.getState()))}
      />
      {errors.length > 0 ? <Text style={styles.muted}>Fix the problems at the top of the plan to switch on.</Text> : null}
    </View>
  );

  return (
    <DraggableFlatList
      data={plan.rules}
      keyExtractor={(r) => r.id}
      onDragEnd={({ data }) => reorderRules(data.map((r) => r.id))}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      containerStyle={styles.page}
      contentContainerStyle={styles.content}
      renderItem={({ item, drag, isActive, getIndex }: RenderItemParams<Rule>) => (
        <View style={styles.item}>
          <RuleCard
            name={item.name}
            Icon={categoryIcon(item.categoryKey)}
            ruleType={item.kind === 'fixed' ? 'Fixed' : `${percentText(item.basisPoints)} of income`}
            priority={(getIndex() ?? 0) + 1}
            bankName={item.destination?.bankName}
            accountNumber={item.destination?.accountNumber}
            amountKobo={ruleAmount(item)}
            note={[item.skipNextPayday ? 'Skipping next payday' : null, cooldownText(item, t)].filter(Boolean).join(' · ') || undefined}
            showDragHandle
            onDrag={drag}
            onMove={(delta) => moveRule(item.id, delta)}
            active={isActive}
            onPress={() => router.push(`/rule-editor?ruleId=${item.id}`)}
          />
        </View>
      )}
    />
  );
}

/** B11: how much of the expected amount is committed, and what is left. */
function SummaryBar({ expectedKobo, split }: { expectedKobo: number; split: ReturnType<typeof splitIncome> | null }) {
  if (!split || expectedKobo === 0) return null;
  const committed = split.lines.reduce((s, l) => s + l.amountKobo, 0);
  const pct = Math.min(100, Math.floor((committed * 100) / expectedKobo));
  const left = split.remainder?.amountKobo ?? 0;
  const text = `${formatNaira(committed)} committed (${pct}% of ${formatNaira(expectedKobo)})`;
  const leftText = `${formatNaira(left)} left${split.remainder ? ` for ${split.remainder.name}` : ''} after ${formatNaira(split.totalFeesKobo)} fees`;
  return (
    <View style={styles.card} accessible accessibilityLabel={`${text}. ${leftText}.`}>
      <Text style={styles.summary}>{text}</Text>
      <View style={styles.track} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.muted}>{leftText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: space[5] },
  header: { gap: space[4], paddingBottom: space[3] },
  head: { gap: space[1] },
  title: { ...type.title, color: colors.ink },
  subtitle: { ...type.body, color: colors.inkMuted },
  sectionHead: { gap: space[1], marginTop: space[2] },
  section: { ...type.titleSm, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
  item: { paddingBottom: space[3] },
  footer: { gap: space[3], paddingTop: space[3] },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[2], ...shadow.card },
  summary: { ...type.headline, color: colors.ink },
  track: { height: space[2], borderRadius: radius.pill, backgroundColor: colors.surfaceSunken, overflow: 'hidden' },
  fill: { height: space[2], backgroundColor: colors.primary },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
  warningText: { ...type.label, color: colors.warning, flex: 1 },
});
