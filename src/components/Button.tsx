// Button (docs/design-system.md v4): a 56px pill, sentence case, verb first.
// primary: deep blue, white text; the main action, at most one per screen.
// accent: sky blue, navy text; a friendly second action (e.g. "Send extra").
// secondary: white with a thin line border, ink text.
// quiet: deep-blue text, no fill.
// critical: critical-soft fill, critical text (Pause everything, destructive actions).
// quietCritical: no fill, critical text.
import { Pressable, StyleSheet, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, component, radius, size, space, type } from '../theme/tokens';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'quiet' | 'critical' | 'quietCritical';

const variants: Record<ButtonVariant, { fill: string; text: string; border?: string }> = {
  primary: { fill: colors.primary, text: colors.onPrimary },
  accent: { fill: colors.brand, text: colors.onBrand },
  secondary: { fill: colors.raised, text: colors.ink, border: colors.line },
  quiet: { fill: 'transparent', text: colors.primary },
  critical: { fill: colors.criticalSoft, text: colors.critical },
  quietCritical: { fill: 'transparent', text: colors.critical },
};

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Optional leading icon (Lucide, drawn at 20px in the label colour). */
  icon?: LucideIcon;
  /** When disabled, the screen must say why. */
  disabled?: boolean;
  /** Defaults to the label. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Fill the row (default) or hug the label. */
  fill?: boolean;
  /** Tighter side padding, for two or three buttons in a row (Home actions). */
  compact?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'secondary',
  icon: Icon,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  fill = true,
  compact = false,
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
        fill ? styles.fill : styles.hug,
        compact && styles.compact,
        { backgroundColor: v.fill },
        v.border ? { borderWidth: 1, borderColor: v.border } : null,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {Icon ? <Icon size={20} color={v.text} strokeWidth={1.75} /> : null}
      <Text style={[styles.label, { color: v.text }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: size.buttonHeight,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    paddingHorizontal: space[5],
    paddingVertical: space[3],
  },
  fill: { alignSelf: 'stretch' },
  hug: { flexShrink: 1, flexGrow: 1 },
  compact: { paddingHorizontal: space[3] },
  label: { ...type.bodyStrong, textAlign: 'center', flexShrink: 1 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: component.disabledOpacity },
});
