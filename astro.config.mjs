// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// Served at the root of a custom domain, so there is no `base`. If this ever moves back to a
// github.io project page, set `base: '/devtools'` — every internal link goes through src/lib/url.ts
// and will adapt, but the published URLs would change.
export default defineConfig({
  site: 'https://tools.itsbohara.com',
  trailingSlash: 'never',
  build: { format: 'file' },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap({ filter: (page) => !page.endsWith('/404') })]
});