# Schema.org — aspirob.com

Analyse basée sur le code source Astro (`sites/aspirob/src`) et sur la vérification en
direct des pages HTML (`curl https://aspirob.com/...`) le 2026-09-20. Les deux sources
concordent bloc pour bloc, sauf pour un correctif appliqué **en cours d'audit** (voir
§0) qui n'est pas encore construit/déployé.

## 0. Correctif détecté en cours d'audit (source déjà modifiée, pas encore en prod)

Pendant l'analyse, `sites/aspirob/src/pages/articles/[slug].astro` a été modifié dans
l'arborescence de travail (changement non commité, visible via `git diff`) pour corriger
exactement les deux bugs que cette analyse avait identifiés sur `BreadcrumbList` et
`BlogPosting` :

```diff
   mainEntityOfPage: { '@type': 'WebPage', '@id': url },
   url,
   articleSection: data.category,
+  image: [new URL(`/og-${article.slug}.png`, SITE.url).href],
 };
 ...
-    { '@type': 'ListItem', position: 2, name: data.category, item: SITE.url },
+    {
+      '@type': 'ListItem', position: 2, name: data.category,
+      item: new URL(`/${data.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}s/`, SITE.url).href,
+    },
```

Les deux correctifs sont valides (URL absolue, `/og-{slug}.png` existe réellement pour
les 5 articles, vérifié en HTTP 200). Ils sont traités ci-dessous comme **résolus dans
le code source**, mais **la production (aspirob.com) sert encore l'ancienne version**
au moment de cet audit (vérifié par `curl` avant l'édition) — il faut builder et
déployer pour que le correctif prenne effet. Ne pas revenir en arrière sur ce diff.

## 1. Détection — schéma présent par page

Le site compte 10 pages : accueil, `/comparatifs/`, `/guides/`, 5 articles,
`/mentions-legales/`, `/confidentialite/`.

| Page | Schéma présent |
|---|---|
| `/` | `WebSite` (site-wide, injecté par `Base.astro`) |
| `/comparatifs/`, `/guides/` | `WebSite` uniquement |
| `/mentions-legales/`, `/confidentialite/` | `WebSite` uniquement |
| 5× `/articles/{slug}/` | `WebSite` + `BlogPosting` + `BreadcrumbList` + `FAQPage`/`Question`/`Answer` |

Correction du brief de départ : il n'existe **aucun bloc `Organization` autonome**, et
aucun `WebPage` en tant que type de page. `Organization` n'apparaît que **nichée** en
tant que valeur de `publisher` à l'intérieur de `WebSite` et `BlogPosting` :
```json
"publisher": { "@type": "Organization", "name": "Aspirob", "url": "https://aspirob.com" }
```
et `WebPage` n'apparaît que dans `mainEntityOfPage` du `BlogPosting`. Ce sont des formes
valides, mais il n'y a pas d'entité `Organization` indépendante que Google puisse
rattacher à un logo, un `sameAs`, etc. — voir §4.

Aucun schéma déprécié détecté (`HowTo`, `SpecialAnnouncement`, `CourseInfo`,
`EstimatedSalary`, `LearningVideo` : absents, correctement).

## 2. Validation de l'existant

### 2.1 `WebSite` (10/10 pages) — Valide

```json
{"@context":"https://schema.org","@type":"WebSite","name":"Aspirob","url":"https://aspirob.com",
"inLanguage":"fr","description":"Guides d'achat et comparatifs indépendants sur les aspirateurs robots : navigation, brosses, entretien. Sans chiffres invérifiés ni photos de catalogue.",
"publisher":{"@type":"Organization","name":"Aspirob","url":"https://aspirob.com"}}
```
- ✅ `@context` https, `@type` valide, URLs absolues, pas de placeholder, `inLanguage` ISO.
- ✅ Absence volontaire de `potentialAction`/`SearchAction` : correcte, le site n'a pas
  de champ de recherche interne (pas d'erreur).

### 2.2 `BlogPosting` (5/5 articles) — Valide, un point corrigé pendant l'audit

Exemple réel (`/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/`, état production
avant le correctif du §0) :
```json
{"@context":"https://schema.org","@type":"BlogPosting",
"headline":"Roomba j9+ vs Roborock S8 Pro Ultra : deux approches opposées du haut de gamme",
"description":"Roomba j9+ ou Roborock S8 Pro Ultra : lavage des sols, station de base, navigation. Comprendre ce qui sépare vraiment ces deux robots avant de choisir.",
"inLanguage":"fr","datePublished":"2026-09-18","dateModified":"2026-09-18",
"author":{"@type":"Person","name":"Dany Derensy","url":"https://aspirob.com/mentions-legales/"},
"publisher":{"@type":"Organization","name":"Aspirob","url":"https://aspirob.com"},
"mainEntityOfPage":{"@type":"WebPage","@id":"https://aspirob.com/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"},
"url":"https://aspirob.com/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/","articleSection":"Comparatif"}
```
- ✅ `headline`, `datePublished` (ISO `YYYY-MM-DD`, format date-only valide), `author`,
  `publisher` présents.
- ⚠️ **`image` manquant** dans cette version production. Google recommande `image` pour
  qu'un `Article`/`BlogPosting` reste éligible aux résultats enrichis visuels (aperçu
  image, carrousel). Le site dispose déjà d'une image OG dédiée par article
  (`/og-{slug}.png`, 1200×630, vérifiée HTTP 200 pour les 5 articles) : c'est la source
  naturelle. **Déjà corrigé dans le code source pendant cet audit** (§0) — à builder/
  déployer.
- Note non bloquante : `dateModified` vaut toujours `datePublished` (aucun article n'a
  encore de `updatedDate`) — normal pour des articles neufs publiés le même jour ; à
  surveiller pour que `updatedDate` soit bien renseigné lors des futures révisions
  (le champ existe dans le schéma de contenu, `content/config.ts`, et sert déjà à
  l'affichage « mis à jour le » — juste pas encore utilisé).

### 2.3 `BreadcrumbList` (5/5 articles) — Bug réel, corrigé pendant l'audit

Version production (avant correctif) :
```json
{"@type":"BreadcrumbList","itemListElement":[
 {"@type":"ListItem","position":1,"name":"Accueil","item":"https://aspirob.com"},
 {"@type":"ListItem","position":2,"name":"Comparatif","item":"https://aspirob.com"},
 {"@type":"ListItem","position":3,"name":"Roomba j9+ vs Roborock S8 Pro Ultra : deux approches opposées du haut de gamme","item":"https://aspirob.com/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"}]}
```
❌ **Bug** : la position 2 (« Comparatif ») pointait vers `https://aspirob.com`, la même
URL que la position 1 — la hiérarchie déclarée était donc plate (2 maillons sur 3
identiques), ce qui peut faire ignorer le fil d'Ariane par Google. Corrigé dans le
source (§0) pour pointer vers `https://aspirob.com/comparatifs/` (ou `/guides/`),
c'est-à-dire l'URL réelle de la page de catégorie.

### 2.4 `FAQPage` / `Question` / `Answer` (5/5 articles) — Syntaxiquement valide, sans effet SERP Google

Vérification JSON stricte (`json.loads`) sur les 5 pages en production : les 5 blocs
`FAQPage` sont valides à 100 % (0 erreur de parsing, guillemets/apostrophes français
correctement échappés). Exemple :
```json
{"@type":"FAQPage","mainEntity":[
 {"@type":"Question","name":"Le Roborock S8 Pro Ultra lave-t-il vraiment les sols ou c'est du marketing ?",
  "acceptedAnswer":{"@type":"Answer","text":"Il lave réellement mieux que la plupart des concurrents grâce à sa serpillière oscillante avec pression, mais il ne remplace pas un lavage manuel pour les taches incrustées ou les joints de carrelage. Sur des sols entretenus régulièrement, le résultat est satisfaisant."}},
 ...]}
```
- Type correctement choisi : ce sont des questions anticipées rédigées par l'éditeur, pas
  des questions soumises par de vrais utilisateurs — `FAQPage` est donc le bon choix,
  **pas** `QAPage` (qui suppose une vraie soumission utilisateur).
- ⚠️ **Reclassé en priorité Info, pas Critique.** Google a retiré le résultat enrichi FAQ
  pour tous les sites le 2026-05-07 — nous sommes le 2026-09-20, cette échéance est donc
  passée : ce balisage n'apporte plus aucun gain SERP sur Google. Il n'y a pas d'erreur à
  corriger, juste un bénéfice à ne plus attendre.
  - Argument pour le garder quand même : `robots.txt` autorise explicitement `GPTBot`,
    `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended` (« Crawlers IA —
    autorisation explicite pour le GEO »), signe que le site vise déjà la citation par
    des moteurs génératifs. Le bénéfice GEO d'un `FAQPage` structuré reste toutefois
    **non confirmé** — à traiter comme un pari à coût nul plutôt qu'un acquis.
  - Recommandation : conserver tel quel (le contenu HTML `<details>/<summary>` sert de
    toute façon la même FAQ visuellement), ne pas investir de temps supplémentaire
    dessus, et ne pas le présenter en interne comme générateur de clics Google.

## 3. Product / Offer — la question posée

**Le choix de ne pas utiliser `Product`/`Offer` est défendable et je le maintiendrais.**

Raisons, du point de vue balisage structuré :
1. Pour que Google considère une fiche `Product` éligible à un résultat enrichi (extrait
   produit, prix, disponibilité), il faut au moins un de : `offers` (prix +
   `priceCurrency` + `availability`), `review`, ou `aggregateRating`. Le site n'a ni prix
   suivi, ni test, ni note — les trois manquent structurellement, par choix éditorial
   assumé (« Nous ne testons pas les produits », « Nous n'affichons pas de prix »,
   `mentions-legales.astro`).
2. Fabriquer un `Offer.price` non maintenu (site statique Astro, pas de flux prix) se
   périmerait immédiatement et walkerait droit dans les politiques Google contre les
   données trompeuses/non représentatives ; fabriquer un `aggregateRating`/`reviewRating`
   sans note réelle est explicitement le genre d'abus que Google sanctionne (rich
   results retirés, risque d'action manuelle). Le choix actuel évite ce risque.
3. **Une variante sans prix est possible mais n'apporte rien côté Google** : un bloc
   `Product` avec seulement `name`/`description`/`brand`/`url` (sans `offers`, `review`
   ni `aggregateRating`) reste syntaxiquement valide, mais Google Search Console le
   classera en « valide avec avertissements » (champ recommandé manquant) et il ne sera
   **jamais éligible** au résultat enrichi produit — donc aucun gain SERP mesurable, pour
   du bruit de validation en plus.
4. Le seul angle qui reste est spéculatif : une entité `Product` minimale pourrait aider
   des moteurs génératifs à mieux structurer « quel produit, quelle marque, quel lien »
   (logique GEO, cohérente avec le `robots.txt` ouvert aux crawlers IA) — mais, comme
   pour `FAQPage`, ce bénéfice est **non confirmé**. Voir exemple facultatif en §4.4, à
   n'ajouter que si vous acceptez ce compromis.

**Conclusion : garder l'absence de `Product`/`Offer` comme choix par défaut ; ne
considérer la variante sans prix que comme test GEO optionnel, jamais comme un levier
SEO Google.**

## 4. Opportunités manquantes qui apporteraient réellement quelque chose

### 4.1 `Organization` autonome (priorité : Important)

Il n'existe aujourd'hui aucune entité `Organization` indépendante — seulement des copies
nichées dans `publisher`. Ajouter un bloc autonome sur l'accueil (ou site-wide, dans
`Base.astro`, à côté de `websiteSchema`) permet à Google de construire une entité de
marque distincte (logo, éventuellement `sameAs` plus tard). Le site dispose déjà d'un
logo carré exploitable, non un placeholder : `apple-touch-icon.png` (180×180, HTTP 200
en production).

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://aspirob.com/#organization",
  "name": "Aspirob",
  "url": "https://aspirob.com",
  "logo": "https://aspirob.com/apple-touch-icon.png",
  "description": "Guides d'achat et comparatifs indépendants sur les aspirateurs robots : navigation, brosses, entretien. Sans chiffres invérifiés ni photos de catalogue."
}
```

Amélioration optionnelle mais recommandée (cohérence de graphe) : référencer cette
même entité par `@id` plutôt que de réinjecter un objet `Organization` littéral à
chaque fois — dans `websiteSchema.publisher` et dans `articleSchema.publisher` :
```json
"publisher": { "@id": "https://aspirob.com/#organization" }
```
Pas indispensable (Google accepte très bien l'objet niché actuel), mais évite d'avoir
6 déclarations légèrement dupliquées de la même organisation sur le site.

`sameAs` : pas de profil social/marque recensé dans `lib/site.ts` — ne rien inventer ;
à ajouter seulement si de vrais profils existent un jour.

### 4.2 `BreadcrumbList` sur `/comparatifs/` et `/guides/` (priorité : Info, facile)

Ces deux pages de catégorie n'ont aujourd'hui que `WebSite`. Un fil d'Ariane à 2
niveaux est trivial à générer et cohérent avec celui déjà en place sur les articles :

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://aspirob.com" },
    { "@type": "ListItem", "position": 2, "name": "Comparatifs", "item": "https://aspirob.com/comparatifs/" }
  ]
}
```
(remplacer `Comparatifs`/`/comparatifs/` par `Guides`/`/guides/` pour l'autre page).

### 4.3 Types explicitement écartés (et pourquoi c'est correct)

- **`HowTo`** : résultats enrichis retirés depuis septembre 2023 — ne pas ajouter, quel
  que soit le contenu « étapes » du site (ex. placement de la base de recharge).
- **`SpecialAnnouncement`, `CourseInfo`, `EstimatedSalary`, `LearningVideo`** : hors
  sujet pour ce site, et dépréciés de toute façon.
- **`Speakable`** : fonctionnalité limitée à l'Assistant Google, essentiellement en
  anglais US ; sans pertinence pour un site éditorial francophone — ne pas ajouter.
- **`ItemList`** générique sur les pages de listing (accueil, catégories) : Google ne
  documente pas de résultat enrichi générique pour ce cas (contrairement aux verticales
  recette/restaurant/carrousel produit) — ajouter `ItemList` ici n'aurait aucun effet
  SERP mesurable ; ne pas en faire une priorité.
- **`VideoObject` / `BroadcastEvent` / `Clip` / `SeekToAction`** : aucune vidéo sur le
  site actuellement — sans objet.

### 4.4 `Product` sans prix ni note (priorité : Info, optionnel, GEO seulement)

À n'ajouter que si le pari GEO non confirmé (§3, point 4) est jugé intéressant.
Exemple avec des données 100 % réelles tirées de l'article (pas de placeholder) :

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Roomba j9+",
  "description": "Conçu pour un cas d'usage précis : aspirer efficacement des surfaces textiles avec des poils d'animaux, avec le minimum de maintenance.",
  "brand": { "@type": "Brand", "name": "iRobot" },
  "url": "https://www.amazon.fr/dp/B0C415NHBM?tag=aspirob0d-21"
}
```
Sans `offers`/`review`/`aggregateRating`, ce bloc ne sera jamais éligible à un résultat
enrichi Google — l'ajouter est un choix éditorial GEO, pas SEO.

## 5. Récapitulatif priorisé

| Constat | Statut | Priorité |
|---|---|---|
| `BreadcrumbList` position 2 pointait vers l'accueil au lieu de la catégorie | Corrigé dans le code source pendant l'audit, **pas encore déployé** | Important — builder/déployer |
| `BlogPosting` sans `image` | Corrigé dans le code source pendant l'audit, **pas encore déployé** | Important — builder/déployer |
| Pas d'`Organization` autonome (seulement niché dans `publisher`) | Ouvert | Important |
| `FAQPage` toujours syntaxiquement valide mais sans bénéfice SERP Google depuis le 2026-05-07 | Ouvert (informatif seulement) | Info |
| Pas de `BreadcrumbList` sur `/comparatifs/` et `/guides/` | Ouvert | Info |
| Absence de `Product`/`Offer` | Choix défendable, à conserver | — |
| Variante `Product` sans prix | Optionnelle, GEO non confirmé | Info |
| `HowTo`, `SpecialAnnouncement`, `Speakable`, `ItemList` générique | Correctement absents | — |
