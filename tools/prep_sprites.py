#!/usr/bin/env python3
"""Turn raw character sheets from the art bundle into game-ready HD sprite sheets.

Usage:
    python3 tools/prep_sprites.py <bundle_dir> [--out sprites]

<bundle_dir> is the unzipped "Friends_Trivia_Sprites" folder (the one holding manifest.csv).
Every manifest row whose PNG is present gets processed; missing ones are listed and skipped.

What it does to each 3x4 character sheet:
  * removes the white background (and any grid lines / caption strip baked into the image),
    keeping white details *inside* a character (baby powder, bottles, collars) intact
  * finds the 12 figures, sorts them into rows (Down, Up, Left, Right) and frames
  * if both side rows face the same way (common with generated sheets), mirrors the Left row
  * scales every sheet by the same factor so characters keep their relative heights,
    lines frames up on a shared baseline, and writes a clean sheet:
        3 columns x 4 rows, each cell CELL_W x CELL_H, rows Down, Up, Left, Right
  * 1x1 item sprites are trimmed and fitted to an ITEM x ITEM square

Output goes to <out>/hd/<sprite_filename> and <out>/items/<sprite_filename>, plus
<out>/hd/index.json listing what was built.
"""
import argparse, csv, json, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

CELL_W, CELL_H = 128, 192          # 8x the engine's 16x24 world cell
BASELINE = CELL_H - 3              # feet land here
SRC_CELL_H = 300                   # source sheets are ~300px per row; maps to CELL_H
SCALE = CELL_H / SRC_CELL_H
ITEM = 128


def near_white(a, lo=226):
    return (a.min(2) >= lo) & ((a.max(2) - a.min(2)) < 26)


def strip_grid(a):
    """Paint baked-in grid lines and a bottom caption strip white."""
    a = a.copy()
    grey = ((a.max(2) - a.min(2)) < 14) & (a.mean(2) > 120) & (a.mean(2) < 228)
    H, W = grey.shape
    for x in np.where(grey.sum(0) > H * 0.5)[0]:
        a[:, max(0, x - 2):x + 3] = 255
    for y in np.where(grey.sum(1) > W * 0.42)[0]:
        a[max(0, y - 2):y + 3, :] = 255
    # caption: a mostly-grey band hugging the bottom edge
    rows = grey.mean(1)
    y = H - 1
    while y > H * 0.85 and rows[y] > 0.35:
        y -= 1
    if y < H - 4:
        a[y - 2:, :] = 255
    return a


def find_figures(a):
    ink = ~near_white(a, 236)
    ink = ndimage.binary_opening(ink, iterations=1)
    blob = ndimage.binary_dilation(ink, iterations=10)
    lab, n = ndimage.label(blob)
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if h > a.shape[0] * 0.08 and (lab[sl] == i).sum() > 2000:
            boxes.append((sl[0].start + 8, sl[1].start + 8, sl[0].stop - 8, sl[1].stop - 8))  # undo dilation
    return boxes


def cut_out(a, box, pad=6):
    y0, x0, y1, x1 = box
    y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
    y1, x1 = min(a.shape[0], y1 + pad), min(a.shape[1], x1 + pad)
    crop = a[y0:y1, x0:x1]
    bg = near_white(crop)
    # background = near-white pixels connected to the crop border
    lab, _ = ndimage.label(bg)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    out_bg = np.isin(lab, list(edge))
    # soften the halo: light pixels touching the background become transparent too
    halo = ndimage.binary_dilation(out_bg) & ~out_bg & (crop.min(2) > 200)
    alpha = np.where(out_bg | halo, 0, 255).astype(np.uint8)
    rgba = np.dstack([crop, alpha])
    ys, xs = np.where(alpha > 0)
    return rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1], (y0 + ys.min(), x0 + xs.min())


def head_cx(rgba):
    """Horizontal centre of the top quarter (the head) -- steadier than the full bbox when arms swing."""
    h = rgba.shape[0]
    top = rgba[: max(4, h // 4), :, 3] > 0
    xs = np.where(top.any(0))[0]
    return (xs.min() + xs.max()) / 2 if len(xs) else rgba.shape[1] / 2


def small(rgba, size=24):
    im = Image.fromarray(rgba).resize((size, size), Image.BILINEAR)
    return np.asarray(im).astype(float)


def build_sheet(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.uint8)
    a = strip_grid(a)
    boxes = find_figures(a)
    if len(boxes) != 12:
        raise ValueError(f"expected 12 figures, found {len(boxes)}")
    boxes.sort(key=lambda b: (b[0] + b[2]) / 2)
    rows = [sorted(boxes[i * 3:i * 3 + 3], key=lambda b: b[1]) for i in range(4)]
    figs = [[cut_out(a, b) for b in r] for r in rows]

    # facing: if Right row looks like the Left row *unmirrored*, both face the same way -> mirror Left
    L0, R0 = figs[2][0][0], figs[3][0][0]
    same = np.mean((small(L0) - small(R0)) ** 2)
    flip = np.mean((small(L0[:, ::-1]) - small(R0)) ** 2)
    mirrored_left = same < flip

    sheet = Image.new("RGBA", (CELL_W * 3, CELL_H * 4), (0, 0, 0, 0))
    for r, row in enumerate(figs):
        bottoms = [off[0] + f.shape[0] for f, off in row]
        row_bottom = max(bottoms)
        for c, (f, off) in enumerate(row):
            if r == 2 and mirrored_left:
                f = f[:, ::-1].copy()
            im = Image.fromarray(f)
            s = SCALE
            if f.shape[1] * s > CELL_W - 2 or f.shape[0] * s > CELL_H - 4:
                s = min((CELL_W - 2) / f.shape[1], (CELL_H - 4) / f.shape[0])
            w, h = max(1, round(f.shape[1] * s)), max(1, round(f.shape[0] * s))
            im = im.resize((w, h), Image.LANCZOS)
            lift = (row_bottom - (off[0] + f.shape[0])) * s       # keep raised feet raised
            x = round(CELL_W / 2 - head_cx(f) * s)
            x = min(max(x, 0), CELL_W - w)
            y = round(BASELINE - h - lift)
            sheet.alpha_composite(im, (c * CELL_W + x, r * CELL_H + max(0, y)))
    return sheet, bool(mirrored_left)


def build_item(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.uint8)
    rgba, _ = cut_out(a, (0, 0, a.shape[0], a.shape[1]), pad=0)
    im = Image.fromarray(rgba)
    s = (ITEM - 8) / max(im.size)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    out = Image.new("RGBA", (ITEM, ITEM), (0, 0, 0, 0))
    out.alpha_composite(im, ((ITEM - im.width) // 2, (ITEM - im.height) // 2))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("bundle")
    ap.add_argument("--out", default=str(Path(__file__).resolve().parent.parent / "sprites"))
    args = ap.parse_args()
    bundle, out = Path(args.bundle), Path(args.out)
    (out / "hd").mkdir(parents=True, exist_ok=True)
    (out / "items").mkdir(parents=True, exist_ok=True)
    built, missing = {}, []
    with open(bundle / "manifest.csv", newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            src = bundle / row["relative_path"]
            name = row["sprite_filename"]
            if name in built:
                continue
            if not src.exists():
                missing.append(name)
                continue
            if row["grid_layout"] == "1x1":
                build_item(src).save(out / "items" / name, optimize=True)
                built[name] = {"kind": "item", "path": f"sprites/items/{name}"}
            else:
                sheet, flipped = build_sheet(src)
                sheet.save(out / "hd" / name, optimize=True)
                built[name] = {"kind": "sheet", "path": f"sprites/hd/{name}", "mirroredLeft": flipped}
            print(f"built  {name}  {built[name]}")
    idx = out / "hd" / "index.json"
    prev = json.loads(idx.read_text()) if idx.exists() else {}
    prev.update(built)
    idx.write_text(json.dumps(prev, indent=1, sort_keys=True))
    if missing:
        print(f"\n{len(set(missing))} sprite(s) listed in the manifest but not in the bundle:", file=sys.stderr)
        for m in sorted(set(missing)):
            print("  missing", m, file=sys.stderr)


if __name__ == "__main__":
    main()
