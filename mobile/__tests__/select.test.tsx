/** The currency dropdown, in the form and in the filter panel. */

import { FilterSheet, Select } from '@/components';
import { CURRENCIES, CURRENCY_SYMBOLS } from '@/config';
import { EMPTY_FACETS } from '@/hooks/useLibrary';

import { renderWithProviders, screen, userEvent } from '../test-utils/render';

const OPTIONS = CURRENCIES.map((code) => ({
  value: code,
  label: code,
  caption: CURRENCY_SYMBOLS[code],
}));

describe('Select', () => {
  const setup = async (props: Partial<React.ComponentProps<typeof Select<string>>> = {}) => {
    const onChange = jest.fn();
    await renderWithProviders(
      <Select
        title="Currency"
        value="CNY"
        options={OPTIONS}
        placeholder="Any currency"
        onChange={onChange}
        closeLabel="Close"
        {...props}
      />,
    );
    return { onChange };
  };

  it('shows the current value as a closed dropdown, not a row of chips', async () => {
    await setup();
    expect(screen.getByText('CNY')).toBeTruthy();
    // Every other currency stays behind the dropdown until it is opened.
    expect(screen.queryByText('EUR')).toBeNull();
    expect(screen.queryByText('JPY')).toBeNull();
  });

  it('lists every currency once opened', async () => {
    await setup();
    await userEvent.press(screen.getByLabelText('Currency'));
    for (const code of CURRENCIES) {
      expect(screen.getAllByText(code).length).toBeGreaterThan(0);
    }
  });

  it('shows each currency symbol alongside its code', async () => {
    await setup();
    await userEvent.press(screen.getByLabelText('Currency'));
    expect(screen.getByText('€')).toBeTruthy();
    expect(screen.getByText('£')).toBeTruthy();
  });

  it('reports the chosen value and closes', async () => {
    const { onChange } = await setup();
    await userEvent.press(screen.getByLabelText('Currency'));
    await userEvent.press(screen.getByLabelText('EUR'));

    expect(onChange).toHaveBeenCalledWith('EUR');
    expect(screen.queryByText('£')).toBeNull();
  });

  it('shows the placeholder when nothing is selected', async () => {
    await setup({ value: null });
    expect(screen.getByText('Any currency')).toBeTruthy();
  });

  it('offers a clear row only when the caller supplies one', async () => {
    const onClear = jest.fn();
    await setup({ clearLabel: 'Any currency', onClear });
    await userEvent.press(screen.getByLabelText('Currency'));
    await userEvent.press(screen.getByLabelText('Any currency'));
    expect(onClear).toHaveBeenCalled();
  });
});

describe('currency in the filter panel', () => {
  it('is a dropdown, and applies the chosen unit', async () => {
    const onApply = jest.fn();
    await renderWithProviders(
      <FilterSheet visible facets={EMPTY_FACETS} onClose={jest.fn()} onApply={onApply} />,
    );

    // Closed: only the placeholder is on screen, not fourteen chips.
    expect(screen.getByText('Any currency')).toBeTruthy();
    expect(screen.queryByText('SEK')).toBeNull();

    await userEvent.press(screen.getByLabelText('Currency'));
    await userEvent.press(screen.getByLabelText('USD'));
    await userEvent.press(screen.getByLabelText('Apply'));

    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ currency: 'USD' }));
  });

  it('can be cleared back to any currency', async () => {
    const onApply = jest.fn();
    await renderWithProviders(
      <FilterSheet
        visible
        facets={{ ...EMPTY_FACETS, currency: 'EUR' }}
        onClose={jest.fn()}
        onApply={onApply}
      />,
    );
    await userEvent.press(screen.getByLabelText('Currency'));
    await userEvent.press(screen.getByLabelText('Any currency'));
    await userEvent.press(screen.getByLabelText('Apply'));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ currency: null }));
  });
});
