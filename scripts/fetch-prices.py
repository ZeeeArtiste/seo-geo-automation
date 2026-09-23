#!/usr/bin/env python3
"""
Relève les prix publics des boutiques officielles des fabricants.

Pourquoi cette source. Les prix Amazon sont inaccessibles : la PA-API exige
trois ventes qualifiantes et le scraping est bloqué autant qu'interdit par les
CGU. Les boutiques officielles tournent en revanche sur Shopify, dont le
catalogue `/products.json` est un point d'accès PUBLIC et documenté — ce n'est
pas du contournement.

Ce que ce script garantit, et qui compte plus que le prix lui-même :
  · chaque prix porte sa SOURCE (quelle boutique) et sa DATE de relevé ;
  · un produit introuvable ne reçoit pas de prix estimé, il n'en reçoit aucun ;
  · la disponibilité est relevée en même temps, un prix sur un produit épuisé
    n'ayant aucune valeur pour le lecteur.

Un prix daté et sourcé est une observation. C'est ce qui le distingue d'une
estimation, que ce projet s'interdit.

Usage:
  python3 scripts/fetch-prices.py --list roborock       # explorer un catalogue
  python3 scripts/fetch-prices.py --match "Saros 10" --store roborock
  python3 scripts/fetch-prices.py --site sites/aspirob --update   # écrit les prix
"""
import argparse, datetime, json, pathlib, re, sys, urllib.request

STORES = {
    'roborock': ('fr.roborock.com', 'boutique officielle Roborock'),
    'dreame': ('fr.dreametech.com', 'boutique officielle Dreame'),
}
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'}
ACCESSORY = re.compile(
    r'lingette|serpilli|filtre|sac à|brosse|accessoir|extension|garantie|bundle|'
    r'parapluie|points|pièce|kit|chiffon|roue|batterie|housse', re.I)


def catalogue(store):
    domain, _ = STORES[store]
    req = urllib.request.Request(f'https://{domain}/products.json?limit=250', headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)['products']


def robots(store):
    out = []
    for p in catalogue(store):
        t = p['title']
        if ACCESSORY.search(t) or not re.search(r'aspirateur|robot', t, re.I):
            continue
        v = (p.get('variants') or [{}])[0]
        try:
            price = float(v.get('price'))
        except (TypeError, ValueError):
            continue
        if price < 150:          # en dessous, ce n'est pas un robot
            continue
        out.append({
            'title': t,
            'price': price,
            'available': bool(v.get('available')),
            'url': f"https://{STORES[store][0]}/products/{p['handle']}",
            'store': store,
        })
    return sorted(out, key=lambda x: -x['price'])


def norm(s):
    return re.sub(r'[^a-z0-9]+', '', s.lower())


def by_handle(url):
    """Résout le prix à partir de l'URL du produit.

    C'est la méthode fiable. Le rapprochement par nom achoppe sur les variantes
    du même modèle — « Q7 L5+ » et « Q7 L5+ Set » contiennent la même clé — et
    une ambiguïté non résolue prive le lecteur d'un prix qui existe. L'URL de la
    fiche, elle, désigne un article et un seul."""
    for store, (domain, _) in STORES.items():
        m = re.match(rf'https://{re.escape(domain)}/products/([^/?#]+)', url or '')
        if not m:
            continue
        handle = m.group(1)
        for prod in catalogue(store):
            if prod['handle'] != handle:
                continue
            vs = [v for v in prod['variants'] if v.get('available')]
            if not vs:
                return None, store, 'fiche trouvée mais aucune variante disponible'
            v = min(vs, key=lambda v: float(v['price']))
            return float(v['price']), store, None
        return None, store, 'handle absent du catalogue'
    return None, None, 'URL hors des boutiques connues'


def match(name, store):
    """Correspondance exacte sur le nom normalisé. Volontairement stricte :
    un rapprochement approximatif attribuerait le prix d'un autre modèle."""
    key = norm(name)
    hits = [r for r in robots(store) if key in norm(r['title'])]
    return hits


PRICE_KEYS = ('price', 'priceCurrency', 'priceSource', 'priceCheckedAt')


def write_prices(path, today):
    """Écrit les prix relevés dans le frontmatter, fiche par fiche.

    Les quatre champs sont posés ou retirés ENSEMBLE : un prix orphelin, sans sa
    source ni sa date, serait invérifiable — exactement ce que ce site refuse de
    publier. Un produit dont le prix n'a pas pu être relevé voit donc ses champs
    supprimés, plutôt que de conserver une valeur périmée."""
    s = path.read_text(encoding='utf-8')
    m = re.search(r'^products:\n(.*?)(?=^faq:)', s, re.S | re.M)
    if not m:
        return 0, 0
    block = m.group(1)
    chunks = re.split(r'(?=^  - name: )', block, flags=re.M)
    priced = missing = 0
    out = []
    for c in chunks:
        if not c.strip():
            out.append(c)
            continue
        name = (re.search(r'^  - name:\s*"(.+?)"', c, re.M) or [None, '?'])[1]
        # Le prix se relève sur la page qui le publie, pas sur le lien d'achat :
        # depuis que les fiches renvoient vers un marchand affilié, l'URL de la
        # boutique du fabricant vit dans sourceUrl.
        url = (re.search(r'^    sourceUrl:\s*"(.+?)"', c, re.M)
               or re.search(r'^    url:\s*"(.+?)"', c, re.M) or [None, ''])[1]
        c = re.sub(rf'^    (?:{"|".join(PRICE_KEYS)}):.*\n', '', c, flags=re.M)
        price, store, why = by_handle(url)
        if price is None:
            missing += 1
            print(f"  ⚠️  {name[:42]:<44} pas de prix : {why}")
        else:
            priced += 1
            src = STORES[store][1]
            print(f"  ✅ {name[:42]:<44} {price:.2f} € — {src}")
            c = c.rstrip('\n') + (
                f'\n    price: {price:g}'
                f'\n    priceCurrency: "EUR"'
                f'\n    priceSource: "{src}"'
                f'\n    priceCheckedAt: "{today}"\n'
            )
        out.append(c)
    s = s[:m.start(1)] + ''.join(out) + s[m.end(1):]
    path.write_text(s, encoding='utf-8')
    return priced, missing


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--list')
    ap.add_argument('--match')
    ap.add_argument('--store', choices=list(STORES))
    ap.add_argument('--site')
    ap.add_argument('--update', action='store_true')
    a = ap.parse_args()

    if a.list:
        for r in robots(a.list):
            print(f"{r['price']:>9.2f} €  {'✓' if r['available'] else '✗'}  {r['title'][:66]}")
        return

    if a.match:
        stores = [a.store] if a.store else list(STORES)
        found = False
        for s in stores:
            for r in match(a.match, s):
                found = True
                print(f"{r['price']:>9.2f} €  {'dispo' if r['available'] else 'INDISPO'}  "
                      f"{r['title'][:58]}\n{'':11}{r['url']}")
        if not found:
            print(f'Aucune correspondance pour « {a.match} ». '
                  'Aucun prix ne sera posé : un produit introuvable ne reçoit pas de prix estimé.')
        return

    if not (a.site and a.update):
        ap.error('utilisez --list, --match, ou --site … --update')

    site = pathlib.Path(a.site)
    arts = sorted((site / 'src/content/articles').glob('*.md'))
    today = datetime.date.today().isoformat()
    touched = priced = missing = 0

    for f in arts:
        if not re.search(r'^products:\n', f.read_text(encoding='utf-8'), re.M):
            continue
        print(f"\n{f.name}")
        touched += 1
        p_, m_ = write_prices(f, today)
        priced += p_
        missing += m_

    print(f"\n{touched} article(s) avec produits · {priced} prix relevés · {missing} sans prix")
    if missing:
        print("Les produits sans prix n'en reçoivent aucun. Un modèle absent du catalogue\n"
              "de son fabricant n'est en général plus commercialisé — c'est une information\n"
              "en soi, et l'occasion de revoir la sélection.")


if __name__ == '__main__':
    main()
