/**
 * Progressive category selection: one column of choices at a time, drilling
 * from root to leaf. The breadcrumb doubles as the way back up, so the whole
 * 200-node tree is reachable without ever showing more than one level.
 */

import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
  CATEGORY_BY_ID,
  categoryChain,
  categoryChildren,
  type CategoryNode,
} from '@/data/categories';
import { useI18n } from '@/i18n';
import { color, layout, space } from '@/theme';

import { Icon, Sheet, Text, Touchable } from '../ui';

export type CategoryPickerProps = {
  visible: boolean;
  value: string | null;
  onClose: () => void;
  onSelect: (categoryId: string | null) => void;
  /** Filter mode allows picking a branch; form mode still allows it, but hints leaves. */
  allowClear?: boolean;
};

export function CategoryPicker({
  visible,
  value,
  onClose,
  onSelect,
  allowClear = true,
}: CategoryPickerProps) {
  const { t, language } = useI18n();
  const [parentId, setParentId] = useState<string | null>(
    value ? (CATEGORY_BY_ID[value]?.parentId ?? null) : null,
  );

  const options = useMemo(() => categoryChildren(parentId), [parentId]);
  const breadcrumb = categoryChain(parentId);

  const choose = (node: CategoryNode) => {
    if (node.children.length > 0) {
      setParentId(node.id);
      return;
    }
    onSelect(node.id);
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('item.category')}
      closeLabel={t('common.close')}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: space.xxs,
          paddingHorizontal: layout.gutter,
          paddingBottom: space.sm,
        }}
      >
        <Crumb label={t('common.all')} onPress={() => setParentId(null)} active={parentId === null} />
        {breadcrumb.map((node) => (
          <View key={node.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
            <Icon name="chevron-right" size={12} color={color.inkFaint} />
            <Crumb
              label={node[language]}
              onPress={() => setParentId(node.id)}
              active={node.id === parentId}
            />
          </View>
        ))}
      </View>

      <ScrollView
        style={{ maxHeight: space.huge * 5 }}
        contentContainerStyle={{ paddingHorizontal: layout.gutter, paddingBottom: space.md }}
      >
        {parentId !== null ? (
          <Row
            label={t('filter.anyCategory')}
            caption={breadcrumb.at(-1)?.[language]}
            onPress={() => {
              onSelect(parentId);
              onClose();
            }}
            selected={value === parentId}
          />
        ) : null}
        {options.map((node) => (
          <Row
            key={node.id}
            label={node[language]}
            caption={language === 'zh' ? node.en : node.zh}
            hasChildren={node.children.length > 0}
            selected={value === node.id}
            onPress={() => choose(node)}
          />
        ))}
        {allowClear && value ? (
          <Row
            label={t('common.none')}
            onPress={() => {
              onSelect(null);
              onClose();
            }}
            tone="danger"
          />
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

function Crumb({
  label,
  onPress,
  active,
}: {
  label: string;
  onPress: () => void;
  active: boolean;
}) {
  return (
    <Touchable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Text variant="caption" tone={active ? 'ink' : 'faint'}>
        {label}
      </Text>
    </Touchable>
  );
}

function Row({
  label,
  caption,
  hasChildren = false,
  selected = false,
  tone = 'ink',
  onPress,
}: {
  label: string;
  caption?: string;
  hasChildren?: boolean;
  selected?: boolean;
  tone?: 'ink' | 'danger';
  onPress: () => void;
}) {
  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingVertical: space.sm,
        borderBottomWidth: 1,
        borderBottomColor: color.line,
      }}
    >
      <View style={{ flex: 1, gap: space.xxs / 2 }}>
        <Text variant="body" tone={tone === 'danger' ? 'danger' : selected ? 'accent' : 'ink'}>
          {label}
        </Text>
        {caption ? (
          <Text variant="caption" tone="faint">
            {caption}
          </Text>
        ) : null}
      </View>
      {selected ? <Icon name="check" size={16} color={color.accent} /> : null}
      {hasChildren ? <Icon name="chevron-right" size={16} color={color.inkFaint} /> : null}
    </Touchable>
  );
}
