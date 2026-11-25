// S27 Salary-switch kit (A10): a letter for HR with the user's full name, the
// account name exactly as the bank holds it, the account number, bank name and
// an effective-from date. Shared as text for now (founder decision, 24 Nov 2026:
// PDF later). -> S15.
// Offered once after 2 successful live paydays in Forward mode.
// ?salaryNow=1&sender=…: the first payment from someone other than the user
// asks "Is this your salary now?"; Yes stops Forward mode reminders.
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, OptionList, Screen } from '../src/components';
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
      <Screen title="Salary-switch kit" footer={<Button label="Back to Home" variant="secondary" onPress={home} />}>
        <Text style={styles.body}>The letter needs your SpreadIT account. It opens once your identity check passes.</Text>
      </Screen>
    );
  }

  const fullName = `${identity.firstName} ${identity.lastName}`;
  const create = () => setLetter(hrLetter({ fullName, account, effectiveFrom: when === 'after' ? afterDate : nextDate, today }));

  return (
    <Screen
      title="Salary-switch kit"
      subtitle="Ask HR to pay your salary straight into SpreadIT. Then it splits with nothing for you to do."
      footer={
        <>
          {letter ? (
            <Button label="Share letter" variant="primary" onPress={() => Share.share({ message: letter })} />
          ) : (
            <Button label="Create letter" variant="primary" onPress={create} />
          )}
          <Button label="Back to Home" variant="quiet" onPress={home} />
        </>
      }
    >
      {salaryNow && answered === null ? (
        <View style={styles.card}>
          <Text style={styles.heading}>Is this your salary now?</Text>
          <Text style={styles.body}>A payment came from {sender || 'someone else'}, not your own account.</Text>
          <Button label="Yes" variant="secondary" accessibilityHint="Stops Forward mode reminders" onPress={() => answer(true)} />
          <Button label="No" variant="quiet" onPress={() => answer(false)} />
        </View>
      ) : null}
      {answered === 'yes' ? (
        <Text style={styles.message} accessibilityLiveRegion="polite">
          Great. Forward mode reminders are off: your salary now comes straight in.
        </Text>
      ) : null}

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
          <View style={styles.card} accessible>
            <Text style={styles.heading}>Your letter will show</Text>
            <Text style={styles.body}>Full name: {fullName}</Text>
            <Text style={styles.body}>Account name: {account.accountName}</Text>
            <Text style={styles.body}>Account number: {account.accountNumber}</Text>
            <Text style={styles.body}>Bank: {account.bankName}</Text>
          </View>
          <Text style={styles.heading}>Pay into SpreadIT from</Text>
          <OptionList
            accessibilityLabel="Pay into SpreadIT from"
            options={[
              { value: 'next', label: longDate(nextDate), description: next ? 'Your next payday' : 'The 1st of next month' },
              { value: 'after', label: longDate(afterDate), description: 'Gives HR a full pay cycle' },
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
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[3], ...shadow.card },
  heading: { ...type.titleSm, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  letter: { ...type.body, color: colors.ink },
  message: { ...type.bodyStrong, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
