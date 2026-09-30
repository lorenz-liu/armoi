/** The edge rail's resting position, its bounds, and that it stays tappable. */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { EdgeRail, clampRailCentre } from '@/components';
import { RAIL, STORAGE_KEYS } from '@/config';
import { PreferencesProvider, usePreferences } from '@/hooks/usePreferences';
import { layout } from '@/theme';

import { AppProviders, TEST_METRICS, renderWithProviders, screen, userEvent } from '../test-utils/render';

const { insets, frame } = TEST_METRICS;
const bounds = {
  viewportHeight: frame.height, // 852
  topInset: insets.top, // 59
  bottomInset: insets.bottom, // 34
};
const half = layout.rail.height / 2;

describe('clampRailCentre', () => {
  it('leaves the default 500 from the bottom untouched on a normal phone', () => {
    expect(RAIL.defaultBottomInset).toBe(500);
    expect(clampRailCentre({ offset: RAIL.defaultBottomInset, ...bounds })).toBe(500);
  });

  it('never lets the rail run off the bottom edge', () => {
    const settled = clampRailCentre({ offset: 0, ...bounds });
    expect(settled - half).toBeGreaterThanOrEqual(insets.bottom);
  });

  it('never lets the rail run off the top edge', () => {
    const settled = clampRailCentre({ offset: 5000, ...bounds });
    expect(settled + half).toBeLessThanOrEqual(frame.height - insets.top);
  });

  it('keeps clear of the safe area by the configured margin', () => {
    const lowest = clampRailCentre({ offset: -100, ...bounds });
    expect(lowest).toBe(insets.bottom + RAIL.edgeMarginUnits * 4 + half);
  });

  it('is a no-op for any position already in range', () => {
    for (const offset of [200, 300, 500, 600]) {
      expect(clampRailCentre({ offset, ...bounds })).toBe(offset);
    }
  });

  it('centres the rail when the viewport is too short to hold it', () => {
    const tiny = { viewportHeight: 120, topInset: 20, bottomInset: 20 };
    expect(clampRailCentre({ offset: 500, ...tiny })).toBe(60);
  });
});

describe('EdgeRail', () => {
  it('offers both libraries and reports which was tapped', async () => {
    const onSelect = jest.fn();
    await renderWithProviders(<EdgeRail onSelect={onSelect} />);

    expect(screen.getByText('Storage')).toBeTruthy();
    expect(screen.getByText('Brands')).toBeTruthy();

    await userEvent.press(screen.getByLabelText('Brands'));
    expect(onSelect).toHaveBeenCalledWith('brand');
  });

  it('says it can be moved, for anyone who cannot see the grip', async () => {
    await renderWithProviders(<EdgeRail onSelect={jest.fn()} />);
    expect(screen.getByLabelText('Storage').props.accessibilityHint).toBe(
      'Drag the bar to move it',
    );
  });
});

describe('rail position preference', () => {
  beforeEach(() => AsyncStorage.clear());

  it('starts at the default until the user moves it', async () => {
    const { result } = await renderHook(() => usePreferences(), { wrapper: PreferencesProvider });
    await waitFor(() => expect(result.current.railOffset).toBe(RAIL.defaultBottomInset));
  });

  it('remembers where it was dropped', async () => {
    const { result } = await renderHook(() => usePreferences(), { wrapper: PreferencesProvider });

    await act(async () => {
      result.current.setRailOffset(312.6);
    });
    // Rounded: sub-pixel precision would survive a reload for no benefit.
    expect(result.current.railOffset).toBe(313);
    await waitFor(async () =>
      expect(await AsyncStorage.getItem(STORAGE_KEYS.railOffset)).toBe('313'),
    );
  });

  it('restores the stored position on the next launch', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.railOffset, '240');
    const { result } = await renderHook(() => usePreferences(), { wrapper: PreferencesProvider });
    await waitFor(() => expect(result.current.railOffset).toBe(240));
  });

  it('ignores a corrupt stored value rather than vanishing off screen', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.railOffset, 'not-a-number');
    const { result } = await renderHook(() => usePreferences(), { wrapper: AppProviders });
    await waitFor(() => expect(result.current.railOffset).toBe(RAIL.defaultBottomInset));
  });
});
