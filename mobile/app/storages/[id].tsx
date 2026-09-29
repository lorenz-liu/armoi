/** Everything kept in one storage place. */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { api, type ItemQuery } from '@/api';
import { LibraryScreen } from '@/features/LibraryScreen';
import { useI18n } from '@/i18n';

export default function StorageItemsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const storageId = Number(id);
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.storages
      .read(storageId)
      .then((place) => !cancelled && setName(place.name))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [storageId]);

  const source = useCallback((query: ItemQuery) => api.storages.items(storageId, query), [storageId]);

  return (
    <LibraryScreen
      title={name || t('vocabulary.storagesTitle')}
      eyebrow={t('nav.storage')}
      source={source}
      hiddenFacets={['storageIds']}
      onSelectItem={(item) => router.push(`/item/${item.id}`)}
      onBack={() => router.back()}
    />
  );
}
