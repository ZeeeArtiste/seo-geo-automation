#!/usr/bin/env node
/**
 * Génère des liens trackés Awin et les ajoute à config/affiliate-links.json.
 *
 * Format Awin :
 *   https://www.awin1.com/cread.php?awinmid=<annonceur>&awinaffid=<éditeur>
 *                                   &clickref=<étiquette>&ued=<url encodée>
 *
 * `clickref` est l'atout d'Awin sur Amazon : il permet de savoir DEPUIS QUELLE
 * PAGE le clic est parti, sans avoir à créer un identifiant de suivi par
 * article. On y met donc le slug de l'article.
 *
 * ⚠️ Un lien ne rapporte que si vous êtes VALIDÉ par l'annonceur concerné.
 * Awin accepte le compte, chaque annonceur approuve séparément.
 *
 * Usage:
 *   node scripts/make-awin-links.js --advertiser 1234 --name "Darty" \
 *     --url "https://www.darty.com/nav/achat/..." --clickref "comparatif-robots"
 *
 *   node scripts/make-awin-links.js --from produits.json      # traitement par lot
 */
import 'dotenv/config';
import fs from 'fs-extra';
import path from 'path';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2), {
  string: ['advertiser', 'url', 'name', 'clickref', 'out', 'from', 'publisher'],
});

const publisher = args.publisher || process.env.AWIN_PUBLISHER_ID;
const outPath = args.out || 'config/affiliate-links.json';

if (!publisher) {
  console.error(
    "Identifiant éditeur Awin manquant.\n" +
      "Renseignez AWIN_PUBLISHER_ID dans .env, ou passez --publisher.\n" +
      "On le trouve dans Awin > Compte > Aperçu (c'est le « Publisher ID »)."
  );
  process.exit(1);
}
if (!/^\d{4,10}$/.test(publisher)) {
  console.error(`Identifiant éditeur "${publisher}" invalide — Awin utilise un nombre.`);
  process.exit(1);
}

/** Construit le lien tracké. */
export function awinLink({ advertiser, url, clickref, publisherId }) {
  const p = new URLSearchParams({ awinmid: String(advertiser), awinaffid: String(publisherId) });
  if (clickref) p.set('clickref', clickref);
  // `ued` doit être encodé : sinon les paramètres de l'URL cible sont
  // interprétés comme ceux du lien Awin et la destination est tronquée.
  return `https://www.awin1.com/cread.php?${p.toString()}&ued=${encodeURIComponent(url)}`;
}

async function main() {
  let items = [];
  if (args.from) {
    items = await fs.readJson(path.resolve(args.from));
  } else if (args.advertiser && args.url) {
    items = [{ advertiser: args.advertiser, url: args.url, name: args.name, clickref: args.clickref }];
  } else {
    console.error(
      'Rien à traiter.\n' +
        '  node scripts/make-awin-links.js --advertiser 1234 --name "Darty" --url "https://..."\n' +
        '  node scripts/make-awin-links.js --from produits.json'
    );
    process.exit(1);
  }

  const full = path.resolve(outPath);
  const existing = (await fs.pathExists(full)) ? await fs.readJson(full) : [];

  const added = [];
  for (const it of items) {
    if (!it.advertiser || !it.url) {
      console.warn(`⚠️  ignoré (advertiser ou url manquant) : ${JSON.stringify(it).slice(0, 70)}`);
      continue;
    }
    if (!/^https?:\/\//.test(it.url)) {
      console.warn(`⚠️  ignoré (url invalide) : ${it.url}`);
      continue;
    }
    const link = awinLink({
      advertiser: it.advertiser,
      url: it.url,
      clickref: it.clickref,
      publisherId: publisher,
    });
    if (existing.some((e) => e.url === link)) {
      console.log(`=  déjà présent : ${it.name ?? it.url}`);
      continue;
    }
    const entry = {
      productName: it.name ?? new URL(it.url).hostname.replace(/^www\./, ''),
      url: link,
      network: 'awin',
      advertiser: String(it.advertiser),
      target: it.url,
    };
    existing.push(entry);
    added.push(entry);
  }

  if (added.length === 0) {
    console.log('\nAucun nouveau lien.');
    return;
  }

  await fs.ensureDir(path.dirname(full));
  await fs.writeJson(full, existing, { spaces: 2 });

  console.log(`\n✅ ${added.length} lien(s) Awin ajouté(s) à ${outPath}`);
  console.log(`   Éditeur : ${publisher}\n`);
  added.forEach((e) => console.log(`   ${e.advertiser.padEnd(8)} ${e.productName}`));
  console.log(
    `\n⚠️  Un lien ne rapporte que si vous êtes validé par l'annonceur.\n` +
      `   Vérifiez l'état de chaque candidature dans Awin > Programmes.`
  );
}

main().catch((err) => {
  console.error('\nErreur:', err.message);
  process.exit(1);
});
