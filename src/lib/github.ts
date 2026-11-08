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

/** Absolute, language-neutral date (YYYY-MM-DD) of the last commit; unlike "3 days ago" it never goes stale between deploys. */
export const commitDate = (iso: string): string => iso.slice(0, 10);
