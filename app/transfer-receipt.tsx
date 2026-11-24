// S21 Transfer receipt (E3): partner reference, bank session ID, time
// completed and fee, for one transfer. "Share receipt" shares it as text for
// now (founder decision, 24 Nov 2026: image sharing later).
// Opened with ?event=<id>&ref=<transfer reference>, or ?ref=<reference> alone for
// a one-off transfer (B14 Send extra once, D13 Send to my account).
import { Share, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Screen, StatusBadge } from '../src/components';
import { formatNaira, maskAccount } from '../src/engine/format';
import { useBank } from '../src/fakebank/bankStore';
import { dayMonth } from '../src/lib/payDates';
import { timeText } from '../src/lib/splitText';
import { usePaydays } from '../src/payday/paydayStore';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

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
  const to = `${tr.destination.accountName}, ${tr.destination.bankName} ${maskAccount(tr.destination.accountNumber)}`;
  const when = b?.completedAt ? `${dayMonth(new Date(b.completedAt))}, ${timeText(b.completedAt)}` : 'Not completed yet';
  const rows: [string, string][] = [
    ['To', to],
    ['From', account ? `${account.accountName}, ${account.bankName} ${maskAccount(account.accountNumber)}` : 'Your SpreadIT account'],
    ['Fee', formatNaira(b?.feeKobo ?? tr.feeKobo)],
    ['Time completed', when],
    ['Partner reference', b?.partnerReference ?? 'Not sent yet'],
    ['Session ID', b?.sessionId ?? 'Given when the transfer completes'],
    ['Description', b?.narration ?? tr.name],
  ];
  if (status === 'Sent to fallback' || status === 'Failed') rows.push(['Reason', b?.failureReason ?? 'Failed']);

  const share = () =>
    Share.share({
      message: [`SpreadIT transfer receipt`, `Amount: ${formatNaira(tr.amountKobo)}`, `Status: ${status}`, ...rows.map(([k, v]) => `${k}: ${v}`)].join('\n'),
    });

  return (
    <Screen
      title="Transfer receipt"
      footer={
        <>
          <Button label="Share receipt" variant="secondary" onPress={share} />
          <Text style={styles.note}>Shared as text for now.</Text>
          <Button
            label="Get help"
            variant="quiet"
            onPress={() => router.push(`/get-help?${event ? `event=${event.id}&` : ''}ref=${tr.reference}`)}
          />
        </>
      }
    >
      <View style={styles.hero} accessible accessibilityLabel={`${tr.name}, ${formatNaira(tr.amountKobo)}, status ${status}`}>
        <Text style={styles.muted}>{tr.name}</Text>
        <Text style={styles.amount}>{formatNaira(tr.amountKobo)}</Text>
        <StatusBadge state={status} />
      </View>
      <View style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
            <Text style={styles.muted}>{label}</Text>
            <Text style={styles.value} selectable>
              {value}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space[6], alignItems: 'center', gap: space[2], ...shadow.card },
  amount: { ...type.amountXl, color: colors.ink },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[4], ...shadow.card },
  row: { gap: space[1] },
  value: { ...type.bodyStrong, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
  note: { ...type.label, color: colors.inkMuted, textAlign: 'center' },
});
