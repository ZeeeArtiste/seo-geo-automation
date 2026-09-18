# Générateurs de schémas

Chaque script produit un SVG explicatif destiné à être inséré dans un article.
Les schémas sont **originaux** : un site d'affiliation ne peut pas utiliser les
photos produit d'Amazon sans passer par la PA-API, et un schéma qui explique un
mécanisme a bien plus de valeur qu'une photo de catalogue — pour le lecteur,
pour le référencement et pour être cité par un moteur génératif.

La géométrie est calculée, pas dessinée à la main : le lancer de rayons du
schéma LiDAR est un vrai lancer de rayons, et la trajectoire de nettoyage
contourne réellement les meubles.

```bash
python3 scripts/diagrams/lidar-cartographie.py   # → /tmp/diag/*.svg
rsvg-convert -w 820 fichier.svg -o apercu.png    # pour vérifier le rendu
```

Dépendances de vérification : `apt-get install -y librsvg2-bin`

Les SVG finaux vivent dans `sites/<site>/public/diagrams/`. Leur pile de
polices vise les polices système (SF Pro, Segoe UI, Roboto) : une SVG chargée
via `<img>` ne peut pas utiliser les `@font-face` de la page.
