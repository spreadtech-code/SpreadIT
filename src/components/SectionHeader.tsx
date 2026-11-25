// SectionHeader (docs/design-system.md v4, Figma "SectionHeader"): a section title
// with an optional quiet link on the right ("See all", "Details") and a chevron.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, size, space, type } from '../theme/tokens';

export interface SectionHeaderProps {
  title: string;
  /** e.g. "See all". */
  action?: string;
  onPress?: () => void;
}

export function SectionHeader({ title, action, onPress }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {action && onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${action}: ${title}`}
          hitSlop={space[3]}
          style={styles.action}
        >
          <Text style={styles.actionText}>{action}</Text>
          <ChevronRight size={size.iconSm} color={colors.inkMuted} strokeWidth={1.75} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: size.touchMin },
  title: { ...type.headline, color: colors.ink, flexShrink: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: space[1], minHeight: size.touchMin },
  actionText: { ...type.label, color: colors.inkMuted },
});
