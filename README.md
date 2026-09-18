# SEO/GEO Affiliate Site Automation

Pipeline qui génère des sites d'affiliation statiques (Astro) optimisés pour :
- **SEO classique** (Google, Bing) : structure sémantique, sitemap, schema.org
- **GEO** (Generative Engine Optimization) : contenu structuré pour être cité par ChatGPT, Perplexity, Claude — `llms.txt`, réponses directes en haut de page, FAQ balisées, autorisation explicite des crawlers IA

Vous donnez une **niche**, le pipeline enchaîne :

```
1. generate-domains.js   → 10 suggestions de noms de domaine (via Claude)
2. scaffold-site.js      → copie le template Astro, personnalise la niche
3. generate-content.js   → génère les articles + FAQ (via Claude), injecte les liens affiliés
4. build-deploy.js       → build Astro, déploie sur Vercel (optionnel)
```

## Installation

```bash
cd seo-geo-automation
npm install
cp .env.example .env
# Remplir .env avec vos clés (voir ci-dessous)
```

## Clés nécessaires (.env)

| Variable | Obligatoire | Rôle |
|---|---|---|
| `ANTHROPIC_API_KEY` | Oui | Génération des noms de domaine, articles, FAQ |
| `VERCEL_TOKEN` | Non | Déploiement automatique (sinon build local uniquement) |
| `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` | Non | Vérification de disponibilité + achat de domaine via Cloudflare Registrar API |

Nécessite **Node.js 18+** (le module Cloudflare utilise `fetch` natif, pas de dépendance HTTP supplémentaire).

### Cloudflare Registrar (recherche + achat de domaine)

Cloudflare a une Registrar API en beta qui permet de chercher, vérifier la disponibilité et
acheter un domaine par API, au prix coûtant (pas de marge Cloudflare sur le prix du registre).

1. Créez un compte Cloudflare si besoin, notez votre `Account ID` (visible dans le dashboard).
2. Créez un token API avec la permission **Registrar: write** : `https://dash.cloudflare.com/<ACCOUNT_ID>/api-tokens`
3. Configurez un moyen de paiement par défaut et un contact registrant par défaut dans
   `https://dash.cloudflare.com/<ACCOUNT_ID>/domains/registrations` (obligatoire avant tout achat).
4. Renseignez `CLOUDFLARE_ACCOUNT_ID` et `CLOUDFLARE_API_TOKEN` dans `.env`.

```bash
# 1. Suggestions IA + vérification de disponibilité réelle et prix
node scripts/generate-domains.js --niche "aspirateurs robots" --check-availability

# 2. Achat (le script affiche toujours le prix et exige --confirm — sinon aucun débit)
node scripts/register-domain.js --domain "cleantop.dev"            # dry-run, montre juste le prix
node scripts/register-domain.js --domain "cleantop.dev" --confirm  # achète réellement, débit immédiat
```

⚠️ **L'achat est non remboursable dès qu'il réussit.** `register-domain.js` ne débite jamais sans
`--confirm` explicite — pas d'achat "silencieux" dans le pipeline automatique par défaut.

Limites actuelles de la beta Cloudflare (peuvent évoluer) : toutes les extensions ne sont pas
supportées via l'API (certaines disponibles dans le dashboard ne le sont pas encore ici), les
renouvellements et transferts ne sont pas encore disponibles par API.

**Ce que ce projet NE fait PAS automatiquement** : créer les comptes affiliés (Amazon Associates, Awin, etc.),
s'inscrire aux programmes d'affiliation. Ce sont des actions liées à votre identité — impossibles à automatiser
sans risquer de violer les CGU des plateformes.

## Utilisation

```bash
node scripts/run-pipeline.js --niche "aspirateurs robots" --brand "CleanTop"
```

Ou étape par étape :
```bash
node scripts/generate-domains.js --niche "aspirateurs robots"
node scripts/scaffold-site.js --brand "CleanTop" --niche "aspirateurs robots"
node scripts/generate-content.js --site sites/cleantop --niche "aspirateurs robots" --articles 10 \
  --affiliate-links config/affiliate-links.json
node scripts/build-deploy.js --site sites/cleantop
```

Chaque site généré vit dans `sites/<brand>/` — un projet Astro autonome.

## ⚠️ Points d'attention avant de scaler

1. **Contenu dupliqué / faible valeur** : générer 50 sites avec le même squelette et juste le nom du produit qui change est le profil-type sanctionné par le *Google Helpful Content Update*. Le script varie structure, angle et données réelles par article (voir `generate-content.js`), mais la vraie protection reste : de la donnée réelle (prix, specs, comparatifs) et une relecture humaine avant publication.
2. **Divulgation obligatoire des liens affiliés** : légalement obligatoire (FTC aux US, DGCCRF en France, ARPP). Le composant `AffiliateDisclosure.astro` l'ajoute automatiquement sur chaque page — ne pas le retirer.
3. **Réseaux d'affiliation** : la plupart (Amazon Associates en tête) interdisent explicitement les sites "auto-générés sans valeur ajoutée" dans leurs CGU et ferment les comptes qui en abusent. Lire les CGU du programme choisi avant de scaler.
4. **GEO ≠ magie** : être cité par une IA générative dépend surtout de l'autorité perçue de la source (citations externes, cohérence factuelle) — pas seulement du balisage technique.

## Structure du template Astro

Voir `template/` — layout de base avec JSON-LD (Product, FAQPage, Organization), `llms.txt`, `robots.txt` autorisant explicitement GPTBot/PerplexityBot/ClaudeBot/Google-Extended.
# seo-geo-automation
