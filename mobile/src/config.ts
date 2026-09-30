/**
 * Armoi — the single source of truth for every configuration constant.
 *
 * No other module may declare a tunable literal: themes, layouts and screens
 * derive everything from the values below. Geometry is expressed as a formula
 * over `BASE_UNIT` so the whole interface rescales from one number.
 *
 * ── Geometric system ───────────────────────────────────────────────────────
 * BASE_UNIT (4pt) is the atom. Every spacing, radius and size is an integer
 * multiple of it, which keeps every edge on a common 4pt grid.
 *
 * Type sizes follow a modular scale of ratio 1.2 (a major second) anchored at
 * 14pt, rounded to the nearest whole point.
 *
 * Radii follow the *nesting rule*: an element inset by `p` inside a container
 * of radius `R` takes radius `R − p`, so concentric corners stay parallel.
 *
 * Grid cell widths solve  n·w + (n−1)·g + 2·G = W  for w, where n is the
 * column count, g the inter-column gap, G the page gutter and W the viewport.
 */

import Constants from 'expo-constants';

// ── Backend ────────────────────────────────────────────────────────────────
/** Port the FastAPI backend listens on. */
export const API_PORT = Number(process.env.EXPO_PUBLIC_API_PORT ?? 8000);

/**
 * Where the backend lives.
 *
 * On a physical device `localhost` is the phone itself, so the default is
 * taken from whichever host is serving the bundle: Metro already knows the
 * machine's LAN address, and the backend binds the same interface. That makes
 * testing on a real phone work with no configuration at all.
 *
 * Set `EXPO_PUBLIC_API_BASE_URL` to override — a deployed server, or a tunnel.
 */
function resolveBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const hostUri =
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    '';
  const host = hostUri.split(':')[0];
  return `http://${host || 'localhost'}:${API_PORT}`;
}

export const API = {
  baseUrl: resolveBaseUrl(),
  prefix: '/api/v1',
  timeoutMs: 15_000,
  retries: 2,
  retryBackoffMs: 400,
} as const;

// ── Domain limits (mirror infra/app/config.py) ─────────────────────────────
export const LIMITS = {
  maxImagesPerItem: 10,
  maxNameLength: 120,
  maxBrandLength: 80,
  maxStorageLength: 80,
  maxNotesLength: 2000,
  autocompleteSuggestions: 8,
  pageSize: 40,
  /** Image quality passed to the picker, 0–1. */
  imageQuality: 0.85,
} as const;

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export const GENDERS = ['male', 'female', 'unisex'] as const;
export const CURRENCIES = [
  'CNY', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'HKD', 'TWD',
  'SGD', 'AUD', 'CAD', 'CHF', 'SEK', 'THB',
] as const;
export const DEFAULT_CURRENCY = 'CNY';

/** Shown beside each code in the currency dropdown. */
export const CURRENCY_SYMBOLS: Record<(typeof CURRENCIES)[number], string> = {
  CNY: '¥', USD: '$', EUR: '€', GBP: '£', JPY: '¥', KRW: '₩', HKD: 'HK$',
  TWD: 'NT$', SGD: 'S$', AUD: 'A$', CAD: 'C$', CHF: 'CHF', SEK: 'kr', THB: '฿',
};

export const SORT_FIELDS = ['created_at', 'updated_at', 'name', 'price', 'last_used'] as const;

/**
 * The sort choices the user actually sees, in menu order.
 *
 * A single named preset per line, rather than a field plus a direction the
 * user has to combine themselves: "longest unworn" is one idea, not
 * "last_used, ascending". Each id doubles as its `sort.<id>` translation key.
 */
/**
 * The metadata a library cell can carry beneath its photograph, in the order
 * it is rendered. The name is always shown and is not listed here.
 *
 * `brand` takes the eyebrow line and `seasons` renders as dots; the rest join
 * one muted line, so any subset stays legible at every view density.
 */
export const ITEM_FIELDS = ['brand', 'storage', 'category', 'price', 'lastUsed', 'seasons'] as const;

/** Where you keep a piece is more use day to day than what it cost. */
export const DEFAULT_ITEM_FIELDS = ['brand', 'storage', 'seasons'] as const;

export const SORT_OPTIONS = [
  { id: 'newest', field: 'created_at', order: 'desc' },
  { id: 'longestUnused', field: 'last_used', order: 'asc' },
  { id: 'recentlyUsed', field: 'last_used', order: 'desc' },
  { id: 'nameAsc', field: 'name', order: 'asc' },
  { id: 'nameDesc', field: 'name', order: 'desc' },
  { id: 'priceAsc', field: 'price', order: 'asc' },
  { id: 'priceDesc', field: 'price', order: 'desc' },
] as const;

export const DEFAULT_SORT_OPTION = 'newest';

// ── Geometry ───────────────────────────────────────────────────────────────
/** The atom. Every length in the app is an integer multiple of this. */
export const BASE_UNIT = 4;

/** Spacing scale: multiples of BASE_UNIT, named by multiplier. */
export const SPACE_STEPS = {
  none: 0,
  xxs: 1, //  4 — hairline separation, icon-to-label
  xs: 2, //   8 — inside chips and pills
  sm: 3, //  12 — inside compact controls
  md: 4, //  16 — the page gutter; default card padding
  lg: 6, //  24 — between sections of a card
  xl: 8, //  32 — between major blocks
  xxl: 12, // 48 — screen-level breathing room
  huge: 20, // 80 — hero whitespace
} as const;

/**
 * Radii. The card is 5·BASE_UNIT (20); a control inset by the card's 16pt
 * padding therefore takes 20 − 16 = 4… too tight to read, so controls use
 * their own concentric family and the nesting rule is applied per component
 * via `theme.radius.nest(outer, inset)`.
 */
export const RADIUS_STEPS = {
  none: 0,
  xs: 1, //   4 — swatches, tiny tags
  sm: 2, //   8 — inputs, small thumbnails
  md: 3, //  12 — buttons, chips
  lg: 5, //  20 — cards, image frames
  xl: 7, //  28 — sheets, the edge rail
  pill: 250, // effectively a capsule
} as const;

/** Modular type scale: 14 · 1.2^n, rounded. */
export const TYPE_SCALE_BASE = 14;
export const TYPE_SCALE_RATIO = 1.2;
export const TYPE_STEPS = {
  micro: -2, // 10 — overlines, counters
  caption: -1, // 12 — metadata
  body: 0, //    14 — default
  subtitle: 1, // 17 — card titles
  title: 2, //   20 — section headings
  display: 4, //  29 — screen titles
  hero: 6, //     42 — empty-state statements
} as const;

/** Line height as a multiple of font size, by role. */
export const LINE_HEIGHT = { tight: 1.15, snug: 1.3, normal: 1.5 } as const;

/** Letter spacing in points, by role. Wide tracking carries the editorial feel. */
export const LETTER_SPACING = { tight: -0.4, normal: 0, wide: 0.6, widest: 1.8 } as const;

// ── Library grid ───────────────────────────────────────────────────────────
/** Portrait fashion crop, 4:5 — the lookbook standard. */
export const IMAGE_ASPECT_RATIO = 4 / 5;

/** Page gutter and inter-column gap, in BASE_UNIT multiples. */
export const GRID = {
  gutter: SPACE_STEPS.md, //  16pt at each screen edge
  gap: SPACE_STEPS.sm, //     12pt between columns
  listGap: SPACE_STEPS.xs, //  8pt between list rows
} as const;

/** The four view modes offered by the header's view switcher. */
export const VIEW_MODES = ['big', 'medium', 'small', 'list'] as const;
export const VIEW_MODE_COLUMNS = { big: 1, medium: 2, small: 3, list: 1 } as const;
export const DEFAULT_VIEW_MODE = 'medium';

/** List rows show a square thumbnail this many BASE_UNITs tall. */
export const LIST_ROW_THUMB_UNITS = 16; // 64pt

// ── The right-edge rail ────────────────────────────────────────────────────
/**
 * A tab bar that protrudes from the right edge, vertically centred.
 * Its height is derived from its two tabs so the geometry stays consistent
 * if a third is ever added.
 */
export const RAIL = {
  // Wide enough for an upright label under the icon: rotated text would set
  // CJK glyphs on their side, so nothing in the rail is rotated.
  widthUnits: 14, //        56pt — comfortably past the 44pt touch minimum
  tabHeightUnits: 18, //    72pt per tab
  paddingUnits: SPACE_STEPS.xs,

  /** The drag grip's block: it is part of the rail, so part of its height. */
  gripBlockUnits: SPACE_STEPS.xs, // 8pt
  gripWidthUnits: 4, //              16pt
  gripLineHeight: 2,

  /**
   * Where the rail sits when it has never been moved: the distance from the
   * bottom of the screen to the rail's vertical centre. The user can drag it
   * anywhere along the right edge, and the chosen position is remembered.
   */
  defaultBottomInset: 500,
  /** Clearance kept between the rail and the safe-area edges when clamping. */
  edgeMarginUnits: SPACE_STEPS.md,
  /** Vertical travel before a touch becomes a drag rather than a tap. */
  dragActivationDistance: 4,
} as const;

// ── Motion ─────────────────────────────────────────────────────────────────
export const MOTION = {
  fast: 140,
  normal: 220,
  slow: 360,
  /** Standard ease-out curve, as cubic-bezier control points. */
  easeOut: [0.22, 1, 0.36, 1] as const,
} as const;

// ── Elevation ──────────────────────────────────────────────────────────────
/**
 * Soft, wide, low-opacity shadows only — "floating paper", never a hard drop.
 * Offset y and blur both grow with the level; opacity stays under 10%.
 */
export const ELEVATION_LEVELS = {
  flat: { y: 0, blur: 0, opacity: 0 },
  raised: { y: 2, blur: 12, opacity: 0.06 },
  floating: { y: 6, blur: 24, opacity: 0.08 },
  overlay: { y: 12, blur: 40, opacity: 0.1 },
} as const;

// ── Palette ────────────────────────────────────────────────────────────────
/** The two specified anchors, plus the neutrals interpolated between them. */
export const PALETTE = {
  paper: '#F6EEE1', //     the specified warm ground
  ink: '#0B0B0B', //       the specified near-black
  card: '#FFFDF9', //      warm white, one step above the ground
  cardMuted: '#EFE6D8', //  recessed surfaces
  line: '#E2D7C6', //      hairlines on paper
  lineStrong: '#CFC2AC',
  inkMuted: '#5A554E', //  secondary text — 7.0:1 on paper
  inkFaint: '#8C857A', //  tertiary text — 3.6:1 on paper, large sizes only
  onInk: '#F6EEE1', //     text on ink surfaces
  accent: '#7A6A55', //    a single muted bronze for selection
  accentSoft: '#E8DCC8',
  danger: '#8C3A2E',
} as const;

/** Per-season dot colours: desaturated, never competing with photography. */
export const SEASON_COLORS = {
  spring: '#A8B89A',
  summer: '#E4C79B',
  autumn: '#C08C63',
  winter: '#9AA7B5',
} as const;

// ── Typography ─────────────────────────────────────────────────────────────
/**
 * System sans on both platforms: it carries CJK and Latin in one stack, which
 * a bundled Latin-only display face could not.
 */
export const FONT_FAMILY = {
  sans: undefined, //       platform default
  mono: undefined,
} as const;

export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ── Persistence ────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  language: 'armoi.language',
  viewMode: 'armoi.viewMode',
  // Renamed with the shape change, so an old {sort, order} entry is ignored.
  sortOption: 'armoi.sortOption',
  itemFields: 'armoi.itemFields',
  railOffset: 'armoi.railOffset',
} as const;

export const LANGUAGES = ['en', 'zh'] as const;
export const DEFAULT_LANGUAGE = 'en';
