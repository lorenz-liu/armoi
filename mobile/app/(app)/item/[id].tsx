/**
 * One piece, in full: the photographs first, then the record, then what it
 * is worn with. The order mirrors the lookbook reading path — image, maker,
 * object, detail — rather than a spec sheet.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api, localToday, type ItemSummary } from '@/api';
import {
  Button,
  ErrorState,
  Icon,
  IconButton,
  ItemPhoto,
  LoadingState,
  Screen,
  SeasonDots,
  Surface,
  Text,
  Touchable,
  UsageButton,
} from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { useI18n } from '@/i18n';
import { color, layout, radius, space, u } from '@/theme';

/** The gallery occupies this share of the viewport height — a full-bleed plate. */
const GALLERY_HEIGHT_FRACTION = 0.52;
const PAIRING_CARD_WIDTH = u(30); // 120pt

export default function ItemDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = Number(id);
  const router = useRouter();
  const { t, formatPrice, formatDate, tCategoryPath } = useI18n();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  const state = useAsync(useCallback(() => api.items.read(itemId), [itemId]), [itemId]);
  const item = state.data;

  const markUsed = async () => {
    const saved = await api.items.markUsed(itemId, localToday());
    state.setData(() => saved);
  };

  const clearUsed = async () => {
    await api.items.clearUsed(itemId);
    await state.refetch();
  };

  const confirmDelete = () => {
    Alert.alert(t('item.deleteConfirmTitle'), t('item.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('item.delete'),
        style: 'destructive',
        onPress: async () => {
          await api.items.remove(itemId);
          router.back();
        },
      },
    ]);
  };

  if (state.initialLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (state.error || !item) {
    return (
      <Screen>
        <TopBar onBack={() => router.back()} />
        {state.error ? <ErrorState error={state.error} onRetry={state.refetch} /> : null}
      </Screen>
    );
  }

  const galleryHeight = Math.round(height * GALLERY_HEIGHT_FRACTION);

  return (
    <Screen padTop={false}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + space.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) =>
              setPage(Math.round(event.nativeEvent.contentOffset.x / width))
            }
          >
            {(item.images.length > 0 ? item.images : [null]).map((image, index) => (
              <View key={image?.id ?? index} style={{ width }}>
                <ItemPhoto image={image} height={galleryHeight} corner="none" />
              </View>
            ))}
          </ScrollView>

          <View style={{ position: 'absolute', top: insets.top, left: 0, right: 0 }}>
            <TopBar onBack={() => router.back()} onEdit={() => router.push(`/item/edit?id=${itemId}`)} />
          </View>

          {item.images.length > 1 ? (
            <View
              style={{
                position: 'absolute',
                bottom: space.md,
                alignSelf: 'center',
                flexDirection: 'row',
                gap: space.xxs,
              }}
            >
              {item.images.map((image, index) => (
                <View
                  key={image.id}
                  style={{
                    width: u(1.5),
                    height: u(1.5),
                    borderRadius: radius.pill,
                    backgroundColor: index === page ? color.ink : color.line,
                  }}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={{ padding: layout.gutter, gap: space.lg }}>
          <View style={{ gap: space.xs }}>
            {item.brand ? (
              <Touchable
                accessibilityRole="link"
                accessibilityLabel={item.brand}
                onPress={() => item.brand_id && router.push(`/brands/${item.brand_id}`)}
              >
                <Text variant="overline" tone="accent">
                  {item.brand}
                </Text>
              </Touchable>
            ) : null}
            <Text variant="display">{item.name || t('item.untitled')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Text variant="price" tone="muted">
                {item.price_amount
                  ? formatPrice(item.price_amount, item.price_currency)
                  : t('item.noPrice')}
              </Text>
              <SeasonDots seasons={item.seasons} />
            </View>
            <View style={{ gap: space.xs, marginTop: space.sm }}>
              <UsageButton
                variant="prominent"
                lastUsedDate={item.last_used_date}
                onPress={markUsed}
              />
              {item.last_used_date ? (
                <Touchable
                  accessibilityRole="button"
                  accessibilityLabel={t('item.clearUsed')}
                  onPress={clearUsed}
                  style={{ alignSelf: 'center', paddingVertical: space.xxs }}
                >
                  <Text variant="caption" tone="faint">
                    {t('item.clearUsed')}
                  </Text>
                </Touchable>
              ) : null}
            </View>
          </View>

          <Surface corner="lg" level="raised" style={{ padding: space.md, gap: space.sm }}>
            {item.category_id ? (
              <Row label={t('item.category')} value={tCategoryPath(item.category_id)} />
            ) : null}
            {item.storage ? (
              <Row
                label={t('item.storage')}
                value={item.storage}
                onPress={
                  item.storage_id ? () => router.push(`/storages/${item.storage_id}`) : undefined
                }
              />
            ) : null}
            {item.gender ? <Row label={t('item.gender')} value={t(`gender.${item.gender}`)} /> : null}
            {item.seasons.length > 0 ? (
              <Row
                label={t('item.season')}
                value={item.seasons.map((season) => t(`season.${season}`)).join(' · ')}
              />
            ) : null}
            <Row
              label={t('item.lastUsed')}
              value={
                item.last_used_date ? formatDate(item.last_used_date) : t('item.neverUsed')
              }
            />
            <Row label={t('item.createdAt', { date: '' }).trim()} value={formatDate(item.created_at)} />
          </Surface>

          {item.notes ? (
            <View style={{ gap: space.xs }}>
              <Text variant="overline" tone="faint">
                {t('item.notes')}
              </Text>
              <Text variant="body" tone="muted">
                {item.notes}
              </Text>
            </View>
          ) : null}

          <Pairings
            pairings={item.pairings}
            onSelect={(partner) => router.push(`/item/${partner.id}`)}
          />

          <View style={{ flexDirection: 'row', gap: space.sm, paddingTop: space.sm }}>
            <Button
              label={t('item.editTitle')}
              onPress={() => router.push(`/item/edit?id=${itemId}`)}
            />
            <View style={{ flex: 1 }} />
            <Button label={t('item.delete')} variant="ghost" onPress={confirmDelete} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function TopBar({ onBack, onEdit }: { onBack: () => void; onEdit?: () => void }) {
  const { t } = useI18n();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
      }}
    >
      <IconButton name="chevron-left" label={t('nav.back')} surface="card" onPress={onBack} />
      {onEdit ? (
        <IconButton name="edit-2" label={t('item.editTitle')} surface="card" onPress={onEdit} />
      ) : null}
    </View>
  );
}

function Row({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <Text variant="caption" tone="faint" style={{ width: u(18) }}>
        {label}
      </Text>
      <Text variant="body" style={{ flex: 1 }} numberOfLines={2}>
        {value}
      </Text>
      {onPress ? <Icon name="chevron-right" size={14} color={color.inkFaint} /> : null}
    </View>
  );

  return onPress ? (
    <Touchable accessibilityRole="link" accessibilityLabel={`${label}: ${value}`} onPress={onPress}>
      {content}
    </Touchable>
  ) : (
    content
  );
}

function Pairings({
  pairings,
  onSelect,
}: {
  pairings: ItemSummary[];
  onSelect: (item: ItemSummary) => void;
}) {
  const { t } = useI18n();

  return (
    <View style={{ gap: space.sm }}>
      <View style={{ gap: space.xxs }}>
        <Text variant="overline" tone="faint">
          {t('item.pairings')}
        </Text>
        <Text variant="caption" tone="faint">
          {t('item.pairingsHint')}
        </Text>
      </View>
      {pairings.length === 0 ? (
        <Text variant="caption" tone="muted">
          {t('item.noPairings')}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space.sm }}
        >
          {pairings.map((partner) => (
            <Touchable
              key={partner.id}
              accessibilityRole="button"
              accessibilityLabel={partner.name}
              onPress={() => onSelect(partner)}
              style={{ width: PAIRING_CARD_WIDTH, gap: space.xs }}
            >
              <ItemPhoto image={partner.cover_image} corner="md" placeholderIconSize={16} />
              <Text variant="caption" numberOfLines={1}>
                {partner.name}
              </Text>
            </Touchable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
