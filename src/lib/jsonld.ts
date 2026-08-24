import type { Need, Tool } from '../schema';
import { url } from './url';

export type JsonLd = Record<string, unknown>;

const SCHEMA_CONTEXT = 'https://schema.org';

/** Every node Google reads is a top-level graph entry, so each one carries its own @context. */
const node = (value: JsonLd): JsonLd => ({ '@context': SCHEMA_CONTEXT, ...value });

const absolute = (site: URL, path: string): string => new URL(url(path), site).href;

export type Crumb = { name: string; path?: string };

/**
 * Google's spec drops `item` on the final crumb — the trail ends at the page you are already on,
 * so a self-link there is what makes the markup invalid.
 */
export function breadcrumbLd(site: URL, trail: Crumb[]): JsonLd {
  return node({
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.path === undefined ? {} : { item: absolute(site, crumb.path) })
    }))
  });
}

/**
 * No `aggregateRating` or `review`, and that is deliberate: Google requires one of them for a
 * software-app rich result, but this index has no ratings to report. Inventing them to fill the
 * required field is exactly the fabrication the structured data guidelines ban.
 */
export function softwareApplicationLd(tool: Tool): JsonLd {
  return {
    '@type': 'SoftwareApplication',
    name: tool.name,
    url: tool.url,
    description: tool.note,
    applicationCategory: 'DeveloperApplication',
    // A trial expires, so free access is not an offer this index can honestly make on its behalf.
    ...(tool.pricing === 'trial' ? {} : { offers: { '@type': 'Offer', price: 0 } })
  };
}

export function homeLd(site: URL, needs: Need[], toolCount: number): JsonLd[] {
  return [
    node({
      '@type': 'WebSite',
      name: 'devtools',
      url: absolute(site, ''),
      description: `A curated index of ${toolCount} free developer tools, organised by task rather than by vendor category.`,
      publisher: {
        '@type': 'Person',
        name: 'itsbohara',
        url: 'https://github.com/itsbohara'
      }
    }),
    node({
      '@type': 'ItemList',
      name: 'Developer tasks',
      itemListElement: needs.map((need, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: need.h1,
        item: absolute(site, `need/${need.slug}`)
      }))
    })
  ];
}

export function needPageLd(site: URL, need: Need, tools: Tool[]): JsonLd[] {
  return [
    breadcrumbLd(site, [{ name: 'All needs', path: '' }, { name: need.h1 }]),
    node({
      '@type': 'ItemList',
      name: need.h1,
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: softwareApplicationLd(tool)
      }))
    })
  ];
}

/**
 * One trail per need the tool serves. Google's breadcrumb spec allows multiple trails to the same
 * page, which is the honest shape here — a multi-need tool genuinely sits under each of them.
 */
export function toolPageLd(site: URL, tool: Tool, needs: Need[]): JsonLd[] {
  return [
    node({
      ...softwareApplicationLd(tool),
      mainEntityOfPage: absolute(site, `tool/${tool.slug}`)
    }),
    ...needs.map((need) =>
      breadcrumbLd(site, [
        { name: 'All needs', path: '' },
        { name: need.h1, path: `need/${need.slug}` },
        { name: tool.name }
      ])
    )
  ];
}

/**
 * `</script>` inside any string value would close the tag early and turn the rest of the payload
 * into markup, so the escape has to happen here rather than at each call site.
 */
export function serializeLd(value: JsonLd | JsonLd[]): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
