#!/usr/bin/env python3
"""
Fiche schématique par produit, à placer près de chaque mention.

Les photos des modèles précis sont inaccessibles : Amazon les verrouille hors
PA-API, et aucune banque libre ne propose de vue étiquetée par modèle. Un
schéma original contourne le problème sans rien prétendre de faux — il est
manifestement un schéma, pas une photo retouchée.

Chaque attribut affiché provient de ce que l'article affirme déjà : rien n'est
ajouté ici qui ne soit écrit dans le texte.
"""
import pathlib, sys

INK, MUTED, ACCENT, RULE, PAPER, PANEL = '#0F172A', '#64748B', '#2563EB', '#E2E8F0', '#FFFFFF', '#F7F8FA'
W, H = 640, 190
CX, CY, R = 108, 95, 56


def robot(turret: bool, mop: bool):
    """Vue de dessus. Tourelle = LiDAR ; pastille avant = caméra."""
    o = [f'<circle cx="{CX}" cy="{CY}" r="{R}" fill="{PANEL}" stroke="{INK}" stroke-width="2.5"/>']
    o.append(f'<path d="M {CX-R+6} {CY-26} A {R-6} {R-6} 0 0 1 {CX+R-6} {CY-26}" fill="none" stroke="{RULE}" stroke-width="2"/>')
    if turret:
        o.append(f'<circle cx="{CX}" cy="{CY}" r="17" fill="{INK}"/>')
        o.append(f'<circle cx="{CX}" cy="{CY}" r="6" fill="{ACCENT}"/>')
        for i in range(8):
            a = i * 45
            o.append(f'<line x1="{CX}" y1="{CY}" x2="{CX}" y2="{CY - R + 10}" stroke="{ACCENT}" '
                     f'stroke-width="1" opacity="0.32" transform="rotate({a} {CX} {CY})"/>')
    else:
        o.append(f'<rect x="{CX-13}" y="{CY-R+12}" width="26" height="11" rx="3" fill="{INK}"/>')
        o.append(f'<circle cx="{CX}" cy="{CY-R+17.5}" r="3.4" fill="{ACCENT}"/>')
        o.append(f'<circle cx="{CX}" cy="{CY}" r="9" fill="{RULE}"/>')
    # brosse principale, en bas
    o.append(f'<rect x="{CX-30}" y="{CY+26}" width="60" height="11" rx="5" fill="{MUTED}" opacity="0.55"/>')
    if mop:
        o.append(f'<rect x="{CX-34}" y="{CY+42}" width="68" height="9" rx="4" fill="{ACCENT}" opacity="0.4"/>')
    return ''.join(o)


def card(name, attrs, turret, mop, title, desc):
    rows = ''
    for i, (label, value) in enumerate(attrs):
        y = 74 + i * 34
        rows += (f'<text x="212" y="{y}" font-size="11" fill="{MUTED}" letter-spacing="0.06em">{label.upper()}</text>'
                 f'<text x="212" y="{y+17}" font-size="14.5" fill="{INK}">{value}</text>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="fT fD">
<title id="fT">{title}</title><desc id="fD">{desc}</desc>
<rect width="{W}" height="{H}" rx="8" fill="{PAPER}" stroke="{RULE}" stroke-width="1.5"/>
<g font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif">
  {robot(turret, mop)}
  <line x1="182" y1="26" x2="182" y2="{H-26}" stroke="{RULE}" stroke-width="1"/>
  <text x="212" y="44" font-size="15.5" font-weight="600" fill="{INK}">{name}</text>
  {rows}
  <text x="{CX}" y="{H-16}" font-size="10.5" fill="{MUTED}" text-anchor="middle">schéma, pas une photo</text>
</g>
</svg>'''


FICHES = {
 'roborock-saros-10r': dict(
   name='Roborock Saros 10R', turret=False, mop=True,
   attrs=[('Navigation', 'StarSight 2.0, sans tourelle'), ('Hauteur', '7,98 cm'), ('Anti-emmêlement', 'Double système')],
   title='Schéma du Roborock Saros 10R',
   desc="Vue de dessus schématique : module de navigation StarSight 2.0 en façade au lieu d'une tourelle rotative, double système anti-enchevêtrements, lavage des sols."),
 'roomba-max-775-combo': dict(
   name='Roomba Max 775 Combo', turret=True, mop=True,
   attrs=[('Navigation', 'ClearView Pro LiDAR'), ('Brosses', 'Deux, en caoutchouc'), ('Station', 'AutoWash, eau à 75 °C')],
   title='Schéma du Roomba Max 775 Combo',
   desc="Vue de dessus schématique : tourelle LiDAR ClearView Pro, deux brosses en caoutchouc anti-emmêlement, rouleau serpillière et base AutoWash."),
 'dreame-l50s-pro-ultra': dict(
   name='Dreame L50s Pro Ultra', turret=True, mop=True,
   attrs=[('Brosse principale', 'Duo HyperStream'), ('Navigation', 'LiDAR VersaLift rétractable'), ('Station', 'PowerDock 8-en-1')],
   title='Schéma du Dreame L50s Pro Ultra',
   desc="Vue de dessus schématique : brosse duo HyperStream anti-nœuds, tourelle LiDAR VersaLift qui se rétracte pour passer sous les meubles, station PowerDock."),
 'ecovacs-deebot-x9-pro-omni': dict(
   name='Ecovacs Deebot X9 Pro Omni', turret=True, mop=True,
   attrs=[('Anti-emmêlement', 'ZeroTangle 3.0'), ('Serpillière', 'Rouleau OZMO ROLLER'), ('Navigation', 'dToF + RGBD')],
   title='Schéma de l’Ecovacs Deebot X9 Pro Omni',
   desc="Vue de dessus schématique : système anti-enchevêtrement ZeroTangle 3.0, serpillière à rouleau auto-nettoyant OZMO ROLLER, navigation dToF."),
 'roborock-q7-l5-plus': dict(
   name='Roborock Q7 L5+', turret=True, mop=True,
   attrs=[('Anti-emmêlement', 'Double système'), ('Navigation', 'LiDAR PreciSense'), ('Station', 'Vidage sur la version +')],
   title='Schéma du Roborock Q7 L5+',
   desc="Vue de dessus schématique : double système anti-enchevêtrements, navigation LiDAR PreciSense, station de vidage sur la version +."),
}

if __name__ == '__main__':
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'public/fiches')
    out.mkdir(parents=True, exist_ok=True)
    for slug, f in FICHES.items():
        (out / f'{slug}.svg').write_text(card(**f), encoding='utf-8')
        print(f'✅ {slug}.svg')
