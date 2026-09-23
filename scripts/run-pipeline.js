#!/usr/bin/env node
/**
 * Orchestrateur: enchaîne domaines → scaffold → contenu → build/deploy.
 *
 * Usage:
 *   node scripts/run-pipeline.js --niche "aspirateurs robots" --brand "CleanTop" \
 *     [--articles 10] [--affiliate-links config/affiliate-links.json] [--deploy]
 *     [--target vercel|vps] [--domain cleantop.example.com] [--author "Prénom Nom"]
 *     [--email vous@example.com] [--no-ssl] [--force-ssl]
 *
 * --target vps déploie sur ce serveur via nginx/certbot (scripts/deploy-vps.js,
 * nécessite root et --domain). Par défaut (--target vercel), utilise
 * scripts/build-deploy.js (build local, déploie si VERCEL_TOKEN est défini).
 */
import { execFileSync } from 'child_process';
import path from 'path';
import minimist from 'minimist';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = minimist(process.argv.slice(2));

const niche = args.niche;
const brand = args.brand;
const articles = args.articles || 10;
const affiliateLinks = args['affiliate-links'];
const shouldDeploy = !!args.deploy;
const target = args.target || 'vercel';
const domain = args.domain;
const email = args.email;
// cf. deploy-vps.js : minimist transforme `--no-ssl` en `{ ssl: false }`
const skipSsl = !!args['no-ssl'] || args.ssl === false;

if (!niche || !brand) {
  console.error('Usage: node run-pipeline.js --niche "..." --brand "NomMarque" [--articles 10] [--affiliate-links path] [--deploy] [--target vercel|vps] [--domain votredomaine.com] [--email vous@example.com]');
  process.exit(1);
}

if (shouldDeploy && target === 'vps' && !domain) {
  console.error('--target vps nécessite --domain votredomaine.com');
  process.exit(1);
}

function step(script, scriptArgs) {
  console.log(`\n\x1b[36m▶ ${script} ${scriptArgs.join(' ')}\x1b[0m`);
  execFileSync('node', [path.join(__dirname, script), ...scriptArgs], { stdio: 'inherit' });
}

/**
 * Étape d'habillage : vignettes, photos, image de partage, prix.
 *
 * Ces scripts produisent ce qui distingue un site fini d'un squelette. Ils
 * étaient exécutés à la main sur le premier site, donc absents de toute
 * génération suivante : un site neuf sortait sans image de partage — et donc
 * avec un og:image en 404 sur chaque lien partagé — sans vignette et sans prix.
 *
 * Aucun n'est bloquant. Il leur faut des dépendances système (Pillow) ou des
 * clés (Unsplash) qui peuvent manquer : l'absence d'illustration ne doit pas
 * faire échouer un site dont le contenu est bon.
 */
function optionalStep(interpreter, script, scriptArgs, why) {
  console.log(`\n\x1b[36m▶ ${script} ${scriptArgs.join(' ')}\x1b[0m`);
  try {
    execFileSync(interpreter, [path.join(__dirname, script), ...scriptArgs], { stdio: 'inherit' });
  } catch (e) {
    console.warn(`\x1b[33m⚠️  ${script} a échoué — ${why}. Le site reste utilisable.\x1b[0m`);
  }
}

const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const siteDir = `sites/${slug}`;

step('generate-domains.js', ['--niche', niche]);
const scaffoldArgs = ['--brand', brand, '--niche', niche];
// Le domaine et l'auteur alimentent site.ts, les mentions légales et l'image de
// partage. Les omettre produit un site à corriger à la main avant mise en ligne.
if (domain) scaffoldArgs.push('--domain', domain);
if (args.author) scaffoldArgs.push('--author', args.author);
step('scaffold-site.js', scaffoldArgs);

const contentArgs = ['--site', siteDir, '--niche', niche, '--articles', String(articles)];
if (affiliateLinks) contentArgs.push('--affiliate-links', affiliateLinks);
step('generate-content.js', contentArgs);

// ── Habillage ───────────────────────────────────────────────────────────────
optionalStep('python3', 'diagrams/covers.py', ['--site', siteDir],
  'pas de vignette en page d\'accueil');

optionalStep('python3', 'fetch-unsplash.py', ['--site', siteDir, '--brand', brand, '--auto', niche],
  'pas de photo (UNSPLASH_ACCESS_KEY manquante ?)');

if (domain) {
  optionalStep('python3', 'make-og-image.py',
    ['--site', siteDir, '--brand', brand, '--tagline', `Guides et comparatifs : ${niche}`,
     '--domain', domain, '--articles'],
    'pas d\'image de partage (python3-pil installé ?)');
} else {
  console.warn("\n\x1b[33m⚠️  Sans --domain, l'image de partage n'est pas générée : og:image renverra un 404.\x1b[0m");
}

// Les prix ne sont relevés que si le site déclare des boutiques exploitables
// dans config/price-stores.json. Sans elles, le script ne fait rien et le dit.
optionalStep('python3', 'fetch-prices.py', ['--site', siteDir, '--update'],
  'pas de prix relevé');

if (shouldDeploy && target === 'vps') {
  const deployArgs = ['--site', siteDir, '--domain', domain];
  if (email) deployArgs.push('--email', email);
  if (skipSsl) deployArgs.push('--no-ssl');
  step('deploy-vps.js', deployArgs);
} else if (shouldDeploy) {
  step('build-deploy.js', ['--site', siteDir]);
} else {
  console.log(`\nPipeline terminé (sans build/deploy). Pour builder :`);
  console.log(`  node scripts/build-deploy.js --site ${siteDir}`);
  console.log(`  # ou, sur un VPS déjà préparé (voir scripts/vps-bootstrap.sh):`);
  console.log(`  node scripts/deploy-vps.js --site ${siteDir} --domain votredomaine.com\n`);
}
