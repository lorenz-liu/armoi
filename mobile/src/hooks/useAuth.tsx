/**
 * Session state: SecureStore tokens, /auth/me user, Google / Apple sign-in.
 */

import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import { ApiError, json, setAuthHandlers } from '@/api/client';
import { AUTH, STORAGE_KEYS } from '@/config';

WebBrowser.maybeCompleteAuthSession();

export type AuthUser = {
  id: number;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  provider: 'google' | 'apple';
  created_at: string;
};

type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  busy: boolean;
  error: string | null;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function saveTokens(access: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.accessToken, access);
  await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refresh);
}

async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken);
}

async function loadTokens(): Promise<{ access: string | null; refresh: string | null }> {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
    SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
  ]);
  return { access, refresh };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [, , promptGoogle] = Google.useIdTokenAuthRequest({
    iosClientId: AUTH.googleIosClientId || undefined,
    androidClientId: AUTH.googleAndroidClientId || undefined,
    webClientId: AUTH.googleWebClientId || undefined,
  });

  const applySession = useCallback(async (tokens: AuthTokens) => {
    await saveTokens(tokens.access_token, tokens.refresh_token);
    setUser(tokens.user);
  }, []);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const { refresh } = await loadTokens();
    if (!refresh) return null;
    try {
      const tokens = await json.post<AuthTokens>('/auth/refresh', {
        refresh_token: refresh,
      });
      await saveTokens(tokens.access_token, tokens.refresh_token);
      setUser(tokens.user);
      return tokens.access_token;
    } catch {
      await clearTokens();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    setAuthHandlers({
      getAccessToken: async () => (await loadTokens()).access,
      refreshAccessToken: refreshSession,
      onUnauthorized: async () => {
        await clearTokens();
        setUser(null);
      },
    });
  }, [refreshSession]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { access } = await loadTokens();
        if (!access) return;
        const me = await json.get<AuthUser>('/auth/me');
        if (!cancelled) setUser(me);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await refreshSession();
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSession]);

  const run = useCallback(async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : 'Sign-in failed';
      setError(message);
    } finally {
      setBusy(false);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    await run(async () => {
      if (Platform.OS !== 'ios') {
        throw new Error('Sign in with Apple is only available on iOS.');
      }
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        throw new Error('Sign in with Apple is not available on this device.');
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error('Apple did not return an identity token.');
      }
      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ');
      const tokens = await json.post<AuthTokens>('/auth/apple', {
        id_token: credential.identityToken,
        full_name: fullName || null,
      });
      await applySession(tokens);
    });
  }, [applySession, run]);

  const signInWithGoogle = useCallback(async () => {
    await run(async () => {
      if (!AUTH.googleIosClientId && !AUTH.googleAndroidClientId && !AUTH.googleWebClientId) {
        throw new Error('Google Sign-In is not configured (missing client IDs).');
      }
      const result = await promptGoogle();
      if (result.type !== 'success') {
        if (result.type === 'dismiss' || result.type === 'cancel') return;
        throw new Error('Google sign-in was not completed.');
      }
      const idToken = result.params.id_token;
      if (!idToken) {
        throw new Error('Google did not return an ID token.');
      }
      const tokens = await json.post<AuthTokens>('/auth/google', { id_token: idToken });
      await applySession(tokens);
    });
  }, [applySession, promptGoogle, run]);

  const signOut = useCallback(async () => {
    setBusy(true);
    try {
      try {
        await json.post<void>('/auth/logout', {});
      } catch {
        // Local sign-out still proceeds if the server is unreachable.
      }
      await clearTokens();
      setUser(null);
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      busy,
      error,
      signInWithApple,
      signInWithGoogle,
      signOut,
      clearError: () => setError(null),
    }),
    [user, ready, busy, error, signInWithApple, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
