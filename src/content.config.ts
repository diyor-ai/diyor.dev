import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One folder per entry: <slug>/index.md (EN), index.zh.md, index.ru.md. Images live next to them.
const base = (dir: string) => glob({ pattern: '**/index{,.zh,.ru}.md', base: `./src/content/${dir}` });

const projects = defineCollection({
  loader: base('projects'),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
    stats: z.array(z.tuple([z.string(), z.string()])).length(2),
    tags: z.array(z.string()),
    repo: z.url(),
    repoLabel: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: base('blog'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      draft: z.boolean().default(false),
      cover: image().optional(),
      coverAlt: z.string().default(''),
    }),
});

export const collections = { projects, blog };
