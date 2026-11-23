// S8 Add destination account (B7): pick a bank, enter a 10-digit account
// number, see the account name, and tap "Confirm this is [name]".
// Pretend: the fake bank answers. Numbers ending in 0000 are "not found".
// Opened with ?for=rule|remainder|fallback; hands the account back to that screen.
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, FieldError, OptionList, Screen, TextField } from '../src/components';
import { banks } from '../src/data/banks';
import { maskAccount } from '../src/engine/format';
import { resolveAccountName, type ResolveResult } from '../src/fakebank';
import { useApp, type DestinationFor } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

export default function AddDestinationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ for?: DestinationFor }>();
  const forWhat: DestinationFor = params.for ?? 'rule';
  const offerDestination = useApp((s) => s.offerDestination);

  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [bankId, setBankId] = useState<string | null>(null);
  const [number, setNumber] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ResolveResult | null>(null);
  const latest = useRef('');

  const bank = banks.find((b) => b.id === bankId);
  const shown = banks.filter((b) => b.name.toLowerCase().includes(search.trim().toLowerCase()));

  // Look up the name as soon as 10 digits are in (B7: within 5 seconds).
  useEffect(() => {
    setResult(null);
    if (!bankId || number.length !== 10) return;
    const key = `${bankId}:${number}`;
    latest.current = key;
    setChecking(true);
    resolveAccountName(bankId, number).then((r) => {
      if (latest.current !== key) return;
      setChecking(false);
      setResult(r);
    });
  }, [bankId, number]);

  const confirm = () => {
    if (!result?.ok) return;
    offerDestination(forWhat, {
      bankName: result.bankName,
      accountNumber: result.accountNumber,
      accountName: result.accountName,
    });
    router.back();
  };

  const subtitle =
    forWhat === 'fallback'
      ? 'Your own account. Failed transfers and unsplit money go here.'
      : forWhat === 'remainder'
        ? 'Where leftover money goes after your rules.'
        : 'Where this rule sends money.';

  if (step === 1) {
    return (
      <Screen step="Step 1 of 2" title="Choose the bank" subtitle={subtitle}>
        <TextField label="Search banks" value={search} onChangeText={setSearch} placeholder="e.g. GTBank" />
        <OptionList
          accessibilityLabel="Bank"
          options={shown.map((b) => ({ value: b.id, label: b.name }))}
          value={bankId}
          onChange={(id) => {
            setBankId(id);
            setNumber('');
            setStep(2);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      step="Step 2 of 2"
      title="Enter the account number"
      subtitle={`${bank?.name ?? ''} · 10 digits`}
      onBack={() => setStep(1)}
      footer={
        result?.ok ? (
          <Button label={`Confirm this is ${result.accountName}`} variant="primary" onPress={confirm} />
        ) : undefined
      }
    >
      <TextField
        label="Account number"
        value={number}
        onChangeText={(t) => setNumber(t.replace(/\D/g, '').slice(0, 10))}
        keyboardType="number-pad"
        maxLength={10}
        placeholder="0123456789"
        helper="Pretend bank: a number ending in 0000 shows “Account not found”."
        autoFocus
      />
      {checking ? (
        <View style={styles.row} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.brandStrong} />
          <Text style={styles.muted}>Checking the account name…</Text>
        </View>
      ) : null}
      {result?.ok ? (
        <View style={styles.card} accessible accessibilityLabel={`Account name: ${result.accountName}`} accessibilityLiveRegion="polite">
          <Text style={styles.muted}>Account name</Text>
          <Text style={styles.name}>{result.accountName}</Text>
          <Text style={styles.muted}>
            {result.bankName} {maskAccount(result.accountNumber)}
          </Text>
        </View>
      ) : null}
      {result && !result.ok ? (
        <FieldError message={result.reason === 'notFound' ? 'Account not found' : 'Check the account number and bank.'} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  muted: { ...type.label, color: colors.inkMuted },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[1], ...shadow.card },
  name: { ...type.titleSm, color: colors.ink },
});
