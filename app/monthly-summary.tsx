// S30 Monthly summary (E4): last month's totals, worked out from the income
// history so they match it to the kobo: total received, sent per category,
// fees, family payments delivered on payday, savings sent since joining.
// "Share" hides amounts by default; shared as text for now (founder decision,
// 24 Nov 2026). "This month so far" is a prototype extra so demo paydays show.
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Screen, SegmentedControl, Toggle } from '../src/components';
import { formatNaira } from '../src/engine/format';
import { useBank } from '../src/fakebank/bankStore';
import { useNow } from '../src/payday/PaydayRunner';
import { usePaydays } from '../src/payday/paydayStore';
import { monthlySummary, previousMonth, summaryShareText } from '../src/payday/summary';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

export default function MonthlySummaryScreen() {
  const router = useRouter();
  const events = usePaydays((s) => s.events);
  const transfers = useBank((s) => s.bank.transfers);
  const t = useNow();
  const [which, setWhich] = useState<'last' | 'this'>('last');
  const [showAmounts, setShowAmounts] = useState(false);

  const month = which === 'last' ? previousMonth(t) : { year: new Date(t).getFullYear(), month: new Date(t).getMonth() };
  const s = monthlySummary(events, transfers, month.year, month.month);
  const empty = s.paymentsCount === 0 && s.sentTotalKobo === 0;

  return (
    <Screen
      title="Monthly summary"
      subtitle={which === 'last' ? s.label : `${s.label} so far`}
      footer={
        <>
          <Toggle
            label="Show amounts when sharing"
            description="Off: amounts are hidden in what you share."
            value={showAmounts}
            onValueChange={setShowAmounts}
          />
          <Button label="Share" variant="secondary" onPress={() => Share.share({ message: summaryShareText(s, showAmounts) })} />
          <Button
            label="Back to Home"
            variant="quiet"
            onPress={() => {
              if (router.canDismiss()) router.dismissAll();
              router.navigate('/home');
            }}
          />
        </>
      }
    >
      <SegmentedControl
        accessibilityLabel="Which month"
        options={[
          { value: 'last', label: 'Last month' },
          { value: 'this', label: 'This month so far' },
        ]}
        value={which}
        onChange={setWhich}
      />

      <View style={styles.hero} accessible accessibilityLabel={`Received ${formatNaira(s.receivedKobo)} in ${s.paymentsCount} payments`}>
        <Text style={styles.muted}>Received</Text>
        <Text style={styles.amount}>{formatNaira(s.receivedKobo)}</Text>
        <Text style={styles.muted}>
          {s.paymentsCount} {s.paymentsCount === 1 ? 'payment' : 'payments'}
        </Text>
      </View>

      {empty ? (
        <Text style={styles.body}>Nothing came in this month.</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.heading}>Sent</Text>
          {s.sentByCategory.map((l) => (
            <Row key={l.name} label={l.name} value={formatNaira(l.kobo)} />
          ))}
          {s.sentToFallbackKobo > 0 ? <Row label="To your fallback account" value={formatNaira(s.sentToFallbackKobo)} /> : null}
          <View style={styles.hairline} />
          <Row label="Total sent" value={formatNaira(s.sentTotalKobo + s.sentToFallbackKobo)} strong />
        </View>
      )}

      <View style={styles.card}>
        <Row label="Bank fees" value={formatNaira(s.feesKobo)} />
        <Row label="Family payments delivered on payday" value={String(s.familyPaymentsDelivered)} />
        <Row label="Savings sent since you joined" value={formatNaira(s.savingsSinceJoinedKobo)} />
      </View>
    </Screen>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={strong ? styles.strong : styles.body}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space[6], alignItems: 'center', gap: space[1], ...shadow.card },
  amount: { ...type.amountXl, color: colors.ink },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[3], ...shadow.card },
  heading: { ...type.titleSm, color: colors.ink },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3] },
  body: { ...type.body, color: colors.ink, flex: 1 },
  strong: { ...type.bodyStrong, color: colors.ink, flex: 1 },
  value: { ...type.amountMd, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
});
