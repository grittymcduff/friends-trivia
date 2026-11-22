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
 msgDoor(z,32,8,"This building is right across from Monica's window. Somebody in here never closes their blinds.\nYou decide not to look up.");
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
 const subMsg="The downtown 6 train. Next stops: SoHo, Midtown, Uptown, and Queens.\nThe subway opens in the next update!";
 act(z,5,26,{type:'msg',text:subMsg}); act(z,6,26,{type:'msg',text:subMsg});
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
 const z = Z('perk','Central Perk',22,15,'wood');
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
 const z = Z('hall','Upstairs Hallway',14,9,'wood');
 paint(z,'wallH',0,0,14,2); paint(z,'wains',0,2,14,1);
 paint(z,'wallS',0,0,1,9); paint(z,'wallS',13,0,1,9);
 paint(z,'frontA',0,8,14,1); paint(z,'stairs',6,8,2,1);
 obj(z,'walldoor',4,2,{color:'#5b3a8c',num:'20',frame:true});
 obj(z,'walldoor',9,2,{color:'#7a5232',num:'19'});
 door(z,4,2,'monica',10,13,'up'); door(z,9,2,'joey',9,11,'up');
 door(z,6,8,'village',18,9,'down'); door(z,7,8,'village',18,9,'down');
 obj(z,'frame',7,1,{tone:'#4a7a6a'}); obj(z,'plant',1,3); obj(z,'plant',12,3);
 obj(z,'rug',3,4,{w:8,h:3,low:true,tone:'#5a3a6a'});
 act(z,7,2,{type:'msg',text:"A framed print of a sailboat. Someone has straightened it very, very precisely. (Probably Monica.)"});
})();

/* ---------------- Monica's apartment (#20) ---------------- */
(function(){
 const z = Z('monica',"Monica's Apartment",22,15,'wood');
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
 const z = Z('joey',"Joey & Chandler's",20,13,'wood');
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
