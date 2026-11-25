// OptionList (added stage 3, founder-approved): pick one option. A grey card
// of rows with hairlines; the selected row is brand-soft with an ink check.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radius, shadow, size, space, type } from '../theme/tokens';

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
    <View style={styles.card} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={o.description ? `${o.label}. ${o.description}` : o.label}
            style={({ pressed }) => [
              styles.row,
              i > 0 && styles.hairline,
              selected && styles.selected,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.text}>
              <Text style={styles.label}>{o.label}</Text>
              {o.description ? <Text style={styles.description}>{o.description}</Text> : null}
            </View>
            {selected ? <Check size={size.icon} color={colors.ink} strokeWidth={1.75} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: size.buttonHeight,
    paddingHorizontal: space[5],
    paddingVertical: space[3],
  },
  hairline: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  selected: { backgroundColor: colors.brandSoft },
  pressed: { opacity: 0.75 },
  text: { flex: 1, gap: space[1] },
  label: { ...type.headline, color: colors.ink },
  description: { ...type.label, color: colors.inkMuted },
});
