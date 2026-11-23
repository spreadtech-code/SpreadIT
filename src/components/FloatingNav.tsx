// FloatingNav (docs/design-system.md): a white pill floating 16px above the
// safe-area bottom, 20px from each side. Four destinations; the active one is
// an aqua pill with ink icon and label, the rest are ink-muted.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { House, ListChecks, ArrowLeftRight, UserRound, type LucideIcon } from 'lucide-react-native';
import { colors, radius, shadow, size, space, type } from '../theme/tokens';

/** The four nav destinations, keyed by route name in app/(tabs)/. */
export const navItems: Record<string, { label: string; Icon: LucideIcon }> = {
  home: { label: 'Home', Icon: House },
  'plan-builder': { label: 'Plan', Icon: ListChecks },
  'income-history': { label: 'Activity', Icon: ArrowLeftRight },
  settings: { label: 'Profile', Icon: UserRound },
};

/** Bottom padding a scrolling screen needs so its content clears the nav. */
export function floatingNavInset(safeAreaBottom: number): number {
  return size.navHeight + space[4] + safeAreaBottom + space[4];
}

export function FloatingNav({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View
      style={[styles.bar, { bottom: insets.bottom + space[4] }]}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const item = navItems[route.name];
        if (!item) return null;
        const focused = index === state.index;
        const { options } = descriptors[route.key];

        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        };
        const tint = focused ? colors.onBrand : colors.inkMuted;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? item.label}
            style={[styles.item, focused && styles.itemActive]}
          >
            <item.Icon size={size.icon} color={tint} strokeWidth={1.75} />
            <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: space[5],
    right: space[5],
    minHeight: size.navHeight,
    flexDirection: 'row',
    alignItems: 'center',
    padding: space[1],
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    ...shadow.float,
  },
  item: {
    flex: 1,
    minHeight: size.navHeight - space[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    gap: space[1],
  },
  itemActive: { backgroundColor: colors.brand },
  label: { ...type.caption },
});
