/**
 * A sheet of paper. The floating-card look comes from exactly one place:
 * a warm-white fill, a hairline, and a wide low-opacity shadow.
 */

import { View, type ViewProps } from 'react-native';

import { color, elevation, radius, type RadiusToken } from '@/theme';

export type SurfaceProps = ViewProps & {
  level?: keyof typeof elevation;
  /** Corner radius token; components nest children with `radius.nest`. */
  corner?: RadiusToken | number;
  tone?: 'card' | 'muted' | 'ink' | 'transparent';
  bordered?: boolean;
};

const TONE_FILL = {
  card: color.card,
  muted: color.cardMuted,
  ink: color.ink,
  transparent: 'transparent',
} as const;

export function Surface({
  level = 'raised',
  corner = 'lg',
  tone = 'card',
  bordered = true,
  style,
  ...rest
}: SurfaceProps) {
  const borderRadius = typeof corner === 'number' ? corner : radius[corner];
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: TONE_FILL[tone],
          borderRadius,
          borderWidth: bordered && tone !== 'ink' ? 1 : 0,
          borderColor: color.line,
        },
        elevation[level],
        style,
      ]}
    />
  );
}
