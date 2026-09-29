/** Everything filed under one brand. */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { api, type ItemQuery } from '@/api';
import { LibraryScreen } from '@/features/LibraryScreen';
import { useI18n } from '@/i18n';

export default function BrandItemsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const brandId = Number(id);
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.brands
      .read(brandId)
      .then((brand) => !cancelled && setName(brand.name))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  const source = useCallback((query: ItemQuery) => api.brands.items(brandId, query), [brandId]);

  return (
    <LibraryScreen
      title={name || t('vocabulary.brandsTitle')}
      eyebrow={t('nav.brand')}
      source={source}
      hiddenFacets={['brandIds']}
      onSelectItem={(item) => router.push(`/item/${item.id}`)}
      onBack={() => router.back()}
    />
  );
}
