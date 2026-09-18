import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://example.com', // remplacer par le vrai domaine avant déploiement
  integrations: [tailwind(), sitemap(), mdx()],
});
