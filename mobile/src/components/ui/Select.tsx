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
import { ScrollView, type ViewStyle } from 'react-native';

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

/**
 * `field` is a bordered row; `compact` is a bare value + caret for sitting
 * inside another field; `chip` is a capsule that sits among other chips.
 */
export type SelectVariant = 'field' | 'compact' | 'chip';

export type SelectFieldProps<T extends string> = {
  value: T | null;
  options: readonly SelectOption<T>[];
  placeholder: string;
  onPress: () => void;
  variant?: SelectVariant;
  accessibilityLabel: string;
};

const VARIANT_STYLE = {
  field: {
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
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    paddingLeft: space.xs,
    paddingVertical: space.xxs,
    borderLeftWidth: 1,
    borderLeftColor: color.line,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.card,
  },
} as const satisfies Record<SelectVariant, ViewStyle>;

const VARIANT_TEXT = { field: 'body', compact: 'bodyStrong', chip: 'caption' } as const;
const VARIANT_CARET = { field: 16, compact: 14, chip: 14 } as const;

export function SelectField<T extends string>({
  value,
  options,
  placeholder,
  onPress,
  variant = 'field',
  accessibilityLabel,
}: SelectFieldProps<T>) {
  const selected = options.find((option) => option.value === value);

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: selected?.label ?? placeholder }}
      onPress={onPress}
      style={VARIANT_STYLE[variant]}
    >
      <Text
        variant={VARIANT_TEXT[variant]}
        tone={selected ? 'ink' : 'faint'}
        numberOfLines={1}
        style={variant === 'field' ? { flex: 1 } : undefined}
      >
        {selected?.label ?? placeholder}
      </Text>
      <Icon name="chevron-down" size={VARIANT_CARET[variant]} color={color.inkFaint} />
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
  Pick<SelectFieldProps<T>, 'placeholder' | 'variant'> & {
    accessibilityLabel?: string;
  };

/** Trigger and sheet together, for callers that are not themselves a sheet. */
export function Select<T extends string>({
  title,
  value,
  options,
  placeholder,
  variant,
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
        variant={variant}
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
