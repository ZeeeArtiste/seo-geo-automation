/**
 * robots.txt généré au build.
 *
 * Il était statique et déclarait `Sitemap: https://example.com/...` — un reste
 * de gabarit jamais substitué, qui rendait le sitemap introuvable par cette
 * voie. Le générer depuis SITE.url supprime la classe entière du problème :
 * la directive suit le domaine, y compris s'il change.
 */
import { SITE } from '../lib/site';

/**
 * Deux familles distinctes, souvent confondues :
 *  - entraînement / grounding : GPTBot, ClaudeBot, Google-Extended
 *  - CITATION en recherche : OAI-SearchBot, Claude-SearchBot, PerplexityBot,
 *    Googlebot (qui gouverne AI Overviews), Bingbot
 * Ne nommer que les premiers laissait les seconds dépendre du groupe « * » :
 * aucun blocage aujourd'hui, mais ils hériteraient du premier Disallow ajouté.
 */
const AI_CRAWLERS = [
  'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Google-Extended',
  'OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'Googlebot', 'Bingbot',
];

// En aperçu, aucune des règles ci-dessous ne s'applique : on interdit tout.
export async function GET() {
  if (SITE.preview) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const lines = ['User-agent: *', 'Allow: /', ''];
  lines.push('# Crawlers IA — autorisation explicite pour le GEO', '');
  for (const bot of AI_CRAWLERS) lines.push(`User-agent: ${bot}`, 'Allow: /', '');
  lines.push(`Sitemap: ${new URL('/sitemap-index.xml', SITE.url).href}`, '');
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
