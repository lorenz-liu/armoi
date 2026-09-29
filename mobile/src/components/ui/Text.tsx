/** Typography primitive. Every text style in the app comes from a variant. */

import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { color, typography } from '@/theme';

export type TextVariant = keyof typeof typography;
export type TextTone = 'ink' | 'muted' | 'faint' | 'onInk' | 'accent' | 'danger';

const TONE_COLOR: Record<TextTone, string> = {
  ink: color.ink,
  muted: color.inkMuted,
  faint: color.inkFaint,
  onInk: color.onInk,
  accent: color.accent,
  danger: color.danger,
};

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

export function Text({ variant = 'body', tone = 'ink', style, ...rest }: TextProps) {
  return <RNText {...rest} style={[typography[variant], { color: TONE_COLOR[tone] }, style]} />;
}
