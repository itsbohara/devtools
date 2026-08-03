import { describe, it, expect } from 'vitest';
import { validateCollection } from './collection';

const need = (slug: string) => ({
  slug,
  question: `I need ${slug}`,
  h1: slug,
  group: 'misc',
  aliases: [],
});

const tool = (slug: string, needs: string[], verified = '2026-01-01') => ({
  slug,
  name: slug,
  url: `https://${slug}.com`,
  needs,
  pricing: 'free' as const,
  note: 'a note',
  verified,
});

const TODAY = '2026-08-03';

describe('validateCollection', () => {
  it('returns no errors for a consistent collection', () => {
    const errors = validateCollection({
      needs: [need('free-icons')],
      tools: [tool('koboyo', ['free-icons'])],
      today: TODAY,
    });
    expect(errors).toEqual([]);
  });

  it('flags a tool referencing an unknown need slug', () => {
    const errors = validateCollection({
      needs: [need('free-icons')],
      tools: [tool('koboyo', ['free-iconz'])],
      today: TODAY,
    });
    expect(errors.some((e) => /koboyo.*free-iconz/.test(e))).toBe(true);
  });

  it('also flags the need left unserved by a broken reference', () => {
    const errors = validateCollection({
      needs: [need('free-icons')],
      tools: [tool('koboyo', ['free-iconz'])],
      today: TODAY,
    });
    expect(errors.some((e) => /free-icons.*no tools/.test(e))).toBe(true);
  });

  it('flags duplicate need slugs', () => {
    const errors = validateCollection({
      needs: [need('free-icons'), need('free-icons')],
      tools: [],
      today: TODAY,
    });
    expect(errors.some((e) => /duplicate need slug.*free-icons/i.test(e))).toBe(true);
  });

  it('flags duplicate tool slugs', () => {
    const errors = validateCollection({
      needs: [need('free-icons')],
      tools: [tool('koboyo', ['free-icons']), tool('koboyo', ['free-icons'])],
      today: TODAY,
    });
    expect(errors.some((e) => /duplicate tool slug.*koboyo/i.test(e))).toBe(true);
  });

  it('flags a verified date in the future', () => {
    const errors = validateCollection({
      needs: [need('free-icons')],
      tools: [tool('koboyo', ['free-icons'], '2027-01-01')],
      today: TODAY,
    });
    expect(errors.some((e) => /future/i.test(e))).toBe(true);
  });

  it('accepts a verified date of exactly today', () => {
    const errors = validateCollection({
      needs: [need('free-icons')],
      tools: [tool('koboyo', ['free-icons'], TODAY)],
      today: TODAY,
    });
    expect(errors).toEqual([]);
  });

  it('flags a need that no tool serves', () => {
    const errors = validateCollection({
      needs: [need('free-icons'), need('orphan-need')],
      tools: [tool('koboyo', ['free-icons'])],
      today: TODAY,
    });
    expect(errors.some((e) => /orphan-need.*no tools/i.test(e))).toBe(true);
  });

  it('reports every error at once rather than stopping at the first', () => {
    const errors = validateCollection({
      needs: [need('a'), need('a')],
      tools: [tool('t', ['nope'])],
      today: TODAY,
    });
    expect(errors.length).toBeGreaterThan(1);
  });
});
