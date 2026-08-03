// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// `base` is load-bearing: every internal link and asset path resolves against it, so changing it
// later invalidates every URL the site has published. It must match the GitHub repo name.
export default defineConfig({
  site: 'https://itsbohara.github.io',
  base: '/devtools',
  trailingSlash: 'never',
  build: { format: 'file' },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});