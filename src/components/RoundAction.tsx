// RoundAction (docs/design-system.md v3): the round button in the middle of the
// black hero's action row ("+" Add rule), from the home reference. A 56px dark
// glossy circle with a thin light edge and a white icon. No visible caption, as
// in the reference; the label is read out by screen readers.
import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { colors, gradients, radius, size } from '../theme/tokens';

export interface RoundActionProps {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
  /** Defaults to the label. */
  accessibilityLabel?: string;
}

export function RoundAction({ label, Icon, onPress, accessibilityLabel }: RoundActionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <LinearGradient colors={gradients.pill} style={styles.circle}>
        <Icon size={size.iconLarge} color={colors.onInverse} strokeWidth={1.75} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: size.roundButton,
    height: size.roundButton,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.inverseLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
});
