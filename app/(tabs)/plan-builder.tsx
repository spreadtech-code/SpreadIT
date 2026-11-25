// S6 Plan builder (B1, B2, B6, B8-B12), v4 layout (Figma "S6 Plan"): categories with switches, rules in
// priority order (drag to reorder), plan summary bar, monthly cost estimate (C6), plan checks.
// Goes to S7 (rule editor), S9 (remainder and fallback), S10 (simulator) and
// the going-live flow (S11, which leads to S14).
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { Calculator, Plus } from 'lucide-react-native';
import { AccountCard, Button, CostEstimate, Notice, RuleCard, Toggle, categoryIcon } from '../../src/components';
import { floatingNavInset } from '../../src/components/FloatingNav';
import { defaultCategories } from '../../src/data/categories';
import { feeSchedule } from '../../src/data/feeSchedule';
import { pricing } from '../../src/data/pricing';
import { formatNaira } from '../../src/engine/format';
import { costTips, monthlyCost } from '../../src/engine/monthlyCost';
import { shareDown } from '../../src/engine/money';
import { checkPlan } from '../../src/engine/planChecks';
import { splitIncome } from '../../src/engine/split';
import type { Rule } from '../../src/engine/types';
import { percentText, RULE_LIMITS } from '../../src/engine/validate';
import { useNow } from '../../src/payday/PaydayRunner';
import { goLiveRoute, isLive, useApp } from '../../src/state/appStore';
import { cooldownText } from '../../src/state/sensitiveChanges';
import { colors, layout, radius, shadow, space, type } from '../../src/theme/tokens';

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
  const automationOn = useApp((s) => s.automation.on);
  const t = useNow();

  const expected = income?.expectedKobo ?? 0;
  const check = checkPlan(plan, expected, feeSchedule);
  const errors = [...check.errors];
  if (!fallback) errors.push('Add a backup account before you turn on Autopilot.');
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
    Alert.alert(`Turn off ${label}?`, 'This takes it out of your plan. Changes start from your next payday.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Turn off',
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
        <Text style={styles.subtitle}>Changes start from your next payday.</Text>
      </View>
      <SummaryBar expectedKobo={expected} split={atExpected} />
      {cost && plan.rules.length > 0 ? (
        <CostEstimate text={cost.text} overLimit={cost.overLimit} tips={costTips(feeSchedule)} />
      ) : null}
      {errors.map((e) => (
        <Notice key={e} tone="critical" text={e} />
      ))}
      {check.warnings.map((w) => (
        <Notice key={w} tone="warning" text={w} />
      ))}
      {plan.rules.length > 0 ? (
        <View style={styles.sectionHead}>
          <Text style={styles.section} accessibilityRole="header">
            Priority order
          </Text>
          <Text style={styles.muted}>Hold a rule and drag to reorder. Top gets paid first.</Text>
        </View>
      ) : null}
    </View>
  );

  const customRules = plan.rules.filter((r) => !r.categoryKey || r.categoryKey === 'custom');

  const footer = (
    <View style={[styles.footer, { paddingBottom: floatingNavInset(insets.bottom) }]}>
      <Text style={styles.section} accessibilityRole="header">
        Leftovers & backup
      </Text>
      {plan.remainder?.destination ? (
        <AccountCard
          accountName={plan.remainder.name}
          bankName={plan.remainder.destination.bankName}
          accountNumber={plan.remainder.destination.accountNumber}
          tag="Spare money"
          onChange={() => router.push('/remainder-fallback')}
        />
      ) : (
        <Button label="Choose where leftovers go" variant="secondary" onPress={() => router.push('/remainder-fallback')} />
      )}
      {fallback ? (
        <AccountCard
          accountName="Backup account"
          bankName={fallback.bankName}
          accountNumber={fallback.accountNumber}
          tag="If a transfer fails"
          onChange={() => router.push('/remainder-fallback')}
        />
      ) : (
        <Button label="Add a backup account" variant="secondary" onPress={() => router.push('/remainder-fallback')} />
      )}

      <View style={styles.card}>
        <Text style={styles.section}>Categories</Text>
        <Text style={styles.muted}>Turn one on to set it up.</Text>
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
        label="Add a category"
        icon={Plus}
        variant="secondary"
        disabled={plan.rules.length >= RULE_LIMITS.maxRules}
        onPress={() => router.push('/rule-editor?custom=1')}
      />
      {plan.rules.length >= RULE_LIMITS.maxRules ? (
        <Text style={styles.muted}>A plan can hold up to {RULE_LIMITS.maxRules} rules.</Text>
      ) : null}
      <Button
        label="Simulate a payday"
        icon={Calculator}
        variant="primary"
        disabled={plan.rules.length === 0}
        accessibilityHint={plan.rules.length === 0 ? 'Add a rule first.' : undefined}
        onPress={() => router.push('/payday-simulator')}
      />
      {!automationOn ? (
        <Button
          label="Turn on Autopilot"
          variant="secondary"
          disabled={errors.length > 0 || plan.rules.length === 0}
          accessibilityHint={errors.length > 0 ? 'Fix the problems at the top of the plan first.' : undefined}
          onPress={() => router.push(goLiveRoute(useApp.getState()))}
        />
      ) : null}
      {!automationOn && errors.length > 0 ? <Text style={styles.muted}>Fix the problems at the top of the plan to turn it on.</Text> : null}
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
            ruleType={item.kind === 'fixed' ? 'Fixed' : `${percentText(item.basisPoints)} of pay`}
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
  const leftText = `${formatNaira(left)} left${split.remainder ? ` for ${split.remainder.name.toLowerCase()}` : ''} · ${formatNaira(split.totalFeesKobo)} bank fees`;
  return (
    <View style={styles.card} accessible accessibilityLabel={`${formatNaira(committed)} planned of ${formatNaira(expectedKobo)}, ${pct}%. ${leftText}.`}>
      <Text style={styles.summaryRow}>
        <Text style={styles.summary}>{formatNaira(committed)}</Text>
        <Text style={styles.muted}> planned of {formatNaira(expectedKobo)}</Text>
      </Text>
      <View style={styles.track} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.muted}>{leftText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.screenPadding },
  header: { gap: space[4], paddingBottom: space[3] },
  head: { gap: space[1] },
  title: { ...type.title, color: colors.ink },
  subtitle: { ...type.body, color: colors.inkMuted },
  sectionHead: { gap: space[1], marginTop: space[2] },
  section: { ...type.headline, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
  item: { paddingBottom: space[3] },
  footer: { gap: space[3], paddingTop: space[3] },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[4], gap: space[2], ...shadow.card },
  summaryRow: { ...type.body },
  summary: { ...type.amountLg, color: colors.ink },
  track: { height: space[2], borderRadius: radius.pill, backgroundColor: colors.surfaceSunken, overflow: 'hidden' },
  fill: { height: space[2], backgroundColor: colors.primary },
});
