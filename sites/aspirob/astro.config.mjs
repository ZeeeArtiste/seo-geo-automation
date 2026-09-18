import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

const SITE = 'https://aspirob.com';

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

export default defineConfig({
  site: SITE,
  markdown: { rehypePlugins: [rehypeExternalLinks] },
  integrations: [tailwind(), sitemap(), mdx()],
});
