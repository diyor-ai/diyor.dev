import type { Lang } from '../i18n/utils';

// Build-time only: runs while Astro renders pages, never in the browser.
// Any failure (network, rate limit, odd response) logs a warning and yields null, so the build still succeeds.
const cache: Map<string, Promise<string | null>> = ((globalThis as any).__repoUpdated ??= new Map());

export function repoUpdated(repoUrl: string): Promise<string | null> {
  const m = repoUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/#?]+?)\/?$/);
  if (!m) return Promise.resolve(null);
  const key = `${m[1]}/${m[2]}`;
  if (!cache.has(key)) cache.set(key, fetchLastCommit(key));
  return cache.get(key)!;
}

async function fetchLastCommit(key: string): Promise<string | null> {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'diyor.dev-build' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`; // optional, raises the rate limit
    const res = await fetch(`https://api.github.com/repos/${key}/commits?per_page=1`, { headers, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}${res.headers.get('x-ratelimit-remaining') === '0' ? ' (rate limited)' : ''}`);
    const data = await res.json();
    const date = data?.[0]?.commit?.committer?.date ?? data?.[0]?.commit?.author?.date;
    if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) throw new Error('no commit date in response');
    return date;
  } catch (err) {
    console.warn(`[github] could not fetch last commit date for ${key}: ${(err as Error).message}. Omitting the "Updated" line.`);
    return null;
  }
}

const locale: Record<Lang, string> = { en: 'en', zh: 'zh-CN', ru: 'ru' };

/** Relative to build time, e.g. "3 days ago" / "3天前" / "3 дня назад". */
export function relativeTime(iso: string, lang: Lang, now = Date.now()): string {
  const days = Math.max(0, Math.floor((now - Date.parse(iso)) / 86_400_000));
  const rtf = new Intl.RelativeTimeFormat(locale[lang], { numeric: 'auto' });
  if (days < 30) return rtf.format(-days, 'day');
  if (days < 365) return rtf.format(-Math.floor(days / 30), 'month');
  return rtf.format(-Math.floor(days / 365), 'year');
}
