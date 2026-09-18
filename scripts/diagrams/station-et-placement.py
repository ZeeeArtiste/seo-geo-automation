INK, MUTED, ACCENT, RULE, PAPER, PANEL = '#0F172A','#64748B','#2563EB','#E2E8F0','#F8FAFC','#FFFFFF'
W, H = 820, 430
DX, DY, DW, DH = 96, 106, 128, 216      # corps de la station

def mod(y, h, n):
    """Module vu en coupe : juste un repère numéroté, le libellé est à droite."""
    return (f'<rect x="{DX+14}" y="{y}" width="{DW-28}" height="{h}" rx="3" fill="{PANEL}" stroke="{MUTED}" stroke-width="1.2"/>'
            f'<circle cx="{DX+DW/2}" cy="{y+h/2}" r="12" fill="{ACCENT}"/>'
            f'<text x="{DX+DW/2}" y="{y+h/2+4.5}" font-size="12" font-weight="600" fill="{PAPER}" text-anchor="middle">{n}</text>')

mods = mod(DY+14, 44, 1) + mod(DY+64, 44, 2) + mod(DY+114, 44, 3) + mod(DY+164, 44, 4)

def note(x, y, n, title, body):
    return (f'<circle cx="{x}" cy="{y-4}" r="10" fill="none" stroke="{ACCENT}" stroke-width="1.6"/>'
            f'<text x="{x}" y="{y}" font-size="11" font-weight="600" fill="{ACCENT}" text-anchor="middle">{n}</text>'
            f'<text x="{x+20}" y="{y-4}" font-size="13" font-weight="500" fill="{INK}">{title}</text>'
            f'<text x="{x+20}" y="{y+15}" font-size="12.5" fill="{MUTED}">{body}</text>')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="stTitle stDesc">
<title id="stTitle">Ce que contient une station de base tout-en-un</title>
<desc id="stDesc">Coupe schématique d'une station de base. Un modèle simple ne contient qu'un sac à poussière pour le vidage automatique. Une station tout-en-un y ajoute un réservoir d'eau propre, le lavage de la serpillière et son séchage à air chaud. Chaque module ajouté est une pièce mobile de plus, donc un point d'usure supplémentaire.</desc>
<rect width="{W}" height="{H}" fill="{PAPER}"/>
<g font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif">
  <text x="60" y="48" font-size="12.5" font-weight="600" fill="{ACCENT}" letter-spacing="1.3">CE QUE CONTIENT UNE STATION</text>
  <text x="60" y="74" font-size="13.5" fill="{INK}">Le nombre de modules est ce qui sépare une station simple d'une tout-en-un.</text>

  <rect x="{DX}" y="{DY}" width="{DW}" height="{DH}" rx="8" fill="{RULE}" stroke="{INK}" stroke-width="2"/>
  {mods}
  <rect x="{DX-6}" y="{DY+DH}" width="{DW+12}" height="14" rx="3" fill="{INK}"/>

  {note(280, 148, 1, 'Sac à poussière', 'Sur toutes les stations : le robot se vide seul.')}
  {note(280, 206, 2, "Réservoir d'eau propre", 'Dès que le robot lave : la station le remplit.')}
  {note(280, 264, 3, 'Lavage de la serpillière', 'Stations tout-en-un : rincée après chaque passage.')}
  {note(280, 322, 4, 'Séchage à air chaud', "Le plus récent : évite l'odeur d'humidité.")}

  <text x="60" y="400" font-size="13" fill="{MUTED}">Chaque module ajouté est une pièce mobile de plus — donc un point d'usure, et un consommable à racheter.</text>
</g>
</svg>'''
open('/tmp/diag/station.svg','w').write(svg)

# ── Placement de la base ─────────────────────────────────────────────
PW2, PH2 = 820, 400
def room(x, y, w, h): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{PANEL}" stroke="{INK}" stroke-width="2"/>'
def dock(x, y): return f'<rect x="{x}" y="{y}" width="46" height="20" rx="3" fill="{INK}"/>'
def clear(x, y, w, h, ok):
    c = '#059669' if ok else ACCENT
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" opacity="0.13" stroke="{c}" stroke-width="1.4" stroke-dasharray="5 4"/>'

AX, AY = 60, 118
BX = 450
svg2 = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {PW2} {PH2}" width="{PW2}" height="{PH2}" role="img" aria-labelledby="plTitle plDesc">
<title id="plTitle">Où placer la station de recharge</title>
<desc id="plDesc">Vue de dessus. À gauche, la station est posée le long d'un mur dégagé : le robot dispose de l'espace libre nécessaire de chaque côté et devant elle pour s'y réamarrer sans hésiter. À droite, la station est coincée dans un angle ou un couloir : le robot rate son amarrage, repart chercher, et finit par tomber en panne de batterie.</desc>
<rect width="{PW2}" height="{PH2}" fill="{PAPER}"/>
<g font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif">
  <text x="{AX}" y="48" font-size="12.5" font-weight="600" fill="#059669" letter-spacing="1.3">✓ LE LONG D'UN MUR DÉGAGÉ</text>
  <text x="{BX}" y="48" font-size="12.5" font-weight="600" fill="{ACCENT}" letter-spacing="1.3">✕ DANS UN ANGLE OU UN COULOIR</text>
  <text x="{AX}" y="74" font-size="13.5" fill="{INK}">Le robot se réamarre du premier coup.</text>
  <text x="{BX}" y="74" font-size="13.5" fill="{INK}">Il rate l'amarrage et tombe en panne.</text>

  {room(AX, AY, 310, 200)}
  {clear(AX+70, AY+22, 170, 112, True)}
  {dock(AX+132, AY+2)}
  <circle cx="{AX+155}" cy="{AY+110}" r="11" fill="{INK}"/>
  <path d="M {AX+155} {AY+96} L {AX+155} {AY+34}" stroke="#059669" stroke-width="2"/>
  <path d="M {AX+149} {AY+44} L {AX+155} {AY+30} L {AX+161} {AY+44}" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="{AX+8}" y="{AY+192}" font-size="12" fill="{MUTED}">Zone libre de part et d'autre et devant la station.</text>

  {room(BX, AY, 310, 200)}
  <rect x="{BX+2}" y="{AY+2}" width="96" height="88" fill="{RULE}" stroke="{MUTED}" stroke-width="1"/>
  {clear(BX+100, AY+22, 52, 70, False)}
  {dock(BX+102, AY+2)}
  <circle cx="{BX+200}" cy="{AY+120}" r="11" fill="{INK}"/>
  <path d="M {BX+190} {AY+110} Q {BX+150} {AY+80} {BX+160} {AY+52}" fill="none" stroke="{ACCENT}" stroke-width="2" stroke-dasharray="5 4"/>
  <g stroke="{ACCENT}" stroke-width="2.2" stroke-linecap="round"><line x1="{BX+152}" y1="{AY+40}" x2="{BX+166}" y2="{AY+54}"/><line x1="{BX+166}" y1="{AY+40}" x2="{BX+152}" y2="{AY+54}"/></g>
  <text x="{BX+8}" y="{AY+192}" font-size="12" fill="{MUTED}">Meuble collé à la station : approche impossible.</text>

  <text x="{AX}" y="372" font-size="13" fill="{MUTED}">C'est l'erreur la plus fréquente, et la plus simple à corriger : il suffit de déplacer la station.</text>
</g>
</svg>'''
open('/tmp/diag/placement.svg','w').write(svg2)
print('ok')
