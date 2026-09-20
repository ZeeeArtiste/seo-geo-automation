# Qualité de contenu — aspirob.com

Audit du 20/09/2026 · 10 pages · site en ligne depuis 2 jours · référentiel : Quality Rater
Guidelines de septembre 2025.

**Score global de qualité de contenu : 58/100**
**Score E-E-A-T pondéré : 45/100**
**Aptitude à la citation par IA : 68/100**

---

## 1. Verdict sur la méthode éditoriale (« pas de tests, pas de prix, pas de chiffres »)

La question posée est : est-ce que la transparence compense l'absence de tests ? **Non, pas
en l'état — et pas pour la raison qu'on attend.** Le problème n'est pas la politique. Le
problème est que **les articles ne la respectent pas**, ce qui fait payer au site le coût de
la contrainte sans lui en donner le bénéfice de crédibilité.

### La politique, telle qu'elle est affichée

`/mentions-legales/#methode` est l'une des meilleures pages du site :

> « **Nous n'inventons pas de chiffres.** Une donnée qui ne peut pas être vérifiée n'est pas
> publiée — elle n'est pas remplacée par une estimation plausible. Les articles sont rédigés
> avec l'assistance d'un modèle de langage, puis relus et corrigés à la main **pour retirer
> toute affirmation non étayée**. »

C'est clair, vérifiable, et l'aveu d'assistance IA est un signal de transparence
authentique. La déclaration est reprise dans `/llms.txt` et rappelée dans les tableaux
comparatifs (« Comparatif des caractéristiques structurelles — aucune donnée non vérifiée »).

### Ce que les articles publient réellement

Relevé exhaustif des chiffres non sourcés publiés malgré la règle :

| Article | Chiffres publiés sans source |
|---|---|
| `animaux-erreurs-eviter` | « au moins **50 cm** devant et **30 cm** de chaque côté » ; « au minimum **90 minutes** » ; « visez **120 minutes** ou plus » ; « toutes les **une à deux semaines** » ; « moins de **dix centimètres** de haut » |
| `navigation-lidar-...-explication` | « environ **8 à 12 cm** du sol » ; « plusieurs **centaines de mesures par seconde** » ; « moins de **~1 cm** de diamètre » ; « un appartement de **60 à 80 m²**… soit **1 à 3 heures** » |
| `lidar-camera-differences` | « **plusieurs centaines de rotations par minute** » ; « précision de l'ordre du **centimètre** » ; « Meubles très bas (**< 9 cm**) » |
| `roomba-j9-vs-roborock` | « espace dédié de **30×40 cm** environ » ; « filtres tous les **2-3 mois**, brosses tous les **6-12 mois** » ; « poils dépassant **2-3 cm** » |

Aucun de ces chiffres n'est rattaché à une fiche constructeur, une norme ou une source. Ce
sont exactement des « estimations plausibles », c'est-à-dire ce que la page méthode promet
de ne pas faire.

### Trois affirmations qui contredisent frontalement la méthode

**a) Une revendication d'expérience directe sur un site qui ne teste pas.** Dans
`roomba-j9-plus-vs-roborock-s8-pro-ultra` :

> « La puissance d'aspiration est supérieure sur le papier, et **on le ressent sur les tapis
> épais**. »

Et, sur le j9+ : « La détection d'obstacles (câbles, chaussettes) est en revanche **une des
meilleures du marché** grâce aux capteurs visuels. » Puis, sur le S8 : « retire les taches
légères sèches **de façon convaincante — pas parfaite, mais nettement au-dessus de la
concurrence** dans cette gamme. »

C'est le marqueur de contenu IA de faible qualité le plus explicitement visé par les QRG de
septembre 2025 : un vocabulaire expérientiel appliqué à une expérience qui n'a pas eu lieu.
Sur un site qui déclare publiquement ne pas acheter les modèles, un évaluateur humain qui
lit ces deux phrases côte à côte conclut à une fabrication, et le bénéfice de la
transparence s'inverse en pénalité de confiance.

**b) Des jugements de prix sur un site qui n'affiche pas de prix.** Même article :

> « le Roborock S8 Pro Ultra est plus polyvalent et offre un **meilleur rapport
> fonctionnalités/prix** »

> « le Roborock S8 Pro Ultra offre plus de polyvalence **à un prix comparable** »

Un rapport fonctionnalités/prix ne peut pas s'établir sans connaître les prix. La politique
« nous n'affichons pas de prix » est justifiée (les tarifs bougent), mais elle interdit
logiquement ce type de conclusion, qui est pourtant le verdict de l'article.

**c) Une contradiction numérique interne dans un même article.** Toujours le même :

> intro : « Ni l'un ni l'autre ne se justifie réellement si votre intérieur fait **moins de
> 80 m²** »
>
> section « Aucun des deux si » : « Votre appartement fait **moins de 60-70 m²** »

Deux seuils incompatibles à ~900 mots d'écart. C'est le type d'incohérence qu'une relecture
humaine attrape, et sa présence affaiblit la crédibilité de la mention « relus et corrigés à
la main ».

**d) Deux fautes qui affaiblissent la même mention.** `navigation-lidar-...-explication` :
« **Pluôt** que d'espérer que le robot s'adapte » (pour *Plutôt*). `lidar-camera-differences` :
« un câble posé à plat sur le sol ou **un chaussette** » (pour *une chaussette*). Ce sont des
fautes typiques de génération non relue ; sur une page qui revendique une relecture manuelle,
elles coûtent plus cher que sur un site ordinaire.

### Là où la politique dessert vraiment le site

Sur le comparatif `aspirateur-robot-poils-animaux-chat-chien`, la contrainte produit du vide :

> « Son **bac de grande capacité** est un avantage concret pour les foyers avec plusieurs
> animaux. » (aucune contenance)
>
> « Sa brosse principale en caoutchouc « DuoRoller » **réduit significativement**
> l'accumulation de poils. » (« significativement » par rapport à quoi, mesuré comment ?)

Et le titre promet ce que la méthode interdit : « les 5 modèles qui ne s'emmêlent **vraiment**
pas ». « Vraiment » annonce une vérification. Le mot « vraiment/réellement » apparaît **11
fois** dans l'article versus et **6 fois** dans ce comparatif : le site emprunte le registre
lexical du test sans le test.

Enfin, une affirmation causale forte, non étayée : « **la quasi-totalité des pannes
constatées** sur ces modèles viennent de poils accumulés dans les axes et les roulements » —
constatées par qui ? Et : « La brosse en caoutchouc seule **peut doubler la durée de vie
utile** de l'appareil ».

### Là où elle sert le site

Elle n'est pas à jeter. Deux passages montrent qu'elle produit un contenu réellement
supérieur à la moyenne du secteur affilié :

> « Quant à la puissance d'aspiration annoncée en pascals, elle n'est pas mesurée selon une
> norme commune d'un fabricant à l'autre — comparer deux chiffres de marques différentes n'a
> donc pas grand sens. » (`roomba-j9-vs-roborock`)

C'est juste, utile, et c'est un angle que 95 % des comparatifs concurrents n'ont pas. De
même, la section « Aucun des deux si » qui déconseille l'achat, et « Ce qu'il ne fait pas
bien : laver les sols. La fonction serpillière est **anecdotique** — elle humidifie
légèrement, elle ne nettoie pas vraiment » : un site purement affilié n'écrit pas ça. Ce sont
de vrais signaux d'indépendance éditoriale.

**Conclusion pratique.** Deux voies cohérentes, la seconde est meilleure :
1. Garder la règle et l'appliquer strictement : supprimer les ~20 chiffres non sourcés, les
   jugements de prix et le vocabulaire expérientiel.
2. **Recommandé :** requalifier la méthode en « nous ne testons pas, nous citons les
   spécifications constructeur avec le lien vers la source ». Le site gagne des chiffres
   citables (donc de l'aptitude à la citation IA) et des liens sortants d'autorité, tout en
   restant parfaitement honnête sur l'absence de test.

---

## 2. E-E-A-T détaillé

| Facteur | Poids | Score | Justification |
|---|---|---|---|
| **Expérience** | 20 % | **25**/100 | Aucun signal de première main, par conception assumée. Zéro photo produit propre (5 visuels Unsplash génériques, tous crédités « Photo d'illustration »). Aggravé, pas atténué, par le « on le ressent sur les tapis épais ». |
| **Expertise** | 25 % | **55**/100 | Le contenu technique est solide : SLAM, angles morts du plan de balayage horizontal, réflexion spéculaire sur miroir, absorption du laser par les surfaces noires mates, caoutchouc nervuré vs soies, allergène Fel d 1. C'est de la compétence réelle. Mais **auteur sans aucun élément de crédibilité** : « Dany Derensy » n'a ni page biographie, ni titre, ni expérience déclarée, ni `sameAs`. Le `author.url` du JSON-LD pointe vers `/mentions-legales/`, où l'on ne trouve que « Éditeur individuel ». Deux fautes d'orthographe/grammaire. |
| **Autorité** | 25 % | **20**/100 | **Zéro citation externe éditoriale sur l'ensemble du site.** Les seuls liens sortants sont les crédits Unsplash et deux liens affiliés Amazon (`tag=aspirob0d-21`). Aucun renvoi vers une fiche constructeur, une norme (IEC 62885), un test tiers ou une documentation technique. Site de 2 jours, aucune reconnaissance externe possible à ce stade — c'est attendu, mais l'absence totale de sources citées, elle, est un choix réparable immédiatement. |
| **Confiance** | 30 % | **72**/100 | Point fort du site. Éditeur nommé, directeur de publication, hébergeur complet (Hetzner, adresse), e-mail de contact, HTTPS, politique de confidentialité, divulgation d'affiliation **sur chaque page concernée** et pas seulement en pied de page, aveu d'assistance IA, et une procédure de correction explicite : « Pour signaler une inexactitude, écrivez à contact@aspirob.com : nous corrigeons ou retirons le passage, et la date de révision de l'article est mise à jour. » Déduction pour : adresse postale « communiquée sur demande » alors que le site a une activité commerciale (affiliation Amazon), et pour l'écart politique/pratique documenté en §1. |

**Score pondéré : (25×0,20) + (55×0,25) + (20×0,25) + (72×0,30) = 45,4 → 45/100**

*Rappel : cette pondération est le modèle interne de ce skill. Google ne publie aucun poids
numérique pour E-E-A-T et indique seulement que la confiance est le facteur le plus important.*

---

## 3. Profondeur et contenu mince

Longueurs réelles (contenu principal, hors navigation, TOC dupliqué et blocs de liens) :

| Page | Type | Mots | Plancher | Écart |
|---|---|---|---|---|
| `roomba-j9-plus-vs-roborock-s8-pro-ultra` | Comparatif | 1 575 | 1 500 | OK |
| `aspirateur-robot-poils-animaux-chat-chien` | Comparatif | 1 403 | 1 500 | −97 |
| `aspirateur-robot-animaux-erreurs-eviter` | Guide | 1 238 | 1 500 | −262 |
| `navigation-lidar-...-explication` | Guide | 1 229 | 1 500 | −271 |
| `lidar-camera-...-differences` | Guide | 1 218 | 1 500 | −282 |
| Accueil | Homepage | **258** | 500 | **−242** |
| `/guides/` | Catégorie | **123** | 300 | **−177** |
| `/comparatifs/` | Catégorie | **74** | 300 | **−226** |

Note : le comptage fourni en brief (1 380–1 610 mots) inclut le sommaire affiché deux fois,
le fil d'Ariane et les blocs « À lire aussi ». Le corps rédactionnel net est 10 à 15 % en
dessous.

**Le mot compte n'est pas un facteur de classement** (position confirmée par Google) ; ces
planchers sont des repères de couverture. Les vrais problèmes de finesse sont :

- 🔴 **`/comparatifs/` (74 mots) liste un seul article.** Une page de catégorie avec un item
  et deux phrases d'introduction est une page mince au sens strict : elle n'apporte rien
  qu'un lecteur ne trouve pas sur l'accueil. Même diagnostic, moins sévère, pour `/guides/`
  (3 articles, 123 mots).
- 🟠 **Accueil à 258 mots** : essentiellement des titres et des liens. Le bloc « Par où
  commencer » (4 entrées situationnelles) est une bonne idée d'architecture, mais il n'y a
  aucun texte qui explique qui édite le site et selon quelle méthode — alors que c'est
  précisément le différenciateur du projet. La méthode est enterrée dans les mentions légales.
- 🟢 **Aucune duplication inter-articles.** Vérifié par recouvrement de 6-grammes : le
  maximum entre deux articles est de 70 séquences, et elles proviennent toutes de la signature
  (« Par Dany Derensy · 18 septembre · 5 min de lecture ») et des titres des blocs de liens
  internes. Le corps de chaque article est rédigé indépendamment. C'est un bon point réel, et
  peu fréquent sur un site généré avec assistance IA.
- 🟠 **Chevauchement thématique entre les deux articles LiDAR.** `navigation-lidar-...-explication`
  et `lidar-camera-...-differences` expliquent tous deux le sigle « Light Detection And
  Ranging », la bosse du module rotatif, la cécité au plan horizontal (câbles, chaussettes) et
  le fonctionnement dans le noir. Les textes sont distincts (16 6-grammes communs seulement)
  mais l'intention de recherche se recoupe. Risque de cannibalisation à surveiller ; le lien
  interne existant de l'un vers l'autre est la bonne mitigation de départ.

---

## 4. Lisibilité

| Article | Mots/phrase | Syll./mot | Kandel-Moles | Phrases > 30 mots |
|---|---|---|---|---|
| `animaux-erreurs-eviter` | 19,7 | 1,64 | **66,6** | 6 |
| `lidar-explication` | 21,7 | 1,70 | **59,7** | 5 |
| `poils-animaux-chat-chien` | 21,4 | 1,71 | **59,5** | 14 |
| `lidar-camera-differences` | 19,8 | 1,75 | **58,0** | 9 |
| `roomba-j9-vs-roborock` | 23,8 | 1,70 | **57,7** | 14 |

Indice Kandel-Moles (adaptation française de Flesch) : 60–70 = « assez facile », 50–60 =
« assez difficile ». Le site est donc dans une zone acceptable pour un contenu technique
grand public, mais **glisse vers le difficile sur les deux pages transactionnelles**, celles
qui portent les liens affiliés — l'inverse de ce qu'on veut. 14 phrases de plus de 30 mots
dans chacune. Exemple typique (`roomba-j9-vs-roborock`, 44 mots) :

> « Avant d'acheter, regardez le prix des pièces détachées sur le site du fabricant et leur
> disponibilité — c'est ce qui déterminera le coût sur cinq ans, bien plus que l'écart de prix
> initial entre les deux modèles. »

Le style est par ailleurs de bonne tenue : ton direct, tirets cadratins bien employés,
alternance question/réponse dans les H2, pas de remplissage. Il ne « sonne » pas IA.

**Densité de mots-clés : saine, aucun bourrage.** « aspirateur robot » 0,51–1,03 % selon les
pages ; « lidar » 2,14–2,47 % sur les deux articles LiDAR (justifié par le sujet) ; « poils de
chat » 2,01 % sur le comparatif félin, à la limite haute mais naturel à la lecture. Les titres
sont écrits pour l'humain, pas pour l'algorithme.

---

## 5. Aptitude à la citation par une IA — 68/100

**Ce qui est en place, et c'est au-dessus de la moyenne :**

- `/llms.txt` complet, avec pour chaque article une **« Réponse directe »** rédigée, la date
  de publication, la catégorie et l'URL. C'est du travail d'orfèvre pour l'ingestion par LLM.
- Bloc **« L'essentiel »** en tête de chaque article, qui répond à la question du titre en 2
  phrases avant tout développement.
- JSON-LD complet et valide sur les 5 articles : `BlogPosting` (+ `datePublished`,
  `dateModified`, `author`, `publisher`, `articleSection`), `FAQPage`, `BreadcrumbList`,
  `WebSite`. 5 questions/réponses balisées par article.
- Tableaux comparatifs propres en HTML (matériaux qui trompent le LiDAR, situation →
  technologie recommandée, critère → modèle) : format hautement extractible.
- Hiérarchie H1/H2/H3 cohérente, sommaire ancré, questions en intitulés de section.

**Ce qui bloque la citation :**

- 🔴 **Rien à citer.** Un moteur génératif cite un fait attribuable. La politique « aucune
  donnée chiffrée » supprime exactement la matière citable, et les chiffres qui subsistent
  (§1) ne sont rattachés à aucune source, donc ni citables ni attribuables. Le site est
  paraphrasable mais pas citable — c'est la limite structurelle du projet.
- 🔴 **Aucune source externe.** Aucun lien vers un constructeur, une norme ou une
  documentation. Les LLM co-citent des pages qui s'inscrivent dans un graphe de sources ;
  ici, le graphe est vide.
- 🟠 **Entité auteur inexistante.** Pas de `Person` avec `sameAs`, pas de page biographie. Une
  IA n'a rien à quoi attribuer l'affirmation, ce qui réduit fortement la probabilité de
  citation nominative.
- 🟠 **`Content-Type: text/html` sans `charset`.** Vérifié en en-tête HTTP : la déclaration
  d'encodage n'existe que dans le `<meta>` HTML. Les navigateurs s'en sortent, mais un
  récupérateur qui se fie à l'en-tête retombe sur ISO-8859-1 et lit « approches opposÃ©es ».
  C'est reproductible : l'outil de rendu de cet audit a produit du mojibake sur tout le site.
  Correctif d'une ligne de configuration serveur, à forte valeur pour l'ingestion machine.
  *(À traiter côté technique.)*
- 🟠 Dates `dateModified` identiques à `datePublished` partout (normal à J+2, mais la
  procédure de révision annoncée devra les faire vivre).

---

## 6. Métadonnées — risque de templating : FAIBLE

`metadata_template.py` sur les 10 paires titre/description :

- `site_risk: low` · `templated_ratio: 0.0` · `templated_count: 0` · `shared_cta_phrases: {}`
- Aucun CTA générique partagé, aucune description dupliquée : les descriptions sont rédigées
  une par une. Bon point net.
- 🟠 `/comparatifs/` — `description_echoes_title` (sévérité moyenne) : le titre est
  « Comparatifs d'aspirateurs robots — Aspirob » et la description ouvre sur « Comparatifs
  d'aspirateurs robots : … ». Le snippet dit deux fois la même chose.
- 🔵 `/confidentialite/` et `/mentions-legales/` — `brand_suffix_in_description` (faible),
  sans importance sur des pages légales.

Longueurs : titres 25–59 caractères, descriptions 82–168. Seule la description de
`animaux-erreurs-eviter` (168 c.) risque la troncature en SERP.

---

## 7. Marqueurs de contenu IA de faible qualité (QRG septembre 2025)

| Marqueur | Présent | Détail |
|---|---|---|
| Formulations génériques, absence de spécificité | **Partiellement** | Fort sur le comparatif félin (« bac de grande capacité », « réduit significativement »). Absent des articles LiDAR, très spécifiques. |
| Aucun angle ni point de vue original | **Non** | L'angle « les pascals ne sont pas comparables entre marques », la section « Aucun des deux si », le calcul du coût des consommables : ce sont de vrais partis pris éditoriaux. |
| Aucun signal d'expérience directe | **Oui** | Par conception. Aggravé par le vocabulaire expérientiel emprunté (§1a). |
| Inexactitudes factuelles | **Non détectées** | La substance technique (SLAM, réflexion spéculaire, Fel d 1, plan de balayage horizontal) est correcte. Une incohérence interne (80 m² vs 60-70 m²). |
| Structure répétitive entre pages | **Non** | Gabarit commun (normal), mais corps rédactionnels indépendants — vérifié par 6-grammes. |

**Synthèse :** ce n'est pas du contenu IA de masse. C'est du contenu assisté par IA avec une
intention éditoriale réelle, dont la relecture humaine annoncée n'a pas été menée jusqu'au
bout sur les points qui comptent le plus (chiffres, revendications de performance, cohérence).

*Rappel : le Helpful Content System a été fusionné dans l'algorithme central en mars 2024 ; il
n'existe plus comme classifieur autonome. Les signaux d'utilité sont évalués dans chaque mise
à jour core.*

---

## 8. Recommandations, par priorité

### P1 — Crédibilité (à faire avant toute autre chose)

1. **Supprimer les revendications de performance non testées** du comparatif versus : « on le
   ressent sur les tapis épais », « une des meilleures du marché », « nettement au-dessus de
   la concurrence ». Les reformuler en attribution explicite (« iRobot annonce… », « les
   retours d'utilisateurs rapportent… »). Un seul de ces passages suffit à faire douter de
   toute la page méthode.
2. **Retirer ou requalifier les jugements de prix** (« meilleur rapport fonctionnalités/prix »,
   « à un prix comparable ») sur un site qui n'affiche pas de prix.
3. **Corriger la contradiction 80 m² / 60-70 m²** dans `roomba-j9-plus-vs-roborock-s8-pro-ultra`.
4. **Corriger les deux fautes** : « Pluôt » → « Plutôt » ; « un chaussette » → « une chaussette ».
5. **Trancher sur les ~20 chiffres non sourcés** : soit les supprimer, soit — bien mieux — les
   sourcer avec un lien vers la fiche constructeur et faire évoluer la page méthode en
   conséquence.

### P2 — E-E-A-T structurel

6. **Créer `/a-propos/` avec une vraie biographie de Dany Derensy** : pourquoi ce sujet, quelle
   expérience, depuis quand, et une reprise de la méthode. Ajouter un JSON-LD `Person` avec
   `sameAs` (LinkedIn, ou tout profil public), et faire pointer `author.url` vers cette page
   plutôt que vers les mentions légales. C'est le levier au meilleur rapport effort/gain du
   site : Expertise et Autorité sont plafonnées tant que l'auteur reste un nom sans entité.
7. **Ajouter des liens sortants éditoriaux** : pages produit constructeur, documentation
   technique, norme IEC 62885 pour la question des pascals. Actuellement zéro. C'est la seule
   façon d'exister dans un graphe de sources sans backlinks.
8. **Remonter la méthode éditoriale sur l'accueil** — un encadré de 60 mots avec lien vers
   `#methode`. C'est le différenciateur du site, il est invisible là où les gens arrivent.

### P3 — Couverture et structure

9. **Étoffer `/comparatifs/` (74 mots)** : soit publier 2-3 comparatifs supplémentaires, soit
   fusionner temporairement avec `/guides/` en une page « Tous nos articles ». Une catégorie à
   un seul item ne mérite pas son URL.
10. **Porter l'accueil à ~500 mots** en développant les 4 entrées « Par où commencer ».
11. **Ajouter une contenance de bac et une source** pour le Shark IQ (« bac de grande
    capacité ») et clarifier « réduit significativement » sur le DuoRoller — ou retirer
    l'adverbe.
12. **Découper les 14 phrases de plus de 30 mots** des deux comparatifs pour ramener le
    Kandel-Moles au-dessus de 60 sur les pages monétisées.
13. **Réécrire la description de `/comparatifs/`** pour qu'elle n'ouvre pas sur le texte exact
    du titre.
14. **Corriger l'en-tête `Content-Type` pour inclure `charset=utf-8`** (à coordonner avec
    l'audit technique).
15. **Surveiller le chevauchement des deux articles LiDAR** en Search Console ; s'ils se
    disputent les mêmes requêtes, fusionner ou repositionner `lidar-camera-differences` sur
    une intention plus décisionnelle.

---

## Findings structurés (audit-data.json — catégorie « Content Quality »)

```json
{
  "category": "content_quality",
  "scores": {
    "content_quality": 58,
    "eeat_weighted": 45,
    "eeat_experience": 25,
    "eeat_expertise": 55,
    "eeat_authoritativeness": 20,
    "eeat_trustworthiness": 72,
    "ai_citation_readiness": 68
  },
  "metadata_template_check": {
    "site_risk": "low",
    "templated_ratio": 0.0,
    "templated_count": 0,
    "pages_checked": 10,
    "shared_cta_phrases": {},
    "method": "heuristic"
  },
  "findings": [
    {"id": "experiential-claim-without-testing", "severity": "high", "pages": ["/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "evidence": "La puissance d'aspiration est superieure sur le papier, et on le ressent sur les tapis epais.", "detail": "Vocabulaire experientiel sur un site qui declare publiquement ne pas tester les produits. Marqueur QRG sept. 2025."},
    {"id": "unsourced-figures-vs-stated-policy", "severity": "high", "pages": ["/articles/aspirateur-robot-animaux-erreurs-eviter/", "/articles/navigation-lidar-aspirateur-robot-explication/", "/articles/navigation-lidar-camera-aspirateur-robot-differences/", "/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "evidence": "50 cm / 30 cm ; 90 minutes ; 120 minutes ; 8 a 12 cm ; 30x40 cm ; 2-3 mois ; 6-12 mois", "detail": "~20 chiffres non sources alors que /mentions-legales/#methode promet qu'une donnee non verifiable n'est pas publiee."},
    {"id": "price-judgment-without-prices", "severity": "high", "pages": ["/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "evidence": "meilleur rapport fonctionnalites/prix ; a un prix comparable", "detail": "Conclusion de valeur impossible a etablir sur un site qui n'affiche aucun prix."},
    {"id": "no-author-entity", "severity": "high", "pages": ["sitewide"], "detail": "Dany Derensy : aucune biographie, aucun titre, aucun sameAs. author.url du BlogPosting pointe vers /mentions-legales/ qui ne contient aucun element biographique. Plafonne Expertise et Autorite."},
    {"id": "zero-external-citations", "severity": "high", "pages": ["sitewide"], "detail": "Aucun lien sortant editorial sur les 10 pages. Seuls liens externes : credits Unsplash et affiliation Amazon (tag=aspirob0d-21)."},
    {"id": "internal-numeric-contradiction", "severity": "medium", "pages": ["/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/"], "evidence": "moins de 80 m2 (intro) vs moins de 60-70 m2 (section Aucun des deux si)", "detail": "Deux seuils incompatibles dans le meme article."},
    {"id": "thin-category-page", "severity": "medium", "pages": ["/comparatifs/", "/guides/"], "detail": "74 mots / 1 article et 123 mots / 3 articles. Valeur ajoutee nulle par rapport a l'accueil."},
    {"id": "thin-homepage", "severity": "medium", "pages": ["/"], "detail": "258 mots de contenu principal contre un plancher de 500. La methode editoriale, principal differenciateur, n'y figure pas."},
    {"id": "proofreading-errors", "severity": "medium", "pages": ["/articles/navigation-lidar-aspirateur-robot-explication/", "/articles/navigation-lidar-camera-aspirateur-robot-differences/"], "evidence": "Pluot que d'esperer ; un chaussette", "detail": "Contredit la mention 'relus et corriges a la main'."},
    {"id": "vague-claims-from-no-numbers-policy", "severity": "medium", "pages": ["/articles/aspirateur-robot-poils-animaux-chat-chien/"], "evidence": "bac de grande capacite ; reduit significativement l'accumulation de poils ; la quasi-totalite des pannes constatees", "detail": "La politique 'pas de chiffres' produit des affirmations invérifiables au lieu de chiffres verifiables."},
    {"id": "word-count-below-floor", "severity": "low", "pages": ["/articles/aspirateur-robot-animaux-erreurs-eviter/", "/articles/navigation-lidar-aspirateur-robot-explication/", "/articles/navigation-lidar-camera-aspirateur-robot-differences/", "/articles/aspirateur-robot-poils-animaux-chat-chien/"], "detail": "1218-1403 mots nets contre un repere de 1500 pour un article de fond. Le mot compte n'est pas un facteur de classement ; signal de couverture uniquement."},
    {"id": "topical-overlap-lidar", "severity": "low", "pages": ["/articles/navigation-lidar-aspirateur-robot-explication/", "/articles/navigation-lidar-camera-aspirateur-robot-differences/"], "detail": "Intentions de recherche proches. Textes distincts (16 6-grammes communs) mais risque de cannibalisation."},
    {"id": "readability-drop-on-money-pages", "severity": "low", "pages": ["/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/", "/articles/aspirateur-robot-poils-animaux-chat-chien/"], "detail": "Kandel-Moles 57.7 et 59.5, 14 phrases de plus de 30 mots chacune. Les deux pages porteuses de liens affilies sont les moins lisibles."},
    {"id": "description-echoes-title", "severity": "medium", "pages": ["/comparatifs/"], "detail": "La meta description ouvre sur le texte exact du titre."},
    {"id": "missing-charset-header", "severity": "medium", "pages": ["sitewide"], "detail": "Content-Type: text/html sans charset. Les recuperateurs machine qui se fient a l'en-tete lisent du mojibake. Nuit a l'ingestion par LLM. A traiter cote technique."}
  ],
  "strengths": [
    "Page methode editoriale explicite et verifiable, aveu d'assistance IA, procedure de correction publiee",
    "Divulgation d'affiliation sur chaque page concernee, pas seulement en pied de page",
    "Aucune duplication inter-articles (verifie par recouvrement de 6-grammes)",
    "llms.txt avec reponse directe redigee pour chaque article",
    "JSON-LD complet : BlogPosting, FAQPage, BreadcrumbList, WebSite sur les 5 articles",
    "Densite de mots-cles saine, aucun bourrage (0,5-1,0 % sur le terme principal)",
    "Angles editoriaux reels : incomparabilite des pascals, section 'Aucun des deux si', cout des consommables"
  ]
}
```
