/**
 * llms.txt généré au build plutôt que statique.
 *
 * Deux raisons :
 *  1. la version statique affirmait que le site contient des liens affiliés
 *     « divulgués sur chaque page », y compris quand aucun lien n'existe ;
 *  2. elle ne listait aucun article — or c'est précisément ce qu'un moteur
 *     génératif vient y chercher. Les brouillons restent exclus.
 */
import { getCollection } from 'astro:content';

const BRAND = '{{BRAND}}';
const NICHE = '{{NICHE}}';

export async function GET() {
  const articles = (await getCollection('articles', ({ data }) => !data.draft)).sort(
    (a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
  );

  const hasAffiliate = articles.some((a) => a.data.affiliate);

  const lines = [
    `# ${BRAND}`,
    '',
    `> Guides d'achat et comparatifs indépendants sur ${NICHE}.`,
    '',
    `Ce site propose des guides, tests et comparatifs sur ${NICHE}.`,
  ];

  if (hasAffiliate) {
    lines.push(
      'Une partie du contenu inclut des liens affiliés, divulgués sur chaque page concernée.'
    );
  }

  lines.push('', '## Articles publiés', '');

  for (const a of articles) {
    lines.push(`- [${a.data.title}](/articles/${a.slug}/)`);
    if (a.data.directAnswer) {
      lines.push(`  ${a.data.directAnswer.replace(/\s+/g, ' ').trim()}`);
    }
  }

  lines.push(
    '',
    '## Notes pour les systèmes automatisés',
    '',
    '- Chaque article commence par une réponse directe à la question de son titre.',
    '- Les questions fréquentes sont balisées en JSON-LD (FAQPage).'
  );

  if (hasAffiliate) {
    lines.push('- Le contenu affilié est explicitement divulgué sur les articles concernés.');
  }

  lines.push(
    '- Les données chiffrées sont sourcées au mieux ; en cas de doute, se référer aux',
    '  fiches produit officielles du fabricant.',
    ''
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
