/** Wire types — mirror of `infra/app/schemas.py`. */

import type {
  CURRENCIES,
  GENDERS,
  ITEM_FIELDS,
  SEASONS,
  SORT_FIELDS,
  SORT_OPTIONS,
  VIEW_MODES,
} from '@/config';

export type Season = (typeof SEASONS)[number];
export type Gender = (typeof GENDERS)[number];
export type Currency = (typeof CURRENCIES)[number];
export type SortField = (typeof SORT_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';
export type SortOptionId = (typeof SORT_OPTIONS)[number]['id'];
export type ItemField = (typeof ITEM_FIELDS)[number];
export type ViewMode = (typeof VIEW_MODES)[number];

export type ItemImage = {
  id: number;
  position: number;
  url: string;
  width: number | null;
  height: number | null;
};

export type ItemSummary = {
  id: number;
  name: string;
  brand: string | null;
  brand_id: number | null;
  storage: string | null;
  storage_id: number | null;
  category_id: string | null;
  gender: Gender | null;
  seasons: Season[];
  price_amount: string | null;
  price_currency: Currency | null;
  cover_image: ItemImage | null;
  image_count: number;
  /** ISO date, or null if it has never been worn. */
  last_used_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Item = ItemSummary & {
  notes: string | null;
  images: ItemImage[];
  pairings: ItemSummary[];
};

export type ItemDraft = {
  name: string;
  brand: string | null;
  storage: string | null;
  category_id: string | null;
  gender: Gender | null;
  seasons: Season[];
  price_amount: string | null;
  price_currency: Currency | null;
  notes: string | null;
  pairing_ids: number[];
};

export type Vocabulary = {
  id: number;
  name: string;
  item_count: number;
  created_at: string;
};

export type Suggestion = { id: number; name: string; item_count: number };

export type Page<T> = { items: T[]; total: number; limit: number; offset: number };

export type LibraryStats = {
  item_count: number;
  brand_count: number;
  storage_count: number;
  image_count: number;
  pairing_count: number;
};

export type Meta = {
  seasons: Season[];
  genders: Gender[];
  currencies: Currency[];
  default_currency: Currency;
  max_images_per_item: number;
};

/** Every way the library can be narrowed. Empty arrays mean "no constraint". */
export type ItemQuery = {
  search?: string;
  brand_id?: number[];
  storage_id?: number[];
  category_id?: string[];
  gender?: Gender[];
  season?: Season[];
  currency?: Currency | null;
  min_price?: number | null;
  max_price?: number | null;
  sort?: SortField;
  order?: SortOrder;
  limit?: number;
  offset?: number;
};

export type LocalImage = { uri: string; mimeType: string; fileName: string };
