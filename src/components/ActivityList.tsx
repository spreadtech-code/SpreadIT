// ActivityList (docs/design-system.md v3): a title-sm header, then each row as
// its own light grey rounded tile, from the home reference's "Portfolio" list.
// Used for activity, income history and settings lists.
// Money in: down-left arrow, "+₦" in success, no badge.
// Money out: up-right arrow, amount in ink, a status badge.
// Settings rows: no amount; a chevron when the row opens something.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { colors, radius, size, space, type } from '../theme/tokens';
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
      {items.map((item) => (
        <Row key={item.id} item={item} />
      ))}
    </View>
  );
}

function Row({ item }: { item: ActivityItem }) {
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
      <View style={styles.rowMain}>
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
  card: { gap: space[2] },
  title: { ...type.titleSm, color: colors.ink, marginBottom: space[1] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: size.touchMin,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space[4],
  },
  iconCircle: {
    width: size.iconCircle,
    height: size.iconCircle,
    borderRadius: radius.pill,
    backgroundColor: colors.raised,
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
  text: { flex: 1 },
  name: { ...type.headline, color: colors.ink },
  meta: { ...type.label, color: colors.inkMuted },
  right: { alignItems: 'flex-end', gap: space[1] },
  amount: { ...type.amountMd, color: colors.ink, fontVariant: ['tabular-nums'] },
  amountIn: { color: colors.success },
  pressed: { opacity: 0.75 },
});
