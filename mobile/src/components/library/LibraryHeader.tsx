/**
 * The header shared by the library, brand and storage screens: a title block,
 * the search field, and one control row carrying sort, filter and the view
 * switcher. Keeping the three surfaces on one component is what guarantees
 * they behave identically.
 */

import { View } from 'react-native';

import type { SortField, SortOrder, ViewMode } from '@/api';
import { SORT_FIELDS, VIEW_MODES } from '@/config';
import { useI18n } from '@/i18n';
import { color, layout, radius, space } from '@/theme';

import { Chip, Icon, IconButton, SegmentedControl, Text, TextField, type Segment } from '../ui';

/** One glyph per column count: 1 pane, 2 panes, 3-up grid, stacked rows. */
const VIEW_ICONS = {
  big: 'square',
  medium: 'columns',
  small: 'grid',
  list: 'list',
} as const satisfies Record<ViewMode, string>;

export type LibraryHeaderProps = {
  title: string;
  subtitle?: string;
  /** Rendered above the title — the brand/storage screens show the parent here. */
  eyebrow?: string;
  count: number;
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sort: SortField;
  order: SortOrder;
  onSortChange: (sort: SortField, order: SortOrder) => void;
  activeFilters: number;
  onOpenFilters: () => void;
  onBack?: () => void;
};

export function LibraryHeader({
  title,
  subtitle,
  eyebrow,
  count,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sort,
  order,
  onSortChange,
  activeFilters,
  onOpenFilters,
  onBack,
}: LibraryHeaderProps) {
  const { t, plural } = useI18n();

  const viewSegments: Segment<ViewMode>[] = VIEW_MODES.map((mode) => ({
    value: mode,
    icon: VIEW_ICONS[mode],
    accessibilityLabel: t(`view.${mode}`),
  }));

  /** Tapping the active sort field flips its direction; tapping another selects it. */
  const cycleSort = () => {
    const index = SORT_FIELDS.indexOf(sort);
    if (order === 'desc') {
      onSortChange(sort, 'asc');
      return;
    }
    const next = SORT_FIELDS[(index + 1) % SORT_FIELDS.length] ?? SORT_FIELDS[0];
    onSortChange(next, 'desc');
  };

  return (
    <View style={{ paddingHorizontal: layout.gutter, paddingBottom: space.sm, gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.xs }}>
        {onBack ? (
          <IconButton
            name="chevron-left"
            label={t('nav.back')}
            onPress={onBack}
            style={{ marginLeft: -space.sm, marginTop: -space.xxs }}
          />
        ) : null}
        <View style={{ flex: 1, gap: space.xxs }}>
          {eyebrow ? (
            <Text variant="overline" tone="faint">
              {eyebrow}
            </Text>
          ) : null}
          <Text variant="display">{title}</Text>
          <Text variant="caption" tone="muted">
            {subtitle ?? plural('library.count', count)}
          </Text>
        </View>
      </View>

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

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
        <Chip
          label={`${t(`sort.${sort}`)} ${order === 'desc' ? '↓' : '↑'}`}
          onPress={cycleSort}
          accessibilityLabel={`${t('sort.label')}: ${t(`sort.${sort}`)} ${t(`sort.${order}`)}`}
        />
        <Chip
          label={activeFilters > 0 ? plural('filter.active', activeFilters) : t('filter.label')}
          selected={activeFilters > 0}
          onPress={onOpenFilters}
        />
        <View style={{ flex: 1 }} />
        <SegmentedControl segments={viewSegments} value={viewMode} onChange={onViewModeChange} />
      </View>

      <View style={{ height: 1, backgroundColor: color.line, borderRadius: radius.xs }} />
    </View>
  );
}
