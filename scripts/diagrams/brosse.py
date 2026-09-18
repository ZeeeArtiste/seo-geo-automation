INK, MUTED, ACCENT, RULE, PAPER, PANEL = '#0F172A','#64748B','#2563EB','#E2E8F0','#F8FAFC','#FFFFFF'
W, H = 820, 556
RH, RW, X = 100, 320, 60

def cylinder(y):
    return (f'<rect x="{X}" y="{y-RH/2}" width="{RW}" height="{RH}" rx="{RH/2}" fill="{PANEL}" stroke="{INK}" stroke-width="2"/>'
            f'<ellipse cx="{X+28}" cy="{y}" rx="12" ry="{RH/2-2}" fill="none" stroke="{RULE}" stroke-width="1.5"/>'
            f'<ellipse cx="{X+RW-28}" cy="{y}" rx="12" ry="{RH/2-2}" fill="none" stroke="{RULE}" stroke-width="1.5"/>')

def bristles(y):
    o = [f'<line x1="{X+44+i*(RW-88)/45:.1f}" y1="{y-RH/2+7}" x2="{X+44+i*(RW-88)/45:.1f}" y2="{y+RH/2-7}" stroke="{MUTED}" stroke-width="1.5" opacity="0.6"/>' for i in range(46)]
    for px in (X+96, X+158, X+220):
        o.append(f'<ellipse cx="{px}" cy="{y}" rx="9" ry="{RH/2+5}" fill="none" stroke="{ACCENT}" stroke-width="7"/>')
    return ''.join(o)

def fins(y):
    o = []
    for i in range(9):
        px = X + 42 + i*(RW-84)/8
        o.append(f'<line x1="{px:.1f}" y1="{y-RH/2+8}" x2="{px+24:.1f}" y2="{y+RH/2-8}" stroke="{INK}" stroke-width="8" stroke-linecap="round" opacity="0.8"/>')
    # un poil qui glisse le long d'une lamelle et part vers l'aspiration
    # Le poil part de la surface du rouleau et sort par la droite, sans
    # empiéter sur le texte situé au-dessus.
    o.append(f'<path d="M {X+132} {y+22} Q {X+250} {y+6} {X+RW+40} {y}" fill="none" stroke="{ACCENT}" stroke-width="2.6" stroke-linecap="round"/>')
    o.append(f'<path d="M {X+RW+26} {y-7} l 16 7 l -16 7" fill="none" stroke="{ACCENT}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>')
    o.append(f'<text x="{X+RW+52}" y="{y+5}" font-size="12.5" fill="{ACCENT}">vers l\'aspiration</text>')
    return ''.join(o)

Y1, Y2 = 150, 402
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="brTitle brDesc">
<title id="brTitle">Brosse à soies contre brosse en caoutchouc face aux poils d'animaux</title>
<desc id="brDesc">Les deux types de brosse principale vus de côté. Sur une brosse à soies, les poils longs s'enroulent autour du rouleau et forment des manchons serrés qu'il faut découper. Sur une brosse en lamelles de caoutchouc disposées en hélice, rien n'accroche : les poils glissent le long des lamelles et sont entraînés vers l'aspiration.</desc>
<rect width="{W}" height="{H}" fill="{PAPER}"/>
<g font-family="Inter, system-ui, sans-serif">
  <text x="{X}" y="52" font-size="12.5" font-weight="600" fill="{ACCENT}" letter-spacing="1.3">BROSSE À SOIES</text>
  <text x="{X}" y="76" font-size="14" fill="{INK}">Les poils s'enroulent et étranglent le rouleau.</text>
  {cylinder(Y1)}{bristles(Y1)}
  <text x="{X}" y="{Y1+RH/2+34}" font-size="13" fill="{MUTED}">Manchons à découper au ciseau, régulièrement.</text>

  <line x1="{X}" y1="272" x2="760" y2="272" stroke="{RULE}" stroke-width="1"/>

  <text x="{X}" y="306" font-size="12.5" font-weight="600" fill="{ACCENT}" letter-spacing="1.3">BROSSE EN CAOUTCHOUC</text>
  <text x="{X}" y="330" font-size="14" fill="{INK}">Les lamelles en hélice ne laissent rien s'enrouler.</text>
  {cylinder(Y2)}{fins(Y2)}
  <text x="{X}" y="{Y2+RH/2+34}" font-size="13" fill="{MUTED}">Aucun démêlage : c'est le critère qui compte avec un animal.</text>
</g>
</svg>'''
open('/tmp/diag/brosse.svg','w').write(svg)
print('ok')
