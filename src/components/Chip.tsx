// Chip (docs/design-system.md v4, Figma "Chip"): a small pill for picking one of a
// few quick values (e.g. ₦500k / ₦850k / ₦1.2m on the simulator). Selected: deep
// blue with white text; otherwise pale blue with deep-blue text.
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, size, space, type } from '../theme/tokens';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function Chip({ label, selected = false, onPress, accessibilityLabel }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={space[1]}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: size.bubbleSm,
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary },
  pressed: { opacity: 0.8 },
  text: { ...type.labelStrong, color: colors.primary },
  textSelected: { color: colors.onPrimary },
});
