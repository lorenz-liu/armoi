/** Labelled text input. The field radius nests inside the card radius. */

import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { color, radius, space, typography } from '@/theme';

import { Text } from './Text';

export type TextFieldProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  /** Rendered inside the field, after the input (a currency picker, say). */
  trailing?: React.ReactNode;
};

export function TextField({
  label,
  hint,
  error,
  trailing,
  style,
  multiline,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? color.danger : focused ? color.ink : color.line;

  return (
    <View style={{ gap: space.xs }}>
      {label ? (
        <Text variant="overline" tone="faint">
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: space.xs,
          backgroundColor: color.card,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor,
          paddingHorizontal: space.sm,
        }}
      >
        <TextInput
          {...rest}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            rest.onBlur?.(event);
          }}
          placeholderTextColor={color.inkFaint}
          style={[
            typography.body,
            {
              flex: 1,
              color: color.ink,
              paddingVertical: space.sm,
              minHeight: multiline ? (typography.body.lineHeight ?? 0) * 4 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            style,
          ]}
        />
        {trailing}
      </View>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
