import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Titre court réservé à la balise <title>. Google n'affiche qu'environ
    // 60 caractères : un titre éditorial plus riche reste en H1, celui-ci
    // tient dans la fenêtre du résultat de recherche.
    seoTitle: z.string().optional(),
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
    // Regroupement THÉMATIQUE, distinct de `category` qui décrit le format.
    // Sans lui, « À lire aussi » rapprochait deux comparatifs sans rapport de
    // sujet — l'article LiDAR pointait vers l'article poils de chat.
    cluster: z.string().optional(),
    // Un seul article mis en avant en page d'accueil.
    featured: z.boolean().default(false),
    // Vignette affichée en page d'accueil. Optionnelle : sans elle, l'entrée
    // reste purement typographique plutôt que d'afficher une image cassée.
    cover: z.string().optional(),
    // Produits présentés dans l'article. Structurés plutôt qu'écrits dans le
    // corps Markdown : c'est ce qui permet au pipeline de les régénérer, et
    // aux gabarits d'en tirer à la fois les fiches et le tableau comparatif.
    products: z
      .array(
        z.object({
          name: z.string(),
          summary: z.string(),
          schematic: z.string().optional(),
          url: z.string().optional(),
          pros: z.array(z.string()).default([]),
          cons: z.array(z.string()).default([]),
          // Colonnes du tableau comparatif : { "Navigation": "LiDAR", ... }
          attrs: z.record(z.string()).default({}),
          // Page d'où le prix est relevé, quand elle diffère du lien marchand.
          // Le prix vient du catalogue du fabricant, l'achat se fait ailleurs :
          // afficher un tarif sans dire de quelle boutique il vient laisserait
          // croire qu'il s'agit de celui du marchand vers lequel on renvoie.
          sourceUrl: z.string().optional(),
          // true seulement si `url` est un lien d'affiliation. Un lien vers la
          // boutique du fabricant n'en est pas un : le marquer « sponsored »
          // serait faux, et la divulgation qu'il déclenche annoncerait une
          // rémunération inexistante.
          affiliate: z.boolean().default(false),
          // Prix RELEVÉ, jamais estimé. Les trois champs vont ensemble : un
          // prix sans sa source ni sa date d'observation n'est pas vérifiable,
          // et c'est précisément ce que ce site s'interdit de publier.
          price: z.number().optional(),
          priceCurrency: z.string().default('EUR'),
          priceSource: z.string().optional(),
          priceCheckedAt: z.string().optional(),
        })
      )
      .default([]),
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
});

export const collections = { articles };
