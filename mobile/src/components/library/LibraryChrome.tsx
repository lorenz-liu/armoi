/**
 * The chrome around a library surface, in two pieces.
 *
 * `LibraryToolbar` docks at the *bottom* of the screen: the search field with
 * the primary actions beside it, then one control row carrying sort, filter
 * and the item count. Putting it at the bottom keeps every control inside
 * thumb reach and leaves the top of the screen entirely to the photographs.
 * The view switcher is not here — it floats at the top right, see
 * `FloatingViewSwitcher`.
 *
 * `LibraryTitleBar` stays at the top, and only appears where it says something
 * the user cannot already see — which brand, or which storage place. The main
 * library needs no caption for itself.
 *
 * Both are used by all three library surfaces, which is what guarantees they
 * behave identically.
 */

import { View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SortOptionId } from '@/api';
import { SORT_OPTIONS } from '@/config';
import { useI18n } from '@/i18n';
import { color, elevation, layout, space } from '@/theme';

import { Chip, Icon, IconButton, Select, Text, TextField, type SelectOption } from '../ui';

export const LIBRARY_TOOLBAR_TEST_ID = 'library-toolbar';

export type LibraryTitleBarProps = {
  title: string;
  /** Rendered above the title — the brand/storage screens show the parent here. */
  eyebrow?: string;
  onBack?: () => void;
  /** Width of the floating view switcher, which overlaps this row's right end. */
  reservedRight?: number;
};

export function LibraryTitleBar({
  title,
  eyebrow,
  onBack,
  reservedRight = 0,
}: LibraryTitleBarProps) {
  const { t } = useI18n();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        paddingLeft: layout.gutter,
        paddingRight: layout.gutter + reservedRight + space.xs,
        paddingBottom: space.xs,
      }}
    >
      {onBack ? (
        <IconButton
          name="chevron-left"
          label={t('nav.back')}
          onPress={onBack}
          style={{ marginLeft: -space.sm }}
        />
      ) : null}
      <View style={{ flex: 1, gap: space.xxs }}>
        {eyebrow ? (
          <Text variant="overline" tone="faint">
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="title" numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

export type LibraryToolbarProps = {
  count: number;
  search: string;
  onSearchChange: (value: string) => void;
  sortOption: SortOptionId;
  onSortOptionChange: (option: SortOptionId) => void;
  activeFilters: number;
  onOpenFilters: () => void;
  /** Rendered beside the search field; omitted where the screen has no such action. */
  onAdd?: () => void;
  onOpenSettings?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function LibraryToolbar({
  count,
  search,
  onSearchChange,
  sortOption,
  onSortOptionChange,
  activeFilters,
  onOpenFilters,
  onAdd,
  onOpenSettings,
  onLayout,
}: LibraryToolbarProps) {
  const { t, plural } = useI18n();
  const insets = useSafeAreaInsets();

  const sortOptions: SelectOption<SortOptionId>[] = SORT_OPTIONS.map((option) => ({
    value: option.id,
    label: t(`sort.${option.id}`),
  }));

  return (
    <View
      testID={LIBRARY_TOOLBAR_TEST_ID}
      onLayout={onLayout}
      style={[
        {
          paddingHorizontal: layout.gutter,
          paddingTop: space.sm,
          // The dock owns the bottom safe area; the list above it stops here.
          paddingBottom: insets.bottom + space.sm,
          gap: space.sm,
          backgroundColor: color.paper,
          borderTopWidth: 1,
          borderTopColor: color.line,
        },
        elevation.overlay,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
        <View style={{ flex: 1 }}>
          <TextField
            value={search}
            onChangeText={onSearchChange}
            placeholder={t('library.searchPlaceholder')}
            accessibilityLabel={t('common.search')}
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={{ paddingVertical: space.xs }}
            trailing={<Icon name="search" size={16} color={color.inkFaint} />}
          />
        </View>
        {onAdd ? (
          <IconButton
            name="plus"
            label={t('library.addItem')}
            surface="ink"
            tone="onInk"
            size={20}
            onPress={onAdd}
          />
        ) : null}
        {onOpenSettings ? (
          <IconButton
            name="settings"
            label={t('nav.settings')}
            surface="card"
            tone="muted"
            onPress={onOpenSettings}
          />
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
        <Select
          variant="chip"
          title={t('sort.label')}
          accessibilityLabel={t('sort.label')}
          value={sortOption}
          options={sortOptions}
          placeholder={t('sort.label')}
          onChange={onSortOptionChange}
          closeLabel={t('common.close')}
        />
        <Chip
          label={activeFilters > 0 ? plural('filter.active', activeFilters) : t('filter.label')}
          selected={activeFilters > 0}
          onPress={onOpenFilters}
        />
        <View style={{ flex: 1 }} />
        <Text variant="micro" tone="faint" numberOfLines={1}>
          {plural('library.count', count)}
        </Text>
      </View>
    </View>
  );
}
