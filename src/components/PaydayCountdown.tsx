// PaydayCountdown (docs/design-system.md v4, Figma "S16 Payday"): the review
// window. Full screen, no nav.
// - Top: an arrow-in bubble, "Payday's here", the amount, "just landed in your
//   SpreadIT account".
// - A pale-blue card with the countdown ("until it sends by itself"), or "On hold"
//   when the window is paused.
// - A split bar in the blue chart scale (same colours as the dots), decorative
//   and hidden from screen readers; then one line per transfer: dot, name, bank
//   and last 4 digits, amount, and the funding tag when money ran short (D4).
// - Bank fees on their own line. The caller passes them from the fee schedule.
// - Buttons: Send it now / Hold for review / Stop this payday (PRD: Execute now /
//   Pause for review / Emergency cancel; app words in docs/copy.md).
// The countdown ticks in the screen that uses this; this component only shows it.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDownLeft, Send } from 'lucide-react-native';
import { colors, component, layout, radius, size, space, type } from '../theme/tokens';
import { formatNaira } from '../engine/format';
import { Button } from './Button';
import type { FundingState } from './RuleCard';
import { StatusBadge, badgeWords } from './StatusBadge';
import { feeColour, leftoverColour, sliceColour } from './SplitDonut';

export interface PaydayAllocation {
  id: string;
  name: string;
  amountKobo: number;
  /** D3: bank and last 4 digits, e.g. "GTBank ••4821". */
  meta?: string;
  /** D4: the funding label, shown when not every rule is fully funded. */
  funding?: FundingState;
  /** The leftovers line: drawn in light grey. */
  leftovers?: boolean;
}

export interface PaydayCountdownProps {
  receivedKobo: number;
  /** null when the window is paused: no countdown, and no "Hold for review". */
  secondsLeft: number | null;
  /** In the user's priority order. */
  allocations: PaydayAllocation[];
  feesKobo: number;
  onExecute: () => void;
  onPause?: () => void;
  onCancel: () => void;
}

function clock(seconds: number): { text: string; spoken: string } {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return {
    text: `${m}:${String(r).padStart(2, '0')}`,
    spoken: `${m} minute${m === 1 ? '' : 's'} ${r} second${r === 1 ? '' : 's'}`,
  };
}

export function PaydayCountdown({ receivedKobo, secondsLeft, allocations, feesKobo, onExecute, onPause, onCancel }: PaydayCountdownProps) {
  const insets = useSafeAreaInsets();
  const time = secondsLeft === null ? null : clock(secondsLeft);
  let ruleIndex = 0;
  const lines = allocations.map((a) => ({ ...a, colour: a.leftovers ? leftoverColour : sliceColour(ruleIndex++) }));

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[8], paddingBottom: insets.bottom + space[5] }]}
    >
      <View style={styles.top} accessible accessibilityLabel={`Payday’s here. ${formatNaira(receivedKobo)} just landed in your SpreadIT account.`}>
        <View style={styles.bubble}>
          <ArrowDownLeft size={size.icon} color={colors.primary} strokeWidth={1.75} />
        </View>
        <Text style={styles.label}>Payday’s here</Text>
        <Text style={styles.big} adjustsFontSizeToFit numberOfLines={1}>
          {formatNaira(receivedKobo)}
        </Text>
        <Text style={styles.label}>just landed in your SpreadIT account</Text>
      </View>

      {time ? (
        <View style={styles.timer} accessible accessibilityLabel={`Sends by itself in ${time.spoken}`} accessibilityLiveRegion="none">
          <Text style={styles.clock}>{time.text}</Text>
          <Text style={styles.timerText}>until it sends by itself</Text>
        </View>
      ) : (
        <View style={styles.timer} accessible accessibilityLabel="On hold for review. Nothing goes out until you tap Send it now.">
          <StatusBadge state="Paused" />
          <Text style={styles.timerText}>On hold. Nothing goes out until you tap Send it now.</Text>
        </View>
      )}

      <View style={styles.bar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {lines
          .filter((a) => a.amountKobo > 0)
          .map((a) => (
            <View key={a.id} style={{ flex: a.amountKobo, backgroundColor: a.colour }} />
          ))}
        {feesKobo > 0 ? <View style={{ flex: Math.max(feesKobo, receivedKobo / 200), backgroundColor: feeColour }} /> : null}
      </View>

      <View style={styles.list}>
        {lines.map((a) => (
          <View
            key={a.id}
            style={styles.row}
            accessible
            accessibilityLabel={[a.name, a.meta, formatNaira(a.amountKobo), a.funding ? badgeWords[a.funding] : null].filter(Boolean).join(', ')}
          >
            <View style={[styles.dot, { backgroundColor: a.amountKobo > 0 ? a.colour : colors.line }]} />
            <View style={styles.rowText}>
              <Text style={styles.rowName} numberOfLines={2}>
                {a.name}
                {a.meta ? <Text style={styles.rowMeta}> · {a.meta}</Text> : null}
              </Text>
              {a.funding ? <StatusBadge state={a.funding} /> : null}
            </View>
            <Text style={styles.rowAmount}>{formatNaira(a.amountKobo)}</Text>
          </View>
        ))}
        <View style={styles.row} accessible accessibilityLabel={`Bank fees, ${formatNaira(feesKobo)}`}>
          <View style={[styles.dot, { backgroundColor: feeColour }]} />
          <View style={styles.rowText}>
            <Text style={styles.rowName}>Bank fees</Text>
          </View>
          <Text style={styles.rowAmount}>{formatNaira(feesKobo)}</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <Button label="Send it now" icon={Send} variant="primary" onPress={onExecute} />
        {onPause ? <Button label="Hold for review" variant="secondary" onPress={onPause} /> : null}
        <Button label="Stop this payday" variant="critical" onPress={onCancel} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.screenPadding, gap: space[5] },
  top: { alignItems: 'center', gap: space[2] },
  bubble: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  label: { ...type.label, color: colors.inkMuted, textAlign: 'center' },
  big: { ...type.amountXl, color: colors.ink, textAlign: 'center', fontVariant: ['tabular-nums'] },
  timer: { backgroundColor: colors.brandSoft, borderRadius: radius.lg, padding: space[5], gap: space[1], alignItems: 'center' },
  clock: { ...type.amountLg, color: colors.onBrand, fontVariant: ['tabular-nums'] },
  timerText: { ...type.label, color: colors.onBrand, textAlign: 'center' },
  bar: {
    flexDirection: 'row',
    height: component.splitBarHeight,
    borderRadius: radius.pill,
    overflow: 'hidden',
    gap: space[1],
  },
  list: { gap: space[1] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 36 },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  rowText: { flex: 1, gap: space[1], alignItems: 'flex-start' },
  rowName: { ...type.body, color: colors.ink },
  rowMeta: { ...type.body, color: colors.inkMuted },
  rowAmount: { ...type.amountMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  buttons: { gap: space[2], marginTop: space[2] },
});
