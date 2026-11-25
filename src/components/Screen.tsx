// Screen: the shared page layout for full-screen flows (onboarding, editors).
// Not a visual component: it only places the existing pieces (v4).
// - A round Back button (when there is somewhere to go back to) and, for steps,
//   a segmented progress bar ("Step 2 of 4" is still read out to screen readers).
// - Title and subtitle, scrolling content on the white canvas, 16px side margins.
// - Footer buttons pinned above the keyboard (design system "Forms").
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors, layout, radius, size, space, type } from '../theme/tokens';

export interface ScreenProps {
  title: string;
  /** e.g. "Step 2 of 4" — drawn as a progress bar, read out as words. */
  step?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** Overrides Back (for steps inside one screen). Pass null to hide Back. */
  onBack?: (() => void) | null;
  /** Shown above the title, e.g. a round icon badge (S11). */
  top?: ReactNode;
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Back" hitSlop={space[2]} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
      <ChevronLeft size={size.icon} color={colors.ink} strokeWidth={1.75} />
    </Pressable>
  );
}

function parseStep(step?: string): { at: number; of: number } | null {
  const m = step ? /(\d+)\s+of\s+(\d+)/.exec(step) : null;
  return m ? { at: Number(m[1]), of: Number(m[2]) } : null;
}

export function Screen({ title, step, subtitle, children, footer, onBack, top }: ScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const back = onBack === null ? null : (onBack ?? (router.canGoBack() ? () => router.back() : null));
  const progress = parseStep(step);

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4] }]}
        keyboardShouldPersistTaps="handled"
      >
        {back || step ? (
          <View style={styles.topBar}>
            {back ? <BackButton onPress={back} /> : null}
            {progress ? (
              <View style={styles.progress} accessible accessibilityLabel={step}>
                {Array.from({ length: progress.of }, (_, i) => (
                  <View key={i} style={[styles.segment, i < progress.at && styles.segmentOn]} />
                ))}
              </View>
            ) : step ? (
              <Text style={styles.step}>{step}</Text>
            ) : null}
          </View>
        ) : null}
        {top}
        <View style={styles.head}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space[4] }]}>{footer}</View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.screenPadding, paddingBottom: space[6], gap: space[6] },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  back: {
    width: size.bubble,
    height: size.bubble,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  progress: { flex: 1, flexDirection: 'row', gap: space[1] },
  segment: { flex: 1, height: 4, borderRadius: radius.pill, backgroundColor: colors.line },
  segmentOn: { backgroundColor: colors.primary },
  head: { gap: space[2] },
  step: { ...type.label, color: colors.inkMuted },
  title: { ...type.title, color: colors.ink },
  subtitle: { ...type.body, color: colors.inkMuted },
  footer: { paddingHorizontal: layout.screenPadding, paddingTop: space[3], gap: space[2], backgroundColor: colors.canvas },
});
