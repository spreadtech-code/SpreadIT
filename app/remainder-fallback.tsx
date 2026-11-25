// S9 Remainder and fallback (B8, B9): where leftover money goes, and the
// user's own account for failed transfers and unsplit money. Save -> S6.
// Once automation is live, Save needs a one-time code (F2, S23), and a new
// leftover account waits 24 hours before it is paid (F3).
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AccountCard as SharedAccountCard, Button, FieldError, OptionList, Screen, TextField } from '../src/components';
import { maskAccount } from '../src/engine/format';
import type { Destination } from '../src/engine/types';
import { now } from '../src/fakebank/bankStore';
import { isLive, useApp } from '../src/state/appStore';
import { cooldownText } from '../src/state/sensitiveChanges';
import { colors, space, type } from '../src/theme/tokens';

const presetNames = ['Everyday spending', 'Savings', 'Primary account'] as const;
type Choice = (typeof presetNames)[number] | 'custom';

export default function RemainderFallbackScreen() {
  const router = useRouter();
  const plan = useApp((s) => s.plan);
  const savedFallback = useApp((s) => s.fallback);
  const save = useApp((s) => s.saveRemainderAndFallback);
  const takeDestination = useApp((s) => s.takeDestination);
  const requestChange = useApp((s) => s.requestChange);
  const live = useApp((s) => isLive(s));

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
    if (live) {
      requestChange({ kind: 'remainderFallback', remainderName: name, remainder, fallback });
      router.replace('/verify-change');
      return;
    }
    save(name, remainder, fallback);
    router.back();
  };

  return (
    <Screen
      title="Leftovers & backup"
      subtitle={live ? 'Where spare money goes, and where money lands if a transfer can’t go through. Saving needs a 6-digit code.' : 'Where spare money goes, and where money lands if a transfer can’t go through.'}
      footer={<Button label="Save" variant="primary" onPress={onSave} />}
    >
      <Text style={styles.section}>Leftovers go to</Text>
      <OptionList
        accessibilityLabel="Leftovers go to"
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
        title="Account for leftovers"
        destination={remainder}
        onChange={() => router.push('/add-destination?for=remainder')}
        note={
          plan.remainder && remainder?.accountNumber === plan.remainder.destination?.accountNumber
            ? cooldownText(plan.remainder, now())
            : live
              ? 'A new account starts getting paid 24 hours after you save.'
              : null
        }
      />

      <Text style={styles.section}>Backup account</Text>
      <Text style={styles.body}>
        Your own account. If a transfer fails for good, or you move unsplit money out, it goes here. Needed before Autopilot can start.
      </Text>
      <AccountCard title="Backup account" destination={fallback ?? undefined} onChange={() => router.push('/add-destination?for=fallback')} />
      {!fallback && remainder ? (
        <Button label="Use my leftovers account" variant="quiet" onPress={() => setFallback(remainder)} />
      ) : null}

      {errors.map((e) => (
        <FieldError key={e} message={e} />
      ))}
    </Screen>
  );
}

function AccountCard({
  title,
  destination,
  onChange,
  note,
}: {
  title: string;
  destination?: Destination;
  onChange: () => void;
  note?: string | null;
}) {
  return (
    <View style={styles.card} accessibilityLabel={title}>
      {destination ? (
        <SharedAccountCard
          accountName={destination.accountName}
          bankName={destination.bankName}
          accountNumber={destination.accountNumber}
          onChange={onChange}
        />
      ) : (
        <Button label={`Add the ${title.toLowerCase()}`} variant="secondary" onPress={onChange} />
      )}
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { ...type.labelStrong, color: colors.inkMuted },
  body: { ...type.label, color: colors.inkMuted },
  card: { gap: space[2] },
  muted: { ...type.label, color: colors.inkMuted },
  name: { ...type.headline, color: colors.ink },
  note: { ...type.label, color: colors.ink },
});
