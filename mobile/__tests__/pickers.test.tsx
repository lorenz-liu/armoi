/** The category drill-down, the filter draft, and brand autocomplete. */

import { AutocompleteField, CategoryPicker, FilterSheet } from '@/components';
import { EMPTY_FACETS } from '@/hooks/useLibrary';
import { renderWithProviders, screen, userEvent } from '../test-utils/render';

const wrap = (node: React.ReactElement) => renderWithProviders(node);

describe('CategoryPicker', () => {
  it('opens on the four roots', async () => {
    await wrap(
      <CategoryPicker visible value={null} onClose={jest.fn()} onSelect={jest.fn()} />,
    );
    for (const root of ['Clothing', 'Shoes', 'Bags', 'Accessories']) {
      expect(screen.getByText(root)).toBeTruthy();
    }
  });

  it('drills one level at a time instead of listing 200 nodes', async () => {
    await wrap(
      <CategoryPicker visible value={null} onClose={jest.fn()} onSelect={jest.fn()} />,
    );
    expect(screen.queryByText('Coats')).toBeNull();

    await userEvent.press(screen.getByLabelText('Clothing'));
    expect(screen.getByText('Outerwear')).toBeTruthy();

    await userEvent.press(screen.getByLabelText('Outerwear'));
    expect(screen.getByText('Coats')).toBeTruthy();
  });

  it('reports a leaf and closes', async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    await wrap(<CategoryPicker visible value={null} onClose={onClose} onSelect={onSelect} />);

    await userEvent.press(screen.getByLabelText('Shoes'));
    await userEvent.press(screen.getByLabelText('Boots'));
    await userEvent.press(screen.getByLabelText('Chelsea Boots'));

    expect(onSelect).toHaveBeenCalledWith('shoes.boots.chelsea-boots');
    expect(onClose).toHaveBeenCalled();
  });

  it('lets a whole branch be chosen', async () => {
    const onSelect = jest.fn();
    await wrap(<CategoryPicker visible value={null} onClose={jest.fn()} onSelect={onSelect} />);
    await userEvent.press(screen.getByLabelText('Bags'));
    await userEvent.press(screen.getByLabelText('Any category'));
    expect(onSelect).toHaveBeenCalledWith('bags');
  });

  it('shows the other language as the secondary label', async () => {
    await wrap(<CategoryPicker visible value={null} onClose={jest.fn()} onSelect={jest.fn()} />);
    expect(screen.getByText('服装')).toBeTruthy();
  });
});

describe('FilterSheet', () => {
  it('only commits the draft on apply', async () => {
    const onApply = jest.fn();
    await wrap(
      <FilterSheet
        visible
        facets={EMPTY_FACETS}
        onClose={jest.fn()}
        onApply={onApply}
      />,
    );

    await userEvent.press(screen.getByLabelText('Winter'));
    expect(onApply).not.toHaveBeenCalled();

    await userEvent.press(screen.getByLabelText('Apply'));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ seasons: ['winter'] }));
  });

  it('toggles a facet off again', async () => {
    const onApply = jest.fn();
    await wrap(
      <FilterSheet visible facets={EMPTY_FACETS} onClose={jest.fn()} onApply={onApply} />,
    );
    await userEvent.press(screen.getByLabelText('Unisex'));
    await userEvent.press(screen.getByLabelText('Unisex'));
    await userEvent.press(screen.getByLabelText('Apply'));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ genders: [] }));
  });

  it('clears everything back to the empty facet set', async () => {
    const onApply = jest.fn();
    await wrap(
      <FilterSheet
        visible
        facets={{ ...EMPTY_FACETS, seasons: ['winter'], currency: 'EUR' }}
        onClose={jest.fn()}
        onApply={onApply}
      />,
    );
    await userEvent.press(screen.getByLabelText('Clear all'));
    await userEvent.press(screen.getByLabelText('Apply'));
    expect(onApply).toHaveBeenCalledWith(EMPTY_FACETS);
  });

  it('hides a facet the screen has already pinned', async () => {
    await wrap(
      <FilterSheet
        visible
        facets={EMPTY_FACETS}
        hidden={['categoryIds']}
        onClose={jest.fn()}
        onApply={jest.fn()}
      />,
    );
    expect(screen.queryByText('Category')).toBeNull();
    expect(screen.getByText('Season')).toBeTruthy();
  });
});

describe('AutocompleteField', () => {
  const suggestions = jest.fn(async () => [
    { id: 1, name: 'Totême', item_count: 4 },
    { id: 2, name: 'Toteme Studio', item_count: 1 },
  ]);

  beforeEach(() => suggestions.mockClear());

  it('offers prefix matches once the field is focused', async () => {
    const onChangeText = jest.fn();
    await wrap(
      <AutocompleteField
        label="Brand"
        value="tot"
        onChangeText={onChangeText}
        fetchSuggestions={suggestions}
        accessibilityLabel="Brand"
      />,
    );

    await userEvent.type(screen.getByLabelText('Brand'), 'e');
    expect(await screen.findByText('Totême')).toBeTruthy();
  });

  it('fills the field from a chosen suggestion', async () => {
    const onChangeText = jest.fn();
    await wrap(
      <AutocompleteField
        label="Brand"
        value="tot"
        onChangeText={onChangeText}
        fetchSuggestions={suggestions}
        accessibilityLabel="Brand"
      />,
    );
    await userEvent.type(screen.getByLabelText('Brand'), 'e');
    await userEvent.press(await screen.findByLabelText('Totême'));
    expect(onChangeText).toHaveBeenLastCalledWith('Totême');
  });
});
