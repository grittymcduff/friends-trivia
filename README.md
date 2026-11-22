# The One With The Trivia Game

A private, Pokémon-style pixel-art trivia adventure set in Friends' Greenwich Village. Walk the block, step into Central Perk, get quizzed by the regulars, and fill your shelf with collectibles from the show.

**Play:** open `index.html` in a browser, or turn on GitHub Pages for this repo (Settings → Pages → deploy from `main`, root folder).

## What's in this build (v0.1, "The Central Perk Slice")

- **Greenwich Village block:** Grove St and Bedford St, with Central Perk, Monica's building (stoop and purple door), the building across the street, the Lucille Lortel, Village Cigars, Phoebe's building, the Bleecker St subway entrance, and the edge of Washington Square Park. Taxis drive (and honk if you're in the way), and strangers wander the sidewalks.
- **Central Perk interior:** the counter (with Gunther), the orange couch, armchairs, tables, Phoebe's corner, and customers.
- **Trivia:** 45 questions in decks (Central Perk, Rachel, Phoebe, everyone). Strangers with a white **?** ask one quick question.
- **Collectibles (4 of 12 earnable now):** the Giant Coffee Mug (Gunther), Rachel's Trifle (Rachel), Phoebe's Creepy Painting (Phoebe), and the Thanksgiving Turkey (sit on the couch for the Couch Challenge). The other 8 show as silhouettes with hints for future zones.
- Auto-save in the browser, keyboard, mouse and touch controls (works on phones in landscape).

## How the code is organized

The game ships as one self-contained `index.html`. Edit the files in `src/`, then rebuild:

| File | What it holds |
|---|---|
| `src/shell.html` | Page layout, overlays (HUD, dialogue, trivia, shelf, title) and all CSS |
| `src/questions.js` | The trivia bank (`QB`) and the collectibles list (`ITEMS`) |
| `src/maps.js` | Zones: ground tiles, buildings, props, doors, signs, NPCs and their lines |
| `src/game.js` | Engine: pixel art generators, movement, NPCs, taxis, dialogue, trivia, shelf, saving |
| `build.py` | Combines the four files into `index.html` |

```
python3 build.py
```

Always commit both the changed `src/` files and the rebuilt `index.html`.

## Rules for changes

- **Append** new questions to the end of `QB`. The save file tracks seen questions by position.
- Keep collectible `id`s stable; saves store earned items by id.
- Keep the save key (`friendsTrivia_v1`) and add new save fields with defaults.
- The first answer in each question's `a` list is the correct one. Answers are shuffled when shown.

## Adding your own character art

Cast members currently use generic placeholder sprites with name tags. To swap in your own art:

1. Draw a sprite sheet per character: **3 columns** (standing, step A, step B) × **4 rows** (facing down, left, right, up), each frame **16×24 px**, transparent background. Piskel or Aseprite both work well.
2. Save it as e.g. `sprites/gunther.png` next to `index.html`.
3. In `src/game.js`, list it in `SPRITE_FILES`, keyed by the NPC id from `maps.js` (`gunther`, `rachel`, `phoebe`, …):
   ```js
   const SPRITE_FILES = { gunther:'sprites/gunther.png' };
   ```
4. Rebuild. (Custom sprites load from files, so they work on GitHub Pages but not when the page is opened from a single-file copy.)

## Roadmap

1. Monica's apartment (20) and Joey & Chandler's (19): peephole frame, Geller Cup, dog statue, Hugsy
2. The subway as fast travel: SoHo, Midtown, Uptown, Queens
3. Ross's apartment, the Museum, Silvercup Studios
4. Airports and "postcard" trips (London, Vegas, Barbados, Montauk)
