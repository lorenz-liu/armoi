/**
 * The tab rail that protrudes from the right edge, vertically centred.
 *
 * Geometry: the rail is `RAIL.widthUnits` wide and holds two tabs of
 * `RAIL.tabHeightUnits` each, so its height is 2·tab + 2·padding, and it is
 * centred by translating up half that. Its right corners are square because
 * they sit against the screen edge; only the left pair is rounded, which is
 * what gives it the protruding, tabbed silhouette.
 *
 * Nothing here is rotated: a sideways label would set the Chinese glyphs on
 * their side, so the rail is instead made wide enough for an upright caption
 * beneath the icon.
 */

import { View } from 'react-native';

import { useI18n } from '@/i18n';
import { color, elevation, layout, radius, space } from '@/theme';

import { Icon, Text, Touchable } from '../ui';

export type RailTab = 'storage' | 'brand';

const TABS: RailTab[] = ['storage', 'brand'];
const TAB_ICONS = { storage: 'archive', brand: 'tag' } as const;

export function EdgeRail({ onSelect }: { onSelect: (tab: RailTab) => void }) {
  const { t } = useI18n();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: [{ translateY: -layout.rail.height / 2 }],
      }}
    >
      <View
        style={[
          {
            width: layout.rail.width,
            paddingVertical: layout.rail.padding,
            backgroundColor: color.card,
            borderTopLeftRadius: radius.xl,
            borderBottomLeftRadius: radius.xl,
            borderWidth: 1,
            borderRightWidth: 0,
            borderColor: color.line,
            overflow: 'hidden',
          },
          elevation.floating,
        ]}
      >
        {TABS.map((tab, index) => (
          <Touchable
            key={tab}
            accessibilityRole="button"
            accessibilityLabel={t(`nav.${tab}`)}
            onPress={() => onSelect(tab)}
            style={{
              height: layout.rail.tabHeight,
              alignItems: 'center',
              justifyContent: 'center',
              gap: space.xs,
              paddingHorizontal: space.xxs,
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: color.line,
            }}
          >
            <Icon name={TAB_ICONS[tab]} size={18} color={color.ink} />
            <Text variant="micro" tone="muted" numberOfLines={1}>
              {t(`nav.${tab}`)}
            </Text>
          </Touchable>
        ))}
      </View>
    </View>
  );
}
