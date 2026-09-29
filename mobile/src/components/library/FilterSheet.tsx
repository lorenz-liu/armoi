/**
 * The filter panel. Facets are edited on a local draft and only committed on
 * Apply, so a half-built filter never triggers a request.
 */

import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import type { Currency, Gender, Season } from '@/api';
import { CURRENCIES, GENDERS, SEASONS } from '@/config';
import { EMPTY_FACETS, countActiveFacets, type Facets } from '@/hooks/useLibrary';
import { useI18n } from '@/i18n';
import { color, layout, space } from '@/theme';

import { Button, Chip, Sheet, Text, TextField } from '../ui';

import { CategoryPicker } from './CategoryPicker';

/** Toggles a value in and out of a facet array. */
function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

export type FilterSheetProps = {
  visible: boolean;
  facets: Facets;
  onClose: () => void;
  onApply: (facets: Facets) => void;
  /** Facets the screen itself pins, hidden from the panel (a brand page). */
  hidden?: (keyof Facets)[];
};

/**
 * Remounted on each open via `key`, so the draft always initialises from the
 * applied facets — no effect needed to keep the two in sync.
 */
export function FilterSheet(props: FilterSheetProps) {
  return <FilterSheetBody key={props.visible ? 'open' : 'closed'} {...props} />;
}

function FilterSheetBody({ visible, facets, onClose, onApply, hidden = [] }: FilterSheetProps) {
  const { t, tCategoryPath } = useI18n();
  const [draft, setDraft] = useState(facets);
  const [pickingCategory, setPickingCategory] = useState(false);

  const shows = (facet: keyof Facets) => !hidden.includes(facet);
  const parsePrice = (raw: string): number | null => {
    const value = Number(raw.replace(/[^\d.]/g, ''));
    return raw.trim() === '' || !Number.isFinite(value) ? null : value;
  };

  return (
    <>
      <Sheet
        visible={visible && !pickingCategory}
        onClose={onClose}
        title={t('filter.title')}
        closeLabel={t('common.close')}
        footer={
          <>
            <Button
              label={t('filter.clear')}
              variant="ghost"
              onPress={() => setDraft(EMPTY_FACETS)}
            />
            <View style={{ flex: 1 }} />
            <Button
              label={t('filter.apply')}
              onPress={() => {
                onApply(draft);
                onClose();
              }}
            />
          </>
        }
      >
        <ScrollView
          style={{ maxHeight: space.huge * 5 }}
          contentContainerStyle={{ paddingHorizontal: layout.gutter, gap: space.lg }}
          keyboardShouldPersistTaps="handled"
        >
          {shows('categoryIds') ? (
            <Section title={t('filter.category')}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
                {draft.categoryIds.map((id) => (
                  <Chip
                    key={id}
                    label={tCategoryPath(id)}
                    selected
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,
                        categoryIds: toggle(current.categoryIds, id),
                      }))
                    }
                  />
                ))}
                <Chip label={`+ ${t('common.select')}`} onPress={() => setPickingCategory(true)} />
              </View>
            </Section>
          ) : null}

          <Section title={t('filter.season')}>
            <Row>
              {SEASONS.map((season: Season) => (
                <Chip
                  key={season}
                  label={t(`season.${season}`)}
                  dotColor={color.season[season]}
                  selected={draft.seasons.includes(season)}
                  onPress={() =>
                    setDraft((current) => ({ ...current, seasons: toggle(current.seasons, season) }))
                  }
                />
              ))}
            </Row>
          </Section>

          <Section title={t('filter.gender')}>
            <Row>
              {GENDERS.map((gender: Gender) => (
                <Chip
                  key={gender}
                  label={t(`gender.${gender}`)}
                  selected={draft.genders.includes(gender)}
                  onPress={() =>
                    setDraft((current) => ({ ...current, genders: toggle(current.genders, gender) }))
                  }
                />
              ))}
            </Row>
          </Section>

          <Section title={t('filter.price')}>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ flex: 1 }}>
                <TextField
                  value={draft.minPrice === null ? '' : String(draft.minPrice)}
                  onChangeText={(raw) =>
                    setDraft((current) => ({ ...current, minPrice: parsePrice(raw) }))
                  }
                  keyboardType="decimal-pad"
                  placeholder="0"
                  accessibilityLabel={`${t('filter.price')} ${t('sort.asc')}`}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  value={draft.maxPrice === null ? '' : String(draft.maxPrice)}
                  onChangeText={(raw) =>
                    setDraft((current) => ({ ...current, maxPrice: parsePrice(raw) }))
                  }
                  keyboardType="decimal-pad"
                  placeholder="∞"
                  accessibilityLabel={`${t('filter.price')} ${t('sort.desc')}`}
                />
              </View>
            </View>
            <Row>
              {CURRENCIES.map((currency: Currency) => (
                <Chip
                  key={currency}
                  label={currency}
                  selected={draft.currency === currency}
                  onPress={() =>
                    setDraft((current) => ({
                      ...current,
                      currency: current.currency === currency ? null : currency,
                    }))
                  }
                />
              ))}
            </Row>
          </Section>

          <Text variant="caption" tone="faint" style={{ paddingBottom: space.md }}>
            {countActiveFacets(draft) > 0
              ? t('filter.activeMany', { count: countActiveFacets(draft) })
              : t('common.none')}
          </Text>
        </ScrollView>
      </Sheet>

      <CategoryPicker
        visible={pickingCategory}
        value={null}
        onClose={() => setPickingCategory(false)}
        onSelect={(id) =>
          setDraft((current) =>
            id === null || current.categoryIds.includes(id)
              ? current
              : { ...current, categoryIds: [...current.categoryIds, id] },
          )
        }
        allowClear={false}
      />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.xs }}>
      <Text variant="overline" tone="faint">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>{children}</View>
  );
}
