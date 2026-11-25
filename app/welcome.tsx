// S1 Welcome (v4, Figma "S1 Welcome"): a pale-blue page with the SpreadIT mark,
// one big promise, one line of detail, "Get started" (sign up, S2) and
// "Log in" (S31). PRD wording "Sign up / Sign in" maps to these (docs/copy.md).
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../src/components';
import { colors, layout, radius, space, type } from '../src/theme/tokens';

/** The SpreadIT mark: three bars, one payday spread three ways. */
export function Wordmark() {
  return (
    <View style={styles.brand} accessible accessibilityRole="header" accessibilityLabel="SpreadIT">
      <View style={styles.mark}>
        <View style={[styles.bar, { width: space[6] }]} />
        <View style={[styles.bar, { width: space[5] }]} />
        <View style={[styles.bar, { width: space[3] }]} />
      </View>
      <Text style={styles.wordmark}>SpreadIT</Text>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.page, { paddingTop: insets.top + space[6], paddingBottom: insets.bottom + space[4] }]}>
      <Wordmark />

      <View style={styles.bottom}>
        <View style={styles.copy}>
          <Text style={styles.headline}>Every payday, sorted before you spend it.</Text>
          <Text style={styles.text}>
            Family, rent, tithe, savings. SpreadIT splits your pay the moment it lands, so every plan gets paid first.
          </Text>
        </View>
        <Button label="Get started" variant="primary" onPress={() => router.push('/sign-up')} />
        <Pressable
          onPress={() => router.push('/sign-in')}
          accessibilityRole="button"
          accessibilityLabel="Log in"
          accessibilityHint="For people who already have an account."
          style={styles.login}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginStrong}>Log in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.brandSoft, paddingHorizontal: layout.screenPadding },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  mark: { gap: 3 },
  bar: { height: 6, borderRadius: radius.pill, backgroundColor: colors.onBrand },
  wordmark: { ...type.titleSm, color: colors.onBrand },
  bottom: { marginTop: 'auto', gap: space[4] },
  copy: { gap: space[4] },
  headline: { ...type.display, color: colors.onBrand },
  text: { ...type.body, color: colors.onBrand },
  login: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  loginText: { ...type.label, color: colors.onBrand },
  loginStrong: { ...type.labelStrong, color: colors.onBrand },
});
