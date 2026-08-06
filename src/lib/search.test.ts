import { describe, it, expect } from 'vitest';
import { searchEntries } from './search';
import { loadData } from './load';

describe('searchEntries', () => {
  it('sends every tool hit to the product itself, not to a list page', () => {
    const { tools } = loadData();
    const byTitle = new Map(searchEntries().filter((e) => e.external).map((e) => [e.title, e]));

    for (const tool of tools) {
      expect(byTitle.get(tool.name)?.href).toBe(tool.url);
    }
  });

  it('marks tool hits external and need hits internal', () => {
    const { needs, tools } = loadData();
    const entries = searchEntries();

    expect(entries.filter((e) => e.external)).toHaveLength(tools.length);
    expect(entries.filter((e) => !e.external)).toHaveLength(needs.length);
  });

  it('keeps a single-need tool out of the need page it used to dead-end on', () => {
    const tailscale = searchEntries().find((entry) => entry.title === 'Tailscale');
    expect(tailscale?.href).not.toMatch(/\/need\//);
  });
});
