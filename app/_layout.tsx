import { ThemeProvider } from '@react-navigation/native';
import {
  Caveat_500Medium,
  Caveat_700Bold,
} from '@expo-google-fonts/caveat';
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { BrowseGateOverlay } from '@/components/browse-gate-overlay';
import { navigationTheme } from '@/constants/theme';
import { BrowseGateProvider } from '@/lib/browse-gate';

// Keep the splash up until our fonts are ready — otherwise the first
// frame renders in a fallback font and visibly snaps when Sora kicks in.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden / not available — non-fatal.
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Sora — primary display face. Friendly geometric sans, prototype 4.
    'Sora-Regular': Sora_400Regular,
    'Sora-Medium': Sora_500Medium,
    'Sora-SemiBold': Sora_600SemiBold,
    'Sora-Bold': Sora_700Bold,
    'Sora-ExtraBold': Sora_800ExtraBold,
    // Caveat — handwritten accent, used sparingly.
    'Caveat-Medium': Caveat_500Medium,
    'Caveat-Bold': Caveat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <BrowseGateProvider>
        <View style={styles.root}>
          <Stack screenOptions={{ headerShown: false }} />
          <BrowseGateOverlay />
        </View>
      </BrowseGateProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
