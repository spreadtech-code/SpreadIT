// BalanceHero (docs/design-system.md v4, Figma "S15 Home"): the top of Home on the
// white page — no card.
// - Greeting ("Hi, Tunde") with a one-line status under it, and a round bell on the right.
// - A muted label ("Last payday · 25 November"), then the amount, large and regular
//   weight, with faint kobo on the baseline.
// - The autopilot chip: a pale-aqua pill with a dot (deep teal when on, red when
//   paused, grey when off) and words.
// - Actions: a deep-teal button, an aqua button and a round pale-aqua "+".
// Prototype only: holding the greeting for 1 second opens the hidden Demo controls.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, type LucideIcon } from 'lucide-react-native';
import { colors, component, radius, size, space, type } from '../theme/tokens';
import { formatNaira, nairaParts } from '../engine/format';
import { Button } from './Button';

export interface HeroAction {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
}

export interface BalanceHeroProps {
  /** e.g. "Hi, Tunde". */
  greeting: string;
  /** One short line under the greeting, e.g. "Payday’s done. Everything’s sent." */
  status: string;
  /** e.g. "Last payday · 25 November". */
  label: string;
  amountKobo: number;
  /** Up to three: the first is deep teal, the second aqua, the third a round button. */
  actions: HeroAction[];
  /** The chip under the amount. */
  autopilot: { state: 'on' | 'paused' | 'off'; text: string };
  onGreetingLongPress?: () => void;
  onBellPress?: () => void;
}

export function BalanceHero({ greeting, status, label, amountKobo, actions, autopilot, onGreetingLongPress, onBellPress }: BalanceHeroProps) {
  const parts = nairaParts(amountKobo);
  const dot = autopilot.state === 'on' ? colors.primary : autopilot.state === 'paused' ? colors.critical : colors.inkFaint;
  const chipFill = autopilot.state === 'paused' ? colors.criticalSoft : colors.brandSoft;
  const chipText = autopilot.state === 'paused' ? colors.critical : colors.primary;
  const [first, second, round] = actions;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Pressable onLongPress={onGreetingLongPress} delayLongPress={1000} disabled={!onGreetingLongPress} style={styles.greeting}>
          <Text style={styles.hello} accessibilityRole="header">
            {greeting}
          </Text>
          <Text style={styles.status}>{status}</Text>
        </Pressable>
        {onBellPress ? (
          <Pressable onPress={onBellPress} accessibilityRole="button" accessibilityLabel="Notifications" style={({ pressed }) => [styles.bell, pressed && styles.pressed]}>
            <Bell size={size.icon} color={colors.ink} strokeWidth={1.75} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.balance} accessible accessibilityLabel={`${label}. ${formatNaira(amountKobo)}. ${autopilot.text}`}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.amount} adjustsFontSizeToFit numberOfLines={1}>
          {parts.sign}
          {parts.naira}
          <Text style={styles.kobo}>.{parts.kobo}</Text>
        </Text>
        <View style={[styles.chip, { backgroundColor: chipFill }]}>
          <View style={[styles.dot, { backgroundColor: dot }]} />
          <Text style={[styles.chipText, { color: chipText }]}>{autopilot.text}</Text>
        </View>
      </View>

      {actions.length > 0 ? (
        <View style={styles.actions}>
          {first ? <View style={styles.flex}><Button label={first.label} icon={first.Icon} variant="primary" compact onPress={first.onPress} /></View> : null}
          {second ? <View style={styles.flex}><Button label={second.label} icon={second.Icon} variant="accent" compact onPress={second.onPress} /></View> : null}
          {round ? (
            <Pressable onPress={round.onPress} accessibilityRole="button" accessibilityLabel={round.label} style={({ pressed }) => [styles.round, pressed && styles.pressed]}>
              <round.Icon size={24} color={colors.primary} strokeWidth={1.75} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[6] },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  greeting: { flex: 1, gap: space[1] },
  hello: { ...type.titleSm, color: colors.ink },
  status: { ...type.label, color: colors.inkMuted },
  bell: {
    width: size.bubble,
    height: size.bubble,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: { gap: space[2], alignItems: 'flex-start' },
  label: { ...type.label, color: colors.inkMuted },
  amount: { ...type.amountXl, color: colors.ink, fontVariant: ['tabular-nums'] },
  kobo: { ...component.koboText, color: colors.inkFaint },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    minHeight: 32,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
  },
  dot: { width: space[2], height: space[2], borderRadius: radius.pill },
  chipText: { ...type.labelStrong, flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  flex: { flex: 1 },
  round: {
    width: size.buttonHeight,
    height: size.buttonHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
});
