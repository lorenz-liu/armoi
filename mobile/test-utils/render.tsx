/**
 * The provider stack every component test needs, with fixed safe-area metrics
 * so layout assertions are deterministic.
 */

import { render, type RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import { PreferencesProvider } from '@/hooks/usePreferences';
import { I18nProvider } from '@/i18n';

/** iPhone 15 metrics — a notched device, so insets are non-zero. */
export const TEST_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 59, left: 0, right: 0, bottom: 34 },
};

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <I18nProvider>
        <PreferencesProvider>{children}</PreferencesProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AppProviders, ...options });
}

export * from '@testing-library/react-native';
