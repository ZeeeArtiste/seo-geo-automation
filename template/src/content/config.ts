import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    // Date de dernière révision. Les moteurs génératifs et Google privilégient
    // le contenu récemment vérifié : afficher cette date est un signal fort.
    updatedDate: z.string().optional(),
    directAnswer: z.string(),
    // Un article en draft n'est ni listé, ni rendu, ni présent dans le sitemap.
    // generate-content.js le met automatiquement à true quand l'article contient
    // des marqueurs [À VÉRIFIER], pour ne jamais publier de données non vérifiées.
    draft: z.boolean().default(false),
    // true seulement si des liens affiliés ont réellement été injectés dans
    // l'article. La divulgation ne s'affiche que dans ce cas : l'annoncer sans
    // lien serait une affirmation fausse.
    affiliate: z.boolean().default(false),
    // Étiquette éditoriale affichée et utilisée pour le regroupement en page
    // d'accueil.
    category: z.enum(['Comparatif', 'Guide', 'Test', 'Actualité']).default('Guide'),
    // Un seul article mis en avant en page d'accueil.
    featured: z.boolean().default(false),
    // Vignette affichée en page d'accueil. Optionnelle : sans elle, l'entrée
    // reste purement typographique plutôt que d'afficher une image cassée.
    cover: z.string().optional(),
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
});

export const collections = { articles };
