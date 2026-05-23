import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { BrowseGateOverlay } from '@/components/browse-gate-overlay';
import { navigationTheme } from '@/constants/theme';
import { BrowseGateProvider } from '@/lib/browse-gate';

export default function RootLayout() {
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
