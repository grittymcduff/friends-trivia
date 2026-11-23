#!/usr/bin/env python3
"""Build the HD interior art (furniture, floors, walls, cars, collectibles) from the generated images.

Usage:
    python3 -I tools/prep_interiors.py <folder with the generated images>

Most inputs are 2x2 sheets of four objects on white (sheet_*.png). Each quadrant becomes one sprite,
sized to the world width/height listed in SHEETS, at 8 px per world pixel (one tile = 128 px).
Objects painted solid magenta are recolour templates: the game repaints the magenta per object.
Floors and walls are made seamless; the plainer textures (carpet, tiles, concrete...) are generated here.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
from prep_village import PX, TILE, cutout, clear_pockets, seamless  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "sprites" / "interior"

# sheet -> four (name, ("w"|"h", world px), pockets) in reading order: top-left, top-right, bottom-left, bottom-right
S = lambda n, m, v, p=False: (n, (m, v), p)
SHEETS = {
    "sheet_cafe": [S("chair", "h", 22, True), S("table", "w", 18, True), S("armchair", "w", 22), S("coffee", "w", 32)],
    "sheet_living": [S("bookshelf", "w", 18), S("coatrack", "h", 32, True), S("floorlamp", "h", 32), S("sidetable", "h", 18)],
    "sheet_kitchen": [S("fridge", "h", 32), S("stove", "h", 24), S("plant", "h", 24), S("trash", "h", 14)],
    "sheet_den": [S("tv", "w", 28), S("foosball", "w", 32, True), S("dogstatue", "h", 28), S("recliner", "w", 22)],
    "sheet_bedbath": [S("bed", "w", 32), S("bathtub", "w", 32, True), S("toilet", "h", 20), S("sink", "h", 28, True)],
    "sheet_sofa": [S("couch_t", "w", 48), S("armchair_t", "w", 22), S("entertain", "w", 30), S("stool_t", "h", 14, True)],
    "sheet_rugs": [S("rug_ornate_t", "w", 64), S("rug_geo_t", "w", 64), S("dining", "w", 44, True), S("nightstand", "h", 18)],
    "sheet_storage": [S("canoe", "w", 48), S("boxes", "h", 22), S("trunk", "w", 18), S("dinoskull", "h", 22)],
    "sheet_diner": [S("booth", "w", 32), S("dinertable", "h", 22, True), S("mic", "h", 26, True), S("jukebox", "h", 30)],
    "sheet_office": [S("cubicle", "w", 32), S("copier", "w", 20), S("cooler", "h", 26), S("mannequin", "h", 28, True)],
    "sheet_store": [S("mirror", "h", 32, True), S("case", "w", 18), S("rack_t", "w", 32, True), S("stanchion", "w", 16, True)],
    "sheet_studio": [S("camera", "h", 30, True), S("stagelight", "h", 32, True), S("hospbed", "w", 32, True), S("seats", "w", 48, True)],
    "sheet_gate": [S("gatedesk", "w", 32, True), S("luggage_t", "h", 18, True), S("window", "w", 32), S("frame", "w", 16)],
    "sheet_beach": [S("palm", "h", 48), S("umbrella_t", "w", 32, True), S("lounger", "w", 18, True), S("surfboard_t", "h", 34)],
    "sheet_beach2": [S("icebox", "w", 14), S("sandcastle", "w", 18), S("towel_t", "w", 32), S("grill", "h", 20, True)],
    "sheet_hall": [S("walldoor", "h", 36), S("splat", "w", 24), S("wreath", "w", 10, True), S("menu", "w", 32)],
    "sheet_counter": [S("perkcounter", "w", 64), S("pingpong", "w", 32, True), S("kcounter_t", "w", 48), S("bigwindow", "w", 48, True)],
    "sheet_london": [S("bus", "w", 48), S("cab", "w", 30), S("phonebox", "h", 34), S("postbox", "h", 26)],
    "sheet_office2": [],
    "sheet_ralph": [S("desk", "w", 32), S("officechair", "h", 24, True), S("drapewindow", "w", 48), S("moodboard", "h", 30, True)],
    "sheet_rotunda": [S("column", "h", 56), S("rockmound", "w", 96), S("mural", "w", 64), S("flag", "h", 30, True)],
    "sheet_moondance": [S("dinercounter", "w", 64), S("dinerstool_t", "h", 15, True), S("dinertable4", "w", 40), S("pastrycase", "w", 24)],
    "sheet_moondance2": [S("backcounter", "w", 56), S("menuboard", "w", 48), S("wallclock", "w", 12, True), S("phone", "w", 12)],
    # facing variants: backs (seen from behind) and side views (all side views face right; the game mirrors them)
    "sheet_backs": [S("couch_back_t", "w", 48), S("armchair_back_t", "w", 22), S("tv_back", "w", 28), S("recliner_back", "w", 22)],
    "sheet_sides": [S("entertain_front2", "w", 26), S("armchair_side_t", "w", 22), S("chair_side", "h", 22, True), S("recliner_side_3q", "w", 28)],
    # strict side profiles (only the side is visible): the TV cabinet against a side wall, and recliners facing it
    "sheet_profile": [S("entside", "h", 44), S("entside_alt", "h", 44), S("recliner_side", "w", 28), S("recliner_side_alt", "w", 28)],
    "sheet_cars": [S("car_wagon_t", "w", 36), S("car_van_t", "w", 36), S("car_compact_t", "w", 30), S("car_taxi90", "w", 36)],
    "sheet_collect": [S("grantaxi", "w", 36), S("cheesecake", "w", 18), S("trifle", "w", 16), S("cheeseslice", "w", 14)],
    "sheet_moist": [S("sandwich", "w", 16), S("sandwich_wrapped", "w", 16), S("officefridge", "h", 30), S("bowtie", "w", 16)],
}
HALVES = {"sheet_landmarks": [S("dino", "w", 96, True), S("clocktower", "h", 104)],
          "sheet_wallside": [S("entside_3q", "h", 44), S("bookshelf_side_unused", "h", 34)]}


def load(src, stem):
    for ext in (".png", ".jpg", ".jpeg"):
        p = src / (stem + ext)
        if p.exists():
            return np.asarray(Image.open(p).convert("RGB")).astype(np.uint8)
    raise FileNotFoundError(stem)


def bg_alpha(rgb, tol=232):
    """Alpha for a whole sheet: white connected to the border is background."""
    white = (rgb.min(2) >= tol) & ((rgb.max(2) - rgb.min(2)) < 30)
    lab, _ = ndimage.label(white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    halo = ndimage.binary_dilation(bg, iterations=2) & ~bg & (rgb.min(2) > 205)
    return np.where(bg | halo, 0, 255).astype(np.uint8)


def split(rgb, cols, rows):
    """Cut a sheet into cols x rows cells by the centre of each object, merging pieces in the same cell."""
    a = bg_alpha(rgb)
    H, W = a.shape
    lab, n = ndimage.label(ndimage.binary_dilation(a > 0, iterations=3))
    cells = {}
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        m = lab[sl] == i
        if m.sum() < 600:
            continue
        ys, xs = np.nonzero(m)
        cy, cx = sl[0].start + ys.mean(), sl[1].start + xs.mean()
        key = (min(rows - 1, int(cy / H * rows)), min(cols - 1, int(cx / W * cols)))
        cells.setdefault(key, np.zeros_like(a, bool))[sl] |= m
    out = []
    for r in range(rows):
        for c in range(cols):
            m = cells.get((r, c))
            if m is None:
                raise ValueError(f"empty cell {r},{c}")
            al = np.where(m, a, 0)
            ys, xs = np.nonzero(al)
            crop = np.dstack([rgb, al])[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            out.append(crop)
    return out


def size(rgba, spec, pockets):
    if pockets:
        rgba = clear_pockets(rgba)
    mode, v = spec
    im = Image.fromarray(rgba)
    if mode == "w":
        w = v * PX; h = max(1, round(im.height * w / im.width))
    else:
        h = v * PX; w = max(1, round(im.width * h / im.height))
    return im.resize((w, h), Image.LANCZOS)


# ---------------- textures ----------------
def px_noise(size, base, speck, seed, chunk=4):
    """Chunky pixel noise texture."""
    rng = np.random.default_rng(seed)
    n = size // chunk
    img = np.tile(np.array(base, float), (n, n, 1))
    r = rng.random((n, n))
    for thr, col in speck:
        img[(r > thr) if thr > 0 else (r < -thr)] = col
    return Image.fromarray(img.astype(np.uint8)).resize((size, size), Image.NEAREST)


def checker(size, a, b, cells, grout=None, gw=3):
    img = np.zeros((size, size, 3), np.uint8)
    s = size // cells
    for j in range(cells):
        for i in range(cells):
            img[j * s:(j + 1) * s, i * s:(i + 1) * s] = a if (i + j) % 2 == 0 else b
    if grout is not None:
        for k in range(cells + 1):
            img[max(0, k * s - gw // 2):k * s + gw // 2 + 1] = grout
            img[:, max(0, k * s - gw // 2):k * s + gw // 2 + 1] = grout
    return img


def shade_tiles(img, seed):
    """Subtle per-pixel noise so flat generated tiles read as painted."""
    rng = np.random.default_rng(seed)
    n = rng.normal(0, 4, img.shape[:2])[..., None]
    n = np.asarray(Image.fromarray(((n - n.min()) / (np.ptp(n) + 1e-6) * 255).astype(np.uint8)[..., 0])
                   .resize((img.shape[1] // 4, img.shape[0] // 4)).resize((img.shape[1], img.shape[0]), Image.NEAREST))
    return np.clip(img.astype(float) + (n[..., None] / 255 - .5) * 14, 0, 255).astype(np.uint8)


def tint(img, rgb, keep=0.35):
    """Recolour a light texture toward rgb, keeping its shading."""
    a = np.asarray(img).astype(float)
    lum = a.mean(2, keepdims=True) / a.mean()
    col = np.array(rgb, float)[None, None] * lum
    return Image.fromarray(np.clip(col * (1 - keep) + a * keep * np.array(rgb) / a.reshape(-1, 3).mean(0), 0, 255).astype(np.uint8))


def textures(src):
    T4 = 4 * TILE
    for k in ("wood", "marble", "sand", "water"):
        seamless(load(src, "floor_" + k), T4).save(OUT / f"floor_{k}.png")
    marble = np.asarray(Image.open(OUT / "floor_marble.png").convert("RGB")).astype(float)
    # museum rotunda: alternating light and dark marble slabs (one slab per tile)
    dark = marble * np.array([.42, .40, .42])
    rot = marble.copy()
    for j in range(4):
        for i in range(4):
            if (i + j) % 2:
                rot[j * TILE:(j + 1) * TILE, i * TILE:(i + 1) * TILE] = dark[j * TILE:(j + 1) * TILE, i * TILE:(i + 1) * TILE]
    Image.fromarray(rot.astype(np.uint8)).save(OUT / "floor_rotunda.png")
    seamless(load(src, "wall_brick"), T4).save(OUT / "wall_brick.png")

    # plaster (top) + wainscot (bottom) from one image
    pw = load(src, "wall_plaster_wains")
    h = pw.shape[0]
    split_y = int(h * 0.62)
    sub = pw[: int(h * 0.55)]
    plaster = seamless(sub, T4)
    plaster.save(OUT / "wall_plaster.png")
    for name, rgb in (("peach", (236, 196, 150)), ("lavender", (150, 130, 196)), ("sage", (190, 200, 168))):
        tint(plaster, rgb).save(OUT / f"wall_plaster_{name}.png")
    wains = pw[split_y + 4:]
    wi = Image.fromarray(wains).resize((T4, TILE), Image.LANCZOS)
    w = np.asarray(wi).astype(float)
    band = TILE // 4   # cross-fade the ends so the strip repeats horizontally
    ramp = np.linspace(0, 1, band)[None, :, None]
    w[:, -band:] = w[:, -band:] * (1 - ramp) + w[:, :band] * ramp
    Image.fromarray(w.astype(np.uint8)).save(OUT / "wall_wains.png")

    # generated floors
    px_noise(T4, (92, 108, 128), [(.8, (84, 99, 118)), (.94, (104, 120, 140)), (-.08, (78, 92, 110))], 1).save(OUT / "floor_carpet.png")
    px_noise(T4, (152, 120, 104), [(.82, (140, 110, 96)), (.95, (166, 134, 118)), (-.06, (128, 100, 88))], 2).save(OUT / "floor_carpet_rose.png")
    px_noise(T4, (138, 138, 142), [(.8, (126, 126, 132)), (.95, (152, 152, 156)), (-.05, (112, 112, 118))], 3).save(OUT / "floor_conc.png")
    # hallway: grey-mauve painted floor from the photo
    px_noise(T4, (150, 134, 140), [(.84, (142, 126, 132)), (.96, (162, 146, 152)), (-.05, (134, 118, 124))], 4).save(OUT / "floor_hall.png")
    Image.fromarray(shade_tiles(checker(T4, (238, 232, 218), (204, 196, 178), 8, (176, 168, 150), 4), 5)).save(OUT / "floor_tileK.png")
    Image.fromarray(shade_tiles(checker(T4, (236, 232, 224), (40, 40, 46), 8, (90, 90, 96), 2), 6)).save(OUT / "floor_tileD.png")
    # bathroom: small white hex-ish tiles
    Image.fromarray(shade_tiles(checker(T4, (240, 240, 236), (226, 228, 226), 16, (190, 192, 190), 3), 7)).save(OUT / "floor_bath.png")
    # stairs: one tile, horizontal treads
    st = np.zeros((TILE, TILE, 3), np.uint8)
    for i in range(4):
        y = i * 32
        st[y:y + 32] = np.array([138, 106, 74]) * (1 - i * .07)
        st[y:y + 5] = [168, 134, 96]
        st[y + 28:y + 32] = [92, 68, 46]
    st[:, :12] = [59, 42, 34]; st[:, -12:] = [59, 42, 34]
    Image.fromarray(st).save(OUT / "floor_stairs.png")
    # Moondance Diner: navy and cream checkered wall tiles, a solid navy tile band, blue patterned floor
    Image.fromarray(shade_tiles(checker(T4, (34, 52, 128), (226, 224, 212), 16, (150, 150, 160), 2), 8)).save(OUT / "wall_tile_blue.png")
    nv = checker(T4, (30, 46, 116), (38, 58, 140), 16, (16, 24, 60), 2)
    Image.fromarray(shade_tiles(nv, 9)[:TILE]).save(OUT / "wall_tile_navy.png")
    t = 64
    yy, xx = np.mgrid[0:t, 0:t]
    cell = np.zeros((t, t, 3), float) + (224, 226, 238)
    for cy, cx in ((0, 0), (0, t), (t, 0), (t, t)):
        d = np.hypot(yy - cy, xx - cx)
        cell[(d > 19) & (d < 23)] = (138, 150, 214)
        cell[d < 6] = (104, 116, 198)
    dm = np.abs(xx - t / 2) + np.abs(yy - t / 2)
    cell[(dm > 10) & (dm < 13)] = (164, 172, 224)
    cell[dm < 4] = (104, 116, 198)
    cell[:2] = cell[:, :2] = (170, 172, 186)
    floor = np.tile(cell, (T4 // t, T4 // t, 1)).astype(np.uint8)
    Image.fromarray(shade_tiles(floor, 10)).save(OUT / "floor_moroccan.png")
    print("textures done")


def chars(src):
    """Gemini character sheets are already 3 columns x 4 rows (down, up, left, right); cut evenly."""
    for name in ("eddie", "usher", "duck_hd", "marcel"):
        stem = "char_" + ("duck" if name == "duck_hd" else name)
        rgb = load(src, stem)
        a = bg_alpha(rgb)
        rgba = np.dstack([rgb, a])
        H, W = a.shape
        # find row/column bands by the empty gaps between figures
        def bands(prof, n):
            occ = prof > 0
            runs, s = [], None
            for i, v in enumerate(occ):
                if v and s is None: s = i
                if not v and s is not None:
                    runs.append((s, i)); s = None
            if s is not None: runs.append((s, len(occ)))
            runs = [r for r in runs if r[1] - r[0] > 12]
            while len(runs) > n:   # merge the closest pair
                gaps = [runs[i + 1][0] - runs[i][1] for i in range(len(runs) - 1)]
                i = int(np.argmin(gaps)); runs[i:i + 2] = [(runs[i][0], runs[i + 1][1])]
            if len(runs) != n:
                step = len(prof) / n
                runs = [(int(i * step), int((i + 1) * step)) for i in range(n)]
            return runs
        rows = bands((a > 0).sum(1), 4)
        frames = []
        for (y0, y1) in rows:
            cols = bands((a[y0:y1] > 0).sum(0), 3)
            frames.append([rgba[y0:y1, x0:x1] for x0, x1 in cols])
        # normalise into 176x192 cells, feet on a common baseline, same scale for every frame
        tall = max(f.shape[0] for r in frames for f in r)
        target_h = 150 if name != "duck_hd" and name != "marcel" else 104
        sc = target_h / tall
        sheet = Image.new("RGBA", (176 * 3, 192 * 4), (0, 0, 0, 0))
        for r, row in enumerate(frames):
            for c, f in enumerate(row):
                ys, xs = np.nonzero(f[..., 3])
                f = f[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
                im = Image.fromarray(f)
                im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
                sheet.alpha_composite(im, (c * 176 + (176 - im.width) // 2, r * 192 + 186 - im.height))
        # the generator faces its side rows inconsistently; the right-facing row is reliable, so the
        # left-facing row is its mirror image
        right = sheet.crop((0, 576, 528, 768))
        left = Image.new("RGBA", right.size, (0, 0, 0, 0))
        for c in range(3):
            left.paste(right.crop((c * 176, 0, (c + 1) * 176, 192)).transpose(Image.FLIP_LEFT_RIGHT), (c * 176, 0))
        sheet.paste(left, (0, 384))
        if name == "marcel":   # collectible icon: first front-facing frame
            f = sheet.crop((0, 0, 176, 192)); f = f.crop(f.getbbox())
            icon = Image.new("RGBA", (max(f.size),) * 2, (0, 0, 0, 0)); icon.alpha_composite(f, ((icon.width - f.width) // 2, icon.height - f.height))
            icon.resize((128, 128), Image.LANCZOS).save(OUT / "marcel_icon.png")
        dst = OUT.parent / "hd" / f"{name}.png"
        sheet.save(dst, optimize=True)
        print("char", name, sheet.size)


def main():
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    for stem, specs in SHEETS.items():
        if not specs:
            continue
        cells = split(load(src, stem), 2, 2)
        for (name, spec, pockets), cell in zip(specs, cells):
            im = size(cell, spec, pockets)
            im.save(OUT / f"{name}.png", optimize=True)
    for stem, specs in HALVES.items():
        cells = split(load(src, stem), 2, 1)
        for (name, spec, pockets), cell in zip(specs, cells):
            size(cell, spec, pockets).save(OUT / f"{name}.png", optimize=True)
    # the TV cabinet profile comes with a tall side panel next to it; keep only the TV on its low stand
    e = Image.open(OUT / "entside.png"); a = np.asarray(e)[..., 3] > 0
    cols = a.sum(0); w = e.width; lo, hi = int(w * .3), int(w * .7)
    cut = lo + int(np.argmin(cols[lo:hi]))
    e = e.crop((cut, 0, w, e.height)); e = e.crop(e.getbbox())
    e = e.resize((round(e.width * 34 * PX / e.height), 34 * PX), Image.LANCZOS); e.save(OUT / "entside.png", optimize=True)
    print("props done")
    textures(src)
    chars(src)


if __name__ == "__main__":
    main()
