import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    // Un article en draft n'est ni listé, ni rendu, ni présent dans le sitemap.
    // generate-content.js le met automatiquement à true quand l'article contient
    // des marqueurs [À VÉRIFIER], pour ne jamais publier de données non vérifiées.
    draft: z.boolean().default(false),
    directAnswer: z.string(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })),
  }),
});

export const collections = { articles };
