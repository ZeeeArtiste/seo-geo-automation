# Profil de liens entrants — aspirob.com

**Date de l'analyse :** 20 septembre 2026
**Ancienneté du domaine :** 2 jours (enregistré et mis en ligne le 18 septembre 2026)
**Niveau d'accès aux données (tier) :** 0 — Common Crawl + crawler de vérification uniquement (aucune clé Moz, Bing Webmaster ou DataForSEO configurée)

## Résumé

Le profil de liens entrants est vide, ce qui est **l'état normal et attendu** pour un domaine mis en ligne il y a deux jours, sans campagne de netlinking. Ce n'est pas un problème à corriger en urgence : aucun moteur de recherche ni aucune base d'index tiers n'a encore eu le temps de découvrir et crawler le site. Aucune action corrective n'est requise sur ce point à ce stade ; les recommandations ci-dessous portent sur l'amorçage réaliste d'un premier socle de liens.

## Données mesurées aujourd'hui

| Métrique | Résultat | Source | Confiance |
|---|---|---|---|
| Présence dans le crawl Common Crawl | Non — domaine absent | Common Crawl Web Graph (source : https://commoncrawl.org/web-graphs) | 0.50 |
| Présence dans le classement (PageRank/harmonic centrality) | Non applicable (absent du crawl) | Common Crawl Web Graph | 0.50 |
| PageRank / rang | Non disponible (null) | Common Crawl Web Graph | 0.50 |
| Centralité harmonique / rang | Non disponible (null) | Common Crawl Web Graph | 0.50 |
| Nombre de domaines référents | Non mesuré — aucune source disponible à ce tier (Moz/Bing/DataForSEO absents) | — | — |
| Distribution de la qualité des domaines référents | Non mesuré | — | — |
| Naturalité des ancres | Non mesuré | — | — |
| Ratio de liens toxiques | Non mesuré | — | — |
| Tendance de vélocité des liens | Non mesuré (nécessite DataForSEO) | — | — |
| Ratio follow/nofollow | Non mesuré | — | — |
| Pertinence géographique | Non mesuré | — | — |
| Vérification de liens connus | Non applicable — aucun lien entrant connu à vérifier (aucune campagne menée) | Verify crawler | — |

**Interprétation de l'absence dans Common Crawl :** ce résultat ne doit PAS être lu comme un signal de "faible autorité". Il signifie simplement que l'index de Common Crawl (mis à jour trimestriellement) n'a pas encore rencontré ce domaine — cohérent avec un site en ligne depuis 48 heures. Le prochain instantané Common Crawl pourrait encore ne rien montrer si le site n'a pas encore été découvert via des liens externes ou des soumissions.

## Score de santé des liens entrants

**INSUFFICIENT DATA — aucun score numérique produit.**

Sur les 7 facteurs de scoring pondérés (domaines référents, distribution de qualité, ancres, toxicité, vélocité, follow/nofollow, géographie), 0 disposent d'une source de données exploitable au tier 0. Common Crawl fournit uniquement des signaux de présence/rang au niveau du domaine, pas de données de liens entrants individuelles, et ne peut donc alimenter aucun de ces facteurs. Produire un score chiffré serait trompeur : aucun n'est calculé ici, conformément à la règle "moins de 4 facteurs sur 7 avec données → pas de score".

## Facteurs non mesurables à ce tier

Pour obtenir ces données, il faudrait :
- **Nombre et qualité des domaines référents, ratio de toxicité affiné, ancres** → clé Moz API (gratuite, 2 500 lignes/mois : https://moz.com/products/api)
- **Liens entrants tels que vus par Bing** → Bing Webmaster Tools (gratuit, nécessite que la propriété soit enregistrée sur le compte Bing)
- **Vélocité des liens, données premium consolidées** → extension DataForSEO (`./extensions/dataforseo/install.sh`)

## Actions réalistes d'acquisition de liens (site de 2 jours)

Compte tenu de l'âge du domaine, la priorité n'est pas la "réparation" mais l'amorçage d'un premier socle de signaux de découverte et de confiance.

**Priorité Haute**
1. Soumettre le sitemap et l'URL dans Google Search Console et Bing Webmaster Tools pour accélérer la découverte et l'indexation (condition préalable à toute mesure future de liens entrants via Bing).
2. Créer/vérifier les fiches sur les annuaires structurants pertinents pour le secteur (si comparateur/affiliation robots aspirateurs : annuaires généralistes de qualité, pas de spam de liens en masse).
3. Vérifier la cohérence des informations de contact/mentions légales, qui conditionnent souvent l'acceptation par des annuaires et partenaires de qualité.

**Priorité Moyenne**
4. Identifier 5 à 10 sites thématiques (blogs tech/maison, comparateurs, forums spécialisés électroménager) susceptibles de citer le site une fois qu'il aura du contenu substantiel — cibler des mentions naturelles plutôt qu'un netlinking massif précoce.
5. Envisager une présence sur les réseaux sociaux pertinents et un profil Google Business si applicable, pour générer des signaux de confiance indirects (non comptabilisés comme liens SEO classiques mais utiles à la découverte).

**Priorité Basse (à repousser)**
6. Ne pas lancer de campagne de netlinking active avant d'avoir un contenu suffisant à promouvoir et une indexation confirmée — un afflux soudain de liens vers un domaine de quelques jours peut être un signal de risque plutôt qu'un atout.
7. Reprogrammer une vérification Common Crawl et un re-check du tier de données dans 4 à 6 semaines, une fois qu'un premier crawl aura eu une chance de découvrir le site.

## Sources et fraîcheur des données

- Common Crawl Web Graph — release `cc-main-2026-jan-feb-mar`, mise à jour trimestrielle (source : https://commoncrawl.org/web-graphs). Confiance : 0.50 (métriques au niveau du domaine uniquement).
- Aucune donnée Moz, Bing Webmaster ou DataForSEO disponible (non configurées).
- Aucun lien entrant connu fourni pour vérification par le crawler local.

## Validation

Rapport validé par `validate_backlink_report.py` — statut **PASS** (0 erreur, 0 avertissement, 1 information : rappel de ne pas interpréter l'absence dans Common Crawl comme un signal de faible autorité, pris en compte ci-dessus).
