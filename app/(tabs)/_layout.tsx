import { Tabs } from 'expo-router';
import { FloatingNav } from '../../src/components/FloatingNav';
import { colors } from '../../src/theme/tokens';

// The four screens behind the floating nav. Every other screen is full screen, with no nav.
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingNav {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="plan-builder" options={{ title: 'Plan' }} />
      <Tabs.Screen name="income-history" options={{ title: 'Activity' }} />
      <Tabs.Screen name="settings" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
