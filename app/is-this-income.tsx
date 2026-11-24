// S18 Is this income? (D1): a payment below the qualifying minimum.
// - No: nothing is split; the money stays in the SpreadIT account.
// - Yes: an income event is created. Below 50% of expected it goes to S17
//   (D4); otherwise the review window starts (S16).
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Screen } from '../src/components';
import { formatNaira } from '../src/engine/format';
import { dayMonth } from '../src/lib/payDates';
import { answerIsThisIncome, eventRoute, getEvent, latestEvent, usePaydays } from '../src/payday/paydayStore';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

export default function IsThisIncomeScreen() {
  const router = useRouter();
  const { event: eventId } = useLocalSearchParams<{ event?: string }>();
  const events = usePaydays((s) => s.events);
  const minimum = useApp((s) => s.income?.qualifyingMinimumKobo ?? 0);
  const event = eventId ? events.find((e) => e.id === eventId) : latestEvent(events);

  if (!event) return <Redirect href="/home" />;
  if (event.stage !== 'askIncome') return <Redirect href={eventRoute(event) as never} />;

  const home = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/home');
  };

  return (
    <Screen
      title="Is this income?"
      footer={
        <>
          <Button
            label="Yes"
            variant="primary"
            accessibilityHint="Split it by your plan"
            onPress={() => {
              answerIsThisIncome(event.id, true);
              const next = getEvent(event.id)!;
              if (next.stage === 'tooSmall') home();
              else router.replace(eventRoute(next) as never);
            }}
          />
          <Button
            label="No"
            variant="secondary"
            accessibilityHint="Keep it in your SpreadIT account without splitting"
            onPress={() => {
              answerIsThisIncome(event.id, false);
              home();
            }}
          />
        </>
      }
    >
      <View style={styles.card} accessible>
        <Text style={styles.muted}>Received {dayMonth(new Date(event.receivedAt))}</Text>
        <Text style={styles.amount}>{formatNaira(event.amountKobo)}</Text>
        <Text style={styles.muted}>From {event.sender}</Text>
      </View>
      <Text style={styles.body}>
        This is less than your qualifying minimum of {formatNaira(minimum)}, so SpreadIT didn't split it.
      </Text>
      <Text style={styles.body}>Yes: split it by your plan. No: keep it in your SpreadIT account.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space[6], gap: space[1], alignItems: 'center', ...shadow.card },
  amount: { ...type.amountXl, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
