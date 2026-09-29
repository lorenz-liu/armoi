/**
 * The photo editor strip: existing photos, pending local picks, and one add
 * tile — capped at the same limit the backend enforces.
 */

import { Image } from 'expo-image';
import { View } from 'react-native';

import { mediaUrl, type ItemImage as ItemImageModel, type LocalImage } from '@/api';
import { LIMITS } from '@/config';
import { useI18n } from '@/i18n';
import { color, radius, space, u } from '@/theme';

import { Icon, IconButton, Text, Touchable } from '../ui';

const TILE = u(20); // 80pt — three fit a phone row with the standard gutter

export type PhotoStripProps = {
  images: ItemImageModel[];
  pending: LocalImage[];
  onAdd: () => void;
  onRemoveExisting: (image: ItemImageModel) => void;
  onRemovePending: (index: number) => void;
  onMakeCover: (image: ItemImageModel) => void;
};

export function PhotoStrip({
  images,
  pending,
  onAdd,
  onRemoveExisting,
  onRemovePending,
  onMakeCover,
}: PhotoStripProps) {
  const { t } = useI18n();
  const total = images.length + pending.length;
  const canAdd = total < LIMITS.maxImagesPerItem;

  return (
    <View style={{ gap: space.xs }}>
      <Text variant="overline" tone="faint">
        {t('item.photos')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        {images.map((image, index) => (
          <Tile
            key={image.id}
            uri={mediaUrl(image.url)}
            isCover={index === 0}
            coverLabel={t('item.makeCover')}
            removeLabel={t('common.remove')}
            onMakeCover={index === 0 ? undefined : () => onMakeCover(image)}
            onRemove={() => onRemoveExisting(image)}
          />
        ))}
        {pending.map((local, index) => (
          <Tile
            key={`${local.uri}-${index}`}
            uri={local.uri}
            isCover={images.length === 0 && index === 0}
            coverLabel={t('item.makeCover')}
            removeLabel={t('common.remove')}
            onRemove={() => onRemovePending(index)}
          />
        ))}
        {canAdd ? (
          <Touchable
            accessibilityRole="button"
            accessibilityLabel={t('item.addPhoto')}
            onPress={onAdd}
            style={{
              width: TILE,
              height: TILE,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: color.lineStrong,
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: color.cardMuted,
            }}
          >
            <Icon name="plus" size={18} color={color.inkMuted} />
          </Touchable>
        ) : null}
      </View>
      <Text variant="caption" tone="faint">
        {t('item.photosHint', { max: LIMITS.maxImagesPerItem })}
      </Text>
    </View>
  );
}

function Tile({
  uri,
  isCover,
  coverLabel,
  removeLabel,
  onRemove,
  onMakeCover,
}: {
  uri: string;
  isCover: boolean;
  coverLabel: string;
  removeLabel: string;
  onRemove: () => void;
  onMakeCover?: () => void;
}) {
  return (
    <View style={{ width: TILE, height: TILE }}>
      <Touchable
        accessibilityRole="button"
        accessibilityLabel={coverLabel}
        onPress={onMakeCover}
        disabled={!onMakeCover}
        style={{
          width: TILE,
          height: TILE,
          borderRadius: radius.sm,
          overflow: 'hidden',
          backgroundColor: color.cardMuted,
          borderWidth: isCover ? 2 : 1,
          borderColor: isCover ? color.ink : color.line,
        }}
      >
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      </Touchable>
      <IconButton
        name="x"
        label={removeLabel}
        size={12}
        surface="card"
        tone="muted"
        onPress={onRemove}
        style={{
          position: 'absolute',
          top: -space.xs,
          right: -space.xs,
          width: space.lg,
          height: space.lg,
        }}
      />
    </View>
  );
}
