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
BG = (250, 248, 244)        # #FAF8F4 — fond du site
INK = (28, 29, 34)          # #1C1D22
MUTED = (107, 106, 99)      # #6B6A63
ACCENT = (138, 90, 43)      # #8A5A2B
RULE = (228, 224, 214)      # #E4E0D6


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
    f_title = load(serif, 74, 600)
    f_dom = load(sans, 26, 400)

    d.text((M, M), a.brand.upper(), font=f_brand, fill=ACCENT)

    lines = wrap(d, a.tagline, f_title, W - 2 * M)[:3]
    y = M + 96
    for ln in lines:
        d.text((M, y), ln, font=f_title, fill=INK)
        y += 92

    d.line([(M, H - M - 62), (W - M, H - M - 62)], fill=RULE, width=2)
    d.text((M, H - M - 40), a.domain, font=f_dom, fill=MUTED)

    out = site / a.out
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, 'PNG', optimize=True)
    print(f'✅ {out} — {W}x{H}, {out.stat().st_size // 1024} Ko')


if __name__ == '__main__':
    main()
