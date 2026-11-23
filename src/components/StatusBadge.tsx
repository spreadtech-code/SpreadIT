// StatusBadge (docs/design-system.md): every transfer and funding state as a
// pill with an icon and a word. Colour never works alone.
import { StyleSheet, Text, View } from 'react-native';
import {
  CircleCheck,
  CircleDashed,
  CirclePause,
  CircleX,
  Clock,
  CornerDownRight,
  LoaderCircle,
  RefreshCw,
  SkipForward,
  Undo2,
  type LucideIcon,
} from 'lucide-react-native';
import { colors, component, radius, space, type } from '../theme/tokens';

export type BadgeState =
  | 'Successful'
  | 'Fully funded'
  | 'Processing'
  | 'Pending'
  | 'Sent to fallback'
  | 'Skipped'
  | 'Retrying'
  | 'Reversed'
  | 'Partly funded'
  | 'Failed'
  | 'Paused';

type Tone = 'success' | 'brand' | 'neutral' | 'warning' | 'critical';

const tones: Record<Tone, { fill: string; text: string }> = {
  success: { fill: colors.successSoft, text: colors.success },
  brand: { fill: colors.brandSoft, text: colors.brandStrong },
  neutral: { fill: colors.surfaceSunken, text: colors.ink },
  warning: { fill: colors.warningSoft, text: colors.warning },
  critical: { fill: colors.criticalSoft, text: colors.critical },
};

export const badgeStates: Record<BadgeState, { tone: Tone; Icon: LucideIcon }> = {
  Successful: { tone: 'success', Icon: CircleCheck },
  'Fully funded': { tone: 'success', Icon: CircleCheck },
  Processing: { tone: 'brand', Icon: LoaderCircle },
  Pending: { tone: 'neutral', Icon: Clock },
  'Sent to fallback': { tone: 'neutral', Icon: CornerDownRight },
  Skipped: { tone: 'neutral', Icon: SkipForward },
  Retrying: { tone: 'warning', Icon: RefreshCw },
  Reversed: { tone: 'warning', Icon: Undo2 },
  'Partly funded': { tone: 'warning', Icon: CircleDashed },
  Failed: { tone: 'critical', Icon: CircleX },
  Paused: { tone: 'critical', Icon: CirclePause },
};

export function StatusBadge({ state }: { state: BadgeState }) {
  const { tone, Icon } = badgeStates[state];
  const t = tones[tone];
  return (
    <View
      style={[styles.badge, { backgroundColor: t.fill }]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Status: ${state}`}
    >
      <Icon size={component.badgeIcon} color={t.text} strokeWidth={1.75} />
      <Text style={[styles.word, { color: t.text }]}>{state}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space[1],
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.pill,
  },
  word: { ...type.caption },
});
