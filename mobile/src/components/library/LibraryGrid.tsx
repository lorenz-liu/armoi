/**
 * The scrolling item surface, shared by the main screen and the brand and
 * storage pages.
 *
 * Cell width solves  n·w + (n−1)·gap + 2·gutter = viewport  (see `theme`).
 * The gutter is applied once, on the content container, and is the same in
 * every view mode — switching density changes only the cells, never the page
 * margins. The header is deliberately *not* a `ListHeaderComponent`: changing
 * `numColumns` forces a remount, which would make the search field and
 * controls jump as the view mode changed.
 *
 * `topInset` keeps the first row clear of the floating view switcher: content
 * may scroll *under* floating chrome, but it should never start beneath it.
 */

import { FlatList, RefreshControl, View, useWindowDimensions } from 'react-native';

import type { ItemSummary, ViewMode } from '@/api';
import { color, columnsFor, gridCellWidth, layout, space } from '@/theme';

import { ItemCard } from './ItemCard';
import { ItemRow } from './ItemRow';

/** Lets tests assert what is, and is not, inside the scrolling surface. */
export const LIBRARY_GRID_TEST_ID = 'library-grid';

export type LibraryGridProps = {
  items: ItemSummary[];
  mode: ViewMode;
  onSelect: (item: ItemSummary) => void;
  onMarkUsed: (item: ItemSummary) => void;
  onRefresh: () => void;
  refreshing: boolean;
  empty?: React.ReactElement;
  /** Room left at the top for floating chrome, so row one is not underneath it. */
  topInset?: number;
  footerInset?: number;
};

export function LibraryGrid({
  items,
  mode,
  onSelect,
  onMarkUsed,
  onRefresh,
  refreshing,
  empty,
  topInset = 0,
  footerInset = 0,
}: LibraryGridProps) {
  const { width } = useWindowDimensions();
  const columns = columnsFor(mode);
  const cellWidth = gridCellWidth(width, columns);
  const isList = mode === 'list';
  const isSingleColumn = columns === 1;

  return (
    <FlatList
      testID={LIBRARY_GRID_TEST_ID}
      data={items}
      // Remounting on a column change is required: FlatList cannot reflow numColumns.
      key={mode}
      keyExtractor={(item) => String(item.id)}
      numColumns={isList ? 1 : columns}
      ListEmptyComponent={empty}
      columnWrapperStyle={isSingleColumn || isList ? undefined : { gap: layout.gap }}
      contentContainerStyle={{
        // Identical in every mode — this is what keeps the page from shifting.
        paddingHorizontal: layout.gutter,
        paddingTop: Math.max(space.sm, topInset),
        paddingBottom: footerInset + space.xxl,
        gap: isList ? layout.listGap : layout.gap,
      }}
      renderItem={({ item, index }) =>
        isList ? (
          <ItemRow item={item} onPress={() => onSelect(item)} onMarkUsed={() => onMarkUsed(item)} />
        ) : (
          <ItemCard
            item={item}
            mode={mode}
            width={isSingleColumn ? undefined : cellWidth}
            flipped={mode === 'big' && index % 2 === 1}
            onPress={() => onSelect(item)}
            onMarkUsed={() => onMarkUsed(item)}
          />
        )
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.inkFaint} />
      }
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews
    />
  );
}

/** Spacer used by screens that need a gap between the header and the first row. */
export function GridSpacer({ height = space.sm }: { height?: number }) {
  return <View style={{ height }} />;
}
