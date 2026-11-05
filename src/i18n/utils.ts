import en from './en.json';
import zh from './zh.json';
import ru from './ru.json';

export const locales = ['en', 'zh', 'ru'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';
const dict = { en, zh, ru };
export type Dict = typeof en;
export const getT = (lang: Lang): Dict => dict[lang] as Dict;
export const hreflangOf: Record<Lang, string> = { en: 'en', zh: 'zh-CN', ru: 'ru' };
export const labelOf: Record<Lang, string> = { en: 'EN', zh: '中文', ru: 'RU' };

/** path like "/projects/" (no locale prefix) -> locale-aware URL path */
export function localePath(lang: Lang, path = '/'): string {
  const p = path.startsWith('/') ? path : '/' + path;
  return lang === defaultLang ? p : `/${lang}${p === '/' ? '/' : p}`;
}

/** "slug/index.zh.md" style file path -> { slug, lang } */
export function parseEntryPath(filePath: string): { slug: string; lang: Lang } {
  const parts = filePath.split('/');
  const file = parts.pop()!;
  const slug = parts.pop()!;
  const m = file.match(/^index(?:\.(zh|ru))?\.md$/);
  return { slug, lang: (m?.[1] as Lang) ?? 'en' };
}
