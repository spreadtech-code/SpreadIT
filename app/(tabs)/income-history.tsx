// S19 Income history (E2), on the Activity tab: every income event, newest
// first, back to the first one. Opening one goes to S20. Also links to the
// monthly summary (S30).
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityList, Button, InsightCard, type ActivityItem } from '../../src/components';
import { floatingNavInset } from '../../src/components/FloatingNav';
import { dayMonth } from '../../src/lib/payDates';
import { timeText } from '../../src/lib/splitText';
import { stageText } from '../../src/payday/events';
import { usePaydays } from '../../src/payday/paydayStore';
import { colors, space, type } from '../../src/theme/tokens';

export default function IncomeHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const events = usePaydays((s) => s.events);
  const newestFirst = [...events].sort((a, b) => b.receivedAt - a.receivedAt);

  const items: ActivityItem[] = newestFirst.map((e) => ({
    id: e.id,
    name: e.sender,
    meta: `${dayMonth(new Date(e.receivedAt))}, ${timeText(e.receivedAt)} · ${stageText[e.stage]}`,
    direction: 'in',
    amountKobo: e.amountKobo,
    onPress: () => router.push(`/income-event?event=${e.id}`),
  }));

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4], paddingBottom: floatingNavInset(insets.bottom) }]}
    >
      <Text style={styles.title} accessibilityRole="header">
        Income history
      </Text>
      {items.length > 0 ? (
        <ActivityList title="Every payment in" items={items} />
      ) : (
        <InsightCard title="No income yet" text="Every payment into your SpreadIT account will be listed here, newest first." />
      )}
      <Button label="Monthly summary" variant="secondary" onPress={() => router.push('/monthly-summary')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: space[5], gap: space[4] },
  title: { ...type.title, color: colors.ink },
});
