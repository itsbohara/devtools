import type { LoadedData } from './load';
import { url } from './url';

const asISO = (day: string): string => new Date(`${day}T00:00:00Z`).toISOString();

const newest = (days: string[]): string => days.reduce((a, b) => (a > b ? a : b));

/**
 * Google only trusts `lastmod` when it is verifiably accurate, so every date here is a real
 * `verified` date from the data rather than the build clock — a build-time stamp would mark every
 * page as changed on every deploy and get the signal discounted.
 *
 * Keyed by pathname because that is all `serialize()` can be matched on.
 */
export function lastmodByPath({ needs, tools, toolsByNeed }: LoadedData): Map<string, string> {
  const byPath = new Map<string, string>();

  for (const tool of tools) {
    // Only multi-need tools get a page of their own; see src/pages/tool/[slug].astro.
    if (tool.needs.length >= 2) byPath.set(url(`tool/${tool.slug}`), asISO(tool.verified));
  }

  for (const need of needs) {
    const verified = (toolsByNeed.get(need.slug) ?? []).map((tool) => tool.verified);
    if (verified.length > 0) byPath.set(url(`need/${need.slug}`), asISO(newest(verified)));
  }

  if (tools.length > 0) {
    byPath.set(url(), asISO(newest(tools.map((tool) => tool.verified))));
  }

  return byPath;
}

/** Sitemap entries carry no trailing slash for the home page, but `url()` returns "/" for it. */
export const normalizePath = (pathname: string): string =>
  pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
