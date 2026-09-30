/**
 * Create or edit a piece. One screen serves both: `?id=` decides.
 *
 * Images are handled in two phases because the API attaches them to an
 * existing row — the record is saved first, then any newly picked files are
 * uploaded against its id.
 */

import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ApiError,
  api,
  type Currency,
  type Gender,
  type Item,
  type ItemDraft,
  type ItemImage,
  type LocalImage,
  type Season,
} from '@/api';
import {
  AutocompleteField,
  Button,
  CategoryPicker,
  Chip,
  IconButton,
  LoadingState,
  PairingPicker,
  PhotoStrip,
  Screen,
  Select,
  Text,
  TextField,
  Touchable,
  type SelectOption,
} from '@/components';
import { CURRENCIES, CURRENCY_SYMBOLS, DEFAULT_CURRENCY, GENDERS, LIMITS, SEASONS } from '@/config';
import { useI18n } from '@/i18n';
import { color, layout, radius, space } from '@/theme';

/** Code as the label, symbol as the trailing hint — stable in both languages. */
const CURRENCY_OPTIONS: SelectOption<Currency>[] = CURRENCIES.map((code) => ({
  value: code,
  label: code,
  caption: CURRENCY_SYMBOLS[code],
}));

const EMPTY_DRAFT: ItemDraft = {
  name: '',
  brand: null,
  storage: null,
  category_id: null,
  gender: null,
  seasons: [],
  price_amount: null,
  price_currency: null,
  notes: null,
  pairing_ids: [],
};

function toDraft(item: Item): ItemDraft {
  return {
    name: item.name,
    brand: item.brand,
    storage: item.storage,
    category_id: item.category_id,
    gender: item.gender,
    seasons: item.seasons,
    price_amount: item.price_amount,
    price_currency: item.price_currency,
    notes: item.notes,
    pairing_ids: item.pairings.map((partner) => partner.id),
  };
}

export default function ItemFormRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const itemId = id ? Number(id) : null;
  const router = useRouter();
  const { t, tCategoryPath } = useI18n();
  const insets = useSafeAreaInsets();

  const [draft, setDraft] = useState<ItemDraft>(EMPTY_DRAFT);
  const [images, setImages] = useState<ItemImage[]>([]);
  const [pending, setPending] = useState<LocalImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(itemId !== null);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string>();
  const [sheet, setSheet] = useState<'none' | 'category' | 'pairings'>('none');

  useEffect(() => {
    if (itemId === null) return;
    let cancelled = false;
    api.items
      .read(itemId)
      .then((item) => {
        if (cancelled) return;
        setDraft(toDraft(item));
        setImages(item.images);
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  const patch = useCallback(
    (changes: Partial<ItemDraft>) => setDraft((current) => ({ ...current, ...changes })),
    [],
  );

  const pickPhotos = async () => {
    const remaining = LIMITS.maxImagesPerItem - images.length - pending.length;
    if (remaining <= 0) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: LIMITS.imageQuality,
    });
    if (result.canceled) return;

    setPending((current) => [
      ...current,
      ...result.assets.map((asset, index) => ({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? `photo-${Date.now()}-${index}.jpg`,
      })),
    ]);
  };

  const save = async () => {
    if (!draft.name.trim()) {
      setNameError(t('errors.nameRequired'));
      return;
    }
    setNameError(undefined);
    setSaving(true);
    try {
      const payload: ItemDraft = {
        ...draft,
        name: draft.name.trim(),
        // A currency with no amount is meaningless; the backend drops it anyway.
        price_currency: draft.price_amount ? (draft.price_currency ?? DEFAULT_CURRENCY) : null,
      };
      const saved = itemId === null
        ? await api.items.create(payload)
        : await api.items.update(itemId, payload);

      for (const imageId of removedImageIds) {
        await api.items.removeImage(saved.id, imageId);
      }
      const keptIds = images.map((image) => image.id);
      if (keptIds.length > 0 && itemId !== null) {
        await api.items.reorderImages(saved.id, keptIds);
      }
      if (pending.length > 0) {
        await api.items.uploadImages(saved.id, pending);
      }

      router.back();
      if (itemId === null) router.push(`/item/${saved.id}`);
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof ApiError ? error.detail : t('errors.generic'),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

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
        <IconButton name="x" label={t('common.cancel')} onPress={() => router.back()} />
        <Text variant="subtitle">{t(itemId === null ? 'item.newTitle' : 'item.editTitle')}</Text>
        <View style={{ width: layout.touchTarget }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            padding: layout.gutter,
            paddingBottom: insets.bottom + space.xxl,
            gap: space.lg,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PhotoStrip
            images={images}
            pending={pending}
            onAdd={pickPhotos}
            onRemoveExisting={(image) => {
              setImages((current) => current.filter((entry) => entry.id !== image.id));
              setRemovedImageIds((current) => [...current, image.id]);
            }}
            onRemovePending={(index) =>
              setPending((current) => current.filter((_, i) => i !== index))
            }
            onMakeCover={(image) =>
              setImages((current) => [image, ...current.filter((entry) => entry.id !== image.id)])
            }
          />

          <TextField
            label={t('item.name')}
            value={draft.name}
            onChangeText={(name) => patch({ name })}
            placeholder={t('item.namePlaceholder')}
            maxLength={LIMITS.maxNameLength}
            error={nameError}
          />

          <AutocompleteField
            label={t('item.brand')}
            value={draft.brand ?? ''}
            onChangeText={(brand) => patch({ brand: brand || null })}
            placeholder={t('item.brandPlaceholder')}
            fetchSuggestions={api.brands.suggest}
          />

          <AutocompleteField
            label={t('item.storage')}
            value={draft.storage ?? ''}
            onChangeText={(storage) => patch({ storage: storage || null })}
            placeholder={t('item.storagePlaceholder')}
            fetchSuggestions={api.storages.suggest}
          />

          <Field label={t('item.category')}>
            <Touchable
              accessibilityRole="button"
              accessibilityLabel={t('item.category')}
              onPress={() => setSheet('category')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: space.sm,
                paddingVertical: space.sm,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: color.line,
                backgroundColor: color.card,
              }}
            >
              <Text variant="body" tone={draft.category_id ? 'ink' : 'faint'} numberOfLines={1}>
                {draft.category_id
                  ? tCategoryPath(draft.category_id)
                  : t('item.categoryPlaceholder')}
              </Text>
              <IconButton
                name="chevron-right"
                label={t('common.select')}
                size={14}
                tone="muted"
                onPress={() => setSheet('category')}
                style={{ width: space.lg, height: space.lg }}
              />
            </Touchable>
          </Field>

          <Field label={t('item.season')}>
            <Wrap>
              {SEASONS.map((season: Season) => (
                <Chip
                  key={season}
                  label={t(`season.${season}`)}
                  dotColor={color.season[season]}
                  selected={draft.seasons.includes(season)}
                  onPress={() =>
                    patch({
                      seasons: draft.seasons.includes(season)
                        ? draft.seasons.filter((entry) => entry !== season)
                        : [...draft.seasons, season],
                    })
                  }
                />
              ))}
            </Wrap>
          </Field>

          <Field label={t('item.gender')}>
            <Wrap>
              {GENDERS.map((gender: Gender) => (
                <Chip
                  key={gender}
                  label={t(`gender.${gender}`)}
                  selected={draft.gender === gender}
                  onPress={() => patch({ gender: draft.gender === gender ? null : gender })}
                />
              ))}
            </Wrap>
          </Field>

          <Field label={`${t('item.price')} · ${t('common.optional')}`}>
            <TextField
              value={draft.price_amount ?? ''}
              onChangeText={(raw) => {
                const cleaned = raw.replace(/[^\d.]/g, '');
                patch({
                  price_amount: cleaned || null,
                  price_currency: cleaned ? (draft.price_currency ?? DEFAULT_CURRENCY) : null,
                });
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
              accessibilityLabel={t('item.priceAmount')}
              // The unit belongs to the amount, so it lives inside the field.
              trailing={
                <Select
                  compact
                  title={t('item.currency')}
                  accessibilityLabel={t('item.currency')}
                  value={draft.price_currency ?? DEFAULT_CURRENCY}
                  options={CURRENCY_OPTIONS}
                  placeholder={DEFAULT_CURRENCY}
                  onChange={(price_currency) => patch({ price_currency })}
                  closeLabel={t('common.close')}
                />
              }
            />
          </Field>

          <TextField
            label={t('item.notes')}
            value={draft.notes ?? ''}
            onChangeText={(notes) => patch({ notes: notes || null })}
            placeholder={t('item.notesPlaceholder')}
            maxLength={LIMITS.maxNotesLength}
            multiline
          />

          <Field label={t('item.pairings')} hint={t('item.pairingsHint')}>
            <Wrap>
              <Chip
                label={`+ ${t('item.addPairing')}`}
                count={draft.pairing_ids.length || undefined}
                onPress={() => setSheet('pairings')}
              />
            </Wrap>
          </Field>

          <Button
            label={saving ? t('item.saving') : t('item.save')}
            loading={saving}
            onPress={save}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <CategoryPicker
        visible={sheet === 'category'}
        value={draft.category_id}
        onClose={() => setSheet('none')}
        onSelect={(category_id) => patch({ category_id })}
      />
      <PairingPicker
        visible={sheet === 'pairings'}
        selfId={itemId}
        selected={draft.pairing_ids}
        onClose={() => setSheet('none')}
        onChange={(pairing_ids) => patch({ pairing_ids })}
      />
    </Screen>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: space.xs }}>
      <Text variant="overline" tone="faint">
        {label}
      </Text>
      {children}
      {hint ? (
        <Text variant="caption" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>{children}</View>;
}
