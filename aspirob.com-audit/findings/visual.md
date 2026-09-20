# Analyse visuelle — aspirob.com

Outils : Playwright + Chromium (rendu réel). Pages testées : `/` (accueil) et
`/articles/aspirateur-robot-poils-animaux-chat-chien/` (article le plus dense :
5 fiches produit, 1 tableau comparatif, 2 schémas). Largeurs testées : 375,
768, 1024, 1100, 1200, 1279, 1366, 1440, 1920 px.

Captures dans `/root/seo-geo-automation/aspirob.com-audit/screenshots/`.

## Verdict global

Le site est propre et cohérent visuellement (palette blanc / gris / bleu
#2563EB respectée, Source Serif 4 sur les titres, Inter sur le texte). Un seul
bug de mise en page réel a été trouvé — un débordement horizontal de page
provoqué par un schéma, limité à une plage de largeurs assez précise — plus
deux points mineurs à améliorer. Tout le reste (header collant, bascule du
sommaire, scroll des tableaux sur mobile, fiches produit, above-the-fold) se
comporte exactement comme prévu.

## 1. Bug confirmé : débordement horizontal entre ~1024 px et ~1180 px (article)

Sur la page article, la balise `figure.diagram` (les deux schémas "brosse à
soies" / "brosse en caoutchouc") a une largeur fixe en pixels (792–864 px
selon la largeur d'écran, `max-width: none` sur la figure elle-même — seule
l'`<img>` a `max-width:100%`). Ce schéma est conçu pour "déborder" volontairement
de la colonne de texte (`.prose`, 768 px) à titre décoratif, ce qui est stable
à partir de 1200 px (le débordement reste alors contenu dans la marge libre
autour du sommaire). Mais entre 1024 px et environ 1180 px — exactement la
plage où le sommaire latéral (`aside.hidden.lg:block` / `nav.sommaire-rail`)
apparaît et réduit la colonne de contenu à 696 px — la marge disponible est
insuffisante et le schéma pousse au-delà du viewport :

| Largeur fenêtre | scrollWidth document | Débordement |
|---|---|---|
| 1000 px (sommaire absent) | 1000 | 0 |
| **1024 px** | **1048** | **+24 px** |
| **1100 px** | **1120** | **+20 px** |
| 1200 px | 1200 | 0 |
| 1366 / 1440 / 1920 px | = clientWidth | 0 |

À 1024 px précisément, cela crée une vraie barre de défilement horizontal sur
toute la page (`document.documentElement.scrollWidth` 1048 > `clientWidth`
1024), ce qui est un vrai bug (pas un simple choix esthétique) : c'est
justement la largeur d'écran de nombreuses tablettes en mode portrait et de
petits laptops/fenêtres partagées. Confirmé visuellement dans
`screenshots/article_1024_diagram_overflow_marked.png` (contour rouge = bord
du `<body>`, contour magenta = le schéma qui déborde au-delà) et
`screenshots/article_1024_diagram_overflow.png`.
À 1366 px (`screenshots/article_1366_diagram.png`), le même schéma déborde
bien de la colonne de texte mais reste contenu dans la marge, sans toucher le
bord de la fenêtre ni chevaucher le sommaire — c'est donc bien l'effet "plein
format" voulu, juste mal calé pour la fenêtre étroite 1024–1180 px.

**Recommandation** : donner à `figure.diagram` un `max-width: 100%` (ou
`max-width: min(864px, 100%)`) au lieu de `max-width: none`, au moins dans la
plage `lg` (1024–1279px) où la colonne de contenu se réduit à cause du
sommaire.

## 2. Sommaire latéral / bascule dans le flux à 1024 px — conforme

Comportement exactement conforme à la demande, vérifié précisément à la
frontière :

- **≥ 1024 px** (`screenshots/article_toc_check_tablet1024.png`,
  `article_desktop_scrolled.png`) : `aside.hidden.lg:block` est affiché,
  contient `nav.sommaire-rail` en `position: sticky; top` — le sommaire reste
  visible dans une colonne latérale gauche pendant le défilement. La version
  "dans le flux" (`nav.sommaire`) est bien masquée (`width: 0`, pas dans le
  rendu).
- **≤ 1023 px** (`screenshots/article_toc_check_just_below_1024.png`,
  `article_1024.png` pris à 1024×1024 pour comparaison) : l'aside latéral
  passe à `display:none`, et `nav.sommaire` (in-flow) réapparaît **après** le
  bloc "essentiel" et **avant** le corps de l'article, exactement comme
  souhaité ("il doit basculer dans le flux en dessous"). Aucun chevauchement,
  aucune duplication visible à l'écran.

C'est un point positif à noter : la bascule est nette, sans zone floue autour
du breakpoint (contrairement au bug du schéma ci-dessus qui, lui, est bien
présent dans cette même zone).

## 3. En-tête collant (header) — conforme

`<header>` est en `position: sticky; top: 0; z-index: 40` sur les deux pages.
Testé en scrollant à 1200 px sur desktop et mobile : le header reste
visible en haut (`bottom: 65px` desktop, `bottom: 110px` mobile après
scroll), sans être recouvert par le contenu ni recouvrir de titre.
Captures : `home_desktop_scrolled.png`, `article_desktop_scrolled.png`,
`home_mobile_scrolled.png`, `article_mobile_scrolled.png`. Aucun souci.

## 4. Tableau comparatif sur mobile — conforme (défilement horizontal voulu)

Le tableau `.tableau-comparatif` (5 modèles × plusieurs colonnes) est enveloppé
dans `div.tableau-wrap` avec `overflow-x: auto`. Sur mobile (375 px), le
wrapper fait 327 px de large et le tableau réel 597 px : le tableau déborde de
son wrapper mais **pas** de la page (`document.documentElement.scrollWidth`
reste égal à 375, aucun scroll horizontal du document). C'est le comportement
prévu — défilement local du tableau, pas de la page. Capture :
`article_table_mobile.png`, `article_mobile_scrolled.png` (la dernière colonne
"Anti-emmêlement" est tronquée visuellement à l'écran, ce qui signale bien à
l'utilisateur qu'il y a plus de contenu à faire défiler — comportement correct).

## 5. Fiches produit — conforme, bonne lisibilité

Les 5 fiches (`article.produit`) s'affichent proprement en desktop
(`article_product_card_desktop.png`) et en mobile
(`article_product_card_mobile.png`) : numéro, titre, image/schéma, texte,
blocs "Points forts" / "À savoir" empilés proprement en colonne unique sur
mobile, bouton CTA bleu pleine largeur. Aucun chevauchement, aucun texte
tronqué.

## 6. Boutons d'appel à l'action (CTA)

- Bouton principal "Quel robot choisir ? →" du header : visible et cliquable
  sur toutes les tailles testées, bon contraste (fond bleu marine foncé/texte
  blanc).
- Boutons produit "Voir le [Modèle]" (liens Amazon) : bien visibles, couleur
  accent #2563EB cohérente, mais **hauteur de cible tactile sous-dimensionnée
  sur mobile** pour les libellés courts qui tiennent sur une seule ligne :
  mesuré à `padding: 9.12px 17.48px` + `line-height: 22.8px` ⇒ **41 px de
  hauteur réelle** (ex. "Voir le Roborock Q5 Max+", "Voir le Dreame L10s
  Ultra"), sous la cible recommandée de 44–48 px. Les boutons dont le texte
  est plus long passent sur 2 lignes et atteignent 64 px (confortable). Pas
  bloquant mais à corriger par un `min-height: 48px` (ou padding vertical
  augmenté) sur `.produit-cta a` pour homogénéiser toutes les cartes.
- Lien de sommaire mobile "Que faut-il vérifier avant d'acheter ?" (variante
  visible en petit écran) : 197×44 px, à la limite basse recommandée — pas
  critique.

## 7. Above-the-fold

- **Accueil, desktop 1920 px** (`home_desktop.png`) : logo, nav, CTA header,
  H1 "Guides et comparatifs d'aspirateurs robots", sous-titre, image héro et
  légende, début du bloc "Par où commencer" — tout tient dans le premier écran
  sans coupure gênante.
- **Accueil, mobile 375 px** (`home_mobile_atf.png`) : H1 visible dès 158 px
  du haut, CTA header visible, image héro chargée avant la coupure de l'écran.
  Rien n'est coupé au milieu d'un mot ou d'une image.
- **Article, mobile 375 px** (`article_mobile.png`) : header, fil d'Ariane,
  image d'illustration, H1, métadonnées (auteur/date/temps de lecture) visibles
  au premier écran ; le début du bloc sommaire n'apparaît qu'en tout bas de
  l'écran, ce qui est normal pour un article long.

Aucun décalage de mise en page (CLS visuel) constaté entre le premier rendu et
après stabilisation du réseau sur les captures effectuées.

## 8. Autres vérifications

- Aucun débordement horizontal détecté à 375, 768, 1200, 1279, 1280, 1366,
  1440 ou 1920 px sur les deux pages (uniquement 1024–~1180 px, cf. point 1).
- Aucune erreur console JavaScript, arbre d'accessibilité renvoyé sans erreur
  (`accessibility_error: null`) sur l'accueil.
- Image héro de l'accueil dotée d'un texte alternatif descriptif ("Un
  aspirateur robot nettoie le sol d'un salon pendant qu'une famille se
  détend").
- Rich results / JSON-LD détecté et valide sur l'accueil (`ImageObject`,
  `Organization`, `WebSite`).

## Fichiers de référence

Captures clés (chemins absolus) :
- `/root/seo-geo-automation/aspirob.com-audit/screenshots/article_1024_diagram_overflow_marked.png` — preuve du bug §1
- `/root/seo-geo-automation/aspirob.com-audit/screenshots/article_1366_diagram.png` — même schéma, sans bug, à 1366 px
- `/root/seo-geo-automation/aspirob.com-audit/screenshots/article_toc_check_tablet1024.png` — sommaire en colonne à 1024 px
- `/root/seo-geo-automation/aspirob.com-audit/screenshots/article_toc_check_just_below_1024.png` — sommaire basculé dans le flux à 1023 px
- `/root/seo-geo-automation/aspirob.com-audit/screenshots/home_desktop.png`, `home_mobile_atf.png` — above-the-fold accueil
- `/root/seo-geo-automation/aspirob.com-audit/screenshots/article_mobile.png`, `article_mobile_scrolled.png` — above-the-fold + header collant article mobile
- `/root/seo-geo-automation/aspirob.com-audit/screenshots/article_product_card_desktop.png`, `article_product_card_mobile.png` — fiches produit
- `/root/seo-geo-automation/aspirob.com-audit/screenshots/article_table_mobile.png` — tableau comparatif mobile (scroll horizontal local, OK)
- `/root/seo-geo-automation/aspirob.com-audit/screenshots/analysis.json`, `deep_checks.json` — données brutes (overflow, styles calculés, CTA)
