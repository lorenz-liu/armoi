/**
 * The empty and error states. Generous vertical rhythm is the point: an empty
 * library should read as a blank page in a lookbook, not as a failure.
 */

import { View } from 'react-native';

import { color, radius, space } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './IconButton';
import { Text } from './Text';

export type EmptyStateProps = {
  icon?: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = 'inbox', title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.huge, gap: space.sm }}>
      <View
        style={{
          width: space.xxl,
          height: space.xxl,
          borderRadius: radius.pill,
          backgroundColor: color.cardMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: space.xs,
        }}
      >
        <Icon name={icon} size={20} color={color.inkFaint} />
      </View>
      <Text variant="title" tone="ink" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {body ? (
        <Text
          variant="caption"
          tone="muted"
          style={{ textAlign: 'center', maxWidth: space.huge * 4 }}
        >
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: space.sm }}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
