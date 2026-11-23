// AmountField (docs/design-system.md): naira entry for the rule editor, send
// extra and the simulator. ₦ fixed in ink-muted; the amount in 30px heavy with
// thousands separators. The helper always shows the real transfer cost; when the
// caller passes a stamp-duty warning, it replaces the helper.
// Fees are worked out by the fee schedule (stage 2), never in this component.
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { TriangleExclamationPoint } from 'lucide-react-native';
import { colors, component, radius, size, space, type } from '../theme/tokens';
import { groupThousands } from '../engine/format';

export interface AmountFieldProps {
  label: string;
  /** Whole kobo, or null when empty. The field takes whole naira only. */
  valueKobo: number | null;
  onChangeKobo: (kobo: number | null) => void;
  /** The real transfer cost, e.g. "Costs ₦25 to send". */
  helper: string;
  /** e.g. "Send ₦501 less to save ₦50 stamp duty". Replaces the helper when set. */
  warning?: string;
}

const MAX_DIGITS = 12; // up to ₦999,999,999,999

export function AmountField({ label, valueKobo, onChangeKobo, helper, warning }: AmountFieldProps) {
  const [focused, setFocused] = useState(false);
  const shown = valueKobo == null ? '' : groupThousands(Math.floor(valueKobo / 100));

  const onChangeText = (text: string) => {
    const digits = text.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, MAX_DIGITS);
    onChangeKobo(digits === '' ? null : Number(digits) * 100);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.halo, focused && styles.haloFocused]}>
        <View style={[styles.field, focused && styles.fieldFocused]}>
          <Text style={styles.currency} accessibilityElementsHidden importantForAccessibility="no">
            ₦
          </Text>
          <TextInput
            value={shown}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.inkMuted}
            selectionColor={colors.brandStrong}
            accessibilityLabel={`${label}, in naira`}
            accessibilityHint={warning ?? helper}
            style={styles.input}
          />
        </View>
      </View>
      {warning ? (
        <View style={styles.warning}>
          <TriangleExclamationPoint size={size.icon} color={colors.warning} strokeWidth={1.75} />
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      ) : (
        <Text style={styles.helper}>{helper}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[2] },
  label: { ...type.label, color: colors.inkMuted },
  halo: {
    borderRadius: radius.md + component.focusHaloWidth,
    borderWidth: component.focusHaloWidth,
    borderColor: 'transparent',
  },
  haloFocused: { borderColor: colors.brandSoft },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.surfaceSunken,
    borderRadius: radius.md,
    borderWidth: component.focusRingWidth,
    borderColor: 'transparent',
    paddingHorizontal: space[4],
    minHeight: size.buttonHeight,
  },
  fieldFocused: { borderColor: colors.brandStrong },
  currency: { ...type.amountLg, color: colors.inkMuted },
  input: { ...type.amountLg, color: colors.ink, flex: 1, paddingVertical: space[2] },
  helper: { ...type.label, color: colors.inkMuted },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
  warningText: { ...type.label, color: colors.warning, flex: 1 },
});
