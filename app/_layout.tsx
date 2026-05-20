import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { navigationTheme } from '@/constants/theme';

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
