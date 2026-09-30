/** The storage library: every place you keep things. */

import { useRouter } from 'expo-router';

import { api } from '@/api';
import { VocabularyListScreen } from '@/features/VocabularyListScreen';

export default function StoragesRoute() {
  const router = useRouter();
  return (
    <VocabularyListScreen
      resource="storages"
      load={api.storages.list}
      onSelect={(entry) => router.push(`/storages/${entry.id}`)}
      onBack={() => router.back()}
    />
  );
}
