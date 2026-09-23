/**
 * Flux machine du site, destiné à l'agrégateur du réseau.
 *
 * `llms.txt` dit la même chose en prose, pour les moteurs génératifs ; le
 * parser serait fragile. Ce flux est la surface stable : le hub lit une URL
 * par site et n'a rien à savoir du gabarit. Un site ajouté au réseau est
 * recensé sans qu'on touche au hub.
 *
 * Ce qui en est ABSENT est volontaire : pas de corps d'article. L'agrégateur
 * doit renvoyer vers la page, pas la republier — republier le contenu de ses
 * propres sites est exactement ce qui fait basculer un portail en contenu
 * dupliqué.
 */
import { getCollection } from 'astro:content';
import { SITE, AUTHOR } from '../lib/site';

export async function GET() {
  const articles = (await getCollection('articles', ({ data }) => !data.draft)).sort(
    (a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
  );

  const abs = (p?: string) => (p ? new URL(p, SITE.url).href : undefined);

  const payload = {
    // Version du format : le hub lira des sites déployés à des dates
    // différentes, dont certains n'auront pas été régénérés depuis des mois.
    feedVersion: 1,
    generatedAt: new Date().toISOString().slice(0, 10),
    site: {
      brand: SITE.brand,
      niche: SITE.niche,
      url: SITE.url,
      tagline: SITE.tagline,
      description: SITE.description,
      lang: SITE.lang,
      author: AUTHOR.name,
    },
    articles: articles.map((a) => ({
      slug: a.slug,
      url: `${SITE.url}/articles/${a.slug}/`,
      title: a.data.title,
      description: a.data.description,
      // Ce paragraphe est la réponse à la question de l'article : c'est ce qui
      // permet au hub de répondre à une recherche sans recopier l'article.
      directAnswer: a.data.directAnswer,
      category: a.data.category,
      cluster: a.data.cluster,
      usecase: a.data.usecase,
      publishDate: a.data.publishDate,
      updatedDate: a.data.updatedDate ?? a.data.publishDate,
      affiliate: a.data.affiliate,
      cover: abs(a.data.cover),
      products: a.data.products.map((p) => ({
        name: p.name,
        url: p.url,
        affiliate: p.affiliate,
        // Un prix ne voyage qu'avec sa source et sa date : sans elles, le hub
        // afficherait un chiffre que personne ne peut vérifier.
        ...(p.price !== undefined
          ? {
              price: p.price,
              priceCurrency: p.priceCurrency,
              priceSource: p.priceSource,
              priceSourceUrl: p.sourceUrl,
              priceCheckedAt: p.priceCheckedAt,
            }
          : {}),
      })),
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
