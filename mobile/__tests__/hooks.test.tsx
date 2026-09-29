/** Request lifecycle: first-load flag, race handling, and debounced querying. */

import { act, renderHook, waitFor } from '@testing-library/react-native';

import { ApiError, type ItemQuery, type ItemSummary, type Page } from '@/api';
import { MOTION } from '@/config';
import { useAsync } from '@/hooks/useAsync';
import { useDebounced } from '@/hooks/useDebounced';
import { useLibrary } from '@/hooks/useLibrary';

import { AppProviders } from '../test-utils/render';

const emptyPage: Page<ItemSummary> = { items: [], total: 0, limit: 40, offset: 0 };

/** A promise whose resolution the test controls. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('useAsync', () => {
  it('flags the very first load, but not later refreshes', async () => {
    const first = deferred<string>();
    const fetcher = jest.fn(() => first.promise);
    const { result } = await renderHook(() => useAsync(fetcher, []));

    expect(result.current.initialLoading).toBe(true);

    await act(async () => {
      first.resolve('value');
    });
    expect(result.current.data).toBe('value');
    expect(result.current.initialLoading).toBe(false);

    await act(async () => {
      await result.current.refetch();
    });
    // A refresh reloads without falling back to the first-load state.
    expect(result.current.initialLoading).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('captures the error instead of throwing', async () => {
    const { result } = await renderHook(() =>
      useAsync(async () => {
        throw new ApiError(404, 'gone', '/x');
      }, []),
    );
    await waitFor(() => expect(result.current.error?.status).toBe(404));
    expect(result.current.data).toBeUndefined();
  });

  it('clears a stale error once a retry succeeds', async () => {
    let shouldFail = true;
    const { result } = await renderHook(() =>
      useAsync(async () => {
        if (shouldFail) throw new ApiError(500, 'boom', '/x');
        return 'ok';
      }, []),
    );
    await waitFor(() => expect(result.current.error).toBeDefined());
    shouldFail = false;
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBe('ok');
  });

  it('ignores a slow response that a newer call has superseded', async () => {
    const calls = [deferred<string>(), deferred<string>()];
    let index = 0;
    const { result } = await renderHook(() =>
      useAsync(() => calls[index++]!.promise, []),
    );

    await act(async () => {
      void result.current.refetch();
    });

    // Settle the newest call first, then the stale one: the stale value must lose.
    await act(async () => {
      calls[1]!.resolve('new');
      calls[0]!.resolve('stale');
    });

    expect(result.current.data).toBe('new');
  });
});

describe('useDebounced', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('holds the value back until the delay elapses', async () => {
    const { result, rerender } = await renderHook<string, { value: string }>(({ value }) => useDebounced(value, 300), {
      initialProps: { value: 'a' },
    });

    await rerender({ value: 'ab' });
    expect(result.current).toBe('a');

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('ab');
  });

  it('only emits the final value of a burst', async () => {
    const { result, rerender } = await renderHook<string, { value: string }>(({ value }) => useDebounced(value, 300), {
      initialProps: { value: '' },
    });

    for (const value of ['c', 'co', 'coa', 'coat']) {
      await rerender({ value });
      await act(async () => {
        jest.advanceTimersByTime(100);
      });
    }
    expect(result.current).toBe('');

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('coat');
  });
});

describe('useLibrary', () => {
  const setup = async (source = jest.fn(async (_query: ItemQuery) => emptyPage)) => {
    const hook = await renderHook(() => useLibrary(source), { wrapper: AppProviders });
    return { ...hook, source };
  };

  it('fetches once on mount with the persisted sort', async () => {
    const { result, source } = await setup();
    await waitFor(() => expect(source).toHaveBeenCalledTimes(1));
    expect(source.mock.calls[0]?.[0]).toMatchObject({ sort: 'created_at', order: 'desc' });
    expect(result.current.activeFacetCount).toBe(0);
  });

  it('passes applied facets through to the query', async () => {
    const { result, source } = await setup();
    await waitFor(() => expect(source).toHaveBeenCalled());

    await act(async () => {
      result.current.setFacets({
        categoryIds: ['clothing'],
        seasons: ['winter'],
        genders: [],
        brandIds: [],
        storageIds: [],
        currency: null,
        minPrice: null,
        maxPrice: null,
      });
    });

    await waitFor(() =>
      expect(source).toHaveBeenLastCalledWith(
        expect.objectContaining({ category_id: ['clothing'], season: ['winter'] }),
      ),
    );
    expect(result.current.activeFacetCount).toBe(2);
  });

  it('does not refetch on every keystroke', async () => {
    const { result, source } = await setup();
    await waitFor(() => expect(source).toHaveBeenCalledTimes(1));

    jest.useFakeTimers();
    try {
      await act(async () => {
        result.current.setSearch('c');
        result.current.setSearch('co');
        result.current.setSearch('coat');
      });
      expect(source).toHaveBeenCalledTimes(1);

      await act(async () => {
        jest.advanceTimersByTime(MOTION.slow);
      });
      expect(source).toHaveBeenCalledTimes(2);
      expect(source).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'coat' }));
    } finally {
      jest.useRealTimers();
    }
  });

  it('resets every facet at once', async () => {
    const { result } = await setup();
    await act(async () => {
      result.current.setFacets({
        categoryIds: ['bags'],
        seasons: [],
        genders: ['unisex'],
        brandIds: [],
        storageIds: [],
        currency: 'EUR',
        minPrice: 10,
        maxPrice: null,
      });
    });
    await waitFor(() => expect(result.current.activeFacetCount).toBe(4));

    await act(async () => {
      result.current.clearFacets();
    });
    await waitFor(() => expect(result.current.activeFacetCount).toBe(0));
  });
});
