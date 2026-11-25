// S13 Your SpreadIT account (A7): bank name, account number and account name
// (the user's own name, no "SpreadIT" prefix). "Copy details" copies all 3 in
// one tap; "Share" opens the phone's share sheet with them as text.
// Next: S26 Forward mode setup if income is forwarded, otherwise S14.
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { CircleCheck } from 'lucide-react-native';
import { Button, Notice, Screen } from '../src/components';
import { accountDetailsText } from '../src/fakebank';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../src/theme/tokens';

export default function YourSpreaditAccountScreen() {
  const router = useRouter();
  const account = useApp((s) => s.spreaditAccount);
  const arrival = useApp((s) => s.income?.arrival);
  const firstName = useApp((s) => s.identity?.firstName);
  const automationOn = useApp((s) => s.automation.on);
  const [copied, setCopied] = useState(false);

  if (!account) {
    return (
      <Screen title="Your SpreadIT account" footer={<Button label="Go to identity check" variant="primary" onPress={() => router.replace('/identity-check')} />}>
        <Text style={styles.body}>Your account opens once your identity check passes.</Text>
      </Screen>
    );
  }

  const text = accountDetailsText(account);
  const copy = async () => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
  };
  const share = () => Share.share({ message: text });
  // Once Autopilot is on (opened from Profile), this is just the details: Done goes back.
  const next = () => (automationOn ? router.back() : router.push(arrival === 'forward' ? '/forward-mode-setup' : '/switch-on-automation'));

  return (
    <Screen
      title={automationOn ? 'Your SpreadIT account' : firstName ? `You’re all set, ${firstName}` : 'You’re all set'}
      subtitle="This is your SpreadIT account. Your pay lands here."
      footer={<Button label={automationOn ? 'Done' : 'Continue'} variant="primary" onPress={next} />}
    >
      <View
        style={styles.card}
        accessible
        accessibilityLabel={`${account.bankName}. Account number ${account.accountNumber.split('').join(' ')}. ${account.accountName}.`}
      >
        <Text style={styles.small}>{account.bankName}</Text>
        <Text style={styles.number} selectable>
          {account.accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')}
        </Text>
        <Text style={styles.small}>{account.accountName}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.flex}>
          <Button label="Copy details" variant="secondary" onPress={copy} accessibilityHint="Copies bank, account number and name" />
        </View>
        <View style={styles.flex}>
          <Button label="Share" variant="secondary" onPress={share} />
        </View>
      </View>
      {copied ? (
        <View style={styles.copied} accessibilityLiveRegion="polite" accessible accessibilityLabel="Copied">
          <CircleCheck size={size.icon} color={colors.success} strokeWidth={1.75} />
          <Text style={styles.copiedText}>Copied</Text>
        </View>
      ) : null}
      {automationOn ? null : (
        <Notice
          text={
            arrival === 'forward'
              ? 'Next: set up how your pay reaches this account.'
              : 'Give these details to whoever pays you, or forward your pay here.'
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.brand, borderRadius: radius.lg, padding: space[5], gap: space[2] },
  small: { ...type.labelStrong, color: colors.onBrand },
  number: { ...type.amountXl, color: colors.onBrand, fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', gap: space[2] },
  flex: { flex: 1 },
  copied: { flexDirection: 'row', alignItems: 'center', gap: space[2], alignSelf: 'center' },
  copiedText: { ...type.bodyStrong, color: colors.success },
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
