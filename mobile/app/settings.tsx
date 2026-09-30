/** Language, default view, library counters and server reachability. */

import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api, type ItemField, type ViewMode } from '@/api';
import {
  Chip,
  Icon,
  IconButton,
  Screen,
  SegmentedControl,
  Surface,
  Text,
  type Segment,
} from '@/components';
import { API, ITEM_FIELDS, LANGUAGES, VIEW_MODES } from '@/config';
import { useAsync } from '@/hooks/useAsync';
import { usePreferences } from '@/hooks/usePreferences';
import { useI18n, type Language, type TranslationKey } from '@/i18n';
import { color, layout, space } from '@/theme';

/** Each field reuses the label the item form already gives it. */
const ITEM_FIELD_LABELS = {
  brand: 'item.brand',
  storage: 'item.storage',
  category: 'item.category',
  price: 'item.price',
  lastUsed: 'item.lastUsed',
  seasons: 'item.season',
} as const satisfies Record<ItemField, TranslationKey>;

export default function SettingsRoute() {
  const router = useRouter();
  const { t, language, setLanguage } = useI18n();
  const { viewMode, setViewMode, itemFields, toggleItemField } = usePreferences();
  const insets = useSafeAreaInsets();

  const stats = useAsync(useCallback(() => api.catalog.stats(), []), []);
  const reachable = stats.error === undefined && stats.data !== undefined;

  const viewSegments: Segment<ViewMode>[] = VIEW_MODES.map((mode) => ({
    value: mode,
    label: t(`view.${mode}`),
    accessibilityLabel: t(`view.${mode}`),
  }));

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: space.sm,
          paddingBottom: space.xs,
        }}
      >
        <IconButton name="x" label={t('common.close')} onPress={() => router.back()} />
        <Text variant="subtitle">{t('settings.title')}</Text>
        <View style={{ width: layout.touchTarget }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: layout.gutter,
          paddingBottom: insets.bottom + space.xxl,
          gap: space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Section title={t('settings.language')}>
          <View style={{ flexDirection: 'row', gap: space.xs }}>
            {LANGUAGES.map((code: Language) => (
              <Chip
                key={code}
                label={t(code === 'en' ? 'settings.languageEn' : 'settings.languageZh')}
                selected={language === code}
                onPress={() => setLanguage(code)}
              />
            ))}
          </View>
        </Section>

        <Section title={t('settings.defaultView')}>
          <SegmentedControl segments={viewSegments} value={viewMode} onChange={setViewMode} fill />
        </Section>

        <Section title={t('settings.itemFields')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
            {ITEM_FIELDS.map((field: ItemField) => (
              <Chip
                key={field}
                label={t(ITEM_FIELD_LABELS[field])}
                selected={itemFields.includes(field)}
                onPress={() => toggleItemField(field)}
              />
            ))}
          </View>
          <Text variant="caption" tone="faint">
            {t('settings.itemFieldsHint')}
          </Text>
        </Section>

        <Section title={t('settings.stats')}>
          <Surface corner="lg" style={{ padding: space.md, gap: space.sm }}>
            <StatRow label={t('settings.items')} value={stats.data?.item_count} />
            <StatRow label={t('settings.brands')} value={stats.data?.brand_count} />
            <StatRow label={t('settings.storages')} value={stats.data?.storage_count} />
            <StatRow label={t('settings.photos')} value={stats.data?.image_count} />
            <StatRow label={t('settings.pairs')} value={stats.data?.pairing_count} />
          </Surface>
        </Section>

        <Section title={t('settings.connection')}>
          <Surface corner="lg" style={{ padding: space.md, gap: space.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
              <Icon
                name={reachable ? 'check-circle' : 'alert-circle'}
                size={14}
                color={reachable ? color.accent : color.danger}
              />
              <Text variant="body" tone={reachable ? 'ink' : 'danger'}>
                {t(reachable ? 'settings.connectionOk' : 'settings.connectionFail')}
              </Text>
            </View>
            <Text variant="caption" tone="faint" selectable>
              {API.baseUrl}
            </Text>
          </Surface>
        </Section>

        <Section title={t('settings.about')}>
          <Text variant="caption" tone="faint">
            {t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
          </Text>
          <Text variant="caption" tone="faint">
            {t('app.tagline')}
          </Text>
        </Section>
      </ScrollView>
    </Screen>
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

function StatRow({ label, value }: { label: string; value: number | undefined }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant="body" tone="muted">
        {label}
      </Text>
      <Text variant="price">{value ?? '—'}</Text>
    </View>
  );
}
