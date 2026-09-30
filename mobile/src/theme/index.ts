/**
 * Derived design tokens.
 *
 * Nothing here invents a number: every value is computed from the primitives
 * in `src/config.ts`, so the whole interface rescales from `BASE_UNIT` and
 * the two palette anchors.
 */

import { Platform, type TextStyle, type ViewStyle } from 'react-native';

import {
  BASE_UNIT,
  ELEVATION_LEVELS,
  FONT_WEIGHT,
  GRID,
  IMAGE_ASPECT_RATIO,
  LETTER_SPACING,
  LINE_HEIGHT,
  LIST_ROW_THUMB_UNITS,
  PALETTE,
  RADIUS_STEPS,
  RAIL,
  SEASON_COLORS,
  SPACE_STEPS,
  TYPE_SCALE_BASE,
  TYPE_SCALE_RATIO,
  TYPE_STEPS,
  VIEW_MODE_COLUMNS,
  type VIEW_MODES,
} from '@/config';

export type ViewMode = (typeof VIEW_MODES)[number];

/** u(n) = n · BASE_UNIT — the only way a length is produced. */
export const u = (multiplier: number): number => multiplier * BASE_UNIT;

type SpaceKey = keyof typeof SPACE_STEPS;
type RadiusKey = keyof typeof RADIUS_STEPS;
type TypeKey = keyof typeof TYPE_STEPS;

const mapUnits = <K extends string>(steps: Record<K, number>): Record<K, number> =>
  Object.fromEntries(
    (Object.entries(steps) as [K, number][]).map(([key, step]) => [key, u(step)]),
  ) as Record<K, number>;

export const space = mapUnits<SpaceKey>(SPACE_STEPS);
const radiusValues = mapUnits<RadiusKey>(RADIUS_STEPS);

/** Token names only — `nest` is a helper, not a value. */
export type RadiusToken = RadiusKey;

export const radius = {
  ...radiusValues,
  /**
   * Nesting rule: a child inset by `inset` inside a container of radius
   * `outer` takes `outer − inset`, so concentric corners stay parallel.
   * Clamped at the `xs` step because sub-4pt corners read as square.
   */
  nest: (outer: number, inset: number): number => Math.max(radiusValues.xs, outer - inset),
} as const;

/** fontSize(step) = round(14 · 1.2^step). */
export const fontSize = Object.fromEntries(
  (Object.entries(TYPE_STEPS) as [TypeKey, number][]).map(([key, step]) => [
    key,
    Math.round(TYPE_SCALE_BASE * TYPE_SCALE_RATIO ** step),
  ]),
) as Record<TypeKey, number>;

const text = (
  key: TypeKey,
  weight: keyof typeof FONT_WEIGHT,
  leading: keyof typeof LINE_HEIGHT,
  tracking: keyof typeof LETTER_SPACING,
): TextStyle => ({
  fontSize: fontSize[key],
  fontWeight: FONT_WEIGHT[weight] as TextStyle['fontWeight'],
  lineHeight: Math.round(fontSize[key] * LINE_HEIGHT[leading]),
  letterSpacing: LETTER_SPACING[tracking],
});

export const typography = {
  /** All-caps eyebrow. Wide tracking is what makes it read as editorial. */
  overline: { ...text('micro', 'semibold', 'tight', 'widest'), textTransform: 'uppercase' as const },
  /** Bare counters and badges — the smallest step, without the caps treatment. */
  micro: text('micro', 'medium', 'tight', 'normal'),
  caption: text('caption', 'regular', 'snug', 'normal'),
  captionStrong: text('caption', 'semibold', 'snug', 'wide'),
  body: text('body', 'regular', 'normal', 'normal'),
  bodyStrong: text('body', 'semibold', 'snug', 'normal'),
  subtitle: text('subtitle', 'medium', 'snug', 'tight'),
  title: text('title', 'semibold', 'snug', 'tight'),
  display: text('display', 'semibold', 'tight', 'tight'),
  hero: text('hero', 'regular', 'tight', 'tight'),
  /** Prices use tabular figures so columns of numbers stay aligned. */
  price: {
    ...text('body', 'medium', 'snug', 'normal'),
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
} satisfies Record<string, TextStyle>;

export const color = {
  ...PALETTE,
  season: SEASON_COLORS,
} as const;

/** Translates an elevation level into the platform's shadow primitives. */
const shadow = (level: keyof typeof ELEVATION_LEVELS): ViewStyle => {
  const { y, blur, opacity } = ELEVATION_LEVELS[level];
  if (opacity === 0) return {};
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: PALETTE.ink,
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      // iOS blur is expressed as a radius, i.e. half the CSS blur length.
      shadowRadius: blur / 2,
    },
    default: { elevation: Math.round(y * 1.5) },
  }) as ViewStyle;
};

export const elevation = {
  flat: shadow('flat'),
  raised: shadow('raised'),
  floating: shadow('floating'),
  overlay: shadow('overlay'),
} as const;

export const layout = {
  gutter: u(GRID.gutter),
  gap: u(GRID.gap),
  listGap: u(GRID.listGap),
  imageAspectRatio: IMAGE_ASPECT_RATIO,
  listThumb: u(LIST_ROW_THUMB_UNITS),
  rail: {
    width: u(RAIL.widthUnits),
    tabHeight: u(RAIL.tabHeightUnits),
    padding: u(RAIL.paddingUnits),
    gripBlock: u(RAIL.gripBlockUnits),
    gripWidth: u(RAIL.gripWidthUnits),
    // Everything the rail actually renders — the grip included, or the
    // centring maths would place it a few points off.
    height: u(RAIL.tabHeightUnits) * 2 + u(RAIL.paddingUnits) * 2 + u(RAIL.gripBlockUnits),
  },
  /** Minimum touch target, per both platforms' accessibility guidance. */
  touchTarget: u(11),
} as const;

/**
 * Solves  n·w + (n−1)·gap + 2·gutter = width  for the cell width `w`.
 * Floors so a rounding remainder never forces a wrap.
 */
export function gridCellWidth(viewportWidth: number, columns: number): number {
  const usable = viewportWidth - layout.gutter * 2 - layout.gap * (columns - 1);
  return Math.floor(usable / columns);
}

export function columnsFor(mode: ViewMode): number {
  return VIEW_MODE_COLUMNS[mode];
}

export const theme = {
  u,
  space,
  radius,
  fontSize,
  typography,
  color,
  elevation,
  layout,
  gridCellWidth,
  columnsFor,
} as const;

export type Theme = typeof theme;
