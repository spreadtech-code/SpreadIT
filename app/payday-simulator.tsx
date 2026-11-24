// S10 Payday Simulator (C1-C6): split pretend income with the real fee schedule.
// - C1: enter any amount, tap "Run simulation", see every allocation, the fees
//   and the leftover, adding up to exactly the amount entered.
// - C2: no identity check anywhere on this screen.
// - C3: every rule is labelled Fully funded, Partly funded or Skipped, with the
//   naira shortfall when money ran short.
// - C4: fees from src/data/feeSchedule.ts (inflow + transfers + stamp duty).
// - C5: what-if slider from 10% to 150% of the expected amount, in 10% steps.
// - C6: the monthly cost line at the expected amount and pay frequency.
// Flows: S6 -> S10 -> "Edit plan" back to S6; S10 -> S11 to switch on automation.
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Info, TriangleExclamationPoint } from 'lucide-react-native';
import { AmountField, Button, CostEstimate, FieldError, RuleCard, Screen, Slider, categoryIcon } from '../src/components';
import { feeSchedule } from '../src/data/feeSchedule';
import { pricing } from '../src/data/pricing';
import { formatNaira } from '../src/engine/format';
import { costTips, monthlyCost } from '../src/engine/monthlyCost';
import { checkPlan } from '../src/engine/planChecks';
import { splitIncome } from '../src/engine/split';
import type { Rule, SplitResult } from '../src/engine/types';
import { lineNote, ruleTypeText } from '../src/lib/splitText';
import { goLiveRoute, useApp } from '../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../src/theme/tokens';

/** C5: 10% to 150% of the expected amount, in steps of 10%. */
const SLIDER = { min: 10, max: 150, step: 10 } as const;

export default function PaydaySimulatorScreen() {
  const router = useRouter();
  const plan = useApp((s) => s.plan);
  const income = useApp((s) => s.income);
  const fallback = useApp((s) => s.fallback);

  const expected = income?.expectedKobo ?? 0;
  const [amount, setAmount] = useState<number | null>(expected > 0 ? expected : null);
  const [ranKobo, setRanKobo] = useState<number | null>(expected > 0 ? expected : null);
  const [sliderPct, setSliderPct] = useState(100);
  const [error, setError] = useState<string | null>(null);

  // The split for the last amount run. Recomputed on every render, so an edit
  // to the plan shows up as soon as the user comes back from S6.
  let result: SplitResult | null = null;
  let planProblem: string | null = null;
  if (ranKobo != null) {
    try {
      result = splitIncome({ incomeKobo: ranKobo, expectedKobo: expected || ranKobo, plan, schedule: feeSchedule });
    } catch {
      planProblem = 'Your plan has a problem to fix first. Tap "Edit plan" to see it.';
    }
  }

  const cost = income
    ? monthlyCost({ plan, expectedKobo: expected, frequency: income.frequency, schedule: feeSchedule, pricing })
    : null;
  const automationOn = useApp((s) => s.automation.on);
  const canSwitchOn = !automationOn && plan.rules.length > 0 && checkPlan(plan, expected, feeSchedule).canSwitchOn && fallback != null;

  const run = () => {
    Keyboard.dismiss();
    if (!amount || amount <= 0) return setError('Enter an amount to split.');
    setError(null);
    setRanKobo(amount);
  };

  const slide = (pct: number) => {
    setSliderPct(pct);
    const kobo = Math.floor((expected * pct) / 100 / 100) * 100; // whole naira
    setAmount(kobo);
    setRanKobo(kobo);
    setError(null);
  };

  const sliderKobo = Math.floor((expected * sliderPct) / 100 / 100) * 100;

  return (
    <Screen
      title="Payday Simulator"
      subtitle="Pretend money, real bank fees. Nothing is sent."
      footer={
        <>
          <Button label="Run simulation" variant="primary" onPress={run} />
          <Button label="Edit plan" variant="quiet" onPress={() => (router.canGoBack() ? router.back() : router.replace('/plan-builder'))} />
        </>
      }
    >
      <View style={styles.card}>
        <AmountField
          label="If this much arrives"
          valueKobo={amount}
          onChangeKobo={(k) => {
            setAmount(k);
            setError(null);
          }}
          helper={expected > 0 ? `You expect ${formatNaira(expected)} each payday.` : 'Enter any amount.'}
        />
        {error ? <FieldError message={error} /> : null}
        {expected > 0 ? (
          <Slider
            label="What if you're paid"
            valueText={`${sliderPct}% · ${formatNaira(sliderKobo)}`}
            value={sliderPct}
            min={SLIDER.min}
            max={SLIDER.max}
            step={SLIDER.step}
            onChange={slide}
            minText={`${SLIDER.min}%`}
            maxText={`${SLIDER.max}%`}
          />
        ) : null}
      </View>

      {cost ? <CostEstimate text={cost.text} overLimit={cost.overLimit} tips={costTips(feeSchedule)} /> : null}

      {plan.rules.length === 0 ? (
        <Hint text="Your plan has no rules yet. Tap Edit plan to add one." />
      ) : planProblem ? (
        <Hint text={planProblem} warning />
      ) : result ? (
        <Results result={result} rules={plan.rules} />
      ) : null}

      {canSwitchOn ? (
        <Button label="Switch on automation" variant="secondary" onPress={() => router.push(goLiveRoute(useApp.getState()))} />
      ) : null}
    </Screen>
  );
}

function Results({ result, rules }: { result: SplitResult; rules: Rule[] }) {
  const ruleById = new Map(rules.map((r) => [r.id, r]));
  const allocated = result.lines.reduce((s, l) => s + l.amountKobo, 0) + (result.remainder?.amountKobo ?? 0);
  const transferFees = result.totalFeesKobo - result.inflowFeeKobo;
  const total = allocated + result.totalFeesKobo + result.unsplitKobo;

  return (
    <View style={styles.results}>
      <View style={styles.head} accessible accessibilityRole="header" accessibilityLabel={`If ${formatNaira(result.incomeKobo)} arrives`}>
        <Text style={styles.muted}>If this arrives</Text>
        <Text style={styles.amount}>{formatNaira(result.incomeKobo)}</Text>
      </View>

      {result.status === 'needsApproval' ? (
        <Hint
          warning
          text={`This is less than half of your expected ${formatNaira(result.expectedKobo)}. On a real payday, SpreadIT pauses and sends nothing until you tap "Run in priority order". This is the split you would get.`}
        />
      ) : null}
      {result.status === 'tooSmall' ? <Hint warning text="This payment is too small to split." /> : null}

      {result.lines.map((line) => {
        const rule = ruleById.get(line.ruleId);
        return (
          <RuleCard
            key={line.ruleId}
            name={line.name}
            Icon={categoryIcon(rule?.categoryKey)}
            ruleType={ruleTypeText(rule, result.incomeKobo, line)}
            priority={line.priority}
            bankName={rule?.destination?.bankName}
            accountNumber={rule?.destination?.accountNumber}
            amountKobo={line.amountKobo}
            funding={line.funding}
            note={lineNote(line)}
          />
        );
      })}

      <View style={styles.card}>
        <Row label={result.remainder ? `Leftover to ${result.remainder.name}` : 'Leftover'} value={formatNaira(result.remainder?.amountKobo ?? 0)} strong />
        <Row
          label="Bank fees"
          detail={`${formatNaira(result.inflowFeeKobo)} to receive + ${formatNaira(transferFees)} to send`}
          value={formatNaira(result.totalFeesKobo)}
        />
        {result.unsplitKobo > 0 ? (
          <Row
            label="Stays in your SpreadIT account"
            detail="Too little to be worth the fee to send"
            value={formatNaira(result.unsplitKobo)}
          />
        ) : null}
        <View style={styles.rule} />
        <Row
          label="Total"
          detail={total === result.incomeKobo ? 'Adds up exactly to the amount in' : 'Does not add up'}
          value={formatNaira(total)}
          strong
        />
      </View>
    </View>
  );
}

function Row({ label, detail, value, strong = false }: { label: string; detail?: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}${detail ? `, ${detail}` : ''}: ${value}`}>
      <View style={styles.rowText}>
        <Text style={strong ? styles.rowStrong : styles.rowLabel}>{label}</Text>
        {detail ? <Text style={styles.muted}>{detail}</Text> : null}
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Hint({ text, warning = false }: { text: string; warning?: boolean }) {
  const Icon = warning ? TriangleExclamationPoint : Info;
  return (
    <View style={[styles.hint, warning && styles.hintWarning]} accessible accessibilityRole={warning ? 'alert' : 'text'}>
      <Icon size={size.icon} color={warning ? colors.warning : colors.inkMuted} strokeWidth={1.75} />
      <Text style={[styles.hintText, warning && styles.hintTextWarning]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[4], ...shadow.card },
  results: { gap: space[3] },
  head: { alignItems: 'center', gap: space[1], paddingVertical: space[2] },
  amount: { ...type.amountXl, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  rowText: { flex: 1, gap: space[1] },
  rowLabel: { ...type.body, color: colors.ink },
  rowStrong: { ...type.bodyStrong, color: colors.ink },
  value: { ...type.amountMd, color: colors.ink },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.sm,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
  hintWarning: { backgroundColor: colors.warningSoft },
  hintText: { ...type.body, color: colors.ink, flex: 1 },
  hintTextWarning: { color: colors.warning },
});
