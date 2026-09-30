/** Root layout: providers and auth-aware stack. */

import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MOTION } from '@/config';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PreferencesProvider } from '@/hooks/usePreferences';
import { I18nProvider } from '@/i18n';
import { color } from '@/theme';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [user, ready, segments, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.paper }}>
        <ActivityIndicator color={color.ink} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.paper }}>
      <SafeAreaProvider>
        <I18nProvider>
          <PreferencesProvider>
            <AuthProvider>
              <StatusBar style="dark" />
              <AuthGate>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: color.paper },
                    animationDuration: MOTION.normal,
                  }}
                >
                  <Stack.Screen name="(auth)/login" />
                  <Stack.Screen name="(auth)/terms" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="(app)" />
                </Stack>
              </AuthGate>
            </AuthProvider>
          </PreferencesProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
