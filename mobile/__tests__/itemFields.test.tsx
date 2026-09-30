/** What a library cell shows beneath the photograph, and choosing it. */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { ItemSummary } from '@/api';
import { ItemCard, ItemRow } from '@/components';
import { DEFAULT_ITEM_FIELDS, ITEM_FIELDS, STORAGE_KEYS } from '@/config';
import { PreferencesProvider, usePreferences } from '@/hooks/usePreferences';

import { AppProviders, renderWithProviders, screen } from '../test-utils/render';

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
    seasons: ['autumn'],
    price_amount: '699.00',
    price_currency: 'EUR',
    cover_image: null,
    image_count: 0,
    last_used_date: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => AsyncStorage.clear());

describe('by default', () => {
  it('shows where a piece is kept, not what it cost', async () => {
    expect([...DEFAULT_ITEM_FIELDS]).toContain('storage');
    expect([...DEFAULT_ITEM_FIELDS]).not.toContain('price');
  });

  it('puts storage on the card and leaves the price off', async () => {
    await renderWithProviders(
      <ItemCard item={item()} mode="medium" onPress={jest.fn()} onMarkUsed={jest.fn()} />,
    );
    expect(screen.getByText(/Hallway Closet/)).toBeTruthy();
    expect(screen.queryByText(/699/)).toBeNull();
  });

  it('does the same in a list row', async () => {
    await renderWithProviders(
      <ItemRow item={item()} onPress={jest.fn()} onMarkUsed={jest.fn()} />,
    );
    expect(screen.getByText(/Hallway Closet/)).toBeTruthy();
    expect(screen.queryByText(/699/)).toBeNull();
  });

  it('still shows the name, which is not optional', async () => {
    await renderWithProviders(
      <ItemCard item={item()} mode="medium" onPress={jest.fn()} onMarkUsed={jest.fn()} />,
    );
    expect(screen.getByText('Wool Coat')).toBeTruthy();
  });
});

describe('choosing the fields', () => {
  const withFields = async (fields: string[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.itemFields, JSON.stringify(fields));
    return renderWithProviders(
      <ItemCard item={item()} mode="medium" onPress={jest.fn()} onMarkUsed={jest.fn()} />,
    );
  };

  it('brings the price back when it is asked for', async () => {
    await withFields(['price']);
    await waitFor(() => expect(screen.getByText(/699/)).toBeTruthy());
    expect(screen.queryByText(/Hallway Closet/)).toBeNull();
  });

  it('joins several fields into one line', async () => {
    await withFields(['storage', 'category', 'price']);
    await waitFor(() =>
      expect(screen.getByText('Hallway Closet · Coats · €699')).toBeTruthy(),
    );
  });

  it('renders the line in the canonical order whatever order it was stored in', async () => {
    await withFields(['price', 'storage']);
    await waitFor(() => expect(screen.getByText('Hallway Closet · €699')).toBeTruthy());
  });

  it('shows never-worn rather than a blank when last worn is chosen', async () => {
    await withFields(['lastUsed']);
    await waitFor(() => expect(screen.getByText('Never worn')).toBeTruthy());
  });

  it('leaves the caption bare when nothing is chosen', async () => {
    await withFields([]);
    await waitFor(() => expect(screen.getByText('Wool Coat')).toBeTruthy());
    expect(screen.queryByText('Totême')).toBeNull();
    expect(screen.queryByText(/Hallway Closet/)).toBeNull();
  });

  it('omits a field the piece simply does not have', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.itemFields, JSON.stringify(['storage', 'price']));
    await renderWithProviders(
      <ItemCard
        item={item({ storage: null })}
        mode="medium"
        onPress={jest.fn()}
        onMarkUsed={jest.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText('€699')).toBeTruthy());
  });
});

describe('the preference itself', () => {
  it('toggles a field on and off', async () => {
    const { result } = await renderHook(() => usePreferences(), { wrapper: PreferencesProvider });
    await waitFor(() => expect(result.current.itemFields).toContain('storage'));

    await act(async () => result.current.toggleItemField('price'));
    expect(result.current.itemFields).toContain('price');

    await act(async () => result.current.toggleItemField('price'));
    expect(result.current.itemFields).not.toContain('price');
  });

  it('keeps the canonical order however fields are added', async () => {
    const { result } = await renderHook(() => usePreferences(), { wrapper: PreferencesProvider });
    await act(async () => result.current.toggleItemField('brand'));
    await act(async () => result.current.toggleItemField('price'));
    await act(async () => result.current.toggleItemField('brand'));

    const order = result.current.itemFields.map((field) => ITEM_FIELDS.indexOf(field));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('survives a relaunch', async () => {
    const first = await renderHook(() => usePreferences(), { wrapper: PreferencesProvider });
    await act(async () => first.result.current.toggleItemField('price'));

    const second = await renderHook(() => usePreferences(), { wrapper: AppProviders });
    await waitFor(() => expect(second.result.current.itemFields).toContain('price'));
  });

  it('ignores a field this build does not know', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.itemFields,
      JSON.stringify(['storage', 'inventedLater']),
    );
    const { result } = await renderHook(() => usePreferences(), { wrapper: PreferencesProvider });
    await waitFor(() => expect(result.current.itemFields).toEqual(['storage']));
  });

  it('falls back to the defaults on a corrupt entry', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.itemFields, 'not json');
    const { result } = await renderHook(() => usePreferences(), { wrapper: PreferencesProvider });
    await waitFor(() => expect(result.current.itemFields).toEqual([...DEFAULT_ITEM_FIELDS]));
  });
});
