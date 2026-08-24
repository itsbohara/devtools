import { describe, it, expect } from 'vitest';
import { breadcrumbLd, homeLd, needPageLd, serializeLd, toolPageLd } from './jsonld';
import type { Need, Tool } from '../schema';

const SITE = new URL('https://tools.itsbohara.com');

const need = (slug: string): Need => ({
  slug,
  question: `I need ${slug}`,
  h1: `Free ${slug}`,
  group: 'misc',
  aliases: [],
});

const tool = (overrides: Partial<Tool> = {}): Tool => ({
  slug: 'ngrok',
  name: 'ngrok',
  url: 'https://ngrok.com',
  needs: ['localhost-tunnel', 'webhook-inspector'],
  pricing: 'freemium',
  note: 'a note',
  verified: '2026-01-01',
  featured: false,
  ...overrides,
});

describe('breadcrumbLd', () => {
  it('numbers the trail from one', () => {
    const ld = breadcrumbLd(SITE, [{ name: 'All needs', path: '' }, { name: 'Here' }]);
    expect((ld.itemListElement as any[]).map((entry) => entry.position)).toEqual([1, 2]);
  });

  it('resolves each crumb against the site origin', () => {
    const ld = breadcrumbLd(SITE, [{ name: 'A need', path: 'need/free-icons' }, { name: 'Here' }]);
    expect((ld.itemListElement as any[])[0].item).toBe(
      'https://tools.itsbohara.com/need/free-icons',
    );
  });

  it('leaves the final crumb without an item, as the spec requires', () => {
    const ld = breadcrumbLd(SITE, [{ name: 'All needs', path: '' }, { name: 'Here' }]);
    expect((ld.itemListElement as any[])[1]).not.toHaveProperty('item');
  });
});

describe('needPageLd', () => {
  it('lists every tool as a positioned software application', () => {
    const [, list] = needPageLd(SITE, need('free-icons'), [
      tool({ name: 'lucide' }),
      tool({ name: 'heroicons' }),
    ]);
    const entries = list.itemListElement as any[];
    expect(entries.map((entry) => [entry.position, entry.item.name])).toEqual([
      [1, 'lucide'],
      [2, 'heroicons'],
    ]);
  });

  it('prices a free-tier tool at zero', () => {
    const [, list] = needPageLd(SITE, need('free-icons'), [tool({ pricing: 'free' })]);
    expect((list.itemListElement as any[])[0].item.offers).toEqual({ '@type': 'Offer', price: 0 });
  });

  it('makes no offer for a trial-only tool', () => {
    const [, list] = needPageLd(SITE, need('free-icons'), [tool({ pricing: 'trial' })]);
    expect((list.itemListElement as any[])[0].item).not.toHaveProperty('offers');
  });

  it('never invents a rating to satisfy the rich-result requirement', () => {
    const [, list] = needPageLd(SITE, need('free-icons'), [tool()]);
    const entry = (list.itemListElement as any[])[0].item;
    expect(entry).not.toHaveProperty('aggregateRating');
    expect(entry).not.toHaveProperty('review');
  });
});

describe('toolPageLd', () => {
  it('emits one breadcrumb trail per need the tool serves', () => {
    const nodes = toolPageLd(SITE, tool(), [need('localhost-tunnel'), need('webhook-inspector')]);
    const trails = nodes.filter((entry) => entry['@type'] === 'BreadcrumbList');
    expect(trails).toHaveLength(2);
  });

  it('points the app node at its own page', () => {
    const [app] = toolPageLd(SITE, tool(), [need('localhost-tunnel')]);
    expect(app.mainEntityOfPage).toBe('https://tools.itsbohara.com/tool/ngrok');
    expect(app.url).toBe('https://ngrok.com');
  });
});

describe('homeLd', () => {
  it('describes the site and lists the needs', () => {
    const [site, list] = homeLd(SITE, [need('free-icons'), need('free-fonts')], 80);
    expect(site['@type']).toBe('WebSite');
    expect(site.url).toBe('https://tools.itsbohara.com/');
    expect(list.itemListElement as any[]).toHaveLength(2);
  });
});

describe('serializeLd', () => {
  it('escapes a closing script tag hidden in the data', () => {
    const output = serializeLd({ name: '</script><img onerror=alert(1)>' });
    expect(output).not.toContain('</script>');
    expect(output).toContain('\\u003c/script');
  });

  it('carries an @context on every top-level node', () => {
    const nodes = homeLd(SITE, [need('free-icons')], 1);
    expect(nodes.every((entry) => entry['@context'] === 'https://schema.org')).toBe(true);
  });
});
