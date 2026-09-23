#!/usr/bin/env python3
"""
Schéma explicatif générique, construit depuis ce que l'article affirme.

Les schémas du premier site — coupe de station, types de brosse — sont des
dessins d'objets, donc propres à leur niche : impossible à généraliser sans
mentir. Ce qui se généralise, c'est la FORME du raisonnement. Un enchaînement
d'étapes, un axe entre deux extrêmes, un embranchement de décision se dessinent
de la même façon qu'on parle d'aspirateurs ou de machines à café.

Le contenu vient du frontmatter, comme le tableau comparatif vient de `attrs` :
rien n'est inventé ici, on met en forme ce que l'article dit déjà.

    diagram: {"kind":"flow","title":"…","alt":"…","caption":"…",
              "items":[{"label":"…","detail":"…"}]}

Usage:
  python3 scripts/diagrams/schema-article.py --site sites/xxx
"""
import argparse, json, pathlib, re, textwrap

INK, MUTED, ACCENT, RULE, PAPER, PANEL = '#0F172A', '#64748B', '#2563EB', '#E2E8F0', '#F8FAFC', '#FFFFFF'
FONT = 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
W, M = 820, 56
KINDS = ('flow', 'spectrum', 'branch')


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


def wrap(text, size, width):
    """Découpe à la largeur disponible. Inter fait environ 0,52 em par
    caractère en moyenne : suffisant pour un retour à la ligne, on ne cherche
    pas la justification au pixel."""
    per = max(1, int(width / (size * 0.52)))
    return textwrap.wrap(text, per) or ['']


def lines(text, x, y, size, fill, lh=1.35, anchor='middle', weight='400', maxw=200):
    out = ''
    for i, ln in enumerate(wrap(text, size, maxw)):
        out += (f'<text x="{x:.0f}" y="{y + i * size * lh:.0f}" font-size="{size}" fill="{fill}" '
                f'text-anchor="{anchor}" font-weight="{weight}">{esc(ln)}</text>')
    return out, len(wrap(text, size, maxw))


def frame(body, h, title, alt):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" width="{W}" height="{h}" '
            f'role="img" aria-labelledby="dgT dgD">\n'
            f'<title id="dgT">{esc(title)}</title><desc id="dgD">{esc(alt)}</desc>\n'
            f'<rect width="{W}" height="{h}" fill="{PAPER}"/>\n'
            f'<g font-family="{FONT}">{body}</g>\n</svg>')


def arrow(x1, y, x2):
    return (f'<line x1="{x1:.0f}" y1="{y}" x2="{x2 - 9:.0f}" y2="{y}" stroke="{RULE}" stroke-width="2.5"/>'
            f'<path d="M {x2 - 10:.0f} {y - 5} L {x2:.0f} {y} L {x2 - 10:.0f} {y + 5}" fill="{RULE}"/>')


def k_flow(items, title, alt):
    """Un enchaînement : des étapes dans l'ordre, reliées par des flèches."""
    n = len(items)
    gap, h = 26, 250
    bw = (W - 2 * M - (n - 1) * gap) / n
    body = ''
    for i, it in enumerate(items):
        x = M + i * (bw + gap)
        cx = x + bw / 2
        body += (f'<rect x="{x:.0f}" y="64" width="{bw:.0f}" height="132" rx="8" fill="{PANEL}" '
                 f'stroke="{RULE}" stroke-width="1.5"/>')
        body += (f'<circle cx="{cx:.0f}" cy="96" r="14" fill="{ACCENT}"/>'
                 f'<text x="{cx:.0f}" y="101" font-size="14" font-weight="600" fill="#fff" '
                 f'text-anchor="middle">{i + 1}</text>')
        lab, nl = lines(it['label'], cx, 134, 14.5, INK, weight='600', maxw=bw - 20)
        body += lab
        if it.get('detail'):
            det, _ = lines(it['detail'], cx, 134 + nl * 20 + 6, 12, MUTED, maxw=bw - 20)
            body += det
        if i < n - 1:
            body += arrow(x + bw + 5, 130, x + bw + gap - 5)
    return frame(body, h, title, alt), h


def stack(parts, cx, top, maxw, anchor='middle'):
    """Empile des lignes de texte et renvoie (svg, hauteur totale).

    L'ancienne version posait chaque texte à une ordonnée calculée à part, si
    bien qu'un détail qui passait sur deux lignes recouvrait le libellé. On
    mesure donc le bloc entier avant de le placer."""
    svg, y = '', top
    for text, size, fill, weight in parts:
        for ln in wrap(text, size, maxw):
            y += size
            svg += (f'<text x="{cx:.0f}" y="{y:.0f}" font-size="{size}" fill="{fill}" '
                    f'text-anchor="{anchor}" font-weight="{weight}">{esc(ln)}</text>')
            y += size * 0.35
    return svg, y - top


def block_height(parts, maxw):
    h = 0
    for text, size, _, _ in parts:
        h += len(wrap(text, size, maxw)) * size * 1.35
    return h


def k_spectrum(items, title, alt, axis=None):
    """Un axe : des positions entre deux extrêmes, pas des valeurs mesurées."""
    n = len(items)
    # Hauteur déduite du contenu : une hauteur fixe laissait un tiers de vide
    # sous l'axe quand les libellés étaient courts, et rognait quand ils
    # passaient sur deux lignes.
    slot0 = 176
    haut = max((block_height(
        [(it['label'], 15, 0, 0)] + ([(it['detail'], 12, 0, 0)] if it.get('detail') else []), slot0)
        for i, it in enumerate(items) if i % 2 == 0), default=0)
    bas = max((block_height(
        [(it['label'], 15, 0, 0)] + ([(it['detail'], 12, 0, 0)] if it.get('detail') else []), slot0)
        for i, it in enumerate(items) if i % 2 == 1), default=0)
    y = int(24 + haut + 26)
    h = int(y + 18 + bas + 24)
    # De la place aux extrémités pour nommer l'axe : sans ses deux bouts, un
    # axe ne dit pas dans quel sens il se lit.
    pad = 104 if axis else 40
    x0, x1 = M + pad, W - M - pad
    body = f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{RULE}" stroke-width="3"/>'
    body += (f'<path d="M {x1 + 4} {y - 7} L {x1 + 18} {y} L {x1 + 4} {y + 7}" fill="{RULE}"/>'
             f'<path d="M {x0 - 4} {y - 7} L {x0 - 18} {y} L {x0 - 4} {y + 7}" fill="{RULE}"/>')
    if axis:
        for txt, x, anc in ((axis.get('from', ''), x0 - 26, 'end'), (axis.get('to', ''), x1 + 26, 'start')):
            if txt:
                sv, bh = stack([(txt, 12.5, MUTED, '500')], x, y - 16, 92, anchor=anc)
                body += sv
    step = (x1 - x0) / (n - 1) if n > 1 else 0
    slot = min(176, (x1 - x0) / max(1, n - 1) - 12) if n > 1 else 176
    for i, it in enumerate(items):
        x = x0 + i * step if n > 1 else (x0 + x1) / 2
        body += f'<circle cx="{x:.0f}" cy="{y}" r="8" fill="{ACCENT}"/>'
        parts = [(it['label'], 15, INK, '600')]
        if it.get('detail'):
            parts.append((it['detail'], 12, MUTED, '400'))
        if i % 2 == 0:                       # au-dessus : on place par le bas
            top = y - 26 - block_height(parts, slot)
        else:
            top = y + 18
        sv, _ = stack(parts, x, top, slot)
        body += sv
    return frame(body, h, title, alt), h


def k_branch(items, title, alt):
    """Un embranchement : une question, puis les cas. Le premier item est la
    racine, les suivants sont les branches."""
    root, kids = items[0], items[1:]
    n = len(kids)
    h = 300
    body = ''
    rw = 300
    rx = (W - rw) / 2
    body += f'<rect x="{rx:.0f}" y="40" width="{rw}" height="72" rx="8" fill="{INK}"/>'
    lab, _ = lines(root['label'], W / 2, 74, 15, '#fff', weight='600', maxw=rw - 28)
    body += lab
    if root.get('detail'):
        det, _ = lines(root['detail'], W / 2, 96, 12, '#CBD5E1', maxw=rw - 28)
        body += det
    gap = 24
    bw = (W - 2 * M - (n - 1) * gap) / n
    body += f'<line x1="{W/2:.0f}" y1="112" x2="{W/2:.0f}" y2="146" stroke="{RULE}" stroke-width="2.5"/>'
    for i, it in enumerate(kids):
        x = M + i * (bw + gap)
        cx = x + bw / 2
        body += (f'<line x1="{W/2:.0f}" y1="146" x2="{cx:.0f}" y2="146" stroke="{RULE}" stroke-width="2.5"/>'
                 f'<line x1="{cx:.0f}" y1="146" x2="{cx:.0f}" y2="176" stroke="{RULE}" stroke-width="2.5"/>'
                 f'<path d="M {cx - 5:.0f} 176 L {cx:.0f} 186 L {cx + 5:.0f} 176" fill="{RULE}"/>')
        body += (f'<rect x="{x:.0f}" y="188" width="{bw:.0f}" height="86" rx="8" fill="{PANEL}" '
                 f'stroke="{RULE}" stroke-width="1.5"/>')
        lab, nl = lines(it['label'], cx, 216, 14.5, INK, weight='600', maxw=bw - 20)
        body += lab
        if it.get('detail'):
            det, _ = lines(it['detail'], cx, 216 + nl * 20 + 4, 12, MUTED, maxw=bw - 20)
            body += det
    return frame(body, h, title, alt), h


RENDER = {'flow': k_flow, 'spectrum': k_spectrum, 'branch': k_branch}
LIMITS = {'flow': (2, 5), 'spectrum': (2, 5), 'branch': (3, 4)}


def figure(slug, spec, h):
    """Le <figure> inséré dans le corps, avec la même structure que les schémas
    écrits à la main : l'alternative textuelle porte l'information, pas la
    légende."""
    return (f'<figure class="diagram">\n'
            f'  <img src="/diagrams/{slug}.svg" alt="{esc(spec["alt"])}" '
            f'width="{W}" height="{h}" loading="lazy" decoding="async" />\n'
            f'  <figcaption>{esc(spec.get("caption") or spec["title"])}</figcaption>\n'
            f'</figure>')


def inject(body, fig):
    """Place la figure là où l'auteur l'a demandée, sinon après le premier
    paragraphe de la première section."""
    if '[SCHEMA]' in body:
        return body.replace('[SCHEMA]', fig, 1), 'marqueur'
    m = re.search(r'^##\s+.+?\n\n.+?\n\n', body, re.S | re.M)
    if m:
        return body[:m.end()] + fig + '\n\n' + body[m.end():], 'après la 1re section'
    return body.rstrip() + '\n\n' + fig + '\n', 'en fin d\'article'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--site', required=True)
    a = ap.parse_args()

    site = pathlib.Path(a.site)
    out = site / 'public' / 'diagrams'
    out.mkdir(parents=True, exist_ok=True)
    n_ok = n_skip = 0

    for f in sorted((site / 'src' / 'content' / 'articles').glob('*.md')):
        txt = f.read_text(encoding='utf-8')
        if not txt.startswith('---'):
            continue
        head, sep, body = txt[3:].partition('\n---')
        m = re.search(r'^diagram:[ \t]*(\{.*\})[ \t]*$', head, re.M)
        if not m:
            continue
        try:
            spec = json.loads(m.group(1))
        except json.JSONDecodeError as e:
            print(f'  ⚠️  {f.name} : diagram illisible ({e})')
            n_skip += 1
            continue

        kind = spec.get('kind')
        items = [i for i in spec.get('items', []) if i.get('label')]
        lo, hi = LIMITS.get(kind, (0, 0))
        if kind not in RENDER or not (lo <= len(items) <= hi) or not spec.get('alt'):
            # Un schéma incomplet dessiné quand même serait un schéma faux.
            print(f'  ⚠️  {f.name} : schéma écarté (kind={kind}, {len(items)} élément(s), '
                  f'alt={"oui" if spec.get("alt") else "non"})')
            n_skip += 1
            continue

        spec.setdefault('title', spec['alt'][:80])
        kwargs = {'axis': spec.get('axis')} if kind == 'spectrum' else {}
        svg, h = RENDER[kind](items, spec['title'], spec['alt'], **kwargs)
        (out / f'{f.stem}.svg').write_text(svg, encoding='utf-8')

        if 'class="diagram"' in body:
            print(f'  ✅ {f.stem}.svg  (figure déjà présente, non réinsérée)')
        else:
            body, where = inject(body, figure(f.stem, spec, h))
            f.write_text('---' + head + sep + body, encoding='utf-8')
            print(f'  ✅ {f.stem}.svg  ({kind}, {len(items)} éléments, {where})')
        n_ok += 1

    print(f'\n{n_ok} schéma(s) produit(s)' + (f' · {n_skip} écarté(s)' if n_skip else ''))
    if not n_ok and not n_skip:
        print("Aucun article ne déclare de `diagram:` — les articles se rendent sans schéma.")


if __name__ == '__main__':
    main()
