// RoundAction (docs/design-system.md): a 56px sunken circle with an ink icon and
// a 14px caption underneath. Never aqua: the hero stays calm so the amount leads.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, size, space, type } from '../theme/tokens';

export interface RoundActionProps {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
  /** Defaults to the caption. */
  accessibilityLabel?: string;
}

export function RoundAction({ label, Icon, onPress, accessibilityLabel }: RoundActionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <View style={styles.circle}>
        <Icon size={size.icon} color={colors.ink} strokeWidth={1.75} />
      </View>
      <Text style={styles.caption} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space[2], minWidth: size.roundButton },
  circle: {
    width: size.roundButton,
    height: size.roundButton,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: { ...type.label, color: colors.ink, textAlign: 'center' },
  pressed: { opacity: 0.75 },
});
