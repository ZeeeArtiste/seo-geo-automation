# Performance & Core Web Vitals — aspirob.com

**Avertissement méthodologique :** aucune donnée de champ (CrUX) n'est disponible — le domaine est en ligne depuis 2 jours et n'a pas encore de volume de trafic Chrome suffisant. **Toutes les mesures ci-dessous sont des mesures de laboratoire** (Lighthouse 13.5.0, CLI local, throttling mobile simulé "simulate", CPU/réseau dégradés selon le profil Lighthouse standard). Elles donnent une bonne indication des goulots d'étranglement mais ne remplacent pas des données réelles d'utilisateurs. PageSpeed Insights API a été tenté deux fois mais a systématiquement renvoyé `"PSI rate limit exceeded (240 QPM / 25,000 QPD)"` — aucune donnée CrUX/PSI n'a donc pu être récupérée par ce canal ; ne pas déduire de conclusion de terrain de ce document.

Outils utilisés : Lighthouse CLI 13.5.0 (Node 22.23.2, Chromium 1243 headless via Playwright, `CHROME_PATH` positionné manuellement — le binaire Chrome par défaut n'était pas trouvable par `npx lighthouse`), complété par des mesures `curl` de TTFB brut.

---

## Page d'accueil (https://aspirob.com/)

**Score de performance Lighthouse (mobile, lab) : 87/100**

| Métrique | Valeur (lab) | Seuil "Good" | Statut |
|---|---|---|---|
| LCP | **3.75 s** | ≤2.5 s | ❌ Needs improvement (2.5–4.0 s) |
| CLS | **0** | ≤0.1 | ✅ Good |
| INP | **non mesurable en lab** (pas d'interaction simulée) — proxy Total Blocking Time = 175 ms | ≤200 ms | ℹ️ TBT bas, mais ce n'est pas l'INP — à confirmer en champ |
| FCP | 0.96 s | — | ✅ |
| Speed Index | 2.27 s | — | ✅ |
| TTFB (serveur) | ~0 ms (Lighthouse) / 29 ms (curl direct, hors throttling) | — | ✅ excellent |
| Poids total de page | 501 KiB (512 853 octets) | — | — |

### Ce qui pèse réellement (accueil)

1. **Images surdimensionnées — cause principale du LCP dégradé.** Les 6 images WebP de la page sont **toutes servies en 1600×1066/1049 px**, quel que soit leur usage réel à l'écran (des vignettes de liste affichées en 94×63 px reçoivent le fichier plein format). Lighthouse chiffre le gaspillage à **481 600 octets sur 512 853 octets de poids total de page** (soit ~94 % du poids total en octets inutiles) :
   - `navigation-lidar-camera-aspirateur-robot-differences.webp` : 129,8 Ko envoyés pour un affichage 94×63 px → 129,4 Ko gaspillés
   - `accueil.webp` (image LCP, hero) : 119,7 Ko envoyés pour un affichage 362×241 px → 113,6 Ko gaspillés
   - `aspirateur-robot-animaux-erreurs-eviter.webp` : 78,6 Ko pour 94×63 px → 78,4 Ko gaspillés
   - `roomba-j9-plus-vs-roborock-s8-pro-ultra.webp` : 73,5 Ko pour 362×241 px → 67,8 Ko gaspillés
   - `navigation-lidar-aspirateur-robot-explication.webp` : 47,9 Ko pour 94×63 px → 47,8 Ko gaspillés
   - `aspirateur-robot-poils-animaux-chat-chien.webp` : 44,9 Ko pour 94×63 px → 44,8 Ko gaspillés

   Sous throttling mobile simulé, ce volume d'images fait basculer le LCP de "bon" à "à améliorer". L'image LCP (`accueil.webp`) a déjà `fetchpriority="high"` et `loading="eager"` (bonne pratique en place), mais son poids de fichier reste ~5× supérieur à ce qui est nécessaire pour sa zone d'affichage.

2. **CSS bloquant le rendu.** `/_astro/_category_.CqWf20Lo.css` (9,6 Ko transférés) est chargé en synchrone dans le `<head>` et Lighthouse estime ~150 ms de rendu retardé à cause de ce fichier.

3. **Décomposition du LCP (insight Lighthouse) :** TTFB 41 ms → délai de démarrage du chargement de la ressource 46 ms → durée de chargement de la ressource 103 ms → délai de rendu de l'élément 1104 ms. **Attention : la somme de ces quatre segments (~1,3 s) ne correspond pas au LCP total affiché (3,75 s).** C'est un artefact connu de Lighthouse en mode `simulate` (le score global est calculé par un modèle réseau simulé "Lantern", tandis que l'insight de décomposition est basé sur la trace observée à vitesse réelle) — je ne peux pas retraiter cet écart sans capturer une trace en throttling réel (`--throttling-method=devtools`), ce qui n'a pas été fait ici faute de budget de mesure restant. Ne pas prendre les sous-parties comme des durées absolues fiables ; seule la valeur LCP globale (3,75 s) est le résultat scoré.

4. **Polices : mesure incomplète, signalé plutôt qu'estimé.** La trace réseau Lighthouse de cette page ne montre **aucune requête de police (0 police, 0 script)** alors que le CSS déclare bien 4 `@font-face` (`Inter-latin.woff2`, `Inter-latin-ext.woff2`, `SourceSerif4-latin.woff2`, `SourceSerif4-latin-ext.woff2`, toutes en `font-display: swap`). Vérification manuelle par `curl` : les fichiers existent et répondent en <20 ms (`Inter-latin.woff2` = 48,4 Ko, `SourceSerif4-latin.woff2` = 122 Ko). Je n'ai pas pu déterminer avec certitude pourquoi Lighthouse ne les a pas capturés dans cette exécution (possible particularité du Chromium headless utilisé) — **je ne donne donc pas de chiffre de délai de police, faute de mesure fiable**. Aucun `<link rel="preload">` n'est présent pour ces polices dans le `<head>`.

5. **Pas de script JS sur l'accueil** (uniquement du JSON-LD) — confirmé à la fois dans le HTML source et dans la trace Lighthouse (0 script). Aucun tiers détecté (`third-parties-insight` vide).

---

## Article : /articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/

**Score de performance Lighthouse (mobile, lab) : 100/100**

| Métrique | Valeur (lab) | Seuil "Good" | Statut |
|---|---|---|---|
| LCP | **1.65 s** | ≤2.5 s | ✅ Good |
| CLS | **0** | ≤0.1 | ✅ Good |
| INP | non mesurable en lab — proxy TBT = 41 ms | ≤200 ms | ℹ️ à confirmer en champ |
| FCP | 0.90 s | — | ✅ |
| Speed Index | 0.90 s | — | ✅ |
| TTFB (serveur) | ~0 ms (Lighthouse) / 46 ms (curl direct) | — | ✅ excellent |
| Poids total de page | 96 KiB (98 547 octets) | — | — |

### Ce qui pèse réellement (article)

1. **Même défaut d'images responsives, mais impact plus limité ici.** L'unique image hero `roomba-j9-plus-vs-roborock-s8-pro-ultra.webp` est servie en 1600×1066 px pour un affichage 362×241 px : 73,5 Ko envoyés, **69,7 Ko estimés gaspillés**. Comme il n'y a qu'une seule grosse image (contre 6 sur l'accueil), le LCP reste bon malgré ce gaspillage.
2. **Même CSS bloquant** (`_category_.CqWf20Lo.css`, 9,6 Ko, ~150 ms/30 ms d'économie potentielle estimée par Lighthouse selon l'audit).
3. **Décomposition du LCP :** TTFB 23 ms → délai ressource 22 ms → durée chargement ressource 29 ms → délai de rendu élément 73 ms (total ~148 ms, à comparer au LCP scoré 1,65 s — même réserve méthodologique que pour l'accueil : écart entre trace observée et modèle simulé, non retraité ici).
4. **Script de suivi de lecture — mesure manquée, signalé et non estimé.** Le HTML source de cette page contient bien un `<script type="module">` (probablement le tracker de lecture mentionné dans le contexte), mais la trace réseau Lighthouse de cette exécution rapporte **0 script chargé**. Je n'ai pas pu mesurer son poids, son temps d'exécution ni son impact sur le TBT/INP dans le temps imparti. **Je ne donne aucun chiffre pour ce script — à re-mesurer spécifiquement** (par ex. `curl` sur son URL + un profil Lighthouse en mode `--throttling-method=devtools` avec trace complète, ou l'onglet Performance de Chrome DevTools).
5. **Pas de CLS constaté** (`cls-culprits-insight` vide), aucune requête tierce détectée.

---

## Synthèse des recommandations, par impact attendu

1. **Priorité haute — Images responsives sur toutes les pages (impact LCP fort, surtout accueil).** Générer des variantes redimensionnées (ex. 400/800/1200 px de large selon le composant : vignette 94×63, carte 362×241, hero) et servir via `srcset`/`sizes` ou des tailles de sortie Astro `<Image>` adaptées au conteneur réel. Rien qu'en corrigeant les 6 images de l'accueil, l'estimation Lighthouse est de ~470 Ko économisés sur 501 Ko de poids de page (~94 %) — c'est le levier le plus rentable identifié dans cet audit.
2. **Priorité moyenne — Éliminer le blocage de rendu du CSS.** `_category_.CqWf20Lo.css` (9,6 Ko) est chargé en synchrone sur toutes les pages testées. Envisager d'inliner le CSS critique above-the-fold et de différer le reste, ou de scinder ce fichier partagé pour réduire ce qui bloque le premier rendu (~150 ms estimés par page).
3. **Priorité moyenne — Vérifier le chargement des polices en conditions réelles.** Le `font-display: swap` est déjà en place (bon point, pas de FOIT), mais aucun `<link rel="preload">` n'existe pour les 2 fichiers de police critiques au-dessus de la ligne de flottaison (`Inter-latin.woff2`, `SourceSerif4-latin.woff2`, 48–122 Ko). À valider avec un outil qui capture correctement les requêtes de police (DevTools réseau en navigateur réel), la mesure Lighthouse de cet audit n'ayant pas su les capturer.
4. **Priorité basse mais à vérifier — script de suivi de lecture.** Son poids et son impact sur le thread principal n'ont pas pu être mesurés dans cet audit ; à profiler spécifiquement avant de le considérer comme neutre pour l'INP.
5. **Points déjà solides, à ne pas casser :** TTFB très rapide (VPS proche, pas de CDN mais latence négligeable en usage direct), CLS parfait (0) sur les deux pages grâce aux dimensions déclarées sur toutes les images, aucun script tiers bloquant, `fetchpriority="high"` déjà appliqué à l'image LCP des deux pages testées.

## Mesures explicitement non obtenues (ne pas combler par une estimation)

- **Aucune donnée de champ CrUX/PSI** (site trop récent + API PSI en limite de quota au moment du test).
- **INP réel** : non mesurable en laboratoire sans interaction utilisateur simulée ; seul le TBT (proxy imparfait) a été rapporté (175 ms accueil, 41 ms article).
- **Poids/temps d'exécution du script de suivi de lecture** sur la page article : présent dans le HTML mais absent de la trace réseau Lighthouse capturée.
- **Requêtes de polices** sur les deux pages : absentes de la trace réseau Lighthouse capturée malgré la présence confirmée des fichiers côté serveur (vérifiée séparément via `curl`).
- **Support HTTP/2** du serveur nginx : non confirmé formellement (l'en-tête de réponse observé via une requête `curl` simple affichait `HTTP/1.1`, mais ce test n'est pas concluant sans négociation ALPN explicite) — à vérifier, car cela conditionne le parallélisme de téléchargement une fois les images redimensionnées.
