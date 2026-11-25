// Slider (added stage 4, founder-approved): drag to pick a value in steps.
// Used by the Payday Simulator's what-if slider (C5).
// - Built on @react-native-community/slider (works in Expo Go).
// - Track and thumb are deep blue (primary, design system v4). On the sky-blue
//   simulator card (tone "onBrand") everything is navy (onBrand).
// - The current value is always written above the track, never shown by position alone.
// - Screen readers treat it as adjustable: swipe up or down to move one step.
import RNSlider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';
import { colors, size, space, type } from '../theme/tokens';

export interface SliderProps {
  label: string;
  /** What the current value means, e.g. "80% · ₦680,000". Shown and read out. */
  valueText: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Words under each end of the track, e.g. "10%" and "150%". */
  minText?: string;
  maxText?: string;
  /** "onBrand" when the slider sits on a sky-blue (brand) card. */
  tone?: 'default' | 'onBrand';
}

export function Slider({ label, valueText, value, min, max, step, onChange, minText, maxText, tone = 'default' }: SliderProps) {
  const on = tone === 'onBrand';
  const ink = on ? { color: colors.onBrand } : null;
  return (
    <View style={styles.wrap}>
      <View style={styles.head} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={[styles.label, on && styles.labelOn, ink]}>{label}</Text>
        <Text style={[styles.value, ink]}>{valueText}</Text>
      </View>
      <RNSlider
        style={styles.track}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={(v) => onChange(Math.round(v / step) * step)}
        minimumTrackTintColor={on ? colors.onBrand : colors.primary}
        maximumTrackTintColor={on ? colors.brandMid : colors.line}
        thumbTintColor={on ? colors.onBrand : colors.primary}
        tapToSeek
        accessibilityLabel={label}
        accessibilityValue={{ text: valueText }}
      />
      {minText || maxText ? (
        <View style={styles.ends} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={[styles.end, ink]}>{minText}</Text>
          <Text style={[styles.end, ink]}>{maxText}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space[3], flexWrap: 'wrap' },
  label: { ...type.headline, color: colors.ink },
  labelOn: { ...type.label },
  value: { ...type.bodyStrong, color: colors.primary },
  track: { width: '100%', height: size.touchMin },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  end: { ...type.label, color: colors.inkMuted },
});
