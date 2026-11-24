#!/usr/bin/env python3
"""Cut a 2x2 Gemini car sheet (magenta template bodies, facing right) into car sprites.

Usage: python3 tools/prep_cars.py <cars2.png>
Writes sprites/interior/car_{sedan,wagon,van,compact}_t.png, 288 px wide.
"""
import sys, os
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
import prep_icons

NAMES = ['sedan', 'wagon', 'van', 'compact']
OUT = os.path.join(os.path.dirname(__file__), '..', 'sprites', 'interior')


def main(src):
    prep_icons.MAXSIDE = 10000          # no shrink inside cut(); sized below
    im = Image.open(src).convert('RGB')
    W, H = im.size
    for i, n in enumerate(NAMES):
        cx, cy = i % 2, i // 2
        q = im.crop((cx * W // 2, cy * H // 2, (cx + 1) * W // 2, (cy + 1) * H // 2))
        r = prep_icons.cut(q)
        k = 288 / r.width
        r = r.resize((288, round(r.height * k)), Image.LANCZOS)
        r.save(os.path.join(OUT, 'car_%s_t.png' % n), optimize=True)
        print(n, r.size)


if __name__ == '__main__':
    main(sys.argv[1])
