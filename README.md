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
2. Créez un token API avec **trois** permissions. Attention à l'emplacement : un token
   *account-owned* ne figure **pas** sur la page des tokens utilisateur.
   - token de compte : `https://dash.cloudflare.com/<ACCOUNT_ID>/api-tokens`
   - token utilisateur : `https://dash.cloudflare.com/profile/api-tokens`

   Permissions requises :
   - **Account / Registrar / Edit** — recherche, vérification et achat de domaine
   - **Zone / Zone / Read** — retrouver la zone créée après l'achat
   - **Zone / DNS / Edit** — créer les enregistrements A vers votre serveur

   ⚠️ Un token limité à Registrar **ne suffit pas** pour la partie DNS, et l'échec est
   silencieux : `GET /zones?name=...` renvoie `success: true` avec une liste **vide** au lieu
   d'un 403, ce qui ressemble à « domaine inexistant ». Diagnostic :
   `node scripts/configure-dns.js --domain <domaine> --check-token`

   À savoir sur ce diagnostic : la permission DNS **n'est vérifiable que contre une zone
   réelle**. Tant que le compte n'a aucun domaine, `--check-token` répond « invérifiable »,
   ce qui n'est pas un refus. Sonder un zone-id inexistant ne sert à rien : l'API renvoie 403
   quoi qu'il arrive, puisque cette zone n'est dans le scope d'aucun token. De même, un token
   *account-owned* échoue avec 401 sur `/user/tokens/verify` tout en étant valide — c'est
   `/accounts/{id}/tokens/verify` qu'il faut interroger.
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

- **Préflight avant l'achat.** Le script vérifie la validité du token et l'accès DNS *avant* de
  payer, et n'interrompt que sur un refus **démontré** (403 sur une zone réelle). Si l'accès est
  simplement invérifiable — cas du premier achat, quand le compte n'a encore aucune zone — il
  prévient et continue : c'est l'achat lui-même qui crée la première zone. Le filet de sécurité
  est l'idempotence ci-dessous : si le DNS échoue après l'achat, le domaine reste acquis et
  relancer la même commande n'applique que le DNS.
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

### HTTPS et renouvellement

`deploy-vps.js` vérifie que le domaine résout **avant** d'appeler certbot. Un domaine qui ne
résout pas ferait échouer la validation et consommerait le quota Let's Encrypt (5 échecs par nom
et par heure) : le script reste alors en HTTP et indique quoi faire. Si seul l'apex résout, il
demande le certificat pour l'apex seul plutôt que d'échouer à cause de `www`. Une résolution vers
une autre IP (cas normal derrière le proxy Cloudflare) produit un simple avertissement.
`--force-ssl` passe outre la vérification.

Le renouvellement est global : `certbot.timer` couvre **tous** les certificats de la machine, sans
configuration par domaine. Côté surveillance, Let's Encrypt ayant cessé d'envoyer les emails
d'expiration le 4 juin 2025, `scripts/check-cert.sh` les remplace : sans argument il découvre tous
les certificats présents, et vérifie à la fois le certificat sur disque **et** celui réellement
servi par nginx — un renouvellement réussi suivi d'un `reload` échoué laisserait sinon nginx servir
l'ancien certificat sans que rien ne l'indique.

```bash
./scripts/check-cert.sh                 # tous les certificats
./scripts/check-cert.sh --domain x.com  # un seul
journalctl -t cert-check                # historique des vérifications
```

Installation du timer hebdomadaire : voir `scripts/cert-check.service` et
`scripts/cert-check.timer` (à copier dans `/etc/systemd/system/`).

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

### Fiches produit et tableau comparatif

Les produits d'un article vivent dans le **frontmatter**, pas dans le corps Markdown :

```yaml
products:
  - name: "Modèle A"
    summary: "..."
    schematic: "/fiches/modele-a.svg"                # optionnel
    url: "https://www.amazon.fr/dp/...?tag=..."      # le lien marchand
    affiliate: true                                  # false = lien non rémunéré
    sourceUrl: "https://boutique-fabricant/..."      # d'où vient le prix
    pros: ["..."]
    cons: ["..."]
    attrs: { "Critère": "valeur courte" }
    price: 499
    priceCurrency: "EUR"
    priceSource: "boutique officielle Fabricant"
    priceCheckedAt: "2026-09-23"
```

Les quatre champs de prix vont **ensemble** : un prix sans sa source ni sa date d'observation
n'est pas vérifiable. Ils sont posés par `scripts/fetch-prices.py --site … --update`, jamais
à la main. `affiliate` et `sourceUrl` séparent deux rôles qu'un seul lien ne peut pas tenir :
le marchand qui rémunère, et la boutique dont le prix est affiché.

`generate-content.js` les produit automatiquement à partir des liens affiliés fournis, et
`[slug].astro` en tire **à la fois** les fiches groupées et le tableau comparatif — les colonnes
du tableau sont l'union des clés `attrs`. Un produit renvoyé par le modèle sans lien affilié
correspondant est écarté : on ne publie pas de fiche pour un produit inventé.

**Les colonnes s'adaptent à la niche.** Rien n'est codé en dur : le modèle choisit lui-même
3 à 4 critères pertinents pour la catégorie de produits traitée — type de brosse et navigation
pour des aspirateurs robots, guidage et pente franchissable pour des tondeuses, tout autre chose
ailleurs. Les colonnes du tableau sont ensuite l'union des clés `attrs`.

Deux garde-fous côté `generate-content.js` :

- Seuls les critères présents sur la **majorité** des produits sont conservés, et au maximum
  **4** — sinon un intitulé employé pour un seul produit créerait une colonne presque vide, et
  une table de huit colonnes déborderait sur mobile. Les critères écartés sont journalisés.
- Les valeurs doivent être **structurelles et vérifiables** : un type, une technologie, une
  présence ou une absence. Prix, mesures de performance, autonomies et notes sur 10 sont
  exclus par la consigne — ils périment ou sont invérifiables.

Les schémas produit (`/fiches/*.svg`) sont propres à la niche : voir
`scripts/diagrams/fiches-produit.py`, à réécrire pour chaque nouveau site. Sans schéma, la
fiche se rend quand même, en texte seul.

## ⚠️ Points d'attention avant de scaler

0. **Garde-fou `draft`** : quand Claude n'a pas de donnée réelle vérifiée, il insère des marqueurs
   `[À VÉRIFIER: ...]` plutôt que d'inventer des chiffres. Sans garde-fou, **ces marqueurs se
   retrouvent rendus tels quels sur la page publique**. `generate-content.js` met donc
   automatiquement `draft: true` sur tout article qui en contient : l'article n'est ni listé, ni
   rendu, ni présent dans le sitemap. Pour le publier, remplacez chaque marqueur par la donnée
   réelle puis passez `draft: false`.

1. **Contenu dupliqué / faible valeur** : générer 50 sites avec le même squelette et juste le nom du produit qui change est le profil-type sanctionné par le *Google Helpful Content Update*. Le script varie structure, angle et données réelles par article (voir `generate-content.js`), mais la vraie protection reste : de la donnée réelle (prix, specs, comparatifs) et une relecture humaine avant publication.
2. **Divulgation des liens affiliés** : légalement obligatoire dès qu'il y a des liens (FTC aux US,
   DGCCRF en France, ARPP). Elle est désormais **conditionnelle** : `generate-content.js` pose
   `affiliate: true` dans le frontmatter uniquement si un lien affilié fourni apparaît réellement
   dans l'article, et `AffiliateDisclosure.astro` ne s'affiche que dans ce cas. Le pied de page et
   `llms.txt` suivent la même règle. Raison : afficher « cet article contient des liens affiliés »
   sur un article qui n'en a aucun est une affirmation fausse — le sens de l'obligation légale est
   de ne pas dissimuler une rémunération, pas d'en inventer une.

   **Génération des liens** : `make-affiliate-links.js` construit `config/affiliate-links.json`
   à partir d'URLs produit Amazon collées depuis le navigateur. Il extrait l'ASIN, reconstruit un
   lien propre `amazon.fr/dp/<ASIN>?tag=<tag>`, déduit le nom depuis le slug de l'URL, déduplique
   par ASIN et rejette ce qui n'est pas exploitable (liens raccourcis `amzn.to`/`amzn.eu`, qui ne
   contiennent pas l'ASIN, et pages de recherche). Le tag est lu depuis `AMAZON_ASSOCIATE_TAG`.

   ```bash
   node scripts/make-affiliate-links.js \
     --url "https://www.amazon.fr/.../dp/B0XXXXXXXX" \
     --url "https://www.amazon.fr/.../dp/B0YYYYYYYY"
   # puis régénérer le contenu avec --affiliate-links config/affiliate-links.json
   ```

   Les noms déduits du slug sont signalés `⚠️ nom deviné` : relisez-les, ils apparaîtront dans
   les articles.

   **Awin (multi-réseaux)** : `make-awin-links.js` génère les liens trackés Awin et les ajoute
   au même `config/affiliate-links.json`, avec `network: "awin"`.

   ```bash
   node scripts/make-awin-links.js --advertiser 1234 --name "Darty" \
     --url "https://www.darty.com/..." --clickref "mon-article"
   ```

   Le paramètre `clickref` indique **depuis quelle page** le clic est parti. C'est l'avantage
   d'Awin sur Amazon, où la même information exigerait un identifiant de suivi par article :
   ici, il suffit d'y mettre le slug. L'URL cible est encodée, sinon ses propres paramètres
   seraient absorbés par le lien Awin et la destination tronquée.

   ⚠️ Un lien Awin ne rapporte que si vous êtes **validé par l'annonceur** : le compte et
   l'annonceur s'approuvent séparément.

   **Ce que le projet ne peut pas faire** : créer votre compte d'affiliation, ni deviner les ASIN
   des produits que vous voulez recommander.
   Inscrivez-vous au programme (Amazon Associates, Awin…), puis renseignez vos vrais liens dans
   `config/affiliate-links.json` (modèle : `affiliate-links.example.json`) et régénérez le contenu
   avec `--affiliate-links`. La divulgation réapparaîtra automatiquement.
3. **Réseaux d'affiliation** : la plupart (Amazon Associates en tête) interdisent explicitement les sites "auto-générés sans valeur ajoutée" dans leurs CGU et ferment les comptes qui en abusent. Lire les CGU du programme choisi avant de scaler.
4. **GEO ≠ magie** : être cité par une IA générative dépend surtout de l'autorité perçue de la source (citations externes, cohérence factuelle) — pas seulement du balisage technique.

## Structure du template Astro

Voir `template/` — layout de base avec JSON-LD (BlogPosting, Product, FAQPage, BreadcrumbList,
Organization), `llms.txt`, et un `robots.txt` qui nomme explicitement **deux familles distinctes**
de robots : ceux qui collectent pour l'entraînement (GPTBot, ClaudeBot, Google-Extended) et ceux
qui vont chercher une page pour la **citer** dans une réponse (OAI-SearchBot, Claude-SearchBot,
PerplexityBot, Googlebot, Bingbot). Autoriser les premiers ne dit rien des seconds, et ce sont
les seconds qui apportent du trafic.

## Ce que le gabarit garantit, et pourquoi

Ces règles sont nées de corrections successives sur un site réel. Elles sont **portées par
`template/` et par les scripts**, donc héritées par tout nouveau site : ce sont des invariants,
pas des consignes à réappliquer à la main.

**Aucun chiffre non vérifiable n'est publié.** Pas de prix estimé, pas de note sur dix, pas de
mesure de performance inventée. Un modèle introuvable dans le catalogue de son fabricant ne
reçoit aucun prix plutôt qu'un prix approché — et cette absence est une information : un produit
absent du catalogue de sa propre marque n'est en général plus commercialisé.

**Un prix appartient au marchand qui le pratique.** La fiche liste une ligne par boutique. Un
tarif relevé chez le fabricant, affiché au-dessus d'un bouton menant ailleurs, se lit comme le
prix de ce bouton. La même règle vaut dans le JSON-LD, où `Offer.url` pointe vers la page d'où
le prix vient : Google recoupe une offre avec sa destination.

**La divulgation d'affiliation suit les liens réellement rémunérés**, dans les deux sens.
L'afficher sans lien payant est une affirmation fausse, l'omettre avec un lien payant est une
infraction. Même logique pour `rel="sponsored"`, qui décrit une contrepartie financière et n'a
rien à faire sur un lien qui n'en produit aucune.

**Rien de propre à une niche n'est codé en dur.** Les colonnes du tableau comparatif sont
choisies par le modèle pour la catégorie traitée. Le bloc « Par où commencer » de l'accueil est
construit à partir du champ `usecase` que chaque article déclare — une liste de slugs écrite
dans le gabarit ne survivrait pas au changement de sujet. `{{BRAND}}`, `{{NICHE}}`, `{{DOMAIN}}`
et `{{AUTHOR}}` restent des jetons dans `template/`, y compris dans les `.ts`.

**Les pages institutionnelles doivent rester vraies.** Les mentions légales décrivent la méthode
éditoriale : dès qu'une fonctionnalité change ce que fait le site — l'ajout des prix, par
exemple — ce texte change avec elle. Une page « méthode » contredite par le site lui-même est
pire que pas de page du tout.

**Les images produit sont des schémas, jamais des photos.** Les visuels des fabricants sont
verrouillés hors PA-API et aucune banque libre ne propose de vue étiquetée par modèle. Un schéma
original (`scripts/diagrams/`) ne prétend rien de faux : il est manifestement un schéma.

**Un site fraîchement généré doit compiler avant d'avoir du contenu.** La configuration ne
suppose jamais l'existence du dossier d'articles.
