#!/usr/bin/env node
/**
 * Copie le template Astro vers sites/<brand>/ et personnalise
 * les fichiers de config (nom, niche) via remplacement de tokens.
 *
 * Usage: node scripts/scaffold-site.js --brand "CleanTop" --niche "aspirateurs robots"
 */
import fs from 'fs-extra';
import path from 'path';
import minimist from 'minimist';
import slugify from 'slugify';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = minimist(process.argv.slice(2));
const brand = args.brand;
const niche = args.niche;

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
  const tokens = { '{{BRAND}}': brand, '{{NICHE}}': niche, '{{SLUG}}': slug };
  await replaceTokensInDir(targetDir, tokens);

  console.log(`\n✅ Site créé dans sites/${slug}/`);
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
    } else if (/\.(astro|js|mjs|json|md|txt|html)$/.test(entry.name)) {
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
