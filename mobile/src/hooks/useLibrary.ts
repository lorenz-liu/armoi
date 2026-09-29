/**
 * The browsing state shared by the three library surfaces (main, one brand,
 * one storage): search text, filter facets, sort, and the fetch they drive.
 */

import { useCallback, useMemo, useState } from 'react';

import type { Currency, Gender, ItemQuery, ItemSummary, Page, Season } from '@/api';
import { MOTION } from '@/config';

import { useAsync } from './useAsync';
import { useDebounced } from './useDebounced';
import { usePreferences } from './usePreferences';

export type Facets = {
  categoryIds: string[];
  seasons: Season[];
  genders: Gender[];
  brandIds: number[];
  storageIds: number[];
  currency: Currency | null;
  minPrice: number | null;
  maxPrice: number | null;
};

export const EMPTY_FACETS: Facets = {
  categoryIds: [],
  seasons: [],
  genders: [],
  brandIds: [],
  storageIds: [],
  currency: null,
  minPrice: null,
  maxPrice: null,
};

/** How many facets are constraining the result — drives the filter badge. */
export function countActiveFacets(facets: Facets): number {
  return (
    facets.categoryIds.length +
    facets.seasons.length +
    facets.genders.length +
    facets.brandIds.length +
    facets.storageIds.length +
    (facets.currency ? 1 : 0) +
    (facets.minPrice !== null || facets.maxPrice !== null ? 1 : 0)
  );
}

export type LibrarySource = (query: ItemQuery) => Promise<Page<ItemSummary>>;

export function useLibrary(source: LibrarySource, hiddenFacets: Partial<Facets> = {}) {
  const { sort, order } = usePreferences();
  const [search, setSearch] = useState('');
  const [facets, setFacets] = useState<Facets>(EMPTY_FACETS);

  // Search runs one motion-cycle behind typing, so each keystroke is not a request.
  const debouncedSearch = useDebounced(search, MOTION.slow);

  const query = useMemo<ItemQuery>(
    () => ({
      search: debouncedSearch.trim() || undefined,
      category_id: facets.categoryIds,
      season: facets.seasons,
      gender: facets.genders,
      brand_id: facets.brandIds,
      storage_id: facets.storageIds,
      currency: facets.currency,
      min_price: facets.minPrice,
      max_price: facets.maxPrice,
      sort,
      order,
    }),
    [debouncedSearch, facets, sort, order],
  );

  const state = useAsync(() => source(query), [JSON.stringify(query)]);

  const clearFacets = useCallback(() => setFacets(EMPTY_FACETS), []);

  return {
    search,
    setSearch,
    facets,
    setFacets,
    clearFacets,
    /** Facets that the screen itself fixes (a brand page pins the brand). */
    hiddenFacets,
    activeFacetCount: countActiveFacets(facets),
    items: state.data?.items ?? [],
    total: state.data?.total ?? 0,
    ...state,
  };
}
