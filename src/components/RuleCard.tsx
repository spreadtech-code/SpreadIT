// RuleCard (docs/design-system.md): one rule in the plan builder (S6) and the
// simulator (S10). Icon circle, name, meta line, amount, funding state, drag handle.
// Meta line order: rule type · priority · bank and last 4 digits.
// Funding badges show only in the simulator and payday screens (pass `funding`).
// A Skipped rule shows ₦0 in ink-muted.
// Reordering (B6): press and hold the card, or press the handle, to drag.
// Screen readers get "Move up" and "Move down" actions instead of dragging.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GripVertical, type LucideIcon } from 'lucide-react-native';
import { colors, radius, shadow, size, space, type } from '../theme/tokens';
import { formatNaira, maskAccount } from '../engine/format';
import { StatusBadge, badgeWords } from './StatusBadge';

export type FundingState = 'Fully funded' | 'Partly funded' | 'Skipped';

export interface RuleCardProps {
  name: string;
  Icon: LucideIcon;
  /** e.g. "Fixed" or "10% of income". */
  ruleType: string;
  priority: number;
  bankName?: string;
  accountNumber?: string;
  amountKobo: number;
  funding?: FundingState;
  /** A short extra line, e.g. "Skipping next payday". */
  note?: string;
  showDragHandle?: boolean;
  /** Starts a drag (plan builder only). */
  onDrag?: () => void;
  /** Screen-reader reorder actions (plan builder only). */
  onMove?: (delta: -1 | 1) => void;
  /** Lifted while being dragged. */
  active?: boolean;
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
  note,
  showDragHandle = false,
  onDrag,
  onMove,
  active = false,
  onPress,
}: RuleCardProps) {
  const skipped = funding === 'Skipped';
  const amount = formatNaira(skipped ? 0 : amountKobo);
  const where = bankName && accountNumber ? ` · ${bankName} ${maskAccount(accountNumber)}` : ' · No account yet';
  const meta = `${ruleType} · Priority ${priority}${where}`;
  const spoken = [name, meta, amount, note, funding ? `Status: ${badgeWords[funding]}` : null].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDrag}
      delayLongPress={250}
      disabled={!onPress && !onDrag}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={spoken}
      accessibilityActions={onMove ? [{ name: 'moveUp', label: 'Move up' }, { name: 'moveDown', label: 'Move down' }] : undefined}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'moveUp') onMove?.(-1);
        if (e.nativeEvent.actionName === 'moveDown') onMove?.(1);
      }}
      style={({ pressed }) => [styles.card, active && styles.active, pressed && !active && styles.pressed]}
    >
      <View style={styles.iconCircle}>
        <Icon size={size.icon} color={colors.primary} strokeWidth={1.75} />
      </View>
      <View style={styles.text}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{meta}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
        {funding ? <StatusBadge state={funding} /> : null}
      </View>
      <Text style={[styles.amount, skipped && styles.amountSkipped]}>{amount}</Text>
      {showDragHandle ? (
        <Pressable
          onPressIn={onDrag}
          hitSlop={space[2]}
          style={styles.handle}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <GripVertical size={size.icon} color={colors.inkFaint} strokeWidth={1.75} />
        </Pressable>
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
  active: { ...shadow.float },
  iconCircle: {
    width: size.bubble,
    height: size.bubble,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: space[1] },
  name: { ...type.bodyStrong, color: colors.ink },
  meta: { ...type.label, color: colors.inkMuted },
  note: { ...type.label, color: colors.warning },
  amount: { ...type.amountMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  amountSkipped: { color: colors.inkMuted },
  handle: { minWidth: size.touchMin, minHeight: size.touchMin, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.75 },
});
