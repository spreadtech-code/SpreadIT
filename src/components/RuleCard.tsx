// RuleCard (docs/design-system.md): one rule in the plan builder (S6) and the
// simulator (S10). Icon circle, name, meta line, amount, funding state, drag handle.
// Meta line order: rule type · priority · bank and last 4 digits.
// Funding badges show only in the simulator and payday screens (pass `funding`).
// A Skipped rule shows ₦0 in ink-muted.
// The drag handle is drawn only; drag-to-reorder comes in stage 3.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GripVertical, type LucideIcon } from 'lucide-react-native';
import { colors, radius, shadow, size, space, type } from '../theme/tokens';
import { formatNaira, maskAccount } from '../engine/format';
import { StatusBadge } from './StatusBadge';

export type FundingState = 'Fully funded' | 'Partly funded' | 'Skipped';

export interface RuleCardProps {
  name: string;
  Icon: LucideIcon;
  /** e.g. "Fixed" or "10% of income". */
  ruleType: string;
  priority: number;
  bankName: string;
  accountNumber: string;
  amountKobo: number;
  funding?: FundingState;
  showDragHandle?: boolean;
  onPress?: () => void;
}

export function RuleCard({
  name,
  Icon,
  ruleType,
  priority,
  bankName,
  accountNumber,
  amountKobo,
  funding,
  showDragHandle = false,
  onPress,
}: RuleCardProps) {
  const skipped = funding === 'Skipped';
  const amount = formatNaira(skipped ? 0 : amountKobo);
  const meta = `${ruleType} · Priority ${priority} · ${bankName} ${maskAccount(accountNumber)}`;
  const spoken = [name, meta, amount, funding ? `Status: ${funding}` : null]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={spoken}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconCircle}>
        <Icon size={size.icon} color={colors.ink} strokeWidth={1.75} />
      </View>
      <View style={styles.text}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{meta}</Text>
        {funding ? <StatusBadge state={funding} /> : null}
      </View>
      <Text style={[styles.amount, skipped && styles.amountSkipped]}>{amount}</Text>
      {showDragHandle ? (
        <View style={styles.handle} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <GripVertical size={size.icon} color={colors.inkMuted} strokeWidth={1.75} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[4],
    ...shadow.card,
  },
  iconCircle: {
    width: size.iconCircle,
    height: size.iconCircle,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: space[1] },
  name: { ...type.headline, color: colors.ink },
  meta: { ...type.label, color: colors.inkMuted },
  amount: { ...type.amountMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  amountSkipped: { color: colors.inkMuted },
  handle: { minWidth: size.touchMin, minHeight: size.touchMin, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.75 },
});
