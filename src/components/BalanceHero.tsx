// BalanceHero (docs/design-system.md): the top of Home. One large white card
// (radius-xl), everything centred.
// - Top row: SpreadIT wordmark left, the user's initials in a circle right.
// - A muted label, then the amount in amount-xl with kobo at 18px on the baseline.
// - RoundActions under the amount.
// - The callout: a brand-mid pill hanging half off the card's bottom edge with
//   the automation status. Paused shows "Automation paused" with a critical dot.
// Founder decision (stage 1b): on Home the nav pill is the one aqua element, so
// the avatar uses brand-mid and the "on" dot uses brand-strong.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, component, fonts, radius, shadow, size, space, type } from '../theme/tokens';
import { formatNaira, nairaParts } from '../engine/format';
import { RoundAction, type RoundActionProps } from './RoundAction';

export interface BalanceHeroProps {
  initials: string;
  /** e.g. "Last payday · 25 November". */
  label: string;
  amountKobo: number;
  actions: RoundActionProps[];
  /** off: automation not switched on yet (muted dot, the given text). */
  automation: { paused: false; text: string; off?: boolean } | { paused: true };
}

export function BalanceHero({ initials, label, amountKobo, actions, automation }: BalanceHeroProps) {
  const [calloutHeight, setCalloutHeight] = useState(0);
  const parts = nairaParts(amountKobo);
  const calloutText = automation.paused ? 'Automation paused' : automation.text;

  return (
    // "Leave 40px under the card": the callout's lower half sits inside that space.
    <View style={[styles.wrap, { paddingBottom: Math.max(0, space[8] + space[2] - calloutHeight / 2) }]}>
      <View style={[styles.card, { paddingBottom: space[6] + calloutHeight / 2 }]}>
        <View style={styles.topRow}>
          <Text style={styles.wordmark} accessibilityRole="header">
            SpreadIT
          </Text>
          <View style={styles.avatar} accessible accessibilityLabel={`Profile, ${initials}`}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        </View>

        <View style={styles.centre} accessible accessibilityLabel={`${label}. ${formatNaira(amountKobo)}`}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.amount}>
            {parts.sign}
            {parts.naira}
            <Text style={styles.kobo}>.{parts.kobo}</Text>
          </Text>
        </View>

        <View style={styles.actions}>
          {actions.map((a) => (
            <RoundAction key={a.label} {...a} />
          ))}
        </View>
      </View>

      <View
        onLayout={(e) => setCalloutHeight(e.nativeEvent.layout.height)}
        style={[styles.callout, { marginTop: -calloutHeight / 2 }]}
        accessible
        accessibilityRole="text"
        accessibilityLabel={calloutText}
      >
        <View
          style={[
            styles.dot,
            {
              backgroundColor: automation.paused
                ? colors.critical
                : automation.off
                  ? colors.inkMuted
                  : colors.brandStrong,
            },
          ]}
        />
        <Text style={styles.calloutText}>{calloutText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'stretch' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingTop: space[5],
    paddingHorizontal: space[5],
    gap: space[5],
    ...shadow.card,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { ...type.titleSm, fontFamily: fonts.extrabold, color: colors.ink },
  avatar: {
    width: size.iconCircle,
    height: size.iconCircle,
    borderRadius: radius.pill,
    backgroundColor: colors.brandMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...type.caption, color: colors.ink },
  centre: { alignItems: 'center', gap: space[1] },
  label: { ...type.label, color: colors.inkMuted, textAlign: 'center' },
  amount: { ...type.amountXl, color: colors.ink, textAlign: 'center', fontVariant: ['tabular-nums'] },
  kobo: { ...component.koboText, color: colors.ink },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: space[8] },
  callout: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.brandMid,
    borderRadius: radius.pill,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    marginHorizontal: space[5],
  },
  dot: { width: space[2], height: space[2], borderRadius: radius.pill },
  calloutText: { ...type.label, color: colors.ink, flexShrink: 1 },
});
