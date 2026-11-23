#!/usr/bin/env python3
"""HD fronts for the streets outside the Village, made from the Village facades.

Each building is one or more Village facades, side by side, stretched to the building's width and
recoloured (hue / saturation / brightness), so every street gets HD fronts in the same style.
Writes sprites/village/bldg_x_<name>.png and prints the door positions and sign spots the map needs.

Usage: python3 -I tools/prep_streets.py
"""
from pathlib import Path
import json

import numpy as np
from PIL import Image

V = Path(__file__).resolve().parent.parent / "sprites" / "village"
PX = 8
# facade -> (width in tiles, door x, sign (signLift, signCx, signW) or None)
LIB = {
    "n1_brownstone": (6, 3, None), "n2_brick": (6, 2, None), "n3_central_perk": (8, 3, (46, 47, 84)),
    "n4_brick_ross": (8, 4, None), "n5_brownstone": (6, 2, None), "n6_rays_pizza": (6, 2, (44, 48, 56)),
    "s1_lucille_lortel": (8, 4, (54, 63, 80)), "s2_brownstone": (6, 3, None), "s3_village_cigars": (6, 3, (40, 60, 52)),
    "s4_brick_phoebe": (8, 3, None), "s5_brownstone_wide": (12, 5, None),
}
# name: (width in tiles, [facades left to right], (hue shift deg, saturation x, brightness x), index of the facade holding the main door)
BUILDINGS = {
    # Midtown, north side
    "mid_57th":      (8,  ["n4_brick_ross"], (0, .25, .95), 0),
    "mid_riffs":     (6,  ["s3_village_cigars"], (0, 1, 1), 0),
    "mid_bloomies":  (12, ["n3_central_perk"], (0, .15, 1.15), 0),
    "mid_ralph":     (8,  ["n3_central_perk"], (180, .55, .8), 0),
    "mid_saks":      (8,  ["n3_central_perk"], (0, .1, 1.2), 0),
    "mid_apt":       (6,  ["n1_brownstone"], (0, 1, 1), 0),
    # Midtown, south side
    "mid_plaza":     (12, ["s5_brownstone_wide"], (0, .2, 1.3), 0),
    "mid_pierre":    (8,  ["n4_brick_ross"], (0, .2, 1.1), 0),
    "mid_msg":       (14, ["s1_lucille_lortel"], (0, 1, 1), 0),
    "mid_times":     (12, ["s1_lucille_lortel"], (290, 1.4, 1.1), 0),
    # SoHo
    "soho_moondance":(8,  ["n3_central_perk"], (200, 1, 1), 0),
    "soho_fortuna":  (8,  ["n6_rays_pizza"], (250, .8, 1.05), 0),
    "soho_alessandro":(7, ["s3_village_cigars"], (110, .8, .95), 0),
    "soho_loft":     (7,  ["n2_brick"], (0, 1, 1), 0),
    "soho_iridium":  (10, ["s1_lucille_lortel"], (190, .6, .8), 0),
    "soho_castiron": (10, ["s5_brownstone_wide"], (0, .3, 1.25), 0),
    "soho_gallery":  (8,  ["s4_brick_phoebe"], (25, .9, 1), 0),
    "soho_house1":   (10, ["n4_brick_ross"], (0, .6, 1.15), 0),
    "soho_house2":   (10, ["s4_brick_phoebe"], (0, .5, .9), 0),
    # Uptown
    "up_museum":     (20, ["s2_brownstone", "s1_lucille_lortel", "s2_brownstone"], (0, .15, 1.35), 1),
    "up_brownstone": (8,  ["n5_brownstone"], (0, 1, 1), 0),
    "up_deli":       (12, ["n6_rays_pizza", "s2_brownstone"], (0, .9, 1.05), 0),
    # Queens
    "q_silvercup":   (22, ["s4_brick_phoebe", "n4_brick_ross", "n2_brick"], (0, .8, .95), 1),
    "q_warehouse":   (14, ["s5_brownstone_wide"], (0, .2, .75), 0),
    # Las Vegas
    "vegas_chapel":  (9,  ["s1_lucille_lortel"], (300, 1.3, 1.2), 0),
    "vegas_caesars": (12, ["n3_central_perk"], (40, .5, 1.25), 0),
}


def recolor(im, hue, sat, val):
    a = np.asarray(im.convert("RGBA")).copy()
    hsv = np.asarray(Image.fromarray(a[..., :3]).convert("HSV")).astype(float)
    hsv[..., 0] = (hsv[..., 0] + hue / 360 * 255) % 255
    hsv[..., 1] = np.clip(hsv[..., 1] * sat, 0, 255)
    hsv[..., 2] = np.clip(hsv[..., 2] * val, 0, 255)
    rgb = np.asarray(Image.fromarray(hsv.astype(np.uint8), "HSV").convert("RGB"))
    return Image.fromarray(np.dstack([rgb, a[..., 3]]))


def main():
    meta = {}
    for name, (w, parts, (hue, sat, val), main_i) in BUILDINGS.items():
        ims = [Image.open(V / f"bldg_{p}.png").convert("RGBA") for p in parts]
        base_w = sum(LIB[p][0] for p in parts)
        sx = w / base_w                      # horizontal stretch to the building's width
        H = max(i.height for i in ims)
        canvas = Image.new("RGBA", (round(w * 16 * PX), H), (0, 0, 0, 0))
        x = 0.0
        doors, sign = [], None
        for i, (p, im) in enumerate(zip(parts, ims)):
            tw = LIB[p][0] * sx
            piece = im.resize((round(tw * 16 * PX), im.height), Image.LANCZOS)
            canvas.alpha_composite(piece, (round(x * 16 * PX), H - im.height))
            doors.append(round(x + LIB[p][1] * sx))
            if LIB[p][2] and sign is None:
                lift, cx, sw = LIB[p][2]
                sign = [lift, round(x * 16 + cx * sx), round(sw * sx)]
            x += tw
        recolor(canvas, hue, sat, val).save(V / f"bldg_x_{name}.png", optimize=True)
        meta[name] = {"door": doors[main_i], "doors": doors, "sign": sign}
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
