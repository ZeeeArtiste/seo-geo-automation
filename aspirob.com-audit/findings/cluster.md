# Architecture de contenu — aspirob.com

Catégorie d'audit : **Content Architecture**
Date : 2026-09-20 · Périmètre : 5 articles publiés, 2 pages de catégorie, page d'accueil
Contrainte éditoriale appliquée à toutes les recommandations : **ni prix, ni note, ni donnée chiffrée invérifiable, aucun test produit.**

---

## 1. Résumé

Le site a deux amorces thématiques solides (animaux/poils, navigation/cartographie) mais **aucune page pilier** : rien n'agrège les articles, et les deux pages de catégorie regroupent par *format* (Comparatif / Guide) et non par *sujet*. Le maillage interne est dense mais plat — chaque article pointe vers trois autres quelle que soit leur thématique, ce qui ne transmet aucun signal de regroupement.

Trois constats structurants :

1. **Le trou thématique majeur est l'entretien et le dépannage** : zéro article, alors que c'est le segment le plus recherché, le plus durable et le seul entièrement compatible avec la contrainte éditoriale (aucun prix ni test nécessaire).
2. **Le maillage interne est calculé sur le champ `category`** (format), pas sur le sujet. C'est le correctif à plus fort effet de levier du site, et il est purement technique.
3. **Un article promet dans son URL un contenu qu'il ne livre pas** : `aspirateur-robot-poils-animaux-chat-chien` contient 19 occurrences de « chat » et 1 de « chien ». La moitié « chien » de la requête est abandonnée alors que l'URL la revendique.

---

## 2. État des lieux du maillage existant

Graphe réel reconstruit depuis `dist/` :

| Article | Liens entrants | Liens sortants | Thématique |
|---|---|---|---|
| `aspirateur-robot-animaux-erreurs-eviter` | 6 | 3 | Animaux |
| `aspirateur-robot-poils-animaux-chat-chien` | 6 | 3 | Animaux |
| `navigation-lidar-aspirateur-robot-explication` | 6 | 3 | Navigation |
| `navigation-lidar-camera-aspirateur-robot-differences` | 4 | 3 | Navigation |
| `roomba-j9-plus-vs-roborock-s8-pro-ultra` | **3** | 3 | Comparatif produit |

Aucune page orpheline — c'est un bon point, la base est saine. Mais :

- **Le graphe est quasi complet** (5 nœuds, chacun relié à 3 autres). Avec 5 articles ce n'est pas un problème ; à 15 articles, c'est un maillage sans hiérarchie où aucune page ne capitalise.
- **Le regroupement est aveugle au sujet.** Dans `src/pages/articles/[slug].astro`, les articles liés sont sélectionnés ainsi :

```js
const related = [
  ...others.filter((a) => a.data.category === data.category),
  ...others.filter((a) => a.data.category !== data.category),
].slice(0, 3);
```

Le tri se fait sur `category`, dont le schéma (`src/content/config.ts`) n'accepte que `Comparatif | Guide | Test | Actualité` — des étiquettes de **format**. Conséquence concrète : l'article LiDAR pointe vers l'article poils de chat, et l'article poils de chat pointe vers l'article LiDAR. Un moteur ne peut en déduire aucun regroupement sémantique.

- **`roomba-j9-plus-vs-roborock-s8-pro-ultra` est la page la moins maillée** (3 entrants) alors que c'est la page la plus monétisable du site.
- Les pages `/comparatifs/` et `/guides/` sont des **hubs de format**. Elles sont bien rédigées (texte propre à chaque catégorie, méta calibrée), mais un hub de format ne consolide aucune autorité thématique : il mélange animaux et navigation dans la même liste.

---

## 3. Chevauchements et cannibalisation

### 3.1 Dans le contenu existant

| Risque | Pages concernées | Gravité | Correctif |
|---|---|---|---|
| **FAQ dupliquée** | Les deux articles LiDAR posent la même question, quasi mot pour mot : « Mon robot LiDAR fonctionne-t-il dans le noir complet ? » / « Un robot LiDAR fonctionne-t-il vraiment dans le noir complet ? » | Moyenne | Deux entités `FAQPage` concurrentes sur la même question. Supprimer la question de l'article « explication » (elle appartient à l'article comparatif LiDAR/caméra) et la remplacer par une question propre à l'angle « zones ratées ». |
| **Angles voisins** | `...lidar-explication` (« pourquoi il rate des zones ») et `...lidar-camera-differences` (« laquelle choisir ») | Faible | Intentions distinctes (comprendre un défaut vs arbitrer un achat). Pas de fusion. Séparer plus nettement en retirant de l'article comparatif les passages sur les angles morts. |
| **URL non tenue** | `aspirateur-robot-poils-animaux-chat-chien` : « chat » ×19, « chien » ×1 | **Haute** | Voir §3.2. |
| **Recouvrement placement de la base** | « Erreur n°4 : où placer la base » recoupe le futur article de dépannage | À surveiller | Intentions différentes (conseil avant achat vs diagnostic d'une panne). Maillage obligatoire entre les deux, et ne pas rejouer le schéma `placement.svg` dans le nouvel article. |

### 3.2 Le cas « chien » — décision de fusion

SERP de `meilleur aspirateur robot poils de chien` : les pages qui s'y positionnent sont des pages **génériques « poils d'animaux »**, pas des pages dédiées au chien (eufy « best robot vacuum for pet hair », meilleurs-aspirateurs-robots.fr `/guide-achat/aspirateur-robot-animaux`, `/categories/animaux`). Google traite chat et chien comme **une seule intention**.

**Décision : ne pas créer d'article « poils de chien ».** Ce serait une cannibalisation directe de l'article existant. À la place : élargir l'article existant, dont l'URL revendique déjà les deux animaux.

Correctifs concrets sur `aspirateur-robot-poils-animaux-chat-chien.md` :
- Titre et H1 : mentionner explicitement chien et chat (le `seoTitle` actuel « Aspirateur robot anti-poils de chat : 5 modèles » exclut la moitié de la requête).
- `directAnswer` : reformuler en « poils de chat et de chien ».
- Ajouter un H2 sur ce qui distingue réellement les deux cas (longueur et rigidité du poil, volume en période de mue, sol encombré par les jouets) — traitable sans aucun chiffre ni test.
- Deux questions FAQ orientées chien.

### 3.3 Entre les sujets proposés

Vérification par recoupement d'URL dans les 10 premiers résultats organiques, sur 12 requêtes du périmètre :

| Paire de requêtes | URLs communes /10 | Seuil | Décision |
|---|---|---|---|
| `carte zones interdites` × `cartographie comment ça marche` | 2 | 2-3 | **Interlier**, pages séparées |
| `comment choisir` × `robot laveur serpillière` | 1 | 0-1 | Pages séparées |
| `robot laveur` × `meilleur poils de chien` | 1 | 0-1 | Pages séparées |
| `entretien brosse filtre` × `allergie HEPA` | 0 | 0-1 | Pages séparées |
| `entretien brosse filtre` × `ne revient pas à la base` | 0 | 0-1 | Pages séparées |
| `tapis moquette` × `meilleur poils de chien` | 0 | 0-1 | Pages séparées |
| `station de vidage` × `entretien` | 0 | 0-1 | Pages séparées |
| `chien peur du robot` × `meilleur poils de chien` | 0 | 0-1 | Pages séparées |
| `vaut-il le coup` × `comment choisir` | 0 | 0-1 | Pages séparées |
| `allergie HEPA` × `tapis moquette` | 0 | 0-1 | Pages séparées |
| `meilleur poils de chien` × article existant « poils de chat » | ~7-9 (estimé) | 7-10 | **Fusionner** → §3.2 |

Lecture : hors le cas chien/chat, **aucune des paires n'atteint le seuil de fusion**. Chaque sujet du plan mérite son URL. Les SERP françaises de cette niche sont fortement segmentées — un résultat favorable : un petit site peut gagner sujet par sujet sans se battre sur la tête de requête.

---

## 4. Les trous thématiques réels

Classés par rapport valeur / faisabilité sous contrainte éditoriale.

### Trou n°1 — Entretien et dépannage : **couverture nulle**

C'est le vrai trou. Le site explique comment un robot fonctionne et lequel choisir, mais rien sur la vie de l'appareil après l'achat. Or :

- Les SERP correspondantes (`entretien aspirateur robot`, `aspirateur robot ne retourne pas à sa base`) sont occupées par des **pages de support de marques** (Ecovacs, eufy, Samsung, Spareka) et des sites de pièces détachées. Elles sont battables par un guide indépendant et transversal.
- C'est le segment **100 % compatible** avec la contrainte : fréquences d'entretien, gestes, diagnostics — aucune donnée de prix, aucun test produit, aucune valeur chiffrée invérifiable. Les fréquences se sourcent dans les manuels constructeurs.
- Il alimente directement les deux articles animaux existants (un foyer avec animaux entretient son robot deux fois plus souvent).
- C'est du trafic récurrent et durable, insensible au renouvellement des gammes — contrairement aux comparatifs produits qui se périment.

### Trou n°2 — Sols, lavage et surfaces

L'article Roomba/Roborock oppose « lave les sols » et « ne lave pas » comme axe principal, mais aucun contenu amont n'explique **ce que le lavage robotisé fait réellement**. Le site vend un arbitrage sans avoir expliqué le critère. La SERP `aspirateur robot laveur` est distincte de toutes les autres et surtout tenue par des blogs de marque : un explicatif honnête (« balayage humide plutôt que récurage ») est un angle fort et ne demande aucun test.

Sous-trous : tapis et moquette (SERP dédiée, pleinement distincte), compatibilité par type de sol (parquet, carrelage, vinyle, jonc de mer).

### Trou n°3 — Pilotage de la carte (aval de la navigation)

Les deux articles LiDAR expliquent comment la carte est **construite**, jamais comment on s'en **sert** : zones interdites, murs virtuels, découpage des pièces, cartes multi-étages. C'est la suite logique du contenu le plus abouti du site, et une intention how-to sans aucune donnée chiffrée.

### Trou n°4 — Filtration et allergies

Les deux articles animaux évoquent le filtre en passant. La requête allergies/acariens/HEPA a sa propre SERP, complètement disjointe. **Attention** : ce sujet attire les chiffres invérifiables (« 99,97 % à 0,3 µm », « -40 à -60 % d'allergènes »). L'angle conforme est justement l'inverse : expliquer la norme EN 1822 (H13/H14), ce que « type HEPA » signifie par rapport à « True HEPA », et ce que la filtration ne règle pas (les squames déjà au sol, les textiles). Article de méthode plutôt que de performance.

### Trou n°5 — Cohabitation animal / robot (comportement)

`chien peur aspirateur robot`, `habituer son chat au robot`. SERP tenue par des sites de comportement animalier (Wamiz, Adaptil, Botaneo), pas par des sites d'électroménager — donc peu disputée par les concurrents directs. Zéro chiffre, zéro test. Le prolongement naturel des deux articles animaux. Placé en réserve car les clusters sont déjà au plafond.

### Trou n°6 — Le contre-contenu sur les pascals

Toute la niche compare en Pa (« 4 000 Pa minimum », « 15 000 Pa »). Le site refuse déjà ce chiffre par méthode. Un article expliquant **pourquoi ce chiffre ne dit rien** (pas de norme commune entre fabricants, mesure au moteur et non à la brosse) transforme la contrainte éditoriale en avantage, est intrinsèquement linkable, et justifie la méthode du site auprès des lecteurs comme des moteurs. Excellent candidat pilier-satellite.

### Formats à ne PAS produire (incompatibles avec la contrainte)

| Format | Pourquoi l'écarter |
|---|---|
| « Meilleur aspirateur robot 2026 », top 10 classé | Exige une notation ; le site ne teste pas |
| « Aspirateur robot pas cher / à moins de 300 € » | Exige des prix |
| « Test du modèle X », « Avis après 30 jours » | Exige un test réel — risque E-E-A-T majeur si simulé |
| Comparatif de puissance en pascals | Exclu explicitement par la méthode publiée |
| Pages Black Friday / bons plans | Exigent des prix et se périment |
| « Quel budget prévoir » | Exige des prix |

Le site a publié sa méthode dans `llms.txt` et les mentions légales. Produire l'un de ces formats la contredirait publiquement.

---

## 5. Architecture pilier / satellites proposée

### Pilier

| Attribut | Valeur |
|---|---|
| Titre | **Comment choisir un aspirateur robot : les critères qui comptent, et les chiffres à ignorer** |
| URL | `/articles/comment-choisir-aspirateur-robot/` |
| Requête principale | `comment choisir un aspirateur robot` |
| Intention | Commercial investigation (large) |
| Gabarit | `ultimate-guide` |
| Volume cible | 2 800-3 500 mots |
| Angle différenciant | Grille de décision par critère structurel (type de brosse, technologie de navigation, modules de la station, hauteur de l'appareil, type de sol) au lieu de la comparaison de fiches techniques. La section « les chiffres à ignorer » porte la méthode du site. |
| Liens sortants | **Vers les 16 satellites, obligatoire** — une section par cluster |
| Schéma | `Article` + `BreadcrumbList` + `ItemList` listant les satellites |

Note de faisabilité : la SERP de cette requête est tenue par des distributeurs (Boulanger, Darty, Materiel.net, Cdiscount) et Que Choisir. Le pilier ne se positionnera pas vite. **Ce n'est pas sa fonction principale** : il existe d'abord pour donner une tête au site, concentrer le maillage et servir de cible commune aux 16 satellites. Son positionnement viendra quand les clusters seront remplis.

### Les 4 clusters

**Cluster 1 — Animaux et poils** (2 existants + 2 à écrire)

| # | Titre | Requête | Intention | Gabarit | Mots | État |
|---|---|---|---|---|---|---|
| 1.1 | Aspirateur robot et poils d'animaux : 5 modèles qui ne s'emmêlent pas | `aspirateur robot poils animaux chat chien` | Commercial (rank) | `best-of` | 1 300 | **publié — à élargir au chien** |
| 1.2 | Aspirateur robot avec animaux : les 5 erreurs à éviter | `aspirateur robot animaux erreurs` | Informational (list) | `listicle` | 1 241 | publié |
| 1.3 | Brosse en caoutchouc ou brosse à soies : ce qui change vraiment avec des poils | `brosse aspirateur robot caoutchouc soies` | Informational (concept) | `explainer` | 1 400 | à écrire |
| 1.4 | Aspirateur robot et allergies : ce que la filtration retient, ce qu'elle laisse passer | `aspirateur robot allergie acariens` | Informational (concept) | `explainer` | 1 500 | à écrire |

**Cluster 2 — Navigation et cartographie** (2 existants + 2 à écrire)

| # | Titre | Requête | Intention | Gabarit | Mots | État |
|---|---|---|---|---|---|---|
| 2.1 | Comment fonctionne la navigation LiDAR | `navigation lidar aspirateur robot` | Informational (concept) | `explainer` | 1 322 | publié |
| 2.2 | Navigation LiDAR vs caméra | `lidar ou camera aspirateur robot` | Commercial (compare) | `comparison` | 1 275 | publié — dédupliquer la FAQ |
| 2.3 | Zones interdites, murs virtuels, pièces : maîtriser la carte de votre robot | `zone interdite aspirateur robot carte` | Informational (how) | `how-to` | 1 500 | à écrire |
| 2.4 | Tous les capteurs d'un aspirateur robot, au-delà du LiDAR | `capteurs aspirateur robot` | Informational (concept) | `explainer` | 1 400 | à écrire |

**Cluster 3 — Entretien et dépannage** (0 existant + 4 à écrire) ← *le trou principal*

| # | Titre | Requête | Intention | Gabarit | Mots | État |
|---|---|---|---|---|---|---|
| 3.1 | Entretien d'un aspirateur robot : la routine qui évite la plupart des pannes | `entretien aspirateur robot` | Informational (how) | `how-to` | 1 600 | à écrire |
| 3.2 | Votre robot ne revient pas à sa base : le diagnostic en 7 points | `aspirateur robot ne revient pas a la base` | Informational (how) | `how-to` | 1 400 | à écrire |
| 3.3 | Mon aspirateur robot aspire moins bien : les causes, dans l'ordre | `aspirateur robot perd aspiration` | Informational (how) | `how-to` | 1 400 | à écrire |
| 3.4 | Brosse, filtre, batterie : à quel rythme les remplacer | `quand changer brosse filtre aspirateur robot` | Informational (concept) | `explainer` | 1 300 | à écrire |

**Cluster 4 — Sols, lavage et surfaces** (1 existant + 3 à écrire)

| # | Titre | Requête | Intention | Gabarit | Mots | État |
|---|---|---|---|---|---|---|
| 4.1 | Roomba j9+ vs Roborock S8 Pro Ultra | `roomba j9 vs roborock s8 pro ultra` | Commercial (compare) | `comparison` | 1 446 | publié |
| 4.2 | Aspirateur robot laveur : ce que le lavage fait réellement, et ce qu'il ne fera pas | `aspirateur robot laveur efficace` | Informational (concept) | `explainer` | 1 500 | à écrire |
| 4.3 | Tapis et moquette : pourquoi la plupart des robots échouent | `aspirateur robot tapis moquette` | Informational (concept) | `explainer` | 1 400 | à écrire |
| 4.4 | Parquet, carrelage, vinyle, jonc de mer : quel sol supporte quoi | `aspirateur robot laveur parquet` | Informational (concept) | `explainer` | 1 300 | à écrire |

**Total : 1 pilier + 16 satellites = 17 pages.** Conforme aux contraintes (4 clusters ∈ [2,5] ; 4 articles par cluster ∈ [2,4] ; total ∈ [5,21]).

### Réserve (hors clusters, à activer plus tard)

- **Puissance en pascals : pourquoi ce chiffre ne dit rien** — satellite direct du pilier, fort potentiel de liens, incarne la méthode du site.
- **Habituer son chien ou son chat au robot** — cluster 1 est au plafond ; à insérer quand un article y sera remanié.
- **L'aspirateur robot en vaut-il la peine ? Les limites qu'on vous cache** — satellite du pilier, intention pré-achat.

---

## 6. Matrice de maillage interne

### Obligatoire (bidirectionnel pilier ↔ satellite)

Le pilier lie **les 16 satellites** ; chaque satellite lie le pilier au moins une fois dans le corps, avec une ancre contextuelle. Non négociable.

### Recommandé (intra-cluster, 2-3 liens par article)

```
Cluster 1 : 1.1 ↔ 1.2 ↔ 1.3 ↔ 1.4 ↔ 1.1   (anneau + diagonales 1.1↔1.3, 1.2↔1.4)
Cluster 2 : 2.1 ↔ 2.2 ↔ 2.3 ↔ 2.4 ↔ 2.1   (+ 2.1↔2.3, 2.2↔2.4)
Cluster 3 : 3.1 ↔ 3.2 ↔ 3.3 ↔ 3.4 ↔ 3.1   (+ 3.1↔3.3, 3.2↔3.4)
Cluster 4 : 4.1 ↔ 4.2 ↔ 4.3 ↔ 4.4 ↔ 4.1   (+ 4.1↔4.3, 4.2↔4.4)
```

### Inter-clusters (ponts justifiés, 1 lien maximum par article)

Seuls les ponts où le lecteur y gagne réellement :

| Depuis | Vers | Justification |
|---|---|---|
| 1.2 « 5 erreurs » | 3.2 « ne revient pas à sa base » | L'erreur n°4 porte sur le placement de la base ; le diagnostic en est la suite |
| 1.1 « poils d'animaux » | 3.1 « entretien » | Un foyer avec animaux entretient deux fois plus souvent |
| 1.4 « allergies » | 3.4 « quand changer le filtre » | La filtration ne vaut que par le remplacement |
| 1.3 « brosse caoutchouc/soies » | 4.3 « tapis et moquette » | Le type de brosse détermine le résultat sur textile |
| 2.3 « zones interdites » | 1.2 « 5 erreurs » | Isoler la gamelle de l'animal est un cas d'usage de la zone interdite |
| 2.4 « capteurs » | 3.3 « perd en aspiration » | Un capteur encrassé est une cause de dysfonctionnement |
| 4.1 « Roomba vs Roborock » | 4.2 « ce que le lavage fait » | L'axe du comparatif, expliqué en amont |
| 4.2 « robot laveur » | 3.1 « entretien » | La serpillière est le consommable le plus exigeant |

### Vérifications de conformité

| Contrôle | Résultat |
|---|---|
| Deux articles partageant la requête principale | Aucun (après fusion chien/chat — §3.2) |
| Satellites avec ≥ 3 liens entrants | 16/16 (1 pilier + 2 à 3 intra-cluster + ponts) |
| Chaque satellite lie le pilier | Oui, obligatoire |
| Le pilier lie chaque satellite | Oui, obligatoire |
| Pages orphelines | 0 |
| Gabarit cohérent avec l'intention | 17/17 |
| Volumes dans les fourchettes | Pilier 2 800-3 500 ∈ [2 500-4 000] ; satellites 1 300-1 600 ∈ [1 200-1 800] |
| Recouvrement SERP suffisant intra-cluster | Oui — voir §3.3 ; aucune paire au-dessus du seuil de fusion |
| Formats exigeant prix ou test | 0 sur 17 |

---

## 7. Correctifs techniques sur le maillage

**Le correctif à plus fort effet de levier du site.** Le regroupement doit passer du format au sujet.

1. Ajouter un champ `cluster` dans `src/content/config.ts` :

```ts
cluster: z.enum(['animaux', 'navigation', 'entretien', 'sols']).optional(),
```

2. Dans `src/pages/articles/[slug].astro`, trier les articles liés par cluster avant la catégorie :

```js
const related = [
  ...others.filter((a) => a.data.cluster === data.cluster),
  ...others.filter((a) => a.data.cluster !== data.cluster && a.data.category === data.category),
  ...others,
].filter((a, i, arr) => arr.indexOf(a) === i).slice(0, 3);
```

3. Le bloc « À lire aussi » restera pertinent, mais **il ne remplace pas les liens contextuels en corps de texte** : les liens obligatoires vers le pilier et les 2-3 liens intra-cluster doivent être placés dans les paragraphes, avec des ancres variées (pas plus de 40 % d'occurrences d'une même ancre vers une page donnée).

4. **Transformer `/comparatifs/` et `/guides/` en hubs thématiques** — mais pas tout de suite. Tant qu'un cluster compte moins de 4 articles, une page de hub serait mince. Séquence recommandée : créer le pilier d'abord, puis passer aux hubs `/animaux/`, `/navigation/`, `/entretien/`, `/sols/` quand chaque cluster atteindra 4 articles. Les pages de format actuelles peuvent rester en parallèle, elles ne nuisent pas.

5. **Remonter `roomba-j9-plus-vs-roborock-s8-pro-ultra`** (3 liens entrants, page la plus monétisable) : elle doit recevoir un lien depuis le pilier, depuis 4.2, 4.3 et 4.4.

---

## 8. Ordre de production recommandé

| Prio | Action | Type | Pourquoi maintenant |
|---|---|---|---|
| 1 | **Élargir l'article poils au chien** (§3.2) | Correctif | Coût quasi nul, l'URL revendique déjà « chien », gain immédiat sur une requête à fort volume, supprime le risque de cannibalisation future |
| 2 | **Maillage par cluster** (§7, points 1-2) | Correctif technique | Une heure de travail, bénéficie à tous les articles suivants ; à faire avant de publier quoi que ce soit |
| 3 | **3.1 Entretien d'un aspirateur robot** | Nouvel article | Le plus gros trou, la SERP la plus accessible, 100 % conforme à la contrainte, alimente les deux articles animaux |
| 4 | **3.2 Ne revient pas à sa base** | Nouvel article | Forte intention, SERP tenue par des supports de marques donc battable, se maille naturellement avec « 5 erreurs » |
| 5 | **Pilier « Comment choisir »** | Nouvel article | Donne une tête au site et une cible commune à tous les satellites ; à publier une fois que 7-8 articles existent, pour qu'il ait de quoi lier |
| 6 | **4.2 Ce que le lavage fait réellement** | Nouvel article | Ouvre le cluster 4 et donne un amont informationnel au comparatif Roomba/Roborock |
| 7 | **2.3 Maîtriser la carte du robot** | Nouvel article | Complète le cluster où le site est déjà le plus crédible |
| 8 | **Dédupliquer la FAQ des deux articles LiDAR** (§3.1) | Correctif | Rapide, supprime deux entités FAQPage concurrentes |
| 9 | **1.3 Brosse caoutchouc vs soies** | Nouvel article | Déjà cité dans trois articles sans jamais être expliqué |
| 10 | **3.3, 3.4, 4.3, 4.4, 1.4, 2.4** | Nouveaux articles | Remplissage des clusters, dans cet ordre |

Les priorités 1, 2 et 8 sont des correctifs sur l'existant : ils coûtent quelques heures et conditionnent le rendement de tout ce qui sera publié ensuite. Les priorités 3 et 4 sont les deux articles à écrire en premier.

---

## 9. Données structurées pour `audit-data.json`

```json
{
  "category": "Content Architecture",
  "site": "aspirob.com",
  "analyzed_at": "2026-09-20",
  "summary": {
    "existing_pages": 5,
    "existing_pillars": 0,
    "orphan_pages": 0,
    "clusters_designed": 4,
    "planned_posts": 16,
    "content_gaps": 6,
    "cannibalization_risks": 2,
    "link_graph": "dense but flat; related-articles computed on format, not topic"
  },
  "findings": [
    {
      "id": "CA-01",
      "severity": "high",
      "title": "Aucune page pilier : rien n'agrège les articles",
      "evidence": "5 articles, 2 pages de catégorie groupant par format (Comparatif/Guide), aucun hub thématique",
      "recommendation": "Créer /articles/comment-choisir-aspirateur-robot/ comme pilier liant les 16 satellites"
    },
    {
      "id": "CA-02",
      "severity": "high",
      "title": "Le maillage interne ignore le sujet",
      "evidence": "src/pages/articles/[slug].astro calcule `related` sur data.category, un champ de format ; l'article LiDAR pointe vers l'article poils de chat",
      "recommendation": "Ajouter un champ `cluster` au schéma de contenu et trier les articles liés dessus en priorité"
    },
    {
      "id": "CA-03",
      "severity": "high",
      "title": "URL revendiquant un contenu absent",
      "evidence": "aspirateur-robot-poils-animaux-chat-chien.md : 19 occurrences de 'chat', 1 de 'chien'",
      "recommendation": "Élargir l'article au chien plutôt que d'en créer un second (SERP identiques, fusion imposée)"
    },
    {
      "id": "CA-04",
      "severity": "high",
      "title": "Trou thématique : entretien et dépannage non couverts",
      "evidence": "0 article sur 5 ; SERP tenues par des supports de marques ; segment 100 % compatible avec la contrainte éditoriale",
      "recommendation": "Cluster de 4 articles ; commencer par 'entretien aspirateur robot' puis 'ne revient pas a la base'"
    },
    {
      "id": "CA-05",
      "severity": "medium",
      "title": "FAQ dupliquée entre les deux articles LiDAR",
      "evidence": "'Mon robot LiDAR fonctionne-t-il dans le noir complet ?' vs 'Un robot LiDAR fonctionne-t-il vraiment dans le noir complet ?' — deux entites FAQPage concurrentes",
      "recommendation": "Retirer la question de l'article 'explication', la conserver dans l'article comparatif"
    },
    {
      "id": "CA-06",
      "severity": "medium",
      "title": "Trou thematique : lavage des sols et surfaces",
      "evidence": "Le comparatif Roomba/Roborock arbitre sur le lavage sans qu'aucun contenu amont n'explique ce critere",
      "recommendation": "Cluster 4 : 'ce que le lavage fait reellement', tapis/moquette, compatibilite par type de sol"
    },
    {
      "id": "CA-07",
      "severity": "medium",
      "title": "Trou thematique : pilotage de la carte",
      "evidence": "Les deux articles LiDAR expliquent la construction de la carte, jamais son usage (zones interdites, pieces, multi-etages)",
      "recommendation": "Article how-to en cluster 2"
    },
    {
      "id": "CA-08",
      "severity": "low",
      "title": "La page la plus monetisable est la moins maillee",
      "evidence": "roomba-j9-plus-vs-roborock-s8-pro-ultra : 3 liens entrants, contre 6 pour les autres",
      "recommendation": "Lier depuis le pilier et depuis les trois satellites du cluster 4"
    },
    {
      "id": "CA-09",
      "severity": "low",
      "title": "Trou thematique : filtration et allergies",
      "evidence": "SERP dediee et disjointe ; sujet effleure dans les deux articles animaux",
      "recommendation": "Angle 'methode' (norme EN 1822, HEPA vs type HEPA) et non 'performance', pour eviter les chiffres invérifiables"
    }
  ],
  "scorecard": {
    "coverage": 0.29,
    "linkDensity": 0.6,
    "orphanPages": 0,
    "cannibalization": 2,
    "contentGaps": 6
  }
}
```
