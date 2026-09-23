#!/usr/bin/env python3
"""
Vignettes d'article pour la page d'accueil.

Réduire un schéma détaillé à 200 px le rend illisible. On génère donc un motif
simplifié, dérivé de l'idée du schéma, qui tient à petite taille : quelques
formes, aucune typographie.
"""
import argparse, math, pathlib, re, sys

INK, MUTED, ACCENT, RULE, PAPER, PANEL = '#0F172A','#64748B','#2563EB','#E2E8F0','#F8FAFC','#FFFFFF'
W, H = 480, 300

def frame(body, title, desc):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
            f'role="img" aria-labelledby="ct cd"><title id="ct">{title}</title><desc id="cd">{desc}</desc>'
            f'<rect width="{W}" height="{H}" fill="{PANEL}"/>{body}</svg>')

def c_compare():
    """Deux approches opposées : deux blocs contrastés."""
    b = f'<rect x="54" y="80" width="150" height="140" rx="10" fill="{INK}"/>'
    b += f'<rect x="276" y="80" width="150" height="140" rx="10" fill="none" stroke="{ACCENT}" stroke-width="4"/>'
    b += f'<line x1="240" y1="64" x2="240" y2="236" stroke="{RULE}" stroke-width="2"/>'
    for i in range(5):
        b += f'<line x1="296" y1="{104+i*24}" x2="406" y2="{104+i*24}" stroke="{ACCENT}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>'
    return frame(b, 'Deux approches opposées', 'Deux blocs contrastés symbolisant la comparaison de deux modèles.')

def c_brush():
    """Rouleau étranglé par des manchons de poils."""
    b = f'<rect x="70" y="112" width="340" height="80" rx="40" fill="{PANEL}" stroke="{INK}" stroke-width="4"/>'
    for i in range(34):
        x = 108 + i*7.6
        b += f'<line x1="{x:.1f}" y1="122" x2="{x:.1f}" y2="182" stroke="{MUTED}" stroke-width="2" opacity="0.5"/>'
    for x in (150, 214, 278):
        b += f'<ellipse cx="{x}" cy="152" rx="10" ry="46" fill="none" stroke="{ACCENT}" stroke-width="9"/>'
    return frame(b, 'Poils enroulés autour de la brosse', 'Un rouleau de brosse étranglé par trois manchons de poils.')

def c_lidar():
    """Balayage laser : rayons et contour."""
    cx, cy = 240, 152
    b = ''
    pts = []
    for i in range(0, 360, 10):
        a = math.radians(i)
        r = 108 + 26*math.sin(a*2) + 14*math.cos(a*3)
        x, y = cx+r*math.cos(a), cy+r*math.sin(a)
        pts.append(f'{x:.1f} {y:.1f}')
        b += f'<line x1="{cx}" y1="{cy}" x2="{x:.1f}" y2="{y:.1f}" stroke="{ACCENT}" stroke-width="1.4" opacity="0.32"/>'
    b += f'<path d="M {" L ".join(pts)} Z" fill="none" stroke="{ACCENT}" stroke-width="3.5"/>'
    b += f'<circle cx="{cx}" cy="{cy}" r="16" fill="{INK}"/><circle cx="{cx}" cy="{cy}" r="5" fill="{ACCENT}"/>'
    return frame(b, 'Balayage laser', 'Des rayons partant du robot et le contour de pièce qu’ils dessinent.')

def c_nav():
    """Plan horizontal contre cône de vision."""
    b = f'<line x1="44" y1="150" x2="436" y2="150" stroke="{RULE}" stroke-width="2"/>'
    b += f'<path d="M 150 104 L 420 62 L 420 146 Z" fill="{ACCENT}" opacity="0.16"/>'
    b += f'<line x1="150" y1="196" x2="420" y2="196" stroke="{ACCENT}" stroke-width="4" stroke-dasharray="12 8"/>'
    b += f'<rect x="76" y="176" width="76" height="40" rx="9" fill="{INK}"/>'
    b += f'<rect x="102" y="160" width="26" height="16" rx="4" fill="{INK}"/>'
    b += f'<circle cx="115" cy="168" r="5" fill="{ACCENT}"/>'
    b += f'<rect x="76" y="84" width="76" height="40" rx="9" fill="{INK}"/><circle cx="141" cy="98" r="7" fill="{ACCENT}"/>'
    return frame(b, 'Plan de balayage contre champ de vision', 'Une ligne horizontale en pointillés et un cône de vision, les deux façons de percevoir.')

def c_dock():
    """Station de recharge et son dégagement."""
    b = f'<rect x="120" y="70" width="240" height="150" fill="none" stroke="{ACCENT}" stroke-width="3.5" stroke-dasharray="10 7" opacity="0.75"/>'
    b += f'<rect x="196" y="48" width="88" height="34" rx="6" fill="{INK}"/>'
    b += f'<circle cx="240" cy="188" r="17" fill="{INK}"/><circle cx="240" cy="188" r="5.5" fill="{ACCENT}"/>'
    b += f'<line x1="240" y1="166" x2="240" y2="100" stroke="{ACCENT}" stroke-width="3.5"/>'
    b += f'<path d="M 230 112 L 240 94 L 250 112" fill="none" stroke="{ACCENT}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
    return frame(b, 'Dégagement autour de la station', 'Une station de recharge entourée d’une zone libre en pointillés.')

COVERS = {
    'roomba-max-775-combo-vs-roborock-saros-10r': c_compare,
    'aspirateur-robot-poils-animaux-chat-chien': c_brush,
    'navigation-lidar-aspirateur-robot-explication': c_lidar,
    'navigation-lidar-camera-aspirateur-robot-differences': c_nav,
    'aspirateur-robot-animaux-erreurs-eviter': c_dock,
}


# ── Motifs neutres, valables quelle que soit la niche ────────────────────────
# Les motifs ci-dessus illustrent un sujet précis : une brosse, un LiDAR. Posés
# sur un article d'une autre catégorie de produits, ils seraient faux. Ceux-ci
# ne représentent que la FORME de l'article — une opposition, une explication
# en couches — et conviennent donc partout.

def g_guide():
    """Un guide : des couches qu'on explique de haut en bas."""
    b = ''
    for i, w in enumerate((300, 240, 180)):
        y = 96 + i * 42
        b += (f'<rect x="{(W - w) / 2:.0f}" y="{y}" width="{w}" height="22" rx="11" '
              f'fill="{INK if i == 0 else RULE}"/>')
    b += f'<circle cx="{W/2:.0f}" cy="78" r="9" fill="{ACCENT}"/>'
    return frame(b, "Vignette de guide",
                 "Trois bandes superposees de largeur decroissante, surmontees d un point.")


def g_test():
    """Un test : une mesure, donc une échelle."""
    b = f'<line x1="70" y1="210" x2="410" y2="210" stroke="{RULE}" stroke-width="4"/>'
    for i, h in enumerate((44, 92, 66, 120)):
        x = 96 + i * 78
        b += f'<rect x="{x}" y="{210 - h}" width="38" height="{h}" rx="6" fill="{ACCENT if i == 3 else INK}"/>'
    return frame(b, "Vignette de test", "Quatre barres de hauteurs differentes posees sur une ligne.")


def g_actu():
    """Une actualité : un signal qui se propage."""
    b = f'<circle cx="{W/2:.0f}" cy="150" r="14" fill="{ACCENT}"/>'
    for r in (46, 80, 114):
        b += (f'<circle cx="{W/2:.0f}" cy="150" r="{r}" fill="none" stroke="{RULE}" '
              f'stroke-width="3" opacity="{1 - r / 160:.2f}"/>')
    return frame(b, "Vignette d actualite", "Un point central entoure de cercles concentriques.")


# Motif de repli par catégorie éditoriale. c_compare ne dessine que deux blocs
# opposés : il est déjà neutre et sert donc aussi de générique.
GENERIC = {
    'Comparatif': c_compare,
    'Guide': g_guide,
    'Test': g_test,
    'Actualite': g_actu,
    'Actualité': g_actu,
}


def articles(site):
    """Slug et catégorie de chaque article publié du site."""
    d = pathlib.Path(site) / 'src' / 'content' / 'articles'
    out = []
    for f in sorted(d.glob('*.md')) if d.exists() else []:
        txt = f.read_text(encoding='utf-8')
        fm = txt.split('---')[1] if txt.startswith('---') else ''
        if re.search(r'^draft:[ \t]*true', fm, re.M):
            continue
        m = re.search(r'^category:[ \t]*"?([^"\n]+)"?', fm, re.M)
        out.append((f.stem, (m.group(1).strip() if m else 'Guide')))
    return out



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

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--site', required=True)
    ap.add_argument('--out', help='defaut : <site>/public/covers')
    a = ap.parse_args()

    out = pathlib.Path(a.out) if a.out else pathlib.Path(a.site) / 'public' / 'covers'
    out.mkdir(parents=True, exist_ok=True)
    found = articles(a.site)
    if not found:
        print('Aucun article : aucune vignette a produire.')
    for slug, cat in found:
        fn = COVERS.get(slug) or GENERIC.get(cat) or g_guide
        (out / f'{slug}.svg').write_text(fn(), encoding='utf-8')
        # Repli seulement : une photo, posée ensuite, vaut mieux qu'un motif.
        pose = set_cover(a.site, slug, f'/covers/{slug}.svg', overwrite=False)
        print(f"OK {slug}.svg  ({'motif dedie' if slug in COVERS else 'generique ' + cat})"
              f"{' + cover pose' if pose else ''}")
