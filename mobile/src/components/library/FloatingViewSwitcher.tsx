/**
 * The view-density switcher, floating at the top right above everything else.
 *
 * It is deliberately the topmost layer: density is a way of *looking* at the
 * library, so it stays reachable whatever is on screen and never takes a row
 * of layout away from the content.
 */

import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ViewMode } from '@/api';
import { VIEW_MODES } from '@/config';
import { useI18n } from '@/i18n';
import { color, elevation, layout, radius, space } from '@/theme';

import { SegmentedControl, type Segment } from '../ui';

/** One glyph per column count: 1 pane, 2 panes, 3-up grid, stacked rows. */
const VIEW_ICONS = {
  big: 'square',
  medium: 'columns',
  small: 'grid',
  list: 'list',
} as const satisfies Record<ViewMode, string>;

const PADDING = 2;

/** Gap above the switcher, and again below it before content resumes. */
const CLEARANCE = space.xs;

export const FLOATING_VIEW_SWITCHER_TEST_ID = 'floating-view-switcher';

/**
 * Vertical space the grid must leave at the top so its first row clears the
 * switcher instead of sliding under it when scrolled to the very top.
 *
 * Both arguments are measured from the top of the screen's content box: the
 * switcher is inset by `CLEARANCE`, and a title bar (when the screen has one)
 * already pushes the grid down by its own height.
 */
export function floatingSwitcherReserve(switcherHeight: number, titleBarHeight = 0): number {
  if (switcherHeight <= 0) return 0;
  return Math.max(0, CLEARANCE + switcherHeight + CLEARANCE - titleBarHeight);
}

export type FloatingViewSwitcherProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  onLayout?: React.ComponentProps<typeof View>['onLayout'];
};

export function FloatingViewSwitcher({ value, onChange, onLayout }: FloatingViewSwitcherProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const segments: Segment<ViewMode>[] = VIEW_MODES.map((mode) => ({
    value: mode,
    icon: VIEW_ICONS[mode],
    accessibilityLabel: t(`view.${mode}`),
  }));

  return (
    <View
      testID={FLOATING_VIEW_SWITCHER_TEST_ID}
      onLayout={onLayout}
      style={[
        {
          position: 'absolute',
          top: insets.top + CLEARANCE,
          right: layout.gutter,
          padding: PADDING,
          // Opaque, because it sits over photographs.
          backgroundColor: color.card,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: color.line,
        },
        elevation.floating,
      ]}
    >
      <SegmentedControl segments={segments} value={value} onChange={onChange} />
    </View>
  );
}
