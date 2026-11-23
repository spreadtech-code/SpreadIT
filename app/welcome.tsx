// S1 Welcome: explains SpreadIT in 3 cards. Sign up -> S2, Sign in -> S31.
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, ShieldCheck, Split, type LucideIcon } from 'lucide-react-native';
import { Button } from '../src/components';
import { colors, fonts, radius, shadow, size, space, type } from '../src/theme/tokens';

const cards: { title: string; text: string; Icon: LucideIcon }[] = [
  {
    title: 'Your plan runs itself',
    text: 'When your income lands, SpreadIT sends it where you planned: family, rent, tithe, savings. Before you can spend it.',
    Icon: Split,
  },
  {
    title: 'See every naira first',
    text: 'Try your plan with pretend money. You see each amount and every bank fee before any real money moves.',
    Icon: Eye,
  },
  {
    title: 'You stay in control',
    text: 'Check each payday before it runs. Pause everything with one tap, any time.',
    Icon: ShieldCheck,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const cardWidth = width - space[5] * 2;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + space[3])));
  };

  return (
    <View style={[styles.page, { paddingTop: insets.top + space[6], paddingBottom: insets.bottom + space[4] }]}>
      <View style={styles.head}>
        <Text style={styles.wordmark} accessibilityRole="header">
          SpreadIT
        </Text>
        <Text style={styles.tagline}>Autopilot for your income.</Text>
      </View>

      <ScrollView
        horizontal
        snapToInterval={cardWidth + space[3]}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        contentContainerStyle={styles.cards}
        style={styles.cardScroller}
      >
        {cards.map((c, i) => (
          <View
            key={c.title}
            style={[styles.card, { width: cardWidth }]}
            accessible
            accessibilityLabel={`Card ${i + 1} of ${cards.length}. ${c.title}. ${c.text}`}
          >
            <View style={styles.iconCircle}>
              <c.Icon size={size.icon} color={colors.ink} strokeWidth={1.75} />
            </View>
            <Text style={styles.cardTitle}>{c.title}</Text>
            <Text style={styles.cardText}>{c.text}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.pager} accessibilityElementsHidden importantForAccessibility="no">
        {page + 1} of {cards.length} · swipe for more
      </Text>

      <View style={styles.buttons}>
        <Button label="Sign up" variant="primary" onPress={() => router.push('/sign-up')} />
        <Button label="Sign in" variant="secondary" onPress={() => router.push('/sign-in')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas, gap: space[5] },
  head: { paddingHorizontal: space[5], gap: space[1] },
  wordmark: { ...type.title, fontFamily: fonts.extrabold, color: colors.ink },
  tagline: { ...type.body, color: colors.inkMuted },
  cardScroller: { flexGrow: 0 },
  cards: { paddingHorizontal: space[5], gap: space[3] },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space[6],
    gap: space[3],
    ...shadow.card,
  },
  iconCircle: {
    width: size.roundButton,
    height: size.roundButton,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { ...type.titleSm, color: colors.ink },
  cardText: { ...type.body, color: colors.ink },
  pager: { ...type.label, color: colors.inkMuted, textAlign: 'center' },
  buttons: { marginTop: 'auto', paddingHorizontal: space[5], gap: space[2] },
});
