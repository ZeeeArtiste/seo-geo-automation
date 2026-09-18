INK, MUTED, ACCENT, RULE, PAPER, PANEL = '#1C1D22','#6B6A63','#8A5A2B','#E4E0D6','#FAF8F4','#FFFFFF'
W, H = 820, 430
PW, PH, PY = 340, 236, 96
FLOOR = PY + PH - 46          # ligne de sol
BODY_H, BODY_W = 34, 76       # silhouette du robot vue de côté

def panel(x): return f'<rect x="{x}" y="{PY}" width="{PW}" height="{PH}" fill="{PANEL}" stroke="{RULE}" stroke-width="2"/>'
def floor(x):
    return (f'<line x1="{x+18}" y1="{FLOOR}" x2="{x+PW-18}" y2="{FLOOR}" stroke="{INK}" stroke-width="2"/>'
            + ''.join(f'<line x1="{x+22+i*16}" y1="{FLOOR}" x2="{x+14+i*16}" y2="{FLOOR+8}" stroke="{RULE}" stroke-width="1.5"/>' for i in range(19)))

def body(bx, turret=True):
    """Robot vu de côté, posé au sol."""
    y = FLOOR - BODY_H
    o = [f'<rect x="{bx}" y="{y}" width="{BODY_W}" height="{BODY_H}" rx="7" fill="{INK}"/>']
    if turret:
        o.append(f'<rect x="{bx+26}" y="{y-13}" width="24" height="13" rx="3" fill="{INK}"/>')
        o.append(f'<circle cx="{bx+38}" cy="{y-6.5}" r="3.4" fill="{ACCENT}"/>')
    else:
        o.append(f'<circle cx="{bx+BODY_W-11}" cy="{y+12}" r="5" fill="{ACCENT}"/>')
    return ''.join(o), y

def cable(cx, y):
    return (f'<path d="M {cx} {y} q 16 -8 32 0 q 16 8 32 0" fill="none" stroke="{MUTED}" stroke-width="3.4" stroke-linecap="round"/>')

# ── Panneau gauche : LiDAR ────────────────────────────────────────────
L = 60
bxL = L + 46
bodyL, topL = body(bxL, turret=True)
plane_y = topL - 6.5
lidar = (f'<line x1="{bxL+38}" y1="{plane_y}" x2="{L+PW-26}" y2="{plane_y}" stroke="{ACCENT}" stroke-width="2" stroke-dasharray="6 4"/>'
         f'<text x="{L+PW-26}" y="{plane_y-9}" font-size="11.5" fill="{ACCENT}" text-anchor="end">plan de balayage</text>')
cableL = cable(L+218, FLOOR)
crossL = (f'<g stroke="{MUTED}" stroke-width="2.2" stroke-linecap="round">'
          f'<line x1="{L+243}" y1="{FLOOR-34}" x2="{L+257}" y2="{FLOOR-20}"/>'
          f'<line x1="{L+257}" y1="{FLOOR-34}" x2="{L+243}" y2="{FLOOR-20}"/></g>')

# ── Panneau droit : caméra ────────────────────────────────────────────
R = 420
bxR = R + 46
bodyR, topR = body(bxR, turret=False)
lens_x, lens_y = bxR+BODY_W-11, topR+12
cone = (f'<path d="M {lens_x} {lens_y} L {R+PW-30} {FLOOR-64} L {R+PW-30} {FLOOR} L {lens_x+26} {FLOOR} Z" fill="{ACCENT}" opacity="0.12"/>'
        f'<text x="{R+PW-30}" y="{FLOOR-74}" font-size="11.5" fill="{ACCENT}" text-anchor="end">champ de vision</text>')
cableR = cable(R+218, FLOOR)
tagR = (f'<rect x="{R+212}" y="{FLOOR-17}" width="74" height="26" rx="3" fill="none" stroke="{ACCENT}" stroke-width="1.5" stroke-dasharray="4 3"/>'
        f'<text x="{R+249}" y="{FLOOR-24}" font-size="11.5" fill="{ACCENT}" text-anchor="middle">« câble »</text>')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="navTitle navDesc">
<title id="navTitle">Navigation LiDAR contre navigation par caméra</title>
<desc id="navDesc">Les deux robots vus de côté. Le LiDAR balaie un plan horizontal à la hauteur de son capteur : un câble posé à plat sur le sol passe sous ce plan et n'est pas détecté. La caméra regarde vers l'avant et vers le bas, reconnaît visuellement le câble et l'évite, mais dépend de la lumière ambiante et produit une carte moins précise.</desc>
<rect width="{W}" height="{H}" fill="{PAPER}"/>
<g font-family="Inter, system-ui, sans-serif">
  <text x="{L}" y="46" font-size="12.5" font-weight="600" fill="{ACCENT}" letter-spacing="1.3">LIDAR — IL MESURE</text>
  <text x="{L}" y="70" font-size="13.5" fill="{INK}">Un plan horizontal, à hauteur du capteur.</text>
  {panel(L)}{floor(L)}{lidar}{bodyL}{cableL}{crossL}
  <text x="{L}" y="{PY+PH+32}" font-size="13" fill="{MUTED}">Le câble passe sous le plan : non détecté.</text>

  <text x="{R}" y="46" font-size="12.5" font-weight="600" fill="{ACCENT}" letter-spacing="1.3">CAMÉRA — ELLE RECONNAÎT</text>
  <text x="{R}" y="70" font-size="13.5" fill="{INK}">Un champ de vision vers l'avant et le bas.</text>
  {panel(R)}{floor(R)}{cone}{bodyR}{cableR}{tagR}
  <text x="{R}" y="{PY+PH+32}" font-size="13" fill="{MUTED}">Le câble est reconnu et contourné.</text>
</g>
</svg>'''
open('/tmp/diag/navigation.svg','w').write(svg)
print('ok')
