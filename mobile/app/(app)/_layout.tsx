/** Authenticated app stack. */

import { Stack } from 'expo-router';

import { MOTION } from '@/config';
import { color } from '@/theme';

export default function AppLayout() {
  return (
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
      <Stack.Screen name="brands/index" />
      <Stack.Screen name="brands/[id]" />
      <Stack.Screen name="storages/index" />
      <Stack.Screen name="storages/[id]" />
    </Stack>
  );
}
