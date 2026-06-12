import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { TTSBootstrapGate } from '@/src/features/speech/TTSBootstrapGate';
import { colors } from '@/src/theme/colors';
import { applyKkukkukkFontDefaults, fontFamilies } from '@/src/theme/fonts';

applyKkukkukkFontDefaults();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    MemomentKkukkukk: require('../assets/fonts/MemomentKkukkukk.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TTSBootstrapGate>
      <RootLayoutNav />
    </TTSBootstrapGate>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fontFamilies.kkukkukk },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="quest-map" options={{ title: '퀘스트 맵' }} />
      <Stack.Screen name="quest-play" options={{ headerShown: false }} />
      <Stack.Screen name="reward" options={{ headerShown: false }} />
      <Stack.Screen name="guardian" options={{ title: '보호자' }} />
    </Stack>
  );
}
