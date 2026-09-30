/** The geometric system: every length must land on the 4pt grid. */

import {
  BASE_UNIT,
  GRID,
  TYPE_SCALE_BASE,
  TYPE_SCALE_RATIO,
  VIEW_MODE_COLUMNS,
  VIEW_MODES,
} from '@/config';
import { columnsFor, fontSize, gridCellWidth, layout, radius, space, typography, u } from '@/theme';

describe('spacing scale', () => {
  it('produces multiples of the base unit', () => {
    for (const value of Object.values(space)) {
      expect(value % BASE_UNIT).toBe(0);
    }
  });

  it('is strictly increasing', () => {
    const values = Object.values(space);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });

  it('u(n) is exactly n base units', () => {
    expect(u(3)).toBe(3 * BASE_UNIT);
  });
});

describe('radius scale', () => {
  it('uses base-unit multiples for every real corner', () => {
    const { nest, pill, ...corners } = radius;
    for (const value of Object.values(corners)) {
      expect(value % BASE_UNIT).toBe(0);
    }
    expect(pill).toBeGreaterThan(layout.touchTarget);
  });

  it('nests a child corner by subtracting its inset', () => {
    expect(radius.nest(radius.lg, space.sm)).toBe(radius.lg - space.sm);
  });

  it('never nests below the smallest readable corner', () => {
    expect(radius.nest(radius.sm, space.xl)).toBe(radius.xs);
  });
});

describe('type scale', () => {
  it('follows the declared modular ratio', () => {
    expect(fontSize.body).toBe(TYPE_SCALE_BASE);
    expect(fontSize.subtitle).toBe(Math.round(TYPE_SCALE_BASE * TYPE_SCALE_RATIO));
    expect(fontSize.title).toBe(Math.round(TYPE_SCALE_BASE * TYPE_SCALE_RATIO ** 2));
  });

  it('gives every variant a line height above its font size', () => {
    for (const variant of Object.values(typography)) {
      expect(variant.lineHeight).toBeGreaterThanOrEqual(variant.fontSize as number);
    }
  });
});

describe('grid solver', () => {
  const VIEWPORT = 390; // iPhone 15 logical width

  it.each(VIEW_MODES)('lays %s out within the viewport', (mode) => {
    const columns = columnsFor(mode);
    const cell = gridCellWidth(VIEWPORT, columns);
    const consumed = cell * columns + layout.gap * (columns - 1) + layout.gutter * 2;
    expect(consumed).toBeLessThanOrEqual(VIEWPORT);
    // Never off by more than the rounding remainder of one column.
    expect(VIEWPORT - consumed).toBeLessThan(columns);
  });

  it('gives narrower cells as the column count rises', () => {
    expect(gridCellWidth(VIEWPORT, 1)).toBeGreaterThan(gridCellWidth(VIEWPORT, 2));
    expect(gridCellWidth(VIEWPORT, 2)).toBeGreaterThan(gridCellWidth(VIEWPORT, 3));
  });

  it('matches the column counts the brief specifies', () => {
    expect(VIEW_MODE_COLUMNS).toEqual({ big: 1, medium: 2, small: 3, list: 1 });
  });

  it('keeps the gutter and gap on the grid', () => {
    expect(layout.gutter).toBe(u(GRID.gutter));
    expect(layout.gap).toBe(u(GRID.gap));
  });
});

describe('rail geometry', () => {
  it('derives its height from everything it renders — tabs, padding and grip', () => {
    expect(layout.rail.height).toBe(
      layout.rail.tabHeight * 2 + layout.rail.padding * 2 + layout.rail.gripBlock,
    );
  });

  it('is at least one touch target wide', () => {
    expect(layout.rail.width).toBeGreaterThanOrEqual(layout.touchTarget);
  });
});
