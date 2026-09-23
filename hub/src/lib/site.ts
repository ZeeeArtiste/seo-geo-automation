/**
 * Configuration centralisée du site.
 * Tout ce qui est propre à la marque et à l'éditeur vit ici, pour éviter que
 * ces valeurs se dispersent dans les gabarits.
 */
export const SITE = {
  brand: 'Comparo',
  niche: 'comparatifs de produits',
  domain: 'hub.aspirob.com',
  url: 'https://hub.aspirob.com',
  tagline: "Le moteur de recherche des comparatifs",
  description:
    "Cherchez parmi les comparatifs du réseau, et suivez l'évolution des prix relevés dans les catalogues officiels des fabricants.",
  // Aperçu : le site est servi pour être regardé, pas pour être trouvé. Tant
  // que ce drapeau est vrai, robots.txt interdit tout et chaque page porte un
  // noindex — un aperçu indexé sur un sous-domaine d'un site du réseau serait
  // exactement le genre d'empreinte qu'on cherche à éviter.
  preview: true,
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
  url: 'https://hub.aspirob.com/mentions-legales/',
} as const;

/**
 * Informations légales. Obligatoires en France (LCEN art. 6 III).
 * L'hébergeur a été relevé via RDAP sur l'IP du serveur.
 */
export const LEGAL = {
  editor: 'Dany Derensy',
  editorStatus: 'Éditeur individuel',
  contactEmail: 'contact@aspirob.com',
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
  { href: '/cadeaux/', label: 'Quel cadeau ?' },
  { href: '/prix/', label: 'Prix relevés' },
  { href: '/methode/', label: 'Méthode' },
] as const;

/** Bouton d'action de l'en-tête : le contenu le plus commercial du site. */
export const HEADER_CTA = {
  href: '/cadeaux/',
  label: 'Quel cadeau offrir ?',
} as const;

/**
 * Identifiant Amazon Partenaires utilisé par le sélecteur de cadeaux.
 *
 * Les liens produits pointent vers une PAGE DE RÉSULTATS taggée, format
 * officiellement supporté : il ne demande aucun ASIN, ne peut pas mener à une
 * référence épuisée, et n'exige aucun accès automatisé au catalogue d'Amazon —
 * lequel est interdit hors PA-API.
 *
 * ⚠️ Ce site doit être déclaré dans le compte Partenaires, au même titre que
 * les sites de niche. Un identifiant dédié à ce domaine permettrait en plus de
 * distinguer ce qu'il rapporte.
 */
export const AFFILIATE = {
  amazonTag: 'aspirob0d-21',
  amazonSearch: (q: string) =>
    `https://www.amazon.fr/s?k=${encodeURIComponent(q)}&tag=${AFFILIATE.amazonTag}`,
} as const;
