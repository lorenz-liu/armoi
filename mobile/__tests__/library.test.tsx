/** Facet bookkeeping and the library grid's view modes. */

import type { TestInstance } from 'test-renderer';

import type { ViewStyle } from 'react-native';

import type { ItemSummary, Page } from '@/api';
import { LIBRARY_GRID_TEST_ID, LibraryGrid, LibraryHeader } from '@/components';
import { VIEW_MODES } from '@/config';
import { LibraryScreen } from '@/features/LibraryScreen';
import { layout } from '@/theme';

const emptyPage: Page<ItemSummary> = { items: [], total: 0, limit: 40, offset: 0 };
import { EMPTY_FACETS, countActiveFacets } from '@/hooks/useLibrary';

import { renderWithProviders, screen, userEvent } from '../test-utils/render';

function item(overrides: Partial<ItemSummary> = {}): ItemSummary {
  return {
    id: 1,
    name: 'Wool Coat',
    brand: 'Totême',
    brand_id: 1,
    storage: 'Hallway Closet',
    storage_id: 1,
    category_id: 'clothing.outerwear.coats',
    gender: 'female',
    seasons: ['autumn', 'winter'],
    price_amount: '699.00',
    price_currency: 'EUR',
    cover_image: null,
    image_count: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('countActiveFacets', () => {
  it('is zero for an untouched filter', () => {
    expect(countActiveFacets(EMPTY_FACETS)).toBe(0);
  });

  it('counts each selected value separately', () => {
    expect(
      countActiveFacets({ ...EMPTY_FACETS, seasons: ['winter', 'spring'], genders: ['unisex'] }),
    ).toBe(3);
  });

  it('counts a price range as a single constraint', () => {
    expect(countActiveFacets({ ...EMPTY_FACETS, minPrice: 100, maxPrice: 900 })).toBe(1);
    expect(countActiveFacets({ ...EMPTY_FACETS, minPrice: 100 })).toBe(1);
  });

  it('counts the currency on its own', () => {
    expect(countActiveFacets({ ...EMPTY_FACETS, currency: 'EUR' })).toBe(1);
  });
});

function renderGrid(props: Partial<React.ComponentProps<typeof LibraryGrid>> = {}) {
  return renderWithProviders(
    <>
      <LibraryGrid
        items={[item(), item({ id: 2, name: 'Chelsea Boots', brand: 'Margiela' })]}
        mode="medium"
        onSelect={jest.fn()}
        onRefresh={jest.fn()}
        refreshing={false}
        {...props}
      />
    </>,
  );
}

describe('LibraryGrid', () => {
  it.each(VIEW_MODES)('renders every item in %s view', async (mode) => {
    await renderGrid({ mode });
    expect(screen.getByText('Wool Coat')).toBeTruthy();
    expect(screen.getByText('Chelsea Boots')).toBeTruthy();
  });

  it('shows the brand as the card eyebrow when the cell is wide enough', async () => {
    await renderGrid({ mode: 'big' });
    expect(screen.getByText('Totême')).toBeTruthy();
  });

  it('drops the brand line in the three-up view, where it would not fit', async () => {
    await renderGrid({ mode: 'small' });
    expect(screen.queryByText('Totême')).toBeNull();
  });

  it('reports the tapped item', async () => {
    const onSelect = jest.fn();
    await renderGrid({ onSelect });
    await userEvent.press(screen.getByLabelText('Chelsea Boots'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  it('renders the empty component when there is nothing to show', async () => {
    await renderGrid({ items: [], empty: <></> });
    expect(screen.queryByText('Wool Coat')).toBeNull();
  });
});

/** Walks up from a node to see whether it sits inside the scrolling list. */
function isInsideGrid(node: TestInstance | null): boolean {
  for (let current = node?.parent; current; current = current.parent) {
    if (current.props?.testID === LIBRARY_GRID_TEST_ID) return true;
  }
  return false;
}

describe('layout stability across view modes', () => {
  /** The regression: page margins must not depend on the column count. */
  it.each(VIEW_MODES)('applies the standard gutter in %s mode, like every other', async (mode) => {
    await renderGrid({ mode });
    const style = screen.getByTestId(LIBRARY_GRID_TEST_ID).props
      .contentContainerStyle as ViewStyle;
    expect(style.paddingHorizontal).toBe(layout.gutter);
  });

  it('renders the search field outside the list, which remounts on a column change', async () => {
    await renderWithProviders(
      <LibraryScreen source={async () => emptyPage} onSelectItem={jest.fn()} />,
    );
    // Inside the list it would be a ListHeaderComponent, torn down and rebuilt
    // whenever numColumns changed — which is what made the controls jump.
    expect(isInsideGrid(screen.getByPlaceholderText('Search your library'))).toBe(false);
  });

  it('keeps the controls in place when the view mode changes', async () => {
    await renderWithProviders(
      <LibraryScreen source={async () => emptyPage} onSelectItem={jest.fn()} />,
    );
    const before = screen.getByPlaceholderText('Search your library').parent;

    await userEvent.press(screen.getByLabelText('Small'));

    const after = screen.getByPlaceholderText('Search your library').parent;
    expect(after?.props.style).toEqual(before?.props.style);
  });
});

describe('LibraryHeader', () => {
  const header = (props: Partial<React.ComponentProps<typeof LibraryHeader>> = {}) =>
    renderWithProviders(
      <LibraryHeader
        count={3}
        search=""
        onSearchChange={jest.fn()}
        viewMode="medium"
        onViewModeChange={jest.fn()}
        sort="created_at"
        order="desc"
        onSortChange={jest.fn()}
        activeFilters={0}
        onOpenFilters={jest.fn()}
        {...props}
      />,
    );

  it('shows no title on the main library, which needs no caption', async () => {
    await header();
    expect(screen.queryByText('Library')).toBeNull();
    expect(screen.getByPlaceholderText('Search your library')).toBeTruthy();
  });

  it('shows the title where it identifies a brand or a place', async () => {
    await header({ title: 'Totême', eyebrow: 'Brands', onBack: jest.fn() });
    expect(screen.getByText('Totême')).toBeTruthy();
  });

  it('keeps the item count visible without spending a row on it', async () => {
    await header();
    expect(screen.getByText('3 pieces')).toBeTruthy();
  });
});
