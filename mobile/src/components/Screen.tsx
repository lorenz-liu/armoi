/**
 * The page shell: the paper ground, safe-area insets, and the two states
 * every data screen shares (first load, unreachable server).
 */

import { ActivityIndicator, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ApiError } from '@/api';
import { useI18n } from '@/i18n';
import { color, space } from '@/theme';

import { EmptyState } from './ui';

export type ScreenProps = {
  children: React.ReactNode;
  /** `false` leaves the top inset to a scroll view's own header. */
  padTop?: boolean;
  style?: ViewStyle;
};

export function Screen({ children, padTop = true, style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: color.paper,
          paddingTop: padTop ? insets.top : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function LoadingState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
      <ActivityIndicator color={color.inkFaint} />
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={error.isNetworkError ? 'wifi-off' : 'alert-circle'}
      title={error.isNetworkError ? t('common.offline') : t('common.error')}
      body={error.isNetworkError ? t('common.offlineHint') : error.detail}
      actionLabel={t('common.retry')}
      onAction={onRetry}
    />
  );
}
