/**
 * The library surface, parameterised by its data source.
 *
 * The main screen, a brand page and a storage page differ only in their title
 * block and which endpoint they page through — so they are one component.
 *
 * Layout: the grid fills the screen and the toolbar docks at the bottom, so
 * every control sits in thumb reach and the photographs get the whole upper
 * screen. The toolbar is real layout rather than floating chrome, which is
 * also what keeps it from drifting when the column count changes.
 */

import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import type { ItemQuery, ItemSummary, Page } from '@/api';
import {
  EdgeRail,
  EmptyState,
  ErrorState,
  FilterSheet,
  FloatingViewSwitcher,
  floatingSwitcherReserve,
  LibraryGrid,
  LibraryTitleBar,
  LibraryToolbar,
  LoadingState,
  Screen,
  type RailTab,
} from '@/components';
import { useLibrary, type Facets } from '@/hooks/useLibrary';
import { usePreferences } from '@/hooks/usePreferences';
import { useI18n } from '@/i18n';

export type LibraryScreenProps = {
  /** Omitted by the main library, which needs no caption for itself. */
  title?: string;
  eyebrow?: string;
  source: (query: ItemQuery) => Promise<Page<ItemSummary>>;
  onSelectItem: (item: ItemSummary) => void;
  onBack?: () => void;
  /** Facets pinned by this screen and therefore hidden from the filter panel. */
  hiddenFacets?: (keyof Facets)[];
  /** Shows the edge rail; omitted on screens that are already a rail destination. */
  onOpenRail?: (tab: RailTab) => void;
  /** Toolbar actions; each button appears only where a handler is given. */
  onAdd?: () => void;
  onOpenSettings?: () => void;
  emptyAction?: { label: string; onPress: () => void };
};

export function LibraryScreen({
  title,
  eyebrow,
  source,
  onSelectItem,
  onBack,
  hiddenFacets = [],
  onOpenRail,
  onAdd,
  onOpenSettings,
  emptyAction,
}: LibraryScreenProps) {
  const { t } = useI18n();
  const { viewMode, setViewMode, sortOption, setSortOption } = usePreferences();
  const library = useLibrary(source);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Measured rather than assumed: the toolbar's height depends on the type
  // scale and the safe area, and the rail must stay clear of it.
  const [toolbarHeight, setToolbarHeight] = useState(0);
  // The switcher floats over the top of the screen. Its size decides two
  // things: how far the title bar must keep clear horizontally, and how much
  // room the grid leaves before its first row.
  const [switcher, setSwitcher] = useState({ width: 0, height: 0 });
  const [titleBarHeight, setTitleBarHeight] = useState(0);

  const isFiltered = library.search.trim().length > 0 || library.activeFacetCount > 0;

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
      {/* `padding` lifts the docked toolbar clear of the keyboard; the grid
          above it simply gets shorter. */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {title || onBack ? (
          <LibraryTitleBar
            title={title ?? ''}
            eyebrow={eyebrow}
            onBack={onBack}
            reservedRight={switcher.width}
            onLayout={(event) => setTitleBarHeight(event.nativeEvent.layout.height)}
          />
        ) : null}

        <LibraryGrid
          items={library.items}
          mode={viewMode}
          onSelect={onSelectItem}
          onMarkUsed={library.markUsed}
          onRefresh={library.refetch}
          refreshing={library.loading && !library.initialLoading}
          empty={empty}
          topInset={floatingSwitcherReserve(switcher.height, titleBarHeight)}
        />

        <LibraryToolbar
          onLayout={(event) => setToolbarHeight(event.nativeEvent.layout.height)}
          count={library.total}
          search={library.search}
          onSearchChange={library.setSearch}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          activeFilters={library.activeFacetCount}
          onOpenFilters={() => setFiltersOpen(true)}
          onAdd={onAdd}
          onOpenSettings={onOpenSettings}
        />
      </KeyboardAvoidingView>

      {/* Outside the keyboard-avoiding column so it keeps screen coordinates:
          its resting place is measured from the bottom of the screen. */}
      {onOpenRail ? (
        <EdgeRail onSelect={onOpenRail} bottomObstruction={toolbarHeight} />
      ) : null}

      {/* Last, so it floats above the grid, the rail and the title bar. */}
      <FloatingViewSwitcher
        value={viewMode}
        onChange={setViewMode}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setSwitcher((current) =>
            current.width === width && current.height === height ? current : { width, height },
          );
        }}
      />

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
