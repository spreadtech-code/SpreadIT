// TEMPORARY (stage 1): a stand-in page for every PRD screen.
// Uses theme values and the real Button. Replaced by real screens in later stages.
// Hidden: hold the S22 Settings title for 1 second to open the Components screen.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BellRing, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, radius, shadow, size, space, type } from '../theme/tokens';
import { floatingNavInset } from '../components/FloatingNav';
import { Button, type ButtonVariant } from '../components/Button';
import { followAction } from './navigate';
import { screensById, type ScreenAction, type ScreenId } from './screens';

// Emergency cancel on the payday screen is a quiet button with critical text (design system).
const variantFor = (a: ScreenAction): ButtonVariant =>
  a.label === 'Emergency cancel' ? 'quietCritical' : (a.tone ?? 'secondary');

export function PlaceholderScreen({ id }: { id: ScreenId }) {
  const screen = screensById[id];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = screen.tab ? floatingNavInset(insets.bottom) : insets.bottom + space[5];

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space[4], paddingBottom: bottomInset },
      ]}
    >
      {!screen.tab && router.canGoBack() ? (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={space[2]}
          style={styles.back}
        >
          <ChevronLeft size={size.icon} color={colors.ink} strokeWidth={1.75} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.meta}>
          {screen.id} · Placeholder
        </Text>
        {id === 'S22' ? (
          <Pressable onLongPress={() => router.push('/components')} delayLongPress={1000}>
            <Text style={styles.title} accessibilityRole="header">
              {screen.name}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.title} accessibilityRole="header">
            {screen.name}
          </Text>
        )}
        <Text style={styles.body}>{screen.purpose}</Text>
      </View>

      {screen.banner ? (
        <View style={styles.card} accessibilityRole="summary">
          <Text style={styles.headline}>{screen.banner.text}</Text>
          <View style={styles.buttons}>
            {screen.banner.actions.map((action) => (
              <Button key={action.label} label={action.label} variant={variantFor(action)} onPress={() => followAction(router, action)} />
            ))}
          </View>
        </View>
      ) : null}

      {screen.actions.length > 0 ? (
        <View style={styles.buttons}>
          {screen.actions.map((action) => (
            <Button key={action.label} label={action.label} variant={variantFor(action)} onPress={() => followAction(router, action)} />
          ))}
        </View>
      ) : null}

      {screen.links && screen.links.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Also goes to</Text>
          {screen.links.map((link) => (
            <LinkRow key={link.label} action={link} onPress={() => followAction(router, link)} />
          ))}
        </View>
      ) : null}

      {screen.pretendPush && screen.pretendPush.length > 0 ? (
        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <BellRing size={size.icon} color={colors.ink} strokeWidth={1.75} />
            <Text style={styles.sectionTitle}>Pretend events</Text>
          </View>
          <Text style={styles.label}>
            Stand-ins for push notifications and the app reopening, until the fake bank is built.
          </Text>
          {screen.pretendPush.map((push) => (
            <LinkRow key={push.label} action={push} onPress={() => followAction(router, push)} />
          ))}
        </View>
      ) : null}

      {screen.later && screen.later.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Built in a later stage</Text>
          <Text style={styles.body}>{screen.later.join(', ')}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function LinkRow({ action, onPress }: { action: ScreenAction; onPress: () => void }) {
  const target = screensById[action.to];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${action.label}, opens ${target.id} ${target.name}`}
      style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
    >
      <View style={styles.linkText}>
        <Text style={styles.headline}>{action.label}</Text>
        <Text style={styles.label}>
          {target.id} · {target.name}
        </Text>
      </View>
      <ChevronRight size={size.icon} color={colors.inkMuted} strokeWidth={1.75} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: space[5], gap: space[4] },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: size.touchMin,
    gap: space[1],
  },
  backText: { ...type.bodyStrong, color: colors.ink },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[5],
    gap: space[2],
    ...shadow.card,
  },
  meta: { ...type.label, color: colors.inkMuted },
  title: { ...type.title, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  label: { ...type.label, color: colors.inkMuted },
  headline: { ...type.headline, color: colors.ink },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  sectionTitle: { ...type.titleSm, color: colors.ink },
  buttons: { gap: space[2] },
  pressed: { opacity: 0.7 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: size.touchMin,
    paddingVertical: space[2],
    gap: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  linkText: { flex: 1 },
});
