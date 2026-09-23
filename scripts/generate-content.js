#!/usr/bin/env node
/**
 * Génère N articles pour un site, optimisés SEO + GEO :
 * - réponse directe en début d'article (ce que les IA génératives citent)
 * - FAQ balisée en JSON-LD (FAQPage)
 * - liens affiliés injectés depuis un fichier de config + disclosure automatique
 *
 * Usage:
 *   node scripts/generate-content.js --site sites/cleantop --niche "aspirateurs robots" \
 *     --articles 10 --affiliate-links config/affiliate-links.json
 */
import 'dotenv/config';
import fs from 'fs-extra';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import minimist from 'minimist';
import slugify from 'slugify';

const args = minimist(process.argv.slice(2));
const siteDir = args.site;
const niche = args.niche;
const count = parseInt(args.articles || '5', 10);
const affiliateLinksPath = args['affiliate-links'];

if (!siteDir || !niche) {
  console.error('Usage: node generate-content.js --site sites/xxx --niche "..." [--articles 10] [--affiliate-links config/affiliate-links.json]');
  process.exit(1);
}

const client = new Anthropic();

async function loadAffiliateLinks() {
  if (!affiliateLinksPath) return [];
  const full = path.resolve(affiliateLinksPath);
  if (!(await fs.pathExists(full))) {
    console.warn(`⚠️  Fichier de liens affiliés introuvable: ${full} — génération sans liens.`);
    return [];
  }
  return fs.readJson(full);
}

// Génère des titres d'articles distincts (angles variés) pour éviter le
// contenu quasi-dupliqué qui déclenche les pénalités "contenu de faible valeur"
async function generateTitles(niche, count) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Pour un site comparateur/guide d'achat sur la niche "${niche}", propose ${count} titres
d'articles avec des ANGLES RÉELLEMENT DIFFÉRENTS (pas de variations mineures du même sujet) :
mélange de guides comparatifs, tests approfondis d'un produit, articles "par cas d'usage"
(ex: pour petit appartement, pour animaux), articles pédagogiques (comment choisir, erreurs à éviter),
et un article "actualité/tendance" si pertinent.

Réponds UNIQUEMENT en JSON : [{"title": "...", "angle": "comparatif|test|usage|pedagogique|actualite", "slug": "..."}]`
    }]
  });
  const text = msg.content.find(b => b.type === 'text')?.text ?? '[]';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

async function generateArticle(niche, titleObj, affiliateLinks) {
  const linksContext = affiliateLinks.length
    ? `Liens affiliés disponibles à intégrer NATURELLEMENT là où c'est pertinent (ne pas forcer, ne pas tous les utiliser si non pertinents) :\n${affiliateLinks.map(l => `- ${l.productName}: ${l.url}`).join('\n')}`
    : 'Aucun lien affilié fourni — écris l\'article sans lien produit spécifique.';

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Écris un article de blog en français pour un site sur "${niche}".
Titre: "${titleObj.title}" (angle: ${titleObj.angle})

RÈGLES D'ÉCRITURE (important, à respecter strictement) :
1. Commence par un paragraphe de 40 à 60 MOTS qui répond DIRECTEMENT à la question implicite du
   titre. C'est ce paragraphe que les IA génératives citent et que Google reprend en extrait
   enrichi — au-delà de 60 mots il est tronqué. Pas d'introduction vague.
2. Structure avec des H2/H3 clairs (Markdown ##/###). Formule AU MOINS LA MOITIÉ des H2 sous
   forme de question, telle qu'un lecteur la taperait dans un moteur : « Que voit réellement un
   LiDAR ? » plutôt que « Ce que le LiDAR voit ». C'est ce qui rend la section éligible aux
   extraits enrichis et aux réponses vocales.
3. Contenu concret et factuel — évite les généralités creuses ("il existe de nombreuses options sur le marché").
   Si tu n'as pas de données réelles vérifiées (prix, specs precises), utilise des exemples marqués
   [À VÉRIFIER: prix/specs] plutôt que d'inventer des chiffres précis présentés comme certains.
4. Termine par une section FAQ de 4-5 questions/réponses courtes et directes.
5. N'insère AUCUN lien affilié dans bodyMarkdown. Les produits sont renvoyés séparément
   dans le champ "products" ci-dessous : le site en fait des fiches et un tableau comparatif.
   Ne rédige pas non plus de sous-sections "### 1. Modèle" décrivant chaque produit —
   elles feraient doublon avec ces fiches.
6. Ton: expert mais accessible, pas de superlatifs marketing creux ("incroyable", "révolutionnaire").
7. Longueur: 700-1000 mots.

${linksContext}

Réponds UNIQUEMENT en JSON avec cette structure exacte:
{
  "metaDescription": "150-160 caractères pour la balise meta description",
  "seoTitle": "titre COURT pour la balise <title> : 45 caractères MAXIMUM, mots-clés en tête. Le titre éditorial long reste en H1 ; celui-ci doit tenir dans les ~60 caractères affichés par Google, suffixe de marque compris.",
  "directAnswer": "le paragraphe de réponse directe, 40 à 60 mots (identique au premier paragraphe de l'article)",
  "bodyMarkdown": "le corps de l'article en Markdown, SANS la FAQ et SANS fiches produit",
  "products": [
    {
      "name": "nom exact du produit, tel qu'il figure dans la liste de liens fournie",
      "summary": "2 phrases sur ce qui distingue ce modèle",
      "pros": ["2 points forts maximum"],
      "cons": ["1 réserve honnête, ou [] si aucune ne peut être étayée"],
      "attrs": { "Critère": "valeur courte" }
    }
  ],
  "faq": [{"question": "...", "answer": "..."}]
}

CONTRAINTES SUR "products" :
- UNIQUEMENT des produits de la liste de liens affiliés fournie. Liste vide si aucun lien n'est fourni.
- "attrs" : choisis TOI-MÊME 3 à 4 critères pertinents pour la niche "${niche}". Ce sont les
  critères qui font réellement diverger deux modèles de cette catégorie, et sur lesquels un
  acheteur doit trancher. N'utilise pas de critères d'une autre catégorie de produit.
- Ces critères doivent être STRUCTURELS et vérifiables sur une fiche produit : un type, une
  technologie, une présence ou une absence. JAMAIS de valeur chiffrée invérifiable — pas de
  prix, pas de mesure de performance, pas d'autonomie en minutes, pas de note sur 10. Ces
  valeurs périment ou sont invérifiables, et ne doivent jamais être inventées.
- Les valeurs sont COURTES : 1 à 4 mots. Elles remplissent des cellules de tableau.
- Utilise EXACTEMENT les mêmes clés pour tous les produits de l'article : elles deviennent les
  colonnes du tableau comparatif. Si un produit n'a pas l'information, mets la chaîne vide.`
    }]
  });

  const text = msg.content.find(b => b.type === 'text')?.text ?? '{}';
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

async function main() {
  const affiliateLinks = await loadAffiliateLinks();
  console.log(`Génération de ${count} titres d'articles pour "${niche}"...`);
  const titles = await generateTitles(niche, count);

  const articlesDir = path.join(path.resolve(siteDir), 'src', 'content', 'articles');
  await fs.ensureDir(articlesDir);

  let draftCount = 0;
  for (const [i, titleObj] of titles.entries()) {
    console.log(`[${i + 1}/${titles.length}] Génération: ${titleObj.title}`);
    const article = await generateArticle(niche, titleObj, affiliateLinks);
    const slug = titleObj.slug || slugify(titleObj.title, { lower: true, strict: true });

    // Claude laisse parfois un titre "## FAQ" en fin de corps alors que la FAQ
    // est renvoyée séparément et rendue par le gabarit : ce titre vide polluait
    // le sommaire et dupliquait la section. On le retire.
    if (article.bodyMarkdown) {
      article.bodyMarkdown = article.bodyMarkdown
        .replace(/\n+(---\s*\n+)?##+\s*(FAQ|Questions fréquentes)\s*\n*\s*$/i, '\n')
        .trimEnd();
    }

    // Un article contenant des marqueurs [À VÉRIFIER] embarque des données non
    // vérifiées. Sans garde-fou, ces marqueurs finissent rendus tels quels sur la
    // page publique. On le publie donc en draft : invisible sur le site et absent
    // du sitemap jusqu'à relecture humaine.
    const rawText = `${article.bodyMarkdown ?? ''} ${JSON.stringify(article.faq ?? [])}`;
    const markers = (rawText.match(/\[À VÉRIFIER/g) ?? []).length;
    const isDraft = markers > 0;

    // La divulgation d'affiliation ne doit s'afficher que si un lien affilié est
    // RÉELLEMENT présent. Claude reçoit pour consigne de n'intégrer les liens que
    // s'ils sont pertinents : il peut donc n'en placer aucun. Annoncer des liens
    // affiliés inexistants serait une affirmation fausse.
    // On rattache chaque produit renvoyé à son lien affilié, par correspondance
    // de nom. Un produit que Claude aurait inventé — donc absent de la liste
    // fournie — est écarté plutôt que publié sans lien.
    const norm = (x) => x.toLowerCase().replace(/[^a-z0-9]+/g, '');
    // Tous les liens fournis ne sont pas rémunérés. Un lien vers la boutique
    // du fabricant sert à sourcer une caractéristique, pas à gagner une
    // commission : le marquer « sponsored » et annoncer une rémunération
    // au-dessus de lui serait une déclaration fausse. On distingue donc les
    // deux ici, à la source, plutôt que dans le gabarit.
    const isPaidLink = (l) => l.affiliate !== false && l.network !== 'fabricant';
    const products = (article.products ?? [])
      .map((p) => {
        const link = affiliateLinks.find(
          (l) => norm(l.productName).includes(norm(p.name)) || norm(p.name).includes(norm(l.productName))
        );
        if (!link) return null;
        return {
          name: p.name,
          summary: p.summary ?? '',
          url: link.url,
          pros: (p.pros ?? []).slice(0, 3),
          cons: (p.cons ?? []).slice(0, 2),
          attrs: p.attrs ?? {},
          affiliate: isPaidLink(link),
        };
      })
      .filter(Boolean);

    // Les colonnes du tableau sont l'union des clés : si le modèle varie ses
    // intitulés d'un produit à l'autre, le tableau se remplit de cellules vides.
    // On ne garde donc que les critères présents sur la majorité des produits,
    // plafonnés à 4 — au-delà, la table déborde sur mobile.
    if (products.length > 1) {
      const freq = new Map();
      for (const p of products) {
        for (const k of Object.keys(p.attrs)) freq.set(k, (freq.get(k) ?? 0) + 1);
      }
      const keep = [...freq.entries()]
        .filter(([, n]) => n >= Math.ceil(products.length / 2))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k]) => k);
      const droppedCols = [...freq.keys()].filter((k) => !keep.includes(k));
      for (const p of products) {
        p.attrs = Object.fromEntries(
          keep.map((k) => [k, (p.attrs[k] ?? '').toString().trim()]).filter(([, v]) => v !== '')
        );
      }
      if (droppedCols.length) {
        console.log(`    ↳ colonnes écartées (trop rares ou trop nombreuses) : ${droppedCols.join(', ')}`);
      }
      if (keep.length) {
        console.log(`    ↳ tableau comparatif : ${keep.join(' · ')}`);
      }
    }

    const dropped = (article.products ?? []).length - products.length;
    if (dropped > 0) {
      console.log(`    ↳ ${dropped} produit(s) écarté(s) : aucun lien affilié correspondant`);
    }

    // La divulgation ne s'affiche que si un lien RÉMUNÉRÉ est réellement
    // présent — en fiche produit ou dans le corps du texte. Compter les fiches
    // suffisait tant que tous les liens étaient affiliés ; depuis qu'ils
    // peuvent pointer vers une boutique de fabricant, il faut vérifier les
    // deux emplacements, sous peine d'annoncer une commission inexistante.
    const paidUrls = affiliateLinks.filter(isPaidLink).map((l) => l.url);
    const bodyHasPaidLink = paidUrls.some((u) => (article.bodyMarkdown ?? '').includes(u));
    const usedAffiliate = bodyHasPaidLink || products.some((p) => p.affiliate);
    if (affiliateLinks.length > 0 && !usedAffiliate) {
      console.log(`    ↳ aucun lien rémunéré placé → pas de divulgation sur cet article`);
    }
    if (isDraft) {
      draftCount++;
      console.log(`    ↳ ${markers} marqueur(s) [À VÉRIFIER] → publié en draft (non visible)`);
    }

    const frontmatter = `---
title: "${titleObj.title.replace(/"/g, '\\"')}"
seoTitle: "${(article.seoTitle ?? titleObj.title).slice(0, 60).replace(/"/g, '\\"')}"
description: "${article.metaDescription.replace(/"/g, '\\"')}"
publishDate: "${new Date().toISOString().split('T')[0]}"
directAnswer: "${article.directAnswer.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
draft: ${isDraft}
affiliate: ${usedAffiliate}
products: ${JSON.stringify(products)}
faq: ${JSON.stringify(article.faq)}
---

${article.bodyMarkdown}
`;
    await fs.writeFile(path.join(articlesDir, `${slug}.md`), frontmatter, 'utf-8');
  }

  console.log(`\n✅ ${titles.length} articles générés dans ${articlesDir}\n`);
  if (draftCount > 0) {
    console.log(
      `⚠️  ${draftCount}/${titles.length} article(s) mis en draft car ils contiennent des données\n` +
      `   non vérifiées. Ils ne sont NI listés, NI rendus, NI dans le sitemap.\n` +
      `   Pour les publier : vérifiez chaque [À VÉRIFIER], remplacez-le par la donnée\n` +
      `   réelle, puis passez draft: false dans le frontmatter.\n`
    );
  }
  console.log('⚠️  Relisez le contenu avant publication — vérifiez la véracité des affirmations.\n');
  console.log('Prochaine étape:');
  console.log(`  node scripts/build-deploy.js --site ${siteDir}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
