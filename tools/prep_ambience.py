#!/usr/bin/env python3
"""Turn the ElevenLabs ambience clips into game-ready files in sounds/ (v2.0.9).

Every clip is brought to the same loudness (-26 LUFS) so the game can mix them with one setting.
Background loops get their tail crossfaded into their head (1.5 s) so they repeat without a seam;
one-shots (the subway train, the church bell) are only levelled and given short fades.

Usage: python3 -I tools/prep_ambience.py <folder with the uploads>
"""
import subprocess, sys, tempfile, os
from pathlib import Path
import numpy as np

OUT = Path(__file__).resolve().parent.parent / "sounds"
SR = 44100
# game name: (file name fragment, loop?)
CLIPS = {
    "street":   ("New_York_City_street", True),
    "busy":     ("Busy_New_York_City", True),
    "city":     ("modern_city_ambient", True),
    "coffee":   ("busy_coffeeshop", True),
    "diner":    ("ambient_diner_noise", True),
    "public":   ("A_realistic_ambience", True),
    "terminal": ("Realistic_ambient_so", True),
    "subway":   ("Realistic_NYC_subway", False),
    "bell":     ("distant_church_bel", False),
}


def run(*a):
    subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main(src):
    OUT.mkdir(exist_ok=True)
    files = list(Path(src).glob("*.mp3"))
    with tempfile.TemporaryDirectory() as td:
        for name, (frag, loop) in CLIPS.items():
            f = next(p for p in files if frag in p.name)
            raw = os.path.join(td, name + ".f32")
            run("ffmpeg", "-y", "-i", str(f), "-af", "loudnorm=I=-26:TP=-3:LRA=11", "-ar", str(SR), "-ac", "2", "-f", "f32le", raw)
            x = np.fromfile(raw, dtype=np.float32).reshape(-1, 2)
            if loop:
                F = int(1.5 * SR)
                ramp = np.linspace(0, 1, F)[:, None]
                head = x[:F] * ramp + x[-F:] * (1 - ramp)     # the end flows into the start
                x = np.concatenate([head, x[F:-F]])
            else:
                F = int(.25 * SR)
                x[:F] *= np.linspace(0, 1, F)[:, None]
                x[-F * 2:] *= np.linspace(1, 0, F * 2)[:, None]
            x.astype(np.float32).tofile(raw)
            out = OUT / f"amb_{name}.mp3"
            run("ffmpeg", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-c:a", "libmp3lame", "-b:a", "112k", str(out))
            print(name, f"{len(x)/SR:.1f}s", out.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main(sys.argv[1])
