// OptionList (v4, Figma "OptionRow"): pick one option. Separate rounded rows
// with a radio circle; the selected row is pale blue with a deep-blue border
// and a filled check.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radius, size, space, type } from '../theme/tokens';

export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface OptionListProps<T extends string> {
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** What is being chosen, read before the options, e.g. "Income type". */
  accessibilityLabel: string;
}

export function OptionList<T extends string>({ options, value, onChange, accessibilityLabel }: OptionListProps<T>) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={o.description ? `${o.label}. ${o.description}` : o.label}
            style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}
          >
            <View style={styles.text}>
              <Text style={styles.label}>{o.label}</Text>
              {o.description ? <Text style={styles.description}>{o.description}</Text> : null}
            </View>
            <View style={[styles.radio, selected && styles.radioOn]}>
              {selected ? <Check size={size.iconSm - 4} color={colors.onPrimary} strokeWidth={2.5} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: size.buttonHeight,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.brandSoft, borderColor: colors.primary },
  pressed: { opacity: 0.75 },
  text: { flex: 1, gap: space[1] },
  label: { ...type.bodyStrong, color: colors.ink },
  description: { ...type.label, color: colors.inkMuted },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
