import { describe, it, expect } from 'vitest';
import { lastmodByPath, normalizePath } from './lastmod';
import type { LoadedData } from './load';
import type { Need, Tool } from '../schema';

const need = (slug: string): Need => ({
  slug,
  question: `I need ${slug}`,
  h1: slug,
  group: 'misc',
  aliases: [],
});

const tool = (slug: string, needs: string[], verified: string): Tool => ({
  slug,
  name: slug,
  url: `https://${slug}.com`,
  needs,
  pricing: 'free',
  note: 'a note',
  verified,
  featured: false,
});

const data = (needs: Need[], tools: Tool[]): LoadedData => {
  const toolsByNeed = new Map<string, Tool[]>(needs.map((entry) => [entry.slug, []]));
  for (const entry of tools) {
    for (const slug of entry.needs) toolsByNeed.get(slug)?.push(entry);
  }
  return { needs, tools, toolsByNeed };
};

describe('lastmodByPath', () => {
  it('stamps a need with its most recently verified tool', () => {
    const map = lastmodByPath(
      data(
        [need('free-icons')],
        [
          tool('lucide', ['free-icons'], '2026-01-01'),
          tool('heroicons', ['free-icons'], '2026-06-01'),
        ],
      ),
    );
    expect(map.get('/need/free-icons')).toBe('2026-06-01T00:00:00.000Z');
  });

  it('stamps a tool page with that tool’s own verified date', () => {
    const map = lastmodByPath(data([need('a'), need('b')], [tool('ngrok', ['a', 'b'], '2026-03-04')]));
    expect(map.get('/tool/ngrok')).toBe('2026-03-04T00:00:00.000Z');
  });

  it('skips single-need tools, which have no page', () => {
    const map = lastmodByPath(data([need('a')], [tool('bore', ['a'], '2026-03-04')]));
    expect(map.has('/tool/bore')).toBe(false);
  });

  it('stamps the home page with the newest date in the whole index', () => {
    const map = lastmodByPath(
      data([need('a')], [tool('x', ['a'], '2026-02-01'), tool('y', ['a'], '2026-07-09')]),
    );
    expect(map.get('/')).toBe('2026-07-09T00:00:00.000Z');
  });

  it('returns nothing for an empty index rather than the build date', () => {
    expect(lastmodByPath(data([], []))).toEqual(new Map());
  });
});

describe('normalizePath', () => {
  it('drops a trailing slash from a nested path', () => {
    expect(normalizePath('/need/free-icons/')).toBe('/need/free-icons');
  });

  it('keeps the root as a single slash', () => {
    expect(normalizePath('/')).toBe('/');
  });
});
