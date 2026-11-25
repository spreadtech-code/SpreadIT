// TextField (added stage 3, founder-approved): a sunken well like AmountField,
// with the same focus ring (a 1.5px deep-blue border, v4).
// An error shows in critical text with an icon, never by colour alone.
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { CircleX } from 'lucide-react-native';
import { colors, component, radius, size, space, type } from '../theme/tokens';

export interface TextFieldProps
  extends Pick<
    TextInputProps,
    'keyboardType' | 'secureTextEntry' | 'autoComplete' | 'textContentType' | 'maxLength' | 'autoCapitalize' | 'autoFocus' | 'onSubmitEditing' | 'returnKeyType'
  > {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string | null;
  /** Fixed text after the input, e.g. "%". */
  suffix?: string;
}

export function TextField({ label, value, onChangeText, placeholder, helper, error, suffix, ...input }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.halo, focused && styles.haloFocused]}>
        <View style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            placeholderTextColor={colors.inkFaint}
            selectionColor={colors.primary}
            accessibilityLabel={label}
            accessibilityHint={error ?? helper}
            style={styles.input}
            autoCapitalize="none"
            {...input}
          />
          {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
        </View>
      </View>
      {error ? (
        <FieldError message={error} />
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

/** An error line: critical text with an icon, announced to screen readers. */
export function FieldError({ message }: { message: string }) {
  return (
    <View style={styles.errorRow} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <CircleX size={size.icon} color={colors.critical} strokeWidth={1.75} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[2] },
  label: { ...type.labelStrong, color: colors.inkMuted },
  halo: {},
  haloFocused: {},
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    borderWidth: component.focusRingWidth,
    borderColor: 'transparent',
    paddingHorizontal: space[4],
    minHeight: size.buttonHeight,
    gap: space[2],
  },
  fieldFocused: { borderColor: colors.focusRing },
  fieldError: { borderColor: colors.critical },
  input: { ...type.body, color: colors.ink, flex: 1, paddingVertical: space[3] },
  suffix: { ...type.bodyStrong, color: colors.inkMuted },
  helper: { ...type.label, color: colors.inkMuted },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  errorText: { ...type.label, color: colors.critical, flex: 1 },
});
