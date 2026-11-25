// AccountCard (docs/design-system.md v4, Figma "AccountCard"): a bank account on a
// white card: bank icon bubble, account name, bank and last 4 digits only, and an
// optional "Change" link.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Landmark } from 'lucide-react-native';
import { colors, radius, shadow, size, space, type } from '../theme/tokens';
import { maskAccount } from '../engine/format';

export interface AccountCardProps {
  accountName: string;
  bankName: string;
  accountNumber: string;
  onChange?: () => void;
}

export function AccountCard({ accountName, bankName, accountNumber, onChange }: AccountCardProps) {
  const masked = `${bankName} ${maskAccount(accountNumber)}`;
  return (
    <View style={styles.card}>
      <View style={styles.bubble}>
        <Landmark size={size.icon} color={colors.primary} strokeWidth={1.75} />
      </View>
      <View style={styles.text} accessible accessibilityLabel={`${accountName}, ${masked}`}>
        <Text style={styles.name}>{accountName}</Text>
        <Text style={styles.meta}>{masked}</Text>
      </View>
      {onChange ? (
        <Pressable
          onPress={onChange}
          accessibilityRole="button"
          accessibilityLabel={`Change account: ${accountName}`}
          hitSlop={space[2]}
          style={styles.change}
        >
          <Text style={styles.changeText}>Change</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  bubble: {
    width: size.bubble,
    height: size.bubble,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: space[1] },
  name: { ...type.bodyStrong, color: colors.ink },
  meta: { ...type.label, color: colors.inkMuted },
  change: { minHeight: size.touchMin, justifyContent: 'center' },
  changeText: { ...type.labelStrong, color: colors.primary },
});
