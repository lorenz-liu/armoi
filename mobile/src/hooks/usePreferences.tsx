/**
 * View mode, sort order and the rail's position — persisted so the library
 * opens exactly as you left it.
 */

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

import type { ItemField, SortField, SortOptionId, SortOrder, ViewMode } from '@/api';
import {
  DEFAULT_ITEM_FIELDS,
  DEFAULT_SORT_OPTION,
  DEFAULT_VIEW_MODE,
  ITEM_FIELDS,
  RAIL,
  SORT_OPTIONS,
  STORAGE_KEYS,
  VIEW_MODES,
} from '@/config';

/** Resolves a menu choice to the field and direction the API expects. */
export function resolveSort(option: SortOptionId): { sort: SortField; order: SortOrder } {
  const match = SORT_OPTIONS.find((entry) => entry.id === option) ?? SORT_OPTIONS[0];
  return { sort: match.field, order: match.order };
}

type Preferences = {
  viewMode: ViewMode;
  sortOption: SortOptionId;
  /** The resolved field and direction, for whoever builds the query. */
  sort: SortField;
  order: SortOrder;
  /** Distance from the bottom of the screen to the edge rail's centre. */
  railOffset: number;
  /** Which metadata library cells carry beneath the photograph. */
  itemFields: ItemField[];
  setViewMode: (mode: ViewMode) => void;
  setSortOption: (option: SortOptionId) => void;
  setRailOffset: (offset: number) => void;
  toggleItemField: (field: ItemField) => void;
};

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(DEFAULT_VIEW_MODE);
  const [sortOption, setSortOptionState] = useState<SortOptionId>(DEFAULT_SORT_OPTION);
  const [railOffset, setRailOffsetState] = useState<number>(RAIL.defaultBottomInset);
  const [itemFields, setItemFieldsState] = useState<ItemField[]>([...DEFAULT_ITEM_FIELDS]);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.multiGet([
      STORAGE_KEYS.viewMode,
      STORAGE_KEYS.sortOption,
      STORAGE_KEYS.railOffset,
      STORAGE_KEYS.itemFields,
    ]).then((entries) => {
      if (cancelled) return;
      const stored = Object.fromEntries(entries);
      const mode = stored[STORAGE_KEYS.viewMode];
      if (mode && (VIEW_MODES as readonly string[]).includes(mode)) {
        setViewModeState(mode as ViewMode);
      }
      const storedSort = stored[STORAGE_KEYS.sortOption];
      if (storedSort && SORT_OPTIONS.some((entry) => entry.id === storedSort)) {
        setSortOptionState(storedSort as SortOptionId);
      }
      const rawOffset = Number(stored[STORAGE_KEYS.railOffset]);
      // The rail re-clamps to the viewport, so any finite value is safe here.
      if (Number.isFinite(rawOffset) && rawOffset > 0) setRailOffsetState(rawOffset);

      const rawFields = stored[STORAGE_KEYS.itemFields];
      if (rawFields) {
        try {
          const parsed = JSON.parse(rawFields) as unknown;
          if (Array.isArray(parsed)) {
            // Keep only fields this build knows, in the canonical render order.
            setItemFieldsState(ITEM_FIELDS.filter((field) => parsed.includes(field)));
          }
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

  const setSortOption = useCallback((option: SortOptionId) => {
    setSortOptionState(option);
    void AsyncStorage.setItem(STORAGE_KEYS.sortOption, option);
  }, []);

  const setRailOffset = useCallback((offset: number) => {
    const rounded = Math.round(offset);
    setRailOffsetState(rounded);
    void AsyncStorage.setItem(STORAGE_KEYS.railOffset, String(rounded));
  }, []);

  const toggleItemField = useCallback((field: ItemField) => {
    setItemFieldsState((current) => {
      const next = current.includes(field)
        ? current.filter((entry) => entry !== field)
        : ITEM_FIELDS.filter((entry) => entry === field || current.includes(entry));
      void AsyncStorage.setItem(STORAGE_KEYS.itemFields, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(() => {
    const { sort, order } = resolveSort(sortOption);
    return {
      viewMode,
      sortOption,
      sort,
      order,
      railOffset,
      itemFields,
      setViewMode,
      setSortOption,
      setRailOffset,
      toggleItemField,
    };
  }, [
    viewMode,
    sortOption,
    railOffset,
    itemFields,
    setViewMode,
    setSortOption,
    setRailOffset,
    toggleItemField,
  ]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): Preferences {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return context;
}
