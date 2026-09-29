/** The list-view row: square thumbnail, then the full caption in one line stack. */

import { View } from 'react-native';

import type { ItemSummary } from '@/api';
import { useI18n } from '@/i18n';
import { layout, radius, space } from '@/theme';

import { Surface, Text, Touchable } from '../ui';

import { ItemPhoto } from './ItemImage';
import { SeasonDots } from './SeasonDots';

const PADDING = space.xs;

export function ItemRow({ item, onPress }: { item: ItemSummary; onPress: () => void }) {
  const { t, formatPrice, tCategory } = useI18n();

  return (
    <Touchable accessibilityRole="button" accessibilityLabel={item.name} onPress={onPress}>
      <Surface
        level="raised"
        corner="md"
        style={{ flexDirection: 'row', alignItems: 'center', padding: PADDING, gap: space.sm }}
      >
        <ItemPhoto
          image={item.cover_image}
          aspectRatio={1}
          width={layout.listThumb}
          height={layout.listThumb}
          corner={radius.nest(radius.md, PADDING)}
          placeholderIconSize={18}
        />
        <View style={{ flex: 1, gap: space.xxs, paddingRight: space.xs }}>
          {item.brand ? (
            <Text variant="overline" tone="faint" numberOfLines={1}>
              {item.brand}
            </Text>
          ) : null}
          <Text variant="bodyStrong" numberOfLines={1}>
            {item.name || t('item.untitled')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
            <SeasonDots seasons={item.seasons} />
            {item.category_id ? (
              <Text variant="caption" tone="muted" numberOfLines={1} style={{ flexShrink: 1 }}>
                {tCategory(item.category_id)}
              </Text>
            ) : null}
          </View>
        </View>
        {item.price_amount ? (
          <Text variant="price" tone="muted">
            {formatPrice(item.price_amount, item.price_currency)}
          </Text>
        ) : null}
      </Surface>
    </Touchable>
  );
}
