// Button (docs/design-system.md): a 56px pill, sentence case, verb first.
// primary: aqua fill, ink text; at most one per screen.
// secondary: sunken fill, ink text. quiet: brand-strong text, no fill.
// critical: critical-soft fill, critical text (Emergency pause, destructive actions).
// quietCritical: no fill, critical text (Emergency cancel on the payday screen).
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, component, radius, size, space, type } from '../theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'critical' | 'quietCritical';

const variants: Record<ButtonVariant, { fill: string; text: string }> = {
  primary: { fill: colors.brand, text: colors.onBrand },
  secondary: { fill: colors.surfaceSunken, text: colors.ink },
  quiet: { fill: 'transparent', text: colors.brandStrong },
  critical: { fill: colors.criticalSoft, text: colors.critical },
  quietCritical: { fill: 'transparent', text: colors.critical },
};

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** When disabled, the screen must say why. */
  disabled?: boolean;
  /** Defaults to the label. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'secondary',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const v = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.fill },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, { color: v.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    minHeight: size.buttonHeight,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[6],
    paddingVertical: space[3],
  },
  label: { ...type.bodyStrong, textAlign: 'center' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: component.disabledOpacity },
});
