# Search Experience Optimization — aspirob.com

Audit du 20/09/2026 · 10 pages parsées · 6 SERP françaises lues à rebours · 7 pages
concurrentes récupérées et mesurées · site en ligne depuis 2 jours, aucun positionnement.

**Score d'écart SXO (SXO Gap Score) pondéré : 48/100**
*(à ne pas confondre avec le SEO Health Score — méthodologie et barème distincts)*

| Famille de pages | SXO Gap Score | Verdict |
|---|---|---|
| Comparatif commercial (`poils-animaux-chat-chien`) | **42/100** | Inadéquation de devise décisionnelle — CRITIQUE |
| Face-à-face produit (`roomba-j9-vs-roborock-s8`) | **45/100** | Inadéquation de sous-type — ÉLEVÉE |
| Guides pédagogiques (3 articles LiDAR / erreurs) | **64/100** | Type de page ALIGNÉ, déficit d'autorité |
| Accueil + pages catégories | **31/100** | Aucune requête atteignable en l'état |

---

## 1. Le constat principal : ce n'est pas un problème de format, c'est un problème de devise

La lecture inverse des SERP donne un résultat contre-intuitif et il faut le dire net.

**Le format des pages d'Aspirob est bon.** Le comparatif anti-poils est un listicle classé
1→5, avec tableau en tête, encadrés points forts / à savoir, CTA par produit, divulgation
d'affiliation, sommaire, bloc « L'essentiel » — c'est exactement l'architecture d'une
*Comparison Page* au sens de la taxonomie. Il n'y a pas de blog post déguisé en comparatif,
pas de page produit là où il faudrait un guide. Sur ce plan, le site est propre.

**Ce qui manque est la devise avec laquelle l'utilisateur compare.** Sur les six SERP
commerciales lues, chaque page classée propose au moins un axe de classement chiffré. Aspirob
n'en propose aucun — ni prix, ni note, ni mesure, ni durée testée, ni pascals. Il reste des
descriptions qualitatives (« réduit significativement », « bac de grande capacité »,
« nettement au-dessus de la concurrence »). Un utilisateur en phase de décision ne peut rien
trier avec ça.

### Preuve mesurée sur les pages qui occupent le top 10

| Page classée | Mots extraits | Occurrences « € » | Notes « /10 » | Occurrences « test » | Segmentation |
|---|---|---|---|---|---|
| `meilleurs-aspirateurs-robots.fr/guide-achat/aspirateur-robot-animaux` | 959 | **84** | 0 | 8 | « Verdict par budget », « Notre sélection par profil animal » |
| `labomaison.com/.../meilleurs-aspirateurs-robots-animaux-2026` | 2 254 | 10 | **23** | **123** | H3 = « le meilleur à moins de 1000 € », « à moins de 600 € » |
| `meilleurs-aspirateurs-robots.fr/guide-achat/navigation-robot-aspirateur` *(requête informationnelle !)* | 904 | **82** | 0 | 3 | « Verdict par budget » |
| `ecovacs.com/fr/blog/lidar-vs-vslam` | 1 697 | 0 | 9 | 4 | « Produits connexes », 3 vidéos embarquées |
| **`aspirob.com/articles/aspirateur-robot-poils-animaux-chat-chien`** | **1 301** | **0** | **0** | **0** | **aucune** |
| **`aspirob.com/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra`** | **1 430** | **0** | **0** | **0** | **aucune** |

La première ligne est la démonstration la plus dure : une page de **959 mots** — moins que
n'importe quel article d'Aspirob — occupe le top 3 français sur la requête anti-poils. Ce
n'est donc pas la profondeur qui gagne ce SERP. C'est l'architecture décisionnelle : 84
mentions de prix, un verdict par tranche de budget, une sélection par profil d'animal, un
outil « Quel aspirateur robot vous correspond ? ». Aspirob écrit 36 % de texte en plus et ne
fournit aucun de ces quatre éléments.

### Réponse franche à la question posée

> *« L'absence de prix et de notes condamne-t-elle le site sur les requêtes commerciales ? »*

**Sur les requêtes « meilleur / top X / quel aspirateur robot pour Y » : oui, en l'état.**
Pas parce que le prix serait un facteur de classement — il ne l'est pas — mais parce que les
trois éléments absents (prix, note, test) sont les trois seuls axes de tri disponibles sur ce
marché, et qu'une page de comparaison sans axe de tri ne *termine* aucune intention. Google
mesure la satisfaction par la fin du parcours ; un utilisateur qui arrive sur la sélection
anti-poils, lit cinq descriptions structurellement justes puis doit ouvrir Amazon uniquement
pour découvrir combien ça coûte est un utilisateur qui retourne au SERP.

**Sur la requête face-à-face « j9+ vs S8 Pro Ultra » : non, ce n'est pas condamné, mais le
sous-type est mauvais.** Voir §3.

**Sur les trois guides pédagogiques : non, pas du tout.** Le type de page est aligné, le
contenu est meilleur que la moyenne du SERP sur l'angle troubleshooting, et l'absence de prix
n'y est pas un handicap. Le frein y est l'autorité de domaine face à ecovacs.com,
tp-link.com et narwal.com — un problème de temps et de liens, pas de format.

### La nuance qui sauve le projet

Il faut distinguer deux décisions que le site confond aujourd'hui :

1. **« Nous n'inventons pas de mesures que nous n'avons pas faites »** — politique
   défendable, différenciante, cohérente avec les QRG. À conserver.
2. **« Nous n'affichons aucun prix »** — politique qui n'a pas la même justification. Le
   motif déclaré (« les tarifs varient trop vite pour rester exacts ») est un problème
   technique résolu depuis longtemps par l'API Product Advertising d'Amazon, qui fournit un
   prix horodaté. Un prix daté et attribué n'est pas un chiffre inventé : c'est exactement
   le contraire.

La règle n°1 n'impose pas la règle n°2. Le site paie aujourd'hui le coût commercial complet
de la seconde sans en tirer le bénéfice de crédibilité de la première.

### L'effet de bord monétaire, qui aggrave le tout

Dans `roomba-j9-plus-vs-roborock-s8-pro-ultra`, deux passages envoient explicitement
l'utilisateur ailleurs :

> « Les prix de ces deux modèles fluctuent fortement selon les périodes : **consultez la
> fiche produit** pour le tarif du jour. »

> « Un traqueur de prix comme **Keepa ou Idealo** vous montrera l'historique réel du modèle
> qui vous intéresse. »

C'est honnête et c'est un bon conseil. C'est aussi, en SXO, un transfert de la phase de
décision vers un tiers : l'utilisateur part sur Keepa, compare, et achète depuis Keepa ou
depuis une recherche Amazon directe. Le lien affilié (`tag=aspirob0d-21`) ne capte rien. Le
site assume une contrainte éditoriale *et* offre la conversion à un concurrent.

---

## 2. Analyse SERP — lecture à rebours

### Méthode et avertissement

L'outil de recherche disponible restitue les résultats organiques (titres + URL + synthèse)
mais **ne restitue pas les blocs PAA, les annonces, l'AI Overview ni le carrousel Shopping**.
Les signaux PAA / publicitaires utilisés ci-dessous sont donc **reconstitués par proxy** à
partir de deux sources vérifiables :
- les FAQ et H3 des pages classées (construites par leurs éditeurs à partir des PAA réelles) ;
- les formulations de requêtes visibles dans les titres classés.

Chaque dérivation indique sa source. C'est une inférence, pas une observation directe ; les
recommandations qui en dépendent sont marquées comme telles.

---

### SERP A — « meilleur aspirateur robot poils de chat 2026 » (requête argent n°1)

Top 10 observé : `test-achats.be` · `eufy.com` (marque) · `meilleurs-aspirateurs-robots.fr`
×3 · `meilleuraspirateur-robot.fr` · `labomaison.com` · `appareils-menagers.net` ·
`techradar.com/fr-fr`

**Classification** :

| Type de page (taxonomie) | Résultats | Part |
|---|---|---|
| Comparison Page (listicle classé, prix + notes) | 7 | **70 %** |
| Hybrid (blog de marque + produits) | 2 | 20 % |
| Blog Post pur | 1 | 10 % |

**Consensus : Comparison Page, confiance 70 %.**

**Sous-type dominant, décisif** : *listicle segmenté par budget et par profil d'usage, avec
prix affiché et gamme 2026*. Les sept résultats commerciaux affichent tous un prix ; cinq
segmentent par tranche de budget ; le premier résultat (Test-Achats) est un laboratoire de
consommateurs avec tests instrumentés.

**Fonctionnalités SERP** (proxy) :
- Intervalle de prix mis en avant dans la synthèse : « 169 € à 1 099 € », « compter 300 à 600 € »
- Seuil technique consensuel : « minimum 8 000 Pa pour un foyer avec un animal à poil court »
- Chiffre de bénéfice quantifié repris par plusieurs pages : « les brosses à soies réduisent
  l'aspiration de 40 à 60 % »
- Millésime « 2026 » présent dans 7 titres sur 9

**Deux observations dures pour Aspirob :**

**a) Le SERP répond avec un chiffre que le site refuse par principe de donner.** La réponse
consensuelle à « quel aspirateur robot pour poils de chat » inclut un seuil en pascals.
Aspirob déclare explicitement dans `/llms.txt` et dans l'article que les pascals ne sont pas
comparables entre fabricants. **Cette position est techniquement plus juste que celle du
SERP** — il n'existe effectivement pas de norme commune. Mais elle place le site hors du jeu
de réponses que Google a appris à récompenser. Il ne suffit pas d'avoir raison : il faut
occuper l'emplacement de la réponse. La sortie n'est pas de publier des pascals, c'est de
publier *l'alternative mesurable* (voir §6, recommandation 2).

**b) Le parc produit d'Aspirob a une génération de retard.** Modèles cités par les pages
classées en 2026 : Dreame Aqua10 Ultra, Dreame X60 Pro Ultra, Dreame X50 Ultra, Roborock
Qrevo Curv, Narwal Freo Z Ultra, Ecovacs T80 Omni, Ecovacs T90 Pro Omni, Bosch BCRD2W.
Modèles cités par Aspirob : Roborock Q5 Max+, Roomba Combo j9+, Dreame L10s Ultra, Ecovacs
Deebot T20 Omni, Shark RV1000SEU — tous de 2022-2023. **Zéro recouvrement d'entités avec le
SERP 2026.** Pour un moteur qui évalue la couverture d'entités d'une page comparative, c'est
un signal de contenu périmé, indépendant de la date de publication. Le site a une fraîcheur
d'horodatage parfaite (publié il y a 2 jours) et une fraîcheur d'entités nulle.

---

### SERP B — « Roomba j9+ vs Roborock S8 Pro Ultra » (requête décision)

Top 10 observé : `rtings.com` (outil de comparaison) · `digitaltrends.com` ×2 ·
**YouTube ×3** · `versus.com` (table de specs) · `robotbox.net` · `ebay.de` ·
`notebookcheck.net`

**Classification** :

| Type de page | Résultats | Part |
|---|---|---|
| Comparison Page | 5 | 50 % |
| Tool / Interactive (comparateur de specs) | 2 | 20 % |
| Vidéo | 3 | 30 % |
| Product Page (ebay) | 1 | 10 % |

**Consensus : Comparison Page, confiance 50 % — mais avec un sous-type strict.**

Les deux pôles qui occupent ce SERP sont :
- **le pôle mesure** : RTINGS (banc de test instrumenté, scores par critère), versus.com
  (table de spécifications automatisée), notebookcheck ;
- **le pôle démonstration visuelle** : trois vidéos YouTube sur dix résultats, toutes
  intitulées « COMPARISON — How well do they Clean? ».

**Inadéquation de sous-type : ÉLEVÉE.** Aspirob livre une comparaison **narrative**. Elle est
bonne — la section « Aucun des deux si : » est un vrai différenciateur éditorial que
personne d'autre ne propose sur ce SERP, et le chapitre « Quel est le coût réel, au-delà du
prix d'achat ? » répond à une question que RTINGS n'aborde pas. Mais la page ne contient
**aucune mesure et aucune vidéo**, c'est-à-dire ni l'un ni l'autre des deux pôles qui
occupent 80 % du top 10. Elle ne peut pas y entrer par le milieu.

**Signal aggravant** : ce SERP est massivement anglophone (RTINGS, Digital Trends, versus,
ebay.de). Cela signifie que Google ne trouve pas de réponse française satisfaisante et se
rabat sur l'anglais. **C'est une opportunité réelle et la seule véritable de tout l'audit** :
une page française de qualité sur ce face-à-face a de la place. Mais elle devra apporter ce
que le SERP valorise — un tableau de spécifications complet et vérifiable côté constructeur,
et idéalement une démonstration visuelle.

---

### SERP C — « aspirateur robot LiDAR ou caméra » / « comment fonctionne la navigation LiDAR »

Top 10 observé : `ecovacs.com/fr` ×2 · `narwal.com/fr` · `tp-link.com/fr` ·
`meilleurs-aspirateurs-robots.fr` · `cozzen.fr` · `aspirateur-robot.fr` · `altadom.fr` ·
`guide-robot-aspirateur.fr` · `quel-robot-aspirateur.fr` · `lebontri.fr`

**Classification** :

| Type de page | Résultats | Part |
|---|---|---|
| Blog Post / guide explicatif | 6 | **60 %** |
| Hybrid (explication + produits de la marque) | 4 | 40 % |

**Consensus : Blog Post, confiance 60 %.**

**Type de page d'Aspirob : Blog Post. ALIGNÉ.** C'est le seul des trois clusters où il n'y a
aucune inadéquation de type.

Mieux : l'angle d'Aspirob est supérieur à celui du SERP. Les six guides classés répondent à
« qu'est-ce que le LiDAR ». Aucun ne répond à « pourquoi mon robot rate toujours les mêmes
zones » — qui est une requête de *problème* et non de *définition*, avec une intention bien
plus qualifiée. Les H3 d'Aspirob (« Les angles morts du capteur LiDAR », « Une carte dégradée
ou obsolète », « Les surfaces qui trompent le LiDAR ») couvrent un espace vide.

**Les deux freins réels ici, et ils ne sont pas de format :**
1. **Autorité.** Quatre des dix résultats sont des domaines de fabricants (ECOVACS, TP-Link,
   Narwal, plus eufy sur le SERP voisin). Google leur accorde une autorité d'entité qu'un
   domaine de deux jours ne peut pas égaler à court terme.
2. **Média.** ECOVACS embarque 3 vidéos et 24 images sur sa page LiDAR vs vSLAM. Aspirob a
   3 images sur `navigation-lidar-explication`, dont un visuel d'illustration Unsplash. Les
   diagrammes SVG sur mesure (`/diagrams/angles-morts.svg`, `lidar-cartographie.svg`) sont
   excellents et originaux — c'est le meilleur actif du site — mais ils sont trop peu
   nombreux et ne sont pas exploités comme des actifs d'image indexables.

**Fonctionnalité SERP décisive à noter** : même sur cette requête purement informationnelle,
`meilleurs-aspirateurs-robots.fr` classe une page avec **82 mentions de prix** et une section
« Verdict par budget ». Le SERP français des guides techniques est donc **hybride** :
l'explication est le prétexte, la recommandation chiffrée est la conclusion attendue.
L'abstention de prix pénalise Aspirob y compris là où on ne l'attend pas.

---

### SERP D — « aspirateur robot chien chat erreurs à éviter »

Top 10 : `rowenta.fr` · `dyson.fr` · `hoover-home.com` · `ecovacs.com` ·
`degrouptest.com` · `eufy.com` · `guide-robots.fr` · `casanaute.fr` (forum) ·
`mamanvsrobot.com` (blog)

**Classification** : Blog Post 60 %, Hybrid marque 30 %, UGC/forum 10 %.
**Consensus : Blog Post, confiance 60 %. ALIGNÉ.**

Angles dominants du SERP : **sécurité et incidents** (« éviter les accidents entre animaux et
aspirateur robot », « crottes de chien : peut-il les éviter ? », « ne déclenchera pas votre
alarme », « les 10 pires bêtises de robots aspirateurs »). L'émotion dominante est
l'anxiété : la peur de l'accident, du dégât, du stress animal.

Les cinq erreurs d'Aspirob sont, elles, **opérationnelles** : brosse, vidage du bac, sol
encombré, placement de la base, horaires. C'est un angle différent — plus utile, moins
anxiogène. Le sujet le plus recherché du cluster (les déjections, présent dans au moins deux
résultats du top 10) est traité chez Aspirob **dans une FAQ en bas de page**, pas dans un H2.
C'est une erreur de hiérarchie : le contenu existe, il n'est pas à l'emplacement où le SERP
le récompense.

---

### SERP E — « aspirateur robot » / « comparatif aspirateur robot » (tête de requête)

Top 10 : `clubic.com` · `meilleurs-aspirateurs-robots.fr` (accueil) · `maniaques.fr` ·
`lebontri.fr` · `techradar.com/fr-fr` · `statista.fr`.

**Type dominant : Comparison Page (hub de comparatifs avec prix), 80 %.**

**L'accueil d'Aspirob est un hub éditorial de 258 mots pointant vers 5 articles.** Les hubs
classés sur ce SERP agrègent des dizaines de fiches produit, des catégories, des marques, un
outil de recommandation et des comparatifs par budget. L'écart est structurel et non
rattrapable à court terme. **Recommandation : ne pas cibler cette tête de requête.** Le site
n'a aucun chemin réaliste vers ce SERP dans les 18 prochains mois, et l'y consacrer des
ressources détournerait des requêtes de longue traîne atteignables.

Le bloc « Par où commencer — choisissez votre situation » de l'accueil (4 entrées :
chat/chien, carrelage/parquet, zones ratées, navigation) est en revanche **la meilleure idée
UX du site**. C'est un routage par intention, exactement ce que les concurrents font avec
leur outil « Quel aspirateur robot vous correspond ? ». Il est sous-exploité : il n'apparaît
que sur l'accueil, alors que c'est l'élément qui devrait figurer en bas de chaque guide.

---

## 3. Détection d'inadéquation de type de page

| Page cible | Type Aspirob | Type dominant SERP | Sévérité | Nature de l'écart |
|---|---|---|---|---|
| `/articles/aspirateur-robot-poils-animaux-chat-chien/` | Comparison Page | Comparison Page (70 %) | **CRITIQUE** | Type correct, **devise décisionnelle absente** + entités périmées |
| `/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/` | Comparison Page narrative | Comparison + Tool + Vidéo | **ÉLEVÉE** | Sous-type : mesure et vidéo absentes |
| `/articles/navigation-lidar-aspirateur-robot-explication/` | Blog Post | Blog Post (60 %) | **ALIGNÉ** | Déficit d'autorité et de média |
| `/articles/navigation-lidar-camera-aspirateur-robot-differences/` | Blog Post | Blog Post (60 %) | **ALIGNÉ** | Idem + risque de cannibalisation avec l'article ci-dessus |
| `/articles/aspirateur-robot-animaux-erreurs-eviter/` | Blog Post | Blog Post (60 %) | **MOYENNE** | Angle décalé (opérationnel vs sécurité), sujet clé relégué en FAQ |
| `/` | Hub éditorial | Comparison Hub (80 %) | **CRITIQUE** | Écart structurel, requête à abandonner |
| `/comparatifs/` (1 article), `/guides/` (3 articles) | Liste de catégorie | Comparison Page | **CRITIQUE** | 74 et 123 mots ; aucune valeur ajoutée sur l'accueil |

**Conclusion de la section.** Il n'y a **pas** d'inadéquation de type de page au sens
classique — pas de blog post ciblant une requête produit, pas de landing page ciblant un
how-to. Le diagnostic est plus fin et, à certains égards, plus difficile à corriger : le site
occupe un **troisième pôle** — « explication structurelle sans chiffres » — qui n'a aucun
représentant dans le top 10 d'aucune des trois SERP commerciales lues. Les deux pôles qui
gagnent sont le pôle **mesure** (Test-Achats, RTINGS, Clubic) et le pôle **architecture de
prix** (meilleurs-aspirateurs-robots, labomaison, lebontri). Aspirob n'est ni l'un ni
l'autre, par choix éditorial assumé.

---

## 4. User stories dérivées des signaux SERP

**1. Propriétaire de chat en période de mue — phase considération**
> En tant que **propriétaire de chat qui retrouve des poils partout**, je veux savoir quels
> modèles ne s'emmêlent pas, parce que **j'ai déjà eu un robot dont je passais mon temps à
> démêler la brosse**, mais je suis bloqué par **une information technique invérifiable** :
> tous les vendeurs disent « anti-emmêlement ».
>
> *Signal : requête « aspirateur robot poils de chat » ; chiffre consensuel du SERP « les
> brosses à soies réduisent l'aspiration de 40 à 60 % » ; H2 concurrent « Pourquoi les robots
> classiques échouent face aux poils ».*
> **Aspirob répond bien** — la distinction caoutchouc / soies filiformes est le bon
> diagnostic, posée dès le bloc « L'essentiel ». C'est la story la mieux servie du site.

**2. Acheteur à budget contraint — phase décision**
> En tant qu'**acheteur avec un budget de 400 à 600 €**, je veux savoir lequel de ces modèles
> entre dans mon budget, parce que **je ne veux pas tomber amoureux d'un modèle à 1 100 €**,
> mais je suis bloqué par **l'absence totale d'indication de prix**.
>
> *Signal : 84 mentions de prix sur le résultat n°3 ; H3 concurrents « le meilleur à moins de
> 1000 € » et « à moins de 600 € » ; fourchette « 169 € à 1 099 € » et repère « compter 300
> à 600 € » dans la synthèse du SERP.*
> **Aspirob ne répond pas du tout.** Cette story est la plus fréquente du SERP commercial et
> la seule que le site rend structurellement impossible à servir.

**3. Comparateur haut de gamme en dernière ligne droite — phase décision**
> En tant que **futur acheteur ayant réduit son choix à deux modèles**, je veux voir lequel
> nettoie réellement mieux, parce que **je m'apprête à dépenser plus de 1 000 €**, mais je
> suis bloqué par **l'absence de preuve** : chaque marque revendique la supériorité.
>
> *Signal : RTINGS en position 1 avec banc de test instrumenté ; 3 vidéos YouTube « How well
> do they Clean? » dans le top 10 ; versus.com (table de specs) en position 6.*
> **Aspirob répond partiellement** : l'arbitrage éditorial (« qui devrait acheter lequel »,
> « aucun des deux si ») est excellent, la preuve est absente.

**4. Propriétaire d'un robot qui dysfonctionne — phase post-achat / rétention**
> En tant que **propriétaire d'un robot qui rate toujours le même coin**, je veux comprendre
> pourquoi et le corriger, parce que **je commence à regretter mon achat**, mais je suis
> bloqué par **des guides qui expliquent ce qu'est le LiDAR au lieu de réparer mon problème**.
>
> *Signal : les 6 guides classés répondent à « qu'est-ce que le LiDAR » ; aucun ne traite le
> symptôme ; FAQ concurrente « La navigation fonctionne-t-elle dans le noir ? » = registre
> définitionnel.*
> **Aspirob répond mieux que tout le SERP.** C'est le seul espace où le site est en avance
> sur le consensus. À exploiter en priorité.

**5. Propriétaire d'animal inquiet d'un incident — phase awareness**
> En tant que **propriétaire de chien qui a lu des histoires d'horreur**, je veux savoir si
> le robot va étaler une déjection dans tout l'appartement, parce que **le risque redouté est
> disproportionné par rapport au bénéfice**, mais je suis bloqué par **des réponses de
> fabricants dont je doute de l'impartialité**.
>
> *Signal : « Aspirateur robot et crottes de chien : peut-il les éviter ? » (ECOVACS) ;
> « Éviter les accidents entre animaux et aspirateur robot » (Rowenta) ; « Les 10 pires
> bêtises de robots aspirateurs » ; fil de forum Casanaute dans le top 10.*
> **Aspirob a le contenu mais au mauvais endroit** : la réponse est dans la FAQ n°4 de
> `animaux-erreurs-eviter`, en bas de page, invisible pour un extrait optimisé.

*Couverture : awareness (5), considération (1, 4), décision (2, 3). Cinq stories, quatre
sources de signal distinctes, aucun doublon.*

---

## 5. Notation par profil d'acheteur

Six profils dérivés des grappes de signaux SERP. Aucun profil inventé.

| Profil | Pertinence | Clarté | Confiance | Action | Total | Note |
|---|---|---|---|---|---|---|
| Chasseur de promo / Black Friday | 6/25 | 4/25 | 12/25 | 5/25 | **27/100** | Inadéquation critique |
| Acheteur à budget contraint | 8/25 | 5/25 | 12/25 | 6/25 | **31/100** | Inadéquation critique |
| Propriétaire d'animal inquiet | 18/25 | 16/25 | 14/25 | 9/25 | **57/100** | À retravailler |
| Propriétaire de chat en mue | 20/25 | 19/25 | 9/25 | 11/25 | **59/100** | À retravailler |
| Comparateur haut de gamme | 21/25 | 20/25 | 12/25 | 13/25 | **66/100** | Correct |
| Propriétaire de robot frustré | 22/25 | 21/25 | 15/25 | 10/25 | **68/100** | Correct |

### Profil le plus faible à fort volume : **Acheteur à budget contraint — 31/100**

**Preuves sur la page.** Sur `aspirateur-robot-poils-animaux-chat-chien` : 0 occurrence de
« € », 0 fourchette, 0 mention de tranche, aucun tri par prix, aucun H2 ou H3 contenant un
seuil budgétaire. La seule référence au prix de toute la sélection est négative : « Le haut
de la gamme en prix de cette sélection » pour le Roomba Combo j9+ — une information
relationnelle sans référentiel, donc inexploitable. Sur le face-à-face, le site va jusqu'à
conclure « meilleur rapport fonctionnalités/prix » **sans afficher aucun des deux prix**,
ce qui est un jugement de valeur que l'utilisateur ne peut pas vérifier.

**Correction concrète.** Ajouter sous le tableau de chaque comparatif une colonne
« Fourchette constatée » alimentée par l'API Product Advertising Amazon, affichée avec sa
date : `« 429 € — relevé le 20/09/2026 sur Amazon.fr »`. Ce n'est pas un chiffre inventé,
c'est une observation datée et attribuée — parfaitement compatible avec
`/mentions-legales/#methode`, et d'ailleurs plus rigoureux que les 84 prix non horodatés du
concurrent classé n°3. Ajouter ensuite trois H3 de segmentation :
« Moins de 400 € : … », « 400 à 700 € : … », « Plus de 700 € : … ».

### Deuxième profil le plus faible : **Chasseur de promo — 27/100**

Volume fortement saisonnier mais très élevé en novembre. Le site non seulement ne le sert
pas, mais l'oriente activement vers Keepa et Idealo (voir §1). Une page
`/aspirateur-robot-black-friday/` avec un tableau de prix horodatés est le contenu au
meilleur rapport effort / revenu du site, et il est absent.

### Problème systémique n°1 : la dimension **Action** (moyenne 9/25 sur les six profils)

C'est la dimension la plus basse pour **tous** les profils, y compris ceux qui obtiennent un
bon total. Constat mesuré :

| Article | Liens Amazon | Liens internes | Vidéos | Tableaux |
|---|---|---|---|---|
| `aspirateur-robot-poils-animaux-chat-chien` | 10 | 5 | 0 | 1 |
| `roomba-j9-plus-vs-roborock-s8-pro-ultra` | 4 | 5 | 0 | 2 |
| `navigation-lidar-...-explication` | **0** | 6 | 0 | 1 |
| `navigation-lidar-camera-...-differences` | **0** | 5 | 0 | 1 |
| `aspirateur-robot-animaux-erreurs-eviter` | **0** | 5 | 0 | 0 |

Les trois guides — qui sont les seules pages du site réellement compétitives — n'ont
**aucune sortie commerciale**. Le guide « 5 erreurs » recommande explicitement de remplacer
une brosse à soies par une brosse caoutchouc : c'est une intention d'achat déclarée par
l'utilisateur dans le corps même du texte, sans aucun chemin pour l'exécuter. La barre de
navigation propose « Quel robot choisir ? → » qui pointe vers `/comparatifs/`, une page de
74 mots listant un seul article. C'est le principal cul-de-sac du site.

### Problème systémique n°2 : la dimension **Confiance** (moyenne 12,3/25)

Trois causes mesurées, aucune liée à l'honnêteté du site — qui est réelle :
- **Aucune photographie produit.** Les 7 fichiers `/fiches/*.svg` pèsent entre 1,5 et 2,7 Ko,
  soit des schémas au trait génériques. Un acheteur ne peut identifier visuellement aucun des
  modèles recommandés. Les visuels de couverture sont des photos Unsplash d'illustration,
  correctement créditées mais sans rapport avec les produits comparés.
- **Zéro vidéo** sur un SERP face-à-face dont 30 % du top 10 est vidéo.
- **Aucune entité auteur.** « Dany Derensy » n'a ni biographie, ni qualification, ni `sameAs`.
  Sur un site qui déclare ne pas tester, l'autorité repose entièrement sur la personne qui
  écrit ; cette personne n'existe pas aux yeux d'un moteur.

---

## 6. Écart de gap par dimension

Barème : Type de page /15 · Profondeur /15 · Signaux UX /15 · Schema /15 · Média /15 ·
Autorité /15 · Fraîcheur /10.

| Dimension | Comparatif chat | Face-à-face | Guides LiDAR | Preuve |
|---|---|---|---|---|
| Type de page | 9 | 8 | 13 | Format aligné ; segmentation par budget / profil absente ; sous-type mesure+vidéo absent sur le face-à-face |
| Profondeur | 6 | 8 | 11 | 1 301 / 1 430 / 1 322 mots ; 3 H2 de prose seulement sur le comparatif chat ; labomaison à 2 254 mots |
| Signaux UX | 9 | 10 | 12 | Sommaire, bloc « L'essentiel », fil d'Ariane, CTA par produit : bons. Aucun tri, aucun filtre, aucun outil de routage |
| Schema | 7 | 7 | 10 | BlogPosting + FAQPage + BreadcrumbList + Organization/WebSite. **Ni ItemList, ni Product, ni Offer, ni Review, ni AggregateRating, ni HowTo** — le concurrent classé expose HowTo + HowToStep + ItemList |
| Média | 4 | 3 | 8 | 7 / 4 / 3 images, 0 vidéo, 0 photo produit. ECOVACS : 24 images + 3 vidéos. Les diagrammes SVG sur mesure sont le seul actif différenciant |
| Autorité | 3 | 3 | 3 | Domaine de 2 jours, aucun backlink, aucune citation externe éditoriale, face à des domaines fabricants et à un laboratoire de consommateurs |
| Fraîcheur | 4 | 6 | 7 | Horodatage parfait (18/09, maj 20/09) mais **zéro recouvrement d'entités produit avec le SERP 2026** |
| **Total** | **42/100** | **45/100** | **64/100** | |

Note sur la ligne Schema : l'absence de `Product` et d'`Offer` est **cohérente** avec la
politique du site — déclarer un `Offer` sans prix est impossible et déclarer une `Review`
avec `ratingValue` sans test serait malhonnête. En revanche **`ItemList` est gratuit** : la
sélection anti-poils est littéralement une liste ordonnée de 5 éléments numérotés 1 à 5 dans
le HTML. Ne pas la déclarer est une perte sèche sans contrepartie éthique.

---

## 7. Recommandations, par ordre de priorité

Triées par profil le plus faible d'abord, puis par problème systémique.

**1. Rétablir un axe de tri chiffré sans trahir la méthode — `poils-animaux-chat-chien`, `roomba-j9-vs-roborock`.**
Prix horodatés et attribués via l'API Amazon (« 429 € — relevé le 20/09/2026 »), plus trois
H3 de segmentation budgétaire. Sert le profil à 31/100 et le profil à 27/100. Un prix daté
n'est pas un chiffre inventé ; c'est le seul type de chiffre que le site peut publier en
respectant intégralement sa propre règle.

**2. Substituer une devise de classement à celle que le site refuse.**
Puisque les pascals sont refusés à juste titre, il faut occuper l'emplacement avec autre
chose de mesurable et de vérifiable côté constructeur : hauteur totale en mm (décisif pour
passer sous les meubles, angle déjà développé dans l'article LiDAR vs caméra), capacité du
sac de la station en litres, prix des consommables annuels, matériau de la brosse. Ce sont
des données de fiche constructeur, sourçables, et personne sur le SERP français ne les
tabule proprement. C'est la façon de devenir un **quatrième pôle** au lieu d'être absent des
trois autres.

**3. Renouveler le parc produit.** Remplacer ou compléter la sélection 2022-2023 par les
entités que le SERP 2026 reconnaît : Dreame X50 Ultra / Aqua10, Roborock Qrevo Curv, Ecovacs
T80 Omni, Narwal Freo Z Ultra. Sans recouvrement d'entités, aucune page comparative
n'entrera dans ce SERP, quel que soit son format.

**4. Ouvrir une sortie commerciale sur les trois guides.** Zéro lien affilié sur les trois
pages les plus compétitives du site. À l'endroit exact où le guide « 5 erreurs » conseille de
remplacer une brosse à soies par une brosse caoutchouc, insérer un encadré « Brosses
caoutchouc compatibles » avec 2-3 liens. C'est la conversion la moins forcée du site et elle
n'existe pas.

**5. Faire remonter le sujet des déjections en H2.** Sur `animaux-erreurs-eviter`, promouvoir
la FAQ n°4 en section « Le robot détecte-t-il les déjections de mon animal ? ». Deux
résultats du top 10 de cette SERP sont consacrés à cette seule question. Sert le profil
« propriétaire inquiet » (57/100).

**6. Ajouter `ItemList` sur les deux comparatifs, `HowTo` sur les deux guides LiDAR.** Gains
de schema sans compromis éthique. Les deux guides contiennent déjà des procédures numérotées
(« Reconstruire la carte dans de bonnes conditions », « Utiliser les zones virtuelles avec
précision »). Le concurrent classé expose `HowTo` + `HowToStep` sur la requête navigation.
→ voir `/seo schema` pour la génération.

**7. Créer l'entité auteur.** Page `/a-propos/dany-derensy/` avec biographie, qualification,
`sameAs`, et `author.url` du `BlogPosting` repointé dessus. Sur un site qui ne teste pas, la
crédibilité de la personne *est* le capital de confiance.
→ voir `/seo content` pour l'analyse E-E-A-T détaillée.

**8. Généraliser le routage par intention.** Le bloc « Par où commencer — choisissez votre
situation » de l'accueil est la meilleure idée UX du site et n'apparaît qu'une fois. Le
placer en bas de chaque guide résout simultanément le cul-de-sac des trois guides et
l'absence d'outil de routage que les concurrents ont sous forme de quiz.

**9. Étoffer ou désindexer `/comparatifs/` et `/guides/`.** 74 et 123 mots. Le CTA principal
de la barre de navigation (« Quel robot choisir ? → ») pointe sur la première.
→ voir `/seo page` pour l'audit de contenu mince.

**10. Abandonner la tête de requête « aspirateur robot ».** Aucun chemin réaliste face à
Clubic et aux hubs de centaines de fiches. Concentrer sur la longue traîne de problème, où
le site est déjà en avance sur le consensus (story n°4).

---

## 8. Limites de cet audit

- **Blocs SERP non observables.** L'outil de recherche disponible ne restitue ni les PAA, ni
  les annonces, ni l'AI Overview, ni le carrousel Shopping. Les signaux PAA et publicitaires
  de ce rapport sont **reconstitués par proxy** à partir des FAQ des pages classées et des
  formulations de titres. Une vérification manuelle sur google.fr en navigation privée est
  nécessaire avant d'engager la recommandation n°1, qui en dépend partiellement.
- **Géolocalisation.** L'outil de recherche est indexé sur les États-Unis. Les SERP
  françaises ont été approchées par requêtes en français ; le SERP « j9+ vs S8 Pro Ultra »
  est revenu majoritairement anglophone, ce qui est cohérent avec l'hypothèse d'un déficit de
  contenu français sur ce face-à-face, mais n'en constitue pas une preuve. À revalider
  depuis une IP française.
- **Aucune donnée de performance.** Le site a deux jours ; aucune impression, aucun CTR,
  aucun taux de rebond, aucune donnée Search Console. Toutes les conclusions de ce rapport
  sont dérivées du SERP et du contenu, jamais du comportement observé.
- **Positions non mesurées.** Aucune vérification de rang n'a été faite ; le contexte indique
  qu'aucun positionnement n'est acquis, ce qui rend l'exercice prospectif par nature.
- **Volumes de recherche non disponibles.** La pondération des profils (« à fort volume »)
  repose sur la densité des signaux SERP — nombre de résultats consacrés à un angle, présence
  du thème dans les titres — et non sur des données de volume. Ordre de grandeur, pas mesure.
- **Concurrents partiellement mesurés.** Sept pages concurrentes ont été récupérées en mode
  brut (sans rendu JavaScript) : les compteurs de prix, de notes et de médias sous-estiment
  les pages dont une partie du contenu est injectée côté client. RTINGS, notamment, n'a
  renvoyé que 125 mots en HTML brut — son comparateur est une application JavaScript, et son
  contenu réel n'a donc pas pu être mesuré.
- **Cœurs de métier non couverts ici.** Vitesse, Core Web Vitals, maillage, backlinks et
  qualité rédactionnelle relèvent des rapports `technical.md`, `backlinks.md`, `cluster.md`
  et `content.md` du même audit.

---

Générer un rapport PDF ? `/seo google report`

---

## Findings structurés (audit-data.json — catégorie « Search Experience »)

```json
{
  "category": "search_experience",
  "scores": {
    "sxo_gap_weighted": 48,
    "sxo_gap_commercial_listicle": 42,
    "sxo_gap_head_to_head": 45,
    "sxo_gap_educational_guides": 64,
    "sxo_gap_homepage_and_categories": 31,
    "dimension_page_type": 10,
    "dimension_content_depth": 8,
    "dimension_ux_signals": 10,
    "dimension_schema": 8,
    "dimension_media": 5,
    "dimension_authority": 3,
    "dimension_freshness": 6
  },
  "serp_analysis": {
    "method": "organic_titles_and_competitor_page_fetch",
    "paa_ads_ai_overview": "not_observable_by_tooling_proxied_from_competitor_faq",
    "geo_warning": "search_index_us_based_fr_serps_approximated",
    "serps_read": [
      {"keyword": "meilleur aspirateur robot poils de chat 2026", "dominant_type": "comparison_page", "confidence": 0.70, "target_type": "comparison_page", "mismatch": "critical", "mismatch_nature": "decision_currency_absent"},
      {"keyword": "roomba j9+ vs roborock s8 pro ultra", "dominant_type": "comparison_page", "confidence": 0.50, "target_type": "comparison_page_narrative", "mismatch": "high", "mismatch_nature": "subtype_measurement_and_video_absent", "note": "top10_majoritairement_anglophone_opportunite_fr"},
      {"keyword": "aspirateur robot lidar ou camera", "dominant_type": "blog_post", "confidence": 0.60, "target_type": "blog_post", "mismatch": "aligned"},
      {"keyword": "comment fonctionne navigation lidar aspirateur robot", "dominant_type": "blog_post", "confidence": 0.60, "target_type": "blog_post", "mismatch": "aligned", "note": "angle_troubleshooting_absent_du_serp_opportunite"},
      {"keyword": "aspirateur robot chien chat erreurs a eviter", "dominant_type": "blog_post", "confidence": 0.60, "target_type": "blog_post", "mismatch": "medium", "mismatch_nature": "angle_operationnel_vs_angle_securite"},
      {"keyword": "comparatif aspirateur robot", "dominant_type": "comparison_hub", "confidence": 0.80, "target_type": "editorial_hub_258_words", "mismatch": "critical", "recommendation": "abandon"}
    ]
  },
  "competitor_measurements": [
    {"url": "meilleurs-aspirateurs-robots.fr/guide-achat/aspirateur-robot-animaux", "words": 959, "eur_mentions": 84, "score_mentions": 0, "schema": ["HowTo", "HowToStep", "FAQPage", "BlogPosting", "ItemList"], "segmentation": "budget_et_profil_animal"},
    {"url": "labomaison.com/.../meilleurs-aspirateurs-robots-animaux-2026", "words": 2254, "eur_mentions": 10, "score_mentions": 23, "test_mentions": 123, "segmentation": "prix_dans_les_h3"},
    {"url": "meilleurs-aspirateurs-robots.fr/guide-achat/navigation-robot-aspirateur", "words": 904, "eur_mentions": 82, "note": "requete_informationnelle_mais_page_hybride_avec_prix"},
    {"url": "ecovacs.com/fr/blog/lidar-vs-vslam", "words": 1697, "images": 24, "videos": 3},
    {"url": "rtings.com/.../roborock-s8-vs-roomba-j9-plus", "words_raw_html": 125, "note": "comparateur_js_non_mesurable_en_mode_raw"}
  ],
  "findings": [
    {"id": "decision-currency-absent", "severity": "critical", "pages": ["/articles/aspirateur-robot-poils-animaux-chat-chien/", "/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "evidence": "0 occurrence de prix, 0 note, 0 mesure sur les 2 pages commerciales ; 84 prix sur le concurrent classe n3 avec 959 mots seulement", "detail": "Le type de page est correct. Aucun axe de tri chiffre n'est propose, donc aucune intention commerciale ne se termine sur le site."},
    {"id": "product-entity-generation-gap", "severity": "critical", "pages": ["/articles/aspirateur-robot-poils-animaux-chat-chien/", "/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "evidence": "Aspirob cite Roborock Q5 Max+, Roomba j9+, Dreame L10s Ultra, Ecovacs T20 Omni, Shark RV1000SEU (2022-2023). SERP 2026 cite Dreame X50/Aqua10, Roborock Qrevo Curv, Ecovacs T80/T90 Omni, Narwal Freo Z Ultra, Bosch BCRD2W.", "detail": "Zero recouvrement d'entites produit avec le SERP 2026. Fraicheur d'horodatage parfaite, fraicheur d'entites nulle."},
    {"id": "conversion-leak-to-price-trackers", "severity": "high", "pages": ["/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "evidence": "Un traqueur de prix comme Keepa ou Idealo vous montrera l'historique reel ; consultez la fiche produit pour le tarif du jour", "detail": "La page transfere la phase de decision a un tiers. Le tag affilie aspirob0d-21 ne capte pas la conversion."},
    {"id": "no-commercial-exit-on-guides", "severity": "high", "pages": ["/articles/navigation-lidar-aspirateur-robot-explication/", "/articles/navigation-lidar-camera-aspirateur-robot-differences/", "/articles/aspirateur-robot-animaux-erreurs-eviter/"], "evidence": "0 lien Amazon sur les 3 guides ; le guide 5-erreurs conseille explicitement de remplacer une brosse a soies par une brosse caoutchouc sans aucun chemin d'achat", "detail": "Les 3 pages les plus competitives du site n'ont aucune sortie commerciale. Dimension Action moyenne 9/25."},
    {"id": "missing-itemlist-schema", "severity": "high", "pages": ["/articles/aspirateur-robot-poils-animaux-chat-chien/", "/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "evidence": "Blocs JSON-LD presents : Organization, WebSite, BlogPosting, WebPage, Person, BreadcrumbList, FAQPage. Absents : ItemList, Product, Offer, Review, AggregateRating, HowTo.", "detail": "L'absence de Product/Offer/Review est coherente avec la politique editoriale. ItemList ne l'est pas : la selection est deja une liste ordonnee numerotee 1 a 5 dans le HTML."},
    {"id": "no-product-imagery", "severity": "high", "pages": ["sitewide"], "evidence": "7 fichiers /fiches/*.svg de 1541 a 2725 octets = schemas au trait generiques ; visuels de couverture = photos Unsplash d'illustration", "detail": "Aucun acheteur ne peut identifier visuellement un modele recommande. SERP avec carrousel produit."},
    {"id": "zero-video-on-video-heavy-serp", "severity": "high", "pages": ["/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "evidence": "3 resultats YouTube sur 10 dans le top 10 ; 0 iframe sur les 5 articles du site", "detail": "30% du SERP face-a-face est video. Le site n'a aucun media de demonstration."},
    {"id": "budget-persona-unserved", "severity": "high", "pages": ["sitewide"], "evidence": "Profil acheteur a budget contraint : 31/100. Profil chasseur de promo : 27/100.", "detail": "Les deux profils a plus fort volume commercial du SERP sont structurellement impossibles a servir en l'etat."},
    {"id": "value-judgment-without-price", "severity": "high", "pages": ["/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "evidence": "meilleur rapport fonctionnalites/prix", "detail": "Conclusion de valeur invérifiable puisqu'aucun prix n'est affiche. Affaiblit la confiance au lieu de la renforcer."},
    {"id": "key-topic-buried-in-faq", "severity": "medium", "pages": ["/articles/aspirateur-robot-animaux-erreurs-eviter/"], "evidence": "Question dejections traitee en FAQ n4 en bas de page ; 2 resultats du top 10 lui sont entierement consacres (ECOVACS, guide-robots.fr)", "detail": "Le contenu existe mais pas a l'emplacement que le SERP recompense. Aucune chance d'extrait optimise."},
    {"id": "intent-router-underused", "severity": "medium", "pages": ["/"], "evidence": "Bloc 'Par ou commencer - choisissez votre situation' present uniquement sur l'accueil", "detail": "Meilleur actif UX du site. Equivalent du quiz 'Quel aspirateur robot vous correspond ?' des concurrents classes. Devrait figurer en bas de chaque guide."},
    {"id": "nav-cta-leads-to-thin-page", "severity": "medium", "pages": ["/comparatifs/"], "evidence": "CTA principal de l'en-tete 'Quel robot choisir ? ->' pointe vers /comparatifs/ qui contient 74 mots et 1 article", "detail": "Principal cul-de-sac de navigation du site."},
    {"id": "head-term-unreachable", "severity": "low", "pages": ["/"], "evidence": "Accueil 258 mots contre des hubs de centaines de fiches produit (Clubic, meilleurs-aspirateurs-robots.fr)", "detail": "Recommandation : abandonner la tete de requete et concentrer sur la longue traine de probleme."}
  ],
  "opportunities": [
    {"id": "troubleshooting-angle-uncontested", "pages": ["/articles/navigation-lidar-aspirateur-robot-explication/"], "detail": "Les 6 guides classes repondent a 'qu'est-ce que le LiDAR'. Aucun ne repond a 'pourquoi mon robot rate les memes zones'. Aspirob couvre un espace vide avec des H3 par symptome."},
    {"id": "french-gap-on-head-to-head", "pages": ["/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "detail": "Le top 10 de la requete vs est majoritairement anglophone (RTINGS, Digital Trends, versus.com, ebay.de). Google ne trouve pas de reponse francaise satisfaisante."},
    {"id": "verifiable-currency-substitute", "detail": "Hauteur totale en mm, capacite du sac en litres, cout annuel des consommables, materiau de brosse : donnees de fiche constructeur, sourcables, non tabulees proprement par le SERP francais. Devise de classement compatible avec la politique editoriale."},
    {"id": "timestamped-price-compatible-with-policy", "detail": "Un prix horodate et attribue via l'API Product Advertising ('429 EUR - releve le 20/09/2026 sur Amazon.fr') est une observation datee, pas un chiffre invente. Compatible avec /mentions-legales/#methode et plus rigoureux que les 84 prix non horodates du concurrent classe."},
    {"id": "custom-svg-diagrams", "detail": "diagrams/angles-morts.svg, lidar-cartographie.svg, navigation.svg, placement.svg : visuels originaux avec alt descriptifs, absents chez tous les concurrents. Meilleur actif differenciant du site, sous-exploite."}
  ],
  "cross_skill_referrals": ["seo schema (ItemList, HowTo)", "seo content (entite auteur, E-E-A-T)", "seo page (pages categories minces)"]
}
```
