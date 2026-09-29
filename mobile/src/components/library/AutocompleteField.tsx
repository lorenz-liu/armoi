/**
 * A free-text field backed by prefix suggestions from a user-grown library.
 *
 * Typing a new value is always allowed — that is how the brand and storage
 * libraries grow — so suggestions assist rather than constrain.
 */

import { useEffect, useState } from 'react';
import { View } from 'react-native';

import type { Suggestion } from '@/api';
import { LIMITS, MOTION } from '@/config';
import { useDebounced } from '@/hooks/useDebounced';
import { color, radius, space } from '@/theme';

import { Text, TextField, Touchable, type TextFieldProps } from '../ui';

export type AutocompleteFieldProps = Omit<TextFieldProps, 'value' | 'onChangeText'> & {
  value: string;
  onChangeText: (value: string) => void;
  fetchSuggestions: (prefix: string) => Promise<Suggestion[]>;
};

export function AutocompleteField({
  value,
  onChangeText,
  fetchSuggestions,
  ...rest
}: AutocompleteFieldProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [focused, setFocused] = useState(false);
  const prefix = useDebounced(value, MOTION.normal);

  useEffect(() => {
    if (!focused) return;
    let cancelled = false;
    fetchSuggestions(prefix)
      .then((results) => !cancelled && setSuggestions(results))
      .catch(() => !cancelled && setSuggestions([]));
    return () => {
      cancelled = true;
    };
  }, [prefix, focused, fetchSuggestions]);

  // An exact match needs no suggestion list — the user has already arrived.
  const visible =
    focused &&
    suggestions.length > 0 &&
    !(suggestions.length === 1 && suggestions[0]?.name.toLowerCase() === value.trim().toLowerCase());

  return (
    <View style={{ gap: space.xs }}>
      <TextField
        {...rest}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="words"
        maxLength={LIMITS.maxBrandLength}
        onFocus={() => setFocused(true)}
        // Delayed so a tap on a suggestion lands before the list unmounts.
        onBlur={() => setTimeout(() => setFocused(false), MOTION.fast)}
      />
      {visible ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
          {suggestions.map((suggestion) => (
            <Touchable
              key={suggestion.id}
              accessibilityRole="button"
              accessibilityLabel={suggestion.name}
              onPress={() => {
                onChangeText(suggestion.name);
                setFocused(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.xs,
                paddingHorizontal: space.sm,
                paddingVertical: space.xs,
                borderRadius: radius.pill,
                backgroundColor: color.cardMuted,
              }}
            >
              <Text variant="caption">{suggestion.name}</Text>
              <Text variant="micro" tone="faint">
                {suggestion.item_count}
              </Text>
            </Touchable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
