# The One With The Trivia Game

A private, Pokémon-style pixel-art trivia adventure set in Friends' Greenwich Village. Walk the block, step into Central Perk, get quizzed by the regulars, and fill your shelf with collectibles from the show.

**Play:** open `index.html` in a browser, or turn on GitHub Pages for this repo (Settings → Pages → deploy from `main`, root folder).

## v0.3: "The One With the Whole City"

- **The subway:** the entrance at Bleecker St (and in every neighborhood) opens a subway map: Greenwich Village, SoHo, Midtown, Uptown, Queens and, once you have 10 collectibles, the AirTrain to JFK.
- **Midtown:** Chandler's office (9 West 57th), Bloomingdale's, Riff's, Ralph Lauren, Saks, the Plaza, the Pierre, Madison Square Garden and Times Square.
- **SoHo:** the Moondance Diner, Fortuna Fashions, Alessandro's and Iridium.
- **Uptown:** the Museum of Prehistoric History and the Central Park fountain.
- **Queens:** Silvercup Studios and the Days of Our Lives set, on the East River.
- **Ross's apartment:** across the street from Monica's (yes, that apartment).
- **JFK Airport and four trips:** London, Las Vegas, Barbados and Montauk.
- **22 collectibles** in all, ending with the Key to Apartment 20 in a finale on the orange couch with all six friends, followed by credits.
- **93 questions**, plus original background music for each kind of area (press M or the speaker button to mute).

### Adding a personal message
Open `src/questions.js`, scroll to `PERSONAL_NOTE`, and type a message between the quotes. It appears on the credits screen after the finale. `MADE_BY` is the sign-off line under it.

## v0.2: "The One Upstairs"

- **New:** the upstairs hallway, **Monica's apartment (20)** and **Joey & Chandler's (19)**, entered through the stoop door next to Central Perk.
- **New cast:** Monica (kitchen), Ross (running the Apartment Quiz), Joey, Chandler, plus the duck and the chick.
- **New collectibles:** the Geller Cup (Monica), the Yellow Peephole Frame (Ross's Apartment Quiz), Hugsy (Joey) and the White Dog Statue (Chandler). 8 of 12 are now earnable.
- **24 new questions** (69 total) for the Monica, Chandler and Joey decks.
- **Redrawn characters:** feminine and masculine builds, lashes, skirts and dresses, a bob haircut, and long hair that frames the face instead of reading as a beard. These options are on the title screen too.

## v0.1: "The Central Perk Slice"

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

## Ideas for later

- Picture questions ("Which apartment is this?")
- More trips: Atlantic City, Tulsa
- Hand-drawn sprites for the cast (see above)
