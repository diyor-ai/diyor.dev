import type { APIRoute, GetStaticPaths } from 'astro';
import { getProjects } from '../../lib/content';
import { OG_METRICS, renderOg } from '../../lib/og';

export const getStaticPaths = (async () => {
  const projects = await getProjects('en');
  return projects.map((p) => {
    const metric = OG_METRICS[p.slug];
    if (!metric) throw new Error(`No OG metric defined for project "${p.slug}" (src/lib/og.ts)`);
    return { params: { slug: p.slug }, props: { title: p.data.title, metric } };
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props.title, props.metric);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
