// Screen: the shared page layout for full-screen flows (onboarding, editors).
// Not a visual component: it only places the existing pieces.
// - Back row (when there is somewhere to go back to), optional step line, title.
// - Scrolling content on the white canvas.
// - Footer buttons pinned above the keyboard (design system "Forms").
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors, size, space, type } from '../theme/tokens';

export interface ScreenProps {
  title: string;
  /** e.g. "Step 2 of 4". */
  step?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** Overrides Back (for steps inside one screen). Pass null to hide Back. */
  onBack?: (() => void) | null;
}

export function Screen({ title, step, subtitle, children, footer, onBack }: ScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const back = onBack === null ? null : (onBack ?? (router.canGoBack() ? () => router.back() : null));

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4] }]}
        keyboardShouldPersistTaps="handled"
      >
        {back ? (
          <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back" hitSlop={space[2]} style={styles.back}>
            <ChevronLeft size={size.icon} color={colors.ink} strokeWidth={1.75} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}
        <View style={styles.head}>
          {step ? <Text style={styles.step}>{step}</Text> : null}
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
  content: { paddingHorizontal: space[5], paddingBottom: space[6], gap: space[5] },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', minHeight: size.touchMin, gap: space[1] },
  backText: { ...type.bodyStrong, color: colors.ink },
  head: { gap: space[2] },
  step: { ...type.label, color: colors.inkMuted },
  title: { ...type.title, color: colors.ink },
  subtitle: { ...type.body, color: colors.inkMuted },
  footer: { paddingHorizontal: space[5], paddingTop: space[3], gap: space[2], backgroundColor: colors.canvas },
});
