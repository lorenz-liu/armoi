/** Bilingual coverage, interpolation and category labelling. */

import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { CATEGORY_LIST } from '@/data/categories';
import { DICTIONARIES, I18nProvider, useI18n } from '@/i18n';

function flatten(node: unknown, prefix = ''): string[] {
  if (typeof node === 'string') return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    flatten(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe('dictionaries', () => {
  it('cover exactly the same keys in both languages', () => {
    expect(flatten(DICTIONARIES.zh).sort()).toEqual(flatten(DICTIONARIES.en).sort());
  });

  it('leave no string empty', () => {
    for (const dictionary of Object.values(DICTIONARIES)) {
      const walk = (node: unknown): void => {
        if (typeof node === 'string') {
          expect(node.length).toBeGreaterThan(0);
          return;
        }
        Object.values(node as Record<string, unknown>).forEach(walk);
      };
      walk(dictionary);
    }
  });

  it('keep placeholders consistent across languages', () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    const walk = (en: unknown, zh: unknown): void => {
      if (typeof en === 'string' && typeof zh === 'string') {
        expect(placeholders(zh)).toEqual(placeholders(en));
        return;
      }
      for (const key of Object.keys(en as object)) {
        walk((en as never)[key], (zh as never)[key]);
      }
    };
    walk(DICTIONARIES.en, DICTIONARIES.zh);
  });
});

describe('category tree', () => {
  it('labels all 200 nodes in both languages', () => {
    expect(CATEGORY_LIST).toHaveLength(200);
    for (const node of CATEGORY_LIST) {
      expect(node.en.trim().length).toBeGreaterThan(0);
      expect(node.zh.trim().length).toBeGreaterThan(0);
    }
  });

  it('carries no stray English inside the Chinese labels of the roots', () => {
    const roots = CATEGORY_LIST.filter((node) => node.depth === 0);
    expect(roots.map((node) => node.zh)).toEqual(['服装', '鞋履', '包袋', '配饰']);
  });
});

function Probe() {
  const { t, plural, tCategory, tCategoryPath, formatPrice, language, setLanguage } = useI18n();
  return (
    <>
      <Text testID="save">{t('item.save')}</Text>
      <Text testID="plural-one">{plural('library.count', 1)}</Text>
      <Text testID="plural-many">{plural('library.count', 7)}</Text>
      <Text testID="category">{tCategory('clothing.outerwear.coats')}</Text>
      <Text testID="path">{tCategoryPath('clothing.outerwear.coats')}</Text>
      <Text testID="price">{formatPrice('699', 'EUR')}</Text>
      <Text testID="language">{language}</Text>
      <Text testID="switch" onPress={() => setLanguage(language === 'en' ? 'zh' : 'en')}>
        switch
      </Text>
    </>
  );
}

describe('useI18n', () => {
  const setup = () =>
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );

  it('resolves dot paths', async () => {
    await setup();
    expect(screen.getByTestId('save')).toHaveTextContent('Save');
  });

  it('interpolates counts and picks the plural form', async () => {
    await setup();
    expect(screen.getByTestId('plural-one')).toHaveTextContent('1 piece');
    expect(screen.getByTestId('plural-many')).toHaveTextContent('7 pieces');
  });

  it('labels a category and its full path', async () => {
    await setup();
    expect(screen.getByTestId('category')).toHaveTextContent('Coats');
    expect(screen.getByTestId('path')).toHaveTextContent('Clothing / Outerwear / Coats');
  });

  it('formats a price in the active locale', async () => {
    await setup();
    expect(screen.getByTestId('price').props.children).toContain('699');
  });

  it('switches the whole UI to Chinese', async () => {
    await setup();
    await userEvent.press(screen.getByTestId('switch'));
    expect(screen.getByTestId('language')).toHaveTextContent('zh');
    expect(screen.getByTestId('save')).toHaveTextContent('保存');
    expect(screen.getByTestId('category')).toHaveTextContent('大衣');
    expect(screen.getByTestId('path')).toHaveTextContent('服装 · 外套 · 大衣');
  });
});
