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
  tagline: '{{NICHE}} : guides et comparatifs',
  description:
    "Guides d'achat et comparatifs indépendants sur {{NICHE}}.",
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
  url: 'https://{{DOMAIN}}/a-propos/',
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

export const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/a-propos/', label: 'Méthode' },
  { href: '/contact/', label: 'Contact' },
] as const;
