/** Sign in with Apple or Google. */

import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, Text } from '@/components';
import { AUTH } from '@/config';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { layout, space } from '@/theme';

export default function LoginScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { busy, error, signInWithApple, signInWithGoogle } = useAuth();
  const showApple = Platform.OS === 'ios';
  const showGoogle = Boolean(
    AUTH.googleIosClientId || AUTH.googleAndroidClientId || AUTH.googleWebClientId,
  );

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          paddingHorizontal: layout.gutter,
          paddingTop: insets.top + space.huge,
          paddingBottom: insets.bottom + space.xxl,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ gap: space.md }}>
          <Text variant="hero">{t('app.name')}</Text>
          <Text variant="subtitle" tone="muted">
            {t('auth.tagline')}
          </Text>
        </View>

        <View style={{ gap: space.md }}>
          {error ? (
            <Text variant="body" tone="danger">
              {error}
            </Text>
          ) : null}

          {showApple ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={{ width: '100%', height: 48 }}
              onPress={() => {
                void signInWithApple();
              }}
            />
          ) : null}

          {showGoogle ? (
            <Button
              label={t('auth.continueGoogle')}
              onPress={() => {
                void signInWithGoogle();
              }}
              loading={busy}
              disabled={busy}
            />
          ) : null}

          {!showApple && !showGoogle ? (
            <Text variant="body" tone="muted">
              {t('auth.notConfigured')}
            </Text>
          ) : null}

          <Text variant="caption" tone="faint" style={{ textAlign: 'center' }}>
            {t('auth.privacy')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
