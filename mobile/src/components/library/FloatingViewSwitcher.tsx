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
      onLayout={onLayout}
      style={[
        {
          position: 'absolute',
          top: insets.top + space.xs,
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
