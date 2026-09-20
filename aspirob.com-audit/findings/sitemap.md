# Audit sitemap — aspirob.com

Date de l'audit : 2026-09-20

## Résumé

Le sitemap est valide, découvrable, et sa couverture correspond exactement à ce que le
site expose réellement (10/10 URLs, aucune manquante, aucune en trop). Le seul défaut
substantiel est l'absence totale de balises `<lastmod>`, alors que les données pour les
renseigner (`publishDate` / `updatedDate`) existent déjà dans le frontmatter des articles
mais ne sont pas transmises à l'intégration `@astrojs/sitemap`.

| Check | Résultat |
|---|---|
| robots.txt déclare le bon sitemap | PASS (corrigé ce matin, vérifié) |
| XML valide (index + sitemap-0) | PASS |
| Toutes les URLs en 200 | PASS (10/10) |
| Cohérence sitemap ↔ site réel | PASS (aucun manquant, aucun en trop) |
| Mécanisme draft → absent du sitemap | PASS (vérifié dans le code et en prod) |
| Limite 50 000 URLs / 50 Mo | PASS (10 URLs, 1072 octets) |
| Balises priority / changefreq | PASS (absentes, rien à retirer) |
| Balises lastmod | **FAIL — absentes sur les 10 URLs** |
| Pages location / doorway | N/A (aucune page de ce type sur ce site) |

## 1. Découverte et déclaration (robots.txt)

- `https://aspirob.com/robots.txt` déclare bien `Sitemap: https://aspirob.com/sitemap-index.xml`.
- Vérifié : ce n'est plus `https://example.com/...`. Le fichier est désormais généré au
  build par `sites/aspirob/src/pages/robots.txt.ts`, qui construit l'URL à partir de
  `SITE.url` (`new URL('/sitemap-index.xml', SITE.url).href`) au lieu d'un gabarit statique
  jamais substitué. Ce point de la régression ne peut plus se reproduire, y compris si le
  domaine change. Commit de correction : `2c2f259`.
- `sitemap_discovery.py` confirme la découverte : `found` contient l'entrée
  `sitemap-index.xml` (source `robots.txt`, status 200, kind `sitemapindex`, valid `true`).
  Les chemins usuels non déclarés (`/sitemap.xml`, `/sitemap_index.xml`, `/wp-sitemap.xml`)
  renvoient 404 comme attendu — aucune ambiguïté de découverte.

## 2. Format XML

- `sitemap-index.xml` : XML bien formé, un seul `<sitemap>` pointant vers `sitemap-0.xml`.
  Pas de `<lastmod>` au niveau de l'index (non requis, mais aurait pu indiquer la fraîcheur
  du build).
- `sitemap-0.xml` : XML bien formé (validé avec `xml.dom.minidom`), espaces de noms
  `news:`, `xhtml:`, `image:`, `video:` déclarés mais inutilisés — sans conséquence, Google
  ignore les namespaces non exploités.
- Content-Type servi : `text/xml` pour les deux fichiers — correct.
- 1 072 octets, 10 entrées `<url>` : très loin des seuils de 50 000 URLs / 50 Mo par
  fichier (et de la limite à 1 000 pour un sitemap `news:`, qui ne s'applique pas ici de
  toute façon).

## 3. Balises priority / changefreq

Absentes des 10 entrées. Rien à corriger — Google les ignore, leur absence est le
comportement souhaité (comportement par défaut de `@astrojs/sitemap`, aucune configuration
`serialize` ne les réintroduit).

## 4. Balises lastmod — FAIL

**Aucune des 10 URLs du sitemap ne porte de balise `<lastmod>`.**

Cause : `astro.config.mjs` appelle `sitemap()` sans option `serialize`, donc l'intégration
n'émet pas de `lastmod` par défaut. Or les données existent déjà :
- Chaque article a un champ `publishDate` obligatoire dans le schéma de collection
  (`src/content/config.ts`), et un champ optionnel `updatedDate` explicitement prévu pour
  signaler une révision de contenu ("Les moteurs génératifs et Google privilégient le
  contenu récemment vérifié : afficher cette date est un signal fort" — commentaire du
  schéma lui-même).
- Les 5 articles actuels ont tous `publishDate: "2026-09-18"` et aucun `updatedDate` renseigné.

Deux remarques à anticiper si `lastmod` est ajouté :
- Si seul `publishDate` est câblé sans logique de mise à jour, les 5 articles auront un
  `lastmod` strictement identique — pattern signalé "Low" (dates non différenciées), à
  éviter dès le départ plutôt qu'à corriger plus tard.
- Les 4 pages statiques (accueil, `/comparatifs/`, `/guides/`, `/confidentialite/`,
  `/mentions-legales/`) n'ont pas de date en frontmatter du tout : il faudra soit une
  date de dernière modification réelle par page, soit les exclure du `lastmod` plutôt que
  leur assigner la date de build (ce qui reproduirait le même anti-pattern à plus grande
  échelle).

**Recommandation** : ajouter une fonction `serialize` à l'intégration `sitemap()` qui
utilise `updatedDate ?? publishDate` pour les articles, au format W3C Datetime
(`YYYY-MM-DD` est valide), et ne renseigne `lastmod` sur les pages statiques que si une
date de modification réelle est trackée (sinon, mieux vaut l'omettre que mentir).

## 5. Couverture — sitemap vs site réel

Contenu de `sitemap-0.xml` (10 URLs) :

1. `https://aspirob.com/`
2. `https://aspirob.com/articles/aspirateur-robot-animaux-erreurs-eviter/`
3. `https://aspirob.com/articles/aspirateur-robot-poils-animaux-chat-chien/`
4. `https://aspirob.com/articles/navigation-lidar-aspirateur-robot-explication/`
5. `https://aspirob.com/articles/navigation-lidar-camera-aspirateur-robot-differences/`
6. `https://aspirob.com/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/`
7. `https://aspirob.com/comparatifs/`
8. `https://aspirob.com/confidentialite/`
9. `https://aspirob.com/guides/`
10. `https://aspirob.com/mentions-legales/`

Vérification page par page (status HTTP, canonical, meta robots) :

| URL | HTTP | Canonical auto-référent | `<meta name="robots">` |
|---|---|---|---|
| `/` | 200 | oui | absent (indexable) |
| `/articles/aspirateur-robot-animaux-erreurs-eviter/` | 200 | oui | absent |
| `/articles/aspirateur-robot-poils-animaux-chat-chien/` | 200 | oui | absent |
| `/articles/navigation-lidar-aspirateur-robot-explication/` | 200 | oui | absent |
| `/articles/navigation-lidar-camera-aspirateur-robot-differences/` | 200 | oui | absent |
| `/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/` | 200 | oui | absent |
| `/comparatifs/` | 200 | oui | absent |
| `/confidentialite/` | 200 | oui | absent |
| `/guides/` | 200 | oui | absent |
| `/mentions-legales/` | 200 | oui | absent |

**10/10 en 200, canonical cohérent, aucune balise noindex** — aucune URL à retirer du
sitemap pour ce motif.

### Pages manquantes (crawlées mais absentes du sitemap)

**Aucune.** Le crawl des liens internes de l'accueil, `/guides/` et `/comparatifs/` ne
révèle aucune URL de contenu qui ne soit pas déjà dans le sitemap.

### Pages en trop (dans le sitemap mais 404/redirigées)

**Aucune.**

### Mécanisme draft — vérifié à deux niveaux

Le contexte indique que deux articles ont été en brouillon puis publiés. Vérification :

- **Code** (`src/pages/articles/[slug].astro`) : `getStaticPaths` filtre explicitement
  `({ data }) => !data.draft)` — un article `draft: true` ne génère aucune route, donc
  n'apparaît jamais dans `sitemap-0.xml` (généré à partir des routes réellement construites
  par Astro). Le commentaire du schéma confirme l'intention : *"Un draft ne produit aucune
  page : donc absent du site ET du sitemap."*
- **État actuel** : les 5 fichiers de `src/content/articles/` ont tous `draft: false`
  (explicite pour 2 d'entre eux — `aspirateur-robot-poils-animaux-chat-chien.md` et
  `roomba-j9-plus-vs-roborock-s8-pro-ultra.md`, vraisemblablement les deux ex-brouillons
  mentionnés — implicite par défaut pour les 3 autres). Les 5 sont bien présents dans le
  sitemap et servent 200 en production. Aucun résidu de brouillon.
- Le mécanisme est sain par construction : comme le filtre agit sur les routes générées
  (pas sur une liste maintenue à la main), il ne peut pas se désynchroniser — le risque
  d'oubli qu'on corrige habituellement ("un article publié mais laissé hors sitemap")
  n'existe pas ici.

### Note annexe — `/articles/` (403, hors sitemap, sans conséquence)

`https://aspirob.com/articles/` renvoie 403 (pas 404) : Astro ne génère pas de route
d'index pour ce préfixe, nginx refuse le listing du répertoire physique. Cette URL n'est
ni dans le sitemap ni liée depuis aucune page interne crawlée (accueil, `/guides/`,
`/comparatifs/`) — invisible pour un crawler suivant les liens, donc sans impact SEO. À
signaler pour information seulement ; pas d'action requise côté sitemap.

## 6. Pages de type "location" (gate qualité)

N/A — le site ne contient aucune page programmatique de type localisation/ville. Les 5
pages de contenu sont des articles éditoriaux uniques et les 4 pages restantes sont des
pages statiques (accueil, 2 pages de catégorie, mentions légales, confidentialité). Le
seuil de 30+ pages location (warning) et 50+ (hard stop) ne s'applique pas.

## Actions recommandées (priorité)

1. **Medium** — Ajouter une fonction `serialize` à `sitemap()` dans `astro.config.mjs`
   pour émettre `lastmod` à partir de `updatedDate ?? publishDate` (articles) et d'une
   date de modification réelle si trackée (pages statiques) ; sinon omettre `lastmod` sur
   ces dernières plutôt que d'inventer une date.
2. **Info** — Aucune action sur priority/changefreq, ils sont déjà absents.
3. **Info** — `/articles/` (403) n'a aucun impact SEO actuel ; à surveiller seulement si un
   futur lien interne venait à pointer dessus.
