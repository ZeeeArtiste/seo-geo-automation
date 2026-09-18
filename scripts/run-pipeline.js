#!/usr/bin/env node
/**
 * Orchestrateur: enchaîne domaines → scaffold → contenu → build/deploy.
 *
 * Usage:
 *   node scripts/run-pipeline.js --niche "aspirateurs robots" --brand "CleanTop" \
 *     [--articles 10] [--affiliate-links config/affiliate-links.json] [--deploy]
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

if (!niche || !brand) {
  console.error('Usage: node run-pipeline.js --niche "..." --brand "NomMarque" [--articles 10] [--affiliate-links path] [--deploy]');
  process.exit(1);
}

function step(script, scriptArgs) {
  console.log(`\n\x1b[36m▶ ${script} ${scriptArgs.join(' ')}\x1b[0m`);
  execFileSync('node', [path.join(__dirname, script), ...scriptArgs], { stdio: 'inherit' });
}

const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const siteDir = `sites/${slug}`;

step('generate-domains.js', ['--niche', niche]);
step('scaffold-site.js', ['--brand', brand, '--niche', niche]);

const contentArgs = ['--site', siteDir, '--niche', niche, '--articles', String(articles)];
if (affiliateLinks) contentArgs.push('--affiliate-links', affiliateLinks);
step('generate-content.js', contentArgs);

if (shouldDeploy) {
  step('build-deploy.js', ['--site', siteDir]);
} else {
  console.log(`\nPipeline terminé (sans build/deploy). Pour builder :`);
  console.log(`  node scripts/build-deploy.js --site ${siteDir}\n`);
}
