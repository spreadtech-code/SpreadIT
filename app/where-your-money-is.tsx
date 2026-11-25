// S11 Where your money is (A5): before the identity check, explain that the
// money sits in an account in the user's own name at the partner bank, and
// that SpreadIT can only send it where the plan says. The user can't continue
// until they tap "I understand". Links to a 1-page explainer.
// Wording to be approved by the compliance owner before the live pilot.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Landmark, ListChecks, PauseCircle } from 'lucide-react-native';
import { Button, Screen, Sheet } from '../src/components';
import { partner } from '../src/data/partner';
import { goLiveRoute, useApp } from '../src/state/appStore';
import { colors, radius, shadow, size, space, type } from '../src/theme/tokens';

export default function WhereYourMoneyIsScreen() {
  const router = useRouter();
  const understand = useApp((s) => s.understandCustody);
  const [explainer, setExplainer] = useState(false);

  const next = () => {
    understand();
    const s = useApp.getState();
    router.replace(goLiveRoute(s));
  };

  return (
    <Screen
      title="Where your money is"
      footer={<Button label="I understand" variant="primary" onPress={next} />}
    >
      <View style={styles.card}>
        <Text style={styles.lead}>
          Your SpreadIT account is in your name at {partner.name}. SpreadIT can only move money the way your plan says.
        </Text>
      </View>

      <View style={styles.card}>
        <Point Icon={Landmark} text={`The account is yours, in your own name, at ${partner.name}.`} />
        <Point Icon={ListChecks} text="SpreadIT can only send money to the accounts in your plan, or back to your own account." />
        <Point Icon={PauseCircle} text="You can pause everything at any time with Emergency pause." />
      </View>

      <Button label="Read how it works" variant="quiet" onPress={() => setExplainer(true)} />

      <Sheet visible={explainer} title="How your SpreadIT account works" onClose={() => setExplainer(false)}>
        <Text style={styles.body}>
          When you switch on automation, {partner.name} opens an account in your name. Your income goes into it, either
          paid in directly or forwarded by you.
        </Text>
        <Text style={styles.body}>
          SpreadIT has permission to give instructions on the account, and only the ones your plan sets out: send each
          rule's amount to its account, send what's left to your remainder account, and send anything that fails to your
          fallback account.
        </Text>
        <Text style={styles.body}>
          SpreadIT can't send money anywhere else. Changing where money goes needs a one-time code, and a new account
          only becomes active after 24 hours.
        </Text>
        <Text style={styles.body}>
          Before any payday is split, you get a review window to execute, pause or cancel. Emergency pause stops
          everything at once.
        </Text>
        <Text style={styles.note}>This is a prototype. No real account is opened and no real money moves.</Text>
      </Sheet>
    </Screen>
  );
}

function Point({ Icon, text }: { Icon: typeof Landmark; text: string }) {
  return (
    <View style={styles.point} accessible accessibilityLabel={text}>
      <View style={styles.iconCircle}>
        <Icon size={size.icon} color={colors.ink} strokeWidth={1.75} />
      </View>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[4], ...shadow.card },
  lead: { ...type.headline, color: colors.ink },
  point: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  iconCircle: {
    width: size.bubble,
    height: size.bubble,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { ...type.body, color: colors.ink, flex: 1 },
  note: { ...type.label, color: colors.inkMuted },
});
