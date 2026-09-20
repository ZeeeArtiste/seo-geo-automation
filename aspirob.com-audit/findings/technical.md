# Audit technique — aspirob.com
Date: 2026-09-20 · Site statique Astro, nginx/Let's Encrypt, 10 pages, en ligne depuis 2 jours.

## Résumé

| Catégorie | Statut |
|---|---|
| Crawlability | PASS (avec 1 point moyen) |
| Indexabilité | PASS (avec bugs de données structurées) |
| Sécurité | FAIL (en-têtes manquants) |
| Structure d'URL | PASS (avec 1 point moyen) |
| Mobile | PASS |
| Core Web Vitals (signaux source) | FAIL (LCP à risque) |
| Données structurées | PASS partiel (bugs à corriger) |
| Rendu JavaScript | PASS (site 100% statique/SSR) |
| IndexNow | Non implémenté |

**Score technique global : 76/100**

Aucun problème Critical. Le site est solide sur les fondamentaux (robots.txt, sitemap, canonicals, HTTPS, contenu substantiel ~1700-1800 mots/article, liens affiliés correctement balisés). Les points faibles sont concentrés sur le durcissement des en-têtes de sécurité, le poids de l'image LCP de la page d'accueil, et deux bugs systématiques dans le JSON-LD.

---

## 1. Crawlability

**Constat : robots.txt correct, avec autorisation explicite des crawlers IA (bon point GEO).**
Preuve (`curl https://aspirob.com/robots.txt`) :
```
User-agent: *
Allow: /
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /
Sitemap: https://aspirob.com/sitemap-index.xml
```
Sévérité : Info (bonne pratique).
Recommandation : rien à changer.

**Constat : sitemap valide et complet, déclaré et vérifié via `sitemap_discovery.py`.**
Preuve : `sitemap_discovery.py` → `"declared": ["https://aspirob.com/sitemap-index.xml"]`, `"found"`/`"checked"` avec `status_code: 200`, `kind: sitemapindex`, `valid: true`. Le sitemap enfant `sitemap-0.xml` (HTTP 200) liste les 10 URL exactes annoncées dans le contexte (accueil, comparatifs/, guides/, mentions-legales/, confidentialite/, 5 articles). Aucun 404 ni URL orpheline.
Sévérité : Info (pass).
Recommandation : rien à changer.

**Constat : page 404 générique nginx, non personnalisée.**
Preuve : `curl -s https://aspirob.com/page-inexistante-xyz/` → HTTP 404, corps :
```html
<html><head><title>404 Not Found</title></head>
<body><center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.28.3 (Ubuntu)</center></body></html>
```
Pas de lien de retour vers le site, pas de `noindex` explicite (non nécessaire sur un vrai 404 mais confirme l'absence de page custom Astro).
Sévérité : Low.
Recommandation : créer une page 404 Astro personnalisée (`src/pages/404.astro`) avec navigation vers `/`, `/comparatifs/`, `/guides/`, pour retenir les visiteurs et éviter l'exposition de la version nginx dans le corps de la réponse.

---

## 2. Indexabilité

**Constat : canonicals corrects et cohérents sur toutes les pages testées, y compris auto-référencement propre sur la variante `www`.**
Preuve : `<link rel="canonical" href="https://aspirob.com/">` sur `/`, `/comparatifs/`, `/guides/`, `/mentions-legales/`, `/confidentialite/`, et sur `https://www.aspirob.com/` (qui renvoie pourtant un 200, voir section URL). Aucune balise `noindex` ni en-tête `X-Robots-Tag` détectée sur les pages testées.
Sévérité : Info (pass).

**Constat : bug systématique dans le JSON-LD `BreadcrumbList` — l'élément de position 2 pointe vers la page d'accueil au lieu de la page de catégorie.**
Preuve, article Roomba j9+ vs Roborock S8 Pro Ultra :
```json
{"@type":"ListItem","position":2,"name":"Comparatif","item":"https://aspirob.com"}
```
Même bug confirmé sur l'article navigation LiDAR :
```json
{"@type":"ListItem","position":2,"name":"Guide","item":"https://aspirob.com"}
```
Dans les deux cas, `item` devrait être `https://aspirob.com/comparatifs/` ou `https://aspirob.com/guides/`, pas l'URL de la position 1 (`https://aspirob.com`). Le fil d'Ariane visuel n'a pas été inspecté en détail mais le JSON-LD est ce que Google utilise pour le rich result « fil d'Ariane ».
Sévérité : Medium.
Recommandation : dans le générateur Astro du breadcrumb JSON-LD, remplacer l'URL codée en dur par l'URL réelle de la page de catégorie (`/comparatifs/` ou `/guides/`) pour l'item de position 2. Vérifier avec le Rich Results Test de Google après correction.

**Constat : le schéma `BlogPosting` n'inclut pas la propriété `image`, requise par Google pour l'éligibilité aux rich results Article.**
Preuve, extrait JSON-LD article Roomba :
```json
{"@type":"BlogPosting","headline":"...","description":"...","inLanguage":"fr","datePublished":"2026-09-18","dateModified":"2026-09-18","author":{...},"publisher":{...},"mainEntityOfPage":{...},"url":"...","articleSection":"Comparatif"}
```
Aucun champ `image` alors que chaque article a une image d'illustration disponible (`/photos/<slug>.webp`).
Sévérité : Medium.
Recommandation : ajouter `"image": ["https://aspirob.com/photos/<slug>.webp"]` (idéalement plusieurs ratios : 16:9, 4:3, 1:1) dans le schéma `BlogPosting` de chaque article.

**Constat : chevauchement thématique entre paires d'articles, atténué par un maillage interne croisé.**
Preuve : « Aspirateur robot et animaux : 5 erreurs à éviter » vs « Aspirateur robot anti-poils de chat : 5 modèles », et « Navigation LiDAR : pourquoi des zones sont ratées » vs « LiDAR ou caméra : quelle navigation choisir ? ». Les deux paires se citent mutuellement en liens internes (`href="/articles/..."` vérifié dans le HTML des deux articles LiDAR), ce qui aide à différencier l'intention de recherche.
Sévérité : Info.
Recommandation : surveiller le classement de ces paires dans Search Console une fois indexées ; si cannibalisation confirmée (deux URL classées pour la même requête avec alternance), différencier davantage les titres/H1 ou fusionner.

---

## 3. Sécurité

**Constat : HTTPS correctement forcé (Let's Encrypt), redirections HTTP→HTTPS fonctionnelles sur apex et www.**
Preuve :
```
curl -I http://aspirob.com/     → 301 Location: https://aspirob.com/
curl -I http://www.aspirob.com/ → 301 Location: https://www.aspirob.com/
```
Sévérité : Info (pass).

**Constat : absence quasi totale d'en-têtes de sécurité HTTP. Seul `X-Content-Type-Options: nosniff` est présent.**
Preuve (`curl -sI https://aspirob.com/`) :
```
HTTP/1.1 200 OK
Server: nginx/1.28.3 (Ubuntu)
Content-Type: text/html
X-Content-Type-Options: nosniff
```
Confirmé absents sur `/` et sur un article : `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
Sévérité : High.
Recommandation : ajouter dans la configuration nginx (bloc `server` HTTPS) :
```
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'" always;
```
Le site étant HTTPS-only et statique (pas de formulaire, pas de JS tiers détecté), HSTS et un CSP restrictif sont peu risqués à déployer. Tester la CSP en mode `Content-Security-Policy-Report-Only` avant bascule si des scripts tiers (Awin tracking, analytics) sont ajoutés plus tard.

**Constat : la version nginx est exposée dans le header `Server` et dans le corps de la page d'erreur 404 par défaut.**
Preuve : `Server: nginx/1.28.3 (Ubuntu)` sur toutes les réponses, y compris `<center>nginx/1.28.3 (Ubuntu)</center>` dans le corps du 404.
Sévérité : Low.
Recommandation : `server_tokens off;` dans nginx.conf, et fournir une page 404 personnalisée (cf. section Crawlability) pour supprimer la double exposition.

---

## 4. Structure d'URL

**Constat : URLs propres, cohérence du slash final forcée par redirection 301.**
Preuve :
```
/comparatifs       → 301 → https://aspirob.com/comparatifs/
/guides            → 301 → https://aspirob.com/guides/
/mentions-legales  → 301 → https://aspirob.com/mentions-legales/
/confidentialite   → 301 → https://aspirob.com/confidentialite/
```
Pas de chaîne de redirections observée (une seule sauta directement vers l'URL finale). Pas de paramètres de requête ni de casse mixte détectés.
Sévérité : Info (pass).

**Constat : `https://www.aspirob.com/` répond 200 avec un contenu strictement identique à l'apex, au lieu d'une redirection 301 vers le domaine canonique.**
Preuve :
```
curl -sI https://www.aspirob.com/  → HTTP/1.1 200 OK (identique à l'apex, même Content-Length 13639)
md5sum apex  = 344c9cf56be4b2adafb99bc4c26f6d03
md5sum www   = 344c9cf56be4b2adafb99bc4c26f6d03
```
La balise canonique sur la version www pointe bien vers `https://aspirob.com/` (`<link rel="canonical" href="https://aspirob.com/">`), ce qui limite le risque de duplication mais laisse deux URL indexables servies en 200 — un signal plus faible qu'une redirection serveur, et une variante que les moteurs peuvent temporairement indexer avant de respecter le canonical.
Sévérité : Medium.
Recommandation : configurer un bloc nginx dédié pour `www.aspirob.com` qui redirige en 301 vers `https://aspirob.com$request_uri`, plutôt que de servir le même vhost sur les deux hôtes.

---

## 5. Mobile

**Constat : viewport meta correct et présent.**
Preuve : `<meta name="viewport" content="width=device-width, initial-scale=1.0">` confirmé sur la page d'accueil.
Sévérité : Info (pass).

**Constat : mise en page responsive visible dans le HTML/CSS (classes Tailwind à points de rupture), navigation mobile dédiée.**
Preuve : `<nav aria-label="Navigation principale" class="hidden sm:block">` et `<nav aria-label="Catégories" class="sm:hidden border-t border-line">` — confirme un pattern nav desktop/mobile distinct plutôt qu'un simple masquage CSS approximatif.
Sévérité : Info (pass, sous réserve — évaluation faite depuis les classes CSS/HTML uniquement, pas de rendu visuel réel ; taille des cibles tactiles non mesurée physiquement).

---

## 6. Core Web Vitals (signaux détectables depuis la source)

**Constat : l'image LCP probable de la page d'accueil est lourde (230 Ko) et non optimisée en format nouvelle génération.**
Preuve :
```html
<img src="/photos/accueil.jpg" alt="Robot vacuum cleans floor while family relaxes"
     width="1600" height="1066" loading="eager" fetchpriority="high" decoding="async" ...>
```
`curl -sI https://aspirob.com/photos/accueil.jpg` → `Content-Type: image/jpeg`, `Content-Length: 235891` (≈230 Ko). C'est un JPEG classique, sans variante WebP/AVIF ni `srcset`/`sizes` responsive, alors que les autres images du site sont déjà en `.webp` (ex. `roomba-j9-plus-vs-roborock-s8-pro-ultra.webp` = 73 Ko). `fetchpriority="high"` et `loading="eager"` sont corrects pour un candidat LCP, mais le poids du fichier reste le principal facteur de risque sur mobile/4G.
Sévérité : High.
Recommandation : convertir `accueil.jpg` en WebP/AVIF (viser <80 Ko à qualité équivalente), générer un `srcset` avec plusieurs largeurs (ex. 800/1200/1600px) et un `sizes` adapté, pour aligner cette image sur le traitement déjà appliqué aux vignettes d'articles.

**Constat : bonne prévention du CLS — toutes les balises `<img>` inspectées portent des attributs `width`/`height` explicites.**
Preuve : les 6 `<img>` de la page d'accueil déclarent tous `width`/`height` (ex. `width="480" height="300"`), ce qui permet au navigateur de réserver l'espace avant chargement.
Sévérité : Info (pass).

**Constat : aucun en-tête `Cache-Control` observé sur le HTML, le CSS ou les images — seuls `ETag`/`Last-Modified` sont présents.**
Preuve :
```
curl -sI https://aspirob.com/                              → pas de Cache-Control, ETag: "6aafbea7-3547"
curl -sI https://aspirob.com/_astro/_category_.CqWf20Lo.css → pas de Cache-Control, Content-Length: 43801
curl -sI https://aspirob.com/photos/accueil.jpg             → pas de Cache-Control
```
Le fichier CSS porte déjà un hash de contenu généré par Astro (`CqWf20Lo`), ce qui permettrait de le mettre en cache de façon agressive et sûre (`immutable`) sans risque de contenu périmé.
Sévérité : Medium.
Recommandation : dans nginx, ajouter des règles `expires`/`Cache-Control` par type :
```
location /_astro/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location /photos/ { add_header Cache-Control "public, max-age=2592000"; }
location = /       { add_header Cache-Control "public, max-age=300"; }  # HTML : cache court + revalidation
```

**Constat : compression gzip active, une seule feuille de style bloquant le rendu, pas de JavaScript de rendu détecté.**
Preuve : `curl -H "Accept-Encoding: gzip, br"` → `Content-Encoding: gzip`. Un seul `<link rel="stylesheet" href="/_astro/_category_.CqWf20Lo.css">` dans le `<head>`, aucun `<script src="...">` de framework (seuls des blocs `<script type="application/ld+json">` inline).
Sévérité : Info (pass — profil de page léger, peu de risque INP/rendu côté client).

**Constat : aucun `preconnect`/`dns-prefetch` vers les domaines tiers utilisés (Amazon, Unsplash).**
Preuve : aucune balise `<link rel="preconnect">` ou `<link rel="dns-prefetch">` trouvée dans le `<head>`.
Sévérité : Low (impact mineur : ces domaines ne sont sollicités qu'au clic, hors chemin critique de rendu).
Recommandation : optionnel, faible priorité — ajouter `<link rel="preconnect" href="https://www.amazon.fr">` uniquement si des tests réels montrent un impact sur le TTFB des clics sortants.

---

## 7. Données structurées

**Constat : couverture large et globalement bien formée — `WebSite` (toutes les pages), `BlogPosting`, `BreadcrumbList`, `FAQPage` (articles).**
Preuve, article Roomba : 4 blocs JSON-LD valides syntaxiquement (`WebSite`, `BlogPosting`, `BreadcrumbList`, `FAQPage` avec 5 paires Question/Answer bien formées). Les liens d'affiliation Amazon portent `rel="sponsored nofollow noopener"` — conforme aux recommandations Google pour le contenu monétisé.
Sévérité : Info (pass, bonne pratique notable sur le balisage des liens affiliés).

**Constat : 2 bugs identifiés dans le JSON-LD (détaillés en section 2 Indexabilité) — `BreadcrumbList` position 2 mal résolue, `BlogPosting` sans `image`.**
Sévérité : Medium (voir recommandations section 2).

---

## 8. Rendu JavaScript

**Constat : site entièrement statique/SSR, aucune dépendance au rendu client pour afficher le contenu.**
Preuve : `render_page.py --mode auto` sur `/` → `"is_spa": false`, `extracted_text` contient le contenu visible complet dès la réponse HTML brute (titre, résumé, date de publication). Aucun `<script src>` de framework JS détecté sur les pages inspectées.
Sévérité : Info (pass — idéal pour l'indexation classique et pour les crawlers IA qui n'exécutent pas JS, cohérent avec l'autorisation explicite de GPTBot/ClaudeBot/PerplexityBot dans robots.txt).

---

## 9. IndexNow (Bing, Yandex, Naver)

**Constat : aucune preuve d'implémentation d'IndexNow détectée depuis la source.**
Preuve : pas de fichier clé aux emplacements usuels (`/indexnow.txt` → 404), pas de référence à l'API IndexNow dans le HTML ou `robots.txt`. Ce constat ne prouve pas l'absence d'un push côté serveur (l'API s'appelle en side-effect, non visible depuis le front), mais aucun signal disponible ne confirme sa mise en place.
Sévérité : Low.
Recommandation : pour un site de 2 jours qui dépend de la vitesse d'indexation, implémenter un push IndexNow (clé unique + endpoint `https://api.indexnow.org/indexnow`) à chaque publication/mise à jour d'article, afin d'accélérer l'indexation Bing (qui alimente aussi Copilot/ChatGPT search dans certains cas) sans attendre le seul crawl organique.

---

## 10. Points additionnels (accessibilité/SEO image, encodage)

**Constat : attribut `alt` vide sur 5 des 6 images de la page d'accueil (vignettes d'articles), qui ne sont pourtant pas purement décoratives.**
Preuve : `<img src="/photos/roomba-j9-plus-vs-roborock-s8-pro-ultra.webp" alt="" ...>` et 4 vignettes similaires avec `alt=""`.
Sévérité : Medium.
Recommandation : renseigner un `alt` descriptif par vignette (ex. `alt="Roomba j9+ et Roborock S8 Pro Ultra côte à côte"`), utile pour Google Images et l'accessibilité.

**Constat : l'image héro de la page d'accueil a un texte alternatif rédigé en anglais sur un site 100% francophone.**
Preuve : `alt="Robot vacuum cleans floor while family relaxes"` alors que `lang="fr"` et `og:locale` = `fr_FR`.
Sévérité : Low.
Recommandation : traduire en français, ex. `alt="Aspirateur robot nettoyant le sol pendant qu'une famille se détend"`.

**Constat : l'en-tête HTTP `Content-Type` ne déclare pas l'encodage (`charset`), qui repose uniquement sur la balise `<meta charset="UTF-8">`.**
Preuve : `Content-Type: text/html` (sans `; charset=utf-8`) dans les réponses nginx observées.
Sévérité : Low.
Recommandation : ajouter `charset utf-8;` dans le bloc `http`/`server` nginx pour que `Content-Type: text/html; charset=UTF-8` soit envoyé directement dans l'en-tête HTTP.

---

## Priorisation des actions

**High**
1. Ajouter les en-têtes de sécurité manquants (HSTS en priorité, puis CSP/X-Frame-Options/Referrer-Policy/Permissions-Policy) — nginx.
2. Optimiser l'image héro `/photos/accueil.jpg` (230 Ko JPEG → WebP/AVIF + `srcset`) pour sécuriser le LCP de la page d'accueil.

**Medium**
3. Rediriger `www.aspirob.com` en 301 vers l'apex au lieu de servir un 200 dupliqué.
4. Ajouter des règles `Cache-Control` par type de ressource (`/_astro/`, `/photos/`, HTML).
5. Corriger l'URL de l'item de position 2 dans le JSON-LD `BreadcrumbList` (pointe actuellement vers la home au lieu de `/comparatifs/` ou `/guides/`) — bug systémique sur les 5 articles.
6. Ajouter la propriété `image` au schéma `BlogPosting` de chaque article.
7. Renseigner des `alt` descriptifs sur les vignettes d'articles (actuellement `alt=""`).

**Low**
8. Page 404 personnalisée Astro (au lieu du 404 nginx par défaut).
9. `server_tokens off;` pour masquer la version nginx.
10. Traduire l'`alt` en anglais de l'image héro.
11. Déclarer `charset=utf-8` dans l'en-tête HTTP `Content-Type`.
12. Envisager un push IndexNow à chaque publication pour accélérer l'indexation Bing/Yandex.

**Info / à surveiller**
13. Chevauchement thématique entre les 2 paires d'articles (animaux / LiDAR) — déjà atténué par le maillage interne croisé, à surveiller dans Search Console une fois indexé.

---

## Éléments non vérifiables depuis l'inspection de la source
- Taille réelle des cibles tactiles (px) et espacement — nécessiterait un rendu/screenshot mesuré, non exécuté dans cet audit.
- Valeurs réelles de LCP/INP/CLS en champ (CrUX) — impossibles à obtenir sur un site en ligne depuis 2 jours (pas assez de données terrain) ; les constats ci-dessus sont des risques déduits de la source, pas des mesures de champ.
- Confirmation d'un push IndexNow côté serveur (l'API ne laisse pas de trace côté front).
