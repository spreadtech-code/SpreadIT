// Slider (added stage 4, founder-approved): drag to pick a value in steps.
// Used by the Payday Simulator's what-if slider (C5).
// - Built on @react-native-community/slider (works in Expo Go).
// - Track and thumb are brand-strong (deep teal), never aqua, so the one-aqua
//   rule holds next to a primary button.
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
}

export function Slider({ label, valueText, value, min, max, step, onChange, minText, maxText }: SliderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{valueText}</Text>
      </View>
      <RNSlider
        style={styles.track}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={(v) => onChange(Math.round(v / step) * step)}
        minimumTrackTintColor={colors.brandStrong}
        maximumTrackTintColor={colors.line}
        thumbTintColor={colors.brandStrong}
        tapToSeek
        accessibilityLabel={label}
        accessibilityValue={{ text: valueText }}
      />
      {minText || maxText ? (
        <View style={styles.ends} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.end}>{minText}</Text>
          <Text style={styles.end}>{maxText}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[1] },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space[3], flexWrap: 'wrap' },
  label: { ...type.headline, color: colors.ink },
  value: { ...type.bodyStrong, color: colors.brandStrong },
  track: { width: '100%', height: size.touchMin },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  end: { ...type.label, color: colors.inkMuted },
});
