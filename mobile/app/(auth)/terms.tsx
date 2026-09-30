/** Full Terms of Use — reachable from the login consent link. */

import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Screen, Text } from '@/components';
import { TERMS } from '@/data/terms';
import { useI18n } from '@/i18n';
import { layout, space } from '@/theme';

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useI18n();
  const doc = TERMS[language === 'zh' ? 'zh' : 'en'];

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: space.sm,
          paddingBottom: space.xs,
        }}
      >
        <IconButton name="x" label={t('common.close')} onPress={() => router.back()} />
        <Text variant="subtitle">{doc.title}</Text>
        <View style={{ width: layout.touchTarget }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingBottom: insets.bottom + space.xxl,
          gap: space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="caption" tone="faint">
          {doc.updated}
        </Text>
        <Text variant="body">{doc.intro}</Text>
        {doc.sections.map((section) => (
          <View key={section.heading} style={{ gap: space.sm }}>
            <Text variant="bodyStrong">{section.heading}</Text>
            <Text variant="body" tone="muted">
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
