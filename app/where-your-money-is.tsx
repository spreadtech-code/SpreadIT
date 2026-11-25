// S11 Where your money is (A5), v4 layout (Figma "S11 Where your money is"):
// before the identity check, explain that the money sits in an account in the
// user's own name at the partner bank, and that SpreadIT can only send it where
// the plan says. The user can't continue until they tap "Got it" (PRD wording
// "I understand"; app words in docs/copy.md). Links to a 1-page explainer.
// Wording to be approved by the compliance owner before the live pilot.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Landmark, ListChecks, Pause, ShieldCheck } from 'lucide-react-native';
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
      title="Your money stays yours"
      subtitle="Before we open your account, here’s how it works."
      top={
        <View style={styles.badge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ShieldCheck size={size.iconLarge} color={colors.onPrimary} strokeWidth={1.75} />
        </View>
      }
      footer={
        <>
          <Button label="Got it" variant="primary" accessibilityHint="Confirms you understand where your money is" onPress={next} />
          <Button label="How it works" variant="quiet" onPress={() => setExplainer(true)} />
        </>
      }
    >
      <View style={styles.card}>
        <Point Icon={Landmark} title="It’s in your name" text={`Your SpreadIT account is held in your own name at ${partner.name}.`} />
        <Point Icon={ListChecks} title="Only your plan moves it" text="We can only send money where your plan says, or back to you." />
        <Point Icon={Pause} title="Stop it any time" text="One tap pauses everything. No questions." />
      </View>

      <Sheet visible={explainer} title="How your SpreadIT account works" onClose={() => setExplainer(false)}>
        <Text style={styles.body}>
          When you turn on Autopilot, {partner.name} opens an account in your name. Your pay goes into it, either paid in
          directly or forwarded by you.
        </Text>
        <Text style={styles.body}>
          SpreadIT has permission to give instructions on the account, and only the ones your plan sets out: send each
          rule’s amount to its account, send what’s left to your leftovers account, and send anything that fails to your
          backup account.
        </Text>
        <Text style={styles.body}>
          SpreadIT can’t send money anywhere else. Changing where money goes needs a 6-digit code, and a new account only
          starts getting paid after 24 hours.
        </Text>
        <Text style={styles.body}>
          Before any payday is split, you get time to check it: send it now, hold it or stop it. Pause everything stops it
          all at once.
        </Text>
        <Text style={styles.note}>This is a prototype. No real account is opened and no real money moves.</Text>
      </Sheet>
    </Screen>
  );
}

function Point({ Icon, title, text }: { Icon: typeof Landmark; title: string; text: string }) {
  return (
    <View style={styles.point} accessible accessibilityLabel={`${title}. ${text}`}>
      <View style={styles.bubble}>
        <Icon size={size.icon} color={colors.primary} strokeWidth={1.75} />
      </View>
      <View style={styles.pointText}>
        <Text style={styles.pointTitle}>{title}</Text>
        <Text style={styles.muted}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[4], gap: space[4], ...shadow.card },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  bubble: {
    width: size.bubble,
    height: size.bubble,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: { flex: 1, gap: space[1] },
  pointTitle: { ...type.bodyStrong, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
  body: { ...type.body, color: colors.ink },
  note: { ...type.label, color: colors.inkMuted },
});
