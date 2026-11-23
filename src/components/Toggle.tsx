// Toggle (added stage 3, founder-approved): an on/off row. "On" is deep teal
// (brand-strong), never aqua, so the one-aqua-per-screen rule holds.
// The whole row is the touch target; the state is announced as on/off.
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, component, size, space, type } from '../theme/tokens';

export interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
  /** Shown instead of the description when disabled, to say why. */
  disabledReason?: string;
}

export function Toggle({ label, value, onValueChange, description, disabled = false, disabledReason }: ToggleProps) {
  const detail = disabled && disabledReason ? disabledReason : description;
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={detail}
      accessibilityState={{ checked: value, disabled }}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.line, true: colors.brandStrong }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.line}
        importantForAccessibility="no"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: size.touchMin, paddingVertical: space[2] },
  text: { flex: 1, gap: space[1] },
  label: { ...type.headline, color: colors.ink },
  detail: { ...type.label, color: colors.inkMuted },
  disabled: { opacity: component.disabledOpacity },
});
