/**
 * "Used today" — one tap records that a piece was worn.
 *
 * Two sizes. `compact` rides along under a library cell's photograph, where it
 * competes with the caption for room. `prominent` is the item page's primary
 * action: full width, in ink, sized like every other primary button.
 *
 * Once a piece has been worn today the button settles into a checked state
 * rather than disappearing, so the layout keeps its height and the tap target
 * does not move under the finger.
 */

import type { TextStyle, ViewStyle } from 'react-native';

import { localToday } from '@/api';
import { useI18n } from '@/i18n';
import { color, layout, radius, space, typography } from '@/theme';

import { Icon, Text, Touchable } from '../ui';
import type { TextVariant } from '../ui';

export type UsageButtonVariant = 'compact' | 'prominent';

type Metrics = {
  paddingVertical: number;
  paddingHorizontal: number;
  label: TextVariant;
  icon: number;
  stretch: boolean;
};

export const USAGE_BUTTON_METRICS = {
  compact: {
    paddingVertical: space.xs,
    paddingHorizontal: space.xs,
    label: 'micro',
    icon: 12,
    stretch: false,
  },
  prominent: {
    // Matches the primary Button's rhythm, one step taller.
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    label: 'bodyStrong',
    icon: 16,
    stretch: true,
  },
} as const satisfies Record<UsageButtonVariant, Metrics>;

/** Resolved height of a variant, so callers and tests need not re-derive it. */
export function usageButtonHeight(variant: UsageButtonVariant): number {
  const metrics: Metrics = USAGE_BUTTON_METRICS[variant];
  const lineHeight = (typography[metrics.label] as TextStyle).lineHeight ?? 0;
  return Math.max(layout.touchTarget, lineHeight + metrics.paddingVertical * 2);
}

export type UsageButtonProps = {
  lastUsedDate: string | null;
  onPress: () => void;
  variant?: UsageButtonVariant;
};

export function UsageButton({ lastUsedDate, onPress, variant = 'compact' }: UsageButtonProps) {
  const { t } = useI18n();
  const usedToday = lastUsedDate === localToday();
  const metrics: Metrics = USAGE_BUTTON_METRICS[variant];
  const prominent = variant === 'prominent';

  // Ink only while the button still has something to do; once worn, it settles.
  const fill = usedToday ? color.accentSoft : prominent ? color.ink : color.card;
  const ink = usedToday ? color.accent : prominent ? color.onInk : color.inkMuted;

  const style: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: prominent ? space.xs : space.xxs,
    paddingHorizontal: metrics.paddingHorizontal,
    paddingVertical: metrics.paddingVertical,
    minHeight: usageButtonHeight(variant),
    borderRadius: radius.pill,
    borderWidth: usedToday || prominent ? 0 : 1,
    borderColor: color.line,
    backgroundColor: fill,
    alignSelf: metrics.stretch ? 'stretch' : 'auto',
  };

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ selected: usedToday, disabled: usedToday }}
      accessibilityLabel={t(usedToday ? 'item.usedToday' : 'item.useToday')}
      onPress={onPress}
      disabled={usedToday}
      style={style}
    >
      <Icon name={usedToday ? 'check' : 'sunrise'} size={metrics.icon} color={ink} />
      <Text variant={metrics.label} numberOfLines={1} style={{ color: ink }}>
        {t(usedToday ? 'item.usedToday' : 'item.useToday')}
      </Text>
    </Touchable>
  );
}
