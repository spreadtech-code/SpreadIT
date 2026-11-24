// S20 Income event detail (E2, D8): the full split, fees, funding labels,
// transfer statuses, partner references and times.
// - "Send again" on a Failed or Reversed transfer asks for the PIN, then sends
//   the same amount to the same account from the SpreadIT balance (D8).
// - "Open receipt" (tap a transfer) goes to S21. "Get help" goes to S25.
// Opened with ?event=<id>.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityList, Button, FieldError, PinField, PIN_LENGTH, Screen, Sheet, StatusBadge } from '../src/components';
import { formatNaira } from '../src/engine/format';
import { useBank } from '../src/fakebank/bankStore';
import { dayMonth } from '../src/lib/payDates';
import { timeText } from '../src/lib/splitText';
import { stageText, type EventTransfer } from '../src/payday/events';
import { useNow } from '../src/payday/PaydayRunner';
import { bankTransfer, CAN_SEND_AGAIN, eventRoute, sendAgain, usePaydays } from '../src/payday/paydayStore';
import { transferItems } from '../src/payday/transferItems';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

export default function IncomeEventScreen() {
  const router = useRouter();
  const { event: eventId } = useLocalSearchParams<{ event?: string }>();
  const event = usePaydays((s) => s.events.find((e) => e.id === eventId));
  useBank((s) => s.bank.transfers); // re-render when a status changes
  const t = useNow();
  const enterPin = useApp((s) => s.enterPin);

  const [resend, setResend] = useState<EventTransfer | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!event) return <Redirect href="/income-history" />;

  const { split } = event;
  const transferFees = event.transfers.reduce((s, tr) => s + (bankTransfer(tr.reference)?.feeKobo ?? tr.feeKobo), 0);
  const canResend = event.transfers.filter((tr) => {
    const status = bankTransfer(tr.reference)?.status;
    return status && CAN_SEND_AGAIN.includes(status) && !event.transfers.some((x) => x.resendOf === tr.reference);
  });
  const waiting = ['askIncome', 'needsApproval', 'review', 'held'].includes(event.stage);

  const onPin = async (value: string) => {
    setPin(value);
    if (value.length < PIN_LENGTH || !resend) return;
    const outcome = enterPin(value, Date.now());
    setPin('');
    if (outcome.result === 'wrong') return setPinError(`Wrong PIN. ${outcome.attemptsLeft} ${outcome.attemptsLeft === 1 ? 'try' : 'tries'} left.`);
    if (outcome.result === 'locked') return setPinError('Too many wrong PINs. Try again later.');
    const result = await sendAgain(event.id, resend.reference);
    setResend(null);
    setPinError(null);
    setMessage(
      result === 'sent'
        ? `Sending ${formatNaira(resend.amountKobo)} to ${resend.name} again.`
        : result === 'insufficientFunds'
          ? 'Not enough money in your SpreadIT account to send this again.'
          : "This transfer can't be sent again.",
    );
  };

  return (
    <Screen
      title="Income event"
      subtitle={`${formatNaira(event.amountKobo)} from ${event.sender}`}
      footer={<Button label="Get help" variant="quiet" onPress={() => router.push('/get-help')} />}
    >
      <View style={styles.card}>
        <Row label="Received" value={`${dayMonth(new Date(event.receivedAt))}, ${timeText(event.receivedAt)}`} />
        {event.executedAt ? <Row label="Sent" value={`${dayMonth(new Date(event.executedAt))}, ${timeText(event.executedAt)}`} /> : null}
        <Row label="Status" value={stageText[event.stage]} />
        {waiting ? <Button label="Open payday" variant="secondary" onPress={() => router.push(eventRoute(event) as never)} /> : null}
      </View>

      {message ? (
        <Text style={styles.message} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.heading}>The split</Text>
        {split.lines.map((l) => (
          <View key={l.ruleId} style={styles.line} accessible accessibilityLabel={`${l.priority}. ${l.name}, ${formatNaira(l.amountKobo)}, ${l.funding}`}>
            <View style={styles.lineText}>
              <Text style={styles.body}>
                {l.priority}. {l.name}
              </Text>
              <StatusBadge state={l.funding} />
            </View>
            <Text style={styles.value}>{formatNaira(l.amountKobo)}</Text>
          </View>
        ))}
        {split.remainder ? <Row label={`Leftover to ${split.remainder.name}`} value={formatNaira(split.remainder.amountKobo)} /> : null}
      </View>

      {event.transfers.length > 0 ? (
        <>
          <ActivityList
            title="Transfers"
            items={transferItems(event, t, (ref) => router.push(`/transfer-receipt?event=${event.id}&ref=${ref}`))}
          />
          {canResend.map((tr) => (
            <Button
              key={tr.reference}
              label={`Send again: ${tr.name} ${formatNaira(tr.amountKobo)}`}
              variant="secondary"
              onPress={() => {
                setMessage(null);
                setResend(tr);
              }}
            />
          ))}
          <View style={styles.card}>
            <Text style={styles.heading}>References</Text>
            {event.transfers.map((tr) => {
              const b = bankTransfer(tr.reference);
              return (
                <View key={tr.reference} style={styles.ref} accessible>
                  <Text style={styles.body}>{tr.name}</Text>
                  <Text style={styles.muted} selectable>
                    {b?.partnerReference ?? 'Not sent yet'}
                    {b?.completedAt ? ` · ${timeText(b.completedAt)}` : b ? ` · instructed ${timeText(b.createdAt)}` : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.heading}>Fees</Text>
        <Row label="To receive" value={formatNaira(split.inflowFeeKobo)} />
        <Row label="To send" value={formatNaira(event.transfers.length > 0 ? transferFees : split.totalFeesKobo - split.inflowFeeKobo)} />
        {event.transfers.length === 0 && !waiting ? <Text style={styles.muted}>Nothing was sent, so only the fee to receive applied.</Text> : null}
      </View>

      <Sheet visible={resend !== null} title="Enter your PIN to send again" closeLabel="Cancel" onClose={() => { setResend(null); setPin(''); setPinError(null); }}>
        <Text style={styles.body}>
          {resend ? `${formatNaira(resend.amountKobo)} to ${resend.name} (${resend.destination.bankName}), from your SpreadIT account.` : ''}
        </Text>
        <PinField label="6-digit PIN" value={pin} onChange={onPin} />
        {pinError ? <FieldError message={pinError} /> : null}
      </Sheet>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[3], ...shadow.card },
  heading: { ...type.titleSm, color: colors.ink },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3] },
  rowValue: { ...type.bodyStrong, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  line: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  lineText: { flex: 1, gap: space[1] },
  ref: { gap: space[1] },
  body: { ...type.body, color: colors.ink },
  value: { ...type.amountMd, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
  message: { ...type.bodyStrong, color: colors.brandStrong },
});
