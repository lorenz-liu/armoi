/**
 * A selectable capsule. Selection is carried by fill inversion rather than a
 * colour accent, which keeps the palette neutral behind the photography.
 */

import { View } from 'react-native';

import { color, radius, space, typography } from '@/theme';

import { Touchable, type TouchableProps } from './Pressable';
import { Text } from './Text';

export type ChipProps = Omit<TouchableProps, 'children'> & {
  label: string;
  selected?: boolean;
  /** Small leading dot, used for season colours. */
  dotColor?: string;
  count?: number;
};

export function Chip({ label, selected = false, dotColor, count, style, ...rest }: ChipProps) {
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      {...rest}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.xs,
          paddingHorizontal: space.sm,
          paddingVertical: space.xs,
          minHeight: (typography.caption.lineHeight ?? 0) + space.xs * 2,
          borderRadius: radius.pill,
          backgroundColor: selected ? color.ink : color.card,
          borderWidth: 1,
          borderColor: selected ? color.ink : color.line,
        },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
    >
      {dotColor ? (
        <View
          style={{
            width: space.xs,
            height: space.xs,
            borderRadius: radius.pill,
            backgroundColor: dotColor,
          }}
        />
      ) : null}
      <Text variant="caption" tone={selected ? 'onInk' : 'ink'}>
        {label}
      </Text>
      {count !== undefined ? (
        <Text variant="micro" tone={selected ? 'onInk' : 'faint'}>
          {count}
        </Text>
      ) : null}
    </Touchable>
  );
}
