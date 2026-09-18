#!/usr/bin/env python3
"""
Télécharge et prépare les photos d'illustration depuis Unsplash.

Les images produit Amazon sont interdites hors PA-API ; Unsplash autorise
l'usage commercial. Ce script respecte les règles de l'API Unsplash, qui ne
sont pas optionnelles :

  1. déclencher l'endpoint /photos/:id/download à chaque téléchargement —
     c'est ce qui crédite le photographe côté Unsplash ;
  2. attribuer le photographe ET Unsplash, avec des liens portant les
     paramètres UTM imposés.

Les métadonnées d'attribution sont écrites dans un JSON que le site lit pour
afficher le crédit sous chaque photo.

Usage:
  python3 scripts/fetch-unsplash.py --site sites/cleantop --map photos.json
  python3 scripts/fetch-unsplash.py --site sites/cleantop --search "robot vacuum"
"""
import argparse, json, os, pathlib, sys, urllib.parse, urllib.request
from PIL import Image

API = 'https://api.unsplash.com'
UTM = '?utm_source={brand}&utm_medium=referral'  # {brand} renseigné à l'exécution
TARGET_W, TARGET_RATIO = 1600, 3 / 2


def key():
    k = os.environ.get('UNSPLASH_ACCESS_KEY')
    if not k:
        env = pathlib.Path(__file__).resolve().parent.parent / '.env'
        if env.exists():
            for line in env.read_text(encoding='utf-8').splitlines():
                if line.startswith('UNSPLASH_ACCESS_KEY='):
                    k = line.split('=', 1)[1].strip()
    if not k:
        sys.exit('UNSPLASH_ACCESS_KEY absent de .env')
    return k


def api(path):
    req = urllib.request.Request(f'{API}{path}', headers={
        'Authorization': f'Client-ID {key()}', 'Accept-Version': 'v1'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def crop_to_ratio(img, ratio):
    w, h = img.size
    if w / h > ratio:
        nw = int(h * ratio)
        img = img.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / ratio)
        img = img.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return img


def fetch(photo_id, out_dir, name, utm):
    p = api(f'/photos/{photo_id}')

    # Obligatoire : signale le téléchargement à Unsplash. Sans cet appel, le
    # photographe n'est pas crédité et l'application viole les conditions.
    api(urllib.parse.urlparse(p['links']['download_location']).path + '?' +
        urllib.parse.urlparse(p['links']['download_location']).query)

    url = p['urls']['raw'] + f'&w={TARGET_W}&fm=jpg&q=85&fit=max'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    tmp = out_dir / f'{name}.orig'
    with urllib.request.urlopen(req, timeout=60) as r:
        tmp.write_bytes(r.read())

    img = Image.open(tmp).convert('RGB')
    img = crop_to_ratio(img, TARGET_RATIO)
    img = img.resize((TARGET_W, int(TARGET_W / TARGET_RATIO)), Image.LANCZOS)
    img.save(out_dir / f'{name}.webp', 'WEBP', quality=82, method=6)
    img.save(out_dir / f'{name}.jpg', 'JPEG', quality=84, optimize=True)
    tmp.unlink()

    return {
        'id': p['id'],
        'file': f'/photos/{name}.webp',
        'fallback': f'/photos/{name}.jpg',
        'alt': p.get('alt_description') or p.get('description') or '',
        'author': p['user']['name'],
        'authorUrl': p['user']['links']['html'] + utm,
        'unsplashUrl': p['links']['html'] + utm,
        'width': img.width,
        'height': img.height,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--site', required=True)
    ap.add_argument('--brand', default='', help="Marque, pour le paramètre utm_source exigé par Unsplash")
    ap.add_argument('--map', help='JSON { "nom-de-sortie": "id_unsplash" }')
    ap.add_argument('--search')
    ap.add_argument('--per-page', type=int, default=8)
    a = ap.parse_args()

    if a.search:
        q = urllib.parse.quote(a.search)
        d = api(f'/search/photos?query={q}&per_page={a.per_page}&orientation=landscape')
        for p in d['results']:
            print(f"{p['id']:14} {p['width']}x{p['height']:<6} {p['user']['name']:24} "
                  f"{(p.get('alt_description') or '')[:60]}")
        return

    site = pathlib.Path(a.site)
    out = site / 'public' / 'photos'
    out.mkdir(parents=True, exist_ok=True)
    mapping = json.loads(pathlib.Path(a.map).read_text(encoding='utf-8'))

    brand = a.brand or site.name
    utm = UTM.format(brand=urllib.parse.quote(brand))

    credits = {}
    for name, pid in mapping.items():
        credits[name] = fetch(pid, out, name, utm)
        m = credits[name]
        print(f"✅ {name}.webp — {m['width']}x{m['height']} — © {m['author']}")

    cred_path = site / 'src' / 'data'
    cred_path.mkdir(parents=True, exist_ok=True)
    (cred_path / 'photo-credits.json').write_text(
        json.dumps(credits, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"\n✅ crédits écrits dans {cred_path / 'photo-credits.json'}")


if __name__ == '__main__':
    main()
