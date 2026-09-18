import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://seo-geo-automation-riiz99eyh-danys-projects-3499e373.vercel.app',
  integrations: [tailwind(), sitemap(), mdx()],
});
