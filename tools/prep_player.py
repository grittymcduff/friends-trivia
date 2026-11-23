#!/usr/bin/env python3
"""Build the player character's layered HD sprite data from the colour-keyed template sheets.

Usage:
    python3 tools/prep_player.py <folder with the template sheets>

Expected files (any image format PIL reads, e.g. .jpg/.png), each a 3x4 sheet on white:
    base       bald body: magenta skin, cyan shirt, navy pants, green shoes
    freckles   same body with freckles
    ponytail, puffy, long, spiky, buzz, shaggy   the body with yellow hair in that style

The template colours are placeholders. Every pixel is classified into a *part* (skin, skin shade,
shirt, pants, shoes, hair, outline...) and the game paints each part in the colours the player
picks. Output: sprites/player/<name>.png -- an 8-bit greyscale "label map" per sheet (pixel value =
part id x 20, so browser colour handling can't nudge a value into the wrong part), in the same 3x4, 176x192-cell layout as the other HD sheets (Down, Up, Left, Right),
plus sprites/player/meta.json with head/hand anchor points for hats and held items.

Notes on the source sheets:
  * They're JPEGs, so colours are snapped to the nearest template colour and the image is
    downscaled by majority vote per output pixel; this gives clean, crisp parts.
  * The second side row isn't consistent between sheets (some face left, some right, some switch
    mid-row), so the first side row (which always faces right) is used for Right and mirrored for Left.
  * Bare legs (skirts, dresses) reuse the pants area painted in skin -- the same shape as the
    no-pants template.
"""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
from prep_sprites import strip_grid, find_figures, near_white  # noqa: E402

CELL_W, CELL_H = 176, 192
BASELINE = CELL_H - 3
SCALE = 0.37

# part ids (stored as pixel values in the label PNGs)
T, OUTLINE, SKIN, SKIN2, SKIN3, SHIRT, SHIRT2, PANTS, SHOES, SHOES2, HAIR, HAIR2, FRECKLE = range(13)
PARTS = ["none", "outline", "skin", "skin2", "skin3", "shirt", "shirt2", "pants", "shoes", "shoes2", "hair", "hair2", "freckle"]
PALETTE = [  # (part, template colour)
    (OUTLINE, (35, 23, 58)), (OUTLINE, (32, 21, 35)),
    (SKIN, (216, 77, 160)), (SKIN2, (182, 57, 135)), (SKIN3, (146, 46, 115)),
    (SHIRT, (59, 194, 214)), (SHIRT2, (50, 136, 175)),
    (PANTS, (49, 53, 96)),
    (SHOES, (159, 221, 103)), (SHOES2, (105, 162, 89)),
    (HAIR, (252, 212, 18)), (HAIR2, (216, 144, 11)),
]
FRECKLE_RGB = (132, 44, 72)
STYLES = ["ponytail", "puffy", "long", "spiky", "buzz", "shaggy"]


def classify(rgb, with_freckles=False):
    """Full-resolution part labels for an RGB crop (background already known)."""
    pal = PALETTE + ([(FRECKLE, FRECKLE_RGB)] if with_freckles else [])
    cols = np.array([c for _, c in pal], float)
    ids = np.array([p for p, _ in pal])
    d = ((rgb[..., None, :].astype(float) - cols) ** 2).sum(-1)
    return ids[d.argmin(-1)]


def figure_labels(rgb, box, with_freckles=False, pad=6):
    y0, x0, y1, x1 = box
    y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
    y1, x1 = min(rgb.shape[0], y1 + pad), min(rgb.shape[1], x1 + pad)
    crop = rgb[y0:y1, x0:x1]
    bg = near_white(crop, 200) | ((crop.min(2) > 150) & (crop.max(2) - crop.min(2) < 30))  # white + grey JPEG fringe
    lab, _ = ndimage.label(bg)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    out = np.isin(lab, list(edge))
    labels = classify(crop, with_freckles)
    labels[out] = T
    ys, xs = np.where(labels != T)
    return labels[ys.min():ys.max() + 1, xs.min():xs.max() + 1], (y0 + ys.min(), x0 + xs.min())


def downscale(labels, s):
    """Majority-vote downscale of a label map."""
    h, w = labels.shape
    W, H = max(1, round(w * s)), max(1, round(h * s))
    votes = []
    for p in range(len(PARTS)):
        m = Image.fromarray(((labels == p) * 255).astype(np.uint8)).resize((W, H), Image.BOX)
        votes.append(np.asarray(m, float))
    v = np.stack(votes)
    v[T] *= 1.15  # keep silhouettes tidy: a pixel has to be mostly inside to count
    return v.argmax(0).astype(np.uint8)


def sheet(path, with_freckles=False):
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.uint8)
    rgb = strip_grid(rgb)
    boxes = find_figures(rgb)
    if len(boxes) != 12:
        raise ValueError(f"{path.name}: expected 12 figures, found {len(boxes)}")
    boxes.sort(key=lambda b: (b[0] + b[2]) / 2)
    rows = [sorted(boxes[i * 3:i * 3 + 3], key=lambda b: b[1]) for i in range(4)]
    figs = [[figure_labels(rgb, b, with_freckles) for b in r] for r in rows]
    right = figs[2]                                   # always faces right
    order = [figs[0], figs[1], [(f[:, ::-1].copy(), o) for f, o in right], right]
    out = np.zeros((CELL_H * 4, CELL_W * 3), np.uint8)
    for r, row in enumerate(order):
        row_bottom = max(o[0] + f.shape[0] for f, o in row)
        for c, (f, off) in enumerate(row):
            small = downscale(f, SCALE)
            lift = round((row_bottom - (off[0] + f.shape[0])) * SCALE)
            # anchor on the shirt so every hairstyle sheet lines up with the base body
            sx = np.where((small == SHIRT) | (small == SHIRT2))[1]
            cx = (sx.min() + sx.max()) / 2 if len(sx) else small.shape[1] / 2
            x = int(round(CELL_W / 2 - cx))
            y = BASELINE - small.shape[0] - lift
            h, w = small.shape
            # clip into the cell
            sx0, sy0 = max(0, -x), max(0, -y)
            dx0, dy0 = max(0, x), max(0, y)
            w2, h2 = min(w - sx0, CELL_W - dx0), min(h - sy0, CELL_H - dy0)
            dst = out[r * CELL_H + dy0:r * CELL_H + dy0 + h2, c * CELL_W + dx0:c * CELL_W + dx0 + w2]
            src = small[sy0:sy0 + h2, sx0:sx0 + w2]
            dst[src != T] = src[src != T]
            # navy sits close to the outline colour: stray "pants" pixels above the waist are outline
            cell = out[r * CELL_H:(r + 1) * CELL_H, c * CELL_W:(c + 1) * CELL_W]
            shirt_rows = np.where(np.isin(cell, [SHIRT, SHIRT2]).any(1))[0]
            if len(shirt_rows):
                top = cell[: shirt_rows.max() - 4]
                top[top == PANTS] = OUTLINE
            lab, n = ndimage.label(cell == PANTS)
            for i in range(1, n + 1):
                if (lab == i).sum() < 6:
                    cell[lab == i] = OUTLINE
    return out


def anchors(base):
    """Per frame: head box (skin/outline above the shirt) and the front hand, in cell pixels."""
    meta = {}
    for r, d in enumerate(["down", "up", "left", "right"]):
        meta[d] = []
        for c in range(3):
            cell = base[r * CELL_H:(r + 1) * CELL_H, c * CELL_W:(c + 1) * CELL_W]
            shirt = np.isin(cell, [SHIRT, SHIRT2])
            sy = np.where(shirt.any(1))[0]
            shirt_top, shirt_bot = int(sy.min()), int(sy.max())
            body = cell != T
            head = body.copy()
            head[shirt_top - 2:] = False
            hy, hx = np.where(head)
            # hands: skin pixels level with the shirt; front hand = the side the engine holds items on
            skin = np.isin(cell, [SKIN, SKIN2, SKIN3])
            arm = skin.copy()
            arm[:shirt_top] = False
            arm[shirt_bot + 14:] = False
            ay, ax = np.where(arm)
            if d == "left":
                pick = ax <= np.percentile(ax, 25)
            else:
                pick = ax >= np.percentile(ax, 75)
            hand = [int(ax[pick].mean()), int(ay[pick].max())] if len(ax) else [CELL_W // 2, shirt_bot]
            ys, xs = np.where(body)
            meta[d].append({"head": [int(hx.min()), int(hy.min()), int(hx.max()), int(hy.max())],
                            "body": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
                            "shirtTop": shirt_top, "hand": hand})
    return meta


def save(arr, path):
    Image.fromarray((arr * 20).astype(np.uint8)).save(path, optimize=True)


def main():
    src = Path(sys.argv[1])
    out = Path(__file__).resolve().parent.parent / "sprites" / "player"
    out.mkdir(parents=True, exist_ok=True)
    find = lambda n: next(p for p in src.iterdir() if p.stem.lower() == n)
    base = sheet(find("base"))
    fr_full = sheet(find("freckles"), with_freckles=True)
    fr = np.where((fr_full == FRECKLE) & np.isin(base, [SKIN, SKIN2]), FRECKLE, T).astype(np.uint8)
    save(fr, out / "freckles.png")
    # the bald template's side views have no eye; the freckles template does, so the bald body
    # comes from that sheet with its freckles painted back to skin
    bald = np.where(fr_full == FRECKLE, SKIN, fr_full).astype(np.uint8)
    save(bald, out / "base.png")
    for st in STYLES:
        save(sheet(find(st)), out / f"{st}.png")
        print("built", st)
    meta = {"parts": PARTS, "cell": [CELL_W, CELL_H], "styles": STYLES, "anchors": anchors(base)}
    (out / "meta.json").write_text(json.dumps(meta))
    print("freckle pixels:", int((fr == FRECKLE).sum()))


if __name__ == "__main__":
    main()
