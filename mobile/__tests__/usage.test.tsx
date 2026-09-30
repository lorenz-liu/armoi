/** The "used today" action, the sort dropdown, and the floating switcher. */

import { api, localToday, type ItemSummary, type Page } from '@/api';
import {
  FloatingViewSwitcher,
  LIBRARY_TOOLBAR_TEST_ID,
  LibraryToolbar,
  UsageButton,
  usageButtonHeight,
} from '@/components';
import { SORT_OPTIONS } from '@/config';
import { color, layout } from '@/theme';
import { LibraryScreen } from '@/features/LibraryScreen';

import { renderWithProviders, screen, userEvent, waitFor } from '../test-utils/render';

jest.mock('@/api', () => {
  const actual = jest.requireActual('@/api');
  return { ...actual, api: { ...actual.api, items: { ...actual.api.items, markUsed: jest.fn() } } };
});

const markUsed = api.items.markUsed as jest.Mock;

function item(overrides: Partial<ItemSummary> = {}): ItemSummary {
  return {
    id: 1,
    name: 'Wool Coat',
    brand: 'Totême',
    brand_id: 1,
    storage: null,
    storage_id: null,
    category_id: null,
    gender: null,
    seasons: [],
    price_amount: null,
    price_currency: null,
    cover_image: null,
    image_count: 0,
    last_used_date: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const page = (items: ItemSummary[]): Page<ItemSummary> => ({
  items,
  total: items.length,
  limit: 40,
  offset: 0,
});

beforeEach(() => markUsed.mockReset().mockResolvedValue(item()));

describe('localToday', () => {
  it('uses the device calendar, not UTC', () => {
    // 00:30 on the 2nd in a +08:00 zone is still the 1st in UTC.
    const midnightish = new Date(2026, 4, 2, 0, 30);
    expect(localToday(midnightish)).toBe('2026-05-02');
  });

  it('pads month and day', () => {
    expect(localToday(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});

describe('UsageButton', () => {
  it('invites the tap when the piece has not been worn today', async () => {
    const onPress = jest.fn();
    await renderWithProviders(<UsageButton lastUsedDate={null} onPress={onPress} />);
    await userEvent.press(screen.getByLabelText('Used today'));
    expect(onPress).toHaveBeenCalled();
  });

  it('settles into a worn state once used today', async () => {
    const onPress = jest.fn();
    await renderWithProviders(<UsageButton lastUsedDate={localToday()} onPress={onPress} />);
    expect(screen.getByText('Worn today')).toBeTruthy();
    await userEvent.press(screen.getByLabelText('Worn today'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('treats an older date as not worn today', async () => {
    await renderWithProviders(<UsageButton lastUsedDate="2020-01-01" onPress={jest.fn()} />);
    expect(screen.getByText('Used today')).toBeTruthy();
  });
});

describe('marking a piece used from the library', () => {
  const renderLibrary = (items: ItemSummary[]) =>
    renderWithProviders(
      <LibraryScreen source={async () => page(items)} onSelectItem={jest.fn()} />,
    );

  it('records it against the device date and shows it at once', async () => {
    await renderLibrary([item()]);
    await waitFor(() => expect(screen.getByLabelText('Used today')).toBeTruthy());

    await userEvent.press(screen.getByLabelText('Used today'));

    expect(markUsed).toHaveBeenCalledWith(1, localToday());
    // Patched in place, without waiting for the round trip.
    await waitFor(() => expect(screen.getByLabelText('Worn today')).toBeTruthy());
  });

  it('does not re-send for a piece already worn today', async () => {
    await renderLibrary([item({ last_used_date: localToday() })]);
    await waitFor(() => expect(screen.getByLabelText('Worn today')).toBeTruthy());
    await userEvent.press(screen.getByLabelText('Worn today'));
    expect(markUsed).not.toHaveBeenCalled();
  });
});

describe('sort dropdown', () => {
  const toolbar = (onSortOptionChange = jest.fn()) =>
    renderWithProviders(
      <LibraryToolbar
        count={0}
        search=""
        onSearchChange={jest.fn()}
        sortOption="newest"
        onSortOptionChange={onSortOptionChange}
        activeFilters={0}
        onOpenFilters={jest.fn()}
      />,
    );

  it('shows only the active choice until opened', async () => {
    await toolbar();
    expect(screen.getByText('Recently added')).toBeTruthy();
    expect(screen.queryByText('Longest unworn')).toBeNull();
  });

  it('offers exactly the seven orderings', async () => {
    await toolbar();
    await userEvent.press(screen.getByLabelText('Sort'));
    for (const label of [
      'Recently added',
      'Longest unworn',
      'Recently worn',
      'Name A–Z',
      'Name Z–A',
      'Price, low to high',
      'Price, high to low',
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(SORT_OPTIONS).toHaveLength(7);
  });

  it('reports the chosen ordering', async () => {
    const onSortOptionChange = jest.fn();
    await toolbar(onSortOptionChange);
    await userEvent.press(screen.getByLabelText('Sort'));
    await userEvent.press(screen.getByLabelText('Longest unworn'));
    expect(onSortOptionChange).toHaveBeenCalledWith('longestUnused');
  });
});

describe('FloatingViewSwitcher', () => {
  it('switches density', async () => {
    const onChange = jest.fn();
    await renderWithProviders(<FloatingViewSwitcher value="medium" onChange={onChange} />);
    await userEvent.press(screen.getByLabelText('Small'));
    expect(onChange).toHaveBeenCalledWith('small');
  });

  it('floats rather than taking a row from the toolbar', async () => {
    await renderWithProviders(
      <LibraryScreen source={async () => page([])} onSelectItem={jest.fn()} />,
    );
    const switcher = screen.getByLabelText('Small');
    for (let node = switcher.parent; node; node = node.parent) {
      expect(node.props?.testID).not.toBe(LIBRARY_TOOLBAR_TEST_ID);
    }
  });
});

describe('the item page button', () => {
  /** Returns the resolved style of the rendered pressable. */
  function styleOf(label: string): Record<string, unknown> {
    const raw = screen.getByLabelText(label).props.style as unknown;
    return Object.assign({}, ...[raw].flat(Infinity).filter(Boolean));
  }

  it('fills the width, unlike the one on a library cell', async () => {
    await renderWithProviders(
      <UsageButton variant="prominent" lastUsedDate={null} onPress={jest.fn()} />,
    );
    expect(styleOf('Used today').alignSelf).toBe('stretch');
  });

  it('is black, as the page-level action', async () => {
    await renderWithProviders(
      <UsageButton variant="prominent" lastUsedDate={null} onPress={jest.fn()} />,
    );
    expect(styleOf('Used today').backgroundColor).toBe(color.ink);
  });

  it('stands a good deal taller than the compact one', () => {
    expect(usageButtonHeight('prominent')).toBeGreaterThan(usageButtonHeight('compact'));
    expect(usageButtonHeight('compact')).toBeGreaterThanOrEqual(layout.touchTarget);
  });

  it('renders at the height it declares', async () => {
    await renderWithProviders(
      <UsageButton variant="prominent" lastUsedDate={null} onPress={jest.fn()} />,
    );
    expect(styleOf('Used today').minHeight).toBe(usageButtonHeight('prominent'));
  });

  it('settles once worn, rather than staying a live black button', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <UsageButton variant="prominent" lastUsedDate={localToday()} onPress={onPress} />,
    );
    expect(styleOf('Worn today').backgroundColor).toBe(color.accentSoft);
    await userEvent.press(screen.getByLabelText('Worn today'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('leaves the library cell button compact', async () => {
    await renderWithProviders(<UsageButton lastUsedDate={null} onPress={jest.fn()} />);
    const style = styleOf('Used today');
    expect(style.alignSelf).not.toBe('stretch');
    expect(style.backgroundColor).toBe(color.card);
  });
});
