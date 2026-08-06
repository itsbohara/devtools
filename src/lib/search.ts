import { loadData } from './load';
import { url } from './url';

export type SearchEntry = {
  href: string;
  external: boolean;
  title: string;
  subtitle: string;
  terms: string;
};

/**
 * The payload behind the search box. Lives here rather than in the route so it can be tested —
 * anything under src/pages/ is a route, so a test file next to it would be built as a page.
 *
 * `aliases` are folded into the searchable terms here. This is the only place they are used, which
 * is why they never become routes and can be reworded without breaking a URL.
 */
export function searchEntries(): SearchEntry[] {
  const { needs, tools, toolsByNeed } = loadData();

  return [
    ...needs.map((need) => ({
      href: url(`need/${need.slug}`),
      external: false,
      title: need.question,
      subtitle: `${toolsByNeed.get(need.slug)!.length} tools`,
      terms: [need.h1, need.group, ...need.aliases].join(' '),
    })),
    // Searching a tool by name and landing on a list page is a dead end, so the name goes straight
    // to the product, exactly as it does in ToolCard. The multi-need /tool/ pages stay reachable
    // from the "N uses" link on any need page.
    ...tools.map((tool) => ({
      href: tool.url,
      external: true,
      title: tool.name,
      subtitle: tool.note,
      terms: tool.needs.join(' '),
    })),
  ];
}
