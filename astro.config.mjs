// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://diyor.dev',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-CN', ru: 'ru', uz: 'uz' } },
      // Add an x-default alternate pointing at the English URL, matching the per-page <link rel="alternate"> tags.
      serialize(item) {
        const links = item.links ?? [];
        const en = links.find((l) => l.lang === 'en');
        if (en && !links.some((l) => l.lang === 'x-default')) links.push({ url: en.url, lang: 'x-default' });
        return item;
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'ru', 'uz'],
    routing: { prefixDefaultLocale: false },
  },
});
