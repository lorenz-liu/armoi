/**
 * A single-choice dropdown: a field showing the current value, and a sheet
 * listing the options. Used wherever the option set is too long to spread
 * across chips — currencies, for one.
 *
 * The trigger and the sheet are separately exported because a caller that is
 * *itself* a sheet must hide while this one is up (stacked modals misbehave on
 * iOS), and a sheet nested inside the hidden one would unmount with it. Such
 * callers render `SelectField` in place and `SelectSheet` as a sibling of
 * their own sheet. Everyone else uses `Select`, which composes the two.
 */

import { useState } from 'react';
import { ScrollView } from 'react-native';

import { color, layout, radius, space } from '@/theme';

import { Icon } from './IconButton';
import { Touchable } from './Pressable';
import { Sheet } from './Sheet';
import { Text } from './Text';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  /** Secondary text shown after the label, e.g. a currency symbol. */
  caption?: string;
};

export type SelectFieldProps<T extends string> = {
  value: T | null;
  options: readonly SelectOption<T>[];
  placeholder: string;
  onPress: () => void;
  /** Renders as a bare value + caret, for sitting inside another field. */
  compact?: boolean;
  accessibilityLabel: string;
};

export function SelectField<T extends string>({
  value,
  options,
  placeholder,
  onPress,
  compact = false,
  accessibilityLabel,
}: SelectFieldProps<T>) {
  const selected = options.find((option) => option.value === value);

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: selected?.label ?? placeholder }}
      onPress={onPress}
      style={
        compact
          ? {
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.xxs,
              paddingLeft: space.xs,
              paddingVertical: space.xxs,
              borderLeftWidth: 1,
              borderLeftColor: color.line,
            }
          : {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: space.xs,
              paddingHorizontal: space.sm,
              paddingVertical: space.sm,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: color.line,
              backgroundColor: color.card,
            }
      }
    >
      <Text
        variant={compact ? 'bodyStrong' : 'body'}
        tone={selected ? 'ink' : 'faint'}
        numberOfLines={1}
      >
        {selected?.label ?? placeholder}
      </Text>
      <Icon name="chevron-down" size={compact ? 14 : 16} color={color.inkFaint} />
    </Touchable>
  );
}

export type SelectSheetProps<T extends string> = {
  visible: boolean;
  title: string;
  value: T | null;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  onClose: () => void;
  closeLabel: string;
  /** Adds a row that clears the selection. */
  clearLabel?: string;
  onClear?: () => void;
};

export function SelectSheet<T extends string>({
  visible,
  title,
  value,
  options,
  onChange,
  onClose,
  closeLabel,
  clearLabel,
  onClear,
}: SelectSheetProps<T>) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title} closeLabel={closeLabel}>
      <ScrollView
        style={{ maxHeight: space.huge * 5 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: space.md }}
      >
        {options.map((option) => (
          <Row
            key={option.value}
            label={option.label}
            caption={option.caption}
            selected={option.value === value}
            onPress={() => {
              onChange(option.value);
              onClose();
            }}
          />
        ))}
        {clearLabel && onClear ? (
          <Row
            label={clearLabel}
            tone="danger"
            onPress={() => {
              onClear();
              onClose();
            }}
          />
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

export type SelectProps<T extends string> = Omit<SelectSheetProps<T>, 'visible' | 'onClose'> &
  Pick<SelectFieldProps<T>, 'placeholder' | 'compact'> & {
    accessibilityLabel?: string;
  };

/** Trigger and sheet together, for callers that are not themselves a sheet. */
export function Select<T extends string>({
  title,
  value,
  options,
  placeholder,
  compact,
  accessibilityLabel,
  ...sheet
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SelectField
        value={value}
        options={options}
        placeholder={placeholder}
        compact={compact}
        accessibilityLabel={accessibilityLabel ?? title}
        onPress={() => setOpen(true)}
      />
      <SelectSheet
        {...sheet}
        visible={open}
        title={title}
        value={value}
        options={options}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function Row({
  label,
  caption,
  selected = false,
  tone = 'ink',
  onPress,
}: {
  label: string;
  caption?: string;
  selected?: boolean;
  tone?: 'ink' | 'danger';
  onPress: () => void;
}) {
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingVertical: space.sm,
        borderBottomWidth: 1,
        borderBottomColor: color.line,
      }}
    >
      <Text
        variant="body"
        tone={tone === 'danger' ? 'danger' : selected ? 'accent' : 'ink'}
        style={{ flex: 1 }}
      >
        {label}
      </Text>
      {caption ? (
        <Text variant="caption" tone="faint">
          {caption}
        </Text>
      ) : null}
      {selected ? <Icon name="check" size={16} color={color.accent} /> : null}
    </Touchable>
  );
}
