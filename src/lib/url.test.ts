import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// BASE_URL is inlined at build time, so each case needs a fresh module instance.
const loadUrlHelper = async (baseUrl: string) => {
  vi.stubEnv('BASE_URL', baseUrl);
  vi.resetModules();
  return (await import('./url')).url;
};

describe('url', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  describe('on a custom domain (base "/")', () => {
    let url: (path?: string) => string;
    beforeEach(async () => {
      url = await loadUrlHelper('/');
    });

    it('renders the home link as a single slash', () => {
      expect(url()).toBe('/');
    });

    it('does not double the slash on a nested path', () => {
      expect(url('need/localhost-tunnel')).toBe('/need/localhost-tunnel');
    });

    it('tolerates a leading slash in the path', () => {
      expect(url('/search.json')).toBe('/search.json');
    });
  });

  describe('on a project page (base "/devtools")', () => {
    let url: (path?: string) => string;
    beforeEach(async () => {
      url = await loadUrlHelper('/devtools');
    });

    it('renders the home link without a trailing slash', () => {
      expect(url()).toBe('/devtools');
    });

    it('prefixes a nested path', () => {
      expect(url('need/localhost-tunnel')).toBe('/devtools/need/localhost-tunnel');
    });

    it('tolerates a leading slash in the path', () => {
      expect(url('/search.json')).toBe('/devtools/search.json');
    });
  });
});
