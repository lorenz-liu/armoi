/**
 * Choose which other pieces this one is worn with. Selection is a plain set of
 * ids; the backend makes the relation mutual, so nothing here needs to.
 */

import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { api, type ItemSummary } from '@/api';
import { MOTION } from '@/config';
import { useAsync } from '@/hooks/useAsync';
import { useDebounced } from '@/hooks/useDebounced';
import { useI18n } from '@/i18n';
import { color, layout, radius, space } from '@/theme';

import { LoadingState } from '../Screen';
import { Icon, Sheet, Text, TextField, Touchable } from '../ui';

import { ItemPhoto } from './ItemImage';

export type PairingPickerProps = {
  visible: boolean;
  /** Excluded from the list — an item cannot pair with itself. */
  selfId: number | null;
  selected: number[];
  onClose: () => void;
  onChange: (ids: number[]) => void;
};

export function PairingPicker({
  visible,
  selfId,
  selected,
  onClose,
  onChange,
}: PairingPickerProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search, MOTION.slow);

  const state = useAsync(
    useCallback(() => api.items.list({ search: debounced.trim() || undefined }), [debounced]),
    [debounced, visible],
  );

  const candidates = (state.data?.items ?? []).filter((item) => item.id !== selfId);

  const toggle = (item: ItemSummary) =>
    onChange(
      selected.includes(item.id)
        ? selected.filter((id) => id !== item.id)
        : [...selected, item.id],
    );

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('item.pairings')}
      closeLabel={t('common.close')}
    >
      <View style={{ paddingHorizontal: layout.gutter, paddingBottom: space.sm }}>
        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder={t('library.searchPlaceholder')}
          accessibilityLabel={t('common.search')}
          autoCorrect={false}
          clearButtonMode="while-editing"
          style={{ paddingVertical: space.xs }}
        />
      </View>
      <ScrollView
        style={{ maxHeight: space.huge * 5 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: space.md }}
        keyboardShouldPersistTaps="handled"
      >
        {state.initialLoading ? <LoadingState /> : null}
        {candidates.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <Touchable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={item.name}
              onPress={() => toggle(item)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.sm,
                paddingVertical: space.xs,
                borderBottomWidth: 1,
                borderBottomColor: color.line,
              }}
            >
              <ItemPhoto
                image={item.cover_image}
                aspectRatio={1}
                width={space.xxl}
                height={space.xxl}
                corner="sm"
                placeholderIconSize={14}
              />
              <View style={{ flex: 1, gap: space.xxs }}>
                <Text variant="body" numberOfLines={1}>
                  {item.name}
                </Text>
                {item.brand ? (
                  <Text variant="caption" tone="faint" numberOfLines={1}>
                    {item.brand}
                  </Text>
                ) : null}
              </View>
              <View
                style={{
                  width: space.lg,
                  height: space.lg,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: isSelected ? color.ink : color.lineStrong,
                  backgroundColor: isSelected ? color.ink : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected ? <Icon name="check" size={12} color={color.onInk} /> : null}
              </View>
            </Touchable>
          );
        })}
      </ScrollView>
    </Sheet>
  );
}
