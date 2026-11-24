// S29 Send to my account (D13): moves money that was not split (a refund, a
// friend's repayment, a held payment) to the user's fallback account.
// Shows the unsplit balance, then the chosen amount (₦1 up to the balance) and
// its transfer fee before the user confirms with the PIN. -> S15.
// The fee comes out of the balance too, so "Send all" sends the most that
// leaves room for its own fee (prototype choice, 24 Nov 2026).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AmountField, Button, FieldError, Screen } from '../src/components';
import { feeSchedule } from '../src/data/feeSchedule';
import { maxSendable, transferFee } from '../src/engine/fees';
import { formatNaira, maskAccount } from '../src/engine/format';
import { useBank } from '../src/fakebank/bankStore';
import { PinSheet, SentView } from '../src/payday/oneOffParts';
import { availableKobo, sendOneOff, usePaydays } from '../src/payday/paydayStore';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

export default function SendToMyAccountScreen() {
  const router = useRouter();
  const fallback = useApp((s) => s.fallback);
  useBank((s) => s.bank.balanceKobo);
  usePaydays((s) => s.events);
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [sentRef, setSentRef] = useState<string | null>(null);

  if (sentRef) return <SentView reference={sentRef} title="Sent to your account" />;

  const unsplit = availableKobo();
  const most = maxSendable(unsplit, feeSchedule);
  const fee = amount && amount > 0 ? transferFee(amount, feeSchedule) : 0;

  if (!fallback) {
    return (
      <Screen title="Send to my account" footer={<Button label="Open plan" variant="primary" onPress={() => router.navigate('/plan-builder')} />}>
        <Text style={styles.body}>Add your fallback account first. That's your own account, where this money goes.</Text>
      </Screen>
    );
  }

  const review = () => {
    setError(null);
    if (!amount || amount < 100) return setError('Enter an amount of ₦1 or more.');
    if (amount + fee > unsplit) {
      return setError(`That's more than you can send. With the ${formatNaira(fee)} fee, the most is ${formatNaira(most)}.`);
    }
    setPinOpen(true);
  };

  const send = async () => {
    if (!amount) return;
    const outcome = await sendOneOff({ kind: 'toMyAccount', name: 'To my account', destination: fallback, amountKobo: amount });
    setPinOpen(false);
    if (outcome.result === 'sent') setSentRef(outcome.reference);
    else setError(`Not enough unsplit money. You need ${formatNaira(outcome.shortKobo)} more.`);
  };

  const to = `${fallback.accountName}, ${fallback.bankName} ${maskAccount(fallback.accountNumber)}`;

  return (
    <Screen
      title="Send to my account"
      subtitle="Move money that wasn't split to your own account."
      footer={
        <>
          <Button label="Send with PIN" variant="primary" disabled={most === 0} onPress={review} />
          <Button label="Cancel" variant="quiet" onPress={() => router.back()} />
        </>
      }
    >
      <View style={styles.card} accessible accessibilityLabel={`Unsplit money: ${formatNaira(unsplit)}`}>
        <Text style={styles.muted}>Unsplit money</Text>
        <Text style={styles.amount}>{formatNaira(unsplit)}</Text>
        <Text style={styles.muted}>In your SpreadIT account, not part of any split.</Text>
      </View>

      <View style={styles.card} accessible accessibilityLabel={`To ${to}`}>
        <Text style={styles.muted}>To your fallback account</Text>
        <Text style={styles.name}>{to}</Text>
      </View>

      {most === 0 ? (
        <Text style={styles.body}>
          {unsplit === 0 ? 'Nothing to send. Every naira was split.' : `${formatNaira(unsplit)} is less than the fee to send it.`}
        </Text>
      ) : (
        <>
          <AmountField
            label="Amount"
            valueKobo={amount}
            onChangeKobo={setAmount}
            helper={
              amount && amount > 0
                ? `Fee: ${formatNaira(fee)}. ${formatNaira(amount + fee)} comes out of your balance.`
                : `₦1 up to ${formatNaira(most)}. The fee comes out of your balance too.`
            }
          />
          <Button label={`Send all (${formatNaira(most)})`} variant="quiet" onPress={() => setAmount(most)} />
        </>
      )}
      {error ? <FieldError message={error} /> : null}

      <PinSheet
        visible={pinOpen}
        title="Enter your PIN to send"
        summary={amount ? `${formatNaira(amount)} to ${to}. Fee ${formatNaira(fee)}.` : ''}
        onCancel={() => setPinOpen(false)}
        onPinOk={send}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[1], ...shadow.card },
  amount: { ...type.amountLg, color: colors.ink },
  name: { ...type.headline, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
