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
2. Créez un token API sur `https://dash.cloudflare.com/profile/api-tokens` avec **trois** permissions :
   - **Account / Registrar / Edit** — recherche, vérification et achat de domaine
   - **Zone / Zone / Read** — retrouver la zone créée après l'achat
   - **Zone / DNS / Edit** — créer les enregistrements A vers votre serveur

   ⚠️ Un token limité à Registrar **ne suffit pas** pour la partie DNS, et l'échec est
   silencieux : `GET /zones?name=...` renvoie `success: true` avec une liste **vide** au lieu
   d'un 403, ce qui ressemble à « domaine inexistant ». Diagnostic :
   `node scripts/configure-dns.js --domain <domaine> --check-token`
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

### Achat + DNS en une commande

`provision-domain.js` enchaîne vérification → achat → attente de la zone → enregistrements A
(domaine nu **et** `www`) pointés vers l'IP publique de la machine courante :

```bash
node scripts/provision-domain.js --domain aspirob.com            # dry-run : prix + DNS prévu, aucun débit
node scripts/provision-domain.js --domain aspirob.com --confirm  # achète puis configure le DNS
node scripts/provision-domain.js --domain aspirob.com --confirm --ip 1.2.3.4   # IP explicite
```

Deux garde-fous importants :

- **Préflight des permissions avant l'achat.** Le script vérifie l'accès DNS *avant* de payer :
  acheter puis échouer sur le DNS vous laisserait avec un domaine débité et inutilisable.
- **Idempotent.** Si le domaine est déjà sur le compte, l'achat est sauté et seul le DNS est
  réappliqué. Relancer ne crée jamais de doublon d'enregistrement.

Pour configurer le DNS seul (domaine déjà acheté) :

```bash
node scripts/configure-dns.js --domain aspirob.com           # A @ et www → IP de ce serveur
node scripts/configure-dns.js --domain aspirob.com --wait    # attend l'apparition de la zone
node scripts/configure-dns.js --domain aspirob.com --proxied # derrière le CDN Cloudflare
```

⚠️ N'activez `--proxied` **qu'après** avoir obtenu le certificat : le challenge HTTP-01 de
certbot a besoin d'un accès direct au serveur.

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
# seo-geo-automation
# seo-geo-automation
