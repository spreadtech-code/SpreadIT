// S7 Rule editor (B2-B5, B7, B13, B15): rule type, amount or %, frequency,
// destination, keep trying; shows the transfer cost and stamp-duty hint.
// Opened with ?ruleId=… (edit), ?category=… (switch a B1 category on) or ?custom=1 (B2).
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  AmountField,
  Button,
  FieldError,
  OptionList,
  Screen,
  SegmentedControl,
  TextField,
  Toggle,
} from '../src/components';
import { categoryByKey } from '../src/data/categories';
import { feeSchedule } from '../src/data/feeSchedule';
import { transferCostText } from '../src/engine/fees';
import { formatNaira, maskAccount } from '../src/engine/format';
import { shareDown } from '../src/engine/money';
import { stampDutyHint } from '../src/engine/planChecks';
import type { Destination, Frequency, Rule } from '../src/engine/types';
import { percentText, planErrors, ruleErrors } from '../src/engine/validate';
import { newRuleId, upsertRule } from '../src/state/planEdits';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

/** "10" -> 1000, "10.5" -> 1050; null if not a number with at most one decimal place. */
function parsePercent(text: string): number | null {
  const m = /^(\d{1,3})(?:\.(\d))?$/.exec(text.trim());
  if (!m) return null;
  return Number(m[1]) * 100 + Number(m[2] ?? 0) * 10;
}

export default function RuleEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ruleId?: string; category?: string; custom?: string }>();
  const plan = useApp((s) => s.plan);
  const income = useApp((s) => s.income);
  const saveRule = useApp((s) => s.saveRule);
  const deleteRule = useApp((s) => s.deleteRule);
  const setSkipNext = useApp((s) => s.setSkipNext);
  const takeDestination = useApp((s) => s.takeDestination);

  const existing = plan.rules.find((r) => r.id === params.ruleId);
  const category = categoryByKey(params.category ?? existing?.categoryKey ?? '');

  const [name, setName] = useState(existing?.name ?? category?.name ?? '');
  const [kind, setKind] = useState<Rule['kind']>(existing?.kind ?? 'fixed');
  const [amount, setAmount] = useState<number | null>(existing?.kind === 'fixed' ? existing.amountKobo : null);
  const [percent, setPercent] = useState(existing?.kind === 'percent' ? percentText(existing.basisPoints).replace('%', '') : '');
  const [frequency, setFrequency] = useState<Frequency>(existing?.kind === 'fixed' ? existing.frequency : 'oncePerMonth');
  const [destination, setDestination] = useState<Destination | undefined>(existing?.destination);
  const [keepTrying, setKeepTrying] = useState(existing?.keepTrying ?? category?.keepTryingByDefault ?? false);
  const [errors, setErrors] = useState<string[]>([]);

  // Pick up the account chosen on S8.
  useFocusEffect(
    useCallback(() => {
      const d = takeDestination('rule');
      if (d) setDestination(d);
    }, [takeDestination]),
  );

  const basisPoints = parsePercent(percent);
  const expected = income?.expectedKobo ?? 0;
  const percentAmount = basisPoints !== null ? shareDown(expected, basisPoints) : null;

  const buildRule = (): Rule | null => {
    const base = {
      id: existing?.id ?? newRuleId(),
      name: name.trim(),
      destination,
      categoryKey: existing?.categoryKey ?? category?.key ?? 'custom',
      keepTrying,
      skipNextPayday: existing?.skipNextPayday ?? false,
    };
    if (kind === 'fixed') return amount === null ? null : { ...base, kind, amountKobo: amount, frequency };
    return basisPoints === null ? null : { ...base, kind, basisPoints };
  };

  const save = () => {
    const rule = buildRule();
    const problems: string[] = [];
    if (!rule) problems.push(kind === 'fixed' ? 'Enter an amount.' : 'Enter a percentage, like 10 or 10.5.');
    else {
      problems.push(...ruleErrors(rule));
      problems.push(...planErrors(upsertRule(plan, rule)).filter((e) => !e.includes(':'))); // plan-wide problems only
    }
    if (!destination) problems.push('Add a destination account to save this rule.');
    setErrors(problems);
    if (problems.length > 0 || !rule) return;
    saveRule(rule);
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert(`Delete ${existing.name}?`, 'This takes the rule out of your plan. Changes apply from your next payday.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete rule',
        style: 'destructive',
        onPress: () => {
          deleteRule(existing.id);
          router.back();
        },
      },
    ]);
  };

  const fixedHelper = amount ? transferCostText(amount, feeSchedule) : 'Enter an amount to see what it costs to send.';
  const stampHint = amount ? stampDutyHint(amount, feeSchedule) : null;
  const percentHelper =
    basisPoints !== null && percentAmount !== null && percentAmount > 0
      ? `${percentText(basisPoints)} of ${formatNaira(expected)} = ${formatNaira(percentAmount)}. ${transferCostText(percentAmount, feeSchedule)}.`
      : 'Percentages use the full amount you receive.';

  return (
    <Screen
      title={existing ? `Edit ${existing.name}` : category ? category.name : 'New category'}
      subtitle="Changes apply from your next payday."
      footer={<Button label="Save rule" variant="primary" onPress={save} />}
    >
      <TextField label="Name" value={name} onChangeText={setName} maxLength={30} autoCapitalize="words" helper="Up to 30 characters, e.g. Mum or School fees." />

      <SegmentedControl
        accessibilityLabel="Rule type"
        options={[
          { value: 'fixed', label: 'Fixed amount' },
          { value: 'percent', label: '% of income' },
        ]}
        value={kind}
        onChange={setKind}
      />

      {kind === 'fixed' ? (
        <>
          <AmountField label="Amount each time" valueKobo={amount} onChangeKobo={setAmount} helper={fixedHelper} warning={stampHint ?? undefined} />
          <OptionList
            accessibilityLabel="How often"
            options={[
              { value: 'oncePerMonth', label: 'Once per month', description: 'Pays on the first payday of each month only.' },
              { value: 'everyIncome', label: 'Every income', description: 'Pays each time qualifying income arrives.' },
            ]}
            value={frequency}
            onChange={setFrequency}
          />
        </>
      ) : (
        <TextField label="Percentage of income" value={percent} onChangeText={setPercent} keyboardType="decimal-pad" suffix="%" placeholder="10" helper={percentHelper} maxLength={5} />
      )}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Destination account</Text>
        {destination ? (
          <View accessible accessibilityLabel={`${destination.accountName}, ${destination.bankName} ${maskAccount(destination.accountNumber)}`}>
            <Text style={styles.cardName}>{destination.accountName}</Text>
            <Text style={styles.cardLabel}>
              {destination.bankName} {maskAccount(destination.accountNumber)}
            </Text>
          </View>
        ) : (
          <Text style={styles.cardLabel}>Not added yet.</Text>
        )}
        <Button
          label={destination ? 'Change account' : 'Add destination account'}
          variant={destination ? 'quiet' : 'secondary'}
          onPress={() => router.push('/add-destination?for=rule')}
        />
      </View>

      <Toggle
        label="Keep trying if it fails"
        description="If a transfer fails for a short time, keep retrying for up to 72 hours before it goes to your fallback account."
        value={keepTrying}
        onValueChange={setKeepTrying}
      />

      {errors.map((e) => (
        <FieldError key={e} message={e} />
      ))}

      {existing ? (
        <View style={styles.more}>
          {existing.skipNextPayday ? (
            <Button label="Don't skip next payday" variant="secondary" onPress={() => setSkipNext(existing.id, false)} />
          ) : (
            <Button label="Skip next payday" variant="secondary" onPress={() => router.push(`/confirm-pin?action=skipNext&ruleId=${existing.id}`)} />
          )}
          <Button label="Send extra once" variant="secondary" onPress={() => router.push('/send-extra-once')} />
          <Button label="Delete rule" variant="critical" onPress={remove} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[2], ...shadow.card },
  cardLabel: { ...type.label, color: colors.inkMuted },
  cardName: { ...type.headline, color: colors.ink },
  more: { gap: space[2], marginTop: space[4] },
});
