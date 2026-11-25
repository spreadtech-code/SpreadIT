// S20 Income event detail (E2, D8), shown as "Payday details": the full split, fees, funding labels,
// transfer statuses, partner references and times.
// - "Send again" on a Failed or Reversed transfer asks for the PIN, then sends
//   the same amount to the same account from the SpreadIT balance (D8).
// - Tap a transfer for its receipt (S21). "Something wrong? Get help" goes to S25.
// - The split card (funding labels) shows when money ran short or nothing went out;
//   otherwise "Where it went" already lists every transfer and its status.
// Opened with ?event=<id>.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { LifeBuoy } from 'lucide-react-native';
import { ActivityList, Button, FieldError, InfoRow, Notice, PinField, PIN_LENGTH, Screen, SectionHeader, Sheet, StatusBadge, badgeWords } from '../src/components';
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

  const someShort = split.lines.some((l) => l.funding !== 'Fully funded');

  return (
    <Screen
      title="Payday details"
      subtitle={`${formatNaira(event.amountKobo)} from ${event.sender}`}
      footer={
        <Button label="Something wrong? Get help" icon={LifeBuoy} variant="quiet" onPress={() => router.push(`/get-help?event=${event.id}`)} />
      }
    >
      <View style={styles.well}>
        <InfoRow label="Landed" value={`${dayMonth(new Date(event.receivedAt))}, ${timeText(event.receivedAt)}`} />
        {event.executedAt ? <InfoRow label="Sent" value={`${dayMonth(new Date(event.executedAt))}, ${timeText(event.executedAt)}`} /> : null}
        <InfoRow label="Status" value={stageText[event.stage]} />
        <InfoRow label="Fee to receive" value={formatNaira(split.inflowFeeKobo)} />
        <InfoRow label="Fees to send" value={formatNaira(event.transfers.length > 0 ? transferFees : split.totalFeesKobo - split.inflowFeeKobo)} />
        {event.transfers.length === 0 && !waiting ? <Text style={styles.muted}>Nothing went out, so only the fee to receive applied.</Text> : null}
        {waiting ? <Button label="Open payday" variant="primary" onPress={() => router.push(eventRoute(event) as never)} /> : null}
      </View>

      {message ? (
        <Notice text={message} />
      ) : null}

      {someShort || event.transfers.length === 0 ? (
        <View style={styles.card}>
          <SectionHeader title="The split" />
          {split.lines.map((l) => (
            <View key={l.ruleId} style={styles.line} accessible accessibilityLabel={`${l.priority}. ${l.name}, ${formatNaira(l.amountKobo)}, ${badgeWords[l.funding]}`}>
              <View style={styles.lineText}>
                <Text style={styles.body}>
                  {l.priority}. {l.name}
                </Text>
                <StatusBadge state={l.funding} />
              </View>
              <Text style={styles.value}>{formatNaira(l.amountKobo)}</Text>
            </View>
          ))}
          {split.remainder ? <InfoRow label={`Leftovers to ${split.remainder.name}`} value={formatNaira(split.remainder.amountKobo)} /> : null}
        </View>
      ) : null}

      {event.transfers.length > 0 ? (
        <>
          <ActivityList
            title="Where it went"
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
          <View style={styles.well}>
            <Text style={styles.heading}>Bank references</Text>
            {event.transfers.map((tr) => {
              const b = bankTransfer(tr.reference);
              return (
                <View key={tr.reference} style={styles.ref} accessible>
                  <Text style={styles.bodyStrong}>{tr.name}</Text>
                  <Text style={styles.muted} selectable>
                    {b?.partnerReference ?? 'Not sent yet'}
                    {b?.completedAt ? ` · ${timeText(b.completedAt)}` : b ? ` · started ${timeText(b.createdAt)}` : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      ) : null}

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

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[4], gap: space[3], ...shadow.card },
  well: { backgroundColor: colors.surfaceSunken, borderRadius: radius.lg, padding: space[4], gap: space[2] },
  heading: { ...type.headline, color: colors.ink },
  line: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  lineText: { flex: 1, gap: space[1], alignItems: 'flex-start' },
  ref: { gap: space[1] },
  body: { ...type.body, color: colors.ink },
  bodyStrong: { ...type.bodyStrong, color: colors.ink },
  value: { ...type.amountMd, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
