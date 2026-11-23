// S3 Verify phone and email (A1): 6-digit SMS code (expires after 10 minutes)
// and an email link. Pretend: the code is shown on screen, and a button stands
// in for tapping the link in the email.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck, Mail } from 'lucide-react-native';
import { Button, FieldError, InsightCard, PinField, PIN_LENGTH, Screen } from '../src/components';
import { colors, radius, shadow, size, space, type } from '../src/theme/tokens';
import { useApp } from '../src/state/appStore';

export default function VerifyPhoneEmailScreen() {
  const router = useRouter();
  const account = useApp((s) => s.account);
  const smsCode = useApp((s) => s.smsCode);
  const sendSmsCode = useApp((s) => s.sendSmsCode);
  const verifySmsCode = useApp((s) => s.verifySmsCode);
  const confirmEmail = useApp((s) => s.confirmEmail);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!account) return null;
  const phoneDone = account.phoneVerified;
  const emailDone = account.emailVerified;

  const finish = (phoneOk: boolean) => {
    if (phoneOk && useApp.getState().account?.emailVerified) router.replace('/set-pin');
  };

  const submit = () => {
    setError(null);
    if (phoneDone) {
      if (!emailDone) setError('Confirm your email to continue.');
      else finish(true);
      return;
    }
    if (code.length < PIN_LENGTH) return setError('Enter all 6 digits.');
    const result = verifySmsCode(code, Date.now());
    if (result === 'wrong') return setError("That code isn't right. Check it and try again.");
    if (result === 'expired') return setError('This code has expired. Tap "Resend code".');
    if (!useApp.getState().account?.emailVerified) setError('Phone confirmed. Now confirm your email.');
    finish(true);
  };

  return (
    <Screen
      step="Sign up · Check it's you"
      title="Verify phone and email"
      onBack={null}
      footer={<Button label="Submit code" variant="primary" onPress={submit} />}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Phone {account.phone}</Text>
        {phoneDone ? (
          <Done text="Phone confirmed" />
        ) : (
          <>
            {smsCode ? (
              <InsightCard title="Pretend SMS" text={`Your SpreadIT code is ${smsCode.code}. It expires in 10 minutes. In the real app this comes by SMS.`} />
            ) : null}
            <PinField label="6-digit code" value={code} onChange={setCode} masked={false} error={error} />
            <Button
              label="Resend code"
              variant="quiet"
              onPress={() => {
                sendSmsCode();
                setCode('');
                setError(null);
              }}
            />
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Email {account.email}</Text>
        {emailDone ? (
          <Done text="Email confirmed" />
        ) : (
          <>
            <View style={styles.row}>
              <Mail size={size.icon} color={colors.ink} strokeWidth={1.75} />
              <Text style={styles.body}>We sent a link to your email. Tap it to confirm.</Text>
            </View>
            <Button
              label="Open the email link (pretend)"
              variant="secondary"
              onPress={() => {
                confirmEmail();
                setError(null);
                finish(useApp.getState().account?.phoneVerified ?? false);
              }}
            />
          </>
        )}
      </View>
      {phoneDone && error ? <FieldError message={error} /> : null}
    </Screen>
  );
}

function Done({ text }: { text: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={text}>
      <CircleCheck size={size.icon} color={colors.success} strokeWidth={1.75} />
      <Text style={styles.done}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[4], ...shadow.card },
  cardTitle: { ...type.headline, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  body: { ...type.body, color: colors.ink, flex: 1 },
  done: { ...type.bodyStrong, color: colors.success },
});
