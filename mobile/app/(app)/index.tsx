/** The main library — everything you own. */

import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { api, type ItemQuery } from '@/api';
import type { RailTab } from '@/components';
import { LibraryScreen } from '@/features/LibraryScreen';
import { useI18n } from '@/i18n';

export default function LibraryRoute() {
  const router = useRouter();
  const { t } = useI18n();

  const source = useCallback((query: ItemQuery) => api.items.list(query), []);
  const openRail = (tab: RailTab) => router.push(tab === 'brand' ? '/brands' : '/storages');

  return (
    <LibraryScreen
      source={source}
      onSelectItem={(item) => router.push(`/item/${item.id}`)}
      onAdd={() => router.push('/item/edit')}
      onOpenSettings={() => router.push('/settings')}
      emptyAction={{ label: t('library.addItem'), onPress: () => router.push('/item/edit') }}
      onOpenRail={openRail}
    />
  );
}
