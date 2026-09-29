/** The brand library: every brand you own something from. */

import { useRouter } from 'expo-router';

import { api } from '@/api';
import { VocabularyListScreen } from '@/features/VocabularyListScreen';

export default function BrandsRoute() {
  const router = useRouter();
  return (
    <VocabularyListScreen
      resource="brands"
      load={api.brands.list}
      onSelect={(entry) => router.push(`/brands/${entry.id}`)}
      onBack={() => router.back()}
    />
  );
}
