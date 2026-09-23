#!/usr/bin/env python3
"""
Photos produit, depuis le catalogue du fabricant.

Les images Amazon sont hors de portée : le contrat Partenaires impose que tout
contenu publicitaire produit — images comprises — vienne de la PA-API, et
récupérer une image autrement est la cause de fermeture de compte la plus
courante. Les boutiques officielles des fabricants exposent en revanche leurs
propres visuels dans le même catalogue Shopify public que les prix.

Ces images restent la propriété du fabricant. Le script ne les récupère donc
QUE pour les marques dont la reprise a été explicitement autorisée dans le
price-stores.json du site (`"images": true`), après lecture des conditions de
son press kit. C'est une décision de droits, marque par marque, et elle doit
être prise par un humain — pas par défaut.

Chaque photo enregistre sa provenance : le crédit est affiché sous l'image,
comme pour les photos Unsplash.

Usage:
  python3 scripts/fetch-product-images.py --site sites/aspirob
"""
import argparse, io, json, pathlib, re, urllib.request

UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'}
W = 900


def stores(site):
    """Boutiques du site ayant autorisé la reprise des images."""
    f = pathlib.Path(site) / 'price-stores.json'
    if not f.exists():
        return {}
    raw = json.loads(f.read_text(encoding='utf-8'))
    out = {}
    for k, v in raw.items():
        if k.startswith('_') or not isinstance(v, dict) or not v.get('images'):
            continue
        out[v['domain']] = (k, v['label'])
    return out


def catalogue(domain):
    req = urllib.request.Request(f'https://{domain}/products.json?limit=250', headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return {p['handle']: p for p in json.load(r)['products']}


def best_image(prod):
    """La vue la plus proche d'un portrait du produit.

    Les catalogues mêlent photos de l'appareil, visuels marketing et schémas de
    fonctionnalité. On privilégie une image dont le nom de fichier porte le nom
    du produit sans mention de fonctionnalité — à défaut, la première, qui est
    la vue principale choisie par la marque.
    """
    imgs = prod.get('images') or []
    if not imgs:
        return None
    mauvais = re.compile(r'banner|lifestyle|app|feature|compare|kv|poster|gift', re.I)
    propres = [i for i in imgs if not mauvais.search(i['src'])]
    return (propres or imgs)[0]


def fetch(url, out_path):
    from PIL import Image
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    img = Image.open(io.BytesIO(data))
    if img.mode in ('RGBA', 'LA', 'P'):
        fond = Image.new('RGB', img.size, (255, 255, 255))
        img = img.convert('RGBA')
        fond.paste(img, mask=img.split()[-1])
        img = fond
    else:
        img = img.convert('RGB')
    if img.width > W:
        img = img.resize((W, round(img.height * W / img.width)), Image.LANCZOS)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, 'WEBP', quality=84, method=6)
    return img.size


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('+', '-plus')).strip('-')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--site', required=True)
    ap.add_argument('--force', action='store_true', help='Retélécharge les images déjà présentes.')
    a = ap.parse_args()

    site = pathlib.Path(a.site)
    autorisees = stores(a.site)
    if not autorisees:
        print("Aucune marque n'autorise la reprise de ses images dans price-stores.json\n"
              "(clé \"images\": true). Les fiches se rendent avec leur schéma.")
        return

    cat = {}
    credits_path = site / 'src' / 'data' / 'product-images.json'
    credits = json.loads(credits_path.read_text(encoding='utf-8')) if credits_path.exists() else {}
    n_ok = n_skip = 0

    for f in sorted((site / 'src' / 'content' / 'articles').glob('*.md')):
        txt = f.read_text(encoding='utf-8')
        m = re.search(r'^products:\n(.*?)(?=^[a-zA-Z_]+:)', txt, re.S | re.M)
        if not m:
            continue
        bloc = m.group(1)
        out_bloc = []
        for chunk in re.split(r'(?=^  - name: )', bloc, flags=re.M):
            if not chunk.strip():
                out_bloc.append(chunk)
                continue
            nom = (re.search(r'^  - name:\s*"(.+?)"', chunk, re.M) or [None, ''])[1]
            src = (re.search(r'^    sourceUrl:\s*"(.+?)"', chunk, re.M) or [None, ''])[1]
            mm = re.match(r'https://([^/]+)/products/([^/?#]+)', src or '')
            chunk = re.sub(r'^    image:.*\n', '', chunk, flags=re.M)
            if not mm or mm.group(1) not in autorisees:
                n_skip += 1
                print(f"  ⏭️  {nom[:44]:<46} pas de source autorisée")
                out_bloc.append(chunk)
                continue
            domain, handle = mm.group(1), mm.group(2)
            key, label = autorisees[domain]
            cat.setdefault(domain, catalogue(domain))
            prod = cat[domain].get(handle)
            img = best_image(prod) if prod else None
            if not img:
                n_skip += 1
                print(f"  ⚠️  {nom[:44]:<46} aucune image dans le catalogue")
                out_bloc.append(chunk)
                continue
            s = slug(nom)
            dest = site / 'public' / 'produits' / f'{s}.webp'
            if dest.exists() and not a.force:
                print(f"  ✅ {nom[:44]:<46} déjà présente")
            else:
                w, h = fetch(img['src'], dest)
                print(f"  ✅ {nom[:44]:<46} {w}x{h} — {label}")
            credits[s] = {'file': f'/produits/{s}.webp', 'product': nom,
                          'credit': label, 'sourceUrl': src, 'imageUrl': img['src'].split('?')[0]}
            n_ok += 1
            chunk = chunk.rstrip('\n') + f'\n    image: "/produits/{s}.webp"\n'
            out_bloc.append(chunk)
        txt = txt[:m.start(1)] + ''.join(out_bloc) + txt[m.end(1):]
        f.write_text(txt, encoding='utf-8')

    credits_path.parent.mkdir(parents=True, exist_ok=True)
    credits_path.write_text(json.dumps(credits, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"\n{n_ok} photo(s) · {n_skip} produit(s) sans photo (fiche rendue avec son schéma)")


if __name__ == '__main__':
    main()
