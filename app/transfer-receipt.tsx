// S21 Transfer receipt (E3): partner reference, bank session ID, time
// completed and fee, for one transfer (v4, Figma "S21 Receipt"). "Share receipt"
// shares it as text for now (founder decision, 24 Nov 2026: image sharing later).
// Opened with ?event=<id>&ref=<transfer reference>, or ?ref=<reference> alone for
// a one-off transfer (B14 Send extra once, D13 Send to my account).
import { Share, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Clock, CornerDownRight, Send, X } from 'lucide-react-native';
import { Button, Screen, StatusBadge, badgeWords } from '../src/components';
import { formatNaira, maskAccount } from '../src/engine/format';
import { useBank } from '../src/fakebank/bankStore';
import { dayMonth } from '../src/lib/payDates';
import { timeText } from '../src/lib/splitText';
import { usePaydays } from '../src/payday/paydayStore';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../src/theme/tokens';

export default function TransferReceiptScreen() {
  const { event: eventId, ref } = useLocalSearchParams<{ event?: string; ref?: string }>();
  const router = useRouter();
  const event = usePaydays((s) => s.events.find((e) => e.id === eventId));
  const oneOff = usePaydays((s) => (eventId ? undefined : s.oneOffs.find((o) => o.reference === ref)));
  const b = useBank((s) => (ref ? s.bank.transfers[ref] : undefined));
  const account = useApp((s) => s.spreaditAccount);
  const tr = event?.transfers.find((x) => x.reference === ref) ?? oneOff;

  if (!tr) return <Redirect href="/income-history" />;

  const status = b?.status ?? 'Pending';
  const to = `${tr.destination.accountName} · ${tr.destination.bankName} ${maskAccount(tr.destination.accountNumber)}`;
  const when = b?.completedAt ? `${dayMonth(new Date(b.completedAt))}, ${timeText(b.completedAt)}` : 'Not completed yet';
  const rows: [string, string][] = [
    ['To', to],
    ['From', account ? `${account.accountName} · ${account.bankName} ${maskAccount(account.accountNumber)}` : 'Your SpreadIT account'],
    ['Fee', formatNaira(b?.feeKobo ?? tr.feeKobo)],
    ['Time', when],
    ['Reference', b?.partnerReference ?? 'Not sent yet'],
    ['Session ID', b?.sessionId ?? 'Given when the transfer completes'],
    ['Description', b?.narration ?? tr.name],
  ];
  if (status === 'Sent to fallback' || status === 'Failed') rows.push(['Reason', b?.failureReason ?? 'Didn’t go']);

  const share = () =>
    Share.share({
      message: [`SpreadIT transfer receipt`, `Amount: ${formatNaira(tr.amountKobo)}`, `Status: ${badgeWords[status]}`, ...rows.map(([k, v]) => `${k}: ${v}`)].join('\n'),
    });

  const good = status === 'Successful';
  const bad = status === 'Failed' || status === 'Reversed';
  const warn = status === 'Sent to fallback';
  const StatusIcon = good ? Check : bad ? X : warn ? CornerDownRight : Clock;

  return (
    <Screen
      title="Receipt"
      footer={
        <>
          <Button label="Share receipt" icon={Send} variant="secondary" accessibilityHint="Shares the receipt as text" onPress={share} />
          <Button
            label="Get help"
            variant="quiet"
            onPress={() => router.push(`/get-help?${event ? `event=${event.id}&` : ''}ref=${tr.reference}`)}
          />
        </>
      }
    >
      <View style={styles.card}>
        <View style={styles.hero} accessible accessibilityLabel={`${formatNaira(tr.amountKobo)} sent to ${tr.name}. Status: ${badgeWords[status]}`}>
          <View style={[styles.circle, good && styles.circleGood, bad && styles.circleBad, warn && styles.circleWarn]}>
            <StatusIcon size={size.iconLarge} color={good ? colors.onPrimary : bad ? colors.critical : warn ? colors.warning : colors.primary} strokeWidth={1.75} />
          </View>
          <Text style={styles.amount} adjustsFontSizeToFit numberOfLines={1}>
            {formatNaira(tr.amountKobo)}
          </Text>
          <Text style={styles.muted}>sent to {tr.name}</Text>
          <View style={styles.badge}>
            <StatusBadge state={status} />
          </View>
        </View>
        <View style={styles.hairline} />
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
            <Text style={styles.label}>{label}</Text>
            <Text
              style={styles.value}
              selectable
              numberOfLines={label === 'Session ID' || label === 'Reference' ? 1 : undefined}
              ellipsizeMode="middle"
            >
              {value}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[3], ...shadow.card },
  hero: { alignItems: 'center', gap: space[2], paddingVertical: space[2] },
  circle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[2],
  },
  circleGood: { backgroundColor: colors.primary },
  circleBad: { backgroundColor: colors.criticalSoft },
  circleWarn: { backgroundColor: colors.warningSoft },
  amount: { ...type.amountXl, color: colors.ink },
  badge: { alignSelf: 'center' },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space[4] },
  label: { ...type.label, color: colors.inkMuted, flexShrink: 0 },
  value: { ...type.bodyStrong, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  muted: { ...type.label, color: colors.inkMuted },
});
