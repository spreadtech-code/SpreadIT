// PIN and face unlock (founder addition, 25 Nov 2026; Figma "8 · More screens /
// PIN and face unlock"), from Profile > Security.
// - Change PIN: current PIN, new PIN, the same again (change-pin).
// - Unlock with face or fingerprint: the saved choice. Prototype: it is only a
//   setting for now; real face and fingerprint unlock needs an extra library.
// - Auto-lock: after 5 minutes in the background (F5), shown as information.
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Fingerprint, KeyRound, Lock } from 'lucide-react-native';
import { Notice, Screen, SettingsGroup, SettingsRow } from '../src/components';
import { useApp } from '../src/state/appStore';
import { colors, type } from '../src/theme/tokens';

export default function PinAndUnlockScreen() {
  const router = useRouter();
  const biometric = useApp((s) => s.pin.biometric);
  const setBiometric = useApp((s) => s.setBiometric);

  return (
    <Screen title="PIN and face unlock" subtitle="Your PIN approves every money move.">
      <SettingsGroup>
        <SettingsRow label="Change PIN" Icon={KeyRound} onPress={() => router.push('/change-pin')} />
        <SettingsRow
          label="Unlock with face or fingerprint"
          Icon={Fingerprint}
          accessibilityHint="Your PIN still works too."
          switchValue={biometric}
          onSwitch={setBiometric}
        />
        <SettingsRow label="Auto-lock" Icon={Lock} value="After 5 min" accessibilityHint="After 5 minutes in the background, SpreadIT asks for your PIN." />
      </SettingsGroup>
      <Notice text="We’ll never ask for your PIN by phone, SMS or email." />
      <Text style={styles.note}>Prototype: face and fingerprint unlock is saved as a choice only. Your PIN unlocks the app.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { ...type.label, color: colors.inkMuted },
});
