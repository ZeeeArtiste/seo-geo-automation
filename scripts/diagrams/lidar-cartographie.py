import math

INK, MUTED, ACCENT, RULE, PAPER, PANEL = '#1C1D22', '#6B6A63', '#8A5A2B', '#E4E0D6', '#FAF8F4', '#FFFFFF'

def seg_int(p, d, a, b):
    x1,y1 = a; x2,y2 = b
    ex, ey = x2-x1, y2-y1
    den = d[0]*ey - d[1]*ex
    if abs(den) < 1e-9: return None
    t = ((x1-p[0])*ey - (y1-p[1])*ex) / den
    u = ((x1-p[0])*d[1] - (y1-p[1])*d[0]) / den
    if t > 1e-6 and -1e-9 <= u <= 1+1e-9: return t
    return None

def rect_segs(x,y,w,h):
    return [((x,y),(x+w,y)),((x+w,y),(x+w,y+h)),((x+w,y+h),(x,y+h)),((x,y+h),(x,y))]

OX, OY, W, H = 40, 74, 330, 244
FURN = [(OX+28, OY+26, 92, 42), (OX+212, OY+142, 78, 72)]
room = rect_segs(OX, OY, W, H)
obstacles = room + [s for f in FURN for s in rect_segs(*f)]
robot = (OX+152, OY+142)

def cast(n):
    out = []
    for i in range(n):
        ang = 2*math.pi*i/n
        d = (math.cos(ang), math.sin(ang))
        best = None
        for (a,b) in obstacles:
            t = seg_int(robot, d, a, b)
            if t is not None and (best is None or t < best): best = t
        if best: out.append((robot[0]+d[0]*best, robot[1]+d[1]*best))
    return out

rays = cast(28)        # ce qu'on dessine
hull_pts = cast(220)   # ce qui sert au contour
_unused = []
N = 0
for i in range(N):
    ang = 0
    pass

ray_lines = ''.join(f'<line x1="{robot[0]:.1f}" y1="{robot[1]:.1f}" x2="{x:.1f}" y2="{y:.1f}"/>' for x,y in rays)
hull = 'M ' + ' L '.join(f'{x:.1f} {y:.1f}' for x,y in hull_pts) + ' Z'

# ── Trajectoire en bandes qui CONTOURNE les meubles ───────────────────
PX = 450
PAD, STEP, CLEAR = 16, 24, 4
def free_spans(y):
    """Intervalles x libres sur la bande y, meubles exclus."""
    lo, hi = PX+PAD, PX+W-PAD
    blocked = []
    for (fx, fy, fw, fh) in FURN:
        if fy-CLEAR <= y <= fy+fh+CLEAR:
            blocked.append((fx-PX+PX-OX+PX - (PX-OX) + (fx-OX)+PX-PX, 0))  # placeholder
    blocked = []
    for (fx, fy, fw, fh) in FURN:
        if fy-CLEAR <= y <= fy+fh+CLEAR:
            bx = fx - OX + PX
            blocked.append((bx-CLEAR, bx+fw+CLEAR))
    spans, cur = [], lo
    for b0, b1 in sorted(blocked):
        if b0 > cur: spans.append((cur, min(b0, hi)))
        cur = max(cur, b1)
    if cur < hi: spans.append((cur, hi))
    return [(a,b) for a,b in spans if b-a > 12]

# Trajectoire continue : on relie chaque bande à la suivante, et on ne
# "saute" (nouveau M) que lorsqu'un meuble coupe réellement le passage.
d, cur, dirn, y = [], None, 1, OY+PAD
while y < OY+H-PAD:
    sp = free_spans(y)
    if dirn < 0: sp = sp[::-1]
    for a, b in sp:
        x0, x1 = (a, b) if dirn > 0 else (b, a)
        if cur is None or abs(cur[0]-x0) > 2:
            d.append(f'M {x0:.0f} {y:.0f}')
        else:
            d.append(f'L {x0:.0f} {y:.0f}')
        d.append(f'L {x1:.0f} {y:.0f}')
        cur = (x1, y)
    y += STEP; dirn *= -1
path = ' '.join(d)

furn_svg = lambda px: ''.join(
    f'<rect x="{fx-OX+px}" y="{fy}" width="{fw}" height="{fh}" fill="{RULE}" stroke="{MUTED}" stroke-width="1"/>'
    for (fx,fy,fw,fh) in FURN)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 380" width="820" height="380" role="img" aria-labelledby="lidarTitle lidarDesc">
<title id="lidarTitle">Cartographie LiDAR et trajectoire de nettoyage</title>
<desc id="lidarDesc">À gauche, le laser rotatif du robot mesure la distance aux murs et aux meubles dans toutes les directions ; le contour obtenu est la carte de la pièce. À droite, cette carte permet au robot de nettoyer en bandes parallèles régulières, en contournant les meubles, au lieu de se déplacer au hasard.</desc>
<rect width="820" height="380" fill="{PAPER}"/>
<g font-family="Inter, system-ui, sans-serif">
  <text x="40" y="42" font-size="12.5" font-weight="600" fill="{ACCENT}" letter-spacing="1.3">1 — LE LASER MESURE</text>
  <text x="450" y="42" font-size="12.5" font-weight="600" fill="{ACCENT}" letter-spacing="1.3">2 — LA CARTE GUIDE LE NETTOYAGE</text>

  <rect x="{OX}" y="{OY}" width="{W}" height="{H}" fill="{PANEL}" stroke="{RULE}" stroke-width="2"/>
  <g stroke="{ACCENT}" stroke-width="0.55" opacity="0.28">{ray_lines}</g>
  {furn_svg(OX)}
  <path d="{hull}" fill="none" stroke="{ACCENT}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="{robot[0]}" cy="{robot[1]}" r="10" fill="{INK}"/>
  <circle cx="{robot[0]}" cy="{robot[1]}" r="3.2" fill="{ACCENT}"/>

  <rect x="{PX}" y="{OY}" width="{W}" height="{H}" fill="{PANEL}" stroke="{RULE}" stroke-width="2"/>
  {furn_svg(PX)}
  <path d="{path}" fill="none" stroke="{ACCENT}" stroke-width="1.7" stroke-linecap="round" opacity="0.9"/>
  <circle cx="{PX+PAD}" cy="{OY+PAD}" r="8" fill="{INK}"/>

  <text x="40" y="352" font-size="12.5" fill="{MUTED}">Trait brun : le contour relevé par le laser.</text>
  <text x="450" y="352" font-size="12.5" fill="{MUTED}">Bandes parallèles, meubles contournés.</text>
</g>
</svg>'''
open('/tmp/diag/lidar-cartographie.svg','w').write(svg)
print('ok')
