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
import argparse, json, os, pathlib, re, sys, urllib.parse, urllib.request
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



def first_landscape(query):
    """Premier résultat paysage pour une requête, ou None.

    Volontairement basique : choisir une photo est un travail éditorial qu'un
    premier résultat d'API ne remplace pas. Le but est qu'un site fraîchement
    généré ne soit pas nu, pas qu'il soit illustré définitivement.
    """
    q = urllib.parse.quote(query)
    try:
        d = api(f'/search/photos?query={q}&per_page=1&orientation=landscape')
    except Exception as e:
        print(f'   ⚠️  recherche « {query} » échouée : {e}')
        return None
    r = d.get('results') or []
    return r[0]['id'] if r else None


def auto_map(site, niche):
    """Associe une photo à l'accueil et à chaque article publié."""
    mapping = {}
    pid = first_landscape(niche)
    if pid:
        mapping['accueil'] = pid
    d = pathlib.Path(site) / 'src' / 'content' / 'articles'
    for f in sorted(d.glob('*.md')) if d.exists() else []:
        txt = f.read_text(encoding='utf-8')
        fm = txt.split('---')[1] if txt.startswith('---') else ''
        if re.search(r'^draft:[ \t]*true', fm, re.M):
            continue
        m = re.search(r'^title:[ \t]*"(.+?)"', fm, re.M)
        titre = m.group(1) if m else f.stem.replace('-', ' ')
        # La requête garde la niche : le titre seul ramène souvent des images
        # sans rapport avec le produit dont l'article parle.
        pid = first_landscape(f'{niche} {titre.split(":")[0]}'[:120])
        if pid:
            mapping[f.stem] = pid
    return mapping



def set_cover(site, slug, value, overwrite):
    """Pose `cover:` dans le frontmatter de l'article.

    Sans ce champ, l'image produite reste sur le disque sans jamais être
    affichée : la page d'accueil n'affiche une vignette que si l'article en
    déclare une. Générer l'image sans la déclarer donnait un site illustré à
    moitié, ce qui ne se voit qu'en regardant la page.
    """
    f = pathlib.Path(site) / 'src' / 'content' / 'articles' / f'{slug}.md'
    if not f.exists():
        return False
    s = f.read_text(encoding='utf-8')
    if not s.startswith('---'):
        return False
    head, sep, rest = s[3:].partition('\n---')
    if re.search(r'^cover:', head, re.M):
        if not overwrite:
            return False
        head = re.sub(r'^cover:.*$', f'cover: "{value}"', head, count=1, flags=re.M)
    else:
        head = head.rstrip('\n') + f'\ncover: "{value}"\n'
    f.write_text('---' + head + sep + rest, encoding='utf-8')
    return True

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--site', required=True)
    ap.add_argument('--brand', default='', help="Marque, pour le paramètre utm_source exigé par Unsplash")
    ap.add_argument('--map', help='JSON { "nom-de-sortie": "id_unsplash" }')
    ap.add_argument('--search')
    ap.add_argument('--per-page', type=int, default=8)
    ap.add_argument('--force', action='store_true',
                    help='Autorise --auto à remplacer des photos déjà en place.')
    ap.add_argument('--auto', metavar='NICHE',
                    help="Choisit automatiquement une photo pour l'accueil et chaque "
                         "article, à partir de la niche. Premier jet à curer.")
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
    if a.auto:
        # Ne jamais écraser une photo déjà en place : le choix automatique est
        # un premier jet, celui qui est là a pu être curé à la main. Sans cette
        # garde, relancer le pipeline sur un site existant détruit le travail
        # éditorial — ce qui est arrivé une fois, et se répare mal sans git.
        cred = site / 'src' / 'data' / 'photo-credits.json'
        deja = json.loads(cred.read_text(encoding='utf-8')) if cred.exists() else {}
        mapping = {k: v for k, v in auto_map(a.site, a.auto).items()
                   if a.force or k not in deja}
        if deja and not a.force:
            garde = len(deja)
            print(f'{garde} photo(s) déjà en place, conservée(s). --force pour les remplacer.')
        if not mapping:
            print('Rien à télécharger.' if deja
                  else 'Aucune photo trouvée — le site se rend sans illustration.')
            return
        print(f'{len(mapping)} photo(s) choisie(s) automatiquement. '
              'À relire : une photo mal choisie dessert la page.')
    elif a.map:
        mapping = json.loads(pathlib.Path(a.map).read_text(encoding='utf-8'))
    else:
        ap.error('utilisez --map, --search ou --auto')

    brand = a.brand or site.name
    utm = UTM.format(brand=urllib.parse.quote(brand))

    credits = {}
    for name, pid in mapping.items():
        credits[name] = fetch(pid, out, name, utm)
        m = credits[name]
        # Une photo remplace un motif de repli : elle est plus informative.
        pose = name != 'accueil' and set_cover(a.site, name, f'/photos/{name}.webp', overwrite=True)
        print(f"✅ {name}.webp — {m['width']}x{m['height']} — © {m['author']}"
              f"{' + cover pose' if pose else ''}")

    cred_path = site / 'src' / 'data'
    cred_path.mkdir(parents=True, exist_ok=True)
    existing = cred_path / 'photo-credits.json'
    merged = json.loads(existing.read_text(encoding='utf-8')) if existing.exists() else {}
    merged.update(credits)
    existing.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"\n✅ crédits écrits dans {cred_path / 'photo-credits.json'}")


if __name__ == '__main__':
    main()
