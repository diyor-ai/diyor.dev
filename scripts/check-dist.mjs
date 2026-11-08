#!/usr/bin/env node
// Post-build checks for the multilingual site. No dependencies.
//
//   npm run check        build, then run these checks
//   npm test             run these checks against an existing dist/
//   npm test -- --no-fallback   skip the (slower) missing-translation simulation
//
// Phase 1 inspects the real dist/. Phase 2 copies the project to a temp dir, deletes a few
// translations, builds that copy and verifies the fallback behaviour. The real project is never modified.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = fs.readFileSync(path.join(ROOT, 'src/config.ts'), 'utf8').match(/SITE = '([^']+)'/)[1];
const LOCALES = ['en', 'zh', 'ru', 'uz'];
const HREFLANG = { en: 'en', zh: 'zh-CN', ru: 'ru', uz: 'uz' };
const args = new Set(process.argv.slice(2));

// ---------- tiny test harness ----------
let failed = 0, passed = 0;
function report(name, problems) {
  if (problems.length === 0) { passed++; console.log(`  PASS  ${name}`); return; }
  failed++;
  console.log(`  FAIL  ${name}  (${problems.length} problem${problems.length === 1 ? '' : 's'})`);
  for (const p of problems.slice(0, 10)) console.log(`          - ${p}`);
  if (problems.length > 10) console.log(`          … and ${problems.length - 10} more`);
}

// ---------- helpers ----------
const read = (f) => fs.readFileSync(f, 'utf8');
const json = (l) => JSON.parse(read(path.join(ROOT, `src/i18n/${l}.json`)));
const localeUrl = (lang, p) => (lang === 'en' ? p : `/${lang}${p}`);
const sectionOf = (p) => (p.startsWith('/projects/') ? '/projects/' : p.startsWith('/blog/') ? '/blog/' : '/');
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** Load every built page: { rel, urlPath, lang, path (locale-less), html, is404 } */
function loadPages(dist) {
  return walk(dist).filter((f) => f.endsWith('.html')).map((f) => {
    const rel = path.relative(dist, f).split(path.sep).join('/');
    const is404 = rel === '404.html';
    const urlPath = '/' + rel.replace(/index\.html$/, '');
    const m = urlPath.match(/^\/(zh|ru|uz)(\/.*)$/);
    return { rel, urlPath, is404, lang: m ? m[1] : 'en', path: m ? m[2] : urlPath, html: read(f) };
  });
}

function parseHead(html) {
  const metas = [...html.matchAll(/<meta\b[^>]*>/g)].map((m) => m[0]);
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  const meta = (key, val) => metas.filter((t) => attr(t, key) === val).map((t) => decode(attr(t, 'content') ?? ''));
  return {
    htmlLang: html.match(/<html lang="([^"]*)"/)?.[1],
    title: decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''),
    description: meta('name', 'description')[0],
    robots: meta('name', 'robots')[0],
    canonical: links.filter((t) => attr(t, 'rel') === 'canonical').map((t) => attr(t, 'href')),
    alternates: links.filter((t) => attr(t, 'rel') === 'alternate' && attr(t, 'hreflang')).map((t) => ({ hreflang: attr(t, 'hreflang'), href: attr(t, 'href') })),
    ogUrl: meta('property', 'og:url')[0],
    ogTitle: meta('property', 'og:title')[0],
    ogDesc: meta('property', 'og:description')[0],
    ogLocale: meta('property', 'og:locale')[0],
    ogLocaleAlt: meta('property', 'og:locale:alternate'),
    ogImage: meta('property', 'og:image')[0],
  };
}

function parseSwitcher(html) {
  const block = html.match(/<div class="lang"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  if (!block) return null;
  return [...block.matchAll(/<a\b([^>]*)>/g)].map((m) => ({ href: attr(m[1], 'href'), hreflang: attr(m[1], 'hreflang'), current: / aria-current="true"/.test(m[1]) }));
}

// ---------- generic checks (run on any built dist) ----------
function siteChecks(dist, tag) {
  const pages = loadPages(dist);
  const indexable = pages.filter((p) => !p.is404);
  const has = (lang, p) => pages.some((x) => !x.is404 && x.lang === lang && x.path === p);
  const t = (l) => json(l);
  const label = (n) => `${tag}${n}`;

  // 1. canonical
  {
    const bad = [];
    for (const p of indexable) {
      const h = parseHead(p.html);
      const want = SITE + p.urlPath;
      if (h.canonical.length !== 1 || h.canonical[0] !== want) bad.push(`${p.urlPath}: canonical ${JSON.stringify(h.canonical)} ≠ ${want}`);
      if (h.ogUrl !== want) bad.push(`${p.urlPath}: og:url ${h.ogUrl} ≠ ${want}`);
      if (h.robots && /noindex/.test(h.robots)) bad.push(`${p.urlPath}: unexpected noindex`);
    }
    report(label('canonical URLs (one per page, self-referencing, matches og:url)'), bad);
  }

  // 2. hreflang: complete, correct codes, x-default, reciprocal, targets exist
  {
    const bad = [];
    const byUrl = new Map(indexable.map((p) => [SITE + p.urlPath, p]));
    for (const p of indexable) {
      const h = parseHead(p.html);
      const expected = LOCALES.filter((l) => has(l, p.path));
      const got = h.alternates.filter((a) => a.hreflang !== 'x-default');
      const want = expected.map((l) => `${HREFLANG[l]} ${SITE}${localeUrl(l, p.path)}`).sort();
      const have = got.map((a) => `${a.hreflang} ${a.href}`).sort();
      if (JSON.stringify(want) !== JSON.stringify(have)) bad.push(`${p.urlPath}: hreflang set\n              want ${want.join(', ')}\n              have ${have.join(', ')}`);
      const xd = h.alternates.filter((a) => a.hreflang === 'x-default');
      if (has('en', p.path)) {
        if (xd.length !== 1 || xd[0].href !== SITE + localeUrl('en', p.path)) bad.push(`${p.urlPath}: x-default should be the English URL`);
      }
      if (!got.some((a) => a.href === SITE + p.urlPath)) bad.push(`${p.urlPath}: no self-referencing hreflang`);
      for (const a of got) {
        const target = byUrl.get(a.href);
        if (!target) { bad.push(`${p.urlPath}: hreflang target ${a.href} does not exist`); continue; }
        const back = parseHead(target.html).alternates.find((b) => b.href === SITE + p.urlPath);
        if (!back) bad.push(`${p.urlPath} → ${a.href}: not reciprocal`);
        else if (back.hreflang !== HREFLANG[p.lang]) bad.push(`${a.href} links back with wrong code ${back.hreflang}`);
      }
    }
    report(label('hreflang: complete, reciprocal, x-default, targets exist'), bad);
  }

  // 3. language-switcher destinations (expected values derived from which pages actually exist)
  {
    const bad = [];
    for (const p of pages) {
      const sw = parseSwitcher(p.html);
      if (!sw) { bad.push(`${p.rel}: no language switcher`); continue; }
      if (sw.length !== LOCALES.length) { bad.push(`${p.rel}: ${sw.length} switcher links`); continue; }
      LOCALES.forEach((l, i) => {
        const a = sw[i];
        const want = p.is404 ? localeUrl(l, '/') : has(l, p.path) ? localeUrl(l, p.path) : localeUrl(l, sectionOf(p.path));
        if (a.hreflang !== HREFLANG[l]) bad.push(`${p.rel}: link ${i} hreflang ${a.hreflang}`);
        if (a.href !== want) bad.push(`${p.rel}: ${l} switcher → ${a.href}, expected ${want}`);
        if (!p.is404 && a.current !== (l === p.lang)) bad.push(`${p.rel}: aria-current wrong on ${l}`);
        const exists = fs.existsSync(path.join(dist, a.href, 'index.html'));
        if (!exists) bad.push(`${p.rel}: ${l} switcher target ${a.href} does not exist`);
      });
    }
    report(label('language switcher keeps page/slug when translated, else section index'), bad);
  }

  // 4. no REVIEW markers in production HTML
  {
    const bad = pages.filter((p) => /REVIEW:\s*translation|<!--\s*REVIEW/i.test(p.html)).map((p) => `${p.rel}: REVIEW marker present`);
    report(label('no REVIEW markers in production HTML'), bad);
  }

  // 5. broken internal links
  {
    const bad = [];
    let n = 0;
    for (const p of pages) {
      for (const m of p.html.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)) {
        let u = decode(m[1]);
        if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(u)) continue;
        u = u.split('#')[0].split('?')[0];
        if (!u) continue;
        n++;
        const fp = path.join(dist, u);
        const ok = u.endsWith('/') ? fs.existsSync(path.join(fp, 'index.html')) : fs.existsSync(fp) && fs.statSync(fp).isFile() || fs.existsSync(path.join(fp, 'index.html'));
        if (!ok) bad.push(`${p.rel}: ${u}`);
      }
    }
    report(label(`no broken internal links (${n} references checked)`), bad);
  }

  // 6. 404 page localisation
  {
    const bad = [];
    const p = pages.find((x) => x.is404);
    if (!p) bad.push('dist/404.html missing');
    else {
      const h = parseHead(p.html);
      if (!/noindex/.test(h.robots ?? '')) bad.push('404 should be noindex');
      if (h.canonical.length) bad.push('404 should have no canonical');
      if (h.alternates.length) bad.push('404 should have no hreflang alternates');
      if (/property="og:url"/.test(p.html)) bad.push('404 should have no og:url');
      for (const l of LOCALES) {
        const n = t(l).notFound;
        const block = p.html.match(new RegExp(`<div class="nf" lang="${t(l).htmlLang}">([\\s\\S]*?)</div>`))?.[1];
        if (!block) { bad.push(`404: no block with lang="${t(l).htmlLang}"`); continue; }
        if (!block.includes(decode(n.title)) && !block.includes(n.title)) bad.push(`404 ${l}: title "${n.title}" missing`);
        if (!block.includes(n.text)) bad.push(`404 ${l}: text missing`);
        const a = block.match(/<a\b[^>]*>([^<]*)<\/a>/);
        if (!a || a[1] !== n.home) bad.push(`404 ${l}: home link text ≠ "${n.home}"`);
        if (!a || attr(a[0], 'href') !== localeUrl(l, '/')) bad.push(`404 ${l}: home link href ≠ ${localeUrl(l, '/')}`);
      }
    }
    report(label('404 page: noindex, all four languages, correct home links'), bad);
  }
  return { pages, indexable, has };
}

// ---------- phase 1 ----------
console.log(`\nPhase 1: source parity (${ROOT})`);
{
  const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]));
  const en = new Map(flat(json('en')));
  const bad = [];
  for (const l of LOCALES.slice(1)) {
    const o = new Map(flat(json(l)));
    for (const k of en.keys()) if (!o.has(k)) bad.push(`${l}: missing key ${k}`);
    for (const k of o.keys()) if (!en.has(k)) bad.push(`${l}: extra key ${k}`);
    for (const [k, v] of en) {
      const w = o.get(k);
      if (w === undefined) continue;
      if (typeof v !== typeof w) bad.push(`${l}: type mismatch at ${k}`);
      if (typeof v === 'string' && v.trim() && !String(w).trim()) bad.push(`${l}: empty string at ${k}`);
      const tok = (s) => (String(s).match(/\{[a-z]+\}/g) ?? []).sort().join();
      if (typeof v === 'string' && tok(v) !== tok(w)) bad.push(`${l}: placeholder mismatch at ${k}`);
    }
  }
  report('UI strings: identical key structure, array lengths and {placeholders} in en/zh/ru/uz', bad);
}
{
  const bad = [];
  for (const col of ['projects', 'blog']) {
    const dir = path.join(ROOT, 'src/content', col);
    for (const slug of fs.readdirSync(dir)) {
      for (const f of ['index.md', 'index.zh.md', 'index.ru.md', 'index.uz.md']) {
        if (!fs.existsSync(path.join(dir, slug, f))) bad.push(`${col}/${slug}: missing ${f}`);
      }
    }
  }
  report('content: every project and post exists in all four languages', bad);
}
{
  const bad = walk(path.join(ROOT, 'src')).filter((f) => /\.(md|astro|json|ts)$/.test(f) && /REVIEW:\s*translation/.test(read(f))).map((f) => `${path.relative(ROOT, f)}: REVIEW marker in source`);
  report('no REVIEW markers in source', bad);
}

console.log('\nPhase 2: built output (dist/)');
const DIST = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/ not found. Run `npm run build` first (or use `npm run check`).');
  process.exit(2);
}
const main = siteChecks(DIST, '');

// locale parity of built pages
{
  const bad = [];
  const sets = Object.fromEntries(LOCALES.map((l) => [l, new Set(main.indexable.filter((p) => p.lang === l).map((p) => p.path))]));
  for (const l of LOCALES.slice(1)) {
    for (const p of sets.en) if (!sets[l].has(p)) bad.push(`${l}: missing page ${p}`);
    for (const p of sets[l]) if (!sets.en.has(p)) bad.push(`${l}: extra page ${p}`);
  }
  report('locale parity: same set of pages in every language', bad);
}

// per-page metadata: localized title/description, OG, html lang, aria labels
{
  const bad = [];
  for (const p of main.indexable) {
    const h = parseHead(p.html);
    const tr = json(p.lang);
    if (h.htmlLang !== tr.htmlLang) bad.push(`${p.urlPath}: <html lang="${h.htmlLang}"> ≠ ${tr.htmlLang}`);
    if (!h.title.trim()) bad.push(`${p.urlPath}: empty <title>`);
    if (!h.description?.trim()) bad.push(`${p.urlPath}: empty meta description`);
    if (h.ogTitle !== h.title && p.path !== '/') bad.push(`${p.urlPath}: og:title differs from <title>`);
    if (!h.ogDesc || h.ogDesc !== h.description) bad.push(`${p.urlPath}: og:description missing or differs from description`);
    if (h.ogLocale !== tr.ogLocale) bad.push(`${p.urlPath}: og:locale ${h.ogLocale} ≠ ${tr.ogLocale}`);
    const wantAlt = LOCALES.filter((l) => l !== p.lang && main.has(l, p.path)).map((l) => json(l).ogLocale).sort().join();
    if (h.ogLocaleAlt.slice().sort().join() !== wantAlt) bad.push(`${p.urlPath}: og:locale:alternate ${h.ogLocaleAlt} ≠ ${wantAlt}`);
    if (!h.ogImage?.startsWith(SITE + '/') || !fs.existsSync(path.join(DIST, new URL(h.ogImage).pathname))) bad.push(`${p.urlPath}: og:image missing on disk (${h.ogImage})`);
    if (!p.html.includes(`<nav aria-label="${tr.navLabel}"`)) bad.push(`${p.urlPath}: nav aria-label ≠ "${tr.navLabel}"`);
    if (!p.html.includes(`aria-label="${tr.menu}"`)) bad.push(`${p.urlPath}: menu button label missing`);
    if (!p.html.includes(`aria-label="${tr.theme}"`)) bad.push(`${p.urlPath}: theme button label missing`);
    if (!p.html.includes(`aria-label="${tr.langLabel}"`)) bad.push(`${p.urlPath}: language group label missing`);
    if (p.lang !== 'en' && p.path === '/') {
      const en = parseHead(main.pages.find((x) => x.lang === 'en' && x.path === '/').html);
      if (h.title === en.title || h.description === en.description) bad.push(`${p.urlPath}: home title/description not localized`);
    }
  }
  report('metadata: html lang, title, description, Open Graph, og:locale(:alternate), aria labels', bad);
}

// CV button labels are explicit about the file language
{
  const bad = [];
  for (const l of LOCALES) {
    const home = main.pages.find((p) => p.lang === l && p.path === '/');
    const a = home.html.match(/<a\b[^>]*href="(\/cv\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    const label = a?.[2].replace(/<[^>]+>/g, '');
    if (!a) { bad.push(`${l}: no CV link`); continue; }
    if (label !== json(l).hero.cv) bad.push(`${l}: CV label "${label}"`);
    if ((l === 'ru' || l === 'uz') && !(a[1] === '/cv/cv-en.pdf' && label.includes('(EN)'))) bad.push(`${l}: English CV must be labelled (EN)`);
  }
  report('CV button labels state the file language', bad);
}

// sitemap, robots, RSS
{
  const bad = [];
  const robots = read(path.join(DIST, 'robots.txt'));
  if (!/^User-agent:\s*\*/m.test(robots) || !/^Allow:\s*\//m.test(robots)) bad.push('robots.txt: missing User-agent/Allow');
  if (/^Disallow:\s*\/\s*$/m.test(robots)) bad.push('robots.txt: disallows everything');
  const sm = robots.match(/^Sitemap:\s*(\S+)/m)?.[1];
  if (sm !== `${SITE}/sitemap-index.xml`) bad.push(`robots.txt: Sitemap line is ${sm}`);
  const idx = read(path.join(DIST, 'sitemap-index.xml'));
  const files = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = new Map();
  for (const f of files) {
    const fp = path.join(DIST, new URL(f).pathname);
    if (!fs.existsSync(fp)) { bad.push(`sitemap-index references missing ${f}`); continue; }
    for (const m of read(fp).matchAll(/<url>([\s\S]*?)<\/url>/g)) urls.set(m[1].match(/<loc>([^<]+)/)[1], [...m[1].matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((x) => [x[1], x[2]]));
  }
  const want = new Set(main.indexable.map((p) => SITE + p.urlPath));
  for (const u of want) if (!urls.has(u)) bad.push(`sitemap missing ${u}`);
  for (const u of urls.keys()) if (!want.has(u)) bad.push(`sitemap has unknown/extra URL ${u}`);
  if (urls.has(`${SITE}/404.html`) || urls.has(`${SITE}/404/`)) bad.push('sitemap lists the 404 page');
  for (const p of main.indexable) {
    const alts = urls.get(SITE + p.urlPath) ?? [];
    const exp = LOCALES.filter((l) => main.has(l, p.path)).map((l) => `${HREFLANG[l]} ${SITE}${localeUrl(l, p.path)}`);
    if (main.has('en', p.path)) exp.push(`x-default ${SITE}${localeUrl('en', p.path)}`);
    if (alts.map((a) => a.join(' ')).sort().join('|') !== exp.sort().join('|')) bad.push(`sitemap alternates differ from page tags for ${p.urlPath}`);
  }
  for (const l of LOCALES) {
    const f = path.join(DIST, localeUrl(l, '/rss.xml'));
    if (!fs.existsSync(f)) { bad.push(`RSS missing for ${l}`); continue; }
    const x = read(f);
    if (!x.includes(`<link>${SITE}${localeUrl(l, '/')}</link>`)) bad.push(`RSS ${l}: channel <link> not localized`);
    if (!x.includes(`<atom:link href="${SITE}${localeUrl(l, '/rss.xml')}" rel="self"`)) bad.push(`RSS ${l}: atom:self missing/wrong`);
    if (!x.includes(`<language>${json(l).htmlLang}</language>`)) bad.push(`RSS ${l}: wrong <language>`);
    for (const m of x.matchAll(/<item><title>[^<]*<\/title><link>([^<]+)<\/link>/g)) {
      const u = new URL(m[1]);
      if (!want.has(m[1]) || !(l === 'en' ? !/^\/(zh|ru|uz)\//.test(u.pathname) : u.pathname.startsWith(`/${l}/`))) bad.push(`RSS ${l}: item link ${m[1]} wrong locale or missing`);
    }
  }
  report('sitemap (all pages, hreflang + x-default), robots.txt, per-language RSS', bad);
}

// Uzbek date format
{
  const bad = [];
  const uzBlog = main.pages.find((p) => p.lang === 'uz' && p.path === '/blog/');
  const dates = [...uzBlog.html.matchAll(/class="muted mono">([^<]*)</g)].map((m) => m[1]);
  if (!dates.length) bad.push('no dates found');
  for (const d of dates) if (!/^\d{4}-yil \d{1,2}-[a-z]+$/.test(d)) bad.push(`unexpected Uzbek date "${d}"`);
  report('Uzbek dates use the "2026-yil 7-noyabr" form', bad);
}

// ---------- phase 3: missing-translation simulation ----------
if (args.has('--no-fallback')) {
  console.log('\nPhase 3: skipped (--no-fallback)');
} else {
  console.log('\nPhase 3: fallback behaviour with deleted translations (scratch copy, real project untouched)');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'diyor-fallback-'));
  try {
    fs.cpSync(ROOT, tmp, { recursive: true, filter: (s) => !/(^|[\\/])(node_modules|dist|\.astro|\.git)([\\/]|$)/.test(path.relative(ROOT, s)) });
    fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(tmp, 'node_modules'), 'dir');
    const rm = (f) => fs.rmSync(path.join(tmp, 'src/content', f));
    rm('projects/roadai/index.uz.md');             // project missing in Uzbek
    rm('blog/cpu-benchmark-noise/index.ru.md');    // post missing in Russian
    try {
      execFileSync(process.execPath, [path.join(ROOT, 'node_modules/astro/bin/astro.mjs'), 'build'], { cwd: tmp, stdio: 'pipe', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
    } catch (e) {
      report('scratch build with missing translations succeeds', [String(e.stderr || e.stdout || e.message).split('\n').slice(-15).join('\n')]);
      throw e;
    }
    report('scratch build with missing translations succeeds', []);
    const fb = siteChecks(path.join(tmp, 'dist'), '[fallback] ');
    const page = (l, p) => fb.pages.find((x) => !x.is404 && x.lang === l && x.path === p);
    const bad = [];
    if (page('uz', '/projects/roadai/')) bad.push('uz roadai page should not exist');
    if (page('ru', '/blog/cpu-benchmark-noise/')) bad.push('ru post page should not exist');
    const sw = (l, p) => parseSwitcher(page(l, p).html).map((a) => a.href);
    // project missing in uz: switcher → /uz/projects/, hreflang omits uz
    for (const l of ['en', 'zh', 'ru']) {
      const href = sw(l, '/projects/roadai/')[LOCALES.indexOf('uz')];
      if (href !== '/uz/projects/') bad.push(`${l} roadai switcher → uz is ${href}, expected /uz/projects/`);
    }
    if (parseHead(page('en', '/projects/roadai/').html).alternates.some((a) => a.hreflang === 'uz')) bad.push('en roadai still advertises hreflang=uz');
    // post missing in ru: switcher → /ru/blog/
    const href = sw('en', '/blog/cpu-benchmark-noise/')[LOCALES.indexOf('ru')];
    if (href !== '/ru/blog/') bad.push(`en post switcher → ru is ${href}, expected /ru/blog/`);
    // other pages unaffected
    if (sw('en', '/projects/sst-baselines/')[LOCALES.indexOf('uz')] !== '/uz/projects/sst-baselines/') bad.push('unrelated project switcher regressed');
    // uz Projects + Home list the English project, flagged and linked to the English page
    for (const p of ['/', '/projects/']) {
      const html = page('uz', p).html;
      const card = html.match(/<article[^>]*class="card"[^>]*lang="en"[^>]*>[\s\S]*?<\/article>/g)?.find((c) => c.includes('href="/projects/roadai/"'));
      if (!card) bad.push(`uz ${p}: English fallback card for roadai missing`);
      else {
        if (!card.includes('class="badge"')) bad.push(`uz ${p}: fallback card has no language badge`);
        if (card.includes('href="/uz/projects/roadai/"')) bad.push(`uz ${p}: fallback card links to a non-existent page`);
      }
      if (html.includes('/uz/projects/roadai/')) bad.push(`uz ${p}: dangling link to /uz/projects/roadai/`);
    }
    // ru blog list shows the English post, badged, linking to the English URL
    const ruList = page('ru', '/blog/').html;
    if (!/href="\/blog\/cpu-benchmark-noise\/"[^>]*>[^<]*<\/a><span class="badge"/.test(ruList)) bad.push('ru blog list: English fallback post not shown with badge');
    if (ruList.includes('/ru/blog/cpu-benchmark-noise/')) bad.push('ru blog list: dangling link to missing ru post');
    // the ru feed must not list the missing post
    if (read(path.join(tmp, 'dist/ru/rss.xml')).includes('cpu-benchmark-noise')) bad.push('ru RSS lists the untranslated post');
    report('[fallback] missing project → section index + English card; missing post → blog index + English entry', bad);
  } catch (e) {
    if (!String(e).includes('astro')) console.error(e);
    failed++;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

console.log(`\n${failed === 0 ? 'ALL PASSED' : 'FAILED'}: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
