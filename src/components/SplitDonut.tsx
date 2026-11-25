// SplitDonut (docs/design-system.md v4, Figma "Where it went"): where a payday
// went, as a donut of slices in priority order with the total in the middle, and a
// legend of coloured dots with exact amounts underneath. The donut is decorative
// (hidden from screen readers); the legend carries every number in words.
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { chartColors, colors, component, radius, size, space, type } from '../theme/tokens';
import { formatNaira } from '../engine/format';

export interface SplitSlice {
  id: string;
  name: string;
  amountKobo: number;
  /** Overrides the slice colour, e.g. grey for bank fees. */
  colour?: string;
}

export interface SplitDonutProps {
  slices: SplitSlice[];
  /** Big line in the middle, e.g. "₦850,000". Defaults to the total. */
  centre?: string;
  /** Small line under it, e.g. "split 7 ways". */
  caption?: string;
  /** Diameter in points. */
  diameter?: number;
}

/** Rule slices cycle through the five teal shades; the two greys are kept for
 *  the leftovers (light grey) and bank fees (mid grey). */
export function sliceColour(index: number): string {
  return chartColors[index % (chartColors.length - 2)];
}

export const leftoverColour: string = chartColors[chartColors.length - 2];
export const feeColour: string = chartColors[chartColors.length - 1];

export function SplitDonut({ slices, centre, caption, diameter = size.donut }: SplitDonutProps) {
  const total = slices.reduce((s, x) => s + Math.max(0, x.amountKobo), 0);
  const stroke = diameter * component.donutThickness * 0.5;
  const r = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const gap = slices.filter((s) => s.amountKobo > 0).length > 1 ? 3 : 0;
  let offset = 0;

  return (
    <View style={styles.wrap}>
      <View style={{ width: diameter, height: diameter }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`} style={styles.rotate}>
          <Circle cx={diameter / 2} cy={diameter / 2} r={r} stroke={colors.surfaceSunken} strokeWidth={stroke} fill="none" />
          {total > 0
            ? slices.map((s, i) => {
                const len = (Math.max(0, s.amountKobo) / total) * circumference;
                const dash = Math.max(0, len - gap);
                const el = (
                  <Circle
                    key={s.id}
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={r}
                    stroke={s.colour ?? sliceColour(i)}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                  />
                );
                offset += len;
                return el;
              })
            : null}
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.centre]}>
          <Text style={styles.total}>{centre ?? formatNaira(total)}</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      </View>
    </View>
  );
}

/** The legend under a donut: coloured dot, name, exact amount. Read out row by row. */
export function SplitLegend({ slices }: { slices: SplitSlice[] }) {
  return (
    <View style={styles.legend}>
      {slices.map((s, i) => (
        <View key={s.id} style={styles.legendRow} accessible accessibilityLabel={`${s.name}, ${formatNaira(s.amountKobo)}`}>
          <View style={[styles.legendDot, { backgroundColor: s.colour ?? sliceColour(i) }]} />
          <Text style={styles.legendName} numberOfLines={1}>
            {s.name}
          </Text>
          <Text style={styles.legendAmount}>{formatNaira(s.amountKobo)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  rotate: { transform: [{ rotate: '-90deg' }] },
  centre: { alignItems: 'center', justifyContent: 'center' },
  total: { ...type.headline, color: colors.ink },
  caption: { ...type.label, color: colors.inkMuted },
  legend: { gap: space[1] },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 36 },
  legendDot: { width: 10, height: 10, borderRadius: radius.pill },
  legendName: { ...type.body, color: colors.ink, flex: 1 },
  legendAmount: { ...type.bodyStrong, color: colors.ink, fontVariant: ['tabular-nums'] },
});
