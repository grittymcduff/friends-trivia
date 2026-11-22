/* ===== Trivia bank =====
 * Each question: t = tags (space-separated), q = question, a = answers (the FIRST one is correct;
 * they are shuffled at runtime), f = optional fun fact shown after answering.
 * Decks pick questions by tag: perk (Gunther), rachel, phoebe, easy (townsfolk), and 'all' (Couch Challenge).
 * Append new questions at the end: the save file tracks which ones you've seen by position.
 */
const QB = [
// ---- Central Perk (Gunther's deck) ----
{t:'perk easy', q:"What color is the famous couch at Central Perk?", a:["Orange","Green","Brown leather","Navy blue"], f:"The big orange couch is the gang's unofficial reserved seat. Somehow it's always free."},
{t:'perk', q:"Who works behind the counter at Central Perk for all ten seasons?", a:["Gunther","Terry","Paolo","Eddie"], f:"Gunther is there from start to finish. Terry is the early-seasons manager who isn't a fan of Rachel's waitressing."},
{t:'perk rachel', q:"Who at Central Perk is quietly, hopelessly in love with Rachel?", a:["Gunther","Terry","Mr. Heckles","Paolo"], f:"Gunther carries a torch for Rachel for years and finally tells her in the very last episode."},
{t:'perk rachel easy', q:"In the early seasons, which friend works as a waitress at Central Perk?", a:["Rachel","Monica","Phoebe","Janice"], f:"Rachel waits tables after leaving Barry, and she's famously not very good at it."},
{t:'perk phoebe easy', q:"Which friend plays guitar and sings at Central Perk?", a:["Phoebe","Ross","Joey","Monica"], f:"Phoebe's original songs are a Central Perk staple, whether people want them or not."},
{t:'perk', q:"In which New York neighborhood do the friends live and hang out?", a:["Greenwich Village","Upper East Side","Brooklyn Heights","Harlem"], f:"Central Perk and the apartments are all in Greenwich Village."},
{t:'perk', q:"Where is Central Perk in relation to Monica's apartment?", a:["Downstairs, in the same building","Across the street","Around the corner","Two subway stops away"], f:"The coffeehouse is right downstairs, which explains a lot about how much time they spend there."},
{t:'perk', q:"How many seasons did Friends run?", a:["10","8","9","12"], f:"Ten seasons, from 1994 to 2004."},

// ---- Rachel's deck ----
{t:'rachel easy', q:"Who does Rachel leave at the altar in the very first episode?", a:["Barry","Paolo","Joshua","Tag"], f:"She runs out on Barry and turns up at Central Perk still in her wedding dress."},
{t:'rachel', q:"What is Barry's job?", a:["Orthodontist","Dentist","Podiatrist","Accountant"]},
{t:'rachel', q:"Where does Rachel get her first fashion job after quitting Central Perk?", a:["Fortuna Fashions","Bloomingdale's","Ralph Lauren","Saks Fifth Avenue"], f:"The job mostly involves fetching coffee. Bloomingdale's comes next."},
{t:'rachel', q:"What are the names of Rachel's two sisters?", a:["Amy and Jill","Amy and Ursula","Jill and Emily","Monica and Amy"]},
{t:'rachel', q:"What does Rachel accidentally put in her Thanksgiving trifle?", a:["Beef sautéed with peas and onions","A jar of mayonnaise","Ketchup instead of jam","Smoked salmon"], f:"Two cookbook pages were stuck together, so half her trifle is a shepherd's pie."},
{t:'rachel', q:"What is the name of Ross and Rachel's daughter?", a:["Emma","Erica","Ella","Emily"]},
{t:'rachel ross', q:"At his wedding in London, whose name does Ross say instead of Emily's?", a:["Rachel's","Monica's","Carol's","Julie's"]},
{t:'rachel ross', q:"Who insists, over and over, \"We were on a break!\"?", a:["Ross","Chandler","Joey","Rachel"]},
{t:'rachel', q:"Which store does Rachel work at right after Fortuna Fashions?", a:["Bloomingdale's","Barneys","Macy's","Saks Fifth Avenue"]},

// ---- Phoebe's deck ----
{t:'phoebe easy', q:"What is Phoebe's most famous song called?", a:["Smelly Cat","Grumpy Dog","Stinky Mouse","Lonely Fish"]},
{t:'phoebe', q:"What is the name of Phoebe's identical twin sister?", a:["Ursula","Regina","Frances","Leslie"]},
{t:'phoebe', q:"What fake name does Phoebe like to use when she's pretending to be someone else?", a:["Regina Phalange","Ken Adams","Holden McGroin","Mrs. Bing"], f:"Ken Adams and Holden McGroin are both Joey's aliases."},
{t:'phoebe', q:"Who does Phoebe marry in season 10?", a:["Mike Hannigan","David","Gary","Duncan"]},
{t:'phoebe', q:"Phoebe is a surrogate for her brother. How many babies does she carry?", a:["Three","Two","One","Four"], f:"Triplets: Frank Jr. Jr., Leslie, and Chandler."},
{t:'phoebe', q:"What's the name of Phoebe's half-brother?", a:["Frank Jr.","Frank Sr.","Bill","Mike"]},
{t:'phoebe', q:"According to Phoebe, where did her grandmother's cookie recipe come from?", a:["Nestlé Toulouse","Betty Crocker","A Paris baker named Pierre","Her neighbor"], f:"It turns out to be the recipe on the back of the chocolate chip bag."},
{t:'phoebe', q:"Which of Phoebe's boyfriends is a scientist who moves to Minsk?", a:["David","Mike","Gary","Vince"]},

// ---- Everyone (Couch Challenge & townsfolk) ----
{t:'easy ross', q:"What is the name of Ross's pet monkey?", a:["Marcel","Mr. Bananas","Bobo","Jean-Claude"]},
{t:'easy ross', q:"What does Ross do for a living?", a:["Paleontologist","Archaeologist","Geologist","Marine biologist"]},
{t:'easy joey', q:"What is the name of Joey's stuffed penguin?", a:["Hugsy","Waddles","Pengy","Mr. Flippers"]},
{t:'joey', q:"Which character does Joey play on Days of Our Lives?", a:["Dr. Drake Ramoray","Dr. Ken Adams","Dr. Johnny Hunter","Dr. Holden McGroin"]},
{t:'easy joey', q:"What does Joey famously NOT share?", a:["Food","His TV","His clothes","His foosball table"]},
{t:'joey', q:"How many sisters does Joey have?", a:["Seven","Three","Five","None"]},
{t:'joey', q:"What is the name of Joey's agent?", a:["Estelle","Janice","Judy","Amy"]},
{t:'chandler', q:"What is Chandler's middle name?", a:["Muriel","Matthew","Maurice","Marion"]},
{t:'chandler', q:"In the big apartment quiz, what does Rachel guess Chandler's job is?", a:["Transponster","Statistician","Data reconfigurer","Copywriter"], f:"The girls lose the quiz and have to swap apartments with Joey and Chandler."},
{t:'chandler', q:"Which of Chandler's girlfriends is known for her laugh and her \"Oh. My. God.\"?", a:["Janice","Kathy","Joanna","Ginger"]},
{t:'chandler joey', q:"Which two pets do Joey and Chandler keep in their apartment?", a:["A chick and a duck","Two cats","A monkey and a rabbit","A hamster and a lizard"]},
{t:'ross', q:"How many times has Ross been divorced by the end of the series?", a:["Three","Two","Four","One"]},
{t:'ross', q:"What does Ross call the extra gravy-soaked slice of bread in his Thanksgiving sandwich?", a:["The Moist Maker","The Gravy Boat","The Secret Slice","The Sandwich Saver"]},
{t:'ross', q:"Ross dresses up as which holiday character to teach Ben about Hanukkah?", a:["The Holiday Armadillo","The Hanukkah Hippo","The Festive Ferret","The Menorah Moose"]},
{t:'ross', q:"What does Ross keep yelling while trying to move a couch up the stairs?", a:["\"PIVOT!\"","\"LIFT!\"","\"TURN!\"","\"PUSH!\""]},
{t:'ross', q:"Who is the mother of Ross's son, Ben?", a:["Carol","Susan","Emily","Rachel"]},
{t:'monica', q:"To cheer Chandler up at Thanksgiving, what does Monica wear on her head?", a:["A turkey, with sunglasses and a fez","A pumpkin","A pilgrim hat","A pie tin"]},
{t:'monica', q:"At which restaurant is Monica head chef in the later seasons?", a:["Javu","Alessandro's","Iridium","Moondance Diner"]},
{t:'monica', q:"What number is Monica's apartment in the later seasons?", a:["20","19","5","14"]},
{t:'easy', q:"What do the friends build to poke Ugly Naked Guy across the street?", a:["A giant poking device made of chopsticks","A slingshot","A really long umbrella","A paper airplane launcher"]},
{t:'easy', q:"In which city do Ross and Emily get married?", a:["London","Paris","Las Vegas","Barbados"]},

// ---- v0.2: Monica's deck ----
{t:'monica easy', q:"What does Monica do for a living?", a:["She's a chef","She's a food critic","She runs a bakery","She's a personal trainer"]},
{t:'monica easy', q:"What is the name of Monica's brother?", a:["Ross","Ben","Frank","Richard"]},
{t:'monica', q:"How many categories of towels does Monica have?", a:["Eleven","Three","Seven","Twenty"], f:"Chandler is stunned to learn that 'everyday use' and 'fancy' are only the beginning."},
{t:'monica', q:"What is the Geller Cup?", a:["A troll doll nailed to a piece of wood","A silver trophy from Monica's school","A chipped coffee mug","A bowling trophy"], f:"Ross and Monica fought over it in Thanksgiving touch football games growing up."},
{t:'monica', q:"What does Monica's older boyfriend Richard do for a living?", a:["Ophthalmologist","Dentist","Lawyer","Professor"]},
{t:'monica chandler', q:"Where do Monica and Chandler first get together?", a:["London, at Ross's wedding","Las Vegas","Barbados","Atlantic City"]},
{t:'monica chandler', q:"What are the names of Monica and Chandler's twins?", a:["Erica and Jack","Emma and Ben","Leslie and Frank","Jill and Jack"]},
{t:'monica', q:"Who did Monica's apartment originally belong to?", a:["Her grandmother","Her parents","Rachel","Mr. Heckles"], f:"It's rent-controlled, which is how the gang can afford such a big place."},
{t:'monica chandler', q:"In the proposal episode, who tries to propose first?", a:["Monica","Chandler","Joey, as a joke","Rachel, by accident"], f:"Monica gets too emotional to finish, so Chandler takes over."},
// ---- v0.2: Chandler's deck ----
{t:'chandler easy', q:"What is Chandler's last name?", a:["Bing","Bong","Bang","Banks"]},
{t:'chandler', q:"Why does Chandler spend Thanksgiving in a box?", a:["To make up for kissing Joey's girlfriend","He lost a bet with Ross","To hide from Janice","He's practicing a magic act"]},
{t:'chandler', q:"Which city does Chandler get transferred to for work?", a:["Tulsa","Yemen","Minsk","Atlantic City"], f:"He falls asleep in a meeting and agrees to it without realizing."},
{t:'chandler', q:"Which career does Chandler switch to in the later seasons?", a:["Advertising","Teaching","Real estate","Accounting"]},
{t:'chandler', q:"What does Chandler have trouble doing in photos?", a:["Smiling normally","Keeping his eyes open","Standing still","Looking at the camera"]},
{t:'chandler joey', q:"After their entertainment unit fiasco, what do Joey and Chandler end up with?", a:["A canoe","A foosball table","A duck","A jukebox"]},
{t:'chandler', q:"Where does Chandler tell Janice he's moving so he can break up with her?", a:["Yemen","Tulsa","Minsk","London"]},
{t:'chandler', q:"While Joey is living elsewhere, which strange roommate does Chandler get stuck with?", a:["Eddie","Eric","Mr. Heckles","Gunther"]},
// ---- v0.2: Joey's deck ----
{t:'joey easy', q:"What is Joey's last name?", a:["Tribbiani","Tortelli","Tribeca","Taglia"]},
{t:'joey easy', q:"What is Joey's famous pickup line?", a:["\"How you doin'?\"","\"Hey there, gorgeous.\"","\"Come here often?\"","\"What's up?\""]},
{t:'joey', q:"How is Dr. Drake Ramoray written off Days of Our Lives?", a:["He falls down an elevator shaft","He moves to Paris","He's struck by lightning","He wanders off with amnesia"]},
{t:'joey', q:"What is the name of Joey's imaginary childhood friend?", a:["Maurice","Mr. Peanut","Ken Adams","Hugsy"]},
{t:'joey chandler', q:"To get back at Chandler, Joey puts on what?", a:["Every piece of Chandler's clothing","Chandler's bathrobe","A wedding dress","A duck costume"]},
{t:'joey', q:"What name does Joey give his favorite recliner?", a:["Rosita","Big Leather","Barcalounger Bob","Sandra"]},
// ---- v0.3: Ross ----
{t:'ross easy', q:"What is the name of Ross's second wife?", a:["Emily","Carol","Rachel","Julie"]},
{t:'ross', q:"Ross's first wife, Carol, leaves him for whom?", a:["Susan","Emily","Janice","Kathy"]},
{t:'ross', q:"On a date, what does Ross wear that gets him into trouble in the bathroom?", a:["Leather pants","A velvet suit","A kilt","A tuxedo"], f:"Lotion plus leather pants: a combination Ross does not recommend."},
{t:'ross places', q:"What hits Ross in the face at a Rangers game?", a:["A hockey puck","A foam finger","A hot dog","A beach ball"]},
{t:'ross', q:"Where does Ross teach in the later seasons?", a:["NYU","Columbia","Harvard","The museum's night school"]},
{t:'ross', q:"According to Ross, what is 'unagi'?", a:["A state of total awareness","A karate kick","A type of dinosaur","A sushi chef's knife"], f:"Phoebe and Rachel point out that unagi is actually a kind of eel."},
{t:'ross', q:"Where do Ross and Rachel go on their first date?", a:["The museum, after hours","Central Perk","A fancy restaurant","A Rangers game"]},
{t:'ross', q:"Where does Marcel end up after Ross gives him away?", a:["The San Diego Zoo","The Bronx Zoo","A circus","Ross's parents' house"]},
// ---- v0.3: places & trips ----
{t:'places', q:"Where does Joey work as a gladiator?", a:["Caesars Palace, Las Vegas","The Plaza Hotel","Madison Square Garden","Atlantic City"]},
{t:'places', q:"Why is the whole gang in Barbados?", a:["Ross is giving a keynote speech at a paleontology conference","Monica and Chandler's honeymoon","Phoebe's wedding","Joey is filming a movie"]},
{t:'places monica', q:"In Barbados, what does Monica play for hours against Mike?", a:["Ping-pong","Tennis","Poker","Volleyball"]},
{t:'places phoebe', q:"In which beach town does Phoebe meet her birth mother?", a:["Montauk","Atlantic City","The Hamptons","Coney Island"]},
{t:'places joey', q:"What does Joey buy and proudly wear in London?", a:["A hat with the British flag on it","A bowler hat","A royal guard's tall fur hat","A tweed cap"]},
{t:'places rachel ross', q:"What do Ross and Rachel do in Las Vegas after a lot of drinks?", a:["Get married","Get matching tattoos","Buy a casino","Adopt a dog"]},
{t:'places rachel', q:"In the finale, Rachel is moving to Paris for a job with which company?", a:["Louis Vuitton","Chanel","Ralph Lauren","Gucci"]},
{t:'places rachel', q:"In the finale, which airport is Rachel's Paris flight leaving from?", a:["Newark","JFK","LaGuardia","Philadelphia"]},
// ---- v0.3: more of everyone ----
{t:'rachel', q:"Who is Rachel's demanding boss at Bloomingdale's?", a:["Joanna","Janice","Estelle","Emily"]},
{t:'rachel', q:"At Ralph Lauren, Rachel hires an assistant she has a crush on. What's his name?", a:["Tag","Joshua","Paolo","Mark"]},
{t:'monica', q:"At the Moondance Diner, what does Monica have to wear?", a:["A blonde wig","A chef's hat","A pirate hat","A clown nose"]},
{t:'phoebe easy', q:"What kind of car does Phoebe drive?", a:["Her grandmother's old taxi","A yellow Beetle","A convertible","A tour bus"]},
{t:'phoebe', q:"What is the name of Phoebe's birth mother?", a:["Phoebe Abbott","Ursula Buffay","Lily Buffay","Frances Abbott"]},
{t:'phoebe', q:"Where do Phoebe and Mike get married?", a:["On the street outside Central Perk, in the snow","In Central Park","In Montauk","At the Plaza Hotel"]},
{t:'joey', q:"What is the name of the musical Joey stars in, about a famous psychiatrist?", a:["Freud!","Jung at Heart","Doctor Dreams","Couch!"]},
{t:'joey', q:"How does Joey's Days of Our Lives character come back to the show?", a:["He gets a brain transplant","He was actually his twin","He wakes up from a dream","He returns from Paris"], f:"Dr. Drake Ramoray returns with the brain of Jessica Lockhart."},
];

/* ===== A personal touch =====
 * Write a message here and it appears on the final credits screen. Leave it empty to skip it.
 */
const PERSONAL_NOTE = "";
const MADE_BY = "Made with love by Tim";

/* ===== Collectibles =====
 * from: who/where awards it. hint: shown on the shelf while it's still locked.
 * Items with a zone other than the current build are locked until that zone is added.
 */
const ITEMS = [
 // Greenwich Village
 {id:'mug',      name:'Giant Coffee Mug',          from:'Gunther · Central Perk', desc:"Practically a soup bowl with a handle. Gunther doesn't hand these out lightly.", hint:"Gunther might part with one, if you know your Central Perk."},
 {id:'trifle',   name:"Rachel's Trifle",           from:'Rachel · Central Perk',  desc:"Ladyfingers, jam, custard, raspberries… then beef sautéed with peas and onions.", hint:"Rachel is between tables. Maybe she'll quiz you."},
 {id:'painting', name:"Phoebe's Creepy Painting",  from:'Phoebe · Central Perk',  desc:"It's staring at you. It's definitely staring at you.", hint:"Phoebe is tuning her guitar in the corner."},
 {id:'turkey',   name:'The Thanksgiving Turkey',   from:'Couch Challenge',        desc:"Comes with sunglasses and a little fez. Not optional.", hint:"Sit on the orange couch and see who joins you."},
 {id:'cup',      name:'The Geller Cup',            from:'Monica · Apt 20',        desc:"A troll doll nailed to a block of wood. The most fought-over trophy in the Geller family.", hint:"Monica is in the kitchen. She's very competitive."},
 {id:'frame',    name:'The Yellow Peephole Frame', from:'The Apartment Quiz · Apt 20', desc:"The little yellow frame from around Monica's peephole. It never looked right anywhere else.", hint:"Ross is running a quiz in apartment 20."},
 {id:'dog',      name:'The White Dog Statue',      from:'Chandler · Apt 19',      desc:"Big, white, ceramic and staring. Joey thinks it's the classiest thing they own.", hint:"Chandler is hanging around the foosball table in apartment 19."},
 {id:'hugsy',    name:'Hugsy',                     from:'Joey · Apt 19',          desc:"Joey's bedtime penguin pal. You can borrow him. Borrow.", hint:"Joey might share him. Might."},
 {id:'pants',    name:"Ross's Leather Pants",      from:"Ross · Ross's Apartment", desc:"Do not, under any circumstances, apply lotion while wearing these.", hint:"Ross lives across the street from Monica now."},
 {id:'armadillo',name:'Holiday Armadillo Costume', from:"The Costume Trunk · Ross's Apartment", desc:"Half man, half armadillo, all Hanukkah.", hint:"There's a trunk in Ross's apartment marked DO NOT OPEN."},
 // Midtown
 {id:'card',     name:"Chandler's Business Card",  from:'Chandler · Midtown Office', desc:"'Statistical Analysis and Data Reconfiguration.' Nobody knows what it means.", hint:"Take the subway to Midtown. Chandler's office is at 9 West 57th."},
 {id:'bag',      name:"Bloomingdale's Shopping Bag",from:"Rachel · Bloomingdale's", desc:"Empty, but it's the BAG that matters.", hint:"Rachel has a new job in Midtown. In fashion!"},
 {id:'puck',     name:'Rangers Hockey Puck',        from:'The Usher · Madison Square Garden', desc:"Lightly used. Mostly on Ross's face.", hint:"There's an usher outside Madison Square Garden."},
 // SoHo
 {id:'wig',      name:"Monica's Diner Wig",         from:'Monica · Moondance Diner', desc:"Big, blonde, and extremely 1950s. Monica would like it never mentioned again.", hint:"Take the subway to SoHo and grab a booth at the diner."},
 // Uptown
 {id:'bone',     name:'Dinosaur Bone',              from:'Ross · The Museum',      desc:"A very nice cast of a very old bone. Ross would like you to know it's a cast.", hint:"Take the subway Uptown to the Museum of Prehistoric History."},
 {id:'umbrella', name:'The Fountain Umbrella',      from:'The Fountain · Central Park', desc:"For dancing in fountains with five of your closest friends.", hint:"There's a famous fountain in the park Uptown."},
 // Queens
 {id:'headshot', name:"Joey's Headshot",            from:'Joey · Silvercup Studios', desc:"Signed 'To my biggest fan, love, Drake Ramoray.' He's doing the look.", hint:"Take the subway to Queens. Joey is on set."},
 // Trips
 {id:'hat',      name:"Joey's London Hat",          from:'Joey · London',          desc:"Covered in the British flag. Joey bought nine of them.", hint:"Catch a flight to London from JFK."},
 {id:'veil',     name:'The Vegas Veil',             from:'Rachel · Las Vegas',     desc:"Nobody remembers where it came from. That's Vegas.", hint:"Catch a flight to Las Vegas from JFK."},
 {id:'paddle',   name:"Monica's Ping-Pong Paddle",  from:'Monica · Barbados',      desc:"Nine hours of competitive ping-pong. It's seen things.", hint:"Catch a flight to Barbados from JFK."},
 {id:'shell',    name:"Phoebe's Seashell",          from:'Phoebe · Montauk',       desc:"Hold it to your ear. It says nice things about you.", hint:"Take the bus to Montauk from JFK."},
 // Finale
 {id:'key',      name:"The Key to Apartment 20",    from:'The Last One · Central Perk', desc:"Everyone leaves their keys on the counter one last time. You get to keep this one.", hint:"Collect everything else, then head to the orange couch."},
];
