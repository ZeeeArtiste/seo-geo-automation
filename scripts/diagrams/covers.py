#!/usr/bin/env python3
"""
Vignettes d'article pour la page d'accueil.

Réduire un schéma détaillé à 200 px le rend illisible. On génère donc un motif
simplifié, dérivé de l'idée du schéma, qui tient à petite taille : quelques
formes, aucune typographie.
"""
import math, pathlib, sys

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
    'roomba-j9-plus-vs-roborock-s8-pro-ultra': c_compare,
    'aspirateur-robot-poils-animaux-chat-chien': c_brush,
    'navigation-lidar-aspirateur-robot-explication': c_lidar,
    'navigation-lidar-camera-aspirateur-robot-differences': c_nav,
    'aspirateur-robot-animaux-erreurs-eviter': c_dock,
}

if __name__ == '__main__':
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'public/covers')
    out.mkdir(parents=True, exist_ok=True)
    for slug, fn in COVERS.items():
        (out / f'{slug}.svg').write_text(fn(), encoding='utf-8')
        print(f'✅ {slug}.svg')
