#!/usr/bin/env node
/**
 * Copie le template Astro vers sites/<brand>/ et personnalise
 * les fichiers de config (nom, niche) via remplacement de tokens.
 *
 * Usage:
 *   node scripts/scaffold-site.js --brand "CleanTop" --niche "aspirateurs robots" \
 *     [--domain aspirob.com] [--author "Prénom Nom"]
 *
 * --domain et --author alimentent src/lib/site.ts et les mentions légales
 * (obligatoires en France). Sans eux, des valeurs d'attente sont posées et
 * doivent être corrigées avant mise en ligne.
 */
import fs from 'fs-extra';
import { execFileSync } from 'child_process';
import path from 'path';
import minimist from 'minimist';
import slugify from 'slugify';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = minimist(process.argv.slice(2));
const brand = args.brand;
const niche = args.niche;
const domain = args.domain || 'example.com';
const author = args.author || 'À COMPLÉTER';

if (!brand || !niche) {
  console.error('Usage: node scaffold-site.js --brand "NomMarque" --niche "votre niche"');
  process.exit(1);
}

const slug = slugify(brand, { lower: true, strict: true });
const targetDir = path.join(ROOT, 'sites', slug);
const templateDir = path.join(ROOT, 'template');

async function main() {
  if (await fs.pathExists(targetDir)) {
    console.error(`Le dossier sites/${slug} existe déjà.`);
    process.exit(1);
  }

  await fs.copy(templateDir, targetDir);

  // Remplacement des tokens {{BRAND}} et {{NICHE}} dans tous les fichiers texte
  const tokens = {
    '{{BRAND}}': brand,
    '{{NICHE}}': niche,
    '{{SLUG}}': slug,
    '{{DOMAIN}}': domain,
    '{{AUTHOR}}': author,
  };
  await replaceTokensInDir(targetDir, tokens);

  // L'image de partage porte le nom de la marque : elle doit être regénérée
  // pour chaque site, sinon les liens partagés affichent la mauvaise marque.
  try {
    execFileSync('python3', [
      path.join(__dirname, 'make-og-image.py'),
      '--site', path.join('sites', slug),
      '--brand', brand,
      '--tagline', `${niche} : guides et comparatifs`,
      '--domain', domain,
    ], { stdio: 'inherit', cwd: ROOT });
  } catch (e) {
    console.warn(
      `\n⚠️  Image de partage non générée (python3 + Pillow requis).\n` +
      `   Installez : apt-get install -y python3-pil python3-fonttools python3-brotli\n` +
      `   Puis : python3 scripts/make-og-image.py --site sites/${slug} --brand "${brand}" \\\n` +
      `            --tagline "Guides et comparatifs — ${niche}" --domain ${domain}`
    );
  }

  console.log(`\n✅ Site créé dans sites/${slug}/`);
  if (author === 'À COMPLÉTER' || domain === 'example.com') {
    console.log(
      `\n⚠️  À corriger dans sites/${slug}/src/lib/site.ts avant mise en ligne :` +
      (domain === 'example.com' ? `\n   · domain / url (actuellement example.com)` : '') +
      (author === 'À COMPLÉTER' ? `\n   · nom de l'éditeur — obligatoire dans les mentions légales` : '') +
      `\n   · editorAddress — adresse postale de l'éditeur (LCEN art. 6 III)`
    );
  }

  console.log(`Prochaine étape :`);
  console.log(`  node scripts/generate-content.js --site sites/${slug} --niche "${niche}" --articles 10\n`);
}

async function replaceTokensInDir(dir, tokens) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      await replaceTokensInDir(full, tokens);
    } else if (/\.(astro|ts|js|mjs|json|md|txt|html|css)$/.test(entry.name)) {
      let content = await fs.readFile(full, 'utf-8');
      for (const [token, value] of Object.entries(tokens)) {
        content = content.split(token).join(value);
      }
      await fs.writeFile(full, content, 'utf-8');
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
