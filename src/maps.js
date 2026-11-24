/* ===== Maps =====
 * Each zone is a grid of 16px ground tiles plus a list of objects, NPCs, interaction spots and doors.
 * Ground types: walk (sidewalk), road, laneH/laneV (road with center line), inter (intersection),
 *   crossH/crossV (crosswalks), grass, path, roofs, wood, brick, wains (wainscot), wallS, front, mat.
 * Walls (brick, wains, wallS, front, roofs) are solid. Objects have their own footprints (see fp() in game.js).
 * Coordinates are in tiles: x to the right, y down.
 */
const ZONES = {};
function Z(id, name, w, h, fill){ const z={id,name,w,h,g:new Array(w*h).fill(fill),objs:[],npcs:[],acts:[],doors:[],taxiRows:[],bg:'#16121e'}; ZONES[id]=z; return z; }
function paint(z,t,x,y,w=1,h=1){ for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(i>=0&&j>=0&&i<z.w&&j<z.h)z.g[j*z.w+i]=t; }
function obj(z,kind,x,y,o={}){ const d=Object.assign({kind,x,y},o); z.objs.push(d); return d; }
function act(z,x,y,o){ z.acts.push(Object.assign({x,y},o)); }
function door(z,x,y,to,tx,ty,dir){ z.doors.push({x,y,to,tx,ty,dir}); }
function msgDoor(z,x,y,text){ act(z,x,y,{type:'msg',text,door:true}); }

/* ---------------- Greenwich Village (exterior) ---------------- */
(function(){
 const z = Z('village','Greenwich Village',48,34,'walk');
 paint(z,'roofs',0,0,20,1); paint(z,'roofs',28,0,20,1);
 // Grove St (east–west), rows 11–14
 paint(z,'road',0,11,48,4); paint(z,'laneH',0,12,48,1);
 // Bedford St (north–south), cols 22–25, rows 0–24 (closed to traffic at the bottom for the street fair)
 paint(z,'road',22,0,4,25); paint(z,'laneV',23,0,1,25);
 paint(z,'inter',22,11,4,4);
 paint(z,'crossV',22,9,4,2); paint(z,'crossV',22,15,4,2);
 paint(z,'crossH',18,11,2,4); paint(z,'crossH',28,11,2,4);
 // Washington Square Park, rows 28–33
 paint(z,'grass',0,28,48,6); paint(z,'path',0,30,48,2); paint(z,'path',22,28,4,2); paint(z,'path',10,28,2,2); paint(z,'path',36,28,2,2);
 z.taxiRows=[{row:12,dir:-1,n:2},{row:13,dir:1,n:2}];

 // --- North side of Grove St (buildings rows 1–8, doors on row 8) ---
 obj(z,'building',0,1,{hd:'n1_brownstone',w:6,h:8,style:'brown',tower:true,doors:[{x:3,kind:'stoop'}]});
 obj(z,'building',6,1,{hd:'n2_brick',w:6,h:8,style:'brick',fire:true,doors:[{x:2,kind:'plain'}]});
 obj(z,'building',12,1,{hd:'n3_central_perk',signLift:46,signCx:47,signW:84,w:8,h:8,style:'yellow',fire:true,tower:true,shop:true,shopW:6,awning:'#2f6b3a',signBg:'#24301f',sign:'CENTRAL PERK',signFg:'#f3e3b0',doors:[{x:3,kind:'shop'},{x:6,kind:'stoop',color:'#5b3a8c'}]});
 obj(z,'building',28,1,{hd:'n4_brick_ross',w:8,h:8,style:'brick',fire:true,doors:[{x:4,kind:'stoop'}]});
 obj(z,'building',36,1,{hd:'n5_brownstone',w:6,h:8,style:'brown',tower:true,doors:[{x:2,kind:'stoop'}]});
 obj(z,'building',42,1,{hd:'n6_rays_pizza',signLift:44,signCx:48,signW:56,w:6,h:8,style:'slate',shop:true,awning:'#b8322a',signBg:'#2a1a1a',sign:"RAY'S PIZZA",doors:[{x:2,kind:'shop'}]});
 door(z,13,8,'perk',10,13,'up');
 msgDoor(z,1,8,"Nobody answers. Somewhere inside, a dog is barking at a vacuum.");
 msgDoor(z,7,8,"The buzzer is broken. Someone taped a note to it: 'KNOCK LOUDER.'");
 door(z,18,8,'hall',6,7,'up');
 door(z,29,8,'rossapt',16,13,'up');
 msgDoor(z,37,8,"A sign on the door: 'Super is on vacation. Do not ask about the heat.'");
 msgDoor(z,43,8,"Closed for a private party. It smells amazing.");

 // --- South side of Grove St (buildings rows 17–24, doors on row 24) ---
 obj(z,'building',0,17,{hd:'s1_lucille_lortel',signLift:54,signCx:63,signW:80,w:8,h:8,style:'slate',shop:true,awning:'#7d1d2c',signBg:'#1b1b2a',sign:'LUCILLE LORTEL',signFg:'#ffd86b',doors:[{x:4,kind:'shop'}]});
 obj(z,'building',8,17,{hd:'s2_brownstone',w:6,h:8,style:'brown',doors:[{x:3,kind:'stoop'}]});
 obj(z,'building',14,17,{hd:'s3_village_cigars',signLift:40,signCx:60,signW:52,w:6,h:8,style:'cream',shop:true,awning:'#b02a2a',signBg:'#e8c547',sign:'VILLAGE CIGARS',signFg:'#7a1a1a',doors:[{x:3,kind:'shop'}]});
 obj(z,'building',28,17,{hd:'s4_brick_phoebe',w:8,h:8,style:'brick',fire:true,doors:[{x:3,kind:'stoop',color:'#2f5c7a'}]});
 obj(z,'building',36,17,{hd:'s5_brownstone_wide',w:12,h:8,style:'brown',fire:true,doors:[{x:5,kind:'stoop'}]});
 msgDoor(z,4,24,"Tonight: an experimental play starring an actor named Joey Tribbiani.\nThe theatre opens in a later update. (Bring earplugs.)");
 msgDoor(z,9,24,"Nobody's home.");
 msgDoor(z,15,24,"VILLAGE CIGARS. Lottery tickets, newspapers, and gum. The shop opens in a later update.");
 door(z,29,24,'phoebe',20,13,'up');
 // v1.9.5: a busker by Washington Square Park
 z.npcs.push({id:'busker',name:'Busker',x:21,y:30,dir:'down',busker:true,guitar:true,quiz:true,look:{skin:'#c68a5a',hair:'#2a1d17',style:'long',shirt:'#6a8f4a',pants:'#3b4a6b'},
  lines:["(He's playing something jangly on an old acoustic guitar. There's a hat on the sidewalk with three dollars and a guitar pick in it.)","I play here every day. Some lady with a guitar told me this was 'her corner.' I said there's room for two. She disagreed. Musically."]});
 // Phoebe's taxi (v1.5 collectible), parked outside her building
 obj(z,'grantaxi',33,14,{dir:1});
 for(const x of [33,34]) act(z,x,14,{type:'collect',item:'grantaxi',lines:["An old yellow cab, parked half on the curb. One hubcap is missing. The meter is running. Nobody is inside.","A cassette is sticking out of the tape deck. The label says 'SMELLY CAT (DEMO).'"],
  q:"Whose cab is this?",answers:["Phoebe's","Joey's","Gunther's","Mr. Treeger's"],
  win:"Phoebe pops her head out of the building. 'Oh, you found my taxi! Keep the keys for a while. Just pump the brakes twice. And don't open the trunk.'",
  lose:"A note on the dashboard: 'If found, return to P. Buffay. NOT the other Phoebe.' Try again.",
  have:"Phoebe's taxi. The keys are in your pocket. The trunk is still a mystery."});
 msgDoor(z,37,24,"You hear someone practicing the tuba. You back away slowly.");

 // --- Street furniture ---
 for(const x of [2,13,30,44]) obj(z,'lamp',x,10);
 for(const x of [5,33,46]) obj(z,'lamp',x,15);
 for(const x of [8,35,40]) obj(z,'tree',x,10);
 for(const x of [10,38,16]) obj(z,'tree',x,15);
 obj(z,'hydrant',17,10); obj(z,'news',27,9); obj(z,'hydrant',2,15); obj(z,'news',20,15);
 obj(z,'planter',0,9); obj(z,'planter',47,9);
 obj(z,'sign',21,10,{text:'GROVE ST'}); obj(z,'sign',26,16,{text:'BEDFORD ST'});
 act(z,21,10,{type:'msg',text:'GROVE ST & BEDFORD ST'}); act(z,26,16,{type:'msg',text:'BEDFORD ST & GROVE ST'});
 // parked cars along the curbs
 obj(z,'car',3,11,{color:'#3b6fb6',dir:-1}); obj(z,'car',9,11,{color:'#8f2f2f',dir:-1}); obj(z,'car',34,11,{color:'#3a3a44',dir:-1}); obj(z,'car',41,11,{color:'#6a8f4a',dir:-1});
 obj(z,'car',6,14,{color:'#c9c9cf',dir:1}); obj(z,'car',13,14,{color:'#2f5c7a',dir:1}); obj(z,'car',40,14,{color:'#7a4a8f',dir:1});
 // Bedford St is closed at the bottom for a street fair
 obj(z,'barricade',22,24,{w:4});
 act(z,22,24,{type:'msg',text:'ROAD CLOSED: VILLAGE STREET FAIR. (The fair is somewhere in a future update.)'});
 for(let x=23;x<26;x++) act(z,x,24,{type:'msg',text:'ROAD CLOSED: VILLAGE STREET FAIR.'});
 // Subway
 obj(z,'subway',5,26,{text:'BLEECKER ST'});
  act(z,5,26,{type:'subway'}); act(z,6,26,{type:'subway'}); z.subwaySpawn=[7,25,'left']; z.tune='village';
 // Park edge fence (gaps at the paths)
 for(let x=0;x<48;x++){ if((x>=10&&x<12)||(x>=22&&x<26)||(x>=36&&x<38)) continue; obj(z,'fence',x,28); }
 for(const [x,y] of [[2,29],[7,32],[15,29],[19,33],[30,29],[33,33],[42,29],[45,33],[1,33],[27,33]]) obj(z,'tree',x,y,{park:true});
 obj(z,'bench',13,32); obj(z,'bench',28,32); obj(z,'bench',40,32);
 obj(z,'sign',21,29,{text:'WASHINGTON SQ PARK'});
 act(z,21,29,{type:'msg',text:'WASHINGTON SQUARE PARK. The fountain and the arch are a little further south… in a future update.'});

 // --- Townsfolk ---
 const T=(id,x,y,look,lines,quiz)=>z.npcs.push({id,x,y,dir:'down',look,lines,quiz,wander:[0,0,48,34],walkOn:['walk','path','grass']});
 T('t1',6,10,{skin:'#f1c9a5',hair:'#2a1d17',style:'short',shirt:'#c0573a',pants:'#2b3a55'},["Excuse me, is Central Perk around here? I heard the big couch is ALWAYS free. How is that possible?"],true);
 T('t2',34,9,{skin:'#8d5a3b',hair:'#1c1410',style:'long',fem:true,outfit:'skirt',shirt:'#e8b830',pants:'#3a3a44'},["I've lived on this block for twenty years. You know what I've learned? Never, ever look out of a window across from that building."],true);
 T('t3',12,16,{skin:'#e0ac7e',hair:'#7a4b2a',style:'bun',fem:true,shirt:'#4f8a6a',pants:'#5a4636'},["I'm late for an audition! I play 'Man in Coffee Shop #2.' It's a really big break."],true);
 T('t4',40,26,{skin:'#c68a5a',hair:'#8a8a8a',style:'short',shirt:'#7a5aa8',pants:'#2b2b30'},["In my day, a coffee cost a nickel. And the coffee shops didn't have couches. You STOOD, like an adult."],false);
 T('t5',18,30,{skin:'#5e3a26',hair:'#2a1d17',style:'short',shirt:'#3a7fc0',pants:'#2b3a55'},["Washington Square Park is the best people-watching in the city. Yesterday I saw a guy in a giant armadillo costume."],true);
 T('t6',30,26,{skin:'#f1c9a5',hair:'#b5462a',style:'bob',fem:true,outfit:'dress',shirt:'#e07aa0',pants:'#3a3a44'},["The theatre over there is doing an experimental play. My friend went and said it 'changed nothing about her life.'"],true);
 T('t7',44,16,{skin:'#e0ac7e',hair:'#2a1d17',style:'bald',shirt:'#5a6a3a',pants:'#3b2e26'},["Pizza place is closed for a private party. Some guy rented the whole thing to propose. Bold."],false);
})();

/* ---------------- Central Perk (interior) ----------------
 * v1.5 layout from the floor plan: counter on the left, the orange couch on the big rug at the front,
 * the red couch at the back, café tables in the middle, the window nook on the right, restrooms and stairs behind. */
const wallS=(z,x,y,w,h)=>paint(z,'wallS',x,y,w,h);
const solidAt=(z,x,y)=>obj(z,'stub',x,y);   // invisible blocker (stairs, fixtures under wall art)
(function(){
 const z = Z('perk','Central Perk',24,17,'wood'); z.tune='perk';
 z.bg='#120d0a';
 paint(z,'brick',0,0,24,2); paint(z,'wains',0,2,24,1);
 wallS(z,0,0,1,17); wallS(z,23,0,1,17);
 paint(z,'front',0,16,24,1); paint(z,'mat',11,16,2,1);
 door(z,11,16,'village',13,9,'down'); door(z,12,16,'village',13,9,'down');
 // restrooms and the back stairs
 paint(z,'bath',1,3,4,3); wallS(z,5,2,1,4); wallS(z,1,6,5,1); paint(z,'bath',2,6,1,1);
 obj(z,'toilet',1,3); obj(z,'sink',3,3);
 act(z,1,3,{type:'msg',text:"The Central Perk restroom. There's a line. There's always a line."});
 paint(z,'stairs',6,3,2,2); solidAt(z,6,3); solidAt(z,7,3);
 act(z,6,3,{type:'msg',text:"Stairs up to the storeroom. A sign: 'EMPLOYEES ONLY. THIS MEANS YOU, RACHEL.'"}); act(z,7,3,{type:'msg',text:"Stairs up to the storeroom. Gunther keeps the good muffins up there."});
 // wall decor
 obj(z,'wallsign',9,0,{w:8,text:'Central Perk'});
 obj(z,'menu',2,0,{w:4}); obj(z,'bigwindow',18,0,{w:4}); obj(z,'frame',17,1,{tone:'#3f6b8a'});
 // the counter (Gunther behind it)
 obj(z,'counter',1,9,{w:7}); obj(z,'block',1,8);
 for(let x=1;x<8;x++) act(z,x,9,{type:'counter'});
 // red couch at the back
 obj(z,'rug',9,3,{w:8,h:4,low:true,tone:'#d8b878'});
 obj(z,'couch',10,4,{w:4,color:'#b8322a'}); obj(z,'coffee',11,6,{w:2}); obj(z,'armchair',9,6,{face:'right'}); obj(z,'armchair',15,5,{color:'#b8322a',face:'left'});
 for(let x=10;x<14;x++) act(z,x,4,{type:'msg',text:"The red couch. Nice, but everybody knows the orange one is where it happens."});
 // café tables in the middle
 obj(z,'rug',9,8,{w:6,h:4,low:true,geo:true,tone:'#d89a9a'});
 for(const [x,y] of [[10,9],[13,9],[10,11]]){ obj(z,'table',x,y); obj(z,'chair',x-1,y,{face:'right'}); obj(z,'chair',x+1,y,{face:'left'}); act(z,x,y,{type:'msg',text:'Someone left half a muffin and a very cold latte.'}); }
 // the orange couch
 obj(z,'rug',2,11,{w:8,h:5,low:true,tone:'#c890a8'});
 obj(z,'couch',4,11,{w:4});
 obj(z,'armchair',3,13,{face:'right'}); obj(z,'armchair',8,12,{color:'#6f8f3a',face:'left'});
 obj(z,'coffee',5,13,{w:2});
 for(let x=4;x<8;x++) act(z,x,11,{type:'couch'});
 act(z,5,13,{type:'msg',text:"The coffee table. Someone left a magazine open to a quiz: 'Which Friend Are You?'"});
 act(z,6,13,{type:'msg',text:"The coffee table. Someone left a magazine open to a quiz: 'Which Friend Are You?'"});
 act(z,3,13,{type:'msg',text:"A comfy armchair. The couch looks better, though."});
 act(z,8,12,{type:'msg',text:"The green armchair. Chandler's spot, unless Joey got here first."});
 // the window nook
 obj(z,'rug',17,9,{w:5,h:4,low:true,geo:true,tone:'#e0a050'});
 obj(z,'couch',18,9,{w:3,color:'#d9782f'}); obj(z,'table',18,11); obj(z,'table',20,11); obj(z,'chair',21,11,{face:'left'});
 obj(z,'table',20,6); obj(z,'chair',19,6,{face:'right'}); obj(z,'chair',21,6,{face:'left'});
 act(z,18,11,{type:'msg',text:"A table by the window. Perfect for people-watching on Grove St."});
 // Phoebe's corner
 obj(z,'mic',1,14);
 obj(z,'plant',8,3); obj(z,'plant',22,3); obj(z,'plant',1,15); obj(z,'plant',22,15); obj(z,'floorlamp',16,3);

 // --- Cast ---
 z.npcs.push({id:'gunther',name:'Gunther',cast:true,x:4,y:8,dir:'down',talk:'gunther',reward:'mug',look:{skin:'#efc9a8',hair:'#4a3426',style:'short',shirt:'#4a4a58',pants:'#2b2b30',apron:true}});
 z.npcs.push({id:'rachel',name:'Rachel',cast:true,x:12,y:12,dir:'down',talk:'rachel',reward:'trifle',couch:true,wander:[9,8,9,6],walkOn:['wood'],look:{skin:'#efc9a8',hair:'#4a3426',style:'long',fem:true,outfit:'skirt',shirt:'#6aa6cf',pants:'#3b3b4a',apron:true}});
 z.npcs.push({id:'phoebe',name:'Phoebe',cast:true,x:2,y:14,dir:'right',talk:'phoebe',reward:'painting',couch:true,guitar:true,look:{skin:'#efc9a8',hair:'#4a3426',style:'long',fem:true,outfit:'dress',shirt:'#b884c9',pants:'#5a4a7a'}});
 // Super Fan Quiz Night: the hardest deck in the game
 cast(z,'quizhost','Quiz Night Host',16,13,'left',{skin:'#e0ac7e',hair:'#2a1d17',style:'short',shirt:'#7a2a3a',pants:'#2b2b30'},
  {reward:'trophy',tags:'sf',n:10,need:7,
   greet:["Welcome to Super Fan Quiz Night! I write the questions nobody else knows.","Cameos. Quotes. Which season. How old everyone was. The deep cuts."],
   offer:"Ten Super Fan questions. Get seven right and the trophy is yours. Each correct answer is worth three stars.",
   yes:"I was born ready",no:"Let me study first",noReply:"Smart. Go rewatch season 3. I'll be here.",
   win:"Unbelievable. You're a true Super Fan. The trophy is yours, and nobody can take it from you.",
   lose:"So close! Super Fan questions are tough. Come back any time for another try.",
   again:"Back for another Quiz Night round? New questions every time."});
 // customers
 const C=(id,x,y,dir,look,lines,quiz)=>z.npcs.push({id,x,y,dir,look,lines,quiz,seated:true});
 C('c1',9,9,'right',{skin:'#c68a5a',hair:'#2a1d17',style:'short',shirt:'#d0a040',pants:'#3a3a44'},["This is my fourth coffee. I can see sounds now."],true);
 C('c2',21,11,'left',{skin:'#f1c9a5',hair:'#c9a253',style:'bun',fem:true,shirt:'#4f8a6a',pants:'#3a3a44'},["I come here every day hoping to get the orange couch. Every. Single. Day. It's always taken by the same six people."],true);
 C('c3',14,9,'left',{skin:'#5e3a26',hair:'#1c1410',style:'long',fem:true,outfit:'skirt',shirt:'#c0573a',pants:'#2b3a55'},["The guy behind the counter has been staring at the waitress for an hour. Is that… normal here?"],false);
})();

/* ---------------- Upstairs hallway (Monica's building) ----------------
 * v1.5: matched to the set photo: peach plaster over dark wainscot, green doors, a window at the end. */
(function(){
 const z = Z('hall','Upstairs Hallway',14,9,'hallf'); z.tune='home';
 paint(z,'wallH',0,0,14,2); paint(z,'wains',0,2,14,1);
 wallS(z,0,0,1,9); wallS(z,13,0,1,9);
 paint(z,'frontA',0,8,14,1); paint(z,'stairs',6,8,2,1);
 obj(z,'walldoor',4,2,{color:'#2f7a5a',num:'20',frame:true}); obj(z,'wreath',4,0);
 obj(z,'walldoor',9,2,{color:'#2f6a4a',num:'19'});
 door(z,4,2,'monica',8,15,'up'); door(z,9,2,'joey',11,14,'up');
 door(z,6,8,'village',18,9,'down'); door(z,7,8,'village',18,9,'down');
 obj(z,'frame',7,1,{tone:'#4a7a6a'}); obj(z,'window',11,0,{w:2}); obj(z,'plant',1,3); obj(z,'plant',12,3);
 obj(z,'trash',12,7);
 // the cheesecake (v1.5 collectible) and the spot where it landed
 obj(z,'splat',6,5);
 for(const [x,y] of [[6,4],[5,5],[7,5],[6,6]]) act(z,x,y,{type:'msg',text:"A splat of cheesecake on the hallway floor.\nThe forks next to it suggest two people tried very hard not to waste it."});
 obj(z,'cheesecake',10,3);
 act(z,10,3,{type:'collect',item:'cheesecake',lines:["A bakery box outside Apartment 19. The label says 'Mama's Little Bakery, Chicago.' It's not addressed to anyone who lives here.","There's one slice left. It smells incredible."],
  q:"Who was this cheesecake actually delivered for?",answers:["Mrs. Braverman, downstairs","Mrs. Geller","Mr. Heckles","Mr. Treeger"],
  win:"Mrs. Braverman. Who has never once collected her own cheesecake. You take the box. It's practically yours by now.",lose:"Hmm. The label says otherwise. (Look closer at who lives downstairs.)",
  have:"The bakery box is empty. Not a crumb. Somebody (you) has no regrets."});
 act(z,7,2,{type:'quiz',name:'The Photo Wall',icon:'polaroid',script:{narrate:true,greet:["A wall of framed snapshots: a purple door, an orange couch, a turkey in sunglasses… Someone has labeled them with questions.","A sticky note: 'Picture round! Six photos. Get five right and take a Polaroid.'"],offer:"Play the picture round?",tags:'pic',prefer:'pic',n:6,need:5,reward:'polaroid',yes:"Let's look",no:'Maybe later',noReply:'The photos will wait.',win:"You recognized almost everything! You peel a Polaroid off the wall. Nobody will notice. (Monica will notice.)",lose:"Hmm, a few of those got by you. Look closer next time!"}});
})();

/* ---------------- Monica's apartment (#20) ----------------
 * v1.5 layout from the floor plan: bathroom and kitchen on the left, living room in the middle under the
 * arched window, Monica's and Rachel's bedrooms on the right. */
(function(){
 const z = Z('monica',"Monica's Apartment",26,17,'wood'); z.tune='home';
 z.bg='#140e1c';
 paint(z,'wallP',0,0,26,2); paint(z,'wains',0,2,26,1);
 wallS(z,0,0,1,17); wallS(z,25,0,1,17);
 paint(z,'frontA',0,16,26,1); paint(z,'mat',8,16,2,1);
 door(z,8,16,'hall',4,3,'down'); door(z,9,16,'hall',4,3,'down');
 // bathroom
 paint(z,'bath',1,3,5,4); wallS(z,6,2,1,5); wallS(z,1,7,6,1); paint(z,'bath',6,5,1,1);
 obj(z,'bathtub',1,3); obj(z,'sink',3,3); obj(z,'toilet',5,3);
 act(z,1,3,{type:'msg',text:"The bathtub. Monica has a schedule for it. It is laminated."}); act(z,2,3,{type:'msg',text:"The bathtub. Monica has a schedule for it. It is laminated."});
 act(z,3,3,{type:'msg',text:"Eleven kinds of soap, arranged by scent intensity."});
 // kitchen
 paint(z,'tileK',1,8,7,6);
 obj(z,'fridge',1,8); obj(z,'kcounter',2,8,{w:3,tone:'#4fa3a5'}); obj(z,'stove',5,8); obj(z,'kcounter',6,8,{w:2,tone:'#4fa3a5'});
 obj(z,'kcounter',2,11,{w:3,tone:'#4fa3a5'});
 act(z,1,8,{type:'msg',text:"The fridge is organized by food group, then color, then expiration date. There's a label maker in here too."});
 act(z,5,8,{type:'msg',text:"Something is simmering. You are not allowed to touch it."});
 for(const x of [2,3,4,6,7]) act(z,x,8,{type:'msg',text:"Spotless. You could perform surgery on this counter."});
 act(z,2,11,{type:'msg',text:"A cutting board, a very sharp knife, and a stack of eleven differently colored towels."});
 act(z,3,11,{type:'msg',text:"A glass bowl of trifle. Ladyfingers, jam, custard, raspberries… and a layer of beef sautéed with peas and onions.\nThe pages of the cookbook were stuck together. Rachel's trifle is a collectible: ask her about it at Central Perk."});
 act(z,4,11,{type:'msg',text:"A recipe card in Monica's handwriting: 'Nestlé Toll House' — crossed out. 'Phoebe's grandmother's' — crossed out. 'Nesley Toulouse' — circled."});
 // dining table and living room under the arched window
 obj(z,'dining',8,9);
 for(const [x,y] of [[8,9],[9,9],[10,9],[8,10],[9,10],[10,10]]) act(z,x,y,{type:'msg',text:"The dining table, set for eight. Monica says it's 'just a casual dinner.'"});
 obj(z,'bigwindow',10,0,{w:4});
 for(let x=10;x<14;x++) act(z,x,3,{type:'msg',text:"Across the street, an apartment with the blinds wide open.\nYou close the curtains. Some things can't be unseen."});
 obj(z,'kcounter',14,3,{w:3,tone:'#6b4226'});
 for(let x=14;x<17;x++) act(z,x,3,{type:'msg',text:"The sideboard. Inside: the good china, the everyday china, and the 'guest' china, which is different from the good china."});
 obj(z,'frame',15,1,{tone:'#6a8a4a'});
 obj(z,'rug',11,8,{w:6,h:5,low:true,tone:'#d8c8a8'});
 obj(z,'couch',12,8,{w:4,color:'#e6dcc6'}); obj(z,'coffee',13,10,{w:2}); obj(z,'armchair',11,10,{face:'right'}); obj(z,'armchair',16,10,{face:'left'});
 for(let x=12;x<16;x++) act(z,x,8,{type:'msg',text:"A very nice couch. Monica would like you to sit on it… carefully. Coasters are on the table."});
 act(z,13,10,{type:'msg',text:"A bowl of index cards in Ross's handwriting. 'APARTMENT QUIZ: DO NOT TOUCH.'"}); act(z,14,10,{type:'msg',text:"A bowl of index cards in Ross's handwriting. 'APARTMENT QUIZ: DO NOT TOUCH.'"});
 obj(z,'bookshelf',8,3); act(z,8,3,{type:'msg',text:"Monica's bookshelf. The books are sorted by color, then height, then author. There is a label maker on the top shelf."});
 obj(z,'floorlamp',17,3); obj(z,'plant',17,14); obj(z,'plant',11,14);
 obj(z,'coatrack',7,15); act(z,7,15,{type:'msg',text:"The coat rack. Somebody's left a purse here. It might be Phoebe's. It might be from 1996."});
 // bedrooms: Monica's (top), Rachel's (bottom)
 wallS(z,18,2,1,14); paint(z,'wood',18,5,1,1); paint(z,'wood',18,12,1,1); wallS(z,19,9,6,1);
 paint(z,'carpet',19,3,6,6); paint(z,'carpetR',19,10,6,6);
 obj(z,'bed',21,3,{h:2}); obj(z,'nightstand',20,3); obj(z,'nightstand',23,3); obj(z,'bookshelf',24,3); obj(z,'armchair',20,7,{color:'#c9a0b8'});
 act(z,21,4,{type:'msg',text:"Monica's bed. The sheets have been ironed. The pillows have been fluffed. To an exact height."}); act(z,22,4,{type:'msg',text:"Monica's bed. The corners are hospital-tight."});
 act(z,24,4,{type:'msg',text:"Monica's closet shelf. Labeled bins: 'Shoes — Fancy', 'Shoes — Less Fancy', 'Shoes — Monica Is Not Allowed To Buy More'."});
 obj(z,'bed',21,10,{h:2,color:'#e8a0b8'}); obj(z,'nightstand',20,10); obj(z,'nightstand',23,10); obj(z,'mirror',24,10); obj(z,'rack',20,14,{tone:'#e07aa0'});
 act(z,21,11,{type:'msg',text:"Rachel's bed. Somewhere under these pillows is a list titled 'Pros and Cons.' You decide not to look."}); act(z,22,11,{type:'msg',text:"Rachel's bed. Very pink. Very comfy."});
 act(z,20,14,{type:'msg',text:"Rachel's clothes. Half of them still have the tags on. She's 'deciding.'"}); act(z,21,14,{type:'msg',text:"Rachel's clothes. Half of them still have the tags on."});
 z.npcs.push({id:'monica',name:'Monica',cast:true,x:4,y:9,dir:'down',talk:'monica',reward:'cup',wander:[1,9,7,4],walkOn:['tileK'],look:{skin:'#efc9a8',hair:'#2a1d17',style:'bob',fem:true,shirt:'#c0573a',pants:'#2b2b30'}});
 z.npcs.push({id:'ross',name:'Ross',cast:true,x:16,y:12,dir:'down',talk:'ross',reward:'frame',look:{skin:'#efc9a8',hair:'#4a3426',style:'short',shirt:'#7a8a6a',pants:'#3b3b4a'}});
})();

/* ---------------- Joey & Chandler's apartment (#19) ----------------
 * v1.5 layout from the floor plan: the two recliners facing the entertainment unit, the couch under the
 * windows, the kitchen island with stools, the foosball table, both bedrooms on the left, bathroom up top. */
(function(){
 const z = Z('joey',"Joey & Chandler's",24,16,'wood'); z.tune='home';
 z.bg='#120e0a';
 paint(z,'wallC',0,0,24,2); paint(z,'wains',0,2,24,1);
 wallS(z,0,0,1,16); wallS(z,23,0,1,16);
 paint(z,'frontA',0,15,24,1); paint(z,'mat',11,15,2,1);
 door(z,11,15,'hall',9,3,'down'); door(z,12,15,'hall',9,3,'down');
 // bedrooms: Chandler's (top), Joey's (bottom)
 wallS(z,7,2,1,13); paint(z,'wood',7,5,1,1); paint(z,'wood',7,11,1,1); wallS(z,1,8,6,1);
 obj(z,'bed',2,3,{h:2,color:'#2a3a7a'}); obj(z,'nightstand',1,3); obj(z,'desk',4,3); obj(z,'bookshelf',6,3);
 act(z,2,4,{type:'msg',text:"Chandler's bed. Navy sheets. A copy of 'Weekend at Bernie's' on the nightstand, bookmarked."}); act(z,3,4,{type:'msg',text:"Chandler's bed. Navy sheets."});
 act(z,4,4,{type:'msg',text:"Chandler's desk. A sticky note: 'Remember what you do for a living.' It doesn't help."}); act(z,5,4,{type:'msg',text:"Chandler's desk. Spreadsheets. So many spreadsheets."});
 obj(z,'bed',2,9,{h:2,color:'#2a3a7a'}); obj(z,'nightstand',4,9); obj(z,'entertain',5,9); obj(z,'boxes',1,13);
 act(z,2,10,{type:'msg',text:"Joey's bed. There's a stuffed penguin-shaped dent in the pillow. Hugsy is out. Somewhere."}); act(z,3,10,{type:'msg',text:"Joey's bed. 'Joey doesn't share food.' Or beds."});
 act(z,5,9,{type:'msg',text:"Joey's dresser. A framed headshot of Joey sits on top. It's signed. To himself."}); act(z,6,9,{type:'msg',text:"Joey's dresser. One drawer is just sandwiches."});
 // bathroom (top right)
 paint(z,'bath',19,3,4,3); wallS(z,18,2,1,4); wallS(z,18,6,5,1); paint(z,'bath',21,6,1,1);
 obj(z,'bathtub',19,3); obj(z,'toilet',21,3); obj(z,'sink',22,3);
 act(z,19,3,{type:'msg',text:"The bathtub. Someone has left a rubber duck in it. The real duck is very jealous."});
 // living room
 obj(z,'window',9,0,{w:2}); obj(z,'window',14,0,{w:2});
 obj(z,'couch',10,3,{w:4,color:'#c48a5a'}); obj(z,'coffee',11,5,{w:2}); obj(z,'floorlamp',9,3); obj(z,'dogstatue',15,3);
 for(let x=10;x<14;x++) act(z,x,3,{type:'msg',text:"The couch. There's a permanent Joey-shaped dip on the left side."});
 act(z,11,5,{type:'msg',text:"The coffee table. A TV Guide with every episode of Baywatch circled."}); act(z,12,5,{type:'msg',text:"The coffee table. A TV Guide with every episode of Baywatch circled."});
 act(z,15,3,{type:'msg',text:"A big white ceramic dog. It stares into the middle distance with great dignity."});
 obj(z,'rug',9,7,{w:5,h:5,low:true,tone:'#8a8a90'});
 obj(z,'entertain',8,8,{face:'right',h:3}); obj(z,'recliner',11,8,{face:'left'}); obj(z,'recliner',11,10,{face:'left'});
 act(z,8,9,{type:'msg',text:"The entertainment center. The TV is paused on Baywatch. Nobody is allowed to unpause it but Joey and Chandler."}); act(z,8,10,{type:'msg',text:"The TV is paused on Baywatch."});
 act(z,11,8,{type:'msg',text:"Joey's recliner. He calls her Rosita. Do not, under any circumstances, sit in Rosita."});
 act(z,11,10,{type:'msg',text:"Chandler's recliner. It reclines. That's really all he needs in life."});
 // kitchen
 paint(z,'tileK',15,7,8,5);
 wallS(z,15,6,3,1); obj(z,'kcounter',15,7,{w:3,tone:'#e8e4d8'}); obj(z,'kcounter',18,7,{w:2,tone:'#e8e4d8'}); obj(z,'stove',20,7); obj(z,'fridge',22,7);
 obj(z,'kcounter',17,9,{w:2,tone:'#f2efe6'}); obj(z,'stool',17,10); obj(z,'stool',18,10);
 act(z,22,7,{type:'msg',text:"Inside: one jar of jam, a carton of milk, and a sign that says 'JOEY'S. DO NOT EAT.' on everything."});
 for(const x of [15,16,17,18,19]) act(z,x,7,{type:'msg',text:"Pizza boxes. Several. Stacked with real architectural ambition."});
 act(z,17,9,{type:'msg',text:"The kitchen island. A fruit bowl with one apple in it. The apple is plastic. Joey has bitten it twice."}); act(z,18,9,{type:'msg',text:"The kitchen island. Breakfast is cereal. Lunch is cereal. Dinner is Monica's."});
 obj(z,'foosball',19,12);
 act(z,19,12,{type:'msg',text:"The foosball table. Chandler has been undefeated since 1994. (Allegedly.)"}); act(z,20,12,{type:'msg',text:"The foosball table. Chandler has been undefeated since 1994. (Allegedly.)"});
 obj(z,'canoe',14,13); act(z,14,13,{type:'msg',text:"The canoe. Joey and Chandler have a canoe in their living room. Nobody knows how to use it. Nobody is giving it back."});
 for(const x of [15,16]) act(z,x,13,{type:'msg',text:"The canoe. Nobody is giving it back."});
 obj(z,'plant',22,13); obj(z,'plant',8,3); obj(z,'coatrack',10,14);
 z.npcs.push({id:'joey',name:'Joey',cast:true,x:13,y:12,dir:'down',talk:'joey',reward:'hugsy',wander:[9,12,5,2],walkOn:['wood'],look:{skin:'#e8bf9a',hair:'#2a1d17',style:'short',shirt:'#4a5a8a',pants:'#2b2b30'}});
 z.npcs.push({id:'chandler',name:'Chandler',cast:true,x:18,y:12,dir:'right',talk:'chandler',reward:'dog',look:{skin:'#efc9a8',hair:'#4a3426',style:'short',shirt:'#5a7a5a',pants:'#3b3b4a'}});
 z.npcs.push({id:'duck',name:'Duck',x:14,y:9,dir:'right',talk:'duck',wander:[13,8,9,4],walkOn:['wood','tileK'],look:{animal:'duck'}});
 z.npcs.push({id:'chick',name:'Chick',x:16,y:11,dir:'right',talk:'chick',wander:[13,8,9,4],walkOn:['wood','tileK'],look:{animal:'chick'}});
})();

/* =====================================================================
 *  v0.3: the rest of the city. Builders first, then each neighborhood.
 * ===================================================================== */
// A cast member who quizzes you: script = {greet:[...], offer, tags, n, need, reward, win, lose, yes, no, noReply, again}
function cast(z,id,name,x,y,dir,look,script,extra){ z.npcs.push(Object.assign({id,name,cast:true,x,y,dir,look,script,reward:script.reward},extra||{})); }
function townie(z,id,x,y,look,lines,quiz,wander,walkOn){ z.npcs.push({id,x,y,dir:'down',look,lines,quiz,wander:wander||[0,0,z.w,z.h],walkOn:walkOn||['walk','path','grass','sand']}); }
const F=(skin,hair,style,shirt,o)=>Object.assign({skin,hair,style,shirt,pants:'#3a3a44'},o||{});
// Exterior street: buildings on the north side (rows 1-8), Grove-style avenue (rows 11-14), and a south side that is
// more buildings (rows 17-24), a park, or a river promenade.
function street(id,name,w,o){
 const z=Z(id,name,w,28,'walk'); z.tune=o.tune||'city';
 paint(z,'roofs',0,0,w,1); paint(z,'road',0,11,w,4); paint(z,'laneH',0,12,w,1);
 const cw=o.cross||[]; for(const x of cw) paint(z,'crossH',x,11,2,4);
 const n=Math.max(1,Math.round(w/22)); z.taxiRows=[{row:12,dir:-1,n},{row:13,dir:1,n}];
 const near=x=>cw.some(c=>x>=c-2&&x<=c+2);
 const B=(b,y)=>{ obj(z,'building',b.x,y,Object.assign({h:8},b,{doors:(b.doors||[]).map(d=>({x:d.x,kind:d.kind||'shop',color:d.color}))}));
  for(const d of b.doors||[]){ const dx=b.x+d.x,dy=y+7; if(d.to) door(z,dx,dy,d.to[0],d.to[1],d.to[2],'up'); else msgDoor(z,dx,dy,d.msg||"It's locked."); } };
 for(const b of o.north||[]) B(b,1);
 if(o.south==='park'){ paint(z,'grass',0,17,w,11); paint(z,'path',0,22,w,2);
  for(const gx of o.gaps||[]) paint(z,'path',gx,17,2,5);
  for(let x=0;x<w;x++){ if((o.gaps||[]).some(g=>x>=g&&x<g+2)) continue; if(o.subway&&x>=o.subway.x&&x<o.subway.x+2) continue; obj(z,'fence',x,17); }
  for(let x=2;x<w;x+=7){ obj(z,'tree',x,19+(x%3),{park:true}); obj(z,'tree',x+3,26,{park:true}); }
 } else if(o.south==='water'){ paint(z,'walk',0,15,w,3); paint(z,'water',0,19,w,9);
  for(let x=0;x<w;x++) obj(z,'rail',x,18);
  for(let x=5;x<w;x+=10) obj(z,'bench',x,17);
 } else { for(const b of o.south||[]) B(b,17); for(let x=6;x<w;x+=11) if(!near(x)) obj(z,'tree',x,15); }
 for(let x=3;x<w;x+=9) if(!near(x)) obj(z,'lamp',x,10);
 const cols=['#3b6fb6','#8f2f2f','#3a3a44','#6a8f4a','#c9c9cf','#7a4a8f'];
 for(let x=3,i=0;x<w-4;x+=7+(i%3)*2,i++){ if(cw.some(c=>x>=c-4&&x<=c+5)) continue; obj(z,'car',x,i%2?11:14,{color:cols[i%cols.length],dir:i%2?-1:1}); }
 if(o.subway){ const sx=o.subway.x,sy=o.subway.y; obj(z,'subway',sx,sy,{text:o.subway.label}); act(z,sx,sy,{type:'subway'}); act(z,sx+1,sy,{type:'subway'}); z.subwaySpawn=o.subway.spawn; }
 if(o.extra) o.extra(z);
 return z;
}
// Interior room with an exit mat in the bottom wall that leads back outside.
function room(id,name,w,h,o){
 const z=Z(id,name,w,h,o.floor||'wood'); z.bg=o.bg||'#120d0a'; z.tune=o.tune||'home';
 paint(z,o.wall||'wallC',0,0,w,2); paint(z,'wains',0,2,w,1); paint(z,'wallS',0,0,1,h); paint(z,'wallS',w-1,0,1,h); paint(z,'frontA',0,h-1,w,1);
 if(o.to){ const ex=o.exitX; paint(z,'mat',ex,h-1,2,1); door(z,ex,h-1,o.to[0],o.to[1],o.to[2],'down'); door(z,ex+1,h-1,o.to[0],o.to[1],o.to[2],'down'); }
 if(o.extra) o.extra(z);
 return z;
}
// Outdoor postcard scene for the airport trips.
function scene(id,name,w,h,fill,o){ const z=Z(id,name,w,h,fill); z.tune=o.tune||'travel'; z.bg=o.bg||'#16121e'; if(o.extra) o.extra(z); return z; }
const homeAct=(z,x,y,label)=>act(z,x,y,{type:'fly',to:'airport',tx:13,ty:9,dir:'up',label:label||'Back to JFK'});

/* ---------------- Ross's apartment (across the street) ---------------- */
room('rossapt',"Ross's Apartment",22,15,{wall:'wallC',to:['village',32,9],exitX:16,extra(z){
 // v1.5 layout from the floor plan: two bedrooms and the bathroom along the top, the living room on the big
 // rug, the round dining table in the corner, the galley kitchen on the right. Marcel is loose.
 wallS(z,8,2,1,5); wallS(z,15,2,1,5); wallS(z,1,7,20,1); for(const x of [4,11,19]) paint(z,'wood',x,7,1,1);
 paint(z,'carpet',1,3,7,4); paint(z,'carpet',9,3,6,4); paint(z,'bath',16,3,5,4); paint(z,'bath',19,7,1,1);
 obj(z,'window',2,0,{w:2}); obj(z,'window',11,0,{w:2});
 obj(z,'bed',3,3,{h:2,color:'#c0392b'}); obj(z,'nightstand',2,3); obj(z,'nightstand',5,3); obj(z,'armchair',6,5,{color:'#9cc8e6'});
 act(z,3,4,{type:'msg',text:"Ross's bed. On the pillow: a dinosaur plush named 'Rexy.' Ross says it's Ben's. It is not Ben's."}); act(z,4,4,{type:'msg',text:"Ross's bed. Red sheets. Very romantic. Very 1997."});
 obj(z,'bed',11,3,{h:2,color:'#7a9a4a'}); obj(z,'nightstand',10,3); obj(z,'nightstand',13,3); obj(z,'boxes',9,6,{},"A box labeled 'BEN'S TOYS.' On top: a tiny Holiday Armadillo doll.");
 act(z,9,6,{type:'msg',text:"A box labeled 'BEN'S TOYS.' On top: a tiny Holiday Armadillo doll."});
 act(z,11,4,{type:'msg',text:"The guest room. Ben's room on weekends. There's a glow-in-the-dark solar system on the ceiling, scientifically accurate."}); act(z,12,4,{type:'msg',text:"Ben's bed. A note: 'NO MONKEYS ON THE BED.'"});
 obj(z,'toilet',16,3); obj(z,'sink',17,3); obj(z,'bathtub',19,3);
 act(z,19,3,{type:'msg',text:"The bathtub. A bottle of baby powder and a bottle of lotion sit on the edge. Ross would like you not to ask."}); act(z,20,3,{type:'msg',text:"The bathtub. Very clean. Suspiciously clean."});
 // living room
 obj(z,'rug',4,9,{w:8,h:4,low:true,geo:true,tone:'#c8b088'});
 obj(z,'couch',5,9,{w:4,color:'#7a4a2a'}); obj(z,'coffee',6,11,{w:2}); obj(z,'armchair',10,10,{color:'#2a2a30',face:'left'});
 for(let x=5;x<9;x++) act(z,x,9,{type:'msg',text:"Ross's couch. It's the one he pivoted up the stairs. It is now in two pieces, held together with optimism."});
 act(z,6,11,{type:'msg',text:"The coffee table. A paper titled 'Why the Cretaceous Was Actually the Best Period (A Rebuttal).'"}); act(z,7,11,{type:'msg',text:"The coffee table. Coasters shaped like trilobites."});
 obj(z,'tv',6,13,{back:true}); act(z,6,13,{type:'msg',text:"A documentary about the Cretaceous period is paused. It has been paused for three days."}); act(z,7,13,{type:'msg',text:"A documentary about the Cretaceous period is paused. It has been paused for three days."});
 obj(z,'dinoskull',1,8); act(z,1,8,{type:'msg',text:"A replica dinosaur skull. Ross named it. He won't tell you what he named it."});
 obj(z,'bookshelf',2,8); obj(z,'bookshelf',3,8);
 for(const x of [2,3]) act(z,x,8,{type:'msg',text:"Ross's bookshelf: twelve books about dinosaurs, three books about dinosaurs for kids, and one book called 'Divorce and You.'"});
 obj(z,'dining',1,11);
 for(const [x,y] of [[1,11],[2,11],[3,11],[1,12],[2,12],[3,12]]) act(z,x,y,{type:'msg',text:"The dining table. Ross eats here alone most nights, reading about rocks. He calls it 'me time.'"});
 obj(z,'floorlamp',11,13); obj(z,'plant',13,13); obj(z,'coatrack',18,13);
 obj(z,'trunk',9,13);
 act(z,9,13,{type:'quiz',name:'The Costume Trunk',icon:'armadillo',script:{narrate:true,greet:["A trunk labeled 'HOLIDAY STUFF — ROSS. DO NOT OPEN.' Something inside looks… armored.","Taped to the lid: 'Answer five Ross questions, get four right, and the costume is yours. Signed, the Holiday Armadillo.'"],offer:"Open the trunk?",tags:'ross',n:5,need:4,reward:'armadillo',yes:'Open it',no:'Leave it closed',noReply:'Probably wise.',win:"The trunk creaks open. Inside: one Holiday Armadillo costume, slightly dusty, completely magnificent.",lose:"The lid snaps shut. The armadillo is not impressed. Try again!"}});
 // galley kitchen
 paint(z,'tileK',15,8,6,4); wallS(z,14,8,1,4); paint(z,'tileK',14,10,1,1);
 obj(z,'kcounter',15,8,{w:3,tone:'#e8e4d8'}); obj(z,'stove',18,8); obj(z,'fridge',20,8); obj(z,'table',19,10); obj(z,'chair',18,10,{face:'right'}); obj(z,'chair',20,10,{face:'left'});
 act(z,20,8,{type:'msg',text:"The fridge. A Thanksgiving leftovers sandwich used to live here. It's at the museum now. In danger."});
 for(const x of [15,16,17]) act(z,x,8,{type:'msg',text:"The counter. A label maker (borrowed from Monica, never returned) and a jar of gravy."});
 // Marcel (v1.5 collectible): catch him and answer his question
 z.npcs.push({id:'marcel',name:'Marcel',x:4,y:13,dir:'left',talk:'collect',wander:[1,8,13,6],walkOn:['wood'],look:{animal:'monkey',hd:'marcel'},
  collect:{item:'marcel',lines:["A small white-headed monkey is bouncing around the living room. He has a tiny banana and a very big attitude.","He stops. He stares at you. He seems to be waiting for something. A song, maybe?"],
   q:"What's Marcel's favorite song?",answers:["The Lion Sleeps Tonight","Smelly Cat","Walking on Sunshine","Monkey Business"],
   win:"You start humming 'The Lion Sleeps Tonight.' Marcel lights up, jumps onto your shoulder and refuses to get down. He's yours now. (Ross says it's fine. Ross is crying a little.)",
   lose:"Marcel turns around and sulks. Wrong song. Very wrong song.",
   have:"Marcel is hanging off the floor lamp. He waves. He's very happy you came back."}});
 cast(z,'ross_h','Ross',9,12,'down',F('#efc9a8','#4a3426','short','#7a8a6a',{pants:'#3b3b4a'}),{reward:'pants',tags:'ross',n:5,need:4,
  greet:["Oh, hey! Welcome to my apartment. Yes, it's THAT apartment. Ugly Naked Guy's old place. I got it fair and square. Mostly.","I've been wearing my leather pants a lot lately. Big mistake, actually. Long story. Involves lotion and powder."],
  offer:"Five questions about me. Four right and you can have the pants. Please. Take the pants.",yes:'Quiz me',no:'Ask about the pants',noReply:"No. We don't talk about the pants. …Okay, we talk about them a little.",
  win:"You know me better than my own family! Here. The pants. Never put lotion on with them on. Trust me.",lose:"Okay, that's fine. Totally fine. I'm fine! Come back anytime."});
}});

/* ---------------- Phoebe's apartment (v1.5, from the floor plan) ---------------- */
room('phoebe',"Phoebe's Apartment",24,15,{wall:'wallG',to:['village',29,25],exitX:20,tune:'home',extra(z){
 // bedroom on the left with the green bench, bathroom up top, galley kitchen with the island,
 // living room with the green couch and the pink armchair, round dining table by the door
 wallS(z,7,2,1,12); paint(z,'wood',7,9,1,1);
 obj(z,'bed',2,3,{h:2,color:'#e8d898'}); obj(z,'nightstand',1,3); obj(z,'nightstand',4,3); obj(z,'couch',2,5,{w:3,color:'#3f8a4a'});
 obj(z,'armchair',6,8,{color:'#e8c050',face:'left'}); obj(z,'sidetable',5,3); obj(z,'plant',1,12); obj(z,'mirror',6,3);
 act(z,1,4,{type:'msg',text:"Phoebe's bed. A dreamcatcher hangs over it. It has caught one (1) dream, which Phoebe says was about Gladys."}); act(z,4,4,{type:'msg',text:"Phoebe's bed. Very cozy. Smells faintly of incense and cat."});
 for(let x=2;x<5;x++) act(z,x,5,{type:'msg',text:"A green bench at the foot of the bed. Phoebe meditates here. Or naps. She says it's the same thing."});
 obj(z,'window',2,0,{w:2});
 // bathroom
 paint(z,'bath',8,3,6,3); wallS(z,14,2,1,4); wallS(z,8,6,7,1); paint(z,'bath',11,6,1,1);
 obj(z,'sink',8,3); obj(z,'toilet',10,3); obj(z,'bathtub',12,3);
 act(z,12,3,{type:'msg',text:"The clawfoot tub. A rubber duck, a candle, and a tiny sign: 'Ursula: this is not your bathroom.'"});
 // kitchen
 paint(z,'tileK',8,7,5,7);
 obj(z,'kcounter',8,7,{w:2,tone:'#7ac8c8'}); obj(z,'stove',10,7); obj(z,'fridge',12,7); obj(z,'kcounter',9,10,{w:2,tone:'#7ac8c8'});
 act(z,12,7,{type:'msg',text:"Phoebe's fridge. Magnets shaped like vegetables. A note: 'Buy cat food. (For the cat in my mom's soul.)'"});
 act(z,9,10,{type:'msg',text:"The kitchen island. A bowl of fruit, and a cookie recipe from Phoebe's grandmother. (It's from the back of the chocolate chip bag.)"}); act(z,10,10,{type:'msg',text:"The kitchen island. A plate of cookies, still warm."});
 for(const x of [8,9,10]) act(z,x,7,{type:'msg',text:"A spice rack organized by 'vibes.'"});
 // living room
 obj(z,'window',16,0,{w:3}); obj(z,'desk',15,3); obj(z,'armchair',20,3,{color:'#e8b830'}); obj(z,'floorlamp',22,3);
 act(z,15,3,{type:'msg',text:"Phoebe's desk. Song lyrics in progress: 'Sticky Shoes,' 'Two of Them Kissed Last Night,' and a third one that's just the word 'cat' eleven times."}); act(z,16,3,{type:'msg',text:"Phoebe's desk. A massage-table brochure and a guitar pick."});
 obj(z,'rug',14,7,{w:6,h:5,low:true,geo:true,tone:'#c8a0d0'});
 obj(z,'couch',15,8,{w:4,color:'#5a9a3a'}); obj(z,'coffee',16,10,{w:2}); obj(z,'armchair',17,11,{color:'#d050a0',back:true});
 for(let x=15;x<19;x++) act(z,x,8,{type:'msg',text:"Phoebe's green couch. There's a guitar on it, and a pillow embroidered with 'SMELLY CAT.'"});
 act(z,16,10,{type:'msg',text:"The coffee table. A deck of tarot cards, mid-reading. The top card is 'The Taxi.' That's not a real tarot card."}); act(z,17,10,{type:'msg',text:"The coffee table. Incense, a cassette tape, and a very old candle."});
 obj(z,'dining',20,10);
 for(const [x,y] of [[20,10],[21,10],[22,10],[20,11],[21,11],[22,11]]) act(z,x,y,{type:'msg',text:"The round dining table. Phoebe's set it for seven: six friends and her grandmother's spirit."});
 obj(z,'plant',22,13); obj(z,'plant',13,7); obj(z,'coatrack',19,13);
 z.npcs.push({id:'phoebe_h',x:16,y:12,dir:'down',look:{hd:'phoebe_sundress',skin:'#efc9a8',hair:'#4a3426',style:'long',fem:true,outfit:'dress',shirt:'#e8b830'},quiz:true,
  wander:[14,12,6,2],walkOn:['wood'],lines:["Oh, hi! Welcome to my apartment! Watch out for the floorboard by the door. It has opinions.","My taxi's parked right outside, if you need a ride. I mean, it's not really a taxi anymore. It's a car that looks like a taxi. Spiritually it's still a taxi."]});
}});

/* ---------------- Midtown ---------------- */
street('midtown','Midtown',48,{cross:[20,38],subway:{x:4,y:26,label:'5 AV / 59 ST',spawn:[6,25,'right']},
 north:[
  {x:0,w:8,style:'slate',tower:true,shop:true,awning:'#3a3a46',signBg:'#1f1f26',sign:'9 WEST 57TH',hd:'x_mid_57th',signLift:44,signCx:64,signW:104,plate:true,doors:[{x:1,to:['office',8,10]}]},
  {x:8,w:6,style:'brick',shop:true,awning:'#8a2a2a',signBg:'#2a1a1a',sign:"RIFF'S",hd:'x_mid_riffs',signLift:40,signCx:60,signW:52,doors:[{x:1,msg:"Riff's. The gang's lunch spot next to Chandler's office. Today's special is a club sandwich the size of your head."}]},
  {x:14,w:12,style:'cream',shop:true,awning:'#2a2a2a',signBg:'#f4f1ea',signFg:'#1a1a1a',sign:"BLOOMINGDALE'S",hd:'x_mid_bloomies',signLift:46,signCx:70,signW:126,doors:[{x:2,to:['bloomies',10,11]}]},
  {x:26,w:8,style:'slate',shop:true,awning:'#2a3a5a',signBg:'#1b2340',sign:'RALPH LAUREN',hd:'x_mid_ralph',signLift:46,signCx:47,signW:84,doors:[{x:1,to:['ralph',8,10]}]},
  {x:34,w:8,style:'cream',shop:true,awning:'#1a1a1a',signBg:'#1a1a1a',sign:'SAKS FIFTH AVE',hd:'x_mid_saks',signLift:46,signCx:47,signW:84,doors:[{x:1,msg:"Saks Fifth Avenue. Rachel could spend an entire paycheck in the shoe department. She has."}]},
  {x:42,w:6,style:'brick',fire:true,tower:true,hd:'x_mid_apt',doors:[{x:1,kind:'stoop',msg:"An apartment building. Somebody upstairs is practicing the bagpipes."}]}],
 south:[
  {x:0,w:12,style:'cream',shop:true,awning:'#c9a24a',signBg:'#5a4a2a',signFg:'#f3e3b0',sign:'THE PLAZA',hd:'x_mid_plaza',signLift:44,signCx:96,signW:120,plate:true,doors:[{x:1,msg:"The Plaza Hotel. Monica and Chandler celebrated their engagement here, until Ross and Rachel stole the spotlight."}]},
  {x:12,w:8,style:'slate',shop:true,awning:'#3a2a4a',signBg:'#2a1a3a',sign:'THE PIERRE',hd:'x_mid_pierre',signLift:44,signCx:64,signW:104,plate:true,doors:[{x:1,msg:"The Pierre. A very fancy Fifth Avenue hotel. The kind of place where weddings get planned for years."}]},
  {x:22,w:14,style:'slate',shop:true,awning:'#c0262c',signBg:'#1a2a5a',sign:'MADISON SQUARE GARDEN',hd:'x_mid_msg',signLift:54,signCx:110,signW:140,doors:[{x:7,msg:"Madison Square Garden. Tonight: Rangers hockey. Someone near the glass is about to get hit with a puck."}]},
  {x:36,w:12,style:'neon',shop:true,awning:'#e8642a',signBg:'#1a1a1a',signFg:'#ffd84a',sign:'TIMES SQUARE',hd:'x_mid_times',signLift:54,signCx:94,signW:120,doors:[{x:6,msg:"Times Square. Bright lights, enormous billboards, and a guy in a giant hot dog costume who wants a photo with you."}]}],
 extra(z){
  cast(z,'usher','Usher',30,25,'down',F('#8d5a3b','#1c1410','short','#c0262c',{pants:'#1a2a5a'}),{reward:'puck',tags:'ross places',n:5,need:4,
   greet:["Tickets? …No? Okay. I've worked the Garden for twenty years. I've seen it all.","Once, a guy got hit right in the face with a puck. Then his friends kept the puck. Classy."],
   offer:"Five questions. Get four right and you get a real Rangers puck. Lightly used.",yes:"I'm in",no:'No thanks',noReply:"Suit yourself. Keep your head up near the glass.",
   win:"Not bad! Here's your puck. Keep it away from your face.",lose:"Ooh, you got checked into the boards on that one. Try again!"});
  townie(z,'m1',10,10,F('#f1c9a5','#c9a253','long','#e07aa0',{fem:true,outfit:'dress'}),["I've been shopping for six hours. My feet hurt. I regret nothing."],true);
  townie(z,'m2',28,16,F('#c68a5a','#2a1d17','short','#3a6fb0'),["Excuse me, which way is the Empire State Building? …It's huge, how do I keep losing it?"],true);
  townie(z,'m3',40,25,F('#e0ac7e','#7a4b2a','bun','#5aa06a',{fem:true}),["I work in the office tower over there. Some guy on my floor does 'statistical analysis and data reconfiguration.' Nobody knows what that means."],false);
  townie(z,'m4',16,25,F('#5e3a26','#1c1410','bald','#8e6bbf'),["The Plaza does a great brunch. Very fancy. They give you, like, nine forks."],true);
 }});
room('office',"Chandler's Office",18,12,{wall:'wallC',floor:'carpet',to:['midtown',4,9],exitX:8,tune:'city',extra(z){
 obj(z,'window',3,0,{w:2}); obj(z,'window',12,0,{w:2}); obj(z,'frame',8,1,{tone:'#5a5a6a'});
 for(const [x,y] of [[2,4],[6,4],[2,8],[12,8]]){ obj(z,'cubicle',x,y); act(z,x,y,{type:'msg',text:"A cubicle. On the screen: a spreadsheet called WENUS_FINAL_v7. Better not ask."}); act(z,x+1,y,{type:'msg',text:"A cubicle. On the screen: a spreadsheet called WENUS_FINAL_v7. Better not ask."}); }
 obj(z,'cooler',15,3); act(z,15,3,{type:'msg',text:"The water cooler. The site of a lot of office gossip about the guy who 'does something with numbers.'"});
 obj(z,'plant',1,10); obj(z,'plant',16,10);
 cast(z,'chandler_o','Chandler',11,5,'down',F('#efc9a8','#4a3426','short','#e8e8ec',{pants:'#3b3b4a'}),{reward:'card',tags:'chandler',n:5,need:4,
  greet:["Oh, hi. Welcome to my office. This is where dreams come to fill out forms.","My job? Statistical analysis and data reconfiguration. Don't worry, nobody knows what it means. Including me."],
  offer:"Five questions about me. Get four right and you get my business card. It has my job title on it. Mostly so I can remember it.",yes:'Deal',no:'Leave him to his spreadsheets',noReply:"Sure, go. Leave me here. With the WENUS.",
  win:"Look at you! Here's my card. If anybody asks what I do, just make something up. Everybody else does.",lose:"Hey, that's okay. Nobody knows anything about me. Not even my boss."});
 townie(z,'o1',14,6,F('#e0ac7e','#2a1d17','short','#5a7aa8'),["Chandler's the boss? Huh. He told me he's 'in transponstering.'"],true,[9,3,8,7],['carpet']);
 townie(z,'o2',5,6,F('#f1c9a5','#b5462a','bob','#b884c9',{fem:true,outfit:'skirt'}),["I've worked here for six years and I still don't know what we make."],true,[1,3,10,7],['carpet']);
}});
room('ralph',"Ralph Lauren: Rachel's Office",16,11,{wall:'wallC',floor:'carpetR',to:['midtown',29,9],exitX:7,tune:'city',extra(z){
 // v1.5, from the set photos: the desk, the cream chair, the window with blinds and brown drapes, the mood board
 obj(z,'drapewindow',5,0,{w:6,h:2}); obj(z,'frame',1,1,{tone:'#c9a24a'}); obj(z,'frame',13,1,{tone:'#8a3a3a'}); obj(z,'frame',3,1,{tone:'#3a5a8a'});
 for(let x=5;x<11;x++) act(z,x,3,{type:'msg',text:"The view: Midtown skyscrapers through the blinds. Rachel says she can see Bloomingdale's from here. She can't."});
 obj(z,'desk',7,5); obj(z,'officechair',8,4);
 act(z,7,5,{type:'msg',text:"Rachel's desk. A laptop, fabric swatches, and a sticky note: 'Do NOT date the assistant.' It's been underlined three times."}); act(z,8,5,{type:'msg',text:"Rachel's desk. A framed photo of the gang at Central Perk, and a coffee from (where else) Central Perk."});
 obj(z,'moodboard',12,4); act(z,12,4,{type:'msg',text:"The mood board for next season: tweeds, blazers, and one sketch labeled 'Ross? No.'"});
 obj(z,'armchair',13,7,{face:'left'}); obj(z,'bookshelf',1,3); obj(z,'bookshelf',2,3); obj(z,'plant',14,3); obj(z,'floorlamp',11,3); obj(z,'coatrack',14,9);
 for(const x of [1,2]) act(z,x,3,{type:'msg',text:"Look books from every season since 1967. Rachel has read all of them. Twice."});
 obj(z,'mannequin',1,7); act(z,1,7,{type:'msg',text:"A mannequin in a sample from the fall line. It looks better on the mannequin. It always does."});
 obj(z,'rack',3,8,{tone:'#3a3a44'}); for(const x of [3,4]) act(z,x,8,{type:'msg',text:"Samples waiting for Rachel's approval. She's approved all of them. She has great taste."});
 z.npcs.push({id:'tag',name:'Tag',x:10,y:7,dir:'left',look:F('#f1c9a5','#4a3426','short','#5a7aa8',{pants:'#5a5a62'}),quiz:true,wander:[5,6,8,3],walkOn:['carpetR'],
  lines:["Hi! I'm Tag, Rachel's assistant. I organize her schedule, her files, and her… other files.","She hired me for my 'organizational skills.' I'm pretty sure it was the organizational skills."]});
}});

room('bloomies',"Bloomingdale's",22,13,{wall:'wallC',floor:'marble',to:['midtown',18,9],exitX:10,tune:'city',extra(z){
 obj(z,'window',3,0,{w:2}); obj(z,'window',17,0,{w:2}); obj(z,'wallsign',7,0,{w:8,text:"Bloomingdale's"});
 for(const [x,y] of [[2,4],[5,4],[15,4],[18,4],[2,9],[18,9]]){ obj(z,'rack',x,y,{tone:['#d9534f','#5b9bd5','#f0ad4e','#8e6bbf','#5cb85c','#e07aa0'][(x+y)%6]}); act(z,x,y,{type:'msg',text:'A rack of very expensive clothes. You check one price tag and immediately put it back.'}); act(z,x+1,y,{type:'msg',text:'A rack of very expensive clothes. You check one price tag and immediately put it back.'}); }
 obj(z,'mannequin',9,4); obj(z,'mannequin',12,4); act(z,9,4,{type:'msg',text:'A mannequin in this season\'s look. It looks better on the mannequin. It always does.'}); act(z,12,4,{type:'msg',text:'A mannequin. It has excellent posture.'});
 obj(z,'kcounter',7,8,{w:4,tone:'#3a3a44'}); for(let x=7;x<11;x++) act(z,x,8,{type:'msg',text:'The perfume counter. You get sprayed by three different people before you can say no.'});
 obj(z,'plant',1,11); obj(z,'plant',20,11);
 cast(z,'rachel_b','Rachel',13,7,'down',F('#efc9a8','#4a3426','long','#2a2a2a',{fem:true,outfit:'skirt',pants:'#2a2a2a',skirt:'#2a2a2a'}),{reward:'bag',tags:'rachel',n:5,need:4,
  greet:["Oh my God, hi! Welcome to Bloomingdale's! I work here now. In FASHION. Not coffee. Fashion!","Okay, I have a five-minute break and I'm spending it on you."],
  offer:"Five questions about me. Get four right and you get a shopping bag. A real one! From here!",yes:"Let's go",no:'Just browsing',noReply:"Ooh, browsing. Very brave in this economy.",
  win:"Yay! Here, take the bag. It's empty, but it's the BAG that matters.",lose:"Aw. Okay, come back after you've studied. I'll be here. In fashion!"});
 townie(z,'b1',4,7,F('#f1c9a5','#c9a253','bun','#e07aa0',{fem:true,outfit:'dress'}),["I came in for socks. I am leaving with a coat, two dresses, and no socks."],true,[1,6,20,5],['marble']);
 townie(z,'b2',16,7,F('#8d5a3b','#1c1410','short','#5a6a3a'),["My wife's in the shoe department. I've been waiting here since Tuesday."],false,[1,6,20,5],['marble']);
}});

/* ---------------- SoHo ---------------- */
street('soho','SoHo',40,{cross:[24],subway:{x:14,y:26,label:'SPRING ST',spawn:[16,25,'right']},
 north:[
  {x:0,w:8,style:'cream',shop:true,awning:'#c0262c',signBg:'#2a2a2a',signFg:'#ff7a9a',sign:'MOONDANCE DINER',hd:'x_soho_moondance',signLift:46,signCx:47,signW:84,doors:[{x:1,to:['diner',9,10]}]},
  {x:8,w:8,style:'slate',shop:true,awning:'#5a4a7a',signBg:'#f4f1ea',signFg:'#3a2a4a',sign:'FORTUNA FASHIONS',hd:'x_soho_fortuna',signLift:44,signCx:64,signW:75,doors:[{x:2,msg:"Fortuna Fashions. Rachel's first fashion job, which was mostly getting coffee for people."}]},
  {x:16,w:7,style:'brown',shop:true,awning:'#2f6b3a',signBg:'#1f2a1a',sign:"ALESSANDRO'S",hd:'x_soho_alessandro',signLift:40,signCx:70,signW:61,doors:[{x:1,msg:"Alessandro's. Monica wrote a scathing review of this place, and then they hired her as head chef."}]},
  {x:23,w:7,style:'brick',fire:true,tower:true,hd:'x_soho_loft',doors:[{x:1,kind:'stoop',msg:"A loft building. The buzzer says 'ARTISTS ONLY. NO EXCEPTIONS.'"}]},
  {x:30,w:10,style:'slate',shop:true,awning:'#1a1a2a',signBg:'#1a1a2a',signFg:'#7ad0ff',sign:'IRIDIUM',hd:'x_soho_iridium',signLift:54,signCx:79,signW:100,doors:[{x:5,msg:"Iridium. Monica was head chef here for about five minutes, until she accepted a gift of steaks."}]}],
 south:[
  {x:0,w:10,style:'cream',fire:true,hd:'x_soho_castiron',doors:[{x:1,kind:'stoop',msg:"A cast-iron loft building. Very SoHo. Very expensive. Very locked."}]},
  {x:10,w:8,style:'brick',shop:true,awning:'#d48a2a',signBg:'#2a1a0a',sign:'GALLERY',hd:'x_soho_gallery',signLift:44,signCx:64,signW:104,plate:true,doors:[{x:1,msg:"An art gallery. Tonight's show: 'Paintings That Stare Back.' Phoebe would love this."}]},
  {x:20,w:10,style:'cream',fire:true,hd:'x_soho_house1',doors:[{x:1,kind:'stoop',msg:"Nobody's home."}]},
  {x:30,w:10,style:'brown',tower:true,hd:'x_soho_house2',doors:[{x:1,kind:'stoop',msg:"A doorbell plays a little tune when you press it. Nobody answers."}]}],
 extra(z){
  townie(z,'s1',6,10,F('#c68a5a','#2a1d17','long','#d0a040',{fem:true,outfit:'skirt'}),["The diner across the street has waitresses in wigs. One of them is an incredible chef. Long story."],true);
  townie(z,'s2',32,16,F('#f1c9a5','#2a1d17','short','#2a2a2a'),["I'm an artist. My medium is… disappointment. It's very SoHo."],true);
  townie(z,'s3',20,25,F('#5e3a26','#1c1410','bun','#5b9bd5',{fem:true}),["Iridium had a new head chef for, like, a day. She got fired over steaks. STEAKS."],false);
 }});
room('diner','Moondance Diner',20,12,{wall:'wallT',floor:'tileM',to:['soho',3,9],exitX:9,tune:'city',extra(z){
 // v1.7, from the 3D render: navy and cream checkered tiles, the blue patterned floor, the long navy counter
 // with chrome stripes and coloured stools, the back counter with the espresso machines, white tables with blue chairs
 paint(z,'wainsT',0,2,20,1);
 obj(z,'menuboard',2,0,{w:6,h:2}); obj(z,'wallclock',15,0,{h:2}); obj(z,'menuboard',10,0,{w:3,h:2});
 obj(z,'backcounter',1,3,{w:7}); obj(z,'phone',8,3); obj(z,'pastrycase',9,3);
 for(let x=1;x<8;x++) act(z,x,3,{type:'msg',text:x<4?"Two espresso machines, hissing in harmony. A boombox plays oldies, quietly.":"A toaster, a stack of plates, and a laminated sign: 'THE WAITRESS IS NOT ALLOWED TO TOUCH THE GRILL.' Someone has crossed out 'NOT.'"});
 act(z,8,3,{type:'msg',text:"The diner phone. A note taped to it: 'If it's Monica's mom, Monica is NOT here.'"});
 act(z,9,3,{type:'msg',text:"The pastry case. Cheesecake, lemon tarts, and one slice of pie labeled 'DO NOT SELL. MONICA'S TEST BATCH.'"});
 obj(z,'dinercounter',2,6,{w:8});
 for(let x=2;x<10;x++) act(z,x,6,{type:'msg',text:"The counter. A milkshake machine is whirring. It has been whirring since 1958."});
 [['#c0262c',3],['#222228',5],['#2a3a8a',7],['#e8c020',9]].forEach(([c,x])=>obj(z,'dinerstool',x,7,{color:c}));
 for(const [x,y] of [[12,4],[16,4],[12,8],[16,8]]){ obj(z,'dinertable4',x,y);
  for(let dx=0;dx<3;dx++) for(let dy=0;dy<2;dy++) act(z,x+dx,y+dy,{type:'msg',text:"A white diner table. Two mugs, a slice of pie, and a ketchup bottle that has seen things."}); }
 obj(z,'jukebox',11,3); act(z,11,3,{type:'msg',text:'The jukebox only plays songs from the 1950s. One of them is about a car. They are all about a car.'});
 obj(z,'trash',1,8); obj(z,'plant',1,10); obj(z,'plant',11,10);
 cast(z,'monica_d','Monica',11,8,'down',F('#efc9a8','#f0d070','long','#e05a7a',{fem:true,outfit:'dress'}),{reward:'wig',tags:'monica',n:5,need:4,
  greet:["Welcome to the Moondance Diner! I'm Monica, I'll be your waitress. Yes, this is a wig. No, we're not talking about it.","I'm a CHEF. I'm just… between kitchens."],
  offer:"Five questions about me. Get four right and you can have the wig. I mean it. Please take the wig.",yes:'Bring it',no:'Just a milkshake',noReply:"One milkshake, coming up. With a side of my crushed dreams.",
  win:"You win! Here, the wig is yours. I'm free!",lose:"Ha! I mean, oh, too bad. Come back anytime. I'll be here. In the wig."});
 townie(z,'d1',15,7,F('#e0ac7e','#8a8a8a','short','#5a6a3a'),["The meatloaf here is incredible. The waitress in the wig keeps fixing the recipe when the cook isn't looking."],true);
}});

/* ---------------- Uptown ---------------- */
street('uptown','Uptown',40,{cross:[28],south:'park',gaps:[18,34],subway:{x:4,y:17,label:'81 ST – MUSEUM',spawn:[6,16,'right']},
 north:[
  {x:0,w:20,style:'cream',columns:true,sign:'MUSEUM OF PREHISTORIC HISTORY',signBg:'#5a4a2a',signFg:'#f3e3b0',hd:'x_up_museum',signLift:54,signCx:159,signW:80,doors:[{x:10,kind:'shop',to:['museum',11,12]}]},
  {x:20,w:8,style:'brown',tower:true,hd:'x_up_brownstone',doors:[{x:2,kind:'stoop',msg:"An Upper West Side brownstone. A very small dog barks at you through the mail slot."}]},
  {x:28,w:12,style:'cream',fire:true,shop:true,shopW:6,awning:'#2f5c7a',signBg:'#1f2a3a',sign:'DELI',hd:'x_up_deli',signLift:44,signCx:48,signW:56,doors:[{x:1,msg:"The deli is out of everything except pickles. So many pickles."},{x:7,kind:'stoop',msg:"A doorman eyes you suspiciously. You decide not to ask."}]}],
 extra(z){
  obj(z,'fountain',18,24); for(const [x,y] of [[18,24],[19,24],[20,24],[18,25],[19,25],[20,25]]) act(z,x,y,{type:'quiz',name:'The Fountain',icon:'umbrella',script:{narrate:true,
   greet:["A big fountain in Central Park. It looks like the perfect place to dance around with five friends and some umbrellas.","Someone left a note on the edge: 'Five questions. Four right. Umbrella's under the bench.'"],
   offer:"Take the fountain challenge?",tags:'all',n:5,need:4,reward:'umbrella',yes:"I'll be there for it",no:'Maybe later',noReply:"The fountain splashes, unbothered.",
   win:"You find the umbrella under the bench, just like the note promised. You resist the urge to dance in the fountain. Barely.",lose:"A pigeon lands on the note. Maybe try again later."}});
  for(const x of [12,26]) obj(z,'bench',x,23);
  townie(z,'u1',24,22,F('#f1c9a5','#7a4b2a','long','#e8b830',{fem:true,outfit:'dress'}),["Every time I walk past this fountain, I get the urge to clap four times. Is that weird?"],true);
  townie(z,'u2',8,10,F('#c68a5a','#2a1d17','short','#7a5aa8'),["I'm a paleontologist at the museum. Well, an intern. Well, I volunteer. Well, I visit a lot."],true);
  townie(z,'u3',32,22,F('#5e3a26','#1c1410','long','#3a7fc0',{fem:true,outfit:'skirt'}),["I'm walking seven dogs. None of them are mine. This is my job. I love my job."],false);
 }});
room('museum','Museum of Prehistoric History',24,14,{wall:'wallH',floor:'rotunda',to:['uptown',10,9],exitX:11,tune:'home',extra(z){
 obj(z,'wallsign',6,0,{w:12,text:'Museum of Prehistoric History'});
 // v1.5: the rotunda from the photo: red marble columns, murals, flags, the big skeleton on its rock base
 obj(z,'mural',1,0,{w:4,h:2}); obj(z,'mural',19,0,{w:4,h:2}); obj(z,'flag',5,0,{h:2}); obj(z,'flag',18,0,{h:2});
 obj(z,'column',4,3); obj(z,'column',19,3);
 obj(z,'rockmound',8,6,{h:1});
 obj(z,'officefridge',22,3);
 act(z,22,3,{type:'collect',item:'moistmaker',lines:["The staff fridge, behind the information desk. Inside: yogurt, a sad salad, and a sandwich in plastic wrap with a sticky note.","The note says: 'ROSS'S SANDWICH. PLEASE DO NOT EAT.' Someone has already taken one bite."],
  q:"What does Ross call the extra gravy-soaked slice of bread in the middle?",answers:["The Moist Maker","The Gravy Boat","The Secret Slice","The Sandwich Saver"],
  win:"The Moist Maker. You take the sandwich into protective custody before anyone else gets to it. Somewhere, Ross senses that it's safe.",
  lose:"Somewhere in the museum, a paleontologist screams 'MY SANDWICH?!' Try again.",
  have:"The staff fridge. The sandwich is gone (you have it). A new note: 'WHO ATE MY SANDWICH.' It's not a question."});
 obj(z,'dino',8,5,{lift:13}); for(let x=8;x<14;x++) for(const y of [7]) act(z,x,y,{type:'msg',text:"A full skeleton of a huge dinosaur. A tiny sign says: 'Do not touch. This means you, Ross's friends.'"});
 for(const [x,y] of [[2,4],[21,4],[2,9],[21,9]]){ obj(z,'case',x,y); act(z,x,y,{type:'msg',text:['A fossilized fern. Very old. Very fern.','A display of dinosaur teeth. Some of them are bigger than your hand.','A trilobite. Ross wrote the label. It is four paragraphs long.','A model of a caveman diorama. One of the cavemen looks suspiciously like a museum employee.'][(x+y)%4]}); }
 obj(z,'bench',5,10); obj(z,'bench',16,10);
 act(z,20,2,{type:'msg',text:"PLANETARIUM: CLOSED. (Ross once arranged a private after-hours date in there. Very romantic. Very dark.)"});
 cast(z,'ross_m','Ross',15,8,'down',F('#efc9a8','#4a3426','short','#8a6a4a',{pants:'#3b3b4a'}),{reward:'bone',tags:'ross',n:5,need:4,
  greet:["Oh! Hi! Welcome to the museum! Did you see the big guy? That's not a real skeleton, it's a cast. The real bones are much too fragile for— you don't care. That's fine.","I work here! Well, I did. Now I teach at NYU. But they still let me visit. Mostly."],
  offer:"Five questions about me. Get four right and you get a real fossil. Okay, it's a cast of a fossil. Okay, it's a very nice cast.",yes:"Let's dig in",no:'Ask about dinosaurs',noReply:"Oh, you WANT to hear about dinosaurs? Okay, so in the late Cretaceous— oh, they left. Okay.",
  win:"Amazing! Here's your bone. Treat it with respect. It's older than… okay, it's a cast, it's from 1987.",lose:"That's okay! Evolution takes time. Come back and try again!"});
 townie(z,'mu1',6,12,F('#e0ac7e','#2a1d17','short','#5cb85c'),["My class is on a field trip. I'm the teacher. I've lost four children. They're somewhere near the T. rex."],true,[1,11,22,2],['marble']);
 townie(z,'mu2',18,12,F('#f1c9a5','#c9a253','bob','#8e6bbf',{fem:true,outfit:'skirt'}),["The paleontologist who used to work here once yelled at a monkey. In the museum. Apparently it's a whole story."],true,[1,11,22,2],['marble']);
}});

/* ---------------- Queens ---------------- */
street('queens','Long Island City, Queens',36,{cross:[25],south:'water',subway:{x:30,y:16,label:'QUEENSBORO PLAZA',spawn:[29,15,'left']},
 north:[
  {x:0,w:22,style:'brick',shop:true,awning:'#c0262c',signBg:'#c0262c',signFg:'#ffffff',sign:'SILVERCUP STUDIOS',hd:'x_q_silvercup',signLift:44,signCx:176,signW:120,plate:true,doors:[{x:9,to:['studio',10,11]}]},
  {x:22,w:14,style:'slate',hd:'x_q_warehouse',doors:[{x:1,kind:'plain',msg:"A warehouse. A sign on the door: 'PROPS — DO NOT TOUCH. THIS MEANS YOU, TRIBBIANI.'"}]}],
 extra(z){
  townie(z,'q1',8,16,F('#c68a5a','#2a1d17','short','#5a6a8a'),["I'm an extra on Days of Our Lives. I play 'Doctor Walking Past.' I've walked past Dr. Drake Ramoray eleven times."],true);
  townie(z,'q2',20,16,F('#f1c9a5','#b5462a','long','#5cb85c',{fem:true,outfit:'dress'}),["The skyline from over here is the best view in the city. Don't tell Manhattan."],true);
  act(z,10,18,{type:'msg',text:"The Manhattan skyline across the East River. Somewhere over there, six friends are drinking coffee."});
 }});
room('studio','Days of Our Lives (Set 4)',22,13,{wall:'wallC',floor:'conc',to:['queens',12,9],exitX:10,tune:'city',extra(z){
 obj(z,'wallsign',6,0,{w:10,text:'Days of Our Lives'});
 obj(z,'hospbed',4,5); act(z,4,5,{type:'msg',text:"The hospital-room set. The heart monitor is just a TV playing a looping video of a heart monitor."}); act(z,5,5,{type:'msg',text:"The hospital-room set. The heart monitor is just a TV playing a looping video of a heart monitor."});
 obj(z,'camera',9,8); obj(z,'camera',14,8); for(const x of [9,14]) act(z,x,8,{type:'msg',text:"A big studio camera. A sticky note on it says: 'Joey, please stop waving at this.'"});
 obj(z,'stagelight',2,9); obj(z,'stagelight',19,4); obj(z,'chair',17,9,{face:'left'}); act(z,17,9,{type:'msg',text:"A director's chair. The back says 'DIRECTOR.' The seat says 'NOT JOEY.'"});
 cast(z,'joey_s','Joey',7,6,'down',F('#e8bf9a','#2a1d17','short','#e8e8ec',{pants:'#3a3a44'}),{reward:'headshot',tags:'joey',n:5,need:4,
  greet:["Hey! How you doin'? Welcome to Days of Our Lives! I'm Dr. Drake Ramoray. Well, I play him. Well, I'm him on Tuesdays.","Watch this: this is my 'concerned doctor' face. …It's also my 'hungry' face. Same face."],
  offer:"Five questions about me. Four right and I'll give you a signed headshot. It's a really good one. I'm doing the look.",yes:'Action!',no:"Ask for an autograph",noReply:"Sure! 'To my biggest fan, love, Drake Ramoray.' …Hey, you should do the quiz though.",
  win:"You're a natural! Here's my headshot. Signed. Frame it. People will ask about it.",lose:"Cut! Okay, let's take it again from the top. Come back anytime!"});
 townie(z,'st1',15,6,F('#e0ac7e','#2a1d17','bun','#2a2a2a',{fem:true}),["I'm the script supervisor. Our star keeps reading the stage directions out loud."],true,[11,3,9,8],['conc']);
}});

/* ---------------- JFK Airport ---------------- */
(function(){
 const z=room('airport','JFK Airport',26,12,{wall:'wallH',floor:'marble',tune:'travel'});
 paint(z,'frontA',0,11,26,1); z.subwaySpawn=[13,9,'up'];
 obj(z,'board',9,0,{w:8});
 for(let x=9;x<17;x++) act(z,x,2,{type:'msg',text:"DEPARTURES\nLONDON ON TIME · LAS VEGAS ON TIME · BARBADOS ON TIME · MONTAUK (BUS) ON TIME\nTULSA ON TIME · MINSK DELAYED · 15 YEMEN ROAD, YEMEN: CANCELLED (NOT A REAL PLACE)\nPARIS: …SHE GOT OFF THE PLANE."});
 const gates=[['london','London',5,6,'down','Gate 1 · London'],['vegas','Las Vegas',2,10,'up','Gate 2 · Las Vegas'],['barbados','Barbados',11,10,'up','Gate 3 · Barbados'],['montauk','Montauk',11,10,'up','Gate 4 · Montauk (by bus)']];
 gates.forEach((g,i)=>{ const x=2+i*6; obj(z,'gatedesk',x,4,{text:g[5]}); act(z,x,4,{type:'fly',to:g[0],tx:g[2],ty:g[3],dir:g[4],label:g[1]}); act(z,x+1,4,{type:'fly',to:g[0],tx:g[2],ty:g[3],dir:g[4],label:g[1]}); obj(z,'seats',x,7); });
 obj(z,'sign',23,9,{text:'AIRTRAIN'}); act(z,23,9,{type:'subway'}); obj(z,'plant',1,10); obj(z,'plant',24,3);
 townie(z,'a1',8,9,F('#f1c9a5','#2a1d17','short','#5a7aa8'),["My flight to Tulsa got delayed. I don't mind. Have you ever been to Tulsa?"],true,[1,8,24,3],['marble']);
 townie(z,'a2',18,9,F('#8d5a3b','#1c1410','long','#e07aa0',{fem:true,outfit:'dress'}),["Someone ran through here yesterday yelling about getting off a plane. Very romantic. Very loud."],true,[1,8,24,3],['marble']);
})();

/* ---------------- Postcard trips ---------------- */
scene('london','London, England',24,14,'walk',{extra(z){
 paint(z,'water',0,0,24,4); for(let x=0;x<24;x++) obj(z,'rail',x,4);
 paint(z,'road',0,9,24,3); paint(z,'laneH',0,10,24,1);
 obj(z,'clocktower',2,8); act(z,2,8,{type:'msg',text:"A famous clock tower. It chimes every hour. Joey has taken eleven photos of it, all slightly blurry."}); act(z,3,8,{type:'msg',text:"A famous clock tower. It chimes every hour."});
 obj(z,'phonebox',8,7); act(z,8,7,{type:'msg',text:"A red phone box. Somebody here once called home in a panic about a wedding."});
 obj(z,'bus',13,10); obj(z,'cab',19,10); homeAct(z,19,10,'Back to JFK'); homeAct(z,20,10,'Back to JFK');
 obj(z,'lamp',6,8); obj(z,'lamp',17,8); obj(z,'tree',11,13); obj(z,'tree',22,13);
 paint(z,'grass',0,12,24,2);
 cast(z,'joey_l','Joey',11,7,'down',F('#e8bf9a','#2a1d17','short','#c0262c',{pants:'#2a3a6a'}),{reward:'hat',tags:'joey places',n:5,need:4,
  greet:["Hey! London, baby! Look at my hat! It's got the flag on it! I'm basically British now.","Did you know they call french fries 'chips'? And chips 'crisps'? What do they call crisps? …I gotta sit down."],
  offer:"Five questions, four right, and you get the hat. I bought, like, nine of them.",yes:"Cheerio!",no:"Admire the hat",noReply:"Right? It's a great hat.",
  win:"Brilliant! That's British for 'good.' Here's your hat!",lose:"Aw, bloody… something. Try again, mate!"});
}});
scene('vegas','Las Vegas, Nevada',24,14,'nroad',{bg:'#0c0814',extra(z){
 paint(z,'walk',0,9,24,2); paint(z,'walk',0,13,24,1);
 obj(z,'building',1,1,{hd:'x_vegas_chapel',signLift:54,signCx:71,signW:90,w:9,h:8,style:'neon',shop:true,awning:'#ff6fb0',signBg:'#1a0a1a',signFg:'#ff9ad0',sign:'WEDDING CHAPEL',doors:[{x:5,kind:'shop'}]});
 msgDoor(z,6,8,"A 24-hour wedding chapel. Two people you know very well got married here after a lot of drinks. Neither remembers it.");
 obj(z,'building',12,1,{hd:'x_vegas_caesars',signLift:46,signCx:70,signW:126,w:12,h:8,style:'neon',shop:true,awning:'#e8b820',signBg:'#1a1a0a',signFg:'#ffd84a',sign:'CAESARS PALACE',doors:[{x:2,kind:'shop'}]});
 msgDoor(z,14,8,"Caesars Palace. Inside, an actor in a gladiator outfit is posing for photos and very much living his dream.");
 obj(z,'cab',19,11,{yellow:true}); homeAct(z,19,11,'Back to JFK'); homeAct(z,20,11,'Back to JFK');
 obj(z,'lamp',11,10); obj(z,'palm',2,13); obj(z,'palm',22,13);
 cast(z,'rachel_v','Rachel',8,11,'down',F('#efc9a8','#4a3426','long','#f4f1ea',{fem:true,outfit:'dress'}),{reward:'veil',tags:'rachel ross',n:5,need:4,
  greet:["Oh my God. Okay. Don't freak out. I may have gotten married last night. To Ross. In there.","Neither of us remembers it. There's a photo. We're both wearing… sombreros? Why are there sombreros?"],
  offer:"I need a distraction. Five questions, four right, and you can have this veil. I don't know where it came from.",yes:'Distract you',no:'Ask about Ross',noReply:"We are NOT talking about Ross right now.",
  win:"You're amazing! Take the veil. Take it far away from me.",lose:"Okay, that didn't help at all. Try again before I find Ross!"});
}});
scene('barbados','Barbados',24,14,'sand',{extra(z){
 paint(z,'water',0,0,24,4);
 for(const [x,y] of [[2,6],[7,5],[19,5],[22,8],[3,12],[15,12]]) obj(z,'palm',x,y);
 obj(z,'pingpong',10,8); act(z,10,8,{type:'msg',text:"A ping-pong table. Two very competitive people played here for hours. Nobody else was allowed to touch it."}); act(z,11,8,{type:'msg',text:"A ping-pong table. Nobody else is allowed to touch it."});
 obj(z,'sign',18,11,{text:'AIRPORT SHUTTLE'}); homeAct(z,18,11,'Back to JFK');
 act(z,12,4,{type:'msg',text:"The ocean. Somewhere at the hotel, a paleontologist is giving a keynote speech. The ocean seems more fun."});
 cast(z,'monica_b','Monica',9,8,'right',F('#efc9a8','#2a1d17','bob','#5cb85c',{fem:true,outfit:'skirt'}),{reward:'paddle',tags:'monica places',n:5,need:4,
  greet:["Oh, hi! Want to play ping-pong? I should warn you: I've been playing for nine hours. My arm is a weapon.","…Fine, we'll do trivia instead. But I'm keeping score."],
  offer:"Five questions. Four right and you win my lucky paddle. Nobody beats me. Nobody.",yes:'Serve it up',no:'Rest your arm',noReply:"My arm is fine. MY ARM IS FINE.",
  win:"Okay. You beat me. Fair and square. Take the paddle. I need to go lie down in a dark room.",lose:"YES! I mean, good game. Rematch whenever you want!"});
}});
scene('montauk','Montauk, Long Island',24,14,'sand',{extra(z){
 paint(z,'water',0,0,24,3); paint(z,'grass',0,10,24,4);
 obj(z,'building',2,4,{w:8,h:5,style:'shingle',doors:[{x:4,kind:'stoop',color:'#3a5a7a'}]});
 msgDoor(z,6,8,"The beach house. The gang stayed here one summer, and Phoebe met somebody very important to her.");
 for(const [x,y] of [[14,11],[20,12],[1,12]]) obj(z,'tree',x,y,{park:true});
 obj(z,'sign',21,9,{text:'BUS TO JFK'}); homeAct(z,21,9,'Back to JFK');
 act(z,15,3,{type:'msg',text:"Waves, seagulls, and a sandcastle shaped like a duck."});
 cast(z,'phoebe_m','Phoebe',14,7,'down',F('#efc9a8','#4a3426','long','#e8b830',{fem:true,outfit:'dress'}),{reward:'shell',tags:'phoebe places',n:5,need:4,
  greet:["Oh, hi! Isn't the beach great? The ocean is like a big bathtub that everyone shares. Kind of gross when you think about it.","I found out some really big family stuff here once. Like, REALLY big. I'm okay. I'm great, actually."],
  offer:"Five questions about me. Four right and you get my favorite seashell. If you hold it to your ear, it says nice things about you.",yes:'Listen to the shell',no:'Walk on the beach',noReply:"Okay! Watch out for crabs. They're judgmental.",
  win:"Yay! Here's the shell. Listen… it says you're wonderful.",lose:"Hmm. The shell says to try again. It's very honest."});
}});

/* =====================================================================
 *  v0.4: supporting characters with SUPERFAN quizzes (bonus collectibles)
 * ===================================================================== */
function superfan(zid,id,name,x,y,dir,look,tag,reward,greet,offer,win,lose,extra){
 cast(ZONES[zid],id,name,x,y,dir,look,{reward,tags:tag+' hard',prefer:tag,n:5,need:3,greet,offer:offer+" Superfan questions only. Get three of five.",yes:"Bring it on",no:'Not right now',noReply:'Okay! I\'ll be right here.',win,lose,again:"Back for more superfan questions? Just for fun."},extra);
}
superfan('hall','eddie','Eddie',11,6,'left',F('#e8bf9a','#2a1d17','short','#6a6a5a',{pants:'#3a3a44'}),'eddie','cracker',
 ["Oh, hey. I'm Eddie. I live in 19. I've always lived in 19. Ask Chandler. Actually, don't ask Chandler.","I'm making dried fruit. You want some dried fruit? It's mango. Or it was."],
 "Answer some questions about me and you can have Chandler. My fish. He's a cracker. It's complicated.",
 "Okay. Take Chandler. Take good care of him. Don't let anybody eat him.","You don't know me. Nobody knows me. That's fine. I'll be in the hallway. Watching.");
superfan('hall','heckles','Mr. Heckles',2,6,'right',F('#e8d4b8','#d8d8d0','bald','#7a6a5a',{pants:'#4a4a3a'}),'heckles','broom',
 ["You're disturbing me. I can hear everything. I could hear you walking up the stairs.","I was going to complain about the noise, but you seem like a nice young person. Quiet. Nicely quiet."],
 "You want my broom? You'll have to earn it.",
 "Fine. Take the broom. Bang on whatever you want. I'll complain about it later.","Wrong! Too loud, AND wrong. Come back when you've studied. Quietly.");
superfan('monica','jack','Jack Geller',12,13,'up',F('#efc9a8','#d8d8d0','bald','#5a6a8a',{pants:'#3a3a44'}),'geller','porsche',
 ["Well, hello there! I'm Jack Geller. Monica's father. Ross's too, I'm told.","Judy and I came over for dinner. Monica's been 'resting' the roast for forty-five minutes."],
 "Tell you what: get these right and I'll give you the keys to the Porsche. The keychain, anyway.",
 "Hey, you're sharp! Here's the keychain. Don't tell Ross.","Close! That's okay. Nobody gets the Chi-Chi question right.");
superfan('monica','judy','Judy Geller',9,13,'right',F('#efc9a8','#8a8a8a','bob','#8e4a6a',{fem:true,outfit:'skirt',pants:'#3a3a44'}),'geller','album',
 ["Oh, hello, dear. I'm Judy. Monica's mother. You must be one of her friends. She has so many now.","I brought the family album. Mostly so everyone can see Ross's graduation. Again."],
 "Answer a few questions and you can have the album. Ross is in most of the pictures, of course.",
 "Well! Aren't you clever. Here's the album. Monica is in it… somewhere.","Oh, that's all right, dear. Not everybody can be a doctor.");
superfan('village','frankjr','Frank Jr.',24,26,'down',F('#e8bf9a','#2a1d17','short','#c0573a',{pants:'#3a3a44'}),'frank','bootie',
 ["Whoa! Hey! I'm Frank. Phoebe's brother. Half-brother. Whole brother? We're working on it.","Alice and I have triplets now. That's like three babies. At once!"],
 "Get some questions right and you can have a set of triplet booties. I wanted to melt them, but Alice said no.",
 "Whoa! You're like a genius! Here, take the booties. Don't melt them. Unless you want to.","Whoa. That's okay. I don't know stuff all the time.");
superfan('bloomies','janice','Janice',16,10,'left',F('#efc9a8','#2a1d17','long','#c0574a',{fem:true,outfit:'dress',pants:'#2a2a2a'}),'janice','purse',
 ["OH. MY. GOD. Hiiii! I'm Janice! Are you a friend of Chandler Bing's? Everybody's a friend of Chandler Bing's.","I'm just shopping. Retail therapy. Gary has the house, I have the purses. Ha ha ha!"],
 "Ooh, let's play a game! Answer some questions about little old me, and you can have my purse!",
 "OH. MY. GOD. You know everything! Take the purse. It's so you. Ha ha ha!","Oh, you were SO close. Come back! I'll be here. I'm always here.");
superfan('uptown','richard','Richard',14,22,'down',F('#efc9a8','#4a3426','short','#3a4a5a',{pants:'#2b2b30'}),'richard','comb',
 ["Hello. Richard Burke. I'm a friend of the Gellers. A good friend. It's a long story.","I come to the park to think. And to people-watch. Mostly to think."],
 "Answer a few questions correctly and I'll give you my mustache comb. I have several.",
 "Impressive. Here, take the comb. A distinguished mustache needs a distinguished comb.","Not quite. It's all right. I'm a patient man. Very patient.");
superfan('studio','estelle','Estelle',18,9,'left',F('#e8c8a8','#b5462a','bob','#5a4a7a',{fem:true,outfit:'skirt',pants:'#2a2a2a'}),'estelle','ashtray',
 ["Estelle Leonard. Talent agent. Joey's my client. Well, one of my clients. One of two.","You got a lighter? No? That's fine. I've got six."],
 "Answer some questions and you get my ashtray. It's a collector's item. It's full.",
 "Kid, you've got talent. Here's the ashtray. Don't tell my other client, he'll eat it.","Eh, that's showbiz. Come back when you're ready. I'm always here, I never leave.");
superfan('barbados','mike','Mike',12,8,'left',F('#efc9a8','#4a3426','short','#5b9bd5',{pants:'#e8e2d4'}),'mike','nametag',
 ["Hi, I'm Mike. Phoebe's… boyfriend? Fiancé? I came all the way to Barbados to find out.","Also, I'm very good at ping-pong. Monica says she's better. We'll see."],
 "Answer some questions and you can have my name tag. Long story. It says 'Crap Bag.'",
 "Ha! You're good. Here's the name tag. Wear it with pride.","Ooh, tough break. Want to play ping-pong instead? …Kidding. Try again!");

/* =====================================================================
 *  v0.6: EASTER EGGS. Each one has a chance to appear whenever you enter its zone.
 *  spots: possible tile positions (one is picked at random). Found eggs are listed on the shelf.
 * ===================================================================== */
const LK={monica:{skin:'#efc9a8',hair:'#2a1d17',style:'bob',fem:true,shirt:'#c0573a',pants:'#2b2b30'},ross:{skin:'#efc9a8',hair:'#4a3426',style:'short',shirt:'#7a8a6a',pants:'#3b3b4a'},
 joey:{skin:'#e8bf9a',hair:'#2a1d17',style:'short',shirt:'#4a5a8a',pants:'#2b2b30'},chandler:{skin:'#efc9a8',hair:'#4a3426',style:'short',shirt:'#5a7a5a',pants:'#3b3b4a'},
 rachel:{skin:'#efc9a8',hair:'#4a3426',style:'long',fem:true,outfit:'skirt',shirt:'#6aa6cf',pants:'#3b3b4a'}};
const EGG_CHANCE=0.4;
const EGGS=[
 {id:'turkeyhead',title:'The Turkey Head',zone:'village',hint:"Somewhere in the Village, someone is wearing dinner.",
  npcs:[{name:'Monica?',spots:[[10,10],[36,16],[14,26],[44,25]],wander:true,look:Object.assign({},LK.monica,{hat:'turkey',hd:'monica_turkey'})}],
  lines:[{who:'Monica?',text:"(Someone is strolling down the sidewalk with an entire turkey on her head. Sunglasses. A tiny fez.)"},{who:'Monica?',text:"Don't look at me. I'm doing a bit. It's for Chandler. …Is it working on you? It's working on you."}]},
 {id:'armadillo',title:'The Holiday Armadillo',zone:'uptown',hint:"Something armored is wandering the park Uptown.",
  npcs:[{name:'The Holiday Armadillo',spots:[[22,22],[8,22],[30,23]],wander:true,look:Object.assign({},LK.ross,{costume:'armadillo',hd:'ross_armadillo'})}],
  lines:[{who:'The Holiday Armadillo',text:"Greetings! I am the Holiday Armadillo, Santa's part-Texan friend!"},{who:'The Holiday Armadillo',text:"…It's Ross. It's me. They were out of Santa suits. Please don't tell anyone."}]},
 {id:'tourist',title:'Joey the Tourist',zone:'midtown',hint:"A very lost tourist has been spotted in Midtown.",
  npcs:[{name:'Joey?',spots:[[40,16],[12,16],[30,9],[18,25]],wander:true,look:Object.assign({},LK.joey,{shirt:'#f4f1ea',pants:'#c9a86a',hat:'unionjack',camera:true,map:true,hd:'joey_tourist'})}],
  lines:[{who:'Joey?',text:"Hey! How you doin'? Can you take my picture in front of… that building? Any building. They're all great."},{who:'Joey?',text:"I'm practicing being a tourist for London. I've got the hat, the camera, the map… The map is of London. That's why I'm lost."}]},
 {id:'porsche',title:'The "Porsche"',zone:'village',hint:"A very fancy car is parked on Grove St. Or is it?",
  objs:[{kind:'carcover',x:43,y:14}],acts:[[43,14],[44,14]],
  npcs:[{name:'Joey?',spots:[[45,15],[42,15]],look:Object.assign({},LK.joey,{shirt:'#2a2a2a',hat:'redcap',hd:'joey_porsche'})}],
  lines:[{text:"A sleek sports car under a fitted cover. Very fancy."},{text:"You lift a corner. It's… cardboard boxes. Stacked in the shape of a car."},{who:'Joey?',text:"Yeah, that's my Porsche. Don't touch it. It's very, uh… delicate. People keep asking for rides. I keep telling them it's in the shop."}]},
 {id:'box',title:'Chandler in a Box',zone:'soho',hint:"A cardboard box in SoHo seems to be… blinking.",
  npcs:[{name:'A Box',spots:[[20,10],[34,16],[6,16],[28,25]],look:Object.assign({},LK.chandler,{costume:'box',hd:'chandler_box'})}],
  lines:[{who:'A Box',text:"(A large cardboard box on the sidewalk. It has two eyeholes. The eyes blink at you.)"},{who:'A Box',text:"…Hi. It's Chandler. Long story. There was a kiss, and now there's a box. They let me out for pie."}]},
 {id:'layers',title:"Joey in Everything Chandler Owns",zone:'village',hint:"Someone in the Village is wearing way, way too many clothes.",
  npcs:[{name:'Joey?',spots:[[19,9],[26,10],[11,16]],wander:true,look:Object.assign({},LK.joey,{costume:'layers',hd:'joey_layers'})}],
  lines:[{who:'Joey?',text:"Hey! Notice anything different? I'm wearing everything Chandler owns. EVERYTHING."},{who:'Joey?',text:"He hid my underwear, so this is payback. It's very warm in here. Is it warm out here? I can't feel my arms."}]},
 {id:'pivot',title:'PIVOT!',zone:'village',hint:"Three people on Grove St are having a very bad time with a couch.",
  objs:[{kind:'couch',x:28,y:16,w:4,color:'#6a7a5a'}],
  npcs:[{name:'Ross',spots:[[32,16]],dir:'left',look:Object.assign({},LK.ross,{hd:'ross_green'})},{name:'Chandler',spots:[[27,16]],dir:'right',look:Object.assign({},LK.chandler,{hd:'chandler_work'})},{name:'Rachel',spots:[[30,15]],dir:'down',look:Object.assign({},LK.rachel,{hd:'rachel_waitress'})}],
  lines:[{who:'Ross',text:"PIVOT! PIVOT! PIVOOOT!"},{who:'Chandler',text:"It's not going to pivot, Ross. It's a couch. Couches don't pivot."},{who:'Rachel',text:"Maybe if you both lift your ends at the same time? Just a thought."},{who:'Ross',text:"…Pivot?"}]},
 // v1.0: no NPC of its own. When it triggers, Ross in his apartment shows up mid-disaster instead,
 // and his quiz (and the leather pants) work the same as usual.
 {id:'leatherpants',title:"Ross After the Leather Pants",zone:'rossapt',hint:"Ross had a big date in leather pants. Maybe check on him at home.",
  swap:{npc:'ross_h'},look:Object.assign({},LK.ross,{hd:'ross_leatherpants',shirt:'#1e1c22',pants:'#efc9a8'}),
  lines:[{text:"(Ross is standing in his living room in a long dark coat. No pants. His legs are dusted white with baby powder, and he's clutching a bottle of lotion.)"},
   {who:'Ross',text:"Okay! This is not what it looks like. …It's exactly what it looks like."},
   {who:'Ross',text:"The pants got hot, so I tried powder. Then lotion. Now the powder and the lotion have made a paste, and the pants are… gone. Don't ask where."}]},
 {id:'duck',title:'The Runaway Duck',zone:'village',hint:"Something with webbed feet has escaped to Washington Square Park.",
  npcs:[{name:'Duck',spots:[[30,30],[12,30],[40,31]],wander:true,animal:true,look:{animal:'duck',hd:'duck_runaway'}}],
  lines:[{who:'Duck',text:"Quack."},{text:"(Wait… is that Joey and Chandler's duck? How did it get all the way to the park?)"},{who:'Duck',text:"Quack. (It refuses to explain itself.)"}]},
];

/* =====================================================================
 *  v0.7: set dressing for the emptier rooms
 * ===================================================================== */
function dress(zid,list){const z=ZONES[zid];for(const d of list){const[kind,x,y,o,msg]=d;obj(z,kind,x,y,o||{});if(msg){const w=(o&&o.w&&!['towel','rug'].includes(kind))?o.w:(['canoe'].includes(kind)?3:['flat'].includes(kind)?2:1);for(let i=0;i<w;i++)act(z,x+i,y,{type:'msg',text:msg})}}}
dress('office',[
 ['cubicle',13,4,{},"An empty cubicle with a sign: 'Reserved for whoever replaces the guy who quit after Chandler's last pep talk.'"],['cubicle',6,8],
 ['copier',15,7,{},"The copier. It's jammed. It has always been jammed. It will always be jammed."],['trash',10,10],['plant',16,4],['bookshelf',1,3,{tone:'#6a6a72'},"Filing cabinets. One drawer is labeled 'WENUS.' Another is labeled 'DO NOT ASK ABOUT THE WENUS.'"],['bookshelf',1,4,{tone:'#6a6a72'}]]);
dress('bloomies',[
 ['rack',5,9,{tone:'#3a3a44'},'A rack of little black dresses. Every single one is "the one."'],['rack',14,10,{tone:'#c9a24a'}],
 ['mirror',20,6,{},"A full-length mirror. You look great. The lighting in here is very flattering."],['mirror',1,6],
 ['case',7,11,{},"A glass case of very expensive shoes. One pair costs more than a month of Monica's rent. (Her rent is very low.)"],['case',13,11]]);
dress('museum',[
 ...[7,8,9,10,11,12,13,14].map(x=>['stanchion',x,9,{},x===7?"A velvet rope keeps visitors away from the skeleton. Someone has added a handwritten sign: 'ESPECIALLY YOU, JOEY.'":null]),
 ['case',5,4],['case',18,4],['dinoskull',5,7,{},"A triceratops skull on a pedestal. Ross has named it. He won't say what."],
 ['kcounter',19,7,{w:3,tone:'#5a4a2a'},"The information desk. A brochure: 'The Museum of Prehistoric History: Now With 40% More History!'"],
 ['plant',1,3],['plant',22,3],['plant',22,12]]);
dress('studio',[
 ['flat',12,3,{tone:'#e8c8a8'},"A set wall for a fancy living room. From the back, it's just plywood and tape. Very glamorous."],['flat',14,3,{tone:'#e8c8a8'}],
 ['couch',12,5,{w:3,color:'#8e6bbf'},"The set couch. Dr. Drake Ramoray has had at least four dramatic conversations on this couch."],['plant',16,5],
 ['flat',2,3,{tone:'#cfe6ef'}],['kcounter',17,3,{w:2,tone:'#5a5a66'},"Craft services: bagels, coffee, and a sign that says 'ONE PER PERSON, JOEY.'"],
 ['boxes',19,10],['boxes',20,10,{},"Equipment cases full of cables. Nobody knows which cable goes where."],['boxes',1,11],['stagelight',20,6]]);
dress('airport',[
 ['luggage',5,9,{tone:'#3a5a8a'},"Someone's luggage. The tag says 'BING.' It is extremely overpacked."],['luggage',18,10,{tone:'#c0573a'}],
 ['kcounter',11,7,{w:2,tone:'#6b4226'},"An airport coffee kiosk. It's fine. It's not Central Perk."],['trash',6,7],['trash',17,7],['plant',24,10],['plant',12,3]]);
dress('london',[
 ['bench',14,6],['bench',20,6],['postbox',16,7,{},"A red postbox. You could mail a postcard home. Joey has mailed eleven, all to himself."],
 ['planter',5,5],['planter',18,5],['tree',2,13,{park:true}],['tree',6,13,{park:true}],['tree',16,13,{park:true}]]);
dress('barbados',[
 ['towel',4,10,{w:2,tone:'#e05a7a'}],['umbrella',5,9,{tone:'#d9534f'},"A beach umbrella. Under it, a paperback called 'Fossils of the Caribbean.' Ross has been here."],
 ['towel',16,8,{w:2,tone:'#5b9bd5'}],['umbrella',17,7,{tone:'#5b9bd5'}],
 ['sandcastle',13,11,{},"A sandcastle with a little flag on top. Someone built a moat. Someone else stepped in it."],['icebox',7,10],
 ['surfboard',21,10],['lounger',8,12],['lounger',10,12],['icebox',18,9]]);
dress('montauk',[
 ['towel',16,6,{w:2,tone:'#8e6bbf'}],['umbrella',17,5,{tone:'#e8b830'}],['sandcastle',12,4,{},"A sandcastle shaped like a duck. Phoebe says it's 'a castle for a duck,' which is different."],
 ['surfboard',10,5,{tone:'#7ad0ff'}],['grill',11,8,{},"A charcoal grill. Somebody's making burgers. It smells like summer."],['lounger',19,7],
 ['rug',5,11,{w:3,h:2,low:true,tone:'#c0573a'}],['icebox',8,11],...[12,13,14,15,16,17,18,19].map(x=>['fence',x,9])]);


/* ---------------- v1.8: wider streets ----------------
 * Cars are drawn at real-world scale next to people now, so every street with traffic gets three more road rows.
 * Road rows 11–17: parked cars along the top curb (row 11), the right-to-left lane (rows 12–13), the centre line
 * (row 14), the left-to-right lane (rows 15–16) and parked cars along the bottom curb (row 17).
 * Everything that was below the old road (row 15 and down) moves down three rows, including doors, spawn points
 * and easter-egg spots in other zones that point here. */
(function(){
 const N=3, OLD=15;
 const sh=y=>y>=OLD?y+N:y;
 for(const z of Object.values(ZONES)){
  if(!z.taxiRows||!z.taxiRows.length||z.g[12*z.w]==null) continue;
  const w=z.w, oh=z.h, g=z.g, ng=new Array(w*(oh+N));
  for(let y=0;y<oh;y++) for(let x=0;x<w;x++) ng[sh(y)*w+x]=g[y*w+x];
  for(let x=0;x<w;x++){ const t=g[11*w+x], col=t==='crossH'?'crossH':t==='inter'?'inter':null;
   for(let y=11;y<=17;y++) ng[y*w+x]=col||(y===14?'laneH':'road'); }
  z.g=ng; z.h=oh+N;
  for(const o of z.objs){ if(o.kind==='car'||o.kind==='grantaxi') o.y=o.y===11?11:17; else o.y=sh(o.y); }
  for(const a of z.acts) a.y=(a.y===14&&a.type==='collect')?17:sh(a.y);
  for(const d of z.doors) d.y=sh(d.y);
  for(const n of z.npcs){ n.y=sh(n.y); if(n.wander){ const[wx,wy,ww,wh]=n.wander; const y1=sh(wy+wh-1); n.wander=[wx,sh(wy),ww,y1-sh(wy)+1]; } }
  if(z.subwaySpawn) z.subwaySpawn=[z.subwaySpawn[0],sh(z.subwaySpawn[1]),z.subwaySpawn[2]];
  z.taxiRows=z.taxiRows.map(t=>Object.assign({},t,{row:t.dir<0?13:16}));
  z.laneY=14*16+8; z.wide=true;
  for(const o of Object.values(ZONES)) for(const d of o.doors) if(d.to===z.id) d.ty=sh(d.ty);
  for(const e of EGGS) if(e.zone===z.id) for(const n of e.npcs){ n.spots=n.spots.map(([x,y])=>[x,sh(y)]); }
 }
})();

/* v1.9.1: a room's exit drops you on the tile in front of the street door that leads into it */
(function(){
 for(const r of Object.values(ZONES)) for(const d of r.doors){
  const S=ZONES[d.to]; if(!S||!S.taxiRows||!S.taxiRows.length) continue;
  const e=S.doors.find(e=>e.to===r.id); if(e){ d.tx=e.x; d.ty=e.y+1; }
 }
})();
