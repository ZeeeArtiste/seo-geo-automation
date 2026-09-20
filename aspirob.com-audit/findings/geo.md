# Analyse GEO — aspirob.com

Date de l'audit : 2026-09-20 · 10 URL au sitemap, 5 articles · Domaine en ligne depuis 2 jours
Méthode : rendu via `render_page.py --mode auto` (raw fetch, aucun SPA détecté), analyse passage par passage
sur le texte extrait par trafilatura, vérification robots.txt / llms.txt / RSL / schéma JSON-LD.

## Score de préparation GEO : 61 / 100

| Dimension | Poids | Score | Pondéré |
|---|---|---|---|
| Citabilité | 25 % | 60 | 15,0 |
| Lisibilité structurelle | 20 % | 80 | 16,0 |
| Contenu multi-modal | 15 % | 55 | 8,25 |
| Autorité et signaux de marque | 20 % | 22 | 4,4 |
| Accessibilité technique | 20 % | 85 | 17,0 |
| **Total** | | | **60,65 → 61** |

Lecture : les fondations techniques sont au-dessus de la moyenne du secteur affilié. Le plafond est
imposé par l'absence totale d'autorité vérifiable — pas de sources, pas d'entité, pas d'empreinte de marque.

## 1. Accès des crawlers IA

Le `robots.txt` nomme cinq agents et les autorise. La directive `User-agent: * / Allow: /` en tête
couvre par défaut tout agent non nommé : **aucun crawler IA n'est effectivement bloqué**. Le problème
n'est pas l'accès, c'est le ciblage : quatre des cinq agents nommés ne gouvernent pas la citabilité
en recherche IA.

| Crawler | Ce qu'il gouverne réellement | Nommé ? | Statut effectif |
|---|---|---|---|
| OAI-SearchBot | Citation dans ChatGPT Search | Non | Autorisé via `*` |
| ChatGPT-User | Récupération à la demande (clic utilisateur dans ChatGPT) | Oui | Autorisé |
| GPTBot | Entraînement OpenAI uniquement — ne dit rien de ChatGPT Search | Oui | Autorisé |
| Claude-SearchBot | Citation dans la recherche Claude | Non | Autorisé via `*` |
| ClaudeBot | Entraînement Anthropic uniquement | Oui | Autorisé |
| PerplexityBot | Index de Perplexity | Oui | Autorisé |
| Googlebot | Google Search **et** AI Overviews | Non nommé | Autorisé via `*` |
| Google-Extended | Entraînement/grounding Gemini et Vertex uniquement — jamais l'inclusion dans Search ou AI Overviews | Oui | Autorisé |
| Bingbot | Bing et Copilot | Non nommé | Autorisé via `*` |
| Applebot | Siri / Spotlight / Safari | Non nommé | Autorisé via `*` |
| Applebot-Extended | Entraînement Apple Intelligence uniquement | Non | Autorisé via `*` |
| CCBot | Common Crawl (entraînement) | Non | Autorisé via `*` |

Deux conséquences concrètes :
- **Les deux agents qui décident réellement de la citation en recherche IA — OAI-SearchBot et
  Claude-SearchBot — ne sont pas nommés.** Ils passent aujourd'hui, mais uniquement par héritage du
  groupe `*`. Le jour où un `Disallow` est ajouté à `*` (page de test, espace admin, paramètres de
  tracking), ils le prendront ; les groupes nommés, eux, seront protégés. Le fichier protège
  explicitement les crawlers d'entraînement et laisse les crawlers de citation en dépendance implicite :
  la priorité est inversée.
- Autoriser Google-Extended et ClaudeBot est un choix légitime (cela alimente les modèles), mais **cela
  n'a aucun effet sur l'apparition dans AI Overviews ou dans la recherche Claude**. Ne pas le compter
  comme un acquis GEO.

Licence : aucun signal RSL 1.0. `/.well-known/rsl.xml`, `/rsl.xml`, `/license.xml` → 404, aucun champ
`License:` dans robots.txt, aucun `<link rel="license">`. Pour un site affilié sans contenu propriétaire
mesurable, c'est une omission mineure, mais la déclaration de licence est le seul moyen de poser des
conditions d'usage lisibles par machine.

## 2. llms.txt — présent et bien formé

C'est le point fort le plus inattendu du site. Le fichier respecte la spécification (H1, blockquote de
résumé, sections H2, listes de liens) et va au-delà :
- les 5 articles avec URL, catégorie, date de publication **et la réponse directe complète** ;
- une section « Méthode éditoriale » qui déclare explicitement ce que le site ne fait pas : pas de test
  produit, pas de prix, pas de chiffres non vérifiables (dont les pascals), rédaction assistée par IA
  relue à la main ;
- une section « Notes pour les systèmes automatisés » qui annonce le balisage FAQPage / BlogPosting.

Cette transparence est un vrai différenciateur : elle donne à un modèle une raison de traiter le site
comme une source honnête plutôt que comme un énième comparatif affilié.

Manques :
- pas de `/llms-full.txt` (version texte intégral des articles) ;
- les 5 pages non-articles (accueil, /guides/, /comparatifs/, mentions légales, confidentialité) ne sont
  pas listées, alors que /guides/ et /comparatifs/ sont des points d'entrée thématiques ;
- pas de date de dernière mise à jour du fichier lui-même.

## 3. Citabilité au niveau du passage — 60/100

### Ce qui marche

L'encadré « L'essentiel » (46 à 51 mots) placé avant le sommaire est exactement le format que les moteurs
génératifs extraient : autonome, factuel, répondant à la question du titre, sans anaphore. Répliqué à
l'identique dans llms.txt. C'est la meilleure décision structurelle du site.

Répartition des longueurs de section (sur 33 sections H2 analysées, hors « À lire aussi ») :

| Plage | Sections | Verdict |
|---|---|---|
| < 100 mots | 6 | Trop courtes pour être citées seules |
| 100–167 mots (zone optimale) | 14 | Zone de citation idéale |
| 168–220 mots | 4 | Acceptable |
| > 220 mots | 6 | Trop denses, le modèle doit résumer au lieu de citer |

Environ 42 % des sections tombent dans la fenêtre 134–167 mots, contre 30 % qui en sortent par le haut
ou par le bas de façon pénalisante.

### Ce qui bloque réellement la citation

1. **Zéro source externe. C'est le blocage principal.** Les seuls liens sortants sont 14 liens Amazon
   affiliés et 10 crédits photo Unsplash. Aucune norme, aucun fabricant, aucun test tiers, aucune
   documentation technique. Le site avance des affirmations vérifiables — « au moins 50 cm devant et 30 cm
   de chaque côté » pour la base, « filtres tous les 2-3 mois », « poils dépassant 2-3 cm » — sans jamais
   dire d'où elles viennent. Un moteur génératif qui doit choisir entre deux passages équivalents cite
   celui qui est traçable. Le paradoxe est cruel : la page /mentions-legales/#methode explique
   scrupuleusement pourquoi les chiffres non vérifiables sont exclus, mais les chiffres qui restent ne
   sont pas sourcés non plus.

2. **Redondance entre l'encadré et le premier paragraphe.** Sur les deux articles LiDAR, le paragraphe
   qui suit « L'essentiel » reformule la même idée (« Un aspirateur robot LiDAR mesure la distance… »
   puis « Un aspirateur robot LiDAR utilise un faisceau laser… »). Le modèle voit deux candidats
   quasi-identiques et n'en privilégie aucun.

3. **Passages dépendants du contexte.** « En corrigeant ces cinq points… », « Le j9+ s'en sort mieux… »,
   « Aucun des deux si : ». Extraits isolés, ces blocs ne veulent rien dire. Un passage citable doit
   pouvoir renommer son sujet dans sa première phrase.

4. **Sections fourre-tout trop longues.** « Pourquoi votre robot rate toujours les mêmes zones » (338 mots),
   « Les modèles retenus » (447 mots), « Que fait réellement chaque robot ? » (307 mots). Les H3 internes
   existent mais ne sont pas des unités de réponse autonomes.

5. **Blocs FAQ de 228 à 327 mots.** Balisés FAQPage, ce qui est bien, mais agrégés en une seule section
   H2 de 5 questions. Les réponses individuelles (40 à 60 mots) sont de bonne longueur — c'est le
   conteneur qui dilue.

6. **Titres de section : ~55 % sont formulés en question** (« Faut-il vider le bac après chaque
   passage ? », « Que voit réellement un LiDAR ? »). Bon ratio. Les autres sont descriptifs
   (« Les modèles retenus », « Verdict », « Les deux modèles face à face ») et perdent l'ancrage
   sur la requête.

## 4. Lisibilité structurelle — 80/100

HTML statique, sémantique, hiérarchie H1 → H2 → H3 → H4 cohérente. Tableaux comparatifs sur 4 des
5 articles. Sommaire après l'encadré. Breadcrumbs. JSON-LD complet et valide sur chaque article :
WebSite, Organization, BlogPosting, Person, WebPage, BreadcrumbList, FAQPage. Canonical présent.

Défauts à corriger :
- **Fil d'Ariane cassé sémantiquement** : `ListItem` position 2 s'appelle « Comparatif » mais son `item`
  pointe sur `https://aspirob.com` au lieu de `https://aspirob.com/comparatifs/`. Idem pour les guides.
  La hiérarchie déclarée au modèle est donc plate.
- **H2 dupliquant le H1** sur l'article Roomba j9+ vs Roborock S8 Pro Ultra : le titre complet réapparaît
  en H2 au milieu de la page, avec 84 mots derrière. Double ancre sur la même requête, aucune des deux
  n'est dominante.
- **H4 non uniques** : « Points forts » et « À savoir » répétés 5 fois par page comparative. Sans le
  H3 parent, ces blocs sont inexploitables. Préférer « Points forts du Roborock Q5 Max+ ».
- **« À lire aussi » en H2** : bloc de navigation traité comme une section de contenu de 50 mots.
  Le passer en `<aside>` avec un titre non-H2.
- Aucun `ItemList` sur les pages comparatives ni sur /guides/ et /comparatifs/, alors que ce sont
  littéralement des listes ordonnées de produits et d'articles.
- Pas de `Product` ni `Review` — cohérent avec la politique « aucun test », donc à conserver tel quel.

## 5. Contenu multi-modal — 55/100

Points forts réels : les diagrammes SVG maison (`/diagrams/placement.svg`, `angles-morts.svg`,
`lidar-cartographie.svg`, `navigation.svg`, `station.svg`) portent un `alt` descriptif long et substantiel
— « Vue de dessus d'une pièce meublée. Depuis sa position, le laser… ». C'est du contenu textuel
exploitable, pas du remplissage. Les fiches produit SVG suivent la même logique. Images dimensionnées,
`loading` et `fetchpriority` corrects.

Faiblesses :
- **Aucune vidéo, aucune chaîne YouTube.** C'est le signal le plus fortement corrélé aux citations IA
  (~0,737), et il est à zéro.
- Photos d'en-tête Unsplash génériques avec `alt` en anglais recopié de la source : « black and white
  round device », « a robotic vacuum is on the floor next to a couch », « Girl and dog watch robot vacuum
  cleaner ». Sur un site francophone, ces alt n'apportent rien et signalent le stock photo.
- Aucun `ImageObject` dans le JSON-LD ; le `BlogPosting` n'a pas de propriété `image`, ce qui prive
  AI Overviews et Copilot de vignette.
- Les tableaux n'ont ni `<caption>` ni `scope` sur les en-têtes.

## 6. Autorité et signaux de marque — 22/100

C'est le plancher du site, et aucune optimisation on-page ne le compensera.

**Empreinte de marque : nulle.** Recherche sur « aspirob » et « aspirob.com » : aucun résultat pour le
domaine ; la requête est captée par « aspirin ». Le nom de marque entre en collision phonétique et
lexicale avec un terme médical à très fort volume — handicap durable de désambiguïsation d'entité.

| Signal | Statut |
|---|---|
| Entité Wikipedia / Wikidata | Absente |
| Présence Reddit | Aucune |
| Mentions YouTube | Aucune |
| LinkedIn (marque ou auteur) | Non lié |
| `sameAs` dans le schéma Organization | Absent |
| Backlinks | Aucun (domaine de 2 jours) |

**Schéma Organization squelettique** : `{ name, url }`. Pas de `logo`, pas de `description`, pas de
`sameAs`, pas de `foundingDate`. Rien ne permet à un moteur de rattacher « Aspirob » à une entité connue.

**Auteur nommé mais non étayé** : `Person: Dany Derensy` avec `url` pointant vers /mentions-legales/,
c'est-à-dire une page de mentions légales, pas une biographie. Aucun `jobTitle`, aucune `description`,
aucun `sameAs`, aucune page auteur, aucune trace d'expertise sur le sujet. Pour les moteurs génératifs,
un auteur sans entité rattachable équivaut à un contenu anonyme.

**Le point positif à ne pas perdre** : la déclaration de méthode (pas de test, pas de prix, pas de
pascals, assistance IA assumée) est un signal d'honnêteté rare dans l'affiliation. Elle est bien placée
dans llms.txt et sur /mentions-legales/#methode, mais elle n'est **pas visible depuis les articles
eux-mêmes** ni reflétée dans le schéma. Un lecteur — humain ou machine — qui arrive directement sur un
article ne la voit jamais.

## 7. Accessibilité technique — 85/100

| Contrôle | Résultat |
|---|---|
| Rendu | HTML statique côté serveur, `is_spa: false`, aucun JS requis |
| TTFB | 35 ms (nginx, page de 30 Ko) |
| Codes de statut | 200 sur les 10 URL, aucune redirection |
| Sitemap | `/sitemap-index.xml` → `/sitemap-0.xml`, 10 URL, déclaré dans robots.txt |
| Canonical | Présent et auto-référentiel |
| `X-Content-Type-Options` | `nosniff` |
| llms.txt | Présent, conforme |
| RSL 1.0 | Absent |
| Images | Toutes en 200, dimensions déclarées |

Pas de réserve technique significative. Tout le contenu est accessible à un crawler qui n'exécute pas
JavaScript — condition nécessaire pour Perplexity et pour les récupérations à la demande de ChatGPT.
Absence de `Last-Modified` cohérent au niveau des articles (l'en-tête reflète l'heure de déploiement,
pas la date éditoriale) : à surveiller quand le rythme de publication augmentera.

## 8. Lisibilité par plateforme

| Plateforme | Score | Analyse |
|---|---|---|
| Google AI Overviews | 35 | Googlebot autorisé et rendu SSR : accès parfait. Mais AIO s'appuie fortement sur le classement organique préalable, et le domaine a 2 jours, zéro backlink, zéro historique. Le FAQPage et les tableaux aident une fois indexé. Horizon réaliste : 4 à 8 mois. Google-Extended autorisé n'y change rien. |
| ChatGPT Search | 45 | Meilleure chance à court terme. OAI-SearchBot passe via `*`, ChatGPT-User est explicitement autorisé, llms.txt de qualité, réponses directes de 46-51 mots parfaitement formatées. Le frein est l'absence de corroboration externe : ChatGPT Search privilégie les sources recoupées. Nommer OAI-SearchBot est prioritaire. |
| Perplexity | 50 | Le profil le plus favorable : PerplexityBot nommé, HTML statique, réponses directes extractables, sujet technique bien structuré. Perplexity est moins dépendant de l'autorité de domaine et plus sensible à la correspondance de passage. Cible n°1 pour les premières citations. |
| Bing Copilot | 30 | Bingbot autorisé via `*` seulement, aucune inscription Bing Webmaster Tools détectable, indexation Bing probablement inexistante à ce stade. IndexNow serait un gain rapide (script `indexnow_submit.py` disponible). |
| Claude (recherche) | 40 | Claude-SearchBot passe via `*` mais n'est pas nommé — le site protège explicitement ClaudeBot (entraînement) et laisse le crawler de citation en implicite. Structure et llms.txt sont favorables. |

Rappel : seuls ~11 % des domaines sont cités à la fois par ChatGPT et par Google AI Overviews.
Pour un site de 2 jours, concentrer l'effort sur Perplexity et ChatGPT Search est plus rationnel que
de viser AI Overviews.

## 9. Les 5 changements à plus fort impact

**1. Citer des sources externes vérifiables — 4 à 6 h — impact très élevé**
C'est le seul blocage structurel de la citabilité. Cibler 3 à 5 liens sortants non affiliés par article :
documentation constructeur (iRobot, Roborock, Dreame), normes de filtration (EN 1822 pour le HEPA),
tests de laboratoires indépendants ou d'associations de consommateurs. Chaque affirmation chiffrée qui
subsiste (50 cm de dégagement, filtres tous les 2-3 mois, tapis de 2-3 cm) doit porter sa source inline.
Un moteur génératif arbitre entre passages équivalents par la traçabilité.

**2. Nommer OAI-SearchBot et Claude-SearchBot dans robots.txt — 10 min — impact élevé**
Ajouter deux groupes `Allow: /` explicites. Cela ne change rien aujourd'hui mais rend l'autorisation
robuste à toute future directive `Disallow` sur `*`, et corrige une hiérarchie de protection inversée :
actuellement les crawlers d'entraînement sont protégés nommément, ceux de citation ne le sont pas.
Ajouter aussi Googlebot et Bingbot explicitement pour la même raison.

**3. Construire l'entité auteur et l'entité marque — 3 à 4 h — impact élevé**
Créer `/auteur/dany-derensy/` : biographie réelle, périmètre d'expertise, méthode, et `sameAs` vers au
moins deux profils publics (LinkedIn, X, GitHub — ce qui existe réellement). Repointer le `Person.url`
du JSON-LD dessus, ajouter `jobTitle` et `description`. Compléter `Organization` avec `logo`,
`description` et `sameAs`. Sans point d'ancrage d'entité, le nom d'auteur n'est qu'une chaîne de
caractères — d'autant que la marque « Aspirob » est aujourd'hui absorbée par « aspirin » en recherche.

**4. Recalibrer les passages hors zone — 3 h — impact moyen-élevé**
Découper les 6 sections de plus de 220 mots (« Pourquoi votre robot rate toujours les mêmes zones » 338 mots,
« Les modèles retenus » 447 mots, « Que fait réellement chaque robot ? » 307 mots) en unités de 134-167 mots
avec un H3 interrogatif propre. Étoffer les 6 sections de moins de 100 mots ou les fusionner. Supprimer la
redondance entre « L'essentiel » et le premier paragraphe sur les deux articles LiDAR. Remplacer les
anaphores d'ouverture (« ces cinq points », « le j9+ », « aucun des deux ») par le sujet nommé, pour que
chaque bloc reste intelligible hors contexte.

**5. Ouvrir une présence externe — 6 à 10 h sur 4 semaines — impact élevé à moyen terme**
Rien ne sera cité de façon durable sans corroboration hors site. Par ordre de rendement :
3 à 5 vidéos courtes reprenant les diagrammes SVG existants (signal le plus corrélé, ~0,737, actuellement
nul) ; participation utile et non promotionnelle sur r/robotvacuums et r/france ; page LinkedIn liée en
`sameAs`. Corriger en parallèle les `alt` anglais des photos d'en-tête et poser un `ItemList` sur les pages
comparatives — 1 h combinée.

## 10. Corrections rapides complémentaires

- Fil d'Ariane : faire pointer `ListItem` position 2 vers `/comparatifs/` et `/guides/`, pas vers l'accueil.
- Supprimer le H2 qui duplique le H1 sur l'article Roomba j9+ vs Roborock S8 Pro Ultra.
- Rendre uniques les H4 « Points forts » / « À savoir » en y accolant le nom du modèle.
- Sortir « À lire aussi » de la hiérarchie H2 (le passer en `<aside>`).
- Ajouter `image` (ImageObject) au `BlogPosting`.
- Publier `/llms-full.txt` et ajouter /guides/ et /comparatifs/ à llms.txt.
- Soumettre les 10 URL via IndexNow pour Bing / Copilot.
- Rendre la déclaration de méthode visible depuis chaque article (encadré ou lien contextuel), pas
  seulement depuis llms.txt et les mentions légales.
- Envisager une déclaration RSL 1.0 si des conditions d'usage machine sont souhaitées.

## Données structurées pour audit-data.json

```json
{
  "category": "AI Search Readiness",
  "score": 61,
  "dimensions": {
    "citability": 60,
    "structural_readability": 80,
    "multimodal": 55,
    "authority_brand": 22,
    "technical_accessibility": 85
  },
  "crawler_access": {
    "OAI-SearchBot": "allowed_via_wildcard_not_named",
    "ChatGPT-User": "allowed_named",
    "GPTBot": "allowed_named_training_only",
    "Claude-SearchBot": "allowed_via_wildcard_not_named",
    "ClaudeBot": "allowed_named_training_only",
    "PerplexityBot": "allowed_named",
    "Googlebot": "allowed_via_wildcard_not_named",
    "Google-Extended": "allowed_named_training_grounding_only",
    "Bingbot": "allowed_via_wildcard_not_named",
    "Applebot": "allowed_via_wildcard_not_named",
    "Applebot-Extended": "allowed_via_wildcard_not_named",
    "CCBot": "allowed_via_wildcard_not_named"
  },
  "llms_txt": {
    "present": true,
    "well_formed": true,
    "articles_listed": 5,
    "includes_direct_answers": true,
    "includes_editorial_method": true,
    "llms_full_txt": false
  },
  "rsl_licensing": {"present": false, "checked": ["/.well-known/rsl.xml", "/rsl.xml", "/license.xml", "robots.txt License field", "link rel=license"]},
  "rendering": {"is_spa": false, "ssr": true, "ttfb_ms": 35, "js_required": false},
  "passage_analysis": {
    "sections_analyzed": 33,
    "under_100_words": 6,
    "optimal_100_167_words": 14,
    "acceptable_168_220_words": 4,
    "over_220_words": 6,
    "essential_box_word_range": [46, 51],
    "question_based_h2_ratio": 0.55
  },
  "citations": {"external_sources": 0, "affiliate_links": 14, "photo_credits": 10},
  "brand_signals": {"wikipedia": false, "wikidata": false, "reddit": false, "youtube": false, "linkedin": false, "same_as_present": false, "author_bio_page": false, "brand_name_ambiguity": "collides with 'aspirin' in search"},
  "schema_types": ["WebSite", "Organization", "BlogPosting", "Person", "WebPage", "BreadcrumbList", "FAQPage"],
  "schema_issues": ["breadcrumb position 2 points to homepage instead of category", "Organization lacks logo/description/sameAs", "Person.url points to legal notice not author page", "BlogPosting lacks image property", "no ItemList on comparison pages"],
  "platform_scores": {"google_aio": 35, "chatgpt_search": 45, "perplexity": 50, "bing_copilot": 30, "claude_search": 40},
  "domain_age_days": 2,
  "pages_indexed_in_sitemap": 10
}
```
