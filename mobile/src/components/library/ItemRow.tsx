/** The list-view row: square thumbnail, then the full caption in one line stack. */

import { View } from 'react-native';

import type { ItemSummary } from '@/api';
import { useItemCaption } from '@/hooks/useItemCaption';
import { useI18n } from '@/i18n';
import { layout, radius, space } from '@/theme';

import { Surface, Text, Touchable } from '../ui';

import { ItemPhoto } from './ItemImage';
import { SeasonDots } from './SeasonDots';
import { UsageButton } from './UsageButton';

const PADDING = space.xs;

export type ItemRowProps = {
  item: ItemSummary;
  onPress: () => void;
  onMarkUsed: () => void;
};

export function ItemRow({ item, onPress, onMarkUsed }: ItemRowProps) {
  const { t } = useI18n();
  const caption = useItemCaption(item);

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
          {caption.brand ? (
            <Text variant="overline" tone="faint" numberOfLines={1}>
              {caption.brand}
            </Text>
          ) : null}
          <Text variant="bodyStrong" numberOfLines={1}>
            {item.name || t('item.untitled')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
            {caption.showSeasons ? <SeasonDots seasons={item.seasons} /> : null}
            {caption.meta ? (
              <Text variant="caption" tone="muted" numberOfLines={1} style={{ flexShrink: 1 }}>
                {caption.meta}
              </Text>
            ) : null}
          </View>
        </View>
        {/* A row has no space *under* the thumbnail, so it sits trailing. */}
        <UsageButton lastUsedDate={item.last_used_date} onPress={onMarkUsed} />
      </Surface>
    </Touchable>
  );
}
