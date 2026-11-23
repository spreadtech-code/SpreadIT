// ActivityList (docs/design-system.md): rows grouped inside one white card with
// a title-sm header and hairlines between rows. Used for activity, income history
// and settings lists.
// Money in: down-left arrow, "+₦" in success, no badge.
// Money out: up-right arrow, amount in ink, a status badge.
// Settings rows: no amount; a chevron when the row opens something.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { colors, radius, shadow, size, space, type } from '../theme/tokens';
import { formatNaira } from '../engine/format';
import { StatusBadge, type BadgeState } from './StatusBadge';

export interface ActivityItem {
  id: string;
  name: string;
  /** Muted line, e.g. "GTBank ••4821 · 9:41am". Mask account numbers with maskAccount(). */
  meta: string;
  direction?: 'in' | 'out';
  amountKobo?: number;
  /** Money out only. */
  status?: BadgeState;
  /** Overrides the in/out arrow, e.g. for settings rows. */
  Icon?: LucideIcon;
  onPress?: () => void;
}

export function ActivityList({ title, items }: { title: string; items: ActivityItem[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {items.map((item, i) => (
        <Row key={item.id} item={item} first={i === 0} />
      ))}
    </View>
  );
}

function Row({ item, first }: { item: ActivityItem; first: boolean }) {
  const Icon = item.Icon ?? (item.direction === 'in' ? ArrowDownLeft : ArrowUpRight);
  const isIn = item.direction === 'in';
  const amount =
    item.amountKobo == null ? null : formatNaira(item.amountKobo, { plus: isIn });
  const spoken = [
    item.name,
    item.meta,
    amount ? `${isIn ? 'Money in' : 'Money out'} ${amount}` : null,
    !isIn && item.status ? `Status: ${item.status}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const body = (
    <View style={styles.row}>
      <View style={styles.iconCircle}>
        <Icon size={size.icon} color={colors.ink} strokeWidth={1.75} />
      </View>
      {/* The hairline starts after the icon, never across it. */}
      <View style={[styles.rowMain, !first && styles.hairline]}>
        <View style={styles.text}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.meta}</Text>
        </View>
        {amount ? (
          <View style={styles.right}>
            <Text style={[styles.amount, isIn && styles.amountIn]}>{amount}</Text>
            {!isIn && item.status ? <StatusBadge state={item.status} /> : null}
          </View>
        ) : item.onPress ? (
          <ChevronRight size={size.icon} color={colors.inkMuted} strokeWidth={1.75} />
        ) : null}
      </View>
    </View>
  );

  if (!item.onPress) {
    return (
      <View accessible accessibilityLabel={spoken}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      onPress={item.onPress}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space[5],
    paddingTop: space[5],
    paddingBottom: space[2],
    ...shadow.card,
  },
  title: { ...type.titleSm, color: colors.ink, marginBottom: space[2] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: size.touchMin },
  iconCircle: {
    width: size.iconCircle,
    height: size.iconCircle,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
  },
  hairline: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  text: { flex: 1 },
  name: { ...type.headline, color: colors.ink },
  meta: { ...type.label, color: colors.inkMuted },
  right: { alignItems: 'flex-end', gap: space[1] },
  amount: { ...type.amountMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  amountIn: { color: colors.success },
  pressed: { opacity: 0.75 },
});
