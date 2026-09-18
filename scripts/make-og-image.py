#!/usr/bin/env python3
"""
Génère l'image de partage (Open Graph / Twitter) d'un site.

Sans og:image, un lien partagé sur WhatsApp, LinkedIn ou Slack s'affiche sans
visuel. L'image reprend la typographie du site (Source Serif 4) pour rester
cohérente avec la marque.

Dépendances : python3-pil, python3-fonttools, python3-brotli
  apt-get install -y python3-pil python3-fonttools python3-brotli

Usage:
  python3 scripts/make-og-image.py --site sites/cleantop \
      --brand "CleanTop" --tagline "Guides et comparatifs d'aspirateurs robots" \
      --domain aspirob.com
"""
import argparse, pathlib, tempfile
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

W, H = 1200, 630
BG = (255, 255, 255)        # blanc
INK = (15, 23, 42)          # #0F172A
MUTED = (100, 116, 139)     # #64748B
ACCENT = (37, 99, 235)      # #2563EB
RULE = (226, 232, 240)      # #E2E8F0


def woff2_to_ttf(src: pathlib.Path) -> str:
    """Pillow ne lit pas le woff2 : on le convertit à la volée."""
    f = TTFont(str(src))
    f.flavor = None
    out = tempfile.NamedTemporaryFile(suffix='.ttf', delete=False)
    f.save(out.name)
    return out.name


def load(path, size, weight=None):
    font = ImageFont.truetype(path, size)
    if weight is not None:
        try:
            font.set_variation_by_axes([weight])
        except Exception:
            pass  # police non variable : on garde la graisse par défaut
    return font


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ''
    for w in words:
        trial = f'{cur} {w}'.strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--site', required=True)
    ap.add_argument('--brand', required=True)
    ap.add_argument('--tagline', required=True)
    ap.add_argument('--domain', required=True)
    ap.add_argument('--out', default='public/og-default.png')
    a = ap.parse_args()

    site = pathlib.Path(a.site)
    fonts = site / 'public' / 'fonts'
    serif = woff2_to_ttf(fonts / 'SourceSerif4-latin.woff2')
    sans = woff2_to_ttf(fonts / 'Inter-latin.woff2')

    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)

    M = 84                       # marge
    d.rectangle([0, 0, 10, H], fill=ACCENT)          # filet vertical de marque

    f_brand = load(sans, 30, 600)
    f_dom = load(sans, 26, 400)

    # Auto-ajustement : un titre d'article est bien plus long qu'une accroche
    # de site. On réduit le corps jusqu'à tenir en 4 lignes maximum.
    size, lines = 74, None
    while size >= 40:
        f_title = load(serif, size, 600)
        lines = wrap(d, a.tagline, f_title, W - 2 * M)
        if len(lines) <= (3 if size > 56 else 4):
            break
        size -= 6
    leading = int(size * 1.24)

    d.text((M, M), a.brand.upper(), font=f_brand, fill=ACCENT)

    block_h = leading * len(lines)
    y = max(M + 92, (H - block_h) // 2 - 6)
    for ln in lines:
        d.text((M, y), ln, font=f_title, fill=INK)
        y += leading

    d.line([(M, H - M - 62), (W - M, H - M - 62)], fill=RULE, width=2)
    d.text((M, H - M - 40), a.domain, font=f_dom, fill=MUTED)

    out = site / a.out
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, 'PNG', optimize=True)
    print(f'✅ {out} — {W}x{H}, {out.stat().st_size // 1024} Ko')


if __name__ == '__main__':
    main()
