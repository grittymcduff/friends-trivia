#!/usr/bin/env python3
"""Cut the 2x2 Gemini item-icon sheets into transparent sprites.

Usage: python3 tools/prep_icons.py <folder with icons1.png..icons9.png>
Writes sprites/icons/<id>.png (longest side 160 px).

The white background is removed by flood fill from the edges of each quarter,
so white parts inside an object (the veil, the duck, a business card) stay.
"""
import sys, os
from PIL import Image, ImageDraw, ImageFilter

# sheet -> ids in order top-left, top-right, bottom-left, bottom-right (None = skip)
SHEETS = {
    'icons1': ['mug', 'painting', 'turkey', 'cup'],
    'icons2': ['frame', 'hugsy', 'armadillo', 'card'],
    'icons3': ['bag', 'puck', 'wig', 'bone'],
    'icons4': ['umbrella', 'headshot', 'hat', 'veil'],
    'icons5': ['paddle', 'shell', 'cracker', 'broom'],
    'icons6': [None, 'album', 'bootie', 'purse'],   # the keychain came out as a taxi, not a Porsche
    'icons7': ['comb', 'ashtray', 'nametag', 'polaroid'],
    'icons8': ['trophy', 'key', 'box', 'sphynx'],
    'icons9': ['smellycat', 'poker', 'chickduck', 'recliners'],
}
# single-object images: id -> file
SINGLES = {'porsche': 'porsche.png'}
OUT = os.path.join(os.path.dirname(__file__), '..', 'sprites', 'icons')
MAXSIDE = 160
SENT = (255, 0, 255)
# objects with see-through gaps (handles) where white background is enclosed
HOLES = {'mug', 'bag', 'purse', 'trophy'}


def cut(q, holes=False):
    w, h = q.size
    pad = Image.new('RGB', (w + 4, h + 4), (255, 255, 255))
    pad.paste(q.convert('RGB'), (2, 2))
    ImageDraw.floodfill(pad, (0, 0), SENT, thresh=46)
    px = pad.load()
    a = Image.new('L', pad.size, 255)
    ap = a.load()
    for y in range(pad.size[1]):
        for x in range(pad.size[0]):
            if px[x, y] == SENT:
                ap[x, y] = 0
    # defringe: light pixels touching the background go too
    er = a.filter(ImageFilter.MinFilter(3))
    src = pad.load()
    ep = er.load()
    for y in range(pad.size[1]):
        for x in range(pad.size[0]):
            if ap[x, y] and not ep[x, y]:
                r, g, b = src[x, y]
                if min(r, g, b) > 205:
                    ap[x, y] = 0
    if holes:
        import numpy as np
        from scipy import ndimage
        arr = np.asarray(pad).astype(int)
        al = np.asarray(a).copy()
        white = (arr.min(axis=2) >= 238) & (al > 0)
        lab, n = ndimage.label(white)
        for k in range(1, n + 1):
            m = lab == k
            if m.sum() >= 40:
                al[ndimage.binary_dilation(m, iterations=1)
                   & (arr.min(axis=2) >= 200)] = 0
        a = Image.fromarray(al)
    img = pad.convert('RGBA')
    img.putalpha(a)
    img = img.crop((2, 2, w + 2, h + 2))
    # drop specks: keep the bbox of the alpha after removing tiny islands via a blur threshold
    bb = img.getchannel('A').point(lambda v: 255 if v > 0 else 0).filter(ImageFilter.MinFilter(3)).getbbox()
    if not bb:
        return None
    x0, y0, x1, y1 = bb
    img = img.crop((max(0, x0 - 2), max(0, y0 - 2), min(w, x1 + 2), min(h, y1 + 2)))
    s = MAXSIDE / max(img.size)
    if s < 1:
        img = img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.LANCZOS)
    return img


def main(src):
    os.makedirs(OUT, exist_ok=True)
    for sheet, ids in SHEETS.items():
        im = Image.open(os.path.join(src, sheet + '.png')).convert('RGB')
        W, H = im.size
        for i, ident in enumerate(ids):
            if not ident:
                continue
            cx, cy = i % 2, i // 2
            q = im.crop((cx * W // 2, cy * H // 2, (cx + 1) * W // 2, (cy + 1) * H // 2))
            r = cut(q, ident in HOLES)
            if r is None:
                print('EMPTY', sheet, ident)
                continue
            r.save(os.path.join(OUT, ident + '.png'), optimize=True)
            print(ident, r.size)
    for ident, fn in SINGLES.items():
        r = cut(Image.open(os.path.join(src, fn)).convert('RGB'))
        r.save(os.path.join(OUT, ident + '.png'), optimize=True)
        print(ident, r.size)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '/home/claude/iconpack')
