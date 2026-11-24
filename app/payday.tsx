// S16 Payday screen (D2, D3, D6, D7).
// - In the review window: income received, every planned transfer with bank,
//   last 4 digits and amount, fees, and the countdown. "Execute now", "Pause for
//   review", "Emergency cancel". When the countdown ends, the transfers go out.
// - Paused: the same, with no countdown; nothing is sent until "Execute now".
// - Sending or done: each transfer's live status (Pending, Processing, Successful,
//   Retrying with the next try, Sent to fallback, Failed, Reversed).
// - Not split (cancelled, not income, too small): the money stays in the account.
// Opened with ?event=<id>; without it, the newest payday.
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityList, Button, PaydayCountdown, Screen, type PaydayAllocation } from '../src/components';
import { formatNaira, maskAccount } from '../src/engine/format';
import { dayMonth } from '../src/lib/payDates';
import { transferItems } from '../src/payday/transferItems';
import { useNow } from '../src/payday/PaydayRunner';
import {
  cancelEvent,
  eventRoute,
  executeEvent,
  holdEvent,
  latestEvent,
  usePaydays,
} from '../src/payday/paydayStore';
import { useBank } from '../src/fakebank/bankStore';
import { colors, space, type } from '../src/theme/tokens';

export default function PaydayScreen() {
  const router = useRouter();
  const { event: eventId } = useLocalSearchParams<{ event?: string }>();
  const events = usePaydays((s) => s.events);
  useBank((s) => s.bank); // re-render when a transfer's status changes
  const t = useNow();
  const event = eventId ? events.find((e) => e.id === eventId) : latestEvent(events);
  const home = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/home');
  };

  if (!event) {
    return (
      <Screen title="Payday" footer={<Button label="Back to Home" variant="secondary" onPress={home} />}>
        <Text style={styles.body}>No payday right now. When income arrives, it shows here.</Text>
      </Screen>
    );
  }
  if (event.stage === 'askIncome' || event.stage === 'needsApproval') return <Redirect href={eventRoute(event) as never} />;

  if (event.stage === 'review' || event.stage === 'held') {
    const secondsLeft = event.stage === 'review' && event.reviewEndsAt ? Math.max(0, (event.reviewEndsAt - t) / 1000) : null;
    const someShort = event.split.lines.some((l) => l.funding !== 'Fully funded');
    const allocations: PaydayAllocation[] = [
      ...event.split.lines.map((l) => {
        const rule = event.plan.rules.find((r) => r.id === l.ruleId);
        return {
          id: l.ruleId,
          name: l.name,
          amountKobo: l.amountKobo,
          meta: rule?.destination ? `${rule.destination.bankName} ${maskAccount(rule.destination.accountNumber)}` : 'To your fallback account',
          funding: someShort ? l.funding : undefined,
        };
      }),
      ...(event.split.remainder
        ? [
            {
              id: 'remainder',
              name: event.split.remainder.name,
              amountKobo: event.split.remainder.amountKobo,
              meta: event.plan.remainder?.destination
                ? `${event.plan.remainder.destination.bankName} ${maskAccount(event.plan.remainder.destination.accountNumber)}`
                : 'To your fallback account',
            },
          ]
        : []),
    ];
    return (
      <PaydayCountdown
        receivedKobo={event.amountKobo}
        secondsLeft={secondsLeft}
        allocations={allocations}
        feesKobo={event.split.totalFeesKobo}
        onExecute={async () => {
          await executeEvent(event.id);
        }}
        onPause={event.stage === 'review' ? () => holdEvent(event.id) : undefined}
        onCancel={() =>
          Alert.alert('Cancel this payday?', `Nothing will be sent. ${formatNaira(event.amountKobo)} stays in your SpreadIT account.`, [
            { text: 'Keep it', style: 'cancel' },
            {
              text: 'Emergency cancel',
              style: 'destructive',
              onPress: () => {
                cancelEvent(event.id);
                home();
              },
            },
          ])
        }
      />
    );
  }

  if (event.stage === 'sending' || event.stage === 'done') {
    return (
      <Screen
        title={event.stage === 'done' ? 'Payday split' : 'Sending your split'}
        subtitle={`${formatNaira(event.amountKobo)} received ${dayMonth(new Date(event.receivedAt))}`}
        footer={<Button label="Back to Home" variant="secondary" onPress={home} />}
      >
        <ActivityList title="Where it's going" items={transferItems(event, t)} />
        <Text style={styles.muted}>Bank fees: {formatNaira(event.split.totalFeesKobo)}</Text>
      </Screen>
    );
  }

  // cancelled, notIncome, tooSmall
  const why =
    event.stage === 'cancelled'
      ? 'You cancelled this payday. Nothing was sent.'
      : event.stage === 'notIncome'
        ? 'You said this isn\'t income, so it wasn\'t split.'
        : 'This payment is too small to split.';
  return (
    <Screen
      title="Not split"
      subtitle={`${formatNaira(event.amountKobo)} received ${dayMonth(new Date(event.receivedAt))}`}
      footer={
        <>
          <Button label="Send to my account" variant="secondary" onPress={() => router.push('/send-to-my-account')} />
          <Button label="Back to Home" variant="quiet" onPress={home} />
        </>
      }
    >
      <View style={styles.gap}>
        <Text style={styles.body}>{why}</Text>
        <Text style={styles.body}>The money is in your SpreadIT account.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: space[3] },
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
