/**
 * robots.txt généré au build.
 *
 * Il était statique et déclarait `Sitemap: https://example.com/...` — un reste
 * de gabarit jamais substitué, qui rendait le sitemap introuvable par cette
 * voie. Le générer depuis SITE.url supprime la classe entière du problème :
 * la directive suit le domaine, y compris s'il change.
 */
import { SITE } from '../lib/site';

const AI_CRAWLERS = ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'];

export async function GET() {
  const lines = ['User-agent: *', 'Allow: /', ''];
  lines.push('# Crawlers IA — autorisation explicite pour le GEO', '');
  for (const bot of AI_CRAWLERS) lines.push(`User-agent: ${bot}`, 'Allow: /', '');
  lines.push(`Sitemap: ${new URL('/sitemap-index.xml', SITE.url).href}`, '');
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
