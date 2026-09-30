/**
 * A grid cell: photograph first, then a restrained caption block.
 *
 * The caption follows the lookbook convention — brand as the eyebrow, the
 * piece name as the line of record, price last — so the eye travels image →
 * maker → object → cost.
 */

import { View } from 'react-native';

import type { ItemSummary, ViewMode } from '@/api';
import { useItemCaption } from '@/hooks/useItemCaption';
import { useI18n } from '@/i18n';
import { color, elevation, radius, space } from '@/theme';

import { Surface, Text, Touchable } from '../ui';

import { ItemPhoto } from './ItemImage';
import { SeasonDots } from './SeasonDots';
import { UsageButton } from './UsageButton';

export type ItemCardProps = {
  item: ItemSummary;
  mode: Exclude<ViewMode, 'list'>;
  /** Fixed cell width in multi-column modes; single-column cards fill the row. */
  width?: number;
  onPress: () => void;
  onMarkUsed: () => void;
  /** Editorial stagger: alternating cards in `big` mode align to opposite edges. */
  flipped?: boolean;
};

export function ItemCard({
  item,
  mode,
  width,
  onPress,
  onMarkUsed,
  flipped = false,
}: ItemCardProps) {
  const { t } = useI18n();
  const caption = useItemCaption(item);
  const padding = mode === 'small' ? space.xs : space.sm;

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={onPress}
      style={{ width: width ?? '100%' }}
    >
      <Surface
        level={mode === 'big' ? 'floating' : 'raised'}
        corner="lg"
        style={{ padding, gap: padding }}
      >
        <ItemPhoto
          image={item.cover_image}
          // The photo nests inside the card: its radius is the card's less the padding.
          corner={radius.nest(radius.lg, padding)}
          placeholderIconSize={mode === 'small' ? 16 : 22}
        />
        <UsageButton lastUsedDate={item.last_used_date} onPress={onMarkUsed} />
        <View
          style={{
            gap: space.xxs,
            paddingHorizontal: space.xxs,
            alignItems: flipped ? 'flex-end' : 'flex-start',
          }}
        >
          {caption.brand ? (
            <Text variant="overline" tone="faint" numberOfLines={1}>
              {caption.brand}
            </Text>
          ) : null}
          <Text
            variant={mode === 'big' ? 'subtitle' : 'bodyStrong'}
            numberOfLines={mode === 'small' ? 2 : 1}
            style={{ textAlign: flipped ? 'right' : 'left' }}
          >
            {item.name || t('item.untitled')}
          </Text>
          {caption.meta ? (
            <Text
              variant="caption"
              tone="muted"
              numberOfLines={mode === 'small' ? 1 : 2}
              style={{ textAlign: flipped ? 'right' : 'left' }}
            >
              {caption.meta}
            </Text>
          ) : null}
          {caption.showSeasons ? (
            <View style={{ marginTop: space.xxs }}>
              <SeasonDots seasons={item.seasons} />
            </View>
          ) : null}
        </View>
        {item.image_count > 1 ? <PhotoCount count={item.image_count} inset={padding * 2} /> : null}
      </Surface>
    </Touchable>
  );
}

/** A floating counter in the photo's corner, kept small so it never crops the image. */
function PhotoCount({ count, inset }: { count: number; inset: number }) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          top: inset,
          right: inset,
          minWidth: space.lg,
          paddingHorizontal: space.xs,
          paddingVertical: space.xxs / 2,
          borderRadius: radius.pill,
          backgroundColor: color.card,
          alignItems: 'center',
          justifyContent: 'center',
        },
        elevation.raised,
      ]}
    >
      <Text variant="micro" tone="muted">
        {count}
      </Text>
    </View>
  );
}
