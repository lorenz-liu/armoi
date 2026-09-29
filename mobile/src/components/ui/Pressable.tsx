/**
 * Pressable with the app's single press affordance: a subtle opacity dip.
 * Centralised so no screen invents its own feedback.
 */

import { Pressable as RNPressable, type PressableProps, type ViewStyle } from 'react-native';

export const PRESSED_OPACITY = 0.62;

export type TouchableProps = Omit<PressableProps, 'style'> & {
  style?: ViewStyle | ViewStyle[];
};

export function Touchable({ style, disabled, ...rest }: TouchableProps) {
  return (
    <RNPressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        style as ViewStyle,
        { opacity: disabled ? 0.4 : pressed ? PRESSED_OPACITY : 1 },
      ]}
    />
  );
}
