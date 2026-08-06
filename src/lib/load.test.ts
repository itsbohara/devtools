import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { loadData } from './load';

const fixture = (name: string) => fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url));

const TODAY = '2026-08-03';

describe('loadData', () => {
  it('loads needs and tools from disk', () => {
    const { needs, tools } = loadData({ dataDir: fixture('valid'), today: TODAY });
    expect(needs).toHaveLength(1);
    expect(tools).toHaveLength(1);
  });

  it('derives the tool slug from its filename', () => {
    const { tools } = loadData({ dataDir: fixture('valid'), today: TODAY });
    expect(tools[0].slug).toBe('koboyo');
  });

  it('sorts tools by name for stable page output', () => {
    const { tools } = loadData({ dataDir: fixture('valid'), today: TODAY });
    expect(tools.map((t) => t.name)).toEqual([...tools.map((t) => t.name)].sort());
  });

  it('throws a message naming the offending need slug on a broken reference', () => {
    expect(() => loadData({ dataDir: fixture('broken-ref'), today: TODAY })).toThrow(/free-iconz/);
  });

  it('names the offending file and field when a record fails its schema', () => {
    expect(() => loadData({ dataDir: fixture('bad-field'), today: TODAY })).toThrow(
      /data\/tools\/broken\.yml → pricing/,
    );
  });

  it('indexes tools by need', () => {
    const { toolsByNeed } = loadData({ dataDir: fixture('valid'), today: TODAY });
    expect(toolsByNeed.get('free-icons')?.map((t) => t.slug)).toEqual(['koboyo']);
  });

  it('puts featured tools first within a need, leaving the rest alphabetical', () => {
    const { toolsByNeed } = loadData({ dataDir: fixture('featured'), today: TODAY });
    expect(toolsByNeed.get('free-icons')?.map((t) => t.name)).toEqual(['Zeta', 'Alpha', 'Koboyo']);
  });

  it('keeps the global tool list alphabetical even when a tool is featured', () => {
    const { tools } = loadData({ dataDir: fixture('featured'), today: TODAY });
    expect(tools.map((t) => t.name)).toEqual(['Alpha', 'Koboyo', 'Zeta']);
  });
});
