#!/usr/bin/env node
/**
 * Rassemble les flux des sites du réseau pour le hub.
 *
 * Le hub ne connaît pas les sites : il connaît config/network.json. Ajouter un
 * site de niche au réseau, c'est ajouter une ligne — le recensement suit au
 * prochain build, sans toucher au code du hub.
 *
 * Deux sources par site, dans cet ordre :
 *   · le flux HTTP /index.json du site déployé — la vérité de ce qui est en ligne ;
 *   · le dossier local, si le flux ne répond pas : un site tout juste généré
 *     n'est pas encore déployé, et le hub doit pouvoir être construit quand même.
 *
 * L'historique de prix, lui, est toujours lu en local : c'est une série que ce
 * dépôt accumule, pas quelque chose que le site publie.
 *
 * Usage:
 *   node scripts/collect-network.js [--config config/network.json] [--out hub/src/data/network.json]
 */
import fs from 'fs-extra';
import path from 'path';
import minimist from 'minimist';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const args = minimist(process.argv.slice(2));
const configPath = path.resolve(root, args.config ?? 'config/network.json');
const outPath = path.resolve(root, args.out ?? 'hub/src/data/network.json');

async function fromHttp(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Reconstitue le flux depuis les fichiers du site, quand il n'est pas déployé.
 * On relit le frontmatter plutôt que d'exécuter Astro : le hub doit pouvoir se
 * construire sans builder chacun des sites du réseau.
 */
async function fromLocal(dir) {
  const site = path.resolve(root, dir);
  const conf = await fs.readFile(path.join(site, 'src/lib/site.ts'), 'utf-8');
  const field = (k) => conf.match(new RegExp(`${k}:\\s*['"\`](.+?)['"\`]`))?.[1] ?? '';
  const url = field('url') || `https://${field('domain')}`;

  const dirArticles = path.join(site, 'src/content/articles');
  const files = (await fs.pathExists(dirArticles)) ? await fs.readdir(dirArticles) : [];
  const articles = [];
  for (const f of files.filter((f) => f.endsWith('.md'))) {
    const raw = await fs.readFile(path.join(dirArticles, f), 'utf-8');
    const fm = raw.split('\n---')[0].replace(/^---\n/, '');
    if (/^draft:\s*true/m.test(fm)) continue;
    const str = (k) => fm.match(new RegExp(`^${k}:\\s*"(.*?)"\\s*$`, 'm'))?.[1];
    const json = (k) => {
      const m = fm.match(new RegExp(`^${k}:\\s*(\\{.*\\})\\s*$`, 'm'));
      try { return m ? JSON.parse(m[1]) : undefined; } catch { return undefined; }
    };
    const slug = f.replace(/\.md$/, '');
    articles.push({
      slug,
      url: `${url}/articles/${slug}/`,
      title: str('title'),
      description: str('description'),
      directAnswer: str('directAnswer'),
      category: str('category') ?? 'Guide',
      cluster: str('cluster'),
      usecase: json('usecase'),
      publishDate: str('publishDate'),
      updatedDate: str('updatedDate') ?? str('publishDate'),
      // Les produits vivent en YAML multiligne : les relire correctement
      // demanderait un vrai parseur. Le flux HTTP les porte déjà, et c'est lui
      // qui fait foi dès que le site est en ligne.
      products: [],
    });
  }
  return {
    feedVersion: 1,
    site: { brand: field('brand'), niche: field('niche'), url, tagline: field('tagline'),
            description: field('description'), lang: field('lang') || 'fr' },
    articles,
    _source: 'local',
  };
}

async function history(dir) {
  if (!dir) return [];
  const f = path.resolve(root, dir, 'price-history.jsonl');
  if (!(await fs.pathExists(f))) return [];
  return (await fs.readFile(f, 'utf-8'))
    .split('\n')
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

async function main() {
  const { sites } = await fs.readJson(configPath);
  const out = { generatedAt: new Date().toISOString().slice(0, 10), sites: [], observations: [] };

  for (const entry of sites) {
    let feed = null;
    let source = 'flux';
    try {
      feed = await fromHttp(entry.feed);
    } catch (e) {
      if (!entry.local) {
        console.warn(`⚠️  ${entry.brand} : flux injoignable (${e.message}), aucune source locale — site ignoré.`);
        continue;
      }
      console.warn(`⚠️  ${entry.brand} : flux injoignable (${e.message}), lecture locale.`);
      feed = await fromLocal(entry.local);
      source = 'local';
    }

    const obs = await history(entry.local);
    out.sites.push({ ...feed.site, source, articles: feed.articles });
    for (const o of obs) out.observations.push({ ...o, brand: feed.site.brand, siteUrl: feed.site.url });
    console.log(`✅ ${feed.site.brand} — ${feed.articles.length} article(s), ${obs.length} observation(s) de prix (${source})`);
  }

  const nbArticles = out.sites.reduce((n, s) => n + s.articles.length, 0);
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeJson(outPath, out, { spaces: 2 });
  console.log(`\n${out.sites.length} site(s) · ${nbArticles} article(s) · ${out.observations.length} observation(s)`);
  console.log(`→ ${path.relative(root, outPath)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
