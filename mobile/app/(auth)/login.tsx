/** Sign in with Apple or Google — icon only, buttons at the bottom. */

import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Platform, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GoogleG, Screen, Text, Touchable } from '@/components';
import { AUTH } from '@/config';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { color, layout, radius, space, u } from '@/theme';

const AUTH_BUTTON_HEIGHT = 48;
const AUTH_BUTTON_RADIUS = 12;
const ICON_SIZE = u(28); // 112pt

/** Google Identity — light theme. */
const GOOGLE = {
  fill: '#FFFFFF',
  stroke: '#747775',
  label: '#1F1F1F',
  fontSize: 16,
  fontWeight: '500' as const,
  lineHeight: 20,
  logo: 20,
};

export default function LoginScreen() {
  const { t } = useI18n();
  const router = useRouter();
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
          paddingTop: insets.top,
          paddingBottom: insets.bottom + space.xxl,
        }}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={require('../../assets/icon.png')}
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              borderRadius: radius.lg,
            }}
            contentFit="cover"
            accessibilityLabel={t('app.name')}
          />
        </View>

        <View style={{ gap: space.md }}>
          {error ? (
            <Text variant="body" tone="danger" style={{ textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}

          {showApple ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={AUTH_BUTTON_RADIUS}
              style={{ width: '100%', height: AUTH_BUTTON_HEIGHT }}
              onPress={() => {
                void signInWithApple();
              }}
            />
          ) : null}

          {showGoogle ? (
            <Touchable
              accessibilityRole="button"
              accessibilityLabel={t('auth.continueGoogle')}
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              onPress={() => {
                void signInWithGoogle();
              }}
              style={{
                height: AUTH_BUTTON_HEIGHT,
                borderRadius: AUTH_BUTTON_RADIUS,
                backgroundColor: GOOGLE.fill,
                borderWidth: 1,
                borderColor: GOOGLE.stroke,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 12,
                alignSelf: 'stretch',
                paddingHorizontal: 12,
              }}
            >
              {busy ? (
                <ActivityIndicator size="small" color={GOOGLE.label} />
              ) : (
                <>
                  <View
                    style={{
                      width: GOOGLE.logo,
                      height: GOOGLE.logo,
                      backgroundColor: '#FFFFFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GoogleG size={GOOGLE.logo} />
                  </View>
                  <RNText
                    style={{
                      color: GOOGLE.label,
                      fontSize: GOOGLE.fontSize,
                      fontWeight: GOOGLE.fontWeight,
                      lineHeight: GOOGLE.lineHeight,
                    }}
                  >
                    {t('auth.continueGoogle')}
                  </RNText>
                </>
              )}
            </Touchable>
          ) : null}

          <Text
            variant="caption"
            tone="faint"
            style={{ textAlign: 'center', paddingHorizontal: space.sm }}
          >
            {t('auth.consentPrefix')}
            <Text
              variant="caption"
              tone="ink"
              onPress={() => router.push('/(auth)/terms')}
              accessibilityRole="link"
              accessibilityLabel={t('auth.consentLink')}
              style={{ textDecorationLine: 'underline', color: color.ink }}
            >
              {t('auth.consentLink')}
            </Text>
            {t('auth.consentSuffix')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
