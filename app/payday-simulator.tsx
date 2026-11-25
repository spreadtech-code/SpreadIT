// S10 Payday Simulator, "Try a payday" (C1-C6). v2 layout approved by the founder
// on 25 Nov 2026 (Figma frames 45:1816 and 45:2001).
// - An aqua card holds the amount ("If this lands", tap the pencil or the number to
//   type) and the what-if slider. There is no Run button: the split updates live
//   as the amount or the slider changes (founder decision; replaces C1's "Run
//   simulation" tap).
// - C1: any amount; every allocation, the fees and the leftovers add up to
//   exactly the amount entered (the total line says so).
// - C2: no identity check anywhere on this screen.
// - C3: each rule shows Fully paid / Part paid / Skipped (PRD: Fully funded /
//   Partly funded / Skipped) with the naira shortfall when money ran short.
// - C4: fees from src/data/feeSchedule.ts (inflow + transfers + stamp duty).
// - C5: slider from 10% to 150% of the expected amount, in 10% steps.
// - C6: the monthly cost line at the expected amount and pay frequency.
// Flows: S6 -> S10 -> "Edit plan" back to S6; S10 -> S11 to turn on Autopilot.
import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import {
  Button,
  CostEstimate,
  Notice,
  Screen,
  SectionHeader,
  Slider,
  SplitDonut,
  StatusBadge,
  feeColour,
  leftoverColour,
  sliceColour,
  type SplitSlice,
} from '../src/components';
import { feeSchedule } from '../src/data/feeSchedule';
import { pricing } from '../src/data/pricing';
import { formatNaira, groupThousands } from '../src/engine/format';
import { costTips, monthlyCost } from '../src/engine/monthlyCost';
import { checkPlan } from '../src/engine/planChecks';
import { splitIncome } from '../src/engine/split';
import type { SplitResult } from '../src/engine/types';
import { lineNote } from '../src/lib/splitText';
import { goLiveRoute, useApp } from '../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../src/theme/tokens';

/** C5: 10% to 150% of the expected amount, in steps of 10%. */
const SLIDER = { min: 10, max: 150, step: 10 } as const;
/** Up to ₦999,999,999: large enough for any payday, small enough for the engine's exact maths. */
const MAX_DIGITS = 9;

/** Whole naira, as kobo. */
const ofExpected = (expectedKobo: number, pct: number) => Math.floor((expectedKobo * pct) / 100 / 100) * 100;

export default function PaydaySimulatorScreen() {
  const router = useRouter();
  const plan = useApp((s) => s.plan);
  const income = useApp((s) => s.income);
  const fallback = useApp((s) => s.fallback);
  const automationOn = useApp((s) => s.automation.on);
  const input = useRef<ComponentRef<typeof TextInput>>(null);

  const expected = income?.expectedKobo ?? 0;
  const [amount, setAmount] = useState<number | null>(expected > 0 ? expected : null);
  const [sliderPct, setSliderPct] = useState(100);

  // Recomputed on every render, so the split follows each keystroke and slide,
  // and an edit to the plan shows as soon as the user comes back from S6.
  let result: SplitResult | null = null;
  let planProblem = false;
  if (amount && amount > 0 && plan.rules.length > 0) {
    try {
      result = splitIncome({ incomeKobo: amount, expectedKobo: expected || amount, plan, schedule: feeSchedule });
    } catch {
      planProblem = true;
    }
  }

  const cost = income
    ? monthlyCost({ plan, expectedKobo: expected, frequency: income.frequency, schedule: feeSchedule, pricing })
    : null;
  const canSwitchOn = !automationOn && plan.rules.length > 0 && checkPlan(plan, expected, feeSchedule).canSwitchOn && fallback != null;

  const type_ = (text: string) => {
    const digits = text.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, MAX_DIGITS);
    const kobo = digits === '' ? null : Number(digits) * 100;
    setAmount(kobo);
    if (kobo && expected > 0) {
      const pct = Math.round((kobo / expected) * 100 / SLIDER.step) * SLIDER.step;
      setSliderPct(Math.min(SLIDER.max, Math.max(SLIDER.min, pct)));
    }
  };

  const slide = (pct: number) => {
    setSliderPct(pct);
    setAmount(ofExpected(expected, pct));
  };

  const long = amount != null && amount >= 100_000_000_00; // ₦100m or more: smaller digits so it fits
  const pctText = amount && expected > 0 ? `${Math.round((amount / expected) * 100)}%` : `${sliderPct}%`;
  const hint =
    expected <= 0
      ? 'Type any amount.'
      : amount === expected
        ? 'Your usual pay. Slide to try more or less.'
        : `You usually get ${formatNaira(expected)}.`;

  return (
    <Screen
      title="Try a payday"
      subtitle="Pretend money, real bank fees. Nothing moves."
      footer={
        <>
          {canSwitchOn ? (
            <Button label="Turn on Autopilot" variant="primary" onPress={() => router.push(goLiveRoute(useApp.getState()))} />
          ) : null}
          <Button label="Edit plan" variant="quiet" onPress={() => (router.canGoBack() ? router.back() : router.replace('/plan-builder'))} />
        </>
      }
    >
      <View style={styles.brandCard}>
        <Text style={styles.onBrandLabel}>If this lands</Text>
        <View style={styles.amountRow}>
          <Pressable style={styles.amountPress} onPress={() => input.current?.focus()} accessible={false}>
            <Text style={[styles.currency, long && styles.amountLong]} accessibilityElementsHidden importantForAccessibility="no">
              ₦
            </Text>
            <TextInput
              ref={input}
              value={amount == null ? '' : groupThousands(Math.floor(amount / 100))}
              onChangeText={type_}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.onBrand}
              selectionColor={colors.onBrand}
              accessibilityLabel="If this lands, amount in naira"
              accessibilityHint={hint}
              style={[styles.amountInput, long && styles.amountLong]}
            />
          </Pressable>
          <Pressable
            onPress={() => input.current?.focus()}
            accessibilityRole="button"
            accessibilityLabel="Change the amount"
            style={({ pressed }) => [styles.edit, pressed && styles.pressed]}
          >
            <Pencil size={size.iconSm} color={colors.onBrand} strokeWidth={1.75} />
          </Pressable>
        </View>
        <Text style={styles.onBrandText}>{hint}</Text>
        {expected > 0 ? (
          <Slider
            tone="onBrand"
            label="What if you’re paid"
            valueText={pctText}
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

      {plan.rules.length === 0 ? (
        <Notice text="Your plan has no rules yet. Tap Edit plan to add one." />
      ) : planProblem ? (
        <Notice tone="warning" text="Your plan has a problem to fix first. Tap Edit plan to see it." />
      ) : !amount ? (
        <Notice text="Type an amount to see how it splits." />
      ) : result ? (
        <Results result={result} />
      ) : null}

      {cost ? <CostEstimate text={cost.text} overLimit={cost.overLimit} tips={costTips(feeSchedule)} /> : null}
    </Screen>
  );
}

function Results({ result }: { result: SplitResult }) {
  const leftover = result.remainder?.amountKobo ?? 0;
  const allocated = result.lines.reduce((s, l) => s + l.amountKobo, 0) + leftover;
  const total = allocated + result.totalFeesKobo + result.unsplitKobo;
  const transferFees = result.totalFeesKobo - result.inflowFeeKobo;

  const slices: SplitSlice[] = [
    ...result.lines.map((l) => ({ id: l.ruleId, name: l.name, amountKobo: l.amountKobo })),
    ...(result.remainder ? [{ id: 'leftovers', name: 'Leftovers', amountKobo: leftover, colour: leftoverColour }] : []),
    ...(result.unsplitKobo > 0 ? [{ id: 'unsplit', name: 'Stays in SpreadIT', amountKobo: result.unsplitKobo, colour: colors.line }] : []),
    { id: 'fees', name: 'Bank fees', amountKobo: result.totalFeesKobo, colour: feeColour },
  ];

  return (
    <>
      {result.status === 'needsApproval' ? (
        <Notice
          tone="warning"
          text={`Less than half of your usual ${formatNaira(result.expectedKobo)}. On a real payday, SpreadIT holds it and sends nothing until you tap “Pay in order”. This is the split you’d get.`}
        />
      ) : null}
      {result.status === 'tooSmall' ? <Notice tone="warning" text="This is too small to split." /> : null}

      <View style={styles.card}>
        <SectionHeader title="Here’s how it splits" />
        <SplitDonut slices={slices} centre={formatNaira(result.incomeKobo)} caption={`split ${slices.filter((x) => x.amountKobo > 0).length} ways`} />

        <View style={styles.legend}>
          {result.lines.map((line, i) => {
            const note = lineNote(line);
            return (
              <View
                key={line.ruleId}
                style={styles.row}
                accessible
                accessibilityLabel={[line.name, formatNaira(line.amountKobo), line.funding, note].filter(Boolean).join(', ')}
              >
                <View style={[styles.dot, { backgroundColor: sliceColour(i) }]} />
                <View style={styles.rowMain}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {line.name}
                    </Text>
                    <StatusBadge state={line.funding} />
                  </View>
                  {note ? <Text style={styles.note}>{note}</Text> : null}
                </View>
                <Text style={styles.amount}>{formatNaira(line.amountKobo)}</Text>
              </View>
            );
          })}

          <View style={styles.hairline} />

          {result.remainder ? (
            <Line colour={leftoverColour} name="Leftovers" detail={`To ${result.remainder.name}`} kobo={leftover} />
          ) : null}
          {result.unsplitKobo > 0 ? (
            <Line colour={colors.line} name="Stays in SpreadIT" detail="Too little to be worth the fee to send" kobo={result.unsplitKobo} />
          ) : null}
          <Line
            colour={feeColour}
            name="Bank fees"
            detail={`${formatNaira(result.inflowFeeKobo)} to receive + ${formatNaira(transferFees)} to send`}
            kobo={result.totalFeesKobo}
          />
        </View>

        <Text style={styles.total} accessibilityLabel={`Total ${formatNaira(total)}. ${total === result.incomeKobo ? 'Adds up exactly.' : 'Does not add up.'}`}>
          Total {formatNaira(total)} · {total === result.incomeKobo ? 'adds up exactly' : 'doesn’t add up'}
        </Text>
      </View>
    </>
  );
}

function Line({ colour, name, detail, kobo }: { colour: string; name: string; detail?: string; kobo: number }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${name}${detail ? `, ${detail}` : ''}: ${formatNaira(kobo)}`}>
      <View style={[styles.dot, { backgroundColor: colour }]} />
      <View style={styles.rowMain}>
        <Text style={styles.name}>{name}</Text>
        {detail ? <Text style={styles.note}>{detail}</Text> : null}
      </View>
      <Text style={styles.amount}>{formatNaira(kobo)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandCard: { backgroundColor: colors.brand, borderRadius: radius.lg, padding: space[5], gap: space[3] },
  onBrandLabel: { ...type.labelStrong, color: colors.onBrand },
  onBrandText: { ...type.label, color: colors.onBrand },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  amountPress: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[1] },
  currency: { ...type.amountXl, color: colors.onBrand },
  amountInput: { ...type.amountXl, color: colors.onBrand, flex: 1, minWidth: 0, padding: 0, minHeight: size.touchMin },
  amountLong: { ...type.amountLg },
  edit: {
    width: size.bubble,
    height: size.bubble,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[4], gap: space[4], ...shadow.card },
  legend: { gap: space[1] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 40 },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  rowMain: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' },
  name: { ...type.body, color: colors.ink, flexShrink: 1 },
  note: { ...type.label, color: colors.inkMuted },
  amount: { ...type.amountMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginVertical: space[1] },
  total: { ...type.label, color: colors.inkMuted, textAlign: 'center' },
});
