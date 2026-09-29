/** View mode and sort order, persisted so the library opens as you left it. */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { SortField, SortOrder, ViewMode } from '@/api';
import {
  DEFAULT_SORT,
  DEFAULT_SORT_ORDER,
  DEFAULT_VIEW_MODE,
  SORT_FIELDS,
  STORAGE_KEYS,
  VIEW_MODES,
} from '@/config';

type Preferences = {
  viewMode: ViewMode;
  sort: SortField;
  order: SortOrder;
  setViewMode: (mode: ViewMode) => void;
  setSort: (sort: SortField, order: SortOrder) => void;
};

const PreferencesContext = createContext<Preferences | null>(null);

type StoredSort = { sort: SortField; order: SortOrder };

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(DEFAULT_VIEW_MODE);
  const [{ sort, order }, setSortState] = useState<StoredSort>({
    sort: DEFAULT_SORT,
    order: DEFAULT_SORT_ORDER,
  });

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.multiGet([STORAGE_KEYS.viewMode, STORAGE_KEYS.sort]).then((entries) => {
      if (cancelled) return;
      const stored = Object.fromEntries(entries);
      const mode = stored[STORAGE_KEYS.viewMode];
      if (mode && (VIEW_MODES as readonly string[]).includes(mode)) {
        setViewModeState(mode as ViewMode);
      }
      const rawSort = stored[STORAGE_KEYS.sort];
      if (rawSort) {
        try {
          const parsed = JSON.parse(rawSort) as StoredSort;
          if ((SORT_FIELDS as readonly string[]).includes(parsed.sort)) setSortState(parsed);
        } catch {
          // a corrupt entry simply falls back to the defaults
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    void AsyncStorage.setItem(STORAGE_KEYS.viewMode, mode);
  }, []);

  const setSort = useCallback((nextSort: SortField, nextOrder: SortOrder) => {
    const next = { sort: nextSort, order: nextOrder };
    setSortState(next);
    void AsyncStorage.setItem(STORAGE_KEYS.sort, JSON.stringify(next));
  }, []);

  const value = useMemo(
    () => ({ viewMode, sort, order, setViewMode, setSort }),
    [viewMode, sort, order, setViewMode, setSort],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): Preferences {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return context;
}
