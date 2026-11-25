// PinField (added stage 3, founder-approved): 6 sunken boxes over the phone's
// number keyboard. Digits show as dots. The box being typed in gets the
// black (focusRing) focus border.
import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CircleX } from 'lucide-react-native';
import { colors, component, radius, size, space, type } from '../theme/tokens';

export const PIN_LENGTH = 6;

export interface PinFieldProps {
  label: string;
  value: string;
  onChange: (pin: string) => void;
  error?: string | null;
  autoFocus?: boolean;
  /** false shows the digits (for an SMS code). Default true: dots. */
  masked?: boolean;
}

export function PinField({ label, value, onChange, error, autoFocus = true, masked = true }: PinFieldProps) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const boxes = Array.from({ length: PIN_LENGTH }, (_, i) => i);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => input.current?.focus()}
        accessible={false}
        style={styles.row}
      >
        {boxes.map((i) => {
          const current = focused && i === Math.min(value.length, PIN_LENGTH - 1);
          return (
            <View
              key={i}
              style={[styles.box, current && styles.boxFocused, !!error && styles.boxError]}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
            >
              {i < value.length ? (
                masked ? <View style={styles.dot} /> : <Text style={styles.digit}>{value[i]}</Text>
              ) : null}
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, PIN_LENGTH))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        secureTextEntry={masked}
        textContentType={masked ? undefined : 'oneTimeCode'}
        maxLength={PIN_LENGTH}
        autoFocus={autoFocus}
        caretHidden
        accessibilityLabel={`${label}, ${value.length} of ${PIN_LENGTH} digits entered`}
        accessibilityHint={error ?? undefined}
        style={styles.hiddenInput}
      />
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <CircleX size={size.icon} color={colors.critical} strokeWidth={1.75} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[3] },
  label: { ...type.label, color: colors.inkMuted, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: space[2] },
  box: {
    width: size.codeBoxWidth,
    height: size.codeBoxHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSunken,
    borderWidth: component.focusRingWidth,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: { borderColor: colors.focusRing },
  boxError: { borderColor: colors.critical },
  digit: { ...type.titleSm, color: colors.ink },
  dot: { width: space[3], height: space[3], borderRadius: radius.pill, backgroundColor: colors.primary },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  errorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2] },
  errorText: { ...type.label, color: colors.critical, flexShrink: 1 },
});
