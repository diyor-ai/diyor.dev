import rss from '@astrojs/rss';
import { getPosts } from './content';
import { getT, localePath, type Lang } from '../i18n/utils';
import { SITE } from '../config';
export async function feed(lang: Lang) {
  const t = getT(lang);
  const posts = (await getPosts(lang)).filter((p) => !p.data.draft);
  return rss({
    title: `diyor.dev · ${t.blog.title}`, description: t.meta.blogDesc, site: SITE,
    items: posts.map((p) => ({ title: p.data.title, description: p.data.description, pubDate: p.data.date, link: localePath(lang, `/blog/${p.slug}/`) })),
    customData: `<language>${t.htmlLang}</language>`,
  });
}
