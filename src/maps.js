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
function msgDoor(z,x,y,text){ act(z,x,y,{type:'msg',text}); }

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
 obj(z,'building',0,1,{w:6,h:8,style:'brown',tower:true,doors:[{x:3,kind:'stoop'}]});
 obj(z,'building',6,1,{w:6,h:8,style:'brick',fire:true,doors:[{x:2,kind:'plain'}]});
 obj(z,'building',12,1,{w:8,h:8,style:'yellow',fire:true,tower:true,shop:true,shopW:6,awning:'#2f6b3a',signBg:'#24301f',sign:'CENTRAL PERK',signFg:'#f3e3b0',doors:[{x:3,kind:'shop'},{x:6,kind:'stoop',color:'#5b3a8c'}]});
 obj(z,'building',28,1,{w:8,h:8,style:'brick',fire:true,doors:[{x:4,kind:'stoop'}]});
 obj(z,'building',36,1,{w:6,h:8,style:'brown',tower:true,doors:[{x:2,kind:'stoop'}]});
 obj(z,'building',42,1,{w:6,h:8,style:'slate',shop:true,awning:'#b8322a',signBg:'#2a1a1a',sign:"RAY'S PIZZA",doors:[{x:2,kind:'shop'}]});
 door(z,15,8,'perk',10,13,'up');
 msgDoor(z,3,8,"Nobody answers. Somewhere inside, a dog is barking at a vacuum.");
 msgDoor(z,8,8,"The buzzer is broken. Someone taped a note to it: 'KNOCK LOUDER.'");
 door(z,18,8,'hall',6,7,'up');
 door(z,32,8,'rossapt',8,10,'up');
 msgDoor(z,38,8,"A sign on the door: 'Super is on vacation. Do not ask about the heat.'");
 msgDoor(z,44,8,"Closed for a private party. It smells amazing.");

 // --- South side of Grove St (buildings rows 17–24, doors on row 24) ---
 obj(z,'building',0,17,{w:8,h:8,style:'slate',shop:true,awning:'#7d1d2c',signBg:'#1b1b2a',sign:'LUCILLE LORTEL',signFg:'#ffd86b',doors:[{x:4,kind:'shop'}]});
 obj(z,'building',8,17,{w:6,h:8,style:'brown',doors:[{x:3,kind:'stoop'}]});
 obj(z,'building',14,17,{w:6,h:8,style:'cream',shop:true,awning:'#b02a2a',signBg:'#e8c547',sign:'VILLAGE CIGARS',signFg:'#7a1a1a',doors:[{x:3,kind:'shop'}]});
 obj(z,'building',28,17,{w:8,h:8,style:'brick',fire:true,doors:[{x:3,kind:'stoop',color:'#2f5c7a'}]});
 obj(z,'building',36,17,{w:12,h:8,style:'brown',fire:true,doors:[{x:5,kind:'stoop'}]});
 msgDoor(z,4,24,"Tonight: an experimental play starring an actor named Joey Tribbiani.\nThe theatre opens in a later update. (Bring earplugs.)");
 msgDoor(z,11,24,"Nobody's home.");
 msgDoor(z,17,24,"VILLAGE CIGARS. Lottery tickets, newspapers, and gum. The shop opens in a later update.");
 msgDoor(z,31,24,"'5 Morton St' says the mailbox… close enough. This is Phoebe's building.\n(Her apartment opens in a later update!)");
 msgDoor(z,41,24,"You hear someone practicing the tuba. You back away slowly.");

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
 obj(z,'car',6,14,{color:'#c9c9cf',dir:1}); obj(z,'car',13,14,{color:'#2f5c7a',dir:1}); obj(z,'car',37,14,{color:'#7a4a8f',dir:1});
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

/* ---------------- Central Perk (interior) ---------------- */
(function(){
 const z = Z('perk','Central Perk',22,15,'wood'); z.tune='perk';
 z.bg='#120d0a';
 paint(z,'brick',0,0,22,2); paint(z,'wains',0,2,22,1);
 paint(z,'wallS',0,0,1,15); paint(z,'wallS',21,0,1,15);
 paint(z,'front',0,14,22,1); paint(z,'mat',10,14,2,1);
 door(z,10,14,'village',15,9,'down'); door(z,11,14,'village',15,9,'down');

 // wall decor
 obj(z,'wallsign',2,0,{w:8,text:'Central Perk'});
 obj(z,'menu',13,0,{w:4});
 obj(z,'window',18,0,{w:2}); obj(z,'frame',11,1); obj(z,'frame',17,1,{tone:'#3f6b8a'});
 // couch corner
 obj(z,'rug',2,7,{w:9,h:5,low:true});
 obj(z,'couch',4,8,{w:4});
 obj(z,'armchair',3,10,{face:'right'}); obj(z,'armchair',8,10,{face:'left'});
 obj(z,'coffee',5,10,{w:2});
 for(let x=4;x<8;x++) act(z,x,8,{type:'couch'});
 act(z,5,10,{type:'msg',text:"The coffee table. Someone left a magazine open to a quiz: 'Which Friend Are You?'"});
 act(z,6,10,{type:'msg',text:"The coffee table. Someone left a magazine open to a quiz: 'Which Friend Are You?'"});
 act(z,3,10,{type:'msg',text:"A comfy armchair. The couch looks better, though."});
 act(z,8,10,{type:'msg',text:"A comfy armchair. The couch looks better, though."});
 // counter (row 4), Gunther behind it on row 3
 obj(z,'counter',12,4,{w:9});
 obj(z,'block',12,3);
 for(let x=12;x<21;x++) act(z,x,4,{type:'counter'});
 // tables
 for(const [x,y] of [[14,8],[18,8],[14,11],[18,11]]){ obj(z,'table',x,y); obj(z,'chair',x-1,y); obj(z,'chair',x+1,y); act(z,x,y,{type:'msg',text:'Someone left half a muffin and a very cold latte.'}); }
 // Phoebe's corner
 obj(z,'mic',3,12);
 // plants
 obj(z,'plant',1,3); obj(z,'plant',20,6); obj(z,'plant',1,13); obj(z,'plant',20,13);

 // --- Cast (placeholder sprites + name tags; swap in your own art, see README) ---
 z.npcs.push({id:'gunther',name:'Gunther',cast:true,x:16,y:3,dir:'down',talk:'gunther',reward:'mug',look:{skin:'#efc9a8',hair:'#4a3426',style:'short',shirt:'#4a4a58',pants:'#2b2b30',apron:true}});
 z.npcs.push({id:'rachel',name:'Rachel',cast:true,x:16,y:10,dir:'down',talk:'rachel',reward:'trifle',couch:true,wander:[10,6,11,7],walkOn:['wood'],look:{skin:'#efc9a8',hair:'#4a3426',style:'long',fem:true,outfit:'skirt',shirt:'#6aa6cf',pants:'#3b3b4a',apron:true}});
 z.npcs.push({id:'phoebe',name:'Phoebe',cast:true,x:2,y:12,dir:'right',talk:'phoebe',reward:'painting',couch:true,guitar:true,look:{skin:'#efc9a8',hair:'#4a3426',style:'long',fem:true,outfit:'dress',shirt:'#b884c9',pants:'#5a4a7a'}});
 // customers
 const C=(id,x,y,dir,look,lines,quiz)=>z.npcs.push({id,x,y,dir,look,lines,quiz,seated:true});
 C('c1',13,8,'right',{skin:'#c68a5a',hair:'#2a1d17',style:'short',shirt:'#d0a040',pants:'#3a3a44'},["This is my fourth coffee. I can see sounds now."],true);
 C('c2',19,11,'left',{skin:'#f1c9a5',hair:'#c9a253',style:'bun',fem:true,shirt:'#4f8a6a',pants:'#3a3a44'},["I come here every day hoping to get the orange couch. Every. Single. Day. It's always taken by the same six people."],true);
 C('c3',17,8,'right',{skin:'#5e3a26',hair:'#1c1410',style:'long',fem:true,outfit:'skirt',shirt:'#c0573a',pants:'#2b3a55'},["The guy behind the counter has been staring at the waitress for an hour. Is that… normal here?"],false);
})();

/* ---------------- Upstairs hallway (Monica's building) ---------------- */
(function(){
 const z = Z('hall','Upstairs Hallway',14,9,'wood'); z.tune='home';
 paint(z,'wallH',0,0,14,2); paint(z,'wains',0,2,14,1);
 paint(z,'wallS',0,0,1,9); paint(z,'wallS',13,0,1,9);
 paint(z,'frontA',0,8,14,1); paint(z,'stairs',6,8,2,1);
 obj(z,'walldoor',4,2,{color:'#5b3a8c',num:'20',frame:true});
 obj(z,'walldoor',9,2,{color:'#7a5232',num:'19'});
 door(z,4,2,'monica',10,13,'up'); door(z,9,2,'joey',9,11,'up');
 door(z,6,8,'village',18,9,'down'); door(z,7,8,'village',18,9,'down');
 obj(z,'frame',7,1,{tone:'#4a7a6a'}); obj(z,'plant',1,3); obj(z,'plant',12,3);
 obj(z,'rug',3,4,{w:8,h:3,low:true,tone:'#5a3a6a'});
 act(z,7,2,{type:'quiz',name:'The Photo Wall',icon:'polaroid',script:{narrate:true,greet:["A wall of framed snapshots: a purple door, an orange couch, a turkey in sunglasses… Someone has labeled them with questions.","A sticky note: 'Picture round! Six photos. Get five right and take a Polaroid.'"],offer:"Play the picture round?",tags:'pic',prefer:'pic',n:6,need:5,reward:'polaroid',yes:"Let's look",no:'Maybe later',noReply:'The photos will wait.',win:"You recognized almost everything! You peel a Polaroid off the wall. Nobody will notice. (Monica will notice.)",lose:"Hmm, a few of those got by you. Look closer next time!"}});
})();

/* ---------------- Monica's apartment (#20) ---------------- */
(function(){
 const z = Z('monica',"Monica's Apartment",22,15,'wood'); z.tune='home';
 z.bg='#140e1c';
 paint(z,'wallP',0,0,22,2); paint(z,'wains',0,2,22,1);
 paint(z,'wallS',0,0,1,15); paint(z,'wallS',21,0,1,15);
 paint(z,'frontA',0,14,22,1); paint(z,'mat',10,14,2,1);
 paint(z,'tileK',1,3,9,6);
 door(z,10,14,'hall',4,3,'down'); door(z,11,14,'hall',4,3,'down');
 // kitchen along the back wall
 obj(z,'fridge',1,3); obj(z,'kcounter',2,3,{w:4,sink:true}); obj(z,'stove',6,3); obj(z,'kcounter',7,3,{w:2});
 obj(z,'kcounter',3,6,{w:4});
 act(z,1,3,{type:'msg',text:"The fridge is organized by food group, then color, then expiration date. There's a label maker in here too."});
 act(z,6,3,{type:'msg',text:"Something is simmering. You are not allowed to touch it."});
 for(let x=2;x<6;x++) act(z,x,3,{type:'msg',text:"Spotless. You could perform surgery on this counter."});
 for(let x=3;x<7;x++) act(z,x,6,{type:'msg',text:"A cutting board, a very sharp knife, and a stack of eleven differently colored towels."});
 // big window on the back wall
 obj(z,'bigwindow',12,0,{w:4});
 for(let x=12;x<16;x++) act(z,x,2,{type:'msg',text:"Across the street, an apartment with the blinds wide open.\nYou close the curtains. Some things can't be unseen."});
 obj(z,'frame',17,1,{tone:'#6a8a4a'}); obj(z,'frame',9,1,{tone:'#b06a3a'});
 // dining table
 obj(z,'dtable',11,6,{w:3}); obj(z,'chair',10,6); obj(z,'chair',14,6);
 for(let x=11;x<14;x++) act(z,x,6,{type:'msg',text:"The dining table, set for eight. Monica says it's 'just a casual dinner.'"});
 // living room
 obj(z,'rug',13,9,{w:8,h:4,low:true,tone:'#3f5a7a'});
 obj(z,'couch',15,9,{w:4,color:'#e6dcc6'}); obj(z,'coffee',16,11,{w:2}); obj(z,'armchair',14,11,{face:'right'}); obj(z,'armchair',19,11,{face:'left'});
 for(let x=15;x<19;x++) act(z,x,9,{type:'msg',text:"A very nice couch. Monica would like you to sit on it… carefully. Coasters are on the table."});
 act(z,16,11,{type:'msg',text:"A bowl of index cards in Ross's handwriting. 'APARTMENT QUIZ: DO NOT TOUCH.'"}); act(z,17,11,{type:'msg',text:"A bowl of index cards in Ross's handwriting. 'APARTMENT QUIZ: DO NOT TOUCH.'"});
 obj(z,'plant',20,3); obj(z,'plant',20,13); obj(z,'plant',1,13);
 z.npcs.push({id:'monica',name:'Monica',cast:true,x:5,y:5,dir:'down',talk:'monica',reward:'cup',wander:[1,4,9,5],walkOn:['tileK','wood'],look:{skin:'#efc9a8',hair:'#2a1d17',style:'bob',fem:true,shirt:'#c0573a',pants:'#2b2b30'}});
 z.npcs.push({id:'ross',name:'Ross',cast:true,x:17,y:12,dir:'down',talk:'ross',reward:'frame',look:{skin:'#efc9a8',hair:'#4a3426',style:'short',shirt:'#7a8a6a',pants:'#3b3b4a'}});
})();

/* ---------------- Joey & Chandler's apartment (#19) ---------------- */
(function(){
 const z = Z('joey',"Joey & Chandler's",20,13,'wood'); z.tune='home';
 z.bg='#120e0a';
 paint(z,'wallC',0,0,20,2); paint(z,'wains',0,2,20,1);
 paint(z,'wallS',0,0,1,13); paint(z,'wallS',19,0,1,13);
 paint(z,'frontA',0,12,20,1); paint(z,'mat',9,12,2,1);
 paint(z,'tileK',1,3,5,4);
 door(z,9,12,'hall',9,3,'down'); door(z,10,12,'hall',9,3,'down');
 obj(z,'fridge',1,3); obj(z,'kcounter',2,3,{w:4,tone:'#8a6a4a'});
 act(z,1,3,{type:'msg',text:"Inside: one jar of jam, a carton of milk, and a sign that says 'JOEY'S. DO NOT EAT.' on everything."});
 for(let x=2;x<6;x++) act(z,x,3,{type:'msg',text:"Pizza boxes. Several. Stacked with real architectural ambition."});
 // TV area
 obj(z,'rug',7,5,{w:7,h:4,low:true,tone:'#6a5a3a'});
 obj(z,'tv',9,3); obj(z,'dogstatue',12,3);
 act(z,9,3,{type:'msg',text:"The TV is paused on Baywatch. Nobody is allowed to unpause it but Joey and Chandler."}); act(z,10,3,{type:'msg',text:"The TV is paused on Baywatch. Nobody is allowed to unpause it but Joey and Chandler."});
 act(z,12,3,{type:'msg',text:"A big white ceramic dog. It stares into the middle distance with great dignity."});
 obj(z,'recliner',8,6); obj(z,'recliner',11,6);
 act(z,8,6,{type:'msg',text:"Joey's recliner. He calls her Rosita. Do not, under any circumstances, sit in Rosita."});
 act(z,11,6,{type:'msg',text:"Chandler's recliner. It reclines. That's really all he needs in life."});
 obj(z,'foosball',14,8);
 act(z,14,8,{type:'msg',text:"The foosball table. Chandler has been undefeated since 1994. (Allegedly.)"}); act(z,15,8,{type:'msg',text:"The foosball table. Chandler has been undefeated since 1994. (Allegedly.)"});
 obj(z,'window',16,0,{w:2}); obj(z,'frame',5,1,{tone:'#3a5a8a'}); obj(z,'plant',18,3); obj(z,'plant',1,11);
 z.npcs.push({id:'joey',name:'Joey',cast:true,x:9,y:9,dir:'down',talk:'joey',reward:'hugsy',wander:[6,7,8,4],walkOn:['wood'],look:{skin:'#e8bf9a',hair:'#2a1d17',style:'short',shirt:'#4a5a8a',pants:'#2b2b30'}});
 z.npcs.push({id:'chandler',name:'Chandler',cast:true,x:16,y:8,dir:'left',talk:'chandler',reward:'dog',look:{skin:'#efc9a8',hair:'#4a3426',style:'short',shirt:'#5a7a5a',pants:'#3b3b4a'}});
 z.npcs.push({id:'duck',name:'Duck',x:4,y:8,dir:'right',talk:'duck',wander:[1,4,18,8],walkOn:['wood','tileK'],look:{animal:'duck'}});
 z.npcs.push({id:'chick',name:'Chick',x:5,y:9,dir:'right',talk:'chick',wander:[1,4,18,8],walkOn:['wood','tileK'],look:{animal:'chick'}});
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
 for(let x=2,i=0;x<w-3;x+=7+(i%3)*2,i++){ if(near(x)||near(x+1)) continue; obj(z,'car',x,i%2?11:14,{color:cols[i%cols.length],dir:i%2?-1:1}); }
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
room('rossapt',"Ross's Apartment",18,12,{wall:'wallC',to:['village',32,9],exitX:8,extra(z){
 obj(z,'bigwindow',3,0,{w:3}); obj(z,'frame',8,1,{tone:'#6a5a3a'}); obj(z,'frame',10,1,{tone:'#3a5a6a'});
 obj(z,'rug',3,5,{w:7,h:4,low:true,tone:'#4a6a5a'}); obj(z,'couch',4,5,{w:4,color:'#6a7a5a'}); obj(z,'coffee',5,7,{w:2});
 for(let x=4;x<8;x++) act(z,x,5,{type:'msg',text:"Ross's couch. It's the one he pivoted up the stairs. It is now in two pieces, held together with optimism."});
 obj(z,'tv',13,3); act(z,13,3,{type:'msg',text:"A documentary about the Cretaceous period is paused. It has been paused for three days."}); act(z,14,3,{type:'msg',text:"A documentary about the Cretaceous period is paused. It has been paused for three days."});
 obj(z,'dinoskull',16,3); act(z,16,3,{type:'msg',text:"A replica dinosaur skull. Ross named it. He won't tell you what he named it."});
 obj(z,'trunk',15,8); act(z,15,8,{type:'quiz',name:'The Costume Trunk',icon:'armadillo',script:{narrate:true,greet:["A trunk labeled 'HOLIDAY STUFF — ROSS. DO NOT OPEN.' Something inside looks… armored.","Taped to the lid: 'Answer five Ross questions, get four right, and the costume is yours. Signed, the Holiday Armadillo.'"],offer:"Open the trunk?",tags:'ross',n:5,need:4,reward:'armadillo',yes:'Open it',no:'Leave it closed',noReply:'Probably wise.',win:"The trunk creaks open. Inside: one Holiday Armadillo costume, slightly dusty, completely magnificent.",lose:"The lid snaps shut. The armadillo is not impressed. Try again!"}});
 obj(z,'plant',1,3); obj(z,'plant',1,10);
 cast(z,'ross_h','Ross',10,8,'down',F('#efc9a8','#4a3426','short','#7a8a6a',{pants:'#3b3b4a'}),{reward:'pants',tags:'ross',n:5,need:4,
  greet:["Oh, hey! Welcome to my apartment. Yes, it's THAT apartment. Ugly Naked Guy's old place. I got it fair and square. Mostly.","I've been wearing my leather pants a lot lately. Big mistake, actually. Long story. Involves lotion and powder."],
  offer:"Five questions about me. Four right and you can have the pants. Please. Take the pants.",yes:'Quiz me',no:'Ask about the pants',noReply:"No. We don't talk about the pants. …Okay, we talk about them a little.",
  win:"You know me better than my own family! Here. The pants. Never put lotion on with them on. Trust me.",lose:"Okay, that's fine. Totally fine. I'm fine! Come back anytime."});
}});

/* ---------------- Midtown ---------------- */
street('midtown','Midtown',48,{cross:[20,38],subway:{x:4,y:26,label:'5 AV / 59 ST',spawn:[6,25,'right']},
 north:[
  {x:0,w:8,style:'slate',tower:true,shop:true,awning:'#3a3a46',signBg:'#1f1f26',sign:'9 WEST 57TH',doors:[{x:4,to:['office',8,10]}]},
  {x:8,w:6,style:'brick',shop:true,awning:'#8a2a2a',signBg:'#2a1a1a',sign:"RIFF'S",doors:[{x:3,msg:"Riff's. The gang's lunch spot next to Chandler's office. Today's special is a club sandwich the size of your head."}]},
  {x:14,w:12,style:'cream',shop:true,awning:'#2a2a2a',signBg:'#f4f1ea',signFg:'#1a1a1a',sign:"BLOOMINGDALE'S",doors:[{x:6,to:['bloomies',10,11]}]},
  {x:26,w:8,style:'slate',shop:true,awning:'#2a3a5a',signBg:'#1b2340',sign:'RALPH LAUREN',doors:[{x:4,msg:"Ralph Lauren's corporate offices. Rachel works here in the later seasons. Visitors need an appointment (and great shoes)."}]},
  {x:34,w:8,style:'cream',shop:true,awning:'#1a1a1a',signBg:'#1a1a1a',sign:'SAKS FIFTH AVE',doors:[{x:4,msg:"Saks Fifth Avenue. Rachel could spend an entire paycheck in the shoe department. She has."}]},
  {x:42,w:6,style:'brick',fire:true,tower:true,doors:[{x:3,kind:'stoop',msg:"An apartment building. Somebody upstairs is practicing the bagpipes."}]}],
 south:[
  {x:0,w:12,style:'cream',shop:true,awning:'#c9a24a',signBg:'#5a4a2a',signFg:'#f3e3b0',sign:'THE PLAZA',doors:[{x:7,msg:"The Plaza Hotel. Monica and Chandler celebrated their engagement here, until Ross and Rachel stole the spotlight."}]},
  {x:12,w:8,style:'slate',shop:true,awning:'#3a2a4a',signBg:'#2a1a3a',sign:'THE PIERRE',doors:[{x:4,msg:"The Pierre. A very fancy Fifth Avenue hotel. The kind of place where weddings get planned for years."}]},
  {x:22,w:14,style:'slate',shop:true,awning:'#c0262c',signBg:'#1a2a5a',sign:'MADISON SQUARE GARDEN',doors:[{x:7,msg:"Madison Square Garden. Tonight: Rangers hockey. Someone near the glass is about to get hit with a puck."}]},
  {x:36,w:12,style:'neon',shop:true,awning:'#e8642a',signBg:'#1a1a1a',signFg:'#ffd84a',sign:'TIMES SQUARE',doors:[{x:6,msg:"Times Square. Bright lights, enormous billboards, and a guy in a giant hot dog costume who wants a photo with you."}]}],
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
room('bloomies',"Bloomingdale's",22,13,{wall:'wallC',floor:'marble',to:['midtown',20,9],exitX:10,tune:'city',extra(z){
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
  {x:0,w:8,style:'cream',shop:true,awning:'#c0262c',signBg:'#2a2a2a',signFg:'#ff7a9a',sign:'MOONDANCE DINER',doors:[{x:4,to:['diner',8,9]}]},
  {x:8,w:8,style:'slate',shop:true,awning:'#5a4a7a',signBg:'#f4f1ea',signFg:'#3a2a4a',sign:'FORTUNA FASHIONS',doors:[{x:4,msg:"Fortuna Fashions. Rachel's first fashion job, which was mostly getting coffee for people."}]},
  {x:16,w:7,style:'brown',shop:true,awning:'#2f6b3a',signBg:'#1f2a1a',sign:"ALESSANDRO'S",doors:[{x:3,msg:"Alessandro's. Monica wrote a scathing review of this place, and then they hired her as head chef."}]},
  {x:23,w:7,style:'brick',fire:true,tower:true,doors:[{x:3,kind:'stoop',msg:"A loft building. The buzzer says 'ARTISTS ONLY. NO EXCEPTIONS.'"}]},
  {x:30,w:10,style:'slate',shop:true,awning:'#1a1a2a',signBg:'#1a1a2a',signFg:'#7ad0ff',sign:'IRIDIUM',doors:[{x:5,msg:"Iridium. Monica was head chef here for about five minutes, until she accepted a gift of steaks."}]}],
 south:[
  {x:0,w:10,style:'cream',fire:true,doors:[{x:5,kind:'stoop',msg:"A cast-iron loft building. Very SoHo. Very expensive. Very locked."}]},
  {x:10,w:8,style:'brick',shop:true,awning:'#d48a2a',signBg:'#2a1a0a',sign:'GALLERY',doors:[{x:4,msg:"An art gallery. Tonight's show: 'Paintings That Stare Back.' Phoebe would love this."}]},
  {x:18,w:12,style:'cream',fire:true,doors:[{x:6,kind:'stoop',msg:"Nobody's home."}]},
  {x:30,w:10,style:'brown',tower:true,doors:[{x:5,kind:'stoop',msg:"A doorbell plays a little tune when you press it. Nobody answers."}]}],
 extra(z){
  townie(z,'s1',6,10,F('#c68a5a','#2a1d17','long','#d0a040',{fem:true,outfit:'skirt'}),["The diner across the street has waitresses in wigs. One of them is an incredible chef. Long story."],true);
  townie(z,'s2',32,16,F('#f1c9a5','#2a1d17','short','#2a2a2a'),["I'm an artist. My medium is… disappointment. It's very SoHo."],true);
  townie(z,'s3',20,25,F('#5e3a26','#1c1410','bun','#5b9bd5',{fem:true}),["Iridium had a new head chef for, like, a day. She got fired over steaks. STEAKS."],false);
 }});
room('diner','Moondance Diner',18,11,{wall:'wallH',floor:'tileD',to:['soho',4,9],exitX:8,tune:'city',extra(z){
 obj(z,'kcounter',2,3,{w:8,tone:'#c0262c'}); for(let x=2;x<10;x++) act(z,x,3,{type:'msg',text:'The counter. A milkshake machine is whirring. It has been whirring since 1958.'});
 for(const x of [3,5,7]) obj(z,'stool',x,5);
 obj(z,'jukebox',15,3); act(z,15,3,{type:'msg',text:'The jukebox only plays songs from the 1950s. One of them is about a car. They are all about a car.'});
 for(const [x,y] of [[12,5],[12,8],[15,8]]){ obj(z,'booth',x,y); act(z,x,y,{type:'msg',text:'A red vinyl booth. It squeaks when you look at it.'}); act(z,x+1,y,{type:'msg',text:'A red vinyl booth. It squeaks when you look at it.'}); }
 obj(z,'plant',1,9);
 cast(z,'monica_d','Monica',5,7,'down',F('#efc9a8','#f0d070','long','#e05a7a',{fem:true,outfit:'dress'}),{reward:'wig',tags:'monica',n:5,need:4,
  greet:["Welcome to the Moondance Diner! I'm Monica, I'll be your waitress. Yes, this is a wig. No, we're not talking about it.","I'm a CHEF. I'm just… between kitchens."],
  offer:"Five questions about me. Get four right and you can have the wig. I mean it. Please take the wig.",yes:'Bring it',no:'Just a milkshake',noReply:"One milkshake, coming up. With a side of my crushed dreams.",
  win:"You win! Here, the wig is yours. I'm free!",lose:"Ha! I mean, oh, too bad. Come back anytime. I'll be here. In the wig."});
 townie(z,'d1',12,6,F('#e0ac7e','#8a8a8a','short','#5a6a3a'),["The meatloaf here is incredible. The waitress in the wig keeps fixing the recipe when the cook isn't looking."],true,[11,6,6,1],['tileD']);
}});

/* ---------------- Uptown ---------------- */
street('uptown','Uptown',40,{cross:[28],south:'park',gaps:[18,34],subway:{x:4,y:17,label:'81 ST – MUSEUM',spawn:[6,16,'right']},
 north:[
  {x:0,w:20,style:'cream',columns:true,sign:'MUSEUM OF PREHISTORIC HISTORY',signBg:'#5a4a2a',signFg:'#f3e3b0',doors:[{x:10,kind:'shop',to:['museum',11,12]}]},
  {x:20,w:8,style:'brown',tower:true,doors:[{x:4,kind:'stoop',msg:"An Upper West Side brownstone. A very small dog barks at you through the mail slot."}]},
  {x:28,w:12,style:'cream',fire:true,shop:true,shopW:6,awning:'#2f5c7a',signBg:'#1f2a3a',sign:'DELI',doors:[{x:3,msg:"The deli is out of everything except pickles. So many pickles."},{x:9,kind:'stoop',msg:"A doorman eyes you suspiciously. You decide not to ask."}]}],
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
room('museum','Museum of Prehistoric History',24,14,{wall:'wallH',floor:'marble',to:['uptown',10,9],exitX:11,tune:'home',extra(z){
 obj(z,'wallsign',6,0,{w:12,text:'Museum of Prehistoric History'});
 obj(z,'dino',8,5); for(let x=8;x<14;x++) for(const y of [5,6]) act(z,x,y,{type:'msg',text:"A full skeleton of a huge dinosaur. A tiny sign says: 'Do not touch. This means you, Ross's friends.'"});
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
  {x:0,w:22,style:'brick',shop:true,awning:'#c0262c',signBg:'#c0262c',signFg:'#ffffff',sign:'SILVERCUP STUDIOS',doors:[{x:11,to:['studio',10,11]}]},
  {x:22,w:14,style:'slate',doors:[{x:7,kind:'plain',msg:"A warehouse. A sign on the door: 'PROPS — DO NOT TOUCH. THIS MEANS YOU, TRIBBIANI.'"}]}],
 extra(z){
  townie(z,'q1',8,16,F('#c68a5a','#2a1d17','short','#5a6a8a'),["I'm an extra on Days of Our Lives. I play 'Doctor Walking Past.' I've walked past Dr. Drake Ramoray eleven times."],true);
  townie(z,'q2',20,16,F('#f1c9a5','#b5462a','long','#5cb85c',{fem:true,outfit:'dress'}),["The skyline from over here is the best view in the city. Don't tell Manhattan."],true);
  act(z,10,18,{type:'msg',text:"The Manhattan skyline across the East River. Somewhere over there, six friends are drinking coffee."});
 }});
room('studio','Days of Our Lives (Set 4)',22,13,{wall:'wallC',floor:'conc',to:['queens',11,9],exitX:10,tune:'city',extra(z){
 obj(z,'wallsign',6,0,{w:10,text:'Days of Our Lives'});
 obj(z,'hospbed',4,5); act(z,4,5,{type:'msg',text:"The hospital-room set. The heart monitor is just a TV playing a looping video of a heart monitor."}); act(z,5,5,{type:'msg',text:"The hospital-room set. The heart monitor is just a TV playing a looping video of a heart monitor."});
 obj(z,'camera',9,8); obj(z,'camera',14,8); for(const x of [9,14]) act(z,x,8,{type:'msg',text:"A big studio camera. A sticky note on it says: 'Joey, please stop waving at this.'"});
 obj(z,'stagelight',2,9); obj(z,'stagelight',19,4); obj(z,'chair',17,9); act(z,17,9,{type:'msg',text:"A director's chair. The back says 'DIRECTOR.' The seat says 'NOT JOEY.'"});
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
 obj(z,'building',1,1,{w:9,h:8,style:'neon',shop:true,awning:'#ff6fb0',signBg:'#1a0a1a',signFg:'#ff9ad0',sign:'WEDDING CHAPEL',doors:[{x:4,kind:'shop'}]});
 msgDoor(z,5,8,"A 24-hour wedding chapel. Two people you know very well got married here after a lot of drinks. Neither remembers it.");
 obj(z,'building',12,1,{w:12,h:8,style:'neon',shop:true,awning:'#e8b820',signBg:'#1a1a0a',signFg:'#ffd84a',sign:'CAESARS PALACE',doors:[{x:6,kind:'shop'}]});
 msgDoor(z,18,8,"Caesars Palace. Inside, an actor in a gladiator outfit is posing for photos and very much living his dream.");
 obj(z,'cab',19,11); homeAct(z,19,11,'Back to JFK'); homeAct(z,20,11,'Back to JFK');
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
superfan('monica','jack','Jack Geller',12,8,'up',F('#efc9a8','#d8d8d0','bald','#5a6a8a',{pants:'#3a3a44'}),'geller','porsche',
 ["Well, hello there! I'm Jack Geller. Monica's father. Ross's too, I'm told.","Judy and I came over for dinner. Monica's been 'resting' the roast for forty-five minutes."],
 "Tell you what: get these right and I'll give you the keys to the Porsche. The keychain, anyway.",
 "Hey, you're sharp! Here's the keychain. Don't tell Ross.","Close! That's okay. Nobody gets the Chi-Chi question right.");
superfan('monica','judy','Judy Geller',9,9,'right',F('#efc9a8','#8a8a8a','bob','#8e4a6a',{fem:true,outfit:'skirt',pants:'#3a3a44'}),'geller','album',
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
