/**
 * "Used today" — one tap records that a piece was worn.
 *
 * Once it has been worn today the button switches to a settled, checked state
 * rather than disappearing, so the row keeps its height and the tap target
 * does not move under the finger.
 */

import { localToday } from '@/api';
import { useI18n } from '@/i18n';
import { color, radius, space, typography } from '@/theme';

import { Icon, Text, Touchable } from '../ui';

export type UsageButtonProps = {
  lastUsedDate: string | null;
  onPress: () => void;
};

export function UsageButton({ lastUsedDate, onPress }: UsageButtonProps) {
  const { t } = useI18n();
  const usedToday = lastUsedDate === localToday();

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ selected: usedToday }}
      accessibilityLabel={t(usedToday ? 'item.usedToday' : 'item.useToday')}
      onPress={onPress}
      disabled={usedToday}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.xxs,
        // The label fits even the three-up cell, so it is never dropped: a
        // bare glyph in a wide pill reads as an empty control.
        paddingHorizontal: space.xs,
        paddingVertical: space.xs,
        minHeight: (typography.caption.lineHeight ?? 0) + space.xs * 2,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: usedToday ? 'transparent' : color.line,
        backgroundColor: usedToday ? color.accentSoft : color.card,
      }}
    >
      <Icon
        name={usedToday ? 'check' : 'sunrise'}
        size={12}
        color={usedToday ? color.accent : color.inkMuted}
      />
      <Text variant="micro" tone={usedToday ? 'accent' : 'muted'} numberOfLines={1}>
        {t(usedToday ? 'item.usedToday' : 'item.useToday')}
      </Text>
    </Touchable>
  );
}
