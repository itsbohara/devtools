import type { APIRoute } from 'astro';
import { loadData } from '../../lib/load';
import { renderOgImage, type OgContent } from '../../lib/og';

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;

// Slugs mirror the page paths ('index', 'need/<slug>', 'tool/<slug>') so Base.astro can derive the
// image URL from the current pathname instead of every page passing one down.
export async function getStaticPaths() {
  const { needs, tools, toolsByNeed } = loadData();

  return [
    {
      params: { slug: 'index' },
      props: {
        title: 'Free developer tools, by what you need to do',
        subtitle: `${plural(tools.length, 'curated pick')}, each with a note on the catch`,
      },
    },
    ...needs.map((need) => ({
      params: { slug: `need/${need.slug}` },
      props: {
        title: need.question,
        subtitle: `${plural(toolsByNeed.get(need.slug)!.length, 'free tool')}, with the catch on each`,
      },
    })),
    ...tools
      .filter((tool) => tool.needs.length >= 2)
      .map((tool) => ({
        params: { slug: `tool/${tool.slug}` },
        props: {
          title: `What's free on ${tool.name}?`,
          subtitle: `Covers ${plural(tool.needs.length, 'developer need')} on its free tier`,
        },
      })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props as OgContent);
  return new Response(new Uint8Array(png), {
    headers: { 'content-type': 'image/png' },
  });
};
