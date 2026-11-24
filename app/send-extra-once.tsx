// S28 Send extra once (B14): a one-off extra amount to an existing rule's
// account, from the SpreadIT balance. ₦1,000 up to the balance; needs the PIN
// but no one-time code or 24-hour wait, because the account is already
// verified. The plan is not changed. Too little in the balance: shows the
// shortfall and the account details to forward it in. -> S15.
// Opened with ?ruleId=… from the rule editor, or without it from Home (pick a rule).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AmountField, Button, FieldError, OptionList, Screen } from '../src/components';
import { feeSchedule } from '../src/data/feeSchedule';
import { maxSendable, transferFee } from '../src/engine/fees';
import { formatNaira, maskAccount } from '../src/engine/format';
import { now, useBank } from '../src/fakebank/bankStore';
import { availableKobo, sendOneOff, usePaydays } from '../src/payday/paydayStore';
import { activeDestination } from '../src/state/sensitiveChanges';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';
import { ForwardDetails, PinSheet, SentView } from '../src/payday/oneOffParts';

/** B14 [ASSUMPTION in the PRD]: the smallest extra is ₦1,000. */
const MIN_EXTRA_KOBO = 100_000;

export default function SendExtraOnceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ruleId?: string }>();
  const rules = useApp((s) => s.plan.rules);
  useBank((s) => s.bank.balanceKobo); // re-render when the balance changes
  usePaydays((s) => s.events);
  const [ruleId, setRuleId] = useState<string | null>(params.ruleId ?? null);
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [sentRef, setSentRef] = useState<string | null>(null);

  const t = now();
  const sendable = rules.filter((r) => activeDestination(r, t));
  const rule = sendable.find((r) => r.id === ruleId);
  const available = availableKobo();
  const most = maxSendable(available, feeSchedule);

  if (sentRef && rule) return <SentView reference={sentRef} title={`Extra for ${rule.name}`} />;

  const fee = amount && amount > 0 ? transferFee(amount, feeSchedule) : 0;
  const shortKobo = amount ? amount + fee - available : 0;

  const review = () => {
    setError(null);
    if (!rule) return setError('Choose who to send it to.');
    if (!amount || amount < MIN_EXTRA_KOBO) return setError(`Send at least ${formatNaira(MIN_EXTRA_KOBO)}.`);
    if (shortKobo > 0) return setError(`Not enough in your SpreadIT balance. You need ${formatNaira(shortKobo)} more.`);
    setPinOpen(true);
  };

  const send = async () => {
    if (!rule || !amount) return;
    const destination = activeDestination(rule, now())!;
    const outcome = await sendOneOff({ kind: 'extra', ruleId: rule.id, name: rule.name, categoryKey: rule.categoryKey, destination, amountKobo: amount });
    setPinOpen(false);
    if (outcome.result === 'sent') setSentRef(outcome.reference);
    else setError(`Not enough in your SpreadIT balance. You need ${formatNaira(outcome.shortKobo)} more.`);
  };

  return (
    <Screen
      title="Send extra once"
      subtitle="A one-off amount from your SpreadIT balance. Your plan stays the same."
      footer={<Button label="Send with PIN" variant="primary" onPress={review} />}
    >
      <View style={styles.card} accessible accessibilityLabel={`Your SpreadIT balance: ${formatNaira(available)}`}>
        <Text style={styles.muted}>Your SpreadIT balance</Text>
        <Text style={styles.amount}>{formatNaira(available)}</Text>
        <Text style={styles.muted}>Money from a payday still waiting to be split isn't included.</Text>
      </View>

      {params.ruleId && rule ? (
        <View style={styles.card}>
          <Text style={styles.muted}>To</Text>
          <Text style={styles.name}>{rule.name}</Text>
          <Text style={styles.muted}>{accountLine(activeDestination(rule, t)!)}</Text>
        </View>
      ) : sendable.length > 0 ? (
        <OptionList
          accessibilityLabel="Send it to"
          options={sendable.map((r) => ({ value: r.id, label: r.name, description: accountLine(activeDestination(r, t)!) }))}
          value={ruleId}
          onChange={setRuleId}
        />
      ) : (
        <Text style={styles.body}>None of your rules has an account to send to yet.</Text>
      )}

      <AmountField
        label="Amount"
        valueKobo={amount}
        onChangeKobo={setAmount}
        helper={
          amount && amount > 0
            ? `Costs ${formatNaira(fee)} to send. ${formatNaira(amount + fee)} comes out of your balance.`
            : `From ${formatNaira(MIN_EXTRA_KOBO)}. The most you can send now is ${formatNaira(most)}.`
        }
      />
      {error ? <FieldError message={error} /> : null}

      {shortKobo > 0 || available < MIN_EXTRA_KOBO ? (
        <ForwardDetails
          text={
            shortKobo > 0
              ? `You need ${formatNaira(shortKobo)} more. Send it to your SpreadIT account first, then come back.`
              : 'Your balance is low. Send money to your SpreadIT account first, then come back.'
          }
        />
      ) : null}

      <PinSheet
        visible={pinOpen}
        title="Enter your PIN to send"
        summary={rule && amount ? `${formatNaira(amount)} to ${rule.name} (${accountLine(activeDestination(rule, t)!)}). Fee ${formatNaira(fee)}.` : ''}
        onCancel={() => setPinOpen(false)}
        onPinOk={send}
      />
      <Button label="Cancel" variant="quiet" onPress={() => router.back()} />
    </Screen>
  );
}

const accountLine = (d: { bankName: string; accountNumber: string }) => `${d.bankName} ${maskAccount(d.accountNumber)}`;

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[1], ...shadow.card },
  amount: { ...type.amountLg, color: colors.ink },
  name: { ...type.headline, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
