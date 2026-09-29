/**
 * Bottom sheet. Corner radius `xl` on the top edge only; the scrim is the ink
 * colour at low opacity so it reads as shadow rather than a new surface.
 */

import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOTION } from '@/config';
import { color, elevation, radius, space } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

const SCRIM_OPACITY = 0.32;
/** A sheet never covers more than this share of the screen. */
const MAX_HEIGHT_FRACTION = 0.88;

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Rendered pinned below the scrollable body (Apply / Clear). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  closeLabel: string;
};

export function Sheet({ visible, onClose, title, footer, children, closeLabel }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Lazy state, not a ref: the driver is created once and never read during render.
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? MOTION.normal : MOTION.fast,
      useNativeDriver: true,
    }).start();
  }, [visible, progress]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: color.ink,
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, SCRIM_OPACITY] }),
        }}
      />
      <View style={{ ...StyleSheetAbsoluteFill, justifyContent: 'flex-end' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <Animated.View
          style={[
            {
              maxHeight: height * MAX_HEIGHT_FRACTION,
              backgroundColor: color.paper,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: insets.bottom + space.md,
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height * MAX_HEIGHT_FRACTION, 0],
                  }),
                },
              ],
            },
            elevation.overlay,
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: space.lg,
              paddingRight: space.sm,
              paddingTop: space.md,
              paddingBottom: space.sm,
            }}
          >
            <Text variant="title">{title}</Text>
            <IconButton name="x" label={closeLabel} onPress={onClose} tone="muted" />
          </View>
          {children}
          {footer ? (
            <View
              style={{
                flexDirection: 'row',
                gap: space.sm,
                paddingHorizontal: space.lg,
                paddingTop: space.sm,
                borderTopWidth: 1,
                borderTopColor: color.line,
              }}
            >
              {footer}
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const StyleSheetAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
