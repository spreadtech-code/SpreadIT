// S13 Your SpreadIT account (A7): bank name, account number and account name
// (the user's own name, no "SpreadIT" prefix). "Copy details" copies all 3 in
// one tap; "Share" opens the phone's share sheet with them as text.
// Next: S26 Forward mode setup if income is forwarded, otherwise S14.
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { CircleCheck } from 'lucide-react-native';
import { Button, Screen } from '../src/components';
import { accountDetailsText } from '../src/fakebank';
import { useApp } from '../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../src/theme/tokens';

export default function YourSpreaditAccountScreen() {
  const router = useRouter();
  const account = useApp((s) => s.spreaditAccount);
  const arrival = useApp((s) => s.income?.arrival);
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
  const next = () => router.push(arrival === 'forward' ? '/forward-mode-setup' : '/switch-on-automation');

  return (
    <Screen
      title="Your SpreadIT account"
      subtitle="Your income goes here. It's in your name."
      footer={<Button label="Continue" variant="primary" onPress={next} />}
    >
      <View style={styles.card}>
        <Detail label="Bank" value={account.bankName} />
        <Detail label="Account number" value={account.accountNumber} large />
        <Detail label="Account name" value={account.accountName} />
      </View>

      <View style={styles.actions}>
        <Button label="Copy details" variant="secondary" onPress={copy} accessibilityHint="Copies bank, account number and name" />
        <Button label="Share" variant="secondary" onPress={share} />
      </View>
      {copied ? (
        <View style={styles.copied} accessibilityLiveRegion="polite" accessible accessibilityLabel="Copied">
          <CircleCheck size={size.icon} color={colors.success} strokeWidth={1.75} />
          <Text style={styles.copiedText}>Copied</Text>
        </View>
      ) : null}
      <Text style={styles.muted}>
        {arrival === 'forward'
          ? 'Next: set up Forward mode, so you can send your salary here on payday.'
          : 'Give these details to whoever pays you, or forward your income here.'}
      </Text>
    </Screen>
  );
}

function Detail({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <View style={styles.detail} accessible accessibilityLabel={`${label}: ${large ? value.split('').join(' ') : value}`}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={large ? styles.number : styles.value} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space[6], gap: space[4], ...shadow.card },
  detail: { gap: space[1] },
  value: { ...type.headline, color: colors.ink },
  number: { ...type.amountLg, color: colors.ink, fontVariant: ['tabular-nums'] },
  actions: { gap: space[2] },
  copied: { flexDirection: 'row', alignItems: 'center', gap: space[2], alignSelf: 'center' },
  copiedText: { ...type.bodyStrong, color: colors.success },
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
