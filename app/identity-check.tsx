// S12 Identity check (A6): submit the BVN to the partner bank to unlock live
// automation. Not needed for the simulator (C2).
// - Pass: the partner opens the user's own account (A7), then S13.
// - Fail: the reason (BVN not found, name or date of birth doesn't match) and "Try again".
// - After 3 fails in 24 hours: the support contact instead of the form.
// Only the result is kept, never the BVN (PRD decision 17).
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleX, LifeBuoy } from 'lucide-react-native';
import { Button, Screen, TextField } from '../src/components';
import { partner } from '../src/data/partner';
import { identityFailText, identityLockedOut, openAccount, verifyIdentity } from '../src/fakebank';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../src/theme/tokens';

export default function IdentityCheckScreen() {
  const router = useRouter();
  const account = useApp((s) => s.account);
  const fails = useApp((s) => s.identityFails);
  const identityPassed = useApp((s) => s.identityPassed);
  const identityFailed = useApp((s) => s.identityFailed);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bvn, setBvn] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const lockedOut = identityLockedOut(fails, Date.now());

  const submit = async () => {
    if (!firstName.trim() || !lastName.trim()) return setFieldError('Enter your first and last name.');
    if (!/^\d{11}$/.test(bvn)) return setFieldError('A BVN is 11 digits.');
    setFieldError(null);
    setChecking(true);
    const result = await verifyIdentity({ bvn, firstName, lastName, dateOfBirth: account?.dateOfBirth ?? '' });
    setChecking(false);
    if (!result.ok) {
      identityFailed(Date.now());
      setFailure(identityFailText[result.reason]);
      return;
    }
    const opened = openAccount({ firstName: result.firstName, lastName: result.lastName, phone: account?.phone ?? '' });
    identityPassed({ firstName: result.firstName, lastName: result.lastName }, opened, Date.now());
    setBvn(''); // never keep the BVN
    router.replace('/your-spreadit-account');
  };

  const tryAgain = () => {
    setFailure(null);
    setBvn('');
  };

  if (lockedOut) {
    return (
      <Screen title="Identity check">
        <View style={styles.card} accessible accessibilityRole="alert">
          <LifeBuoy size={size.icon} color={colors.ink} strokeWidth={1.75} />
          <Text style={styles.headline}>Let's sort this out together</Text>
          <Text style={styles.body}>
            Your BVN didn't match 3 times in the last 24 hours. Please contact support and we'll help you finish.
          </Text>
          <Text style={styles.headline}>{partner.supportContact}</Text>
        </View>
        <Button label="Get help" variant="secondary" onPress={() => router.push('/get-help')} />
      </Screen>
    );
  }

  if (failure) {
    return (
      <Screen
        title="We couldn’t confirm it’s you"
        footer={<Button label="Try again" variant="primary" onPress={tryAgain} />}
      >
        <View style={[styles.card, styles.failCard]} accessible accessibilityRole="alert" accessibilityLabel={`Didn’t match. ${failure}`}>
          <View style={styles.failRow}>
            <CircleX size={size.icon} color={colors.critical} strokeWidth={1.75} />
            <Text style={styles.failWord}>Didn’t match</Text>
          </View>
          <Text style={styles.body}>{failure}</Text>
        </View>
        <Text style={styles.muted}>
          {fails.filter((t) => Date.now() - t < 24 * 60 * 60 * 1000).length === 2
            ? 'You have 1 try left today.'
            : 'Check your details and try again.'}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen
      title="Verify it’s you"
      subtitle="Your bank checks your BVN. We only keep the result, never the number."
      footer={
        <Button
          label={checking ? 'Checking…' : 'Verify'}
          variant="primary"
          disabled={checking}
          onPress={submit}
        />
      }
    >
      <TextField label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" autoComplete="given-name" />
      <TextField label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" autoComplete="family-name" helper="Exactly as your bank has it." />
      <TextField
        label="BVN"
        value={bvn}
        onChangeText={(t) => setBvn(t.replace(/\D/g, '').slice(0, 11))}
        keyboardType="number-pad"
        maxLength={11}
        helper="11 digits. Dial *565*0# to find yours."
        error={fieldError}
      />
      {checking ? <Text style={styles.muted}>Checking with {partner.name}. This can take up to 2 minutes.</Text> : null}
      <Text style={styles.muted}>
        Demo: any 11 digits pass. Ending 000 = not found, 111 = name doesn't match, 222 = date of birth doesn't match.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[3], ...shadow.card },
  failCard: { backgroundColor: colors.criticalSoft },
  failRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  failWord: { ...type.headline, color: colors.critical },
  headline: { ...type.headline, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
