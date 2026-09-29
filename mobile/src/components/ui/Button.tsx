/**
 * Capsule buttons. Height is derived from the type metrics rather than
 * hard-coded: lineHeight + 2·padding, rounded onto the 4pt grid.
 */

import { ActivityIndicator, View } from 'react-native';

import { color, layout, radius, space, typography } from '@/theme';

import { Touchable, type TouchableProps } from './Pressable';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium';

const FILL: Record<ButtonVariant, string> = {
  primary: color.ink,
  secondary: color.card,
  ghost: 'transparent',
  danger: color.danger,
};

const LABEL_TONE = {
  primary: 'onInk',
  secondary: 'ink',
  ghost: 'muted',
  danger: 'onInk',
} as const;

const PADDING: Record<ButtonSize, { x: number; y: number }> = {
  small: { x: space.sm, y: space.xs },
  medium: { x: space.lg, y: space.sm },
};

export type ButtonProps = Omit<TouchableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const padding = PADDING[size];
  // Guarantee the minimum touch target even at the small size.
  const minHeight = Math.max(
    layout.touchTarget,
    (typography.body.lineHeight ?? 0) + padding.y * 2,
  );

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      {...rest}
      style={[
        {
          minHeight,
          paddingHorizontal: padding.x,
          paddingVertical: padding.y,
          borderRadius: radius.pill,
          backgroundColor: FILL[variant],
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: color.lineStrong,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: space.xs,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? color.onInk : color.ink}
        />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <Text variant="captionStrong" tone={LABEL_TONE[variant]}>
            {label}
          </Text>
        </>
      )}
    </Touchable>
  );
}
