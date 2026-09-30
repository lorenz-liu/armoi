/**
 * Resolves a library cell's caption from the user's chosen fields.
 *
 * Cards and list rows share it so the two can never drift, and so "show
 * storage, not price" is one decision rather than two implementations.
 */

import { useMemo } from 'react';

import type { ItemField, ItemSummary } from '@/api';
import { useI18n } from '@/i18n';

import { usePreferences } from './usePreferences';

export type ItemCaption = {
  /** The eyebrow line, or null when the brand is hidden or unknown. */
  brand: string | null;
  /** Storage, category, price and last-worn, joined into one muted line. */
  meta: string | null;
  showSeasons: boolean;
};

const META_SEPARATOR = ' · ';

export function useItemCaption(item: ItemSummary): ItemCaption {
  const { t, formatPrice, formatDate, tCategory } = useI18n();
  const { itemFields } = usePreferences();

  return useMemo(() => {
    const enabled = (field: ItemField) => itemFields.includes(field);

    // Built in ITEM_FIELDS order, so the line reads the same on every cell.
    const parts: string[] = [];
    if (enabled('storage') && item.storage) parts.push(item.storage);
    if (enabled('category') && item.category_id) parts.push(tCategory(item.category_id));
    if (enabled('price') && item.price_amount) {
      parts.push(formatPrice(item.price_amount, item.price_currency));
    }
    if (enabled('lastUsed')) {
      parts.push(item.last_used_date ? formatDate(item.last_used_date) : t('item.neverUsed'));
    }

    return {
      brand: enabled('brand') ? (item.brand ?? null) : null,
      meta: parts.length > 0 ? parts.join(META_SEPARATOR) : null,
      showSeasons: enabled('seasons') && item.seasons.length > 0,
    };
  }, [item, itemFields, t, formatPrice, formatDate, tCategory]);
}
