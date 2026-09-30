/**
 * The tab rail that protrudes from the right edge.
 *
 * Geometry: the rail is `RAIL.widthUnits` wide and holds two tabs of
 * `RAIL.tabHeightUnits` each, so its height is 2·tab + 2·padding. Its right
 * corners are square because they sit against the screen edge; only the left
 * pair is rounded, which is what gives it the protruding, tabbed silhouette.
 *
 * Position: the rail slides along the right edge. Its place is stored as the
 * distance from the bottom of the screen to its centre — measuring from the
 * bottom keeps it anchored near the thumb when the viewport changes height
 * (a keyboard, a taller device). It starts at `RAIL.defaultBottomInset` and
 * the position the user drags it to is remembered.
 *
 * Nothing here is rotated: a sideways label would set the Chinese glyphs on
 * their side, so the rail is instead made wide enough for an upright caption
 * beneath the icon.
 */

import { useEffect, useMemo, useState } from 'react';
import { Animated, PanResponder, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RAIL } from '@/config';
import { usePreferences } from '@/hooks/usePreferences';
import { useI18n } from '@/i18n';
import { color, elevation, layout, radius, space, u } from '@/theme';

import { Icon, Text, Touchable } from '../ui';

export type RailTab = 'storage' | 'brand';

export const EDGE_RAIL_TEST_ID = 'edge-rail';

const TABS: RailTab[] = ['storage', 'brand'];
const TAB_ICONS = { storage: 'archive', brand: 'tag' } as const;

export type RailBounds = {
  /** Requested distance from the bottom of the screen to the rail's centre. */
  offset: number;
  viewportHeight: number;
  topInset: number;
  bottomInset: number;
};

/**
 * Keeps the whole rail on screen, clear of the safe-area edges.
 *
 * Pure and exported so the geometry can be tested without a gesture: the
 * component only ever renders `clampRailCentre(...)`.
 */
export function clampRailCentre({
  offset,
  viewportHeight,
  topInset,
  bottomInset,
}: RailBounds): number {
  const half = layout.rail.height / 2;
  const margin = u(RAIL.edgeMarginUnits);
  const lowest = bottomInset + margin + half;
  const highest = viewportHeight - topInset - margin - half;
  // On a viewport too short to hold the rail the bounds cross; centre it.
  if (highest < lowest) return viewportHeight / 2;
  return Math.min(Math.max(offset, lowest), highest);
}

export function EdgeRail({ onSelect }: { onSelect: (tab: RailTab) => void }) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { height: viewportHeight } = useWindowDimensions();
  const { railOffset, setRailOffset } = usePreferences();

  const half = layout.rail.height / 2;

  const clamp = useMemo(() => {
    const bounds = {
      viewportHeight,
      topInset: insets.top,
      bottomInset: insets.bottom,
    };
    return (offset: number) => clampRailCentre({ offset, ...bounds });
  }, [insets.bottom, insets.top, viewportHeight]);

  // The resting position is derived, never stored twice: it is whatever the
  // preference says, clamped to the current viewport. A drag moves only the
  // Animated.Value; committing it updates the preference, which flows back
  // here on the next render.
  const settledCentre = clamp(railOffset);
  const [centre] = useState(() => new Animated.Value(settledCentre));

  useEffect(() => {
    centre.setValue(settledCentre);
  }, [settledCentre, centre]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only claim the gesture once it is clearly a drag, so the tabs stay tappable.
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dy) > RAIL.dragActivationDistance,
        // Dragging down (positive dy) reduces the distance from the bottom.
        onPanResponderMove: (_event, gesture) =>
          centre.setValue(clamp(settledCentre - gesture.dy)),
        onPanResponderRelease: (_event, gesture) =>
          setRailOffset(clamp(settledCentre - gesture.dy)),
        onPanResponderTerminate: () => centre.setValue(settledCentre),
      }),
    [settledCentre, clamp, centre, setRailOffset],
  );

  return (
    <Animated.View
      testID={EDGE_RAIL_TEST_ID}
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        // bottom:0 puts the rail's *bottom edge* on the screen edge, so lifting
        // it by (centre − half) places its centre `centre` above the bottom.
        transform: [{ translateY: Animated.subtract(half, centre) }],
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
        <Grip />
        {TABS.map((tab, index) => (
          <Touchable
            key={tab}
            accessibilityRole="button"
            accessibilityLabel={t(`nav.${tab}`)}
            accessibilityHint={t('nav.railHint')}
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
    </Animated.View>
  );
}

/**
 * The only affordance saying the rail can be moved. Its block is a fixed part
 * of `layout.rail.height`, so adding it does not shift the rail's centre.
 */
function Grip() {
  return (
    <View
      style={{
        height: layout.rail.gripBlock,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: layout.rail.gripWidth,
          height: RAIL.gripLineHeight,
          borderRadius: radius.pill,
          backgroundColor: color.lineStrong,
        }}
      />
    </View>
  );
}
