---
title: "Comment fonctionne la navigation LiDAR : pourquoi votre robot aspire (ou rate) les mêmes zones"
seoTitle: "Navigation LiDAR : pourquoi des zones sont ratées"
description: "Comprendre la navigation LiDAR des aspirateurs robots : comment ça marche, pourquoi certaines zones sont ratées et comment y remédier."
publishDate: "2026-09-18"
updatedDate: "2026-09-20"
directAnswer: "Un aspirateur robot LiDAR mesure la distance aux obstacles avec un laser tournant et en construit une carte, ce qui lui permet de nettoyer en bandes parallèles plutôt qu'au hasard. S'il rate toujours les mêmes zones, la cause est presque toujours un angle mort du capteur ou une carte devenue obsolète."
cover: "/photos/navigation-lidar-aspirateur-robot-explication.webp"
cluster: "navigation"
category: "Guide"
faq: [{"question":"Pourquoi mon robot tourne-t-il en rond au lieu de faire des lignes droites ?","answer":"Cela arrive généralement quand la carte est corrompue ou quand le robot ne parvient pas à se localiser (capteur LiDAR sale ou bloqué). Nettoyez le module rotatif avec un chiffon sec et supprimez la carte pour en créer une nouvelle."},{"question":"Le LiDAR détecte-t-il les obstacles au sol comme les câbles ?","answer":"Non, le LiDAR scanne en plan horizontal et ne voit pas les objets plats posés au sol. Les câbles, chaussettes ou petits jouets sont détectés uniquement par les capteurs anti-chute ou les capteurs tactiles en façade — avec une fiabilité variable selon les modèles."},{"question":"Combien de temps faut-il pour que le robot construise une carte complète ?","answer":"Pour un appartement de 60 à 80 m², comptez généralement une à deux sessions complètes, soit 1 à 3 heures. La carte se précise ensuite à chaque passage. Certains modèles affichent une carte exploitable dès la première session."},{"question":"La présence d'animaux ou d'enfants qui bougent perturbe-t-elle la navigation LiDAR ?","answer":"Ponctuellement oui : le robot peut détecter un animal comme un obstacle et le contourner. Mais cela ne corrompt pas la carte enregistrée, car le SLAM distingue les obstacles fixes (murs, meubles) des obstacles mobiles détectés en temps réel."}]
---

Un aspirateur robot LiDAR utilise un faisceau laser tournant pour mesurer en temps réel la distance aux obstacles et construire une carte précise de votre logement. C'est cette carte qui lui permet de planifier des trajectoires en lignes parallèles plutôt que de se déplacer au hasard. Si votre robot rate toujours les mêmes zones, c'est presque toujours lié à un angle mort du capteur, une carte corrompue ou un obstacle que le LiDAR ne détecte pas.

## Qu'est-ce que le LiDAR dans un aspirateur robot ?

Le terme LiDAR signifie *Light Detection And Ranging*. Dans un aspirateur robot, il s'agit généralement d'un petit module rotatif positionné sur le dessus de l'appareil — la fameuse bosse caractéristique. Ce module émet des impulsions laser (infrarouge, invisible à l'œil) et mesure le temps que met chaque impulsion à revenir après avoir rebondi sur un obstacle.

En tournant à 360°, il effectue plusieurs centaines de mesures par seconde. Le résultat : une carte en 2D de l'espace, précise à quelques centimètres près, mise à jour en continu pendant toute la session de nettoyage.

### SLAM : comment la carte est construite

Le LiDAR seul ne suffit pas. Le robot utilise un algorithme appelé **SLAM** (*Simultaneous Localization and Mapping*) qui fait deux choses en même temps :

<figure class="diagram">
  <img src="/diagrams/lidar-cartographie.svg" alt="À gauche, le laser rotatif mesure la distance aux murs et aux meubles dans toutes les directions ; le contour obtenu est la carte. À droite, cette carte permet de nettoyer en bandes parallèles en contournant les meubles." width="820" height="380" loading="lazy" decoding="async" />
  <figcaption>Du relevé laser à la trajectoire : ce que le robot mesure, puis ce qu'il en fait.</figcaption>
</figure>


- **Se localiser** : savoir où il se trouve dans la pièce
- **Cartographier** : enregistrer la disposition des murs et des meubles

Ces deux tâches s'alimentent mutuellement. Plus la carte est précise, mieux le robot se localise ; mieux il se localise, plus la carte devient précise. C'est un processus itératif qui se stabilise généralement après quelques passages complets.

## Pourquoi votre robot rate toujours les mêmes zones

C'est la question centrale. Les causes sont plus précises qu'on ne le croit.

<figure class="diagram">
  <img src="/diagrams/angles-morts.svg" alt="Vue de dessus d'une pièce meublée. Depuis sa position, le laser du robot n'atteint pas les zones situées derrière les meubles ; ces ombres portées sont les zones que la carte ignore tant que le robot ne s'est pas déplacé." width="820" height="450" loading="lazy" decoding="async" />
  <figcaption>Les zones teintées sont invisibles depuis ce point : c'est la première cause des passages manqués.</figcaption>
</figure>


### 1. Les angles morts du capteur LiDAR

Le LiDAR scanne sur un plan horizontal, à la hauteur du module (environ 8 à 12 cm du sol selon les modèles). Il ne voit donc pas :

- Les objets très bas (câbles au sol, chaussettes)
- Les surfaces réfléchissantes comme le verre transparent ou les miroirs — le faisceau laser traverse ou repart dans une mauvaise direction
- Les pieds de meuble très fins (moins de ~1 cm de diamètre) qui ne renvoient pas assez de signal

### 2. Une carte dégradée ou obsolète

Si vous déplacez régulièrement vos meubles, la carte enregistrée ne correspond plus à la réalité. Le robot suit son itinéraire prévu sur une carte fantôme. Résultat : il contourne des obstacles qui n'existent plus ou fonce vers des espaces qu'il croit libres mais qui sont maintenant bloqués.

**Solution directe** : supprimer la carte et laisser le robot en reconstruire une depuis la base. La plupart des applications permettent de le faire en quelques secondes.

### 3. Les problèmes de couverture liés à l'algorithme de trajectoire

Même avec une carte parfaite, la façon dont le robot calcule son chemin peut créer des zones systématiquement ignorées :

- **Les alcôves et recoins en L** : si l'entrée est inférieure à la largeur du robot + sa marge de sécurité, il n'entre simplement pas
- **Les zones sous les meubles bas** : le module LiDAR dépasse souvent et empêche le passage même si le corps du robot passerait
- **Les transitions entre pièces** : si le seuil est détecté comme un mur sur la carte, la zone adjacente reste inaccessible

### 4. Les surfaces qui trompent le LiDAR

Certains matériaux posent des problèmes spécifiques :

| Matériau | Problème |
|---|---|
| Verre (porte, table) | Faisceau laser traversant ou dévié |
| Surface noire mate | Absorption du laser, faible retour de signal |
| Miroir | Réflexion spéculaire, fausse distance mesurée |
| Parquet très brillant | Réflexions parasites au sol |

## Comment améliorer la couverture de votre robot LiDAR

### Reconstruire la carte dans de bonnes conditions

Lancez une première cartographie :
- En journée, avec un éclairage normal (certains LiDAR sont sensibles aux variations lumineuses extrêmes)
- Avec les portes dans leur position habituelle
- Sans objets temporaires au sol (valises, cartons)

### Utiliser les zones virtuelles avec précision

Plutôt que d'espérer que le robot s'adapte, définissez des **zones de nettoyage intensif** autour des zones problématiques dans l'application. Sur la plupart des robots récents, vous pouvez aussi forcer des passages supplémentaires dans une zone précise.

### Aider le LiDAR sur les surfaces problématiques

Pour les portes vitrées : placez un autocollant ou un petit obstacle visuel à la base pour créer un point de réflexion. Ce n'est pas élégant, mais c'est efficace.

## Et si votre robot n'est pas équipé d'un LiDAR ?

Les modèles à navigation par **vSLAM** (caméra visuelle) construisent leur carte à partir de repères visuels, et leurs angles morts ne sont pas les mêmes : ils manquent moins certains obstacles fins, mais dépendent de la lumière ambiante. Si vous hésitez encore entre les deux technologies, le sujet est traité en détail dans [LiDAR vs caméra : comment votre aspirateur robot « voit » votre maison](/articles/navigation-lidar-camera-aspirateur-robot-differences/).
