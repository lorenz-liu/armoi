/**
 * The library surface, parameterised by its data source.
 *
 * The main screen, a brand page and a storage page differ only in their title
 * block and which endpoint they page through — so they are one component.
 */

import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ItemQuery, ItemSummary, Page } from '@/api';
import {
  EmptyState,
  ErrorState,
  FilterSheet,
  LibraryGrid,
  LibraryHeader,
  LoadingState,
  Screen,
} from '@/components';
import { useLibrary, type Facets } from '@/hooks/useLibrary';
import { usePreferences } from '@/hooks/usePreferences';
import { useI18n } from '@/i18n';
import { layout, space } from '@/theme';

export type LibraryScreenProps = {
  title: string;
  eyebrow?: string;
  source: (query: ItemQuery) => Promise<Page<ItemSummary>>;
  onSelectItem: (item: ItemSummary) => void;
  onBack?: () => void;
  /** Facets pinned by this screen and therefore hidden from the filter panel. */
  hiddenFacets?: (keyof Facets)[];
  /** Floating chrome laid over the grid (the rail, the add button). */
  overlay?: React.ReactNode;
  emptyAction?: { label: string; onPress: () => void };
};

export function LibraryScreen({
  title,
  eyebrow,
  source,
  onSelectItem,
  onBack,
  hiddenFacets = [],
  overlay,
  emptyAction,
}: LibraryScreenProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { viewMode, setViewMode, sort, order, setSort } = usePreferences();
  const library = useLibrary(source);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const isFiltered = library.search.trim().length > 0 || library.activeFacetCount > 0;

  const header = (
    <LibraryHeader
      title={title}
      eyebrow={eyebrow}
      count={library.total}
      search={library.search}
      onSearchChange={library.setSearch}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      sort={sort}
      order={order}
      onSortChange={setSort}
      activeFilters={library.activeFacetCount}
      onOpenFilters={() => setFiltersOpen(true)}
      onBack={onBack}
    />
  );

  const empty = library.initialLoading ? (
    <LoadingState />
  ) : library.error ? (
    <ErrorState error={library.error} onRetry={library.refetch} />
  ) : (
    <EmptyState
      icon={isFiltered ? 'search' : 'inbox'}
      title={t(isFiltered ? 'library.noResults' : 'library.empty')}
      body={t(isFiltered ? 'library.noResultsHint' : 'library.emptyHint')}
      actionLabel={isFiltered ? t('filter.clear') : emptyAction?.label}
      onAction={isFiltered ? library.clearFacets : emptyAction?.onPress}
    />
  );

  return (
    <Screen>
      <LibraryGrid
        items={library.items}
        mode={viewMode}
        onSelect={onSelectItem}
        onRefresh={library.refetch}
        refreshing={library.loading && !library.initialLoading}
        header={header}
        empty={empty}
        footerInset={insets.bottom + layout.touchTarget + space.lg}
      />
      {overlay}
      <FilterSheet
        visible={filtersOpen}
        facets={library.facets}
        hidden={hiddenFacets}
        onClose={() => setFiltersOpen(false)}
        onApply={library.setFacets}
      />
    </Screen>
  );
}
