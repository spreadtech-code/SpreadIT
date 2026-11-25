import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Import each weight on its own so only these 4 font files ship in the app.
import { HostGrotesk_400Regular } from '@expo-google-fonts/host-grotesk/400Regular';
import { HostGrotesk_500Medium } from '@expo-google-fonts/host-grotesk/500Medium';
import { HostGrotesk_600SemiBold } from '@expo-google-fonts/host-grotesk/600SemiBold';
import { colors } from '../src/theme/tokens';
import { useHydrated } from '../src/state/appStore';
import { PaydayRunner, usePaydaysHydrated } from '../src/payday/PaydayRunner';

// Keep the splash screen up until the fonts and the saved demo data have loaded.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    HostGrotesk_400Regular,
    HostGrotesk_500Medium,
    HostGrotesk_600SemiBold,
  });
  const hydrated = useHydrated() && usePaydaysHydrated();
  const ready = (fontsLoaded || fontError != null) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      />
      <PaydayRunner />
    </GestureHandlerRootView>
  );
}
