/** A square tap target wrapping one Feather glyph. */

import Feather from '@expo/vector-icons/Feather';

import { color, layout, radius } from '@/theme';

import { Touchable, type TouchableProps } from './Pressable';

export type IconName = React.ComponentProps<typeof Feather>['name'];

export type IconButtonProps = Omit<TouchableProps, 'children'> & {
  name: IconName;
  label: string;
  size?: number;
  tone?: 'ink' | 'muted' | 'onInk' | 'danger';
  surface?: 'none' | 'card' | 'ink';
};

const TONE: Record<NonNullable<IconButtonProps['tone']>, string> = {
  ink: color.ink,
  muted: color.inkMuted,
  onInk: color.onInk,
  danger: color.danger,
};

export function IconButton({
  name,
  label,
  size = 18,
  tone = 'ink',
  surface = 'none',
  style,
  ...rest
}: IconButtonProps) {
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={layout.touchTarget / 4}
      {...rest}
      style={[
        {
          width: layout.touchTarget,
          height: layout.touchTarget,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.pill,
          backgroundColor:
            surface === 'card' ? color.card : surface === 'ink' ? color.ink : 'transparent',
          borderWidth: surface === 'card' ? 1 : 0,
          borderColor: color.line,
        },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
    >
      <Feather name={name} size={size} color={TONE[tone]} />
    </Touchable>
  );
}

export { Feather as Icon };
