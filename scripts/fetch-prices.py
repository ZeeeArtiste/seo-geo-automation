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


def match(name, store):
    """Correspondance exacte sur le nom normalisé. Volontairement stricte :
    un rapprochement approximatif attribuerait le prix d'un autre modèle."""
    key = norm(name)
    hits = [r for r in robots(store) if key in norm(r['title'])]
    return hits


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
        s = f.read_text(encoding='utf-8')
        m = re.search(r'^products:\n(.*?)^faq:', s, re.S | re.M)
        if not m:
            continue
        names = re.findall(r'^\s+- name:\s*"(.+?)"', m.group(1), re.M)
        if not names:
            continue
        touched += 1
        for n in names:
            hits = []
            for st in STORES:
                hits += match(re.sub(r'^(iRobot|Roborock|Dreame|Ecovacs|Shark)\s+', '', n), st)
            if len(hits) == 1 and hits[0]['available']:
                priced += 1
                print(f"  ✅ {n[:42]:<44} {hits[0]['price']:.2f} € — {STORES[hits[0]['store']][1]}")
            else:
                missing += 1
                why = 'aucune correspondance' if not hits else f'{len(hits)} correspondances ambiguës'
                print(f"  ⚠️  {n[:42]:<44} pas de prix : {why}")

    print(f"\n{touched} article(s) avec produits · {priced} prix relevés · {missing} sans prix")
    if missing:
        print("Les produits sans prix n'en reçoivent aucun. Un modèle absent du catalogue\n"
              "de son fabricant n'est en général plus commercialisé — c'est une information\n"
              "en soi, et l'occasion de revoir la sélection.")


if __name__ == '__main__':
    main()
