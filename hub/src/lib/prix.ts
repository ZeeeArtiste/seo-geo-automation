/**
 * Regroupement des observations de prix.
 *
 * Une observation est un relevé daté dans le catalogue public d'une boutique
 * officielle. Ce fichier ne calcule que ce que la série permet d'affirmer :
 * la dernière valeur, la première, et l'écart entre les deux. Pas de moyenne,
 * pas de tendance extrapolée — avec quelques points, ce serait de l'habillage
 * statistique sur du vide.
 */
export type Observation = {
  date: string; article: string; product: string; store: string; storeLabel: string;
  price: number; currency: string; url: string; brand: string; siteUrl: string;
};

export const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
   .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function parProduit(observations: Observation[]) {
  const map = new Map<string, Observation[]>();
  for (const o of observations) {
    const k = slug(o.product);
    map.set(k, [...(map.get(k) ?? []), o]);
  }
  return [...map.entries()]
    .map(([key, obs]) => {
      const serie = [...obs].sort((a, b) => a.date.localeCompare(b.date));
      const premier = serie[0];
      const dernier = serie[serie.length - 1];
      return {
        key,
        product: dernier.product,
        brand: dernier.brand,
        siteUrl: dernier.siteUrl,
        articleUrl: `${dernier.siteUrl}/articles/${dernier.article}/`,
        storeLabel: dernier.storeLabel,
        sourceUrl: dernier.url,
        currency: dernier.currency,
        premier,
        dernier,
        serie,
        // Écart depuis le premier relevé. `null` tant qu'il n'y a qu'un point :
        // annoncer « 0 % » laisserait croire à un prix stable observé, alors
        // qu'on n'a simplement rien observé d'autre.
        ecart: serie.length > 1 ? dernier.price - premier.price : null,
      };
    })
    .sort((a, b) => a.product.localeCompare(b.product));
}

export const euros = (n: number, c = 'EUR') =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: c, maximumFractionDigits: 2 });
