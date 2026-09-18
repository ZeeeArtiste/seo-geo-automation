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
1. Commence par un paragraphe de 2-3 phrases qui répond DIRECTEMENT à la question implicite du titre —
   c'est ce paragraphe que les IA génératives (ChatGPT, Perplexity) citeront. Pas d'introduction vague.
2. Structure avec des H2/H3 clairs (Markdown ##/###).
3. Contenu concret et factuel — évite les généralités creuses ("il existe de nombreuses options sur le marché").
   Si tu n'as pas de données réelles vérifiées (prix, specs precises), utilise des exemples marqués
   [À VÉRIFIER: prix/specs] plutôt que d'inventer des chiffres précis présentés comme certains.
4. Termine par une section FAQ de 4-5 questions/réponses courtes et directes.
5. Intègre les liens affiliés fournis SEULEMENT s'ils sont pertinents pour cet article, en Markdown,
   de façon naturelle dans le texte (pas de liste de liens forcée).
6. Ton: expert mais accessible, pas de superlatifs marketing creux ("incroyable", "révolutionnaire").
7. Longueur: 700-1000 mots.

${linksContext}

Réponds UNIQUEMENT en JSON avec cette structure exacte:
{
  "metaDescription": "150-160 caractères pour la balise meta description",
  "directAnswer": "le paragraphe de réponse directe (identique au premier paragraphe de l'article)",
  "bodyMarkdown": "le corps de l'article en Markdown, SANS la FAQ",
  "faq": [{"question": "...", "answer": "..."}]
}`
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

  for (const [i, titleObj] of titles.entries()) {
    console.log(`[${i + 1}/${titles.length}] Génération: ${titleObj.title}`);
    const article = await generateArticle(niche, titleObj, affiliateLinks);
    const slug = titleObj.slug || slugify(titleObj.title, { lower: true, strict: true });

    const frontmatter = `---
title: "${titleObj.title.replace(/"/g, '\\"')}"
description: "${article.metaDescription.replace(/"/g, '\\"')}"
publishDate: "${new Date().toISOString().split('T')[0]}"
directAnswer: "${article.directAnswer.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
faq: ${JSON.stringify(article.faq)}
---

${article.bodyMarkdown}
`;
    await fs.writeFile(path.join(articlesDir, `${slug}.md`), frontmatter, 'utf-8');
  }

  console.log(`\n✅ ${titles.length} articles générés dans ${articlesDir}\n`);
  console.log('⚠️  Relisez le contenu avant publication — vérifiez les [À VÉRIFIER] et la véracité des affirmations.\n');
  console.log('Prochaine étape:');
  console.log(`  node scripts/build-deploy.js --site ${siteDir}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
