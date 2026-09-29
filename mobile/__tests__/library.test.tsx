/** Facet bookkeeping and the library grid's view modes. */

import type { ItemSummary } from '@/api';
import { LibraryGrid } from '@/components';
import { VIEW_MODES } from '@/config';
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
