#!/usr/bin/env python3
"""Build index.html from the source files in src/.

Usage: python3 build.py
Combines src/shell.html (page layout + CSS) with src/questions.js (trivia + collectibles),
src/maps.js (zones) and src/game.js (engine) into a single self-contained index.html.
"""
from pathlib import Path

root = Path(__file__).parent
src = root / "src"
out = (src / "shell.html").read_text(encoding="utf-8")
for marker, name in (("/*QUESTIONS*/", "questions.js"), ("/*MAPS*/", "maps.js"), ("/*GAME*/", "game.js")):
    out = out.replace(marker, (src / name).read_text(encoding="utf-8"))
(root / "index.html").write_text(out, encoding="utf-8")
print(f"Built index.html ({len(out):,} bytes)")
