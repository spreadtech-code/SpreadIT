// S29 Send to my account (D13), shown as "Move to your account": moves money that
// was not split (a refund, a friend's repayment, a held payment) to the user's
// fallback account ("backup account" in the app).
// Shows the unsplit balance, then the chosen amount (₦1 up to the balance) and
// its transfer fee before the user confirms with the PIN. -> S15.
// The fee comes out of the balance too, so "Send all" sends the most that
// leaves room for its own fee (prototype choice, 24 Nov 2026).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AccountCard, AmountField, Button, FieldError, Screen } from '../src/components';
import { feeSchedule } from '../src/data/feeSchedule';
import { maxSendable, transferFee } from '../src/engine/fees';
import { formatNaira, maskAccount } from '../src/engine/format';
import { useBank } from '../src/fakebank/bankStore';
import { PinSheet, SentView } from '../src/payday/oneOffParts';
import { availableKobo, sendOneOff, usePaydays } from '../src/payday/paydayStore';
import { useApp } from '../src/state/appStore';
import { colors, radius, space, type } from '../src/theme/tokens';

export default function SendToMyAccountScreen() {
  const router = useRouter();
  const fallback = useApp((s) => s.fallback);
  useBank((s) => s.bank.balanceKobo);
  usePaydays((s) => s.events);
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [sentRef, setSentRef] = useState<string | null>(null);

  if (sentRef) return <SentView reference={sentRef} title="Moved to your account" />;

  const unsplit = availableKobo();
  const most = maxSendable(unsplit, feeSchedule);
  const fee = amount && amount > 0 ? transferFee(amount, feeSchedule) : 0;

  if (!fallback) {
    return (
      <Screen title="Move to your account" footer={<Button label="Open plan" variant="primary" onPress={() => router.navigate('/plan-builder')} />}>
        <Text style={styles.body}>Add your backup account first. That’s your own account, where this money goes.</Text>
      </Screen>
    );
  }

  const review = () => {
    setError(null);
    if (!amount || amount < 100) return setError('Enter an amount of ₦1 or more.');
    if (amount + fee > unsplit) {
      return setError(`That’s more than you can move. With the ${formatNaira(fee)} fee, the most is ${formatNaira(most)}.`);
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
      title="Move to your account"
      subtitle="Money that wasn’t split goes to your backup account."
      footer={
        <>
          <Button
            label="Move with PIN"
            variant="primary"
            disabled={most === 0}
            accessibilityHint={most === 0 ? 'Nothing to move right now.' : undefined}
            onPress={review}
          />
          <Button label="Not now" variant="quiet" onPress={() => router.back()} />
        </>
      }
    >
      <View style={styles.card} accessible accessibilityLabel={`Not split yet: ${formatNaira(unsplit)}`}>
        <Text style={styles.small}>Not split yet</Text>
        <Text style={styles.amount}>{formatNaira(unsplit)}</Text>
        <Text style={styles.small}>In your SpreadIT account, not in any split.</Text>
      </View>

      {most === 0 ? (
        <Text style={styles.body}>
          {unsplit === 0 ? 'Nothing to move. Every naira was split.' : `${formatNaira(unsplit)} is less than the fee to send it.`}
        </Text>
      ) : (
        <>
          <AmountField
            label="How much"
            valueKobo={amount}
            onChangeKobo={setAmount}
            helper={
              amount && amount > 0
                ? `Costs ${formatNaira(fee)} to send. ${formatNaira(amount + fee)} comes out of your balance.`
                : `₦1 up to ${formatNaira(most)}. The fee comes out of your balance too.`
            }
          />
          <Button label={`Move all (${formatNaira(most)})`} variant="quiet" onPress={() => setAmount(most)} />
        </>
      )}
      {error ? <FieldError message={error} /> : null}

      <View style={styles.group}>
        <Text style={styles.label}>Going to</Text>
        <AccountCard accountName={fallback.accountName} bankName={fallback.bankName} accountNumber={fallback.accountNumber} tag="Backup" />
      </View>

      <PinSheet
        visible={pinOpen}
        title="Enter your PIN to move it"
        summary={amount ? `${formatNaira(amount)} to ${to}. Fee ${formatNaira(fee)}.` : ''}
        onCancel={() => setPinOpen(false)}
        onPinOk={send}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.brandSoft, borderRadius: radius.lg, padding: space[4], gap: space[1] },
  small: { ...type.label, color: colors.onBrand },
  amount: { ...type.amountLg, color: colors.onBrand },
  group: { gap: space[2] },
  label: { ...type.labelStrong, color: colors.inkMuted },
  body: { ...type.body, color: colors.ink },
});
