// AlertBanner (added stage 5, founder-approved): the prototype's pretend push
// notification. A white card that slides down under the status bar over any
// screen. Tapping it opens the screen it names; the close button dismisses it.
// One at a time: the next waits until this one is gone.
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, X } from 'lucide-react-native';
import { colors, radius, shadow, size, space, type } from '../theme/tokens';

export interface AlertBannerProps {
  title: string;
  body: string;
  onOpen: () => void;
  onClose: () => void;
}

export function AlertBanner({ title, body, onOpen, onClose }: AlertBannerProps) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    slide.setValue(-1);
    Animated.timing(slide, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  }, [title, body, slide]);

  const translateY = slide.interpolate({ inputRange: [-1, 0], outputRange: [-200, 0] });

  return (
    <Animated.View
      style={[styles.wrap, { top: insets.top + space[2], transform: [{ translateY }] }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.card}>
        <Pressable
          style={styles.main}
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={`Notification. ${title}. ${body}`}
          accessibilityHint="Opens it"
        >
          <View style={styles.iconCircle}>
            <Bell size={size.icon} color={colors.ink} strokeWidth={1.75} />
          </View>
          <View style={styles.text}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          hitSlop={space[1]}
          style={styles.close}
        >
          <X size={size.icon} color={colors.inkMuted} strokeWidth={1.75} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space[3], right: space[3], zIndex: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingLeft: space[4],
    paddingRight: space[1],
    paddingVertical: space[3],
    ...shadow.float,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[3] },
  iconCircle: {
    width: size.iconCircle,
    height: size.iconCircle,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: space[1] },
  title: { ...type.headline, color: colors.ink },
  body: { ...type.label, color: colors.inkMuted },
  close: { width: size.touchMin, height: size.touchMin, alignItems: 'center', justifyContent: 'center' },
});
