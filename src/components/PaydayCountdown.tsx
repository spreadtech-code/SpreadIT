// PaydayCountdown (docs/design-system.md): the review window (S16). Money
// received, the countdown, where it's going, and three choices. Full screen,
// centred, no nav.
// - The countdown in amount-lg, ink.
// - The split bar uses ink, deep teal, aqua and light aqua in priority order; it
//   is decorative and hidden from screen readers. Exact naira follow in the list.
// - Fees are their own line. The caller passes them from the fee schedule.
// The countdown ticks in the screen that uses this; this component only shows it.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, component, radius, shadow, space, type } from '../theme/tokens';
import { formatNaira } from '../engine/format';
import { Button } from './Button';

export interface PaydayAllocation {
  id: string;
  name: string;
  amountKobo: number;
}

export interface PaydayCountdownProps {
  receivedKobo: number;
  secondsLeft: number;
  /** In the user's priority order. */
  allocations: PaydayAllocation[];
  feesKobo: number;
  onExecute: () => void;
  onPause: () => void;
  onCancel: () => void;
}

const barColours = [colors.ink, colors.brandStrong, colors.brand, colors.brandMid];

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
  const time = clock(secondsLeft);
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
        <View style={styles.centre} accessible accessibilityLabel={`${formatNaira(receivedKobo)} received`}>
          <Text style={styles.label}>Income received</Text>
          <Text style={styles.big}>{formatNaira(receivedKobo)}</Text>
        </View>

        <View style={styles.centre} accessible accessibilityLabel={`Executing in ${time.spoken}`}>
          <Text style={styles.label}>Executing in</Text>
          <Text style={styles.big}>{time.text}</Text>
        </View>

        <View style={styles.bar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {funded.map((a, i) => (
            <View
              key={a.id}
              style={{ flex: a.amountKobo, backgroundColor: barColours[i % barColours.length] }}
            />
          ))}
        </View>

        <View>
          {allocations.map((a, i) => (
            <View key={a.id} style={[styles.row, i > 0 && styles.hairline]} accessible accessibilityLabel={`${a.name}, ${formatNaira(a.amountKobo)}`}>
              <Text style={styles.rowName}>{a.name}</Text>
              <Text style={styles.rowAmount}>{formatNaira(a.amountKobo)}</Text>
            </View>
          ))}
          <View style={[styles.row, styles.hairline]} accessible accessibilityLabel={`Fees, ${formatNaira(feesKobo)}`}>
            <Text style={styles.feeName}>Fees</Text>
            <Text style={styles.feeAmount}>{formatNaira(feesKobo)}</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <Button label="Execute now" variant="primary" onPress={onExecute} />
          <Button label="Pause for review" variant="secondary" onPress={onPause} />
          <Button label="Emergency cancel" variant="quietCritical" onPress={onCancel} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: space[5] },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space[6],
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
  rowName: { ...type.body, color: colors.ink, flex: 1 },
  rowAmount: { ...type.amountMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  feeName: { ...type.body, color: colors.inkMuted, flex: 1 },
  feeAmount: { ...type.amountMd, color: colors.inkMuted, fontVariant: ['tabular-nums'] },
  buttons: { gap: space[2] },
});
