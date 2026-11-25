// PaydayCountdown (docs/design-system.md): the review window (S16). Money
// received, the countdown, where it's going, and three choices. Full screen,
// centred, no nav.
// - The countdown in amount-lg, ink.
// - The split bar uses the teal chart scale in priority order (the same colours as
//   the legend dots); it is decorative and hidden from screen readers. Exact naira
//   follow in the list.
// - Words follow docs/copy.md (PRD "Execute now" = "Send it now", etc.).
// - Fees are their own line. The caller passes them from the fee schedule.
// The countdown ticks in the screen that uses this; this component only shows it.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, component, layout, radius, shadow, space, type } from '../theme/tokens';
import { formatNaira } from '../engine/format';
import { Button } from './Button';
import type { FundingState } from './RuleCard';
import { StatusBadge } from './StatusBadge';
import { feeColour, sliceColour } from './SplitDonut';

export interface PaydayAllocation {
  id: string;
  name: string;
  amountKobo: number;
  /** D3: bank and last 4 digits, e.g. "GTBank ••4821". */
  meta?: string;
  /** D4: the funding label, shown when not every rule is fully funded. */
  funding?: FundingState;
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

export function PaydayCountdown({
  receivedKobo,
  secondsLeft,
  allocations,
  feesKobo,
  onExecute,
  onPause,
  onCancel,
}: PaydayCountdownProps) {
  const insets = useSafeAreaInsets();
  const time = secondsLeft === null ? null : clock(secondsLeft);
  const funded = allocations.filter((a) => a.amountKobo > 0);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space[5], paddingBottom: insets.bottom + space[5] },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.centre} accessible accessibilityLabel={`${formatNaira(receivedKobo)} just landed`}>
          <Text style={styles.label}>Pay just landed</Text>
          <Text style={styles.big}>{formatNaira(receivedKobo)}</Text>
        </View>

        {time ? (
          <View style={styles.centre} accessible accessibilityLabel={`Sending in ${time.spoken}`}>
            <Text style={styles.label}>Sending in</Text>
            <Text style={styles.big}>{time.text}</Text>
          </View>
        ) : (
          <View style={styles.centre} accessible accessibilityLabel="On hold for review. Nothing goes out until you tap Send it now.">
            <StatusBadge state="Paused" />
            <Text style={styles.label}>Nothing goes out until you tap Send it now.</Text>
          </View>
        )}

        <View style={styles.bar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {funded.map((a, i) => (
            <View key={a.id} style={{ flex: a.amountKobo, backgroundColor: sliceColour(i) }} />
          ))}
          {feesKobo > 0 ? <View style={{ flex: feesKobo, backgroundColor: feeColour }} /> : null}
        </View>

        <View>
          {allocations.map((a, i) => (
            <View
              key={a.id}
              style={[styles.row, i > 0 && styles.hairline]}
              accessible
              accessibilityLabel={[a.name, a.meta, formatNaira(a.amountKobo), a.funding ? `Status: ${a.funding}` : null].filter(Boolean).join(', ')}
            >
              <View style={[styles.dot, { backgroundColor: a.amountKobo > 0 ? sliceColour(funded.indexOf(a)) : colors.line }]} />
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{a.name}</Text>
                {a.meta ? <Text style={styles.rowMeta}>{a.meta}</Text> : null}
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowAmount}>{formatNaira(a.amountKobo)}</Text>
                {a.funding ? <StatusBadge state={a.funding} /> : null}
              </View>
            </View>
          ))}
          <View style={[styles.row, styles.hairline]} accessible accessibilityLabel={`Bank fees, ${formatNaira(feesKobo)}`}>
            <View style={[styles.dot, { backgroundColor: feeColour }]} />
            <Text style={styles.feeName}>Bank fees</Text>
            <Text style={styles.feeAmount}>{formatNaira(feesKobo)}</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <Button label="Send it now" variant="primary" onPress={onExecute} />
          {onPause ? <Button label="Hold for review" variant="secondary" onPress={onPause} /> : null}
          <Button label="Stop this payday" variant="quietCritical" onPress={onCancel} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: layout.screenPadding },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[5],
    gap: space[5],
    ...shadow.card,
  },
  centre: { alignItems: 'center', gap: space[1] },
  label: { ...type.label, color: colors.inkMuted, textAlign: 'center' },
  big: { ...type.amountLg, color: colors.ink, textAlign: 'center', fontVariant: ['tabular-nums'] },
  bar: {
    flexDirection: 'row',
    height: component.splitBarHeight,
    borderRadius: radius.pill,
    overflow: 'hidden',
    gap: space[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    paddingVertical: space[3],
  },
  hairline: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  rowText: { flex: 1 },
  rowName: { ...type.body, color: colors.ink },
  rowMeta: { ...type.label, color: colors.inkMuted },
  rowRight: { alignItems: 'flex-end', gap: space[1] },
  rowAmount: { ...type.amountMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  feeName: { ...type.body, color: colors.inkMuted, flex: 1 },
  feeAmount: { ...type.amountMd, color: colors.inkMuted, fontVariant: ['tabular-nums'] },
  buttons: { gap: space[2] },
});
