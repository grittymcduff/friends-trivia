# The One With The Trivia Game

A private, Pokémon-style pixel-art trivia adventure set in Friends' Greenwich Village. Walk the block, step into Central Perk, get quizzed by the regulars, and fill your shelf with collectibles from the show.

**Play:** open `index.html` in a browser, or turn on GitHub Pages for this repo (Settings → Pages → deploy from `main`, root folder).

## v1.7.1: HD street fronts everywhere (stopgap)

- Midtown, SoHo, Uptown, Queens and Las Vegas now use HD building fronts made from the Village art: the same facades, recoloured, stretched to each building's width, or set side by side. Doors line up with the art, and shop names sit on the sign boards (or on a small plate where the front has none).
- `tools/prep_streets.py` builds them. Dedicated fronts for Bloomingdale's, MSG, the museum and the rest can be generated later with the same brief as the Village.

## v1.7: "The One Where Everything Faces the Right Way"

- **The Moondance Diner, from the 3D render:** navy and cream checkered walls, the blue patterned floor, the long navy counter with chrome stripes and red, black, navy and yellow stools, the back counter with the espresso machines, the pastry case, the rotary phone, the menu boards, the gingham clock, and white tables with blue chairs.
- **Cars drive the right way:** the wagons, minivans, compacts and '90s cabs were drawn facing the opposite way from the sedan, so they drove backwards. They now face where they're going.
- **Furniture faces the room:** new back and side views. Café chairs face their tables, side armchairs face the couches, Ross's TV sits across from his couch, and Phoebe's pink armchair faces hers. In Joey & Chandler's, the TV sits sideways against the bedroom wall and both recliners face it in profile.
- **Furniture stands against the walls:** beds, desks, dressers, bookshelves, counters, fridges and mirrors sit against a wall, and pieces beside a side wall sit flush against it instead of overlapping it.

## v1.6: "The One With All the Rooms"

- **Every interior and trip destination is HD now:** new hand-drawn floors and walls (wood, marble, tile, carpet, plaster over wainscot, brick), plus furniture and props for every room, beach, and London. Couches, counters, rugs, racks, towels, umbrellas and luggage are painted in each piece's own colour.
- **Rooms rebuilt from the floor plans:**
  - Monica's has the bathroom, kitchen, living room under the arched window, and Monica's and Rachel's bedrooms.
  - Joey & Chandler's has the recliners facing the entertainment unit, the kitchen island, the foosball table, and both bedrooms.
  - Ross's has two bedrooms, the galley kitchen and the round dining table.
  - Central Perk has the counter on the left, the orange couch on the big rug at the front, the red couch at the back, the window nook, the restrooms and the back stairs.
- **New places:** Phoebe's apartment (her building's door in the Village now opens), and Rachel's office at Ralph Lauren in Midtown, with Tag.
- **The hallway** matches the set photo: peach plaster, dark wainscot, green doors 19 and 20 (with the yellow peephole frame), and the window at the end. The museum is now the rotunda: red marble columns, murals, flags and the skeleton on its rock base.
- **Hidden collectibles (bonus):** Mrs. Braverman's cheesecake (look for the splat in the hallway), Phoebe's taxi (parked outside her building), the Moist Maker (museum staff fridge) and Marcel (loose in Ross's apartment). Find one, answer its question, and it goes on your shelf. Rachel's trifle has new art.
- **Traffic variety:** wagons, minivans and compacts in all colours, plus a '90s yellow cab.
- **HD characters:** dedicated sheets for Eddie, the MSG usher, the apartment duck and Marcel.
- Built with `tools/prep_interiors.py <folder>`. It cuts each 2x2 art sheet into four sprites at their in-game size, makes the floor and wall textures tile, generates the plainer floors, and normalises the character sheets.

## v1.5: "The One for the Super Fans"

- Trivia difficulty (Casual / Fan / Super Fan) on the title screen and in Help, with 80 new Super Fan questions.
- Tough questions earn 2 stars, Super Fan questions 3.
- A Quiz Night host at Central Perk: 10 Super Fan questions, 7 to win the bonus Super Fan Trophy.

## v1.4: "The One Where Nobody's Old-School"

- **Every NPC is HD now.** The townspeople, café customers and passers-by, plus Eddie and the MSG usher, are drawn from the player character templates. Each keeps their colours, and short hair varies between buzz, shaggy and spiky so crowds don't look cloned.
- The apartment duck uses the runaway duck's art until it gets its own sheet.

## v1.3: "The One With the New Neighborhood"

- **Greenwich Village redrawn in HD:** all 11 buildings on Grove St are new hand-drawn facades (Central Perk, Ross's building, Phoebe's, the Lucille Lortel, Village Cigars, Ray's Pizza and the brownstones), with shop signs written on their boards.
- **New streets and park:** concrete sidewalk slabs, asphalt with crosswalks and a double yellow line, hex-paved park paths, lawn, and rooftops. The new street surfaces also appear in every other outdoor neighborhood.
- **New street props:** lamps, street trees in iron pits, park trees, hydrants, newspaper boxes, planters, street-sign poles, benches, the park fence, the road barricade and the Bleecker St subway entrance. All have soft shadows.
- **Traffic:** parked cars and traffic use a hand-drawn sedan repainted in each car's colour, plus a hand-drawn taxi.
- Doors now line up with the doors in the art; Central Perk's entrance moved one step left.
- Built with `tools/prep_village.py <folder>`. It cuts out backgrounds, fits each facade to its lot (widening slightly and removing a repeated middle floor when the art runs tall), makes the ground textures tile, and generates the asphalt and road markings.

## v1.2: "The One Where You Get Redrawn Too"

- **HD player character** built from colour-keyed template art: the template marks each part (skin, shirt, pants, shoes, hair), and the game paints those parts in the colours you pick, so any combination looks hand-drawn.
- **New customiser:** 7 hairstyles (long, ponytail, puffy, shaggy, spiky, buzz, bald), freckles on or off, any shirt, skin and hair colour, and pants, skirt or dress. Skirts and dresses use the bare-legs look under a flared hem.
- **Wearables on the HD player:** Ross's leather pants are now drawn in HD (shiny black). Monica's diner wig swaps your hair for a blonde shag. Hats, the veil, the armadillo costume and carried items are still the small pixel props, scaled onto the new body.
- Older saves carry over: bob becomes shaggy, short becomes buzz, and bun becomes ponytail.
- To rebuild after changing the template art: `python3 tools/prep_player.py <folder>`, with sheets named `base`, `freckles`, `ponytail`, `puffy`, `long`, `spiky`, `buzz` and `shaggy`.

## v1.1: "The One Where Everyone Gets Redrawn"

- **The whole cast is HD:** all six friends in every location look, plus Gunther, Mr. Heckles (with broom), Jack and Judy, Frank Jr., Janice, Richard, Estelle and Mike, the finale cast, and the chick.
- **Every secret sighting is HD:** the Turkey Head, the Holiday Armadillo, Joey the Tourist, Chandler in a Box, the runaway duck, the PIVOT! crew, and the "Porsche," which now has a hand-drawn covered car.
- **Stand-ins until their sheets exist:** Museum Ross uses his green-shirt look, London Joey his navy shirt, and Chandler at home his work shirt. The MSG usher, Eddie and the apartment duck keep the old style. (The bundle's `Duck_Apartment.png` has the room painted into every frame, and `Trio_PivotCouch.png` is comic panels, not a walk cycle.)
- `HD_CAST` in `src/game.js` maps each NPC id to its sheet; `HD_SPRITES` lists the sheets.

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
3. Add the sheet to `HD_SPRITES` (or an item to `HD_ITEMS`) at the top of `src/game.js`, then point the NPC at it in `HD_CAST` (or, for a secret sighting, give its `look` an `hd:'<key>'` in `src/maps.js`).
4. `python3 build.py`, then commit `src/`, `index.html` and `sprites/`.

HD sheets: 3 columns (frames) × 4 rows (Down, Up, Left, Right), 176×192 per cell, transparent background. Generated sheets usually draw both side rows facing right; the prep tool mirrors one, and `OVERRIDES` in the script handles the exceptions (sheets facing left, the smaller 4×3 sheets, and sheets it can't use). They load from files, so they show on GitHub Pages; a single-file copy of `index.html` falls back to the old sprites.

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
- HD sprites for the missing looks (Ross's brown shirt, Joey's red shirt, Chandler's green shirt) and for Tag
- HD hats and carried items for the player
- Dedicated HD fronts for the other neighborhoods (they currently reuse recoloured Village facades), and Montauk's beach house
- Floor plans for the diner, Chandler's office, the studio and the airport
