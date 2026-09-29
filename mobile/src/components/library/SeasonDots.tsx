/** The season indicator: one small dot per season, in calendar order. */

import { View } from 'react-native';

import type { Season } from '@/api';
import { SEASONS } from '@/config';
import { color, radius, space, u } from '@/theme';

const DOT = u(1.5); // 6pt — readable without competing with the photograph

export function SeasonDots({ seasons }: { seasons: Season[] }) {
  if (seasons.length === 0) return null;
  const ordered = SEASONS.filter((season) => seasons.includes(season));

  return (
    <View style={{ flexDirection: 'row', gap: space.xxs }}>
      {ordered.map((season) => (
        <View
          key={season}
          style={{
            width: DOT,
            height: DOT,
            borderRadius: radius.pill,
            backgroundColor: color.season[season],
          }}
        />
      ))}
    </View>
  );
}
