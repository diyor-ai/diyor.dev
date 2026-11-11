// Sätteri hast plugin: wraps each local markdown image of a project page in a plain <a href> to the
// full-size file (served from public/figures/<slug>/) and adds a localized "click to enlarge" hint
// under the caption. The thumbnail stays the optimised, lazy-loaded WebP that Astro generates.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineHastPlugin } from 'satteri';

const HINT = {
  en: 'Click to enlarge',
  zh: '点击查看大图',
  ru: 'Нажмите, чтобы увеличить',
  uz: 'Kattalashtirish uchun bosing',
};

const isEl = (n, tag) => n && n.type === 'element' && (!tag || n.tagName === tag);

export const figureLinks = (pctx) => {
  const file = pctx.fileURL ? fileURLToPath(pctx.fileURL).replace(/\\/g, '/') : '';
  const m = file.match(/\/content\/projects\/([^/]+)\/index(?:\.(zh|ru|uz))?\.md$/);
  if (!m) return null;
  const [, slug, lang = 'en'] = m;
  return defineHastPlugin({
    name: 'figure-links',
    element: {
      filter: ['img'],
      visit(img, ctx) {
        const src = String(img.properties?.src ?? '');
        if (!src.startsWith('./')) return;
        const p = ctx.parent(img);
        if (!isEl(p, 'p') || p.children[0] !== img && ctx.indexOf(img) !== 0) return;
        const rel = `figures/${slug}/${path.basename(src)}`;
        if (!existsSync(path.join(process.cwd(), 'public', rel))) {
          throw new Error(`figure-links: missing full-size file public/${rel}`);
        }
        ctx.wrapNode(img, { type: 'element', tagName: 'a', properties: { className: ['fig-link'], href: `/${rel}` }, children: [] });
        // image and caption share one paragraph (<p><img>\n<em>…</em></p>): the hint goes right after it
        ctx.insertAfter(p, {
          type: 'element', tagName: 'p', properties: { className: ['fig-hint'] },
          children: [{ type: 'text', value: HINT[lang] }],
        });
      },
    },
  });
};
