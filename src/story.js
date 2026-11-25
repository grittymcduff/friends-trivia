/* =====================================================================
   v2.1 Story mode: the whole series, one season at a time.
   Each season has four steps. A step happens at a person (npc id), at a
   thing you use (act), or just by walking somewhere (spot [x,y,radius]).
   A step can tell a bit of story, run a quiz on that season's episodes,
   and hand over a keepsake. Free Play ignores all of this.
   ===================================================================== */
const STORY=[
 {t:"The One Where It All Begins",
  tx:"New York, 1994. Six friends, one coffee house, and a bride who just ran out on her own wedding. Season 1 starts at Central Perk.",
  steps:[
   {z:'perk',npc:'rachel',goal:"Find the runaway bride at Central Perk",
    lines:[{who:'Rachel',text:"Oh my God, hi. Sorry, I'm still kind of… wet. And in a wedding dress."},
     {who:'Rachel',text:"I left Barry at the altar! I was looking at the gravy boat and I just… ran. Monica's the only person I know in the city."},
     {who:'Rachel',text:"She says I can stay with her. Ross keeps looking at me funny, though. Go say hi to him at his place, would you?"}]},
   {z:'rossapt',npc:'marcel',goal:"Ross has a new roommate. Visit Ross's apartment",give:'marcel',
    lines:[{text:"(A small monkey in a tiny shirt is sitting on Ross's couch.)"},
     {who:'Ross',text:"That's Marcel! He's a capuchin. Since Carol left, I wanted, you know… someone to come home to."},
     {who:'Ross',text:"He really likes you. Take this photo of him for your shelf. He's very photogenic."}]},
   {z:'joey',npc:'chandler',goal:"There was a blackout! Hear Chandler's story at Joey & Chandler's",
    lines:[{who:'Chandler',text:"So the lights go out, and I'm stuck in an ATM vestibule. With Jill Goodacre. The model."},
     {who:'Chandler',text:"I was smooth. I was charming. I also choked on a piece of gum in front of her."},
     {who:'Chandler',text:"Okay, season one quiz. Four questions, get three, and I'll tell you what happened next."}],
    quiz:{n:4,need:3,win:"Nice! And the big news: Ross is crazy about Rachel. He just never says it. Rachel's birthday is coming up…",lose:"Not quite. Brush up on season one and come back."}},
   {z:'airport',spot:[11,6,2],goal:"Rachel knows Ross loves her! Meet her at JFK",
    lines:[{text:"(Rachel is at the gate holding flowers, scanning the faces coming off the plane from China.)"},
     {who:'Rachel',text:"Chandler told me. Ross has liked me since high school! I came to meet his plane."},
     {who:'Rachel',text:"Quiz me while we wait? Five questions from this whole first year. Get four."}],
    quiz:{who:'Rachel',n:5,need:4,win:"Here he comes! He's… holding hands with someone? Oh no.",lose:"Okay, I'm too nervous to think. Try again!"}}]},
 {t:"The One Where Ross Comes Back",
  tx:"Season 2. Ross is back from China, and he didn't come back alone. Joey finally lands a big role, and Monica meets an older man.",
  steps:[
   {z:'perk',npc:'gunther',goal:"Get the gossip from Gunther at Central Perk",
    lines:[{who:'Gunther',text:"…Ross brought a girl back from China. Julie. Rachel's taking it great."},{who:'Gunther',text:"That's sarcasm. I don't use it much."},
     {who:'Gunther',text:"Four questions about this year. Three right and I'll tell you more."}],
    quiz:{n:4,need:3,win:"Ross made a list about Rachel and Julie. Rachel found it. Things are… loud.",lose:"No. Come back."}},
   {z:'studio',npc:'joey_s',goal:"Joey landed a soap! Visit him on set in Queens",give:'headshot',
    lines:[{who:'Joey',text:"Hey! Welcome to Days of Our Lives! I'm Dr. Drake Ramoray!"},{who:'Joey',text:"I just told a magazine I write most of my own lines. That's fine, right? Nobody reads those."},
     {who:'Joey',text:"Here, have a signed headshot. Collector's item. Probably."}]},
   {z:'uptown',npc:'richard',goal:"Monica's dating an older man. Meet Richard in the park uptown",
    lines:[{who:'Richard',text:"You must be one of Monica's friends. I'm Richard. Her parents' friend. Long story."},
     {who:'Richard',text:"She's wonderful. Her father's still not speaking to me."},{who:'Richard',text:"Quiz me, I'll quiz you. Four questions."}],
    quiz:{n:4,need:3,win:"Sharp! Go see Monica. I hear there's a prom video tonight.",lose:"Ha, I'm not great at these either. Try again."}},
   {z:'monica',npc:'monica',goal:"Everyone's watching an old prom video at Monica's",
    lines:[{who:'Monica',text:"Okay, popcorn's ready. Behold: our prom night, 1987."},{text:"(On the tape, young Ross puts on a tux to take Rachel when her date doesn't show. Then her date shows up.)"},
     {who:'Monica',text:"Rachel just saw it. She's walking over to Ross… Five questions while we wait for the kiss!"}],
    quiz:{n:5,need:4,win:"She kissed him! Ross and Rachel, finally!",lose:"Ugh, so close. Rewind and try again!"}}]},
 {t:"The One With the Break",
  tx:"Season 3. Rachel trades her apron for a fashion job, Ross gets jealous, and one bad night turns into the most famous argument in the group.",
  steps:[
   {z:'bloomies',npc:'rachel_b',goal:"Rachel quit Central Perk! Find her at Bloomingdale's in Midtown",give:'bag',
    lines:[{who:'Rachel',text:"Welcome to Bloomingdale's! I work in fashion now. Real fashion!"},{who:'Rachel',text:"Mark from the coffee house got me the job. Ross is being totally fine about Mark. Totally."},
     {who:'Rachel',text:"Here, take a bag! Employee perk."}]},
   {z:'rossapt',npc:'ross_h',goal:"Ross needs to talk. Go to his apartment",
    lines:[{who:'Ross',text:"Rachel said we should take a break. So I thought we were on a break!"},{who:'Ross',text:"We were on a break! We were ON a BREAK!"},
     {who:'Ross',text:"…Sorry. Let's do four questions. It calms me down."}],
    quiz:{n:4,need:3,win:"Okay. I feel better. Not good. Better.",lose:"That's okay. I'm not okay. But you're okay."}},
   {z:'village',npc:'frankjr',goal:"Phoebe found her half-brother! Meet Frank Jr. in the Village",
    lines:[{who:'Frank Jr.',text:"Hey. I'm Frank. Phoebe's brother. Half-brother. Same dad."},{who:'Frank Jr.',text:"I like to melt stuff. Phoebe says that's a good hobby."},
     {who:'Frank Jr.',text:"Everybody's going to a beach house in Montauk. You should go too!"}]},
   {z:'montauk',npc:'phoebe_m',goal:"Everyone's at the beach house in Montauk",give:'shell',
    lines:[{who:'Phoebe',text:"You came! I'm here looking for my birth mom. Her name's Phoebe too."},{who:'Phoebe',text:"Also, Ross brought his girlfriend Bonnie, and Rachel's being… Rachel."},
     {who:'Phoebe',text:"Five questions about this whole year! Get four and I'll give you my favorite shell."}],
    quiz:{n:5,need:4,win:"Yay! Here's the shell. And look, Ross and Rachel are kissing in the bedroom. Uh-oh.",lose:"The ocean says try again."}}]},
 {t:"The One With the Embryos",
  tx:"Season 4. A trivia game decides who gets the big apartment, Phoebe does something amazing for her brother, and Ross is getting married. In London.",
  steps:[
   {z:'joey',npc:'joey',goal:"There's a big bet on a trivia game. Get to Joey & Chandler's",
    lines:[{who:'Joey',text:"Okay, here's the deal. Ross made a quiz. If we win, we get the girls' apartment."},{who:'Joey',text:"You're on our team. Five questions. Get four."}],
    quiz:{n:5,need:4,win:"WE WON THE APARTMENT! Monica's screaming. It's great.",lose:"Aw, we lost. That's okay, there's always a rematch."}},
   {z:'village',npc:'frankjr',goal:"Phoebe's doing something amazing for Frank Jr. Find him in the Village",give:'bootie',
    lines:[{who:'Frank Jr.',text:"Phoebe's carrying our babies. Me and Alice. Triplets!"},{who:'Frank Jr.',text:"We're gonna need so many booties. Here, have a pair. We bought a lot."}]},
   {z:'monica',npc:'ross',goal:"Ross has big news. Find him at Monica's",
    lines:[{who:'Ross',text:"I'm getting married! Her name's Emily. She's British. It's been six weeks."},{who:'Ross',text:"Too fast? No. It's not too fast. Is it too fast?"},
     {who:'Ross',text:"The wedding's in London! Get to JFK and catch a flight."}]},
   {z:'london',npc:'joey_l',goal:"Fly to London for Ross's wedding",give:'hat',
    lines:[{who:'Joey',text:"London, baby! Look, I got a hat."},{who:'Joey',text:"Five questions before the wedding. Get four and you get a hat too."}],
    quiz:{n:5,need:4,win:"Nice! Okay, the wedding… Ross just said Rachel's name at the altar. Oh no.",lose:"Ahh. Try again before they start."}}]},
 {t:"The One Where Everybody Finds Out",
  tx:"Season 5. Something happened in London between two friends, and they think nobody knows. Ross has a very bad year, and then there's Vegas.",
  steps:[
   {z:'monica',npc:'monica',goal:"Something's going on with Monica. Go see her",
    lines:[{who:'Monica',text:"Oh! Hi! Nothing's going on. Why would something be going on?"},{text:"(Chandler walks out of Monica's bedroom, sees you, and walks back in.)"},
     {who:'Monica',text:"Okay, fine. Chandler and I are together. Since London. Don't tell anyone! Ross had a rough day at work, go cheer him up."}]},
   {z:'museum',npc:'ross_m',goal:"Someone ate Ross's sandwich at work. Get to the museum",give:'moistmaker',
    lines:[{who:'Ross',text:"Someone ate my sandwich. My Thanksgiving leftover sandwich. With the Moist Maker."},{who:'Ross',text:"MY SANDWICH?!"},
     {who:'Ross',text:"…Sorry. They might put me on sabbatical. Four questions to take my mind off it?"}],
    quiz:{n:4,need:3,win:"Thanks. Here, this is the recipe. Promise me you'll guard it with your life.",lose:"Even the quiz is against me today."}},
   {z:'rossapt',npc:'ross_h',goal:"Ross has a date and a brand new pair of pants",give:'pants',
    lines:[{who:'Ross',text:"New leather pants. Very cool, right? A little hot. Okay, very hot."},{who:'Ross',text:"You know what, take them. I can't feel my legs. Everyone's flying to Vegas!"}]},
   {z:'vegas',npc:'rachel_v',goal:"Everyone's in Las Vegas. Find Rachel on the Strip",give:'veil',
    lines:[{who:'Rachel',text:"Vegas! Ross and I had a couple of drinks. A few drinks. Many drinks."},{who:'Rachel',text:"Five questions! Get four and you get… why do I have a veil?"}],
    quiz:{n:5,need:4,win:"Here's the veil! And… oh no. We got married. Ross and I got MARRIED.",lose:"Everything's spinning. Try again!"}}]},
 {t:"The One Where They Move In",
  tx:"Season 6. Monica and Chandler move in together, Rachel moves in with Phoebe, and Chandler starts planning something big.",
  steps:[
   {z:'phoebe',npc:'phoebe_h',who:'Phoebe',goal:"Rachel's moving in with Phoebe. Help them settle in",
    lines:[{who:'Phoebe',text:"Welcome to my apartment! Rachel lives here now. Monica and Chandler moved in together."},{who:'Phoebe',text:"Rachel brought her hair straightener. I'm sure it's fine."},
     {who:'Phoebe',text:"Housewarming quiz! Four questions, get three."}],
    quiz:{n:4,need:3,win:"Perfect. Do you smell smoke? I'm sure it's fine.",lose:"Try again, roomie!"}},
   {z:'studio',npc:'estelle',goal:"Joey's got a new show. Ask his agent Estelle in Queens",give:'ashtray',
    lines:[{who:'Estelle',text:"My client Joey Tribbiani is starring in Mac and C.H.E.E.S.E. A cop and his robot partner."},
     {who:'Estelle',text:"It's a career-maker. Here, take an ashtray. I've got eleven."}]},
   {z:'uptown',npc:'richard',goal:"Richard has something to tell Monica. Find him uptown",
    lines:[{who:'Richard',text:"I made a mistake letting Monica go. I want to marry her. I want kids with her."},{text:"(Uh-oh. Chandler's planning to propose tonight.)"},
     {who:'Richard',text:"I'm going to tell her. Tonight."}]},
   {z:'monica',npc:'monica',goal:"Chandler has a question for Monica. Get to her apartment",
    lines:[{text:"(The apartment is full of candles. Monica is crying. Chandler is down on one knee.)"},{who:'Monica',text:"Okay, before he says it: five questions about this year! Get four!"}],
    quiz:{n:5,need:4,win:"She said YES! Monica and Chandler are engaged!",lose:"Ahh! Try again, the candles are melting!"}}]},
 {t:"The One With the Wedding",
  tx:"Season 7. Wedding planning takes over everything. Rachel gets an assistant, Ross gets a costume, and Joey gets his old job back.",
  steps:[
   {z:'ralph',npc:'tag',goal:"Rachel's hiring an assistant at Ralph Lauren in Midtown",
    lines:[{who:'Tag',text:"Hi, I'm Tag. Tag Jones. Rachel just hired me. I'm not totally sure what for."},{who:'Tag',text:"She said to ask you four questions. I wrote them down."}],
    quiz:{who:'Tag',n:4,need:3,win:"Cool, thanks! I'll file this. Where's the filing?",lose:"Huh. Rachel said you'd know these."}},
   {z:'rossapt',act:'quiz',goal:"It's the holidays at Ross's. Ben's coming over",give:'armadillo',
    lines:[{who:'Ross',text:"Every Santa suit in New York was rented out. So I'm the Holiday Armadillo."},{who:'Ross',text:"Part of the Hanukkah story! Sort of. Take this. Happy holidays!"}]},
   {z:'studio',npc:'joey_s',goal:"Drake Ramoray is back! Visit Joey on set in Queens",
    lines:[{who:'Joey',text:"Guess who's back on Days? Dr. Drake Ramoray! They gave him a new brain."},{who:'Joey',text:"Okay, I gotta go get ordained. On the internet. I'm marrying Monica and Chandler!"}]},
   {z:'monica',npc:'monica',goal:"It's the wedding! Find Monica",
    lines:[{who:'Monica',text:"I'm getting married! Joey's officiating. Chandler's… where's Chandler?"},{who:'Monica',text:"Five questions to calm me down. Get four."}],
    quiz:{n:5,need:4,win:"He's here! We're married! …Wait, whose pregnancy test is in the bathroom?",lose:"Breathe. Try again. Breathe."}}]},
 {t:"The One With the Baby",
  tx:"Season 8. The test was Rachel's. Now everyone wants to know who the father is, Joey has feelings he didn't plan on, and a baby is on the way.",
  steps:[
   {z:'perk',npc:'rachel',goal:"Rachel has big news. Meet her at Central Perk",
    lines:[{who:'Rachel',text:"So. The test was mine. I'm pregnant."},{who:'Rachel',text:"And the red sweater at the wedding? It was Ross's. Ross is the father."},
     {who:'Rachel',text:"I have to tell him. Go check on Joey, he's been acting weird."}]},
   {z:'joey',npc:'joey',goal:"Joey's acting weird. Check on him",
    lines:[{who:'Joey',text:"I think I'm in love with Rachel. Is that bad? That's bad. Ross's baby!"},{who:'Joey',text:"Ask me four questions. Distract me."}],
    quiz:{n:4,need:3,win:"Okay. I'll tell her. Someday. Maybe.",lose:"Not distracted. Try again."}},
   {z:'monica',npc:'judy',goal:"Judy Geller has something for Ross. Find her at Monica's",
    lines:[{who:'Judy Geller',text:"Ross is having a baby with Rachel and he hasn't even proposed. Well."},{who:'Judy Geller',text:"I gave him my mother's ring. Just in case. He put it in his coat. Joey has his coat."}]},
   {z:'perk',npc:'phoebe',goal:"The baby's coming! Phoebe has news at Central Perk",
    lines:[{who:'Phoebe',text:"It's a girl! Emma! Monica's favorite name, Rachel just took it."},{who:'Phoebe',text:"And Joey picked up the ring and Rachel thinks he proposed. Five questions!"}],
    quiz:{n:5,need:4,win:"Emma Geller-Green is here! And she said yes to Joey?! Oh boy.",lose:"Push! I mean, try again!"}}]},
 {t:"The One in Barbados",
  tx:"Season 9. Rachel and Emma move in with Joey, Chandler takes a job by accident, Phoebe has to choose between two guys, and everyone flies to Barbados.",
  steps:[
   {z:'joey',npc:'joey',goal:"Rachel and Emma moved in with Joey. Say hi",
    lines:[{who:'Joey',text:"Roommates again! Me, Rachel and Emma. Emma's my favorite roommate. Don't tell Rachel."},{who:'Joey',text:"Chandler's freaking out at work. Go to his office in Midtown."}]},
   {z:'office',npc:'chandler_o',goal:"Chandler took a job in Tulsa by accident. Catch him in Midtown",give:'card',
    lines:[{who:'Chandler',text:"I fell asleep in a meeting and said yes to running the office in Tulsa. Tulsa."},{who:'Chandler',text:"Four questions. Get three and you get my business card. It says Tulsa."}],
    quiz:{n:4,need:3,win:"Here. Don't call me. I'll be in Tulsa.",lose:"Even you don't want me to go to Tulsa."}},
   {z:'perk',npc:'phoebe',goal:"Phoebe is choosing between Mike and David. Find her at Central Perk",
    lines:[{who:'Phoebe',text:"David's back from Minsk and he wants to try again. But Mike!"},{who:'Phoebe',text:"Everyone's going to Barbados for Ross's big speech. Mike's coming. I'll figure it out there."}]},
   {z:'barbados',npc:'mike',goal:"Fly to Barbados for Ross's big speech",give:'nametag',
    lines:[{who:'Mike',text:"Hey, I'm Mike. I came for Phoebe. And for the ping-pong, honestly. Monica's terrifying."},{who:'Mike',text:"Five questions? Get four, I'll give you my conference name tag."}],
    quiz:{n:5,need:4,win:"Nice! And look… Joey and Rachel just kissed. Ross is not going to love that.",lose:"Monica beat me at this too."}}]},
 {t:"The Last One",
  tx:"Season 10. A wedding in the snow, twins, a moving van, and one last flight. Then everybody meets up for coffee one more time.",
  steps:[
   {z:'village',spot:[13,10,1],goal:"Phoebe and Mike are getting married outside Central Perk",
    lines:[{text:"(It's snowing. Phoebe is in a white dress on the sidewalk. Chandler is officiating. Monica is holding the flowers like a weapon.)"},{who:'Phoebe',text:"I'm getting married in the snow! Quick, four questions before my toes freeze!"}],
    quiz:{who:'Phoebe',n:4,need:3,win:"Mike and Phoebe Hannigan! Or Princess Consuela Banana-Hammock!",lose:"Brr. Try again!"}},
   {z:'joey',npc:'chandler',goal:"Monica and Chandler are moving to Westchester. Help them pack",
    lines:[{who:'Chandler',text:"Twins! Erica had twins! Jack and Erica. Now we have to move to the suburbs. With a yard."},{who:'Chandler',text:"Rachel's moving to Paris. Ross is going to the airport. Go with him!"}]},
   {z:'airport',spot:[11,6,2],goal:"Rachel's flying to Paris! Get to JFK",
    lines:[{text:"(Ross and Phoebe run in. Phoebe just told the passengers there's something wrong with the left phalange.)"},{who:'Ross',text:"Rachel, wait! I love you! Don't go to Paris!"},
     {text:"(She gets on the plane. A minute later, she gets off the plane.)"},{who:'Ross',text:"Five questions from this year. Get four."}],
    quiz:{who:'Ross',n:5,need:4,win:"She got off the plane! Okay. Everyone's meeting at Central Perk.",lose:"Try again. She's still here. I think."}},
   {z:'perk',act:'couch',goal:"Everyone's meeting at Central Perk. Sit on the couch",give:'key',final:true,
    lines:[{who:'Monica',text:"Everybody left their keys on the counter at the apartment. It's empty now."},{who:'Chandler',text:"Could this couch BE any more crowded?"},
     {who:'Rachel',text:"One last quiz. About everything. Ten questions, get eight."}],
    quiz:{tags:'all',who:'Everyone',n:10,need:8,win:"You did it! Here's a key. The last one. It's yours.",lose:"So close! The couch isn't going anywhere."}}]}
];

const STORY_ON=()=>!!(S&&S.mode==='story');
function storyState(){if(!S.story)S.story={s:0,k:0};return S.story}
function storyStep(){if(!STORY_ON())return null;const st=storyState();if(st.done)return null;const sea=STORY[st.s];return sea&&sea.steps[st.k]||null}
function storyGoalText(){const st=storyState(),p=storyStep();if(st.done)return 'Story complete! Explore as much as you like.';return p?p.goal:''}
function showSeasonCard(s,pre){const sea=STORY[s];$('#chapNum').textContent=`Season ${s+1}`;$('#chapT').textContent=sea.t;$('#chapTx').textContent=(pre?pre+' ':'')+sea.tx;
 const el=$('#chapCard');el.classList.add('on');const prev=state;state='card';SFX.ok();el.onclick=()=>{el.classList.remove('on');state=prev==='card'?'world':prev;updObjective();storyBanner()}}
// did the player just do the current step's thing?
function storyMatchNpc(n){const p=storyStep();return p&&p.npc&&Zn.id===p.z&&n.id===p.npc?p:null}
function storyMatchAct(a){const p=storyStep();return p&&p.act&&Zn.id===p.z&&a.type===p.act?p:null}
function storyRun(p,n){const who=(n&&n.name)||p.who||(p.quiz&&p.quiz.who)||'',lines=(p.lines||[]).map(l=>({who:l.who!==undefined?l.who:null,text:l.text}));
 const finish=()=>{if(p.give&&!S.items[p.give]){giveItem(p.give);say([{text:`(${ITEM(p.give).name} added to your shelf. Press C to see it.)`}],storyAdvance)}else storyAdvance()};
 if(!p.quiz){say(lines,finish);return}
 const q=p.quiz,s=storyState().s;
 const go=()=>startTrivia({who:n||{name:q.who||who,couchIcon:p.act==='couch'},tags:q.tags||('s'+(s+1)),not:['seasons'],n:q.n,need:q.need,reward:p.give&&!S.items[p.give]?p.give:null,win:q.win,lose:q.lose,
  after:won=>{if(won)storyAdvance();else say([{text:"(Give it another try whenever you're ready. Same spot.)"}])}});
 lines.push({who:lines.length?lines[lines.length-1].who:who,text:"Ready?",choices:[{label:"Let's go",fn:go},{label:'In a minute',fn:()=>{}}]});
 // fold the "Ready?" choice into the last line so it reads naturally
 const last=lines[lines.length-2];if(last){last.choices=lines.pop().choices}
 say(lines)}
function storyAdvance(){const st=storyState();st.k++;const sea=STORY[st.s];
 if(st.k>=sea.steps.length){
  if(st.s>=STORY.length-1){st.done=true;save();updObjective();if(STORY[st.s].steps.some(x=>x.final))setTimeout(()=>{if(typeof showCredits==='function')showCredits()},400);return}
  st.s++;st.k=0;save();showSeasonCard(st.s,`Season ${st.s} complete!`)}
 else{save();storyBanner()}
 updObjective()}
// spot steps happen just by walking there
// (after it's happened once, you have to step away and come back to start it again)
let storySpotLock=false;
function storyTick(){const p=storyStep();if(!p||!p.spot||state!=='world'||Zn.id!==p.z){storySpotLock=false;return}const[x,y,r]=p.spot;
 const inside=Math.max(Math.abs(player.x-x),Math.abs(player.y-y))<=r;
 if(storySpotLock){if(!inside)storySpotLock=false;return}
 if(inside&&!player.moving){storySpotLock=true;storyRun(p,null)}}

/* ---------- where to go next ---------- */
// how zones connect: doors, the subway between stations, and flights from JFK
function zoneLinks(id){const z=ZONES[id],out=[];
 for(const d of z.doors)if(!out.some(o=>o.to===d.to&&o.kind==='door'))out.push({to:d.to,kind:'door',x:d.x,y:d.y});
 const sub=z.acts.find(a=>a.type==='subway');if(sub)for(const st of STOPS)if(st.id!==id&&ZONES[st.id])out.push({to:st.id,kind:'subway',x:sub.x,y:sub.y,name:st.name});
 for(const a of z.acts)if(a.type==='fly'&&!out.some(o=>o.to===a.to))out.push({to:a.to,kind:'fly',x:a.x,y:a.y,name:a.label||(ZONES[a.to]&&ZONES[a.to].name)});
 return out}
function routeTo(target){if(Zn.id===target)return null;const prev={[Zn.id]:null},q=[Zn.id];
 while(q.length){const c=q.shift();for(const l of zoneLinks(c)){if(l.to in prev)continue;prev[l.to]={from:c,l};if(l.to===target){let k=target,first=null;while(prev[k]&&prev[k].from!==null){first=prev[k];if(prev[k].from===Zn.id)break;k=prev[k].from}return first&&first.l}q.push(l.to)}}
 return null}
function storyTarget(){const p=storyStep();if(!p)return null;
 if(Zn.id===p.z){
  if(p.npc){const n=npcs.find(m=>m.id===p.npc);return n?{x:n.px+8,y:n.py-18-(n.spr&&n.spr.hd?24*(HD_DRAW-1)+2:0),tx:n.x,ty:n.y,here:true}:null}
  if(p.act){const a=Zn.acts.find(a=>a.type===p.act);return a?{x:a.x*16+8,y:a.y*16-6,tx:a.x,ty:a.y,here:true}:null}
  if(p.spot)return{x:p.spot[0]*16+8,y:p.spot[1]*16+4,tx:p.spot[0],ty:p.spot[1],here:true,spot:true}}
 const l=routeTo(p.z);if(!l)return null;
 // street doors: point at the painted door, not the doormat
 const up=l.kind==='door'&&Zn.doors.some(d=>d.x===l.x&&d.y===l.y&&d.dir==='up');return{x:l.x*16+8,y:l.y*16-(up?22:l.kind==='fly'&&Zn.id==='airport'?-6:4),tx:l.x,ty:l.y,hop:l}}
function hopText(l){if(!l)return '';const n=ZONES[l.to]&&ZONES[l.to].name;
 return l.kind==='subway'?`Take the subway to ${l.name||n}`:l.kind==='fly'?(l.to==='airport'?'Fly back to JFK':`Fly to ${n}`):`Head to ${n}`}
function updObjective(){const el=$('#objTag');if(!el)return;if(!STORY_ON()){el.classList.add('hidden');return}
 const st=storyState(),t=storyTarget();el.classList.remove('hidden');
 $('#objSea').textContent=st.done?'The End':`Season ${st.s+1}`;$('#objGoal').textContent=storyGoalText();
 $('#objHop').textContent=t&&t.hop?'→ '+hopText(t.hop):'';}
// world-space marker over the target (or the way out toward it), and a screen-edge arrow when it's off screen
function drawStoryMarker(W2,k2){if(!STORY_ON()||state==='title')return;const t=storyTarget();if(!t)return;
 const[sx,sy]=W2(t.x,t.y),vw=640/k2,vh=416/k2,b=Math.sin(clock*4)*3,col='#ffcf3a';
 const on=sx>20&&sx<vw-20&&sy>30&&sy<vh-44;
 if(on){ctx.save();ctx.translate(sx,sy-14+b);ctx.scale(1.35,1.35);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(1,18-b,6,2.5,0,0,Math.PI*2);ctx.fill();
  if(t.here){ctx.fillStyle='#2a1a0a';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(9,0);ctx.lineTo(0,11);ctx.lineTo(-9,0);ctx.closePath();ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(7,0);ctx.lineTo(0,9);ctx.lineTo(-7,0);ctx.closePath();ctx.fill();
   ctx.fillStyle='#2a1a0a';ctx.font="900 11px 'Pixelify Sans', monospace";ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.spot?'★':'!',0,.5)}
  else{ctx.fillStyle='#2a1a0a';ctx.beginPath();ctx.moveTo(-8,-5);ctx.lineTo(8,-5);ctx.lineTo(0,6);ctx.closePath();ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-6,-4);ctx.lineTo(6,-4);ctx.lineTo(0,4);ctx.closePath();ctx.fill()}
  ctx.restore();return}
 // off screen: arrow on the edge pointing toward it
 const cxs=vw/2,cys=vh/2-8,dx=sx-cxs,dy=sy-cys,a=Math.atan2(dy,dx),m=Math.min((vw/2-30)/Math.abs(Math.cos(a)||1e-6),(vh/2-48)/Math.abs(Math.sin(a)||1e-6)),ax=cxs+Math.cos(a)*m,ay=cys+Math.sin(a)*m;
 ctx.save();ctx.translate(ax,ay);ctx.rotate(a);const s=1.5+.12*Math.sin(clock*5);ctx.scale(s,s);
 ctx.fillStyle='#2a1a0a';ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(-7,-10);ctx.lineTo(-3,0);ctx.lineTo(-7,10);ctx.closePath();ctx.fill();
 ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-5,-7.5);ctx.lineTo(-1.5,0);ctx.lineTo(-5,7.5);ctx.closePath();ctx.fill();ctx.restore()}

/* v2.1.1: making the way forward easier to see, without shouting.
   - a banner with the next goal whenever it changes (and when you load a story game)
   - the goal box glows for a few seconds when it changes
   - a gold arrow at your feet that follows the actual walking route (around walls and furniture)
     toward the next goal or the way out; it fades away once you're close
   - a soft pulsing ring on the ground under the person or place you need */
function storyBanner(){if(!STORY_ON())return;const st=storyState(),el=$('#storyBanner');if(!el)return;
 if(st.done){el.classList.remove('on');return}
 $('#sbSea').textContent=`Season ${st.s+1} · Next`;$('#sbGoal').textContent=storyGoalText();
 el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(storyBanner.t);storyBanner.t=setTimeout(()=>el.classList.remove('on'),5000);
 const ob=$('#objTag');if(ob){ob.classList.remove('pulse');void ob.offsetWidth;ob.classList.add('pulse')}}
const guide={key:'',path:null,at:-9};
function guidePath(t){const key=Zn.id+':'+player.x+','+player.y+'>'+t.tx+','+t.ty;
 if(guide.key===key&&clock-guide.at<.6)return guide.path;guide.key=key;guide.at=clock;
 const near=(x,y)=>Math.abs(x-t.tx)+Math.abs(y-t.ty)<=1;
 guide.path=(player.x===t.tx&&player.y===t.ty)||near(player.x,player.y)?[]:(bfs(player.x,player.y,(x,y)=>(x===t.tx&&y===t.ty)||near(x,y))||null);return guide.path}
function drawStoryWorld(){if(!STORY_ON()||state==='title'||!Zn)return;const t=storyTarget();if(!t)return;
 const p=.5+.5*Math.sin(clock*3);
 // soft ring on the ground under the goal (or the door / stairs / gate that leads there)
 const gx=t.tx*16+8,gy=t.ty*16+13;ctx.save();ctx.globalAlpha=.35+.35*p;ctx.strokeStyle='#ffd23a';ctx.lineWidth=1.3;ctx.shadowColor='#ffcf3a';ctx.shadowBlur=6;
 ctx.beginPath();ctx.ellipse(gx,gy,9+2*p,3.6+.8*p,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 if(state!=='world'||player.sit)return;
 const path=guidePath(t),dist=Math.abs(player.x-t.tx)+Math.abs(player.y-t.ty);if(!path||!path.length||dist<=3)return;
 // aim a few steps down the route, so the arrow turns the corner before you do
 const w=path[Math.min(3,path.length-1)],px0=player.px+8,py0=player.py+11,a=Math.atan2(w[1]*16+8-py0,w[0]*16+8-px0);
 const fade=Math.min(1,(dist-3)/3),r=13+1.5*p;ctx.save();ctx.globalAlpha=(.55+.3*p)*fade;ctx.translate(px0+Math.cos(a)*r,py0+Math.sin(a)*r*.6);ctx.rotate(a);
 ctx.fillStyle='rgba(40,24,8,.85)';ctx.beginPath();ctx.moveTo(6.5,0);ctx.lineTo(-3.5,-5);ctx.lineTo(-1.5,0);ctx.lineTo(-3.5,5);ctx.closePath();ctx.fill();
 ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(-2.5,-3.6);ctx.lineTo(-.8,0);ctx.lineTo(-2.5,3.6);ctx.closePath();ctx.fill();ctx.restore()}
