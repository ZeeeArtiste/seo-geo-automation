#!/usr/bin/env node
/**
 * Build le site Astro. Déploie sur Vercel si VERCEL_TOKEN est défini,
 * sinon laisse juste le build local dans <site>/dist.
 *
 * Usage: node scripts/build-deploy.js --site sites/cleantop
 */
import 'dotenv/config';
import { execSync } from 'child_process';
import path from 'path';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const siteDir = args.site;

if (!siteDir) {
  console.error('Usage: node build-deploy.js --site sites/xxx');
  process.exit(1);
}

const fullSitePath = path.resolve(siteDir);

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

async function main() {
  run('npm install', fullSitePath);
  run('npm run build', fullSitePath);

  if (process.env.VERCEL_TOKEN) {
    console.log('\nVERCEL_TOKEN détecté — déploiement...');
    try {
      run(`npx vercel deploy --prod --yes --token ${process.env.VERCEL_TOKEN}`, fullSitePath);
    } catch (e) {
      console.error('Le déploiement Vercel a échoué. Vérifiez votre token et que "vercel" est installable dans cet environnement réseau.');
    }
  } else {
    console.log('\nPas de VERCEL_TOKEN — build local uniquement.');
    console.log(`Site buildé dans ${path.join(fullSitePath, 'dist')}`);
    console.log('Pour déployer manuellement: connectez le dossier à Vercel/Netlify/Cloudflare Pages.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
