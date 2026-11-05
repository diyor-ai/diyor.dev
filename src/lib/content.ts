import { getCollection } from 'astro:content';
import { parseEntryPath, type Lang } from '../i18n/utils';

export async function getProjects(lang: Lang) {
  const all = await getCollection('projects');
  return all
    .map((e) => ({ ...e, ...parseEntryPath(e.filePath!) }))
    .filter((e) => e.lang === lang)
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getPosts(lang?: Lang) {
  const all = await getCollection('blog', (e) => import.meta.env.DEV ? true : !e.data.draft);
  return all
    .map((e) => ({ ...e, ...parseEntryPath(e.filePath!) }))
    .filter((e) => (lang ? e.lang === lang : true))
    .sort((a, b) => +b.data.date - +a.data.date);
}
