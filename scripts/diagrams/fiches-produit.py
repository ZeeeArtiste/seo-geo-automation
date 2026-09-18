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
 'roomba-j9-plus': dict(
   name='Roomba j9+', turret=False, mop=False,
   attrs=[('Navigation', 'iRobot OS + caméra'), ('Lavage des sols', 'Non'), ('Station', 'Vidage + remplissage')],
   title='Schéma du Roomba j9+',
   desc="Vue de dessus schématique : navigation par caméra (pas de tourelle laser), pas de lavage des sols, station de vidage et remplissage."),
 'roborock-s8-pro-ultra': dict(
   name='Roborock S8 Pro Ultra', turret=True, mop=True,
   attrs=[('Navigation', 'LiDAR + capteurs'), ('Lavage des sols', 'Serpillière oscillante'), ('Station', 'Vidage, lavage, séchage')],
   title='Schéma du Roborock S8 Pro Ultra',
   desc="Vue de dessus schématique : tourelle LiDAR, lavage actif par serpillière oscillante, station tout-en-un."),
 'roborock-q5-max-plus': dict(
   name='Roborock Q5 Max+', turret=True, mop=False,
   attrs=[('Brosse principale', 'Caoutchouc DuoRoller'), ('Station', 'Vidage sur la version +')],
   title='Schéma du Roborock Q5 Max+',
   desc="Vue de dessus schématique : brosse principale en caoutchouc, station de vidage disponible sur la version +."),
 'roomba-combo-j9-plus': dict(
   name='Roomba Combo j9+', turret=False, mop=True,
   attrs=[('Brosse principale', 'Système de coupe intégré'), ('Filtre', 'Haute efficacité')],
   title='Schéma du Roomba Combo j9+',
   desc="Vue de dessus schématique : système de coupe intégré sur l'axe de la brosse, filtre à haute efficacité."),
 'dreame-l10s-ultra': dict(
   name='Dreame L10s Ultra', turret=True, mop=True,
   attrs=[('Brosse principale', 'Double, en caoutchouc'), ('Station', 'Vidage, lavage, séchage')],
   title='Schéma du Dreame L10s Ultra',
   desc="Vue de dessus schématique : double brosse en caoutchouc, station tout-en-un."),
 'ecovacs-deebot-t20-omni': dict(
   name='Ecovacs Deebot T20 Omni', turret=True, mop=True,
   attrs=[('Brosse principale', 'Peigne anti-enchevêtrement')],
   title='Schéma de l’Ecovacs Deebot T20 Omni',
   desc="Vue de dessus schématique : peigne anti-enchevêtrement sur la brosse principale."),
 'shark-iq-rv1000seu': dict(
   name='Shark IQ Robot (RV1000SEU)', turret=False, mop=False,
   attrs=[('Brosse principale', 'Auto-nettoyante'), ('Bac', 'Grande capacité')],
   title='Schéma du Shark IQ Robot RV1000SEU',
   desc="Vue de dessus schématique : brosse auto-nettoyante, bac de grande capacité."),
}

if __name__ == '__main__':
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'public/fiches')
    out.mkdir(parents=True, exist_ok=True)
    for slug, f in FICHES.items():
        (out / f'{slug}.svg').write_text(card(**f), encoding='utf-8')
        print(f'✅ {slug}.svg')
