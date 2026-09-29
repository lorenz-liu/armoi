/**
 * The rail that protrudes from the right edge, vertically centred.
 *
 * Geometry: the rail is `RAIL.widthUnits` wide and holds two tabs of
 * `RAIL.tabHeightUnits` each, so its height is 2·tab + 2·padding. Only the
 * left `1 − restingPeek` of its width sits on screen; the remainder is pushed
 * past the edge, which is what produces the "protruding" silhouette. Its left
 * corners are rounded at `xl`, the right ones are square because they are off
 * screen.
 */

import { View } from 'react-native';

import { useI18n } from '@/i18n';
import { color, elevation, layout, radius, space } from '@/theme';

import { Icon, Text, Touchable } from '../ui';

export type RailTab = 'storage' | 'brand';

const TAB_ICONS = { storage: 'archive', brand: 'tag' } as const;

export function EdgeRail({ onSelect }: { onSelect: (tab: RailTab) => void }) {
  const { t } = useI18n();
  const tabs: RailTab[] = ['storage', 'brand'];

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right: 0,
        top: '50%',
        // Centre on the viewport by lifting the rail half its own height.
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
        {tabs.map((tab, index) => (
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
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: color.line,
            }}
          >
            <Icon name={TAB_ICONS[tab]} size={16} color={color.ink} />
            <Text
              variant="overline"
              tone="muted"
              // Vertical label: the rail is narrower than the word.
              style={{ transform: [{ rotate: '90deg' }], width: layout.rail.tabHeight / 2 }}
              numberOfLines={1}
            >
              {t(`nav.${tab}`)}
            </Text>
          </Touchable>
        ))}
      </View>
    </View>
  );
}
