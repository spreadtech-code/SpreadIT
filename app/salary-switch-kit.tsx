// S27 Salary-switch kit (A10), shown as "Move your salary here": a letter for HR with the user's full name, the
// account name exactly as the bank holds it, the account number, bank name and
// an effective-from date. Shared as text for now (founder decision, 24 Nov 2026:
// PDF later). -> S15.
// Offered once after 2 successful live paydays in Forward mode.
// ?salaryNow=1&sender=…: the first payment from someone other than the user
// asks "Is this your salary now?"; Yes stops Forward mode reminders.
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send } from 'lucide-react-native';
import { Button, InfoRow, Notice, OptionList, Screen } from '../src/components';
import { now } from '../src/fakebank/bankStore';
import { hrLetter, longDate } from '../src/lib/hrLetter';
import { payDates } from '../src/lib/payDates';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

export default function SalarySwitchKitScreen() {
  const router = useRouter();
  const { salaryNow, sender } = useLocalSearchParams<{ salaryNow?: string; sender?: string }>();
  const identity = useApp((s) => s.identity);
  const account = useApp((s) => s.spreaditAccount);
  const income = useApp((s) => s.income);
  const saveIncome = useApp((s) => s.saveIncome);
  const [answered, setAnswered] = useState<'yes' | 'no' | null>(null);
  const [when, setWhen] = useState<'next' | 'after' | null>('next');
  const [letter, setLetter] = useState<string | null>(null);

  const home = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/home');
  };

  const today = new Date(now());
  const next = income ? payDates(income, today).next : null;
  const nextDate = next ?? new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const afterDate = income && next ? (payDates(income, next).next ?? nextDate) : new Date(today.getFullYear(), today.getMonth() + 2, 1);

  const answer = (yes: boolean) => {
    setAnswered(yes ? 'yes' : 'no');
    if (yes && income) saveIncome({ ...income, arrival: 'direct' });
  };

  if (!identity || !account) {
    return (
      <Screen title="Move your salary here" footer={<Button label="Back to Home" variant="secondary" onPress={home} />}>
        <Text style={styles.body}>The letter needs your SpreadIT account. It opens once your identity check passes.</Text>
      </Screen>
    );
  }

  const fullName = `${identity.firstName} ${identity.lastName}`;
  const create = () => setLetter(hrLetter({ fullName, account, effectiveFrom: when === 'after' ? afterDate : nextDate, today }));

  return (
    <Screen
      title="Move your salary here"
      subtitle="Ask HR to pay straight into SpreadIT. Then payday splits with nothing to do."
      footer={
        <>
          {letter ? (
            <Button label="Share the letter" icon={Send} variant="primary" accessibilityHint="Shares it as text" onPress={() => Share.share({ message: letter })} />
          ) : (
            <Button label="Create the letter" variant="primary" onPress={create} />
          )}
          <Button label="Maybe later" variant="quiet" onPress={home} />
        </>
      }
    >
      {salaryNow && answered === null ? (
        <View style={styles.ask}>
          <Text style={styles.heading}>Is this your salary now?</Text>
          <Text style={styles.body}>A payment came from {sender || 'someone else'}, not your own account.</Text>
          <Button label="Yes, it is" variant="primary" accessibilityHint="Stops Forward mode reminders" onPress={() => answer(true)} />
          <Button label="No" variant="quiet" onPress={() => answer(false)} />
        </View>
      ) : null}
      {answered === 'yes' ? <Notice text="Great. Forward mode reminders are off: your salary now comes straight in." /> : null}

      {letter ? (
        <View style={styles.card}>
          <Text style={styles.letter} selectable>
            {letter}
          </Text>
          <Text style={styles.muted}>Shared as text for now. Sign it, or send it from your work email.</Text>
          <Button label="Change the date" variant="quiet" onPress={() => setLetter(null)} />
        </View>
      ) : (
        <>
          <View style={styles.well}>
            <Text style={styles.small}>Your letter to HR will show</Text>
            <InfoRow label="Full name" value={fullName} />
            <InfoRow label="Account name" value={account.accountName} />
            <InfoRow label="Account number" value={account.accountNumber} />
            <InfoRow label="Bank" value={account.bankName} />
          </View>
          <Text style={styles.heading}>Start paying in from</Text>
          <OptionList
            accessibilityLabel="Start paying in from"
            options={[
              { value: 'next', label: longDate(nextDate), description: next ? 'Your next payday' : 'The 1st of next month' },
              { value: 'after', label: longDate(afterDate), description: 'Gives HR a full month' },
            ]}
            value={when}
            onChange={setWhen}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[4], gap: space[3], ...shadow.card },
  ask: { backgroundColor: colors.brandSoft, borderRadius: radius.lg, padding: space[4], gap: space[3] },
  well: { backgroundColor: colors.surfaceSunken, borderRadius: radius.lg, padding: space[4], gap: space[1] },
  heading: { ...type.headline, color: colors.ink },
  small: { ...type.labelStrong, color: colors.inkMuted, marginBottom: space[1] },
  body: { ...type.body, color: colors.ink },
  letter: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
