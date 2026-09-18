import math
INK, MUTED, ACCENT, RULE, PAPER, PANEL = '#0F172A','#64748B','#2563EB','#E2E8F0','#F8FAFC','#FFFFFF'

def seg_int(p, d, a, b):
    x1,y1=a; x2,y2=b; ex,ey=x2-x1,y2-y1
    den = d[0]*ey - d[1]*ex
    if abs(den) < 1e-9: return None
    t = ((x1-p[0])*ey - (y1-p[1])*ex)/den
    u = ((x1-p[0])*d[1] - (y1-p[1])*d[0])/den
    if t > 1e-6 and -1e-9 <= u <= 1+1e-9: return t
    return None

def rect_segs(x,y,w,h):
    return [((x,y),(x+w,y)),((x+w,y),(x+w,y+h)),((x+w,y+h),(x,y+h)),((x,y+h),(x,y))]

OX, OY, W, H = 60, 96, 700, 268
FURN = [(OX+70, OY+40, 120, 46), (OX+430, OY+58, 62, 130), (OX+250, OY+186, 150, 44)]
obst = rect_segs(OX,OY,W,H) + [s for f in FURN for s in rect_segs(*f)]
robot = (OX+210, OY+130)

def cast(n):
    out=[]
    for i in range(n):
        a = 2*math.pi*i/n
        d = (math.cos(a), math.sin(a))
        best=None
        for (p,q) in obst:
            t = seg_int(robot,d,p,q)
            if t is not None and (best is None or t<best): best=t
        if best: out.append((robot[0]+d[0]*best, robot[1]+d[1]*best))
    return out

hull = cast(360)
hull_d = 'M ' + ' L '.join(f'{x:.1f} {y:.1f}' for x,y in hull) + ' Z'
room_d = f'M {OX} {OY} L {OX+W} {OY} L {OX+W} {OY+H} L {OX} {OY+H} Z'
# différence pièce − zone vue, via fill-rule evenodd : les ombres portées
shadow = f'<path d="{room_d} {hull_d}" fill="{ACCENT}" opacity="0.16" fill-rule="evenodd"/>'

furn = ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{RULE}" stroke="{MUTED}" stroke-width="1"/>' for x,y,w,h in FURN)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 450" width="820" height="450" role="img" aria-labelledby="amTitle amDesc">
<title id="amTitle">Les zones qu'un LiDAR ne voit pas depuis une position donnée</title>
<desc id="amDesc">Vue de dessus d'une pièce meublée. Depuis sa position, le laser du robot n'atteint pas les zones situées derrière les meubles : ces ombres portées, teintées sur le schéma, sont les zones que la carte ignore tant que le robot ne s'est pas déplacé ailleurs.</desc>
<rect width="820" height="450" fill="{PAPER}"/>
<g font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif">
  <text x="{OX}" y="46" font-size="12.5" font-weight="600" fill="{ACCENT}" letter-spacing="1.3">LES ANGLES MORTS DU LASER</text>
  <text x="{OX}" y="72" font-size="13.5" fill="{INK}">Depuis cette position, tout ce qui est derrière un meuble est invisible.</text>

  <rect x="{OX}" y="{OY}" width="{W}" height="{H}" fill="{PANEL}" stroke="{RULE}" stroke-width="2"/>
  {shadow}
  <path d="{hull_d}" fill="none" stroke="{ACCENT}" stroke-width="1.6"/>
  {furn}
  <circle cx="{robot[0]}" cy="{robot[1]}" r="10" fill="{INK}"/>
  <circle cx="{robot[0]}" cy="{robot[1]}" r="3.2" fill="{ACCENT}"/>

  <text x="{OX}" y="{OY+H+34}" font-size="13" fill="{MUTED}">Zones teintées : jamais atteintes par le laser depuis ce point. Le robot doit se déplacer pour les relever.</text>
</g>
</svg>'''
open('/tmp/diag/angles-morts.svg','w').write(svg)
print('ok')
