// InfoRow (docs/design-system.md v4, Figma "InfoRow"): a muted label on the left and
// a value on the right, for receipts and summaries ("Fee  ₦100").
import { StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme/tokens';

export function InfoRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[4], minHeight: 36 },
  label: { ...type.label, color: colors.inkMuted, flexShrink: 1 },
  value: { ...type.bodyStrong, color: colors.ink, fontVariant: ['tabular-nums'], textAlign: 'right', flexShrink: 1 },
  strong: { ...type.headline },
});
