/**
 * Configuration centralisée du site.
 * Tout ce qui est propre à la marque et à l'éditeur vit ici, pour éviter que
 * ces valeurs se dispersent dans les gabarits.
 */
export const SITE = {
  brand: '{{BRAND}}',
  niche: '{{NICHE}}',
  domain: '{{DOMAIN}}',
  url: 'https://{{DOMAIN}}',
  tagline: "Guides et comparatifs : {{NICHE}}",
  description:
    "Guides d'achat et comparatifs indépendants : {{NICHE}}. Les différences structurelles, expliquées. Sans chiffres invérifiés ni photos de catalogue.",
  locale: 'fr_FR',
  lang: 'fr',
} as const;

/**
 * Auteur affiché sur les articles. C'est un signal E-E-A-T : Google et les
 * moteurs génératifs privilégient le contenu attribuable à quelqu'un.
 */
export const AUTHOR = {
  name: '{{AUTHOR}}',
  role: 'Éditeur du site',
  url: 'https://{{DOMAIN}}/mentions-legales/',
} as const;

/**
 * Informations légales. Obligatoires en France (LCEN art. 6 III).
 * L'hébergeur a été relevé via RDAP sur l'IP du serveur.
 */
export const LEGAL = {
  editor: '{{AUTHOR}}',
  editorStatus: 'Éditeur individuel',
  contactEmail: 'contact@{{DOMAIN}}',
  // ⚠️ À compléter : l'adresse postale de l'éditeur est légalement obligatoire.
  editorAddress: null as string | null,
  host: {
    name: 'Hetzner Online GmbH',
    address: 'Industriestr. 25, 91710 Gunzenhausen, Allemagne',
    url: 'https://www.hetzner.com',
  },
  publicationDirector: '{{AUTHOR}}',
} as const;

/** Navigation par catégorie : les pages /comparatifs/ et /guides/ sont
    générées depuis les catégories réellement représentées. */
export const NAV = [
  { href: '/comparatifs/', label: 'Comparatifs' },
  { href: '/guides/', label: 'Guides' },
] as const;

/** Bouton d'action de l'en-tête : le contenu le plus commercial du site. */
export const HEADER_CTA = {
  href: '/comparatifs/',
  label: 'Par où commencer ?',
} as const;
