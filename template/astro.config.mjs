import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://{{DOMAIN}}';

/**
 * Marque les liens sortants des articles.
 *
 * Google impose `rel="sponsored"` sur tout lien rémunéré : sans lui, un site
 * d'affiliation s'expose à une action manuelle pour liens non naturels. On le
 * pose ici, à la compilation, plutôt que dans chaque article — un lien ajouté
 * plus tard est couvert automatiquement.
 */
function rehypeExternalLinks() {
  const isText = (n) => n.type === 'text' && n.value.trim() === '';

  const walk = (node, parent) => {
    if (node.type === 'element' && node.tagName === 'a') {
      const href = node.properties?.href ?? '';
      if (/^https?:\/\//.test(href) && !href.startsWith(SITE)) {
        const affiliate = /[?&]tag=/.test(href) || /amazon\./.test(href);
        node.properties.rel = affiliate
          ? 'sponsored nofollow noopener'
          : 'noopener';
        node.properties.target = '_blank';
        if (affiliate) {
          node.properties['data-affiliate'] = 'true';
          // Un bouton n'a rien à faire au milieu d'une phrase. Seul un lien
          // qui occupe SEUL son paragraphe devient un appel à l'action ; un
          // lien contextuel reste un lien de texte.
          const siblings = (parent?.children ?? []).filter((c) => !isText(c));
          if (parent?.tagName === 'p' && siblings.length === 1) {
            node.properties['data-cta'] = 'true';
          }
        }
      }
    }
    (node.children ?? []).forEach((c) => walk(c, node));
  };
  return (tree) => walk(tree, null);
}

/**
 * Dates de dernière modification du sitemap.
 *
 * Elles étaient absentes : `sitemap()` était appelé sans `serialize`, alors que
 * les dates existent déjà dans le frontmatter. On pousse `updatedDate` si
 * l'article a été révisé, sinon `publishDate`.
 *
 * Les pages statiques n'en reçoivent AUCUNE, volontairement : y mettre la date
 * de build donnerait à toutes la même date à chaque déploiement, un signal que
 * les moteurs apprennent vite à ignorer.
 */
// `astro:content` est un module virtuel du runtime, indisponible ici : on lit
// donc le frontmatter directement sur le disque.
const ARTICLES = path.resolve('./src/content/articles');
const articleDates = new Map(
  fs
    .readdirSync(ARTICLES)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const fm = fs.readFileSync(path.join(ARTICLES, f), 'utf-8').split('---')[1] ?? '';
      const get = (k) => fm.match(new RegExp(`^${k}:\\s*"?([\\d-]+)"?\\s*$`, 'm'))?.[1];
      if (/^draft:\s*true/m.test(fm)) return null;
      const date = get('updatedDate') ?? get('publishDate');
      return date ? [`/articles/${f.replace(/\.md$/, '')}/`, date] : null;
    })
    .filter(Boolean)
);

export default defineConfig({
  site: SITE,
  markdown: { rehypePlugins: [rehypeExternalLinks] },
  integrations: [
    tailwind(),
    sitemap({
      serialize(item) {
        const date = articleDates.get(new URL(item.url).pathname);
        if (date) item.lastmod = new Date(date).toISOString();
        return item;
      },
    }),
    mdx(),
  ],
});
