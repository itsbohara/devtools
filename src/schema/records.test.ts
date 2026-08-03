import { describe, it, expect } from 'vitest';
import { needSchema, toolSchema } from './records';

const validNeed = {
  slug: 'localhost-tunnel',
  question: 'I need to expose localhost',
  h1: 'Expose localhost to the internet',
  group: 'networking',
  aliases: ['ngrok alternative'],
};

const validTool = {
  name: 'Cloudflare',
  url: 'https://cloudflare.com',
  needs: ['localhost-tunnel', 'static-site-hosting'],
  pricing: 'freemium',
  note: 'cloudflared tunnels need no signup at all',
  verified: '2026-08-03',
};

describe('needSchema', () => {
  it('accepts a valid need', () => {
    expect(needSchema.parse(validNeed).slug).toBe('localhost-tunnel');
  });

  it('defaults aliases to an empty array', () => {
    const { aliases, ...withoutAliases } = validNeed;
    expect(needSchema.parse(withoutAliases).aliases).toEqual([]);
  });

  it('rejects a non-kebab-case slug', () => {
    expect(() => needSchema.parse({ ...validNeed, slug: 'Localhost_Tunnel' })).toThrow();
  });
});

describe('toolSchema', () => {
  it('accepts a valid tool', () => {
    expect(toolSchema.parse(validTool).name).toBe('Cloudflare');
  });

  it('rejects a non-URL', () => {
    expect(() => toolSchema.parse({ ...validTool, url: 'cloudflare.com' })).toThrow();
  });

  it('rejects a pricing value outside the enum', () => {
    expect(() => toolSchema.parse({ ...validTool, pricing: 'cheap' })).toThrow();
  });

  it('rejects an empty needs array', () => {
    expect(() => toolSchema.parse({ ...validTool, needs: [] })).toThrow();
  });

  it('rejects a malformed verified date', () => {
    expect(() => toolSchema.parse({ ...validTool, verified: '03-08-2026' })).toThrow();
  });

  it('rejects a calendar-invalid verified date', () => {
    expect(() => toolSchema.parse({ ...validTool, verified: '2026-02-31' })).toThrow();
  });
});
