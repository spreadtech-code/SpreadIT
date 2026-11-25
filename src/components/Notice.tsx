// Notice (docs/design-system.md v4, Figma "Notice"): a soft, rounded one-line message
// with an icon. Tones: info (pale aqua, deep teal), warning (amber), critical (red).
// The words always say what happened; the colour only backs them up.
import { StyleSheet, Text, View } from 'react-native';
import { CircleX, Info, TriangleAlert } from 'lucide-react-native';
import { colors, radius, size, space, type } from '../theme/tokens';

export type NoticeTone = 'info' | 'warning' | 'critical';

const tones = {
  info: { fill: colors.brandSoft, text: colors.primary, Icon: Info },
  warning: { fill: colors.warningSoft, text: colors.warning, Icon: TriangleAlert },
  critical: { fill: colors.criticalSoft, text: colors.critical, Icon: CircleX },
} as const;

export function Notice({ text, tone = 'info' }: { text: string; tone?: NoticeTone }) {
  const t = tones[tone];
  return (
    <View
      style={[styles.box, { backgroundColor: t.fill }]}
      accessible
      accessibilityRole={tone === 'info' ? 'text' : 'alert'}
      accessibilityLabel={text}
    >
      <t.Icon size={size.icon} color={t.text} strokeWidth={1.75} />
      <Text style={[styles.text, { color: t.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.md,
    minHeight: size.touchMin,
  },
  text: { ...type.label, flex: 1 },
});
