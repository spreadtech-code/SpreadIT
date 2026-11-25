// NavBar (docs/design-system.md v4, Figma "NavBar"): a white bar fixed to the bottom
// with rounded top corners and the card shadow. Icons only (each has a spoken label);
// the active tab is deep blue with a small dot, the rest faint grey. A raised
// pale-blue centre button opens the Payday Simulator (S10), SpreadIT's signature action.
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { ArrowLeftRight, Calculator, House, ListChecks, UserRound, type LucideIcon } from 'lucide-react-native';
import { colors, radius, shadow, size, space } from '../theme/tokens';

/** The four tab destinations, keyed by route name in app/(tabs)/. */
export const navItems: Record<string, { label: string; Icon: LucideIcon }> = {
  home: { label: 'Home', Icon: House },
  'plan-builder': { label: 'Plan', Icon: ListChecks },
  'income-history': { label: 'Activity', Icon: ArrowLeftRight },
  settings: { label: 'Profile', Icon: UserRound },
};

/** Bottom padding a scrolling screen needs so its content clears the nav. */
export function floatingNavInset(safeAreaBottom: number): number {
  return size.navHeight + safeAreaBottom + space[6];
}

export function FloatingNav({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const router = useRouter();
  const tabs = state.routes.map((route, index) => ({ route, index })).filter(({ route }) => navItems[route.name]);

  const tab = ({ route, index }: (typeof tabs)[number]) => {
    const item = navItems[route.name];
    const focused = index === state.index;
    const { options } = descriptors[route.key];
    const onPress = () => {
      const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigateToTab(route.key);
    };
    const tint = focused ? colors.primary : colors.inkFaint;
    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={options.tabBarAccessibilityLabel ?? item.label}
        style={styles.item}
      >
        <item.Icon size={24} color={tint} strokeWidth={1.75} />
        <View style={[styles.dot, focused && styles.dotOn]} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + space[2] }]} accessibilityRole="tablist">
      {tabs.slice(0, 2).map(tab)}
      <View style={styles.item}>
        <Pressable
          onPress={() => router.push('/payday-simulator')}
          accessibilityRole="button"
          accessibilityLabel="Simulate a payday"
          style={({ pressed }) => [styles.centre, pressed && styles.pressed]}
        >
          <Calculator size={24} color={colors.primary} strokeWidth={1.75} />
        </Pressable>
      </View>
      {tabs.slice(2).map(tab)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: size.navHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: space[2],
    paddingHorizontal: space[4],
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...shadow.card,
  },
  item: { flex: 1, minHeight: size.touchMin + space[2], alignItems: 'center', justifyContent: 'center', gap: space[1] },
  dot: { width: 4, height: 4, borderRadius: radius.pill, backgroundColor: 'transparent' },
  dotOn: { backgroundColor: colors.primary },
  centre: {
    width: size.navCentre,
    height: size.navCentre,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
});
