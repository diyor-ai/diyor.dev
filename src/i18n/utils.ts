import en from './en.json';
import zh from './zh.json';
import ru from './ru.json';
import uz from './uz.json';

export const locales = ['en', 'zh', 'ru', 'uz'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';
const dict = { en, zh, ru, uz };
export type Dict = typeof en;
export const getT = (lang: Lang): Dict => dict[lang] as Dict;
export const hreflangOf: Record<Lang, string> = { en: 'en', zh: 'zh-CN', ru: 'ru', uz: 'uz' };
export const labelOf: Record<Lang, string> = { en: 'EN', zh: '中文', ru: 'RU', uz: 'O‘zbek' };

/** Section index a language switcher falls back to when the current page has no translation. */
export function sectionOf(path: string): string {
  return path.startsWith('/projects/') ? '/projects/' : path.startsWith('/blog/') ? '/blog/' : '/';
}

const uzMonths = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
/** Long date in the locale's natural form (Uzbek: "2026-yil 7-noyabr"; the others via Intl). */
export function formatDate(lang: Lang, d: Date): string {
  if (lang === 'uz') return `${d.getUTCFullYear()}-yil ${d.getUTCDate()}-${uzMonths[d.getUTCMonth()]}`;
  return new Intl.DateTimeFormat(getT(lang).htmlLang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(d);
}

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
  const m = file.match(/^index(?:\.(zh|ru|uz))?\.md$/);
  return { slug, lang: (m?.[1] as Lang) ?? 'en' };
}
