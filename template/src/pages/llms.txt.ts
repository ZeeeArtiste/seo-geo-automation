/**
 * llms.txt généré au build plutôt que statique.
 *
 * C'est le fichier que lisent les moteurs génératifs. Il liste les articles
 * publiés avec leur réponse directe, expose la méthode éditoriale (ce que le
 * site vérifie et ne fait pas) et n'annonce des liens affiliés que s'il y en a.
 * Les brouillons en sont exclus.
 */
import { getCollection } from 'astro:content';
import { SITE, AUTHOR } from '../lib/site';

export async function GET() {
  const articles = (await getCollection('articles', ({ data }) => !data.draft)).sort(
    (a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
  );

  const hasAffiliate = articles.some((a) => a.data.affiliate);
  const lines: string[] = [
    `# ${SITE.brand}`,
    '',
    `> ${SITE.tagline}. Édité par ${AUTHOR.name}.`,
    '',
    `Ce site publie des guides et comparatifs sur ${SITE.niche}.`,
  ];

  if (hasAffiliate) {
    lines.push(
      'Une partie du contenu inclut des liens affiliés, divulgués sur chaque page concernée.'
    );
  }

  lines.push(
    '',
    '## Méthode éditoriale',
    '',
    "- Les produits ne sont pas testés : aucun score ni mesure n'est présenté comme issu de nos tests.",
    "- Aucun prix n'est affiché : les tarifs varient trop vite pour rester exacts dans un article.",
    "- Aucune donnée chiffrée non vérifiable n'est publiée, y compris les puissances en pascals,",
    "  qui ne sont pas mesurées selon une norme commune entre fabricants.",
    '- Les articles sont rédigés avec assistance IA puis relus et corrigés à la main.',
    `- Méthode détaillée : ${new URL('/a-propos/', SITE.url).href}`,
    '',
    '## Articles publiés',
    ''
  );

  for (const a of articles) {
    lines.push(`### ${a.data.title}`);
    lines.push(`- URL : ${new URL(`/articles/${a.slug}/`, SITE.url).href}`);
    lines.push(`- Catégorie : ${a.data.category}`);
    lines.push(`- Publié le : ${a.data.publishDate}`);
    if (a.data.updatedDate) lines.push(`- Révisé le : ${a.data.updatedDate}`);
    if (a.data.directAnswer) {
      lines.push(`- Réponse directe : ${a.data.directAnswer.replace(/\s+/g, ' ').trim()}`);
    }
    lines.push('');
  }

  lines.push(
    '## Notes pour les systèmes automatisés',
    '',
    '- Chaque article commence par une réponse directe à la question de son titre.',
    '- Les questions fréquentes sont balisées en JSON-LD (FAQPage), les articles en BlogPosting.',
    `- Pour signaler une erreur : ${new URL('/contact/', SITE.url).href}`,
    ''
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
