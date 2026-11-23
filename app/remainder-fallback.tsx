// S9 Remainder and fallback (B8, B9): where leftover money goes, and the
// user's own account for failed transfers and unsplit money. Save -> S6.
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Button, FieldError, OptionList, Screen, TextField } from '../src/components';
import { maskAccount } from '../src/engine/format';
import type { Destination } from '../src/engine/types';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

const presetNames = ['Everyday spending', 'Savings', 'Primary account'] as const;
type Choice = (typeof presetNames)[number] | 'custom';

export default function RemainderFallbackScreen() {
  const router = useRouter();
  const plan = useApp((s) => s.plan);
  const savedFallback = useApp((s) => s.fallback);
  const save = useApp((s) => s.saveRemainderAndFallback);
  const takeDestination = useApp((s) => s.takeDestination);

  const savedName = plan.remainder?.name;
  const [choice, setChoice] = useState<Choice | null>(
    savedName ? ((presetNames as readonly string[]).includes(savedName) ? (savedName as Choice) : 'custom') : null,
  );
  const [customName, setCustomName] = useState(savedName && !(presetNames as readonly string[]).includes(savedName) ? savedName : '');
  const [remainder, setRemainder] = useState<Destination | undefined>(plan.remainder?.destination);
  const [fallback, setFallback] = useState<Destination | null>(savedFallback);
  const [errors, setErrors] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      const r = takeDestination('remainder');
      if (r) setRemainder(r);
      const f = takeDestination('fallback');
      if (f) setFallback(f);
    }, [takeDestination]),
  );

  const onSave = () => {
    const problems: string[] = [];
    const name = choice === 'custom' ? customName.trim() : choice;
    if (!name) problems.push('Choose where leftover money goes');
    if (!remainder) problems.push('Add the account for leftover money.');
    setErrors(problems);
    if (problems.length > 0 || !name || !remainder) return;
    save(name, remainder, fallback);
    router.back();
  };

  return (
    <Screen
      title="Remainder and fallback"
      subtitle="Changes apply from your next payday."
      footer={<Button label="Save" variant="primary" onPress={onSave} />}
    >
      <Text style={styles.section}>Where leftover money goes</Text>
      <OptionList
        accessibilityLabel="Leftover money goes to"
        options={[
          ...presetNames.map((n) => ({ value: n, label: n })),
          { value: 'custom' as const, label: 'Something else' },
        ]}
        value={choice}
        onChange={setChoice}
      />
      {choice === 'custom' ? (
        <TextField label="Name" value={customName} onChangeText={setCustomName} maxLength={30} autoCapitalize="words" autoFocus />
      ) : null}
      <AccountCard
        title="Account for leftover money"
        destination={remainder}
        onChange={() => router.push('/add-destination?for=remainder')}
      />

      <Text style={styles.section}>Fallback account</Text>
      <Text style={styles.body}>
        Your own account. If a transfer fails for good, or you move unsplit money out, it goes here. Needed before you switch on automation.
      </Text>
      <AccountCard title="Fallback account" destination={fallback ?? undefined} onChange={() => router.push('/add-destination?for=fallback')} />
      {!fallback && remainder ? (
        <Button label="Use my leftover account" variant="quiet" onPress={() => setFallback(remainder)} />
      ) : null}

      {errors.map((e) => (
        <FieldError key={e} message={e} />
      ))}
    </Screen>
  );
}

function AccountCard({ title, destination, onChange }: { title: string; destination?: Destination; onChange: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.muted}>{title}</Text>
      {destination ? (
        <View accessible accessibilityLabel={`${title}: ${destination.accountName}, ${destination.bankName} ${maskAccount(destination.accountNumber)}`}>
          <Text style={styles.name}>{destination.accountName}</Text>
          <Text style={styles.muted}>
            {destination.bankName} {maskAccount(destination.accountNumber)}
          </Text>
        </View>
      ) : (
        <Text style={styles.muted}>Not added yet.</Text>
      )}
      <Button label={destination ? 'Change account' : 'Add account'} variant={destination ? 'quiet' : 'secondary'} onPress={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { ...type.titleSm, color: colors.ink },
  body: { ...type.body, color: colors.inkMuted },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[2], ...shadow.card },
  muted: { ...type.label, color: colors.inkMuted },
  name: { ...type.headline, color: colors.ink },
});
