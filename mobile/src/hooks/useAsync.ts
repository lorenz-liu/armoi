/**
 * A minimal request hook: run an async function, expose `{data, error,
 * loading}`, refetch on demand, and ignore results from superseded calls.
 *
 * Armoi's data set is small and single-user, so a full cache layer would cost
 * more than it saves; refetch-on-focus keeps screens current instead.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/api';

export type AsyncState<T> = {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  /** True only for the first load, so lists can skip a spinner on refresh. */
  initialLoading: boolean;
  refetch: () => Promise<void>;
  setData: (updater: (previous: T | undefined) => T | undefined) => void;
};

export function useAsync<T>(fetcher: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<ApiError>();
  const [loading, setLoading] = useState(true);
  const [settledOnce, setSettledOnce] = useState(false);

  // Monotonic token: only the newest call is allowed to write state.
  const callId = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Kept in a ref so `run` stays stable while always calling the latest closure.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const run = useCallback(async () => {
    const id = (callId.current += 1);
    setLoading(true);
    try {
      const result = await fetcherRef.current();
      if (!mounted.current || id !== callId.current) return;
      setData(result);
      setError(undefined);
    } catch (caught) {
      if (!mounted.current || id !== callId.current) return;
      setError(caught instanceof ApiError ? caught : new ApiError(0, String(caught), ''));
    } finally {
      if (mounted.current && id === callId.current) {
        setLoading(false);
        setSettledOnce(true);
      }
    }
  }, []);

  useEffect(() => {
    // Fetching *is* this hook's job, so the resulting setState is the point.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    error,
    loading,
    initialLoading: loading && !settledOnce,
    refetch: run,
    setData: (updater) => setData((previous) => updater(previous)),
  };
}
