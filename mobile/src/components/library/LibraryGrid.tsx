/**
 * The library surface, shared by the main screen and the brand/storage pages.
 *
 * Cell width solves  n·w + (n−1)·gap + 2·gutter = viewport  (see `theme`),
 * so all four view modes sit on the same 4pt grid with identical outer
 * margins. `big` additionally alternates the caption alignment to give the
 * single-column run the asymmetric, magazine-spread rhythm the brief asks for.
 */

import { FlatList, RefreshControl, View, useWindowDimensions } from 'react-native';

import type { ItemSummary, ViewMode } from '@/api';
import { color, columnsFor, gridCellWidth, layout, space } from '@/theme';

import { ItemCard } from './ItemCard';
import { ItemRow } from './ItemRow';

export type LibraryGridProps = {
  items: ItemSummary[];
  mode: ViewMode;
  onSelect: (item: ItemSummary) => void;
  onRefresh: () => void;
  refreshing: boolean;
  header?: React.ReactElement;
  empty?: React.ReactElement;
  footerInset?: number;
};

export function LibraryGrid({
  items,
  mode,
  onSelect,
  onRefresh,
  refreshing,
  header,
  empty,
  footerInset = 0,
}: LibraryGridProps) {
  const { width } = useWindowDimensions();
  const columns = columnsFor(mode);
  const cellWidth = gridCellWidth(width, columns);
  const isList = mode === 'list';

  return (
    <FlatList
      data={items}
      // Remounting on a column change is required: FlatList cannot reflow numColumns.
      key={mode}
      keyExtractor={(item) => String(item.id)}
      numColumns={isList ? 1 : columns}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      columnWrapperStyle={
        columns > 1 && !isList ? { gap: layout.gap, paddingHorizontal: layout.gutter } : undefined
      }
      contentContainerStyle={{
        paddingBottom: footerInset + space.xxl,
        gap: isList ? layout.listGap : layout.gap,
        paddingHorizontal: columns === 1 ? layout.gutter : 0,
      }}
      renderItem={({ item, index }) =>
        isList ? (
          <ItemRow item={item} onPress={() => onSelect(item)} />
        ) : (
          <ItemCard
            item={item}
            mode={mode}
            width={columns === 1 ? undefined : cellWidth}
            flipped={mode === 'big' && index % 2 === 1}
            onPress={() => onSelect(item)}
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
