/**
 * Configuration centralisée du site.
 * Tout ce qui est propre à la marque et à l'éditeur vit ici, pour éviter que
 * ces valeurs se dispersent dans les gabarits.
 */
export const SITE = {
  brand: 'Comparo',
  niche: 'comparatifs de produits',
  domain: 'comparo.example',
  url: 'https://comparo.example',
  tagline: "Le moteur de recherche des comparatifs",
  description:
    "Cherchez parmi les comparatifs du réseau, et suivez l'évolution des prix relevés dans les catalogues officiels des fabricants.",
  locale: 'fr_FR',
  lang: 'fr',
} as const;

/**
 * Auteur affiché sur les articles. C'est un signal E-E-A-T : Google et les
 * moteurs génératifs privilégient le contenu attribuable à quelqu'un.
 */
export const AUTHOR = {
  name: 'Dany Derensy',
  role: 'Éditeur du site',
  url: 'https://comparo.example/mentions-legales/',
} as const;

/**
 * Informations légales. Obligatoires en France (LCEN art. 6 III).
 * L'hébergeur a été relevé via RDAP sur l'IP du serveur.
 */
export const LEGAL = {
  editor: 'Dany Derensy',
  editorStatus: 'Éditeur individuel',
  contactEmail: 'contact@comparo.example',
  // ⚠️ À compléter : l'adresse postale de l'éditeur est légalement obligatoire.
  editorAddress: null as string | null,
  host: {
    name: 'Hetzner Online GmbH',
    address: 'Industriestr. 25, 91710 Gunzenhausen, Allemagne',
    url: 'https://www.hetzner.com',
  },
  publicationDirector: 'Dany Derensy',
} as const;

/** Navigation par catégorie : les pages /comparatifs/ et /guides/ sont
    générées depuis les catégories réellement représentées. */
export const NAV = [
  { href: '/prix/', label: 'Prix relevés' },
  { href: '/methode/', label: 'Méthode' },
] as const;

/** Bouton d'action de l'en-tête : le contenu le plus commercial du site. */
export const HEADER_CTA = {
  href: '/prix/',
  label: 'Voir les prix relevés',
} as const;
