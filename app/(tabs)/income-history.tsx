// S19 Income history (E2), shown as "Activity" (v4, Figma "S19 Activity"): every
// payday, newest first, back to the first one, grouped by month. Chips filter
// All / Paydays / Sent (one-off transfers: send extra B14, move to your account
// D13). Opening a payday goes to S20, a one-off to its receipt (S21). Also links
// to the monthly recap (S30).
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { ActivityList, Button, Chip, InsightCard, type ActivityItem } from '../../src/components';
import { floatingNavInset } from '../../src/components/FloatingNav';
import { dayMonth } from '../../src/lib/payDates';
import { timeText } from '../../src/lib/splitText';
import { stageText } from '../../src/payday/events';
import { bankTransfer, usePaydays } from '../../src/payday/paydayStore';
import { colors, layout, space, type } from '../../src/theme/tokens';

type Filter = 'all' | 'paydays' | 'sent';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function IncomeHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const events = usePaydays((s) => s.events);
  const oneOffs = usePaydays((s) => s.oneOffs);
  const [filter, setFilter] = useState<Filter>('all');

  const paydays = events.map((e) => {
    const ways = e.transfers.length + (e.split.totalFeesKobo > 0 && e.transfers.length > 0 ? 1 : 0);
    return {
      at: e.receivedAt,
      item: {
        id: e.id,
        name: e.stage === 'done' || e.stage === 'sending' ? `Payday · split ${ways} ways` : 'Payday',
        meta: `${dayMonth(new Date(e.receivedAt))}, ${timeText(e.receivedAt)} · ${stageText[e.stage]}`,
        direction: 'in' as const,
        amountKobo: e.amountKobo,
        onPress: () => router.push(`/income-event?event=${e.id}`),
      },
    };
  });
  const sent = oneOffs.map((o) => ({
    at: o.createdAt,
    item: {
      id: o.reference,
      name: o.kind === 'extra' ? `Extra for ${o.name}` : o.name,
      meta: `${dayMonth(new Date(o.createdAt))}, ${timeText(o.createdAt)}`,
      direction: 'out' as const,
      amountKobo: o.amountKobo,
      status: bankTransfer(o.reference)?.status ?? 'Pending',
      Icon: Send,
      onPress: () => router.push(`/transfer-receipt?ref=${o.reference}`),
    },
  }));

  const rows = (filter === 'paydays' ? paydays : filter === 'sent' ? sent : [...paydays, ...sent]).sort((a, b) => b.at - a.at);

  // Group by month, newest first.
  const groups: { key: string; title: string; items: ActivityItem[] }[] = [];
  for (const r of rows) {
    const d = new Date(r.at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const thisYear = d.getFullYear() === new Date().getFullYear();
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, title: thisYear ? MONTHS[d.getMonth()] : `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, items: [] };
      groups.push(g);
    }
    g.items.push(r.item);
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4], paddingBottom: floatingNavInset(insets.bottom) }]}
    >
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Activity
        </Text>
        <Text style={styles.subtitle}>Every payday, newest first.</Text>
      </View>

      <View style={styles.chips} accessibilityRole="tablist">
        <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Paydays" selected={filter === 'paydays'} onPress={() => setFilter('paydays')} />
        <Chip label="Sent" selected={filter === 'sent'} onPress={() => setFilter('sent')} />
      </View>

      {groups.length > 0 ? (
        groups.map((g) => <ActivityList key={g.key} title={g.title} items={g.items} small />)
      ) : (
        <InsightCard
          title={filter === 'sent' ? 'Nothing sent yet' : 'No paydays yet'}
          text={
            filter === 'sent'
              ? 'Money you send extra or move to your account shows here.'
              : 'Every payment into your SpreadIT account will show here, newest first.'
          }
        />
      )}
      <Button label="See your monthly recap" variant="secondary" onPress={() => router.push('/monthly-summary')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.screenPadding, gap: space[5] },
  head: { gap: space[2] },
  title: { ...type.title, color: colors.ink },
  subtitle: { ...type.body, color: colors.inkMuted },
  chips: { flexDirection: 'row', gap: space[2] },
});
