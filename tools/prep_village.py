#!/usr/bin/env python3
"""Build the HD Greenwich Village art (facades, ground tiles, props) from the generated images.

Usage:
    python3 tools/prep_village.py <folder with the generated images>

Expected files (names from the art brief, .png or .jpg):
    bldg_n1_brownstone ... bldg_s5_brownstone_wide   (11 facades)
    ground_sidewalk, ground_grass, ground_path, ground_rooftop
    prop_lamp, prop_tree_street, prop_tree_park, prop_subway_entrance
    props_small_sheet  (hydrant, newsbox, planter, street sign: left to right)
    props_cars_sheet   (magenta car template, taxi: left to right)
    props_park_sheet   (bench, fence, barricade: top to bottom)

Output: sprites/village/*.png at 8 px per game pixel (a tile is 128 px), and asphalt-based road tiles
(plain, centre line, crosswalk) generated here, since the image generator kept refusing plain asphalt.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

PX = 8                     # HD pixels per world pixel
TILE = 16 * PX             # 128
OUT = Path(__file__).resolve().parent.parent / "sprites" / "village"

# size each prop is drawn at, in world pixels: ("w", width) or ("h", height); fence is cropped to one tile
PROP_SIZE = {"lamp": ("h", 44), "tree_street": ("w", 32), "tree_park": ("w", 34), "hydrant": ("w", 10), "newsbox": ("h", 18),
             "planter": ("w", 16), "street_sign": ("h", 40), "car_template": ("w", 34), "taxi": ("w", 34), "bench": ("w", 30),
             "fence": ("h", 12), "barricade": ("h", 20), "subway": ("w", 32)}
# tallest a facade may be, in world pixels: north-side tops would leave the map, south-side tops would
# cover the sidewalk in front of them
MAX_H = {"n": 144, "s": 130}
MAX_STRETCH = 1.25
BUILDING_W = {"n1_brownstone": 6, "n2_brick": 6, "n3_central_perk": 8, "n4_brick_ross": 8, "n5_brownstone": 6,
              "n6_rays_pizza": 6, "s1_lucille_lortel": 8, "s2_brownstone": 6, "s3_village_cigars": 6,
              "s4_brick_phoebe": 8, "s5_brownstone_wide": 12}


def load(src, stem):
    for ext in (".png", ".jpg", ".jpeg"):
        p = src / (stem + ext)
        if p.exists():
            return np.asarray(Image.open(p).convert("RGB")).astype(np.uint8)
    raise FileNotFoundError(stem)


def cutout(rgb, tol=232):
    """RGBA with the white background (connected to the border) made transparent, trimmed."""
    white = (rgb.min(2) >= tol) & ((rgb.max(2) - rgb.min(2)) < 30)
    lab, _ = ndimage.label(white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    halo = ndimage.binary_dilation(bg, iterations=2) & ~bg & (rgb.min(2) > 205)   # pale JPEG fringe
    alpha = np.where(bg | halo, 0, 255).astype(np.uint8)
    rgba = np.dstack([rgb, alpha])
    ys, xs = np.where(alpha > 0)
    return rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


POCKETS = {"fence", "bench", "subway", "tree_street", "street_sign", "lamp", "planter", "newsbox", "hydrant", "tree_park"}


def clear_pockets(rgba, min_px=12):
    """Also clear white background trapped inside a prop (between fence bars, railings, bench slats)."""
    rgb = rgba[..., :3].astype(int)
    white = (rgba[..., 3] > 0) & (rgb.min(2) >= 238) & ((rgb.max(2) - rgb.min(2)) < 22)
    lab, n = ndimage.label(white)
    if n:
        sizes = ndimage.sum(white, lab, range(1, n + 1))
        kill = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz >= min_px])
        kill = ndimage.binary_dilation(kill) & (rgb.min(2) > 200)
        rgba = rgba.copy()
        rgba[..., 3][kill] = 0
    return rgba


def components(rgba, axis, min_area=4000):
    """Split a sheet into separate objects along an axis (1 = left-to-right, 0 = top-to-bottom)."""
    solid = ndimage.binary_dilation(rgba[..., 3] > 0, iterations=6)
    lab, n = ndimage.label(solid)
    objs = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        if (lab[sl] == i).sum() < min_area:
            continue
        crop = rgba[sl].copy()
        crop[..., 3] = np.where(lab[sl] == i, crop[..., 3], 0)
        ys, xs = np.where(crop[..., 3] > 0)
        objs.append((sl[axis].start, crop[ys.min():ys.max() + 1, xs.min():xs.max() + 1]))
    return [o for _, o in sorted(objs, key=lambda t: t[0])]


def fit_width(rgba, world_w):
    im = Image.fromarray(rgba)
    w = world_w * PX
    h = max(1, round(im.height * w / im.width))
    return im.resize((w, h), Image.LANCZOS)


def size_prop(rgba, key):
    if key in POCKETS:
        rgba = clear_pockets(rgba)
    mode, v = PROP_SIZE[key]
    im = Image.fromarray(rgba)
    if mode == "w":
        w = v * PX; h = max(1, round(im.height * w / im.width))
    else:
        h = v * PX; w = max(1, round(im.width * h / im.height))
    im = im.resize((w, h), Image.LANCZOS)
    if key == "fence":  # one repeating section exactly one tile wide
        x0 = (im.width - TILE) // 2
        im = im.crop((x0, 0, x0 + TILE, im.height))
    return im


def facade(rgba, tiles, side):
    """Fit a facade to its footprint width; if too tall, widen a little, then cut out a repeating floor."""
    W = tiles * 16 * PX
    H0 = rgba.shape[0] * W / rgba.shape[1]
    Hmax = MAX_H[side] * PX
    stretch = min(MAX_STRETCH, max(1.0, H0 / Hmax))
    H = round(H0 / stretch)
    im = np.asarray(Image.fromarray(rgba).resize((W, H), Image.LANCZOS)).astype(np.int16)
    excess = H - Hmax
    if excess > 0:
        # remove rows [y, y+e): pick the band in the middle floors whose top and bottom rows match best
        best = None
        for e in range(excess, excess + 48, 2):
            for y in range(int(H * 0.25), int(H * 0.75) - e, 2):
                a, b = im[y:y + 6, :, :3], im[y + e:y + e + 6, :, :3]
                d = np.abs(a - b).mean()
                if best is None or d < best[0]:
                    best = (d, y, e)
        _, y, e = best
        im = np.concatenate([im[:y], im[y + e:]])
    return Image.fromarray(im.astype(np.uint8))


def seamless(rgb, size):
    """Square crop, resized, with its edges cross-faded onto the opposite side so it tiles."""
    h, w = rgb.shape[:2]
    s = min(h, w)
    sq = rgb[(h - s) // 2:(h - s) // 2 + s, (w - s) // 2:(w - s) // 2 + s]
    a = np.asarray(Image.fromarray(sq).resize((size, size), Image.LANCZOS)).astype(float)
    band = size // 8
    out = a.copy()
    ramp = np.linspace(0, 1, band)[:, None]
    # blend the last `band` rows/cols toward the first ones so the wrap is continuous
    out[-band:] = a[-band:] * (1 - ramp[:, :, None]) + a[:band][::-1] * ramp[:, :, None] * 0 + a[:band] * ramp[:, :, None]
    ramp2 = np.linspace(0, 1, band)[None, :, None]
    out[:, -band:] = out[:, -band:] * (1 - ramp2) + out[:, :band] * ramp2
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def asphalt(size, seed=7):
    """Pixel-art asphalt: dark blue-grey with a fine two-tone speckle, generated at 1/2 res for chunky pixels."""
    rng = np.random.default_rng(seed)
    n = size // 2
    base = np.array([58, 64, 78], float)
    img = np.tile(base, (n, n, 1))
    noise = rng.random((n, n))
    img[noise > 0.86] = [70, 77, 92]
    img[noise > 0.965] = [86, 93, 108]
    img[noise < 0.10] = [47, 52, 64]
    img[noise < 0.02] = [38, 42, 52]
    im = Image.fromarray(img.astype(np.uint8)).resize((size, size), Image.NEAREST)
    return im


def main():
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)

    for key, tiles in BUILDING_W.items():
        rgba = cutout(load(src, "bldg_" + key))
        im = facade(rgba, tiles, key[0])
        im.save(OUT / f"bldg_{key}.png", optimize=True)
        print("facade", key, im.size)

    # ground: sidewalk keeps its 2x2 slabs (1 slab = 1 tile); the others repeat every 4 tiles
    seamless(load(src, "ground_sidewalk"), 2 * TILE).save(OUT / "ground_sidewalk.png")
    for k in ("grass", "path", "rooftop"):
        seamless(load(src, "ground_" + k), 4 * TILE).save(OUT / f"ground_{k}.png")
    road = asphalt(4 * TILE)
    road.save(OUT / "ground_road.png")
    # centre line: double yellow through the middle of a tile row (drawn per tile, so one tile tall)
    lane = np.asarray(road.crop((0, 0, 4 * TILE, TILE))).copy()
    mid = TILE // 2
    for dy in (-10, 6):
        lane[mid + dy:mid + dy + 5] = [222, 178, 52]
        lane[mid + dy + 4:mid + dy + 5] = [176, 136, 36]
    Image.fromarray(lane).save(OUT / "ground_road_centerline.png")
    cross = np.asarray(road.crop((0, 0, 4 * TILE, TILE))).copy()
    for i in range(4):  # four thick worn white bars per tile, running along the strip
        y0 = 10 + i * 30
        bar = cross[y0:y0 + 18]
        bar[:] = [226, 226, 218]
        speck = np.random.default_rng(i).random(bar.shape[:2]) > 0.93
        bar[speck] = [180, 182, 180]
    Image.fromarray(cross).save(OUT / "ground_crosswalk.png")
    print("ground done")

    singles = {"lamp": "prop_lamp", "tree_street": "prop_tree_street", "tree_park": "prop_tree_park",
               "subway": "prop_subway_entrance"}
    for k, stem in singles.items():
        size_prop(cutout(load(src, stem)), k).save(OUT / f"prop_{k}.png")
    for stem, axis, names in (("props_small_sheet", 1, ["hydrant", "newsbox", "planter", "street_sign"]),
                              ("props_cars_sheet", 1, ["car_template", "taxi"]),
                              ("props_park_sheet", 0, ["bench", "fence", "barricade"])):
        objs = components(cutout(load(src, stem)), axis)
        if len(objs) != len(names):
            raise ValueError(f"{stem}: found {len(objs)} objects, expected {len(names)}")
        for k, o in zip(names, objs):
            size_prop(o, k).save(OUT / f"prop_{k}.png")
    print("props done")


if __name__ == "__main__":
    main()
