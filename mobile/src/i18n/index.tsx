/**
 * Language context.
 *
 * `t('a.b.c', params)` resolves a dot path in the active dictionary and
 * substitutes `{placeholders}`. Category labels come from the generated tree
 * rather than the dictionary, so `tCategory` reads the matching field.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { DEFAULT_LANGUAGE, LANGUAGES, STORAGE_KEYS } from '@/config';
import { CATEGORY_BY_ID, categoryChain } from '@/data/categories';

import { DICTIONARIES, type Dictionary } from './strings';

export type Language = (typeof LANGUAGES)[number];

/** Dot paths into the dictionary, e.g. `'item.save'`. */
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<Dictionary>;
export type TranslateParams = Record<string, string | number>;

function resolve(dictionary: unknown, path: string): string {
  const value = path
    .split('.')
    .reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], dictionary);
  // Falling back to the key makes a missing string obvious instead of blank.
  return typeof value === 'string' ? value : path;
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/** Picks the device language when it is one we ship, else the default. */
export function detectDeviceLanguage(): Language {
  const tag = getLocales()[0]?.languageCode?.toLowerCase();
  return (LANGUAGES as readonly string[]).includes(tag ?? '') ? (tag as Language) : DEFAULT_LANGUAGE;
}

type I18nValue = {
  language: Language;
  ready: boolean;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
  /** Pluralises with the `<base>One` / `<base>Many` key convention. */
  plural: (base: string, count: number) => string;
  tCategory: (categoryId: string | null | undefined) => string;
  tCategoryPath: (categoryId: string | null | undefined) => string;
  formatPrice: (amount: string | number | null | undefined, currency?: string | null) => string;
  formatDate: (iso: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectDeviceLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEYS.language)
      .then((stored) => {
        if (cancelled) return;
        if (stored && (LANGUAGES as readonly string[]).includes(stored)) {
          setLanguageState(stored as Language);
        }
      })
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    void AsyncStorage.setItem(STORAGE_KEYS.language, next);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dictionary = DICTIONARIES[language];
    const t: I18nValue['t'] = (key, params) => interpolate(resolve(dictionary, key), params);

    return {
      language,
      ready,
      setLanguage,
      t,
      plural: (base, count) =>
        interpolate(resolve(dictionary, `${base}${count === 1 ? 'One' : 'Many'}`), { count }),
      tCategory: (categoryId) => {
        if (!categoryId) return '';
        const node = CATEGORY_BY_ID[categoryId];
        return node ? node[language] : categoryId;
      },
      tCategoryPath: (categoryId) =>
        categoryChain(categoryId)
          .map((node) => node[language])
          .join(language === 'zh' ? ' · ' : ' / '),
      formatPrice: (amount, currency) => {
        if (amount === null || amount === undefined || amount === '') return '';
        const numeric = typeof amount === 'string' ? Number(amount) : amount;
        if (!Number.isFinite(numeric)) return '';
        try {
          return new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
            style: currency ? 'currency' : 'decimal',
            currency: currency ?? undefined,
            maximumFractionDigits: Number.isInteger(numeric) ? 0 : 2,
          }).format(numeric);
        } catch {
          return `${numeric}${currency ? ` ${currency}` : ''}`;
        }
      },
      formatDate: (iso) => {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return iso;
        return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(date);
      },
    };
  }, [language, ready, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}

export { DICTIONARIES } from './strings';
export type { Dictionary } from './strings';
