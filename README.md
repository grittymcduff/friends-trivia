# The One With The Trivia Game

A private, Pokémon-style pixel-art trivia adventure set in Friends' Greenwich Village. Walk the block, step into Central Perk, get quizzed by the regulars, and fill your shelf with collectibles from the show.

**Play:** open `index.html` in a browser, or turn on GitHub Pages for this repo (Settings → Pages → deploy from `main`, root folder).

## v1.0: "The One With the Leather Pants"

- **HD character art:** the game now renders at 3× resolution, and characters can use hand-made HD sprite sheets (16-bit chibi style) in place of the generated pixel people. The first three from the new art bundle are in:
  - **Joey in Everything Chandler Owns** (secret sighting in the Village) now uses his HD sprite.
  - **New secret sighting: Ross After the Leather Pants.** Sometimes when you visit Ross's apartment, he's in a long coat, no pants, legs covered in baby powder. He still runs his quiz for the leather pants, and spotting him counts as a sighting (9 in all).
  - **Ross's Leather Pants** have new HD item art on the shelf, and wearing them now gives your character shiny black leather pants.
- HD characters draw 20% larger than the old 16×24 people, anchored at their feet.
- Anyone without an HD sheet yet keeps the old look, so the game works the whole time art is being swapped in.

### Adding more HD sprites
1. Unzip the art bundle somewhere (the folder with `manifest.csv`).
2. Run `python3 tools/prep_sprites.py <bundle folder>`. It removes the white background (and any grid lines or captions), lines up the 12 frames, fixes side rows that both face the same way, and writes clean sheets to `sprites/hd/` (and items to `sprites/items/`). It lists any manifest entries whose PNG is missing.
3. Add the sheet to `HD_SPRITES` (or an item to `HD_ITEMS`) at the top of `src/game.js`, then give the character `hd:'<key>'` in its `look` in `src/maps.js`.
4. `python3 build.py`, then commit `src/`, `index.html` and `sprites/`.

HD sheets: 3 columns (frames) × 4 rows (Down, Up, Left, Right), 128×192 per cell, transparent background. They load from files, so they show on GitHub Pages; a single-file copy of `index.html` falls back to the old sprites.

## v0.9: "The One With the Mouse"

- **Click or tap to move:** click any spot and your character walks there, finding a way around buildings, furniture and people. Click a person, sign, counter, couch or locked door to walk over and interact with it. Click a door to go through it. A yellow marker shows where you're headed, and pressing any arrow key takes back control. This works with taps on phones too.

## v0.8: "The One Where Everyone Plays"

- **Wear your collectibles:** on the shelf, wearable items have a "Wear it" or "Carry it" button. There's a head slot (the turkey with sunglasses and fez, Joey's London hat, the Vegas veil, Monica's diner wig), a body slot (the Holiday Armadillo costume, Ross's leather pants) and a hand slot (umbrella, Hugsy, mug, shopping bag, Janice's purse, ping-pong paddle, hockey puck). A preview of your character sits at the top of the shelf.
- **Player profiles:** everyone who plays on the same device gets their own save. The title screen lists the three most recent players. Older single saves are moved over automatically.
- **Leaderboard** (🏅 button, L key, or from the title screen): ranks every player on the device by score and shows story items, superfan extras, sightings, correct answers and where they are. Players on other devices can press "Copy" next to their share code and text it over, and pasting it into "Add a friend's score" adds them to the board.

## v0.7: "The One With All the Stuff"

- **Set dressing:** 22 new kinds of furniture and props, and many with something to read when you interact. Highlights: Joey and Chandler's canoe, kitchen table and pizza-box tower; Monica's reading nook, sideboard and coat rack; Ross's bookshelves and desk; the office copier and filing cabinets; Bloomingdale's mirrors and shoe cases; the museum's velvet ropes, banners and info desk; studio set walls and craft services; airport luggage and a coffee kiosk; London benches and a postbox; beach umbrellas, towels, loungers, sandcastles and surfboards in Barbados and Montauk.
- The `dress()` lists at the bottom of `src/maps.js` hold all of it, so adding more is one line per item.

## v0.6: "The One With the Surprises"

- **Zoom:** the 🔍 button, or the + and − keys, switches between Far, Normal and Close. The choice is remembered.
- **8 secret sightings** that appear at random (about a 40% chance each time you enter their area): Monica in the turkey with sunglasses and a fez, Ross as the Holiday Armadillo, Joey the lost tourist, a covered "Porsche" that's really a pile of boxes, Chandler in his Thanksgiving box, Joey wearing everything Chandler owns, a PIVOT! couch emergency on Grove St, and the runaway duck in Washington Square Park.
- The shelf has a new "Secret Sightings" section that shows silhouettes and hints until you find each one. The egg list (`EGGS`) is at the bottom of `src/maps.js`; `EGG_CHANCE` sets how often they appear.

## v0.5: "The One With the Pictures"

- **22 picture questions** (175 questions in total): pixel-art scenes of places and props, like Monica's purple door, the turkey with the fez, the Holiday Armadillo, Chandler's Thanksgiving box, Mrs. Whiskerson, the Moist Maker and the Geller Cup. They're mixed into the regular decks.
- **The Photo Wall** in the upstairs hallway runs a six-photo picture round, with a bonus Polaroid as the prize.
- Picture questions use the `pic` field in `src/questions.js`. The scenes are drawn by `drawPic()` in `src/game.js`.

## v0.4: "The One for the Superfan"

- **60 superfan questions** (153 total), covering middle names, Mrs. Whiskerson, Chi-Chi, Al Zebooker, Ichiban, Mac and C.H.E.E.S.E. and much more. They're mixed into every deck, so every round is tougher.
- **Supporting characters** with superfan-only quizzes and 9 bonus collectibles: Eddie and Mr. Heckles (upstairs hallway), Jack and Judy Geller (Monica's apartment), Frank Jr. (the Village), Janice (Bloomingdale's), Richard (Central Park), Estelle (Silvercup) and Mike (Barbados). Gunther's replay round is now a superfan round too.
- Superfan extras get their own section on the shelf. They're optional, so they don't block the finale.

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

- More trips: Atlantic City, Tulsa
- HD sprites for the rest of the cast (see v1.0 above)
- Redraw the maps to match the HD character art
