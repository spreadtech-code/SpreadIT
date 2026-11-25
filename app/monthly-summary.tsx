// S30 Monthly summary (E4), shown as "Your <month>" recap (v4): last month's totals, worked out from the income
// history so they match it to the kobo: total received, sent per category,
// fees, family payments delivered on payday, savings sent since joining.
// "Share" hides amounts by default; shared as text for now (founder decision,
// 24 Nov 2026). "This month so far" is a prototype extra so demo paydays show.
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { Send } from 'lucide-react-native';
import { Button, Chip, InfoRow, Notice, Screen, SectionHeader, SplitLegend, Toggle, feeColour, leftoverColour, type SplitSlice } from '../src/components';
import { formatNaira } from '../src/engine/format';
import { useBank } from '../src/fakebank/bankStore';
import { useNow } from '../src/payday/PaydayRunner';
import { usePaydays } from '../src/payday/paydayStore';
import { monthlySummary, previousMonth, summaryShareText } from '../src/payday/summary';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

export default function MonthlySummaryScreen() {
  const events = usePaydays((s) => s.events);
  const oneOffs = usePaydays((s) => s.oneOffs);
  const transfers = useBank((s) => s.bank.transfers);
  const t = useNow();
  const [which, setWhich] = useState<'last' | 'this'>('last');
  const [showAmounts, setShowAmounts] = useState(false);

  const month = which === 'last' ? previousMonth(t) : { year: new Date(t).getFullYear(), month: new Date(t).getMonth() };
  const s = monthlySummary(events, transfers, month.year, month.month, oneOffs);
  const empty = s.paymentsCount === 0 && s.sentTotalKobo === 0;

  const monthName = s.label.split(' ')[0];
  const slices: SplitSlice[] = [
    ...s.sentByCategory.map((l) => ({ id: l.name, name: l.name, amountKobo: l.kobo })),
    ...(s.sentToFallbackKobo > 0 ? [{ id: 'backup', name: 'To your backup account', amountKobo: s.sentToFallbackKobo, colour: leftoverColour }] : []),
    { id: 'fees', name: 'Bank fees', amountKobo: s.feesKobo, colour: feeColour },
  ];

  return (
    <Screen
      title={`Your ${monthName}`}
      subtitle={which === 'last' ? 'A quick look at what SpreadIT did last month.' : 'A quick look at this month so far.'}
      footer={
        <>
          <Toggle
            label="Show amounts when sharing"
            description="Off keeps your numbers private."
            value={showAmounts}
            onValueChange={setShowAmounts}
          />
          <Button
            label="Share my recap"
            icon={Send}
            variant="primary"
            accessibilityHint="Shares it as text"
            onPress={() => Share.share({ message: summaryShareText(s, showAmounts) })}
          />
        </>
      }
    >
      <View style={styles.chips}>
        <Chip label="Last month" selected={which === 'last'} onPress={() => setWhich('last')} />
        <Chip label="This month so far" selected={which === 'this'} onPress={() => setWhich('this')} />
      </View>

      <View style={styles.hero} accessible accessibilityLabel={`Received ${formatNaira(s.receivedKobo)} in ${s.paymentsCount} ${s.paymentsCount === 1 ? 'payday' : 'paydays'}`}>
        <Text style={styles.onBrandSmall}>Received</Text>
        <Text style={styles.amount} adjustsFontSizeToFit numberOfLines={1}>
          {formatNaira(s.receivedKobo)}
        </Text>
        <Text style={styles.onBrandSmall}>
          {s.paymentsCount} {s.paymentsCount === 1 ? 'payday' : 'paydays'} · split automatically
        </Text>
      </View>

      {empty ? (
        <Notice text="Nothing came in this month." />
      ) : (
        <View style={styles.card}>
          <SectionHeader title="Where it went" />
          <SplitLegend slices={slices} />
        </View>
      )}

      <View style={styles.well}>
        <InfoRow label="Family paid on payday" value={String(s.familyPaymentsDelivered)} />
        <InfoRow label="Bank fees" value={formatNaira(s.feesKobo)} />
        <InfoRow label="Saved since you joined" value={formatNaira(s.savingsSinceJoinedKobo)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: space[2], flexWrap: 'wrap' },
  hero: { backgroundColor: colors.brand, borderRadius: radius.lg, padding: space[5], gap: space[1] },
  onBrandSmall: { ...type.label, color: colors.onBrand },
  amount: { ...type.amountXl, color: colors.onBrand },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[4], gap: space[2], ...shadow.card },
  well: { backgroundColor: colors.surfaceSunken, borderRadius: radius.lg, padding: space[4], gap: space[1] },
});
