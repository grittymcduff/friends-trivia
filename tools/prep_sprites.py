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
  * makes the Left row face left and the Right row face right (generated sheets draw both
    side rows facing the same way; see OVERRIDES for the few that face left)
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

CELL_W, CELL_H = 176, 192          # 8 px per world px: 22x24 world cell (wide enough for brooms and guitars)
BASELINE = CELL_H - 3              # feet land here
SRC_CELL_H = 300                   # source sheets are ~300px per row; maps to CELL_H
SCALE = CELL_H / SRC_CELL_H
ITEM = 128

# Sheets that don't follow the standard 3x4, ~300px-per-row layout.
#   layout '4x3': 4 frames x 3 rows (idle/loop sheets). Rows map to Down, Up, Right; Left = mirrored Right.
#   scale: overrides SCALE (these sheets are drawn at about a third of the size of the others)
#   face: which way the side rows face in the source. The generator draws both side rows facing the
#         same way (almost always right), so one row gets mirrored. Default "right"; checked by eye.
#   skip: reason the sheet can't be used as a walking sprite
OVERRIDES = {
    "Chandler_InABox.png": {"layout": "4x3", "scale": 1.75, "face": "right"},
    "Duck_Runaway.png": {"layout": "4x3", "scale": 1.05, "face": "right"},
    "Chick_Apartment.png": {"layout": "4x3", "scale": 1.3, "face": "left"},
    "Mr_Heckles_Upstairs_Hallway.png": {"face": "left"},
    "Duck_Apartment.png": {"skip": "every frame has the apartment background painted in, so it can't be cut out"},
    "Trio_PivotCouch.png": {"skip": "comic-strip panels of a scene, not a walk cycle"},
}


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


def find_figures(a, dil=10, min_area=2000, min_h=0.08):
    ink = ~near_white(a, 236)
    ink = ndimage.binary_opening(ink, iterations=1)
    blob = ndimage.binary_dilation(ink, iterations=dil)
    lab, n = ndimage.label(blob)
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if h > a.shape[0] * min_h and (lab[sl] == i).sum() > min_area:
            d = max(0, dil - 2)
            boxes.append((sl[0].start + d, sl[1].start + d, sl[0].stop - d, sl[1].stop - d))  # undo dilation
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


def norm(name):
    return "".join(ch for ch in name.lower() if ch.isalnum())


def build_sheet(path, opts=None, prop_out=None):
    opts = opts or {}
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.uint8)
    a = strip_grid(a)
    boxes = find_figures(a, 3, 120, 0.05) if opts.get("layout") == "4x3" else find_figures(a)
    if len(boxes) != 12:
        raise ValueError(f"expected 12 figures, found {len(boxes)}")
    boxes.sort(key=lambda b: (b[0] + b[2]) / 2)
    four = opts.get("layout") == "4x3"
    per, nrows = (4, 3) if four else (3, 4)
    rows = [sorted(boxes[i * per:i * per + per], key=lambda b: b[1]) for i in range(nrows)]
    figs = [[cut_out(a, b) for b in r] for r in rows]

    # a frame much wider than its row-mates is a prop drawn into the sheet (e.g. the box "Porsche"):
    # save it separately and reuse the row's first frame in its place
    props = []
    for r in figs:
        med = np.median([f.shape[1] for f, _ in r])
        for i, (f, off) in enumerate(r):
            if f.shape[1] > med * 1.7 and i > 0:
                props.append(f)
                r[i] = r[0]

    if four:
        side = figs[2][:3]
        if opts.get("face") == "left":
            side = [(f[:, ::-1].copy(), o) for f, o in side]
        figs = [figs[0][:3], figs[1][:3], [(f[:, ::-1].copy(), o) for f, o in side], side]
        mirrored_left = True
    else:
        # rows 2 and 3 of the source both face `face`; make Left face left and Right face right
        face = opts.get("face", "right")
        flip_l, flip_r = face == "right", face == "left"
        for ri, fl_ in ((2, flip_l), (3, flip_r)):
            if fl_:
                figs[ri] = [(f[:, ::-1].copy(), o) for f, o in figs[ri]]
        mirrored_left = flip_l

    sheet = Image.new("RGBA", (CELL_W * 3, CELL_H * 4), (0, 0, 0, 0))
    for r, row in enumerate(figs):
        bottoms = [off[0] + f.shape[0] for f, off in row]
        row_bottom = max(bottoms)
        for c, (f, off) in enumerate(row):
            im = Image.fromarray(f)
            s = opts.get("scale", SCALE)
            if f.shape[1] * s > CELL_W - 2 or f.shape[0] * s > CELL_H - 4:
                s = min((CELL_W - 2) / f.shape[1], (CELL_H - 4) / f.shape[0])
            w, h = max(1, round(f.shape[1] * s)), max(1, round(f.shape[0] * s))
            im = im.resize((w, h), Image.LANCZOS)
            lift = (row_bottom - (off[0] + f.shape[0])) * s       # keep raised feet raised
            x = round(CELL_W / 2 - head_cx(f) * s)
            x = min(max(x, 0), CELL_W - w)
            y = round(BASELINE - h - lift)
            sheet.alpha_composite(im, (c * CELL_W + x, r * CELL_H + max(0, y)))
    if prop_out and props:
        Image.fromarray(props[0]).save(prop_out, optimize=True)
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
    built, missing, skipped = {}, [], {}
    files = {norm(f.name): f for f in bundle.rglob("*.png")}
    with open(bundle / "manifest.csv", newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    for row in rows:
        src = files.get(norm(row["sprite_filename"]))
        if src is None:
            missing.append(row["sprite_filename"])
            continue
        name = src.name
        if name in built or name in skipped:
            continue
        opts = OVERRIDES.get(name, {})
        if "skip" in opts:
            skipped[name] = opts["skip"]
            continue
        if row["grid_layout"] == "1x1":
            build_item(src).save(out / "items" / name, optimize=True)
            built[name] = {"kind": "item", "path": f"sprites/items/{name}"}
        else:
            prop = out / "hd" / (src.stem + "_prop.png")
            try:
                sheet, flipped = build_sheet(src, opts, prop)
            except ValueError as e:
                skipped[name] = str(e)
                continue
            sheet.save(out / "hd" / name, optimize=True)
            built[name] = {"kind": "sheet", "path": f"sprites/hd/{name}", "mirroredLeft": flipped}
            if prop.exists():
                built[name]["prop"] = f"sprites/hd/{prop.name}"
        print(f"built  {name}  {built[name]}")
    for n, why in skipped.items():
        print(f"skipped {n}: {why}", file=sys.stderr)
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
