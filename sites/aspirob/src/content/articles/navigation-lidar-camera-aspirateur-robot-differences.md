---
title: "Navigation LiDAR vs caméra : comment votre aspirateur robot 'voit' votre maison (et pourquoi ça change tout)"
seoTitle: "LiDAR ou caméra : quelle navigation choisir ?"
description: "LiDAR ou caméra : comprendre comment votre aspirateur robot cartographie votre maison pour choisir la technologie adaptée à votre intérieur."
publishDate: "2026-09-18"
updatedDate: "2026-09-23"
directAnswer: "Un aspirateur robot cartographie votre logement par LiDAR, un laser rotatif, ou par caméra associée à des algorithmes de vision. Le LiDAR mesure la géométrie avec précision et fonctionne dans le noir ; la caméra reconnaît visuellement les objets au sol mais dépend de la lumière ambiante."
cover: "/photos/navigation-lidar-camera-aspirateur-robot-differences.webp"
cluster: "navigation"
affiliate: false
category: "Guide"
faq: [{"question":"Un robot LiDAR fonctionne-t-il vraiment dans le noir complet ?","answer":"Oui. Le laser infrarouge émet sa propre lumière et ne dépend pas de l'éclairage ambiant. La cartographie et la navigation restent identiques la nuit. En revanche, si le robot est aussi équipé d'une caméra pour la détection d'obstacles, cette partie-là peut être moins efficace sans lumière."},{"question":"La « bosse » du LiDAR pose-t-elle vraiment problème sous les meubles ?","answer":"Cela dépend de votre mobilier. Mesurez le dégagement sous vos canapés et vos lits, puis comparez-le à la hauteur totale indiquée sur la fiche du modèle : si le dégagement est inférieur, le robot ne pourra pas y entrer. Les robots à caméra, dépourvus de capteur rotatif, sont généralement plus plats."},{"question":"Le vSLAM est-il aussi précis que le LiDAR pour créer les plans de l'appartement ?","answer":"Non, pas encore au même niveau. Les cartes vSLAM sont fonctionnelles mais moins précises métriquement. Cela se traduit parfois par de petites zones oubliées ou des lignes de nettoyage légèrement irrégulières, surtout dans les grandes pièces."},{"question":"Un robot peut-il reconnaître les excréments d'animaux avec seulement le LiDAR ?","answer":"Non. La détection d'excréments (ou de câbles fins) nécessite une caméra couplée à un modèle d'intelligence artificielle entraîné sur ces objets. Le LiDAR seul ne perçoit que les obstacles suffisamment hauts pour intercepter son plan de balayage horizontal."},{"question":"Les cartes créées par le robot sont-elles sauvegardées si je le redémarre ?","answer":"Oui, sur la quasi-totalité des modèles récents (LiDAR ou caméra), la carte est stockée dans la mémoire interne du robot et/ou dans l'application cloud. Un redémarrage ne l'efface pas. En revanche, déplacer la base de recharge peut perturber la localisation."}]
---

Un aspirateur robot navigue en construisant une carte de votre maison grâce à deux technologies principales : le LiDAR (un faisceau laser rotatif) ou une caméra couplée à des algorithmes de vision. Le LiDAR excelle dans la précision géométrique et fonctionne dans le noir total, tandis que la navigation par caméra est plus économique à produire et reconnaît visuellement les objets. Le choix entre les deux a un impact direct sur la qualité du nettoyage, la gestion des obstacles et le prix de l'appareil.

## Que voit réellement un LiDAR ?

Le LiDAR (Light Detection And Ranging) fonctionne comme un radar, mais avec de la lumière. Un émetteur laser tourne en continu — souvent 360° à plusieurs centaines de rotations par minute — et mesure le temps que met chaque impulsion lumineuse à rebondir sur un obstacle et revenir. Résultat : le robot obtient un nuage de points en 2D qui représente très précisément les contours de chaque pièce, l'emplacement des meubles et l'épaisseur des murs.

### Les avantages concrets du LiDAR

- **Indépendance à la lumière ambiante** : le laser fonctionne aussi bien à 14h qu'à minuit. Votre robot peut nettoyer pendant que vous dormez sans allumer la lumière.
- **Précision métrique** : les capteurs LiDAR atteignent généralement une précision de l'ordre du centimètre à quelques mètres de distance, ce qui permet des trajets en lignes droites parallèles (le fameux motif « serpentin ») plutôt qu'un parcours aléatoire.
- **Cartographie rapide** : dès la première session, le robot produit une carte utilisable que vous pouvez ensuite éditer dans l'application pour définir des zones interdites ou des pièces.

### Les limites du LiDAR

Le capteur rotatif forme une bosse caractéristique sur le dessus du robot, ce qui augmente sa hauteur totale et le rend nettement plus épais qu'un robot à caméra. Cela peut poser problème sous certains meubles bas : mesurez le dégagement sous vos canapés et vos lits, puis comparez-le à la hauteur indiquée sur la fiche du modèle. Par ailleurs, le LiDAR ne « voit » qu'en 2D horizontal : il ne détecte pas un câble posé à plat sur le sol ou une chaussette, car l'obstacle est trop bas pour être dans le plan de balayage laser.

## Que voit réellement une caméra ?

La navigation par caméra — souvent appelée vSLAM (Visual Simultaneous Localization And Mapping) — utilise une ou plusieurs caméras pour capturer des images et les comparer en temps réel. Le robot repère des « points d'ancrage » visuels (un cadre sur un mur, le motif d'un tapis) et reconstitue sa position dans l'espace en les corrélant.

<figure class="diagram">
  <img src="/diagrams/navigation.svg" alt="Les deux robots vus de côté. Le LiDAR balaie un plan horizontal à hauteur de son capteur : un câble posé à plat passe dessous et n'est pas détecté. La caméra regarde vers l'avant et le bas, reconnaît le câble et l'évite." width="820" height="430" loading="lazy" decoding="async" />
  <figcaption>Le LiDAR mesure la géométrie, la caméra reconnaît les objets. Leurs angles morts ne sont pas les mêmes.</figcaption>
</figure>


### Les avantages concrets de la navigation par caméra

- **Profil plus bas** : sans tourelle LiDAR, le robot peut être conçu pour passer sous des meubles très proches du sol.
- **Reconnaissance d'objets** : les modèles récents intègrent des réseaux de neurones capables d'identifier des catégories d'objets (câbles, excréments d'animaux, chaussures) pour les éviter, ce que le LiDAR seul ne peut pas faire.
- **Coût de fabrication moindre** : une caméra coûte moins cher à intégrer qu'un module LiDAR, ce qui peut se refléter sur le prix de vente.

### Les limites de la navigation par caméra

La lumière ambiante devient une variable critique : dans une pièce sans fenêtre ou la nuit, les performances se dégradent significativement. La carte produite est aussi moins précise métriquement, ce qui peut entraîner des chevauchements ou des zones oubliées lors du nettoyage.

## Peut-on avoir LiDAR et caméra sur le même robot ?

De plus en plus de robots combinent les deux technologies. Le LiDAR gère la cartographie géométrique précise et la navigation, pendant que la caméra (ou un capteur 3D structuré) s'occupe de la détection fine des obstacles au sol. C'est l'approche adoptée par plusieurs modèles positionnés dans la gamme supérieure du marché. Cette combinaison est particulièrement pertinente si votre intérieur est jonché de jouets ou de câbles : le laser assure la couverture méthodique des pièces, la caméra évite les objets que le plan de balayage horizontal ne voit pas.

Si votre priorité est le budget et que votre intérieur est bien éclairé et dégagé, un robot à navigation par caméra peut suffire amplement.

## Comment choisir selon votre situation

| Situation | Technologie recommandée |
|---|---|
| Nettoyage nocturne fréquent | LiDAR |
| Maison avec beaucoup d'obstacles (jouets, câbles) | Caméra IA ou combo LiDAR + caméra |
| Meubles très bas (< 9 cm) | Caméra (profil plus bas) |
| Budget serré, intérieur simple | Caméra vSLAM |
| Grande surface, plan précis indispensable | LiDAR |

Pour situer ces deux familles sur des modèles réels, un renversement récent vaut d'être signalé : c'est désormais le [Roomba Max 775 Combo](https://www.irobot.fr/fr_FR/roomba-max-775-combo/X285040.html) qui illustre l'approche LiDAR, chez un fabricant dont la génération précédente naviguait à la caméra. À l'inverse, le [Roborock Saros 10R](https://fr.roborock.com/products/roborock-saros-10r) a remplacé sa tourelle par un module de façade pour descendre à 7,98 cm. La frontière entre les deux familles s'estompe : lisez la fiche technique du modèle, pas la réputation de la marque.

En résumé : le LiDAR est plus fiable dans des conditions variées d'éclairage et produit des cartes plus précises, mais il coûte plus cher et rend le robot plus épais. La caméra offre une flexibilité de design et une reconnaissance visuelle des objets, au prix d'une dépendance à la lumière. Pour la majorité des foyers avec des enfants ou des animaux, la combinaison des deux reste le choix le plus polyvalent.
