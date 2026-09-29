/**
 * The brand and storage index pages. Both list a user-grown vocabulary with
 * its item counts, so they share one component.
 */

import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import type { Vocabulary } from '@/api';
import {
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Screen,
  Surface,
  Text,
  TextField,
  Touchable,
} from '@/components';
import { MOTION } from '@/config';
import { useAsync } from '@/hooks/useAsync';
import { useDebounced } from '@/hooks/useDebounced';
import { useI18n } from '@/i18n';
import { color, layout, radius, space } from '@/theme';

export type VocabularyResource = 'brands' | 'storages';

export type VocabularyListScreenProps = {
  resource: VocabularyResource;
  load: (search?: string) => Promise<Vocabulary[]>;
  onSelect: (entry: Vocabulary) => void;
  onBack: () => void;
};

export function VocabularyListScreen({
  resource,
  load,
  onSelect,
  onBack,
}: VocabularyListScreenProps) {
  const { t, plural } = useI18n();
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search, MOTION.slow);

  const fetcher = useCallback(() => load(debounced.trim() || undefined), [load, debounced]);
  const state = useAsync(fetcher, [debounced]);

  const title = t(resource === 'brands' ? 'vocabulary.brandsTitle' : 'vocabulary.storagesTitle');
  const entries = state.data ?? [];

  return (
    <Screen>
      <FlatList
        data={entries}
        keyExtractor={(entry) => String(entry.id)}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingBottom: space.xxl,
          gap: layout.listGap,
        }}
        ListHeaderComponent={
          <View style={{ gap: space.sm, paddingBottom: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
              <IconButton
                name="chevron-left"
                label={t('nav.back')}
                onPress={onBack}
                style={{ marginLeft: -space.sm }}
              />
              <View style={{ flex: 1, gap: space.xxs }}>
                <Text variant="display">{title}</Text>
                <Text variant="caption" tone="muted">
                  {plural('vocabulary.itemCount', entries.length)}
                </Text>
              </View>
            </View>
            <TextField
              value={search}
              onChangeText={setSearch}
              placeholder={t(
                resource === 'brands' ? 'vocabulary.searchBrands' : 'vocabulary.searchStorages',
              )}
              accessibilityLabel={t('common.search')}
              autoCorrect={false}
              clearButtonMode="while-editing"
              style={{ paddingVertical: space.xs }}
            />
          </View>
        }
        ListEmptyComponent={
          state.initialLoading ? (
            <LoadingState />
          ) : state.error ? (
            <ErrorState error={state.error} onRetry={state.refetch} />
          ) : (
            <EmptyState
              icon={resource === 'brands' ? 'tag' : 'archive'}
              title={t(resource === 'brands' ? 'vocabulary.brandsEmpty' : 'vocabulary.storagesEmpty')}
              body={t(
                resource === 'brands'
                  ? 'vocabulary.brandsEmptyHint'
                  : 'vocabulary.storagesEmptyHint',
              )}
            />
          )
        }
        renderItem={({ item }) => (
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={item.name}
            onPress={() => onSelect(item)}
          >
            <Surface
              level="raised"
              corner="md"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.sm,
                paddingHorizontal: space.md,
                paddingVertical: space.sm,
              }}
            >
              <View style={{ flex: 1, gap: space.xxs }}>
                <Text variant="subtitle" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text variant="caption" tone="faint">
                  {plural('vocabulary.itemCount', item.item_count)}
                </Text>
              </View>
              <View
                style={{
                  width: space.xs,
                  height: space.xs,
                  borderRadius: radius.pill,
                  backgroundColor: item.item_count > 0 ? color.accent : color.line,
                }}
              />
            </Surface>
          </Touchable>
        )}
        refreshControl={
          <RefreshControl
            refreshing={state.loading && !state.initialLoading}
            onRefresh={state.refetch}
            tintColor={color.inkFaint}
          />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}
