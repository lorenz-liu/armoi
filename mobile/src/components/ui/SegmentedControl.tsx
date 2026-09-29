/**
 * An inline segmented switch. The track radius is `lg`; each segment nests at
 * `lg − inset` so the selected pill's corners stay parallel to the track's.
 */

import { View } from 'react-native';

import { color, radius, space } from '@/theme';

import { Icon, type IconName } from './IconButton';
import { Touchable } from './Pressable';
import { Text } from './Text';

export type Segment<T extends string> = {
  value: T;
  label?: string;
  icon?: IconName;
  accessibilityLabel: string;
};

export type SegmentedControlProps<T extends string> = {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `true` stretches segments to fill the row. */
  fill?: boolean;
};

const TRACK_INSET = 2;

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  fill = false,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        padding: TRACK_INSET,
        gap: TRACK_INSET,
        borderRadius: radius.pill,
        backgroundColor: color.cardMuted,
        alignSelf: fill ? 'stretch' : 'flex-start',
      }}
    >
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <Touchable
            key={segment.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={segment.accessibilityLabel}
            onPress={() => onChange(segment.value)}
            style={{
              flex: fill ? 1 : undefined,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: space.xxs,
              paddingHorizontal: space.sm,
              paddingVertical: space.xs,
              borderRadius: radius.pill,
              backgroundColor: selected ? color.card : 'transparent',
            }}
          >
            {segment.icon ? (
              <Icon
                name={segment.icon}
                size={14}
                color={selected ? color.ink : color.inkFaint}
              />
            ) : null}
            {segment.label ? (
              <Text variant="caption" tone={selected ? 'ink' : 'faint'}>
                {segment.label}
              </Text>
            ) : null}
          </Touchable>
        );
      })}
    </View>
  );
}
