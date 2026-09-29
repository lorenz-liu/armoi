/** Root layout: providers, the shared stack, and the paper-coloured chrome. */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MOTION } from '@/config';
import { PreferencesProvider } from '@/hooks/usePreferences';
import { I18nProvider } from '@/i18n';
import { color } from '@/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.paper }}>
      <SafeAreaProvider>
        <I18nProvider>
          <PreferencesProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: color.paper },
                animationDuration: MOTION.normal,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="item/[id]" />
              <Stack.Screen name="item/edit" options={{ presentation: 'modal' }} />
              <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
            </Stack>
          </PreferencesProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
