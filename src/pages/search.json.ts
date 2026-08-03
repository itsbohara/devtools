import type { APIRoute } from 'astro';
import { loadData } from '../lib/load';
import { url } from '../lib/url';

// `aliases` are folded into the searchable terms here. This is the only place they are used, which
// is why they never become routes and can be reworded without breaking a URL.
export const GET: APIRoute = () => {
  const { needs, tools, toolsByNeed } = loadData();

  const entries = [
    ...needs.map((need) => ({
      href: url(`need/${need.slug}`),
      title: need.question,
      subtitle: `${toolsByNeed.get(need.slug)!.length} tools`,
      terms: [need.h1, need.group, ...need.aliases].join(' '),
    })),
    ...tools.map((tool) => {
      // Single-need tools have no page of their own, so send searchers to the need instead of a URL
      // that would 404.
      const hasOwnPage = tool.needs.length >= 2;
      return {
        href: hasOwnPage ? url(`tool/${tool.slug}`) : url(`need/${tool.needs[0]}`),
        title: tool.name,
        subtitle: tool.note,
        terms: tool.needs.join(' '),
      };
    }),
  ];

  return new Response(JSON.stringify(entries), {
    headers: { 'content-type': 'application/json' },
  });
};
