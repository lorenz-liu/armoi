/** The main library — everything you own. */

import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api, type ItemQuery } from '@/api';
import { EdgeRail, IconButton, type RailTab } from '@/components';
import { LibraryScreen } from '@/features/LibraryScreen';
import { useI18n } from '@/i18n';
import { elevation, layout, space } from '@/theme';

export default function LibraryRoute() {
  const router = useRouter();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const source = useCallback((query: ItemQuery) => api.items.list(query), []);
  const openRail = (tab: RailTab) =>
    router.push(tab === 'brand' ? '/brands' : '/storages');

  return (
    <LibraryScreen
      source={source}
      onSelectItem={(item) => router.push(`/item/${item.id}`)}
      emptyAction={{ label: t('library.addItem'), onPress: () => router.push('/item/edit') }}
      overlay={
        <>
          <EdgeRail onSelect={openRail} />
          <View
            style={[
              {
                position: 'absolute',
                left: layout.gutter,
                bottom: insets.bottom + space.md,
                flexDirection: 'row',
                gap: space.xs,
                borderRadius: space.huge,
              },
              elevation.floating,
            ]}
          >
            <IconButton
              name="plus"
              label={t('library.addItem')}
              surface="ink"
              tone="onInk"
              size={20}
              onPress={() => router.push('/item/edit')}
            />
            <IconButton
              name="settings"
              label={t('nav.settings')}
              surface="card"
              tone="muted"
              onPress={() => router.push('/settings')}
            />
          </View>
        </>
      }
    />
  );
}
