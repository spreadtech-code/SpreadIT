// BalanceHero (docs/design-system.md v3): the top of Home, from the home
// reference. A black card with a soft sheen (expo-linear-gradient), white text.
// - Top row: the user's initials (left), the "SpreadIT" wordmark (centre) and a
//   round Settings button (right).
// - A muted label, then the amount in amount-xl with kobo on the baseline.
// - Actions: dark glossy pills either side of a round "+" (RoundAction). With 3
//   actions the middle one is the round button; otherwise all are pills.
// - The status pill at the bottom: a dot and the automation status. The dot is
//   aqua when on (the one aqua accent), critical when paused, grey when off.
// Prototype only: holding the wordmark for 1 second opens the hidden Demo controls.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings } from 'lucide-react-native';
import { colors, component, fonts, gradients, radius, size, space, type } from '../theme/tokens';
import { formatNaira, nairaParts } from '../engine/format';
import { RoundAction, type RoundActionProps } from './RoundAction';

export interface BalanceHeroProps {
  initials: string;
  /** e.g. "Last payday · 25 November". */
  label: string;
  amountKobo: number;
  actions: RoundActionProps[];
  /** off: automation not switched on yet (grey dot, the given text). */
  automation: { paused: false; text: string; off?: boolean } | { paused: true };
  onWordmarkLongPress?: () => void;
  onSettingsPress?: () => void;
}

export function BalanceHero({ initials, label, amountKobo, actions, automation, onWordmarkLongPress, onSettingsPress }: BalanceHeroProps) {
  const parts = nairaParts(amountKobo);
  const statusText = automation.paused ? 'Automation paused' : automation.text;
  const dot = automation.paused ? colors.critical : automation.off ? colors.onInverseMuted : colors.brand;
  const roundIndex = actions.length === 3 ? 1 : -1;

  return (
    <LinearGradient colors={gradients.hero} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar} accessible accessibilityLabel={`Profile, ${initials}`}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <Pressable onLongPress={onWordmarkLongPress} delayLongPress={1000} disabled={!onWordmarkLongPress}>
          <Text style={styles.wordmark} accessibilityRole="header">
            SpreadIT
          </Text>
        </Pressable>
        {onSettingsPress ? (
          <Pressable onPress={onSettingsPress} accessibilityRole="button" accessibilityLabel="Settings" style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Settings size={size.icon} color={colors.onInverse} strokeWidth={1.75} />
          </Pressable>
        ) : (
          <View style={styles.iconButtonSpace} />
        )}
      </View>

      <View style={styles.centre} accessible accessibilityLabel={`${label}. ${formatNaira(amountKobo)}`}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.amount} adjustsFontSizeToFit numberOfLines={1}>
          {parts.sign}
          {parts.naira}
          <Text style={styles.kobo}>.{parts.kobo}</Text>
        </Text>
      </View>

      <View style={styles.actions}>
        {actions.map((a, i) => (i === roundIndex ? <RoundAction key={a.label} {...a} /> : <HeroPill key={a.label} {...a} />))}
      </View>

      <View style={styles.status} accessible accessibilityRole="text" accessibilityLabel={statusText}>
        <View style={[styles.dot, { backgroundColor: dot }]} />
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    </LinearGradient>
  );
}

/** A dark glossy pill with an icon and a word, on the black hero. */
function HeroPill({ label, Icon, onPress, accessibilityLabel }: RoundActionProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} style={({ pressed }) => [styles.pillWrap, pressed && styles.pressed]}>
      <LinearGradient colors={gradients.pill} style={styles.pill}>
        <Icon size={size.icon} color={colors.onInverse} strokeWidth={1.75} />
        <Text style={styles.pillText} numberOfLines={1}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    paddingTop: space[4],
    paddingBottom: space[5],
    paddingHorizontal: space[4],
    gap: space[6],
    alignItems: 'stretch',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: {
    width: size.iconCircle,
    height: size.iconCircle,
    borderRadius: radius.pill,
    backgroundColor: colors.inverseRaised,
    borderWidth: 1,
    borderColor: colors.inverseLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...type.caption, color: colors.onInverse },
  wordmark: { ...type.headline, fontFamily: fonts.bold, color: colors.onInverse },
  iconButton: {
    width: size.touchMin,
    height: size.touchMin,
    borderRadius: radius.pill,
    backgroundColor: colors.inverseRaised,
    borderWidth: 1,
    borderColor: colors.inverseLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonSpace: { width: size.touchMin, height: size.touchMin },
  centre: { alignItems: 'center', gap: space[1] },
  label: { ...type.label, color: colors.onInverseMuted, textAlign: 'center' },
  amount: { ...type.amountXl, color: colors.onInverse, textAlign: 'center', fontVariant: ['tabular-nums'] },
  kobo: { ...component.koboText, color: colors.onInverseMuted },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[3] },
  pillWrap: { flexShrink: 1 },
  pill: {
    minHeight: size.heroPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.inverseLine,
  },
  pillText: { ...type.label, fontFamily: fonts.semibold, color: colors.onInverse, flexShrink: 1 },
  status: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: size.touchMin - space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    backgroundColor: colors.inverseRaised,
    borderWidth: 1,
    borderColor: colors.inverseLine,
  },
  dot: { width: space[2], height: space[2], borderRadius: radius.pill },
  statusText: { ...type.label, color: colors.onInverse, flexShrink: 1 },
  pressed: { opacity: 0.75 },
});
