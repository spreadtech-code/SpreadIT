// Parts shared by S28 Send extra once and S29 Send to my account. Built only
// from existing design-system components (Sheet, PinField, StatusBadge, Button).
// - PinSheet: asks for the PIN before money moves.
// - SentView: the transfer's live status after sending.
// - ForwardDetails: the SpreadIT account details with "Copy details", for
//   topping up the balance (B14 shortfall, A9 Forward mode).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Button, FieldError, PinField, PIN_LENGTH, Screen, Sheet, StatusBadge } from '../components';
import { formatNaira } from '../engine/format';
import { accountDetailsText } from '../fakebank';
import { useBank } from '../fakebank/bankStore';
import { useApp } from '../state/appStore';
import { colors, radius, shadow, space, type } from '../theme/tokens';
import { usePaydays } from './paydayStore';

export function PinSheet({
  visible,
  title,
  summary,
  onCancel,
  onPinOk,
}: {
  visible: boolean;
  title: string;
  summary: string;
  onCancel: () => void;
  onPinOk: () => void;
}) {
  const enterPin = useApp((s) => s.enterPin);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onChange = (value: string) => {
    setPin(value);
    if (value.length < PIN_LENGTH) return;
    const outcome = enterPin(value, Date.now());
    setPin('');
    if (outcome.result === 'wrong') return setError(`Wrong PIN. ${outcome.attemptsLeft} ${outcome.attemptsLeft === 1 ? 'try' : 'tries'} left.`);
    if (outcome.result === 'locked') return setError('Too many wrong PINs. Try again in 30 minutes.');
    setError(null);
    onPinOk();
  };

  return (
    <Sheet
      visible={visible}
      title={title}
      closeLabel="Cancel"
      onClose={() => {
        setPin('');
        setError(null);
        onCancel();
      }}
    >
      <Text style={styles.body}>{summary}</Text>
      <PinField label="6-digit PIN" value={pin} onChange={onChange} />
      {error ? <FieldError message={error} /> : null}
    </Sheet>
  );
}

export function SentView({ reference, title }: { reference: string; title: string }) {
  const router = useRouter();
  const oneOff = usePaydays((s) => s.oneOffs.find((o) => o.reference === reference));
  const b = useBank((s) => s.bank.transfers[reference]);
  const status = b?.status ?? 'Pending';
  const home = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/home');
  };
  return (
    <Screen
      title={title}
      subtitle="Sent from your SpreadIT balance."
      footer={
        <>
          <Button label="Back to Home" variant="primary" onPress={home} />
          <Button label="See receipt" variant="quiet" onPress={() => router.push(`/transfer-receipt?ref=${reference}`)} />
        </>
      }
    >
      <View style={styles.hero} accessible accessibilityLabel={`${oneOff?.name ?? ''}, ${formatNaira(oneOff?.amountKobo ?? 0)}, status ${status}`}>
        <Text style={styles.muted}>{oneOff?.name}</Text>
        <Text style={styles.amount}>{formatNaira(oneOff?.amountKobo ?? 0)}</Text>
        <StatusBadge state={status} />
      </View>
      <Text style={styles.muted}>Fee: {formatNaira(oneOff?.feeKobo ?? 0)}. The status updates here as the bank works on it.</Text>
    </Screen>
  );
}

export function ForwardDetails({ text }: { text: string }) {
  const account = useApp((s) => s.spreaditAccount);
  const [copied, setCopied] = useState(false);
  if (!account) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.body}>{text}</Text>
      <Text style={styles.strong} selectable>
        {account.bankName}
        {'\n'}
        {account.accountNumber}
        {'\n'}
        {account.accountName}
      </Text>
      <Button
        label={copied ? 'Copied' : 'Copy details'}
        variant="secondary"
        accessibilityHint="Copies bank, account number and name"
        onPress={async () => {
          await Clipboard.setStringAsync(accountDetailsText(account));
          setCopied(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space[6], alignItems: 'center', gap: space[2], ...shadow.card },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[3], ...shadow.card },
  amount: { ...type.amountXl, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  strong: { ...type.bodyStrong, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
