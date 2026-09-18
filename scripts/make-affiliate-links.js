#!/usr/bin/env node
/**
 * Génère config/affiliate-links.json à partir d'URLs produit Amazon.
 *
 * Colle simplement les URLs depuis ton navigateur : le script en extrait l'ASIN,
 * reconstruit un lien propre `amazon.<tld>/dp/<ASIN>?tag=<ton-tag>` et devine le
 * nom du produit depuis le slug de l'URL (modifiable ensuite dans le JSON).
 *
 * Le tag est lu depuis AMAZON_ASSOCIATE_TAG (.env) ou passé via --tag.
 *
 * Usage:
 *   node scripts/make-affiliate-links.js --url "https://www.amazon.fr/.../dp/B0XXXXXXXX" \
 *                                        --url "https://amzn.eu/d/..."
 *   node scripts/make-affiliate-links.js --asin B0XXXXXXXX --asin B0YYYYYYYY
 *   node scripts/make-affiliate-links.js --from urls.txt        # une URL par ligne
 *   node scripts/make-affiliate-links.js --url "..." --name "Roborock S8 Pro Ultra"
 *   node scripts/make-affiliate-links.js ... --out config/affiliate-links.json
 *   node scripts/make-affiliate-links.js --domain www.amazon.co.uk --url "..."
 *
 * ⚠️  Le tag et la boutique doivent correspondre. Les locales .co.uk, .fr, .de, .it
 * et .es partagent le suffixe -21 : la boutique n'est donc PAS déductible du tag,
 * elle vient de AMAZON_ASSOCIATE_DOMAIN ou de --domain. Un tag .co.uk posé sur un
 * lien amazon.fr ne génère aucune commission.
 *
 * ⚠️  Les liens raccourcis (amzn.to, amzn.eu) ne contiennent PAS l'ASIN : le script
 * les signale et les ignore. Ouvre-les dans le navigateur et copie l'URL longue.
 */
import 'dotenv/config';
import fs from 'fs-extra';
import path from 'path';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2), {
  string: ['url', 'asin', 'name', 'tag', 'out', 'from', 'domain'],
});

const tag = args.tag || process.env.AMAZON_ASSOCIATE_TAG;
const outPath = args.out || 'config/affiliate-links.json';
// La boutique n'est PAS déductible du tag : plusieurs locales européennes
// partagent le suffixe -21 (.co.uk, .fr, .de, .it, .es). Elle doit donc être
// déclarée explicitement, sinon on produit des liens qui ne créditent rien.
const domain = args.domain || process.env.AMAZON_ASSOCIATE_DOMAIN;

const asArray = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

if (!tag) {
  console.error(
    'Tag Partenaires manquant. Renseignez AMAZON_ASSOCIATE_TAG dans .env, ou passez --tag monsite-21.'
  );
  process.exit(1);
}
if (!domain) {
  console.error(
    'Boutique Amazon non précisée. Renseignez AMAZON_ASSOCIATE_DOMAIN dans .env\n' +
      '(ex: www.amazon.co.uk, www.amazon.fr) ou passez --domain.\n\n' +
      "Elle n'est pas déductible du tag : .co.uk, .fr, .de, .it et .es utilisent tous\n" +
      'le suffixe -21. Un tag associé à une autre boutique ne génère aucune commission.'
  );
  process.exit(1);
}
if (!/^www\.amazon\.[a-z.]{2,6}$/.test(domain)) {
  console.error(`Domaine "${domain}" inattendu — format attendu: www.amazon.fr, www.amazon.co.uk…`);
  process.exit(1);
}
if (!/^[A-Za-z0-9._-]{3,30}-\d{2}$/.test(tag)) {
  console.error(
    `Tag "${tag}" au format inattendu — un tag Partenaires ressemble à "monsite-21".\n` +
      'Vérifiez-le : un tag erroné produit des liens qui ne vous créditent pas.'
  );
  process.exit(1);
}

/** Extrait l'ASIN d'une URL produit Amazon. Renvoie null si introuvable. */
export function extractAsin(url) {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /[?&]asin=([A-Z0-9]{10})(?:&|$)/i,
    /\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

/** Déduit un nom lisible depuis le slug de l'URL Amazon. */
export function nameFromUrl(url) {
  const m = url.match(/amazon\.[a-z.]+\/([^/]+)\/dp\//i);
  if (!m) return null;
  const slug = decodeURIComponent(m[1]).replace(/-/g, ' ').trim();
  if (!slug || /^(dp|gp|s)$/i.test(slug) || slug.length < 3) return null;
  return slug.replace(/\s+/g, ' ').slice(0, 90);
}

function isShortened(url) {
  return /(amzn\.to|amzn\.eu|a\.co)\//i.test(url);
}

async function main() {
  let urls = asArray(args.url);
  if (args.from) {
    const raw = await fs.readFile(path.resolve(args.from), 'utf-8');
    urls = urls.concat(raw.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')));
  }
  const asins = asArray(args.asin).map((a) => a.toUpperCase());
  const names = asArray(args.name);

  if (urls.length === 0 && asins.length === 0) {
    console.error(
      'Rien à traiter. Fournissez --url (répétable), --asin, ou --from fichier.txt\n' +
        'Exemple: node scripts/make-affiliate-links.js --url "https://www.amazon.fr/.../dp/B0XXXXXXXX"'
    );
    process.exit(1);
  }

  const entries = [];
  const skipped = [];

  urls.forEach((url, i) => {
    if (isShortened(url)) {
      skipped.push({ url, reason: "lien raccourci : ne contient pas l'ASIN" });
      return;
    }
    const asin = extractAsin(url);
    if (!asin) {
      skipped.push({ url, reason: 'ASIN introuvable dans l\'URL' });
      return;
    }
    entries.push({
      productName: names[i] || nameFromUrl(url) || `Produit ${asin}`,
      url: `https://${domain}/dp/${asin}?tag=${tag}`,
      network: 'amazon',
      asin,
      nameGuessed: !names[i],
    });
  });

  asins.forEach((asin) => {
    if (!/^[A-Z0-9]{10}$/.test(asin)) {
      skipped.push({ url: asin, reason: 'ASIN invalide (10 caractères alphanumériques attendus)' });
      return;
    }
    entries.push({
      productName: `Produit ${asin}`,
      url: `https://${domain}/dp/${asin}?tag=${tag}`,
      network: 'amazon',
      asin,
      nameGuessed: true,
    });
  });

  // Déduplication par ASIN
  const seen = new Set();
  const unique = entries.filter((e) => (seen.has(e.asin) ? false : seen.add(e.asin)));
  const dupes = entries.length - unique.length;

  if (unique.length === 0) {
    console.error('\n❌ Aucun lien exploitable.');
    skipped.forEach((s) => console.error(`   · ${s.reason} → ${s.url.slice(0, 80)}`));
    process.exit(1);
  }

  const payload = unique.map(({ nameGuessed, ...rest }) => rest);
  const full = path.resolve(outPath);
  await fs.ensureDir(path.dirname(full));
  await fs.writeJson(full, payload, { spaces: 2 });

  console.log(`\n✅ ${unique.length} lien(s) écrit(s) dans ${outPath}`);
  console.log(`   Boutique : ${domain}   Tag : ${tag}\n`);
  unique.forEach((e) => {
    console.log(`   ${e.asin}  ${e.productName}${e.nameGuessed ? '  ⚠️ nom deviné' : ''}`);
  });
  if (dupes > 0) console.log(`\n   ${dupes} doublon(s) d'ASIN ignoré(s).`);
  if (skipped.length) {
    console.log('\n⚠️  Ignorés :');
    skipped.forEach((s) => console.log(`   · ${s.reason}\n     ${s.url.slice(0, 90)}`));
  }
  if (unique.some((e) => e.nameGuessed)) {
    console.log(
      `\n⚠️  Certains noms sont déduits du slug de l'URL et peuvent être approximatifs.\n` +
        `   Relisez "productName" dans ${outPath} : ce nom apparaîtra dans les articles.`
    );
  }
  console.log(`\nEnsuite, pour injecter les liens dans le contenu :`);
  console.log(
    `  node scripts/generate-content.js --site sites/cleantop --niche "aspirateurs robots" \\\n` +
      `    --articles 3 --affiliate-links ${outPath}\n`
  );
}

main().catch((err) => {
  console.error('\nErreur:', err.message);
  process.exit(1);
});
