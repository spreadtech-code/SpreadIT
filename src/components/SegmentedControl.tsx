// SegmentedControl (docs/design-system.md): a two-way switch for rule type.
// Sunken track; the selected option is a white (raised) pill.
// Each option is at least 44px tall and announces its selected state.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, size, space, type } from '../theme/tokens';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Read out before the options, e.g. "Rule type". */
  accessibilityLabel: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={option.label}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.label, { color: selected ? colors.primary : colors.inkMuted }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.pill,
    padding: space[1],
    gap: space[1],
  },
  option: {
    flex: 1,
    minHeight: size.touchMin,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[3],
  },
  selected: { backgroundColor: colors.raised, ...shadow.card },
  label: { ...type.bodyStrong, textAlign: 'center' },
});
