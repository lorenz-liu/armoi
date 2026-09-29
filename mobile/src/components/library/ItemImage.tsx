/**
 * The photo frame. Every image in the app is a 4:5 portrait crop — the
 * lookbook proportion — on a warm placeholder so a missing photo still reads
 * as a composed card rather than a hole.
 */

import { Image } from 'expo-image';
import { View } from 'react-native';

import { mediaUrl, type ItemImage as ItemImageModel } from '@/api';
import { MOTION } from '@/config';
import { color, layout, radius, type RadiusToken } from '@/theme';

import { Icon } from '../ui';

export type ItemPhotoProps = {
  image: ItemImageModel | null | undefined;
  /** Overrides the 4:5 default; the pairing strip uses 1:1. */
  aspectRatio?: number;
  corner?: RadiusToken | number;
  width?: number;
  height?: number;
  placeholderIconSize?: number;
};

export function ItemPhoto({
  image,
  aspectRatio = layout.imageAspectRatio,
  corner = 'lg',
  width,
  height,
  placeholderIconSize = 20,
}: ItemPhotoProps) {
  const borderRadius = typeof corner === 'number' ? corner : radius[corner];
  const frame = {
    width: width ?? ('100%' as const),
    height,
    aspectRatio: height === undefined ? aspectRatio : undefined,
    borderRadius,
    overflow: 'hidden' as const,
    backgroundColor: color.cardMuted,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (!image) {
    return (
      <View style={frame}>
        <Icon name="image" size={placeholderIconSize} color={color.inkFaint} />
      </View>
    );
  }

  return (
    <View style={frame}>
      <Image
        source={{ uri: mediaUrl(image.url) }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={MOTION.normal}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
