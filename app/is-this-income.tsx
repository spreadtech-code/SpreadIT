// S18 Is this income? (D1), shown as "Is this pay?": a payment below the qualifying minimum.
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
import { colors, radius, space, type } from '../src/theme/tokens';

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
      title="Is this pay?"
      subtitle="Something landed that’s smaller than usual."
      footer={
        <>
          <Button
            label="Yes, split it"
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
            label="No, keep it"
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
      <View
        style={styles.card}
        accessible
        accessibilityLabel={`Landed ${dayMonth(new Date(event.receivedAt))}. ${formatNaira(event.amountKobo)}. From ${event.sender}.`}
      >
        <Text style={styles.small}>Landed {dayMonth(new Date(event.receivedAt))}</Text>
        <Text style={styles.amount} adjustsFontSizeToFit numberOfLines={1}>
          {formatNaira(event.amountKobo)}
        </Text>
        <Text style={styles.small}>From {event.sender}</Text>
      </View>
      <Text style={styles.body}>
        It’s under your {formatNaira(minimum)} minimum, so we haven’t split it. Tell us what it is.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.brandSoft, borderRadius: radius.lg, padding: space[6], gap: space[1], alignItems: 'center' },
  amount: { ...type.amountXl, color: colors.onBrand },
  small: { ...type.label, color: colors.onBrand },
  body: { ...type.body, color: colors.inkMuted },
});
