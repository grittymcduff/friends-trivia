#!/usr/bin/env python3
"""Remove the soft halo baked around the floor lamp's shade (v2.0.3).

The halo is opaque cream outside the shade's brown outline, so it is flood-filled away from the
transparent edge through light pixels; the outline stops the fill, keeping the shade itself.
Usage: python3 tools/fix_lamp_glow.py sprites/interior/floorlamp.png
"""
import sys
from collections import deque
from PIL import Image

p = sys.argv[1]
im = Image.open(p).convert('RGBA')
W, H = im.size
px = im.load()
light = lambda c: c[3] > 0 and min(c[:3]) > 150 and max(c[:3]) - min(c[:3]) < 110
seen = [[False] * H for _ in range(W)]
q = deque((x, y) for x in range(W) for y in range(H) if px[x, y][3] < 40)
for x, y in q:
    seen[x][y] = True
n = 0
while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < W and 0 <= ny < H and not seen[nx][ny]:
            seen[nx][ny] = True
            c = px[nx, ny]
            if c[3] < 40 or light(c):
                if c[3]:
                    px[nx, ny] = (0, 0, 0, 0); n += 1
                q.append((nx, ny))
for x in range(W):
    for y in range(H):
        if 0 < px[x, y][3] < 90:
            px[x, y] = (0, 0, 0, 0)   # the halo's faint outer ring
im.save(p, optimize=True)
print('cleared', n)
