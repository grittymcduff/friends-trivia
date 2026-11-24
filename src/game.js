'use strict';
/* =====================================================================
 *  The One With The Trivia Game: engine
 *  Sections: core helpers · art (tiles, buildings, props, characters, items) ·
 *  zones & movement · NPCs & taxis · dialogue · trivia · collection · render · input · boot
 * ===================================================================== */

/* ---------- Custom sprites ----------
 * To use your own character art, add PNG sprite sheets in a sprites/ folder next to index.html and list them here.
 * Sheet layout: 3 columns (stand, step A, step B) x 4 rows (down, left, right, up), each frame 16x24 px.
 * Example:  const SPRITE_FILES = { gunther:'sprites/gunther.png', rachel:'sprites/rachel.png' };
 */
const SPRITE_FILES = {};
/* v1.0: HD sprite sheets from the art bundle (built by tools/prep_sprites.py).
 * Each sheet: 3 columns x 4 rows (Down, Up, Left, Right), cells 128x192 (8x the 16x24 world cell).
 * A character uses one by setting look.hd to a key below; until the file loads (or if it is missing,
 * e.g. when index.html is opened on its own) the character falls back to the procedural sprite.
 * To add more: drop the PNG into the bundle, run tools/prep_sprites.py, then add a line here. */
const HD_SPRITES = {
 rachel_waitress:'Rachel_Waitress_apron_blue_top_and_skirt', rachel_work:'Rachel_All_black_work_outfit', rachel_vegas:'Rachel_White_dress',
 monica_bob:'Monica_Bob_haircut_orange_red_top', monica_diner:'Monica_Blonde_wig_pink_dress', monica_barbados:'Monica_Green_top_and_skirt',
 phoebe_guitar:'Phoebe_Purple_dress_carrying_a_guitar', phoebe_sundress:'Phoebe_Yellow_sundress',
 ross_green:'Ross_Green_shirt_Monicas_Apartment', ross_home:'Ross_Green_shirt_Rosss_Apartment',
 joey_navy:'Joey_Navy_shirt', joey_doctor:'Joey_White_doctor_style', chandler_work:'Chandler_White_work_shirt',
 gunther:'Gunther_Barista_apron', heckles:'Mr_Heckles_Upstairs_Hallway', jack:'Jack_Geller_Monicas_Apartment', judy:'Judy_Geller_Monicas_Apartment',
 frankjr:'Frank_Jr_Greenwich_Village_sidewalk', janice:'Janice_Bloomingdales_Midtown', richard:'Richard_Central_Park_Uptown',
 estelle:'Estelle_Days_of_Our_Lives_set_Queens', mike:'Mike_Barbados_by_the_ping_pong_table',
 monica_turkey:'Monica_Turkey_on_her_head_sunglasses_and_fez', ross_armadillo:'Ross_Holiday_Armadillo_costume',
 joey_tourist:'Joey_London_flag_hat_camera_and_map', joey_porsche:'Joey_BoxPorsche', chandler_box:'Chandler_InABox',
 joey_layers:'Joey_EverythingChandlerOwns', ross_leatherpants:'Ross_LeatherPants', duck_runaway:'Duck_Runaway', chick:'Chick_Apartment',
 eddie:'eddie', usher:'usher', duck_hd:'duck_hd', marcel:'marcel',
};
// Which sheet each cast NPC (by id in maps.js) wears. Secret sightings set look.hd in EGGS instead.
// Not in the art bundle yet, so these stand in: Ross brown shirt (ross_m), Joey red shirt (joey_l), Chandler green shirt (chandler).
const HD_CAST = {
 gunther:'gunther', rachel:'rachel_waitress', phoebe:'phoebe_guitar', monica:'monica_bob', ross:'ross_green', joey:'joey_navy', chandler:'chandler_work', chick:'chick',
 ross_h:'ross_home', chandler_o:'chandler_work', rachel_b:'rachel_work', monica_d:'monica_diner', ross_m:'ross_green', joey_s:'joey_doctor', joey_l:'joey_navy',
 rachel_v:'rachel_vegas', monica_b:'monica_barbados', phoebe_m:'phoebe_sundress',
 heckles:'heckles', jack:'jack', judy:'judy', frankjr:'frankjr', janice:'janice', richard:'richard', estelle:'estelle', mike:'mike',
 duck:'duck_hd', eddie:'eddie', usher:'usher', marcel:'marcel', monica_f:'monica_bob', chandler_f:'chandler_work', joey_f:'joey_navy', ross_f:'ross_green',
};
const HD_PROPS = { carcover:'sprites/hd/Joey_BoxPorsche_prop.png' };
/* v1.3: HD Greenwich Village art (tools/prep_village.py), 8 px per world pixel.
 * Facades: buildings with hd:'<key>' in maps.js. Ground: by tile type, everywhere outdoors.
 * Props: by object kind. Anything not loaded yet (or missing) keeps the generated art. */
const VG='sprites/village/';
const HD_FACADES=['n1_brownstone','n2_brick','n3_central_perk','n4_brick_ross','n5_brownstone','n6_rays_pizza','s1_lucille_lortel','s2_brownstone','s3_village_cigars','s4_brick_phoebe','s5_brownstone_wide','x_mid_57th','x_mid_riffs','x_mid_bloomies','x_mid_ralph','x_mid_saks','x_mid_apt','x_mid_plaza','x_mid_pierre','x_mid_msg','x_mid_times','x_soho_moondance','x_soho_fortuna','x_soho_alessandro','x_soho_loft','x_soho_iridium','x_soho_castiron','x_soho_gallery','x_soho_house1','x_soho_house2','x_up_museum','x_up_brownstone','x_up_deli','x_q_silvercup','x_q_warehouse','x_vegas_chapel','x_vegas_caesars'];
const HD_GROUND={walk:'ground_sidewalk',road:'ground_road',inter:'ground_road',laneH:'ground_road_centerline',laneV:'ground_road_centerline',crossH:'ground_crosswalk',crossV:'ground_crosswalk',grass:'ground_grass',path:'ground_path',roofs:'ground_rooftop'};
const HD_PROP_FILES={lamp:'prop_lamp',tree:'prop_tree_street',tree_park:'prop_tree_park',hydrant:'prop_hydrant',news:'prop_newsbox',planter:'prop_planter',sign:'prop_street_sign',barricade:'prop_barricade',subway:'prop_subway',fence:'prop_fence',bench:'prop_bench',car:'prop_car_template',taxi:'prop_taxi'};
const hdFacades={},hdGround={},hdVProps={};
function loadVillageArt(){
 const get=(file,cb)=>{const im=new Image();im.onload=()=>cb(im);im.src=VG+file+'.png'};
 for(const k of HD_FACADES)get('bldg_'+k,im=>{hdFacades[k]=im});
 const rot=im=>{const[c,g]=mk(im.height,im.width);g.translate(im.height,0);g.rotate(Math.PI/2);g.drawImage(im,0,0);return c};
 for(const[t,f]of Object.entries(HD_GROUND))get(f,im=>{hdGround[t]=(t==='laneV'||t==='crossV')?rot(im):im});
 for(const[k,f]of Object.entries(HD_PROP_FILES))get(f,im=>{hdVProps[k]=im;carHDCache={}})}
// the parked/driving car template has a magenta body: repaint it per colour, keeping its shading
let carHDCache={};
function carHD(col,taxi,model){const k=(taxi?'taxi'+(model||''):col+(model||''));if(carHDCache[k])return carHDCache[k];
 const src=taxi?(model?hdIn.car_taxi90:hdVProps.taxi):model?hdIn['car_'+model+'_t']:hdVProps.car;if(!src)return null;
 const[c,g]=mk(src.width,src.height);g.drawImage(src,0,0);
 if(!taxi){const d=g.getImageData(0,0,c.width,c.height),a=d.data,[R,G,B]=hexRGB(col);
  for(let i=0;i<a.length;i+=4){const r=a[i],gg=a[i+1],b=a[i+2];if(r>55&&b>55&&gg<r*.62&&gg<b*.62){const l=(r+b)/2/255*1.15;a[i]=Math.min(255,R*l);a[i+1]=Math.min(255,G*l);a[i+2]=Math.min(255,B*l)}}
  g.putImageData(d,0,0)}
 return carHDCache[k]=carInfo(c,taxi?(model?'car_taxi90':'taxi'):model?'car_'+model+'_t':'car')}
// v1.8.1: clean the light fringe left around the tyres by the cut-out, and measure how much empty space sits under
// them (so every model's tyres touch the same line)
function carInfo(c,key){const g=c.getContext('2d'),W=c.width,H=c.height,d=g.getImageData(0,0,W,H),a=d.data,A=i=>a[i*4+3];
 for(let pass=0;pass<2;pass++){const kill=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!A(i))continue;
   const edge=x===0||y===0||x===W-1||y===H-1||!A(i-1)||!A(i+1)||!A(i-W)||!A(i+W);if(!edge)continue;
   const r=a[i*4],gg=a[i*4+1],b=a[i*4+2],mn=Math.min(r,gg,b),mx=Math.max(r,gg,b);if((mn>165&&mx-mn<45)||A(i)<170)kill.push(i)}
  for(const i of kill)a[i*4+3]=0}
 g.putImageData(d,0,0);
 // ground line: lowest row with a real amount of opaque pixels
 let ground=H-1;for(let y=H-1;y>0;y--){let n=0;for(let x=0;x<W;x++)if(A(y*W+x)>200)n++;if(n>W*.04){ground=y;break}}
 return{l:c,pad:H-1-ground}}
// draw a car with its tyres on world line `by`
function drawCar(info,cx,by,flip,sc,ang){const im=info.l,s=sc/8,w=im.width*s,h=im.height*s,bb=by+info.pad*s;
 ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(cx,by-1,w*.42,Math.max(1.5,w*.08),0,0,7);ctx.fill();
 ctx.save();ctx.translate(cx,bb-h);if(flip)ctx.scale(-1,1);ctx.translate(-w/2,0);smooth(true);ctx.drawImage(im,0,0,w,h);
 smooth(false);ctx.restore()}
let grantaxiInfo=null;const vehInfo={};
// draw an HD image (in 8x pixels) with its bottom centre at world (cx, by); soft shadow underneath
function drawHDProp(im,cx,by,shadow,flip,sc){const w=im.width/8*(sc||1),h=im.height/8*(sc||1);
 if(shadow){ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(cx,by-1,w*.42,Math.max(1.5,w*.08),0,0,7);ctx.fill()}
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 if(flip){ctx.save();ctx.translate(cx,0);ctx.scale(-1,1);ctx.drawImage(im,-w/2,by-h,w,h);ctx.restore()}else ctx.drawImage(im,cx-w/2,by-h,w,h);
 ctx.imageSmoothingEnabled=false}
/* v1.5: HD interiors and trip props (tools/prep_interiors.py), also 8 px per world pixel.
 * HD_IN maps an object kind to its sprite. t: magenta template, repainted with o.color / o.tone (t is the default);
 * sl: drawn sliced to the object's width (ends kept, middle repeated); box: stretched over the object's box (rugs, towels);
 * wall: hung on the wall inside the object's box (rep: repeated across a wide box). */
const IN='sprites/interior/';
const HD_IN={chair:{},table:{},coffee:{},bookshelf:{},coatrack:{},floorlamp:{},sidetable:{},fridge:{},stove:{},plant:{},trash:{},tv:{},foosball:{},dogstatue:{},recliner:{},
 bed:{cream:true},bathtub:{},toilet:{},sink:{},entertain:{},nightstand:{},dining:{},canoe:{},boxes:{},trunk:{},dinoskull:{},booth:{},jukebox:{},mic:{},
 cubicle:{},copier:{},cooler:{},mannequin:{},mirror:{},case:{},stanchion:{},camera:{},stagelight:{},hospbed:{},seats:{},gatedesk:{},palm:{},lounger:{},
 icebox:{},sandcastle:{},grill:{},pingpong:{},bus:{},cab:{},phonebox:{},postbox:{},clocktower:{},dino:{},desk:{},officechair:{},moodboard:{},column:{},rockmound:{},
 officefridge:{},grantaxi:{},cheesecake:{},sandwich:{f:'sandwich_wrapped'},splat:{flat:true},
 couch:{f:'couch_t',t:'#d9782f',sl:true},kcounter:{f:'kcounter_t',t:'#8a6a4a',sl:true},counter:{f:'perkcounter',sl:true},
 stool:{f:'stool_t',t:'#c0262c'},rack:{f:'rack_t',t:'#8e6bbf'},luggage:{f:'luggage_t',t:'#3a5a8a'},umbrella:{f:'umbrella_t',t:'#d9534f'},surfboard:{f:'surfboard_t',t:'#e8b830'},
 rug:{f:'rug_ornate_t',t:'#b4532e',box:true},towel:{f:'towel_t',t:'#e05a7a',box:true,rot:true},
 window:{wall:true,rep:true},bigwindow:{wall:true,rep:true},drapewindow:{wall:true,rep:true},frame:{wall:true},mural:{wall:true},flag:{wall:true},wreath:{wall:true},
 menu:{wall:true,box:true},walldoor:{wall:true,box:true},
 dinercounter:{sl:true,e:.4},backcounter:{sl:true},dinerstool:{f:'dinerstool_t',t:'#2a3a8a'},dinertable4:{},pastrycase:{},phone:{},menuboard:{wall:true},wallclock:{wall:true}};
const HD_FLOOR={wood:'floor_wood',marble:'floor_marble',sand:'floor_sand',water:'floor_water',carpet:'floor_carpet',carpetR:'floor_carpet_rose',conc:'floor_conc',
 hallf:'floor_hall',tileK:'floor_tileK',tileD:'floor_tileD',bath:'floor_bath',rotunda:'floor_rotunda',stairs:'floor_stairs',
 wallT:'wall_tile_blue',wainsT:'wall_tile_navy',tileM:'floor_moroccan',
 brick:'wall_brick',wallC:'wall_plaster',wallH:'wall_plaster_peach',wallP:'wall_plaster_lavender',wallG:'wall_plaster_sage',wains:'wall_wains'};
const CAR_MODELS=['','wagon','van','compact'];
// v1.8: cars at real-world scale next to people (about 2.6 times the old size); every car sprite faces right
const CAR_LEN=88,CAR_SC=2.6;
const hdIn={},hdFloor={},hdInCache={};
function loadInteriorArt(){
 const files=new Set([...Object.entries(HD_IN).map(([k,v])=>v.f||k),'armchair','armchair_t','rug_geo_t','dinertable','car_wagon_t','car_van_t','car_compact_t','car_taxi90','couch_back_t','armchair_back_t','tv_back','recliner_back','armchair_side_t','chair_side','recliner_side','entside']);
 for(const f of files){const im=new Image();im.onload=()=>{hdIn[f]=im;for(const k in hdInCache)delete hdInCache[k];carHDCache={}};im.src=IN+f+'.png'}
 for(const[t,f]of Object.entries(HD_FLOOR)){const im=new Image();im.onload=()=>{hdFloor[t]=im};im.src=IN+f+'.png'}}
// repaint a template: 'mag' swaps the magenta body colour, 'cream' swaps a cream quilt; shading is kept
function recolor(im,col,mode){const[c,g]=mk(im.width,im.height);g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height),a=d.data,T=hexRGB(col);
 for(let i=0;i<a.length;i+=4){const r=a[i],gg=a[i+1],b=a[i+2],mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),L=(mx+mn)/510;let hit=false,f;
  if(mode==='cream'){hit=r>165&&gg>145&&b>100&&r-b>16&&r-b<95&&r-gg<45;f=L/.82}
  else{const sat=mx?(mx-mn)/mx:0;if(sat>.16&&mx>40&&gg===mn){let h=(r===mx?(gg-b)/(mx-mn):4+(r-gg)/(mx-mn))*60;if(h<0)h+=360;hit=h>275&&h<350}f=L/.5}
  if(hit)for(let k=0;k<3;k++)a[i+k]=f<=1?T[k]*f:T[k]+(255-T[k])*Math.min(1,(f-1)*.9)}
 g.putImageData(d,0,0);return c}
// facing: o.back draws the piece from behind; o.face ('left'|'right') draws a side view facing that way
function inSpec(o){const fl=o.face==='left';if(o.kind==='grantaxi'||o.kind==='bus'||o.kind==='cab')return null;
 if(o.kind==='armchair'){if(o.back)return{f:'armchair_back_t',t:'#8a5a3a'};if(o.face)return o.color?{f:'armchair_side_t',t:'#8a5a3a',flip:fl}:{f:'armchair',flip:fl};return{f:'armchair_t',t:'#8a5a3a'}}
 if(o.kind==='couch'&&o.back)return{f:'couch_back_t',t:'#d9782f',sl:true};
 if(o.kind==='chair'&&o.face)return{f:'chair_side',flip:fl};
 if(o.kind==='recliner'&&(o.face||o.back))return o.back?{f:'recliner_back'}:{f:'recliner_side',flip:fl};
 if(o.kind==='tv'&&o.back)return{f:'tv_back'};
 if(o.kind==='entertain'&&o.face)return{f:'entside',flip:fl};
 if(o.kind==='rug'&&o.geo)return Object.assign({},HD_IN.rug,{f:'rug_geo_t'});
 if(o.kind==='table'&&o.diner)return{f:'dinertable'};
 if(o.kind==='cab'&&o.yellow)return{f:'car_taxi90'};
 const s=HD_IN[o.kind];return s&&Object.assign({f:o.kind},s)}
function inImg(o,sp){const base=hdIn[sp.f];if(!base)return null;const col=sp.t?(o.color||o.tone||sp.t):(sp.cream&&o.color)||null,dk=!!o.dark&&sp.f==='recliner';
 if(!col&&!dk)return base;const k=sp.f+'|'+col+'|'+dk;if(hdInCache[k])return hdInCache[k];
 let c=col?recolor(base,col,sp.cream?'cream':'mag'):base;
 if(dk){const[d,g]=mk(c.width,c.height);g.filter='brightness(.38) saturate(.5)';g.drawImage(c,0,0);c=d}
 return hdInCache[k]=c}
function smooth(on){ctx.imageSmoothingEnabled=on;if(on)ctx.imageSmoothingQuality='high'}
// wide furniture: keep both ends at their natural size and repeat the middle to fill W world px
function drawSliced(im,x0,by,W,ef){const s=1/8,H=im.height*s,e=Math.round(im.width*(ef||.24)),ew=e*s,mw=im.width-2*e,tw=mw*s;
 ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x0+W/2,by-1,W*.47,3,0,0,7);ctx.fill();smooth(true);
 ctx.drawImage(im,0,0,e,im.height,x0,by-H,ew,H);ctx.drawImage(im,im.width-e,0,e,im.height,x0+W-ew,by-H,ew,H);
 for(let x=x0+ew;x<x0+W-ew-.01;){const w=Math.min(tw,x0+W-ew-x);ctx.drawImage(im,e,0,w/s,im.height,x,by-H,w+.05,H);x+=w}smooth(false)}
// flat things: rugs and towels stretch over their box; wall pieces fit inside it
function drawFlat(im,sp,x,y,w,h){smooth(true);
 if(sp.box&&sp.rot&&w>h){ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(Math.PI/2);ctx.drawImage(im,-h/2,-w/2,h,w);ctx.restore()}
 else if(sp.box)ctx.drawImage(im,x,y,w,h);
 else{const asp=im.width/im.height,n=sp.rep?Math.max(1,Math.round(w/(h*asp))):1,cw=w/n;let dw=cw,dh=dw/asp;if(dh>h){dh=h;dw=dh*asp}
  for(let i=0;i<n;i++)ctx.drawImage(im,x+i*cw+(cw-dw)/2,y+(h-dh)/2,dw,dh)}
 smooth(false)}
const HD_ITEMS = { pants:'sprites/items/Item_LeatherPants.png', trifle:IN+'trifle.png', cheesecake:IN+'cheesecake.png', moistmaker:IN+'sandwich.png',
 grantaxi:IN+'grantaxi.png', marcel:IN+'marcel_icon.png' };
// v2.0: HD icons for every collectible (tools/prep_icons.py), plus a few used only as quiz pictures
const ICO='sprites/icons/';
['mug','painting','turkey','cup','frame','hugsy','armadillo','card','bag','puck','wig','bone','umbrella','headshot','hat','veil',
 'paddle','shell','cracker','broom','porsche','album','bootie','purse','comb','ashtray','nametag','polaroid','trophy','key',
 'box','sphynx','smellycat','poker','chickduck','recliners'].forEach(id=>{HD_ITEMS[id]=ICO+id+'.png'});
HD_ITEMS.dog=IN+'dogstatue.png';

const TS=16, SAVE_KEY='friendsTrivia_v1';
let SC=2,VW=20,VH=13;
const ZOOMS=[{s:1,n:'Far'},{s:2,n:'Normal'},{s:3,n:'Close'}];
function setZoom(z,quiet){SC=z;VW=40/z;VH=26/z;try{localStorage.setItem('friendsTrivia_zoom',z)}catch(e){}const b=document.getElementById('btnZoom');if(b)b.textContent='🔍 '+ZOOMS.find(q=>q.s===z).n;if(!quiet&&typeof toast==='function')toast('Zoom: '+ZOOMS.find(q=>q.s===z).n)}
function cycleZoom(d){const i=ZOOMS.findIndex(q=>q.s===SC);const j=d===undefined?(i+1)%ZOOMS.length:clamp(i+d,0,ZOOMS.length-1);setZoom(ZOOMS[j].s)}
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
// v1.0: the canvas renders at RS x the 640x416 layout so HD character art stays sharp
const RS=3;
cv.width=640*RS; cv.height=416*RS;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const R=Math.random;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=(R()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return[c,g]}
function px(g,c,x,y,w=1,h=1){g.fillStyle=c;g.fillRect(x,y,w,h)}
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shade(hex,f){let n=parseInt(hex.slice(1,7),16),r=n>>16,g=n>>8&255,b=n&255;const m=f<0?0:255,a=Math.abs(f);r=Math.round(r+(m-r)*a);g=Math.round(g+(m-g)*a);b=Math.round(b+(m-b)*a);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
function noise(g,r,cols,n,x0=0,y0=0,w=16,h=16){for(let i=0;i<n;i++)px(g,cols[(r()*cols.length)|0],x0+((r()*w)|0),y0+((r()*h)|0))}
function ell(g,c,cx,cy,rx,ry){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if((x*x)/(rx*rx+.01)+(y*y)/(ry*ry+.01)<=1)px(g,c,cx+x,cy+y)}
function outline(c,col='#1c1626'){const g=c.getContext('2d'),w=c.width,h=c.height,d=g.getImageData(0,0,w,h),s=d.data,o=new Uint8ClampedArray(s);
 const r=parseInt(col.slice(1,3),16),gg=parseInt(col.slice(3,5),16),b=parseInt(col.slice(5,7),16);
 const on=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&s[(y*w+x)*4+3]>128;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(s[i+3]>0)continue;if(on(x-1,y)||on(x+1,y)||on(x,y-1)||on(x,y+1)){o[i]=r;o[i+1]=gg;o[i+2]=b;o[i+3]=255}}
 d.data.set(o);g.putImageData(d,0,0);return c}
function mirror(c){const[m,g]=mk(c.width,c.height);g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return m}

/* ===================== ART: ground tiles ===================== */
const tileCache={};
function tile(t,x,y){const v=((x*7+y*13)^(x*y*3))&3,k=t+v;return tileCache[k]||(tileCache[k]=makeTile(t,v))}
function makeTile(t,v){const[c,g]=mk(16,16);const r=mulberry(v*101+t.charCodeAt(0)*7+t.length);
 const road=()=>{px(g,'#4b4b55',0,0,16,16);noise(g,r,['#555560','#43434c','#5a5a65'],28)};
 switch(t){
 case'walk':px(g,'#c9c3b5',0,0,16,16);noise(g,r,['#bdb7a8','#d3cec2'],16);px(g,'#aea797',0,7,16,1);px(g,'#aea797',7,0,1,7);px(g,'#aea797',(v&1)?3:11,8,1,8);px(g,'#d9d4c9',0,8,16,1);if(v===2)px(g,'#a39c8c',11,3,2,1);break;
 case'road':case'inter':road();break;
 case'laneH':road();px(g,'#e3bb3c',0,13,16,1);px(g,'#e3bb3c',0,15,16,1);break;
 case'laneV':road();px(g,'#e3bb3c',13,0,1,16);px(g,'#e3bb3c',15,0,1,16);break;
 case'crossH':road();px(g,'#e6e6e2',2,0,5,16);px(g,'#e6e6e2',10,0,5,16);noise(g,r,['#c9c9c4'],6);break;
 case'crossV':road();px(g,'#e6e6e2',0,2,16,5);px(g,'#e6e6e2',0,10,16,5);noise(g,r,['#c9c9c4'],6);break;
 case'grass':px(g,'#62a94c',0,0,16,16);noise(g,r,['#579c42','#70b85a','#4f8e3c','#7cc466'],34);break;
 case'path':px(g,'#d6c193',0,0,16,16);noise(g,r,['#c8b282','#e2cfa3','#bba574'],22);break;
 case'roofs':px(g,'#4a4148',0,0,16,16);noise(g,r,['#544a52','#40383f'],20);break;
 case'wood':{const cols=['#a26e3f','#986639'];for(let y=0;y<16;y+=4){px(g,cols[((y>>2)+v)&1],0,y,16,4);px(g,'#7a4b28',0,y+3,16,1);px(g,'#7a4b28',(v*5+y*3+3)%16,y,1,3);px(g,'#ae7a49',0,y,16,1)}noise(g,r,['#8d5b33'],6);break}
 case'brick':px(g,'#c9ab90',0,0,16,16);for(let y=0;y<16;y+=4)for(let x=((y>>2)&1)?-4:0;x<16;x+=8){px(g,['#9c4f36','#a5573b','#914530'][(r()*3)|0],x+1,y+1,7,3)}break;
 case'wains':px(g,'#5c3a22',0,0,16,16);px(g,'#7d5131',0,0,16,2);px(g,'#4a2e1a',0,2,16,1);px(g,'#6a4428',2,5,12,8);px(g,'#4a2e1a',2,12,12,1);px(g,'#3a2414',0,15,16,1);break;
 case'wallS':px(g,'#3b2a22',0,0,16,16);px(g,'#4c372c',0,0,16,1);noise(g,r,['#33241d'],8);break;
 case'front':px(g,'#3b2a22',0,0,16,16);px(g,'#6b4e3a',0,0,16,3);px(g,'#7fa6c4',2,5,12,6);px(g,'#a9c8de',2,5,12,1);px(g,'#3b2a22',8,5,1,6);break;
 case'mat':{const[w]=[makeTile('wood',v)];g.drawImage(w,0,0);px(g,'#7b2e2a',1,1,14,14);px(g,'#a3473f',2,2,12,12);px(g,'#7b2e2a',3,3,10,10);break}
 case'wallP':px(g,'#6a4a9a',0,0,16,16);px(g,'#8a6aba',0,0,16,2);px(g,'#5a3c88',0,15,16,1);noise(g,r,['#644494','#7050a0'],10);break;
 case'wallH':px(g,'#c9b48a',0,0,16,16);for(let x=(v&1)*4;x<16;x+=8)px(g,'#b9a37a',x,0,2,16);px(g,'#e0cfa8',0,0,16,2);break;
 case'wallC':px(g,'#e3d9c2',0,0,16,16);for(let y=0;y<16;y+=4)for(let x=((y>>2)&1)?-4:0;x<16;x+=8)px(g,'#d4c8ad',x,y,8,1);px(g,'#f0e8d6',0,0,16,2);break;
 case'frontA':px(g,'#3b2a22',0,0,16,16);px(g,'#6b4e3a',0,0,16,3);break;
 case'tileK':for(let y=0;y<16;y+=8)for(let x=0;x<16;x+=8)px(g,((x+y)>>3)&1?'#c9c2b0':'#ece6d8',x,y,8,8);px(g,'#b8b09c',0,15,16,1);px(g,'#b8b09c',15,0,1,16);break;
 case'stairs':for(let y=0;y<16;y+=4){px(g,shade('#8a6a4a',-y/30),0,y,16,4);px(g,'#a88660',0,y,16,1)}px(g,'#3b2a22',0,0,2,16);px(g,'#3b2a22',14,0,2,16);break;
 case'water':px(g,'#2f6fa8',0,0,16,16);noise(g,r,['#3a7fb8','#28609a'],20);px(g,'#7fb8e0',(v*5)%12,4+(v&1)*6,4,1);px(g,'#7fb8e0',(v*7+8)%12,10-(v&1)*4,3,1);break;
 case'sand':px(g,'#e8d39a',0,0,16,16);noise(g,r,['#dcc488','#f2e0ac','#cfb67a'],26);break;
 case'marble':px(g,'#e9e4da',0,0,16,16);px(g,'#d6d0c4',0,15,16,1);px(g,'#d6d0c4',15,0,1,16);noise(g,r,['#dcd6ca','#f4f0e8'],10);px(g,'#cfc8ba',(v*4)%12,(v*3)%12,4,1);break;
 case'carpet':px(g,'#5a6a7e',0,0,16,16);noise(g,r,['#526276','#62748a'],40);break;
 case'tileD':for(let y=0;y<16;y+=8)for(let x=0;x<16;x+=8)px(g,((x+y)>>3)&1?'#2a2a30':'#ece8e0',x,y,8,8);break;
 case'conc':px(g,'#8a8a8e',0,0,16,16);noise(g,r,['#7e7e84','#96969a'],30);if(v===1)px(g,'#6e6e74',3,9,8,1);break;
 case'bath':return makeTile('tileK',v);case'hallf':px(g,'#968c8c',0,0,16,16);noise(g,r,['#8e8484','#a29898'],24);break;case'carpetR':px(g,'#98786a',0,0,16,16);noise(g,r,['#8c6e60','#a68474'],36);break;
 case'rotunda':return makeTile('marble',v);case'tileM':return makeTile('tileK',v);case'wallT':case'wainsT':px(g,'#22348a',0,0,16,16);px(g,'#e2e0d4',0,0,8,8);px(g,'#e2e0d4',8,8,8,8);break;case'wallG':px(g,'#bec8a8',0,0,16,16);px(g,'#ccd6b8',0,0,16,2);break;
 case'nroad':px(g,'#1e1626',0,0,16,16);noise(g,r,['#2a1e36','#160f1e'],24);if(v===2)px(g,'#ff6fb0',2,7,4,1);if(v===3)px(g,'#7ad0ff',10,3,3,1);break;
 default:px(g,'#16121e',0,0,16,16);
 }
 return c}
const ROADT=new Set(['road','laneH','laneV','inter','crossH','crossV']);
const SOLID_T=new Set(['brick','wains','wallS','front','roofs','void','wallP','wallH','wallC','wallG','wallT','wainsT','frontA','water']);

/* ===================== ART: buildings ===================== */
const BSTY={brick:{wall:'#a24a32',d:'#83381f',trim:'#d8cbb0',roof:'#4a4148'},brown:{wall:'#7b4f3a',d:'#68412f',trim:'#c9b28f',roof:'#3f3638'},
 cream:{wall:'#d6c9a8',d:'#bfb18e',trim:'#f1e9d4',roof:'#5b5257'},slate:{wall:'#6d6f80',d:'#5a5c6c',trim:'#c9cbd8',roof:'#3a3a46'},
 yellow:{wall:'#c99a4a',d:'#ad7f36',trim:'#efe0b8',roof:'#4a4040'},
 neon:{wall:'#2a2236',d:'#221a2c',trim:'#4a3e5a',roof:'#1a1424'},shingle:{wall:'#8a7a6a',d:'#7a6a5a',trim:'#f1e9d4',roof:'#5a5a62'}};
function win(g,x,y,s,r){px(g,shade(s.trim,-.1),x-1,y-3,10,2);px(g,s.trim,x-1,y-1,10,14);const lit=r()<.28;px(g,lit?'#e9c46a':'#2e3a52',x,y,8,12);
 if(!lit){px(g,'#4d6288',x,y,3,4);px(g,'#3a4a68',x+3,y,1,2)}else px(g,'#f6dc96',x,y,3,3);px(g,s.trim,x,y+5,8,1);px(g,s.trim,x+3,y,1,12);px(g,shade(s.trim,-.25),x-2,y+12,12,2)}
function makeBuilding(o){const W=o.w*16,H=o.h*16,top=o.tower?30:o.style==='shingle'?10:2;const[c,g]=mk(W,H+top);const s=BSTY[o.style];const r=mulberry(o.x*31+o.y*17+o.w*7);
 g.save();g.translate(0,top);
 px(g,s.wall,0,0,W,H);
 if(o.style==='brick'||o.style==='yellow'){for(let y=12;y<H;y+=3)for(let x=((y/3|0)&1)*3;x<W;x+=6){px(g,s.d,x,y+2,6,1);px(g,s.d,x,y,1,2)}noise(g,r,[shade(s.wall,.1)],W*H/40,0,12,W,H-12)}
 else{for(let y=16;y<H;y+=6)px(g,s.d,0,y,W,1);noise(g,r,[s.d,shade(s.wall,.08)],W*H/30,0,12,W,H-12)}
 // roof & cornice
 px(g,s.roof,0,0,W,5);px(g,shade(s.roof,.18),0,0,W,1);px(g,s.trim,0,5,W,3);for(let x=1;x<W;x+=3)px(g,shade(s.trim,-.22),x,8,2,2);px(g,shade(s.trim,-.4),0,10,W,1);
 px(g,shade(s.wall,-.25),0,0,1,H);px(g,shade(s.wall,.12),W-1,11,1,H-11);
 // upper floors
 const gf=H-32,cols=Math.max(1,Math.floor((W-4)/12)),ox=Math.floor((W-cols*12)/2)+2;
 if(o.style==='neon'){const nc=['#ff6fb0','#7ad0ff','#ffd84a','#7ae08a','#ff8a3a','#c08aff'];for(let fy=13;fy+18<=gf;fy+=20){let x=2;while(x<W-8){const bw=Math.min(W-2-x,10+((r()*3)|0)*8);const cc=nc[(r()*nc.length)|0];px(g,'#0e0a14',x,fy,bw,17);px(g,cc,x+1,fy+1,bw-2,15);px(g,shade(cc,.4),x+2,fy+3,(bw-4)*.6|0,2);px(g,shade(cc,-.3),x+2,fy+8,bw-6,2);px(g,shade(cc,.4),x+2,fy+12,(bw-4)*.4|0,2);x+=bw+2}}}
 else if(o.style==='shingle'){for(let fy=15;fy+13<=gf-2;fy+=16)for(let x=10;x<W-12;x+=26)win(g,x,fy,s,r)}
 else for(let fy=15;fy+13<=gf-2;fy+=16)for(let k=0;k<cols;k++)win(g,ox+k*12,fy,s,r);
 if(o.style==='shingle')for(let y=12;y<H;y+=3)for(let x=((y/3|0)&1)*2;x<W;x+=4)px(g,s.d,x,y+2,3,1);
 if(o.fire){const fx=ox+Math.max(0,Math.floor(cols/2)-1)*12-3,fw=Math.min(W-fx-1,25);
  for(let fy=15;fy+13<=gf-2;fy+=16){px(g,'#24222a',fx,fy+12,fw,2);px(g,'#24222a',fx,fy+6,fw,1);for(let x=fx;x<fx+fw;x+=3)px(g,'#24222a',x,fy+6,1,6);for(let i=0;i<5;i++)px(g,'#24222a',fx+fw-7+i,fy+14-i*3+i*3+i,1,1)}}
 // ground floor
 px(g,shade(s.wall,-.1),0,gf,W,32);px(g,shade(s.trim,-.15),0,gf,W,2);
 const sw=(o.shopW||o.w)*16;
 if(o.shop){const aw=o.awning||'#2f6b3a',sb=o.signBg||'#1f1f26';
  px(g,sb,1,gf+2,sw-2,9);px(g,shade(sb,.25),1,gf+2,sw-2,1);px(g,shade(sb,-.3),1,gf+10,sw-2,1);
  for(let x=0;x<sw;x++)px(g,((x>>2)&1)?aw:shade(aw,.55),x,gf+11,1,5);for(let x=0;x<sw;x+=4){px(g,aw,x,gf+16,3,1);px(g,shade(aw,.55),x+4,gf+16,0,0)}px(g,shade(aw,-.3),0,gf+11,sw,1);
  px(g,'#3a2a20',0,gf+17,sw,15);px(g,'#e7c27c',2,gf+19,sw-4,11);px(g,'#f3d99e',2,gf+19,sw-4,2);
  for(let x=6;x<sw-4;x+=11){px(g,'#d0a55f',x,gf+24,6,6);px(g,'#b4884a',x+1,gf+22,4,2)}
  for(let x=2;x<sw-4;x+=16)px(g,'#3a2a20',x+13,gf+19,2,11);
  if(sw<W)for(let k=0;k*12+sw+4<W-6;k++)win(g,sw+4+k*12,gf+5,s,r);
 } else if(o.columns){px(g,s.trim,0,gf,W,32);px(g,'#5a4a2a',4,gf+2,W-8,9);px(g,'#c9a24a',4,gf+2,W-8,1);px(g,'#c9a24a',4,gf+10,W-8,1);
  for(let x=6;x<W-6;x+=16){px(g,'#f4efe2',x,gf+12,6,18);px(g,'#d9d2c0',x+4,gf+12,2,18);px(g,'#e2dccb',x-1,gf+12,8,2)}
  for(let i=0;i<3;i++)px(g,shade(s.trim,-.08*i),0,gf+26+i*2,W,2);
 } else if(o.style==='shingle'){for(let x=10;x<W-12;x+=26)if(Math.abs(x+4-(o.doors&&o.doors[0]?o.doors[0].x*16+8:-99))>14)win(g,x,gf+5,s,r)}
 else {for(let k=0;k<cols;k++)win(g,ox+k*12,gf+5,s,r)}
 for(const d of o.doors||[]){const dx=d.x*16+3,dy=gf+16;
  if(d.kind==='shop'){px(g,'#3a2a20',dx-1,dy+1,12,15);px(g,'#9cc0d8',dx+1,dy+3,8,13);px(g,'#c4dceb',dx+1,dy+3,2,13);px(g,'#3a2a20',dx+7,dy+9,1,2)}
  else{const dc=d.color||'#3a2a20';if(d.kind==='stoop'){px(g,shade(s.trim,-.05),dx-1,dy-1,12,2);}
   px(g,s.trim,dx-1,dy+1,12,15);px(g,dc,dx,dy+3,10,13);px(g,shade(dc,.2),dx+1,dy+4,3,5);px(g,shade(dc,.2),dx+6,dy+4,3,5);px(g,shade(dc,.2),dx+1,dy+10,3,4);px(g,shade(dc,.2),dx+6,dy+10,3,4);px(g,'#e2b82a',dx+8,dy+9,1,1);px(g,'#9cc0d8',dx,dy+2,10,1);
   if(d.kind==='stoop'){px(g,'#9a9286',dx-3,dy+12,16,2);px(g,'#b3ab9e',dx-3,dy+12,16,1);px(g,'#8a8276',dx-4,dy+14,18,2);px(g,'#a39b8f',dx-4,dy+14,18,1);px(g,'#24222a',dx-4,dy+8,1,8);px(g,'#24222a',dx+13,dy+8,1,8)}}}
 if(o.style==='shingle'){const rh=18;for(let y=0;y<rh;y++){const inset=Math.round((rh-y)*W/(rh*2.6));px(g,y%3?'#5a5a62':'#4a4a52',inset,y-6,W-inset*2,1)}px(g,'#3a3a42',0,11,W,2);px(g,'#f1e9d4',W/2-4,-2,8,7);px(g,'#9cc8e6',W/2-3,-1,6,5)}
 g.restore();
 if(o.tower){const tx=W-24;px(g,'#3b2e26',tx+2,18,2,14);px(g,'#3b2e26',tx+12,18,2,14);px(g,'#3b2e26',tx+2,24,12,1);
  px(g,'#8a6a48',tx,8,16,12);px(g,'#9e7c56',tx,8,4,12);px(g,'#4a3a2e',tx,11,16,1);px(g,'#4a3a2e',tx,16,16,1);
  for(let i=0;i<7;i++)px(g,'#4a3a2e',tx+i+1,7-i,14-i*2,1);}
 return{c,ox:0,oy:o.h*16-(H+top)+o.h*16-o.h*16}}

/* ===================== ART: props ===================== */
function O(w,h){return mk(w,h)}
const DIG={'0':'111101101101111','1':'010110010010111','2':'111001111100111','9':'111101111001111'};
function digits(g,str,x,y,col){[...str].forEach((d,i)=>{const p=DIG[d];if(p)for(let k=0;k<15;k++)if(p[k]==='1')px(g,col,x+i*4+(k%3),y+(k/3|0),1,1)})}
function makeObj(o){let c,g,ox=0,oy;const fin=(cc,ol=true)=>{if(ol)outline(cc);return cc};
 switch(o.kind){
 case'building':{const b=makeBuilding(o);return{c:b.c,ox:0,oy:-(b.c.height-o.h*16)}}
 case'tree':{[c,g]=O(32,42);if(!o.park){px(g,'#3a2a1e',8,37,16,5);px(g,'#4a3626',9,38,14,3)}px(g,'#5a3b25',14,24,4,15);px(g,'#6f4a2e',14,24,1,15);
  const greens=['#2f7a3a','#3e8f45','#52a653','#6cbf5e'];ell(g,greens[0],16,15,14,12);ell(g,greens[1],15,13,12,10);ell(g,greens[2],13,11,8,7);ell(g,greens[3],11,9,4,3);
  const r=mulberry(o.x*9+o.y);noise(g,r,[greens[0],greens[3]],30,4,4,24,20);fin(c);ox=-8;oy=16-42;break}
 case'lamp':{[c,g]=O(10,42);px(g,'#2c2c34',4,8,2,34);px(g,'#2c2c34',2,38,6,4);px(g,'#2c2c34',1,3,8,4);px(g,'#f6e3a1',2,7,6,2);px(g,'#4a4a56',4,8,1,30);fin(c);ox=3;oy=16-42;break}
 case'sign':{[c,g]=O(10,42);px(g,'#3a5a3a',4,8,2,34);px(g,'#3a5a3a',2,38,6,4);px(g,'#2f7a4a',0,0,10,8);px(g,'#ffffff',1,3,8,1);fin(c);ox=3;oy=16-42;break}
 case'hydrant':{[c,g]=O(10,14);px(g,'#c0262c',2,3,6,10);px(g,'#e0484c',2,3,2,10);px(g,'#c0262c',0,6,10,3);px(g,'#9a1c20',3,0,4,3);px(g,'#9a1c20',1,12,8,2);fin(c);ox=3;oy=2;break}
 case'news':{[c,g]=O(12,16);px(g,'#2f5ca8',0,0,12,12);px(g,'#4a7ac4',0,0,12,2);px(g,'#e8e8e8',2,4,8,5);px(g,'#888',3,5,6,1);px(g,'#888',3,7,5,1);px(g,'#24222a',1,12,2,4);px(g,'#24222a',9,12,2,4);fin(c);ox=2;oy=0;break}
 case'planter':{[c,g]=O(16,16);px(g,'#6b4a2e',1,8,14,8);px(g,'#8a6440',1,8,14,2);for(let i=0;i<7;i++){px(g,'#3e8f45',2+i*2,3+(i%2)*2,2,6);px(g,['#e05a7a','#f0c040','#ffffff'][i%3],2+i*2,2+(i%2)*2,2,2)}fin(c);break}
 case'fence':{[c,g]=O(16,12);px(g,'#24222a',0,2,16,1);px(g,'#24222a',0,9,16,1);for(let x=1;x<16;x+=3)px(g,'#24222a',x,0,1,12);c=c;ox=0;oy=4;break}
 case'bench':{[c,g]=O(32,16);px(g,'#7a4a28',1,2,30,3);px(g,'#7a4a28',1,7,30,3);px(g,'#9a6438',1,2,30,1);px(g,'#9a6438',1,7,30,1);px(g,'#24222a',3,5,2,11);px(g,'#24222a',27,5,2,11);fin(c);oy=0;break}
 case'barricade':{const W=(o.w||4)*16;[c,g]=O(W,14);for(let x=0;x<W;x++)px(g,((x>>2)&1)?'#f2f2f2':'#e8642a',x,2,1,5);px(g,'#24222a',3,7,2,7);px(g,'#24222a',W-5,7,2,7);px(g,'#24222a',W/2-1,7,2,7);fin(c);oy=2;break}
 case'car':{const sp=carSprite(o.color,false);c=o.dir>0?sp.r:sp.l;oy=16-c.height+1;break}
 case'subway':{[c,g]=O(32,40);px(g,'#24222a',2,14,28,24);for(let i=0;i<5;i++){px(g,shade('#6a6a72',-i*.1),4,16+i*4,24,3);px(g,shade('#8a8a92',-i*.1),4,16+i*4,24,1)}
  px(g,'#2f6b3a',0,12,32,3);px(g,'#2f6b3a',0,12,3,28);px(g,'#2f6b3a',29,12,3,28);for(let x=4;x<29;x+=4)px(g,'#2f6b3a',x,9,1,4);
  for(const x of [0,28]){px(g,'#2c2c34',x+1,2,2,12);ell(g,'#6fcf7a',x+2,3,3,3);px(g,'#b8f0c0',x+1,1,2,1)}fin(c);oy=32-40;break}
 // ---- interior ----
 case'rug':{const W=o.w*16,H=o.h*16,t0=o.tone||'#b4532e';[c,g]=O(W,H);px(g,shade(t0,-.3),0,0,W,H);px(g,t0,3,3,W-6,H-6);px(g,shade(t0,.12),6,6,W-12,H-12);for(let x=8;x<W-8;x+=6)for(let y=8;y<H-8;y+=6)px(g,'#d9a15b',x,y,2,2);for(let x=0;x<W;x+=4){px(g,'#e0c08a',x,0,2,1);px(g,'#e0c08a',x,H-1,2,1)}oy=0;break}
 case'couch':{const W=o.w*16;[c,g]=O(W,30);const k=o.color||'#d9782f',d=shade(k,-.18),l=shade(k,.2);px(g,k,2,0,W-4,12);px(g,l,2,0,W-4,2);px(g,d,2,10,W-4,2);
  px(g,d,0,4,6,24);px(g,k,0,4,6,2);px(g,d,W-6,4,6,24);px(g,k,W-6,4,6,2);
  for(let i=0;i<o.w;i++){px(g,shade(k,.08),6+i*((W-12)/o.w),12,(W-12)/o.w-1,12);px(g,l,6+i*((W-12)/o.w),12,(W-12)/o.w-1,2)}px(g,d,6,24,W-12,4);fin(c);oy=16-30+4;break}
 case'armchair':{[c,g]=O(20,24);px(g,'#8a5a3a',2,0,16,10);px(g,'#a8714a',2,0,16,2);px(g,'#7a4a2e',0,6,4,16);px(g,'#7a4a2e',16,6,4,16);px(g,'#b07a50',4,10,12,9);px(g,'#6a3e24',4,19,12,3);fin(c);ox=-2;oy=16-24+2;break}
 case'coffee':{[c,g]=O(32,16);px(g,'#6e4524',1,2,30,8);px(g,'#8a5a32',1,2,30,2);px(g,'#4a2e1a',3,10,3,6);px(g,'#4a2e1a',26,10,3,6);px(g,'#f4f1ea',8,3,4,4);px(g,'#5a3420',9,3,2,1);px(g,'#d64a4a',18,4,7,4);fin(c);oy=0;break}
 case'table':{[c,g]=O(18,18);ell(g,'#7a4a28',9,6,8,5);ell(g,'#9a6438',9,5,7,3);px(g,'#4a2e1a',8,10,2,6);px(g,'#4a2e1a',5,15,8,2);px(g,'#f4f1ea',5,3,3,3);px(g,'#f4f1ea',11,4,3,3);fin(c);ox=-1;oy=-2;break}
 case'chair':{[c,g]=O(12,18);px(g,'#5a3a22',2,0,8,8);px(g,'#7a4f2f',3,1,6,6);px(g,'#7a4f2f',1,8,10,3);px(g,'#4a2e1a',2,11,2,7);px(g,'#4a2e1a',8,11,2,7);fin(c);ox=2;oy=-2;break}
 case'counter':{const W=o.w*16;[c,g]=O(W,26);px(g,'#c9a57a',0,2,W,9);px(g,'#e0bf92',0,2,W,2);px(g,'#6b3f22',0,11,W,15);px(g,'#4e2c16',0,11,W,2);for(let x=4;x<W-4;x+=16)px(g,'#7d4c2a',x,15,12,8);
  // pastry case, register, espresso machine, cups
  px(g,'#cfe6ef',4,-0,22,9);px(g,'#ffffff',4,0,22,1);for(let x=6;x<24;x+=5){px(g,'#d0a55f',x,5,4,3);px(g,'#7a4a2a',x+1,4,2,1)}
  px(g,'#3a3a44',40,0,14,9);px(g,'#7ad06a',42,1,8,3);px(g,'#5a5a66',42,6,10,2);
  px(g,'#b8bcc6',W-50,0,22,10);px(g,'#dde0e6',W-50,0,22,2);px(g,'#24222a',W-46,5,4,4);px(g,'#24222a',W-36,5,4,4);px(g,'#cf3a2a',W-41,2,2,2);
  for(let i=0;i<4;i++){px(g,'#f4f1ea',W-22+i*5,4,4,5);px(g,'#d9d4c8',W-22+i*5,8,4,1)}
  fin(c);oy=16-26+2;break}
 case'block':{[c,g]=O(16,16);px(g,'#6b3f22',0,4,16,12);px(g,'#c9a57a',0,0,16,5);px(g,'#e0bf92',0,0,16,1);fin(c);oy=0;break}
 case'plant':{[c,g]=O(16,26);px(g,'#a0522d',4,18,8,8);px(g,'#c06a3a',4,18,8,2);for(const[a,b,w,h]of[[7,2,2,16],[3,6,4,10],[10,5,4,11],[1,10,4,6],[12,9,4,7]]){px(g,'#3e8f45',a,b,w,h);px(g,'#62b35a',a,b,1,h)}fin(c);oy=16-26;break}
 case'mic':{[c,g]=O(8,26);px(g,'#24222a',3,6,2,18);px(g,'#24222a',0,23,8,3);ell(g,'#6a6a72',4,3,2,3);fin(c);ox=4;oy=16-26;break}
 case'wallsign':{const W=o.w*16;[c,g]=O(W,24);px(g,'#24301f',2,4,W-4,18);px(g,'#3a4a2e',4,6,W-8,14);px(g,'#c9a24a',2,4,W-4,1);px(g,'#c9a24a',2,21,W-4,1);fin(c);oy=0;break}
 case'menu':{const W=o.w*16;[c,g]=O(W,24);px(g,'#6b4a2e',0,2,W,22);px(g,'#24302a',2,4,W-4,18);for(let y=7;y<20;y+=3){px(g,'#d8d8d0',5,y,(W-14)*.6|0,1);px(g,'#d8d8d0',W-10,y,4,1)}oy=0;break}
 case'window':{const W=o.w*16;[c,g]=O(W,26);px(g,'#5a3a22',0,2,W,24);px(g,'#9cc8e6',2,4,W-4,20);px(g,'#6f8fa8',4,12,6,12);px(g,'#7f9fb8',12,9,8,15);px(g,'#5f7f98',22,14,6,10);px(g,'#5a3a22',W/2,4,1,20);px(g,'#5a3a22',2,13,W-4,1);oy=0;break}
 case'frame':{[c,g]=O(16,16);px(g,'#c9a24a',1,1,14,12);px(g,o.tone||'#8a4a5a',3,3,10,8);px(g,shade(o.tone||'#8a4a5a',.3),5,5,4,3);oy=0;break}
 case'walldoor':{[c,g]=O(16,34);const dc=o.color;px(g,'#e8e0cc',0,2,16,32);px(g,dc,2,4,12,30);px(g,shade(dc,.18),4,7,3,9);px(g,shade(dc,.18),9,7,3,9);px(g,shade(dc,.18),4,19,3,9);px(g,shade(dc,.18),9,19,3,9);
  px(g,'#e2b82a',11,21,2,2);px(g,'#c9a24a',4,4,9,7);digits(g,o.num,5,5,'#3a2a10');
  if(o.frame){px(g,'#e2b82a',5,13,6,6);px(g,'#f2d45a',5,13,6,1);px(g,'#e2b82a',4,14,1,4);px(g,'#e2b82a',11,14,1,4);px(g,'#3a2a10',7,15,2,2)}else px(g,'#24222a',7,15,2,2);
  fin(c);oy=16-34;break}
 case'bigwindow':{const W=o.w*16;[c,g]=O(W,28);px(g,'#efe6d0',0,0,W,28);px(g,'#9cc8e6',3,3,W-6,22);px(g,'#bfe0f2',3,3,W-6,4);
  px(g,'#a24a32',6,12,14,13);px(g,'#7b4f3a',22,9,12,16);px(g,'#6d6f80',36,14,W-42,11);for(let x=8;x<W-8;x+=5)px(g,'#2e3a52',x,15+((x/5|0)%2)*3,2,3);
  px(g,'#efe6d0',W/2-1,3,2,22);px(g,'#efe6d0',3,13,W-6,1);px(g,'#c9b28f',0,26,W,2);oy=0;break}
 case'fridge':{[c,g]=O(16,30);px(g,'#e8e8ec',1,0,14,30);px(g,'#ffffff',1,0,3,30);px(g,'#b8b8c0',1,11,14,1);px(g,'#9a9aa4',12,4,1,5);px(g,'#9a9aa4',12,14,1,8);px(g,'#e05a5a',5,4,2,2);px(g,'#5a9ae0',8,16,2,2);fin(c);oy=16-30;break}
 case'stove':{[c,g]=O(16,24);px(g,'#d8d8dc',0,2,16,22);px(g,'#3a3a44',0,2,16,7);ell(g,'#5a5a66',4,5,2,1);ell(g,'#5a5a66',11,5,2,1);px(g,'#24222a',2,12,12,8);px(g,'#4a4a56',3,13,10,1);px(g,'#9a9aa4',3,10,10,1);px(g,'#7a5a3a',8,0,6,3);fin(c);oy=16-24;break}
 case'kcounter':{const W=o.w*16,front=o.tone||'#5f7f98';[c,g]=O(W,24);px(g,'#ece6d8',0,2,W,7);px(g,'#ffffff',0,2,W,1);px(g,front,0,9,W,15);px(g,shade(front,-.2),0,9,W,1);
  for(let x=2;x<W-2;x+=8){px(g,shade(front,.12),x,11,6,11);px(g,'#c9a24a',x+4,15,1,2)}if(o.sink){px(g,'#9aa4b0',W-28,3,12,5);px(g,'#c0c8d0',W-22,0,2,4)}else{px(g,'#c0603a',6,3,5,4);px(g,'#f4f1ea',W-12,3,4,5)}fin(c);oy=16-24;break}
 case'dtable':{const W=o.w*16;[c,g]=O(W,22);px(g,'#7a4a28',1,2,W-2,10);px(g,'#9a6438',1,2,W-2,2);px(g,'#4a2e1a',3,12,3,10);px(g,'#4a2e1a',W-6,12,3,10);for(let x=6;x<W-6;x+=12){ell(g,'#f4f1ea',x+3,6,3,2);px(g,'#c9a24a',x+8,4,1,4)}px(g,'#e05a7a',W/2-2,3,4,3);px(g,'#3e8f45',W/2-1,5,2,2);fin(c);oy=-4;break}
 case'tv':{[c,g]=O(32,28);px(g,'#5a3a22',2,16,28,12);px(g,'#7a4f2f',2,16,28,2);px(g,'#24222a',4,0,24,16);px(g,'#4a7ac4',6,2,20,12);px(g,'#f2d45a',6,10,20,4);px(g,'#7fc4e8',6,2,20,4);px(g,'#3a3a44',14,14,4,2);fin(c);oy=16-28;break}
 case'recliner':{[c,g]=O(20,26);px(g,'#6b4226',2,0,16,16);px(g,'#8a5a36',4,2,12,3);px(g,'#5a3620',0,8,4,16);px(g,'#5a3620',16,8,4,16);px(g,'#6b4226',4,16,12,8);px(g,'#4a2a16',2,24,16,2);fin(c);ox=-2;oy=16-26;break}
 case'foosball':{[c,g]=O(32,22);px(g,'#5a3a22',0,4,32,12);px(g,'#3e9a4a',3,6,26,8);px(g,'#ffffff',15,6,1,8);for(const x of[6,11,20,25]){px(g,'#c0c0c8',x,1,1,20);px(g,x<16?'#d9534f':'#5b9bd5',x-1,8,3,3)}px(g,'#3a2414',2,16,3,6);px(g,'#3a2414',27,16,3,6);fin(c);oy=-4;break}
 case'dogstatue':{[c,g]=O(16,28);px(g,'#7a5a3a',1,22,14,6);px(g,'#9a7a5a',1,22,14,1);ell(g,'#f4f4ee',8,18,4,4);px(g,'#f4f4ee',5,8,6,12);ell(g,'#f4f4ee',8,6,3,3);px(g,'#f4f4ee',9,5,5,3);px(g,'#24222a',13,5,1,1);px(g,'#24222a',8,4,1,1);px(g,'#d8d8d0',5,1,2,5);px(g,'#d8d8d0',6,12,2,9);px(g,'#c9a24a',6,10,5,1);fin(c);oy=16-28;break}
 case'carcover':{[c,g]=O(34,22);const cv2='#8a8e98',cd='#6e727c';px(g,cv2,1,9,32,10);px(g,cv2,6,3,20,8);px(g,cd,1,17,32,2);px(g,'#a4a8b2',7,3,18,1);px(g,'#a4a8b2',2,9,8,1);
  for(const[x,y]of[[3,10],[12,6],[22,11],[28,12],[17,14]])px(g,cd,x,y,4,1);px(g,'#c9a06a',30,15,3,4);px(g,'#b08850',30,15,3,1);px(g,'#2a2a30',4,19,6,3);px(g,'#2a2a30',24,19,6,3);fin(c);oy=16-22+1;break}
 case'bookshelf':{[c,g]=O(16,30);const t=o.tone||'#6b4226';px(g,t,0,0,16,30);px(g,shade(t,.15),0,0,16,2);const bc=['#c0262c','#3a5a8a','#e8b830','#5a7a5a','#8e6bbf','#f4f1ea','#d9782f'];for(let sh=0;sh<3;sh++){px(g,shade(t,-.3),1,3+sh*9,14,8);for(let x=2;x<14;x+=2)px(g,bc[(x+sh*3+o.x)%7],x,4+sh*9+((x+sh)%3===0?1:0),2,7-((x+sh)%3===0?1:0))}fin(c);oy=16-30;break}
 case'floorlamp':{[c,g]=O(12,32);px(g,'#3a3a44',5,8,2,22);px(g,'#3a3a44',2,29,8,3);px(g,'#f2e0b0',1,0,10,8);px(g,'#e8c880',1,6,10,2);px(g,'#fff6d0',3,1,4,3);fin(c);ox=2;oy=16-32;break}
 case'sidetable':{[c,g]=O(14,24);px(g,'#7a4a28',1,12,12,12);px(g,'#9a6438',1,12,12,2);px(g,'#3a3a44',6,6,2,6);px(g,'#f2e0b0',3,0,8,6);fin(c);ox=1;oy=16-24;break}
 case'coatrack':{[c,g]=O(12,32);px(g,'#5a3a22',5,4,2,26);px(g,'#5a3a22',2,29,8,3);px(g,'#5a3a22',2,4,8,1);px(g,'#3a5a8a',1,5,4,12);px(g,'#c0573a',7,5,4,9);px(g,'#e8b830',2,2,3,2);fin(c);ox=2;oy=16-32;break}
 case'boxes':{[c,g]=O(16,22);px(g,'#c9a06a',0,10,16,12);px(g,'#b08850',0,10,16,2);px(g,'#c9a06a',2,0,11,11);px(g,'#b08850',2,0,11,2);px(g,'#e8d8a8',0,15,16,1);px(g,'#e8d8a8',2,5,11,1);px(g,'#7a5a3a',4,7,6,1);fin(c);oy=16-22;break}
 case'canoe':{[c,g]=O(48,16);for(let x=0;x<48;x++){const h=Math.round(5-Math.abs(x-24)/6);px(g,'#3a7a8a',x,8-h,1,h*2+2)}px(g,'#c9a06a',6,6,36,2);for(const x of[14,24,34])px(g,'#9a6438',x,5,2,6);px(g,'#9a6438',30,1,2,14);px(g,'#9a6438',28,13,6,3);fin(c);oy=0;break}
 case'stanchion':{[c,g]=O(16,16);px(g,'#c9a24a',1,2,2,12);px(g,'#c9a24a',0,13,4,3);px(g,'#c0262c',2,4,14,2);px(g,'#9a1c20',4,6,10,1);px(g,'#e8c860',1,1,2,2);fin(c);oy=-2;break}
 case'mirror':{[c,g]=O(12,32);px(g,'#c9a24a',0,0,12,30);px(g,'#cfe6ef',2,2,8,26);px(g,'#ffffff',3,3,2,10);px(g,'#5a3a22',3,30,6,2);fin(c);ox=2;oy=16-32;break}
 case'copier':{[c,g]=O(18,24);px(g,'#d8d8dc',1,4,16,20);px(g,'#b8b8c0',1,4,16,3);px(g,'#4a4a56',3,0,12,5);px(g,'#7ad06a',12,9,3,2);px(g,'#f4f1ea',3,10,7,2);fin(c);ox=-1;oy=16-24;break}
 case'trash':{[c,g]=O(10,14);px(g,'#5a6a7a',1,2,8,12);px(g,'#7a8a9a',0,1,10,2);px(g,'#4a5a6a',3,4,1,9);px(g,'#4a5a6a',6,4,1,9);fin(c);ox=3;oy=2;break}
 case'flat':{const W=32;[c,g]=O(W,40);const t=o.tone||'#9cc8b8';px(g,'#7a5a3a',0,0,W,40);px(g,t,1,1,W-2,37);px(g,shade(t,-.15),1,30,W-2,8);px(g,'#f4f1ea',8,6,16,12);px(g,'#9cc8e6',9,7,14,10);px(g,'#f4f1ea',15,7,2,10);px(g,'#5a3a22',2,38,4,2);px(g,'#5a3a22',W-6,38,4,2);fin(c);oy=16-40;break}
 case'umbrella':{[c,g]=O(32,36);const t=o.tone||'#d9534f';for(let i=0;i<10;i++)px(g,i%2?t:'#f4f1ea',3+i*2.6|0,8-Math.round(Math.sin(i/9*Math.PI)*5),3,4+Math.round(Math.sin(i/9*Math.PI)*5));px(g,shade(t,-.2),3,11,27,2);px(g,'#8a8a92',15,8,2,28);fin(c);ox=-8;oy=16-36;break}
 case'towel':{const W=(o.w||2)*16;[c,g]=O(W,14);const t=o.tone||'#5b9bd5';for(let x=0;x<W;x+=6)px(g,(x/6)%2?t:'#f4f1ea',x,0,6,14);px(g,shade(t,-.2),0,13,W,1);oy=1;break}
 case'sandcastle':{[c,g]=O(16,16);const t='#d8b878';px(g,t,1,8,14,8);px(g,t,3,3,4,6);px(g,t,9,3,4,6);for(const x of[3,5,9,11])px(g,t,x,1,1,2);px(g,'#c0262c',7,0,1,5);px(g,'#c0262c',8,0,3,2);px(g,'#7a5a3a',6,11,3,5);fin(c);oy=0;break}
 case'icebox':{[c,g]=O(14,12);px(g,'#3a7fc0',0,2,14,10);px(g,'#f4f1ea',0,1,14,3);px(g,'#9a9aa4',5,0,4,2);fin(c);ox=1;oy=4;break}
 case'surfboard':{[c,g]=O(10,34);ell(g,o.tone||'#ffd84a',5,16,4,15);px(g,'#c0262c',4,4,2,24);fin(c);ox=3;oy=16-34;break}
 case'lounger':{[c,g]=O(16,20);px(g,'#f4f1ea',1,4,14,4);for(let x=1;x<15;x+=3)px(g,'#5b9bd5',x,8,2,6);px(g,'#f4f1ea',1,8,14,6);px(g,'#8a8a92',2,14,2,6);px(g,'#8a8a92',12,14,2,6);fin(c);oy=-2;break}
 case'postbox':{[c,g]=O(12,26);px(g,'#c0262c',1,4,10,22);px(g,'#e04a4a',1,4,3,22);ell(g,'#c0262c',6,4,5,3);px(g,'#24222a',3,9,6,1);px(g,'#24222a',2,24,8,2);fin(c);ox=2;oy=16-26;break}
 case'grill':{[c,g]=O(16,20);ell(g,'#24222a',8,6,7,4);px(g,'#3a3a44',1,6,14,2);px(g,'#5a5a66',3,8,2,12);px(g,'#5a5a66',11,8,2,12);px(g,'#e05a2a',5,4,6,1);fin(c);oy=-4;break}
 case'luggage':{[c,g]=O(16,18);px(g,o.tone||'#5a3a6a',2,6,12,12);px(g,shade(o.tone||'#5a3a6a',.2),2,6,12,2);px(g,'#24222a',6,2,4,4);px(g,'#7a7a82',4,17,2,1);px(g,'#7a7a82',10,17,2,1);px(g,'#e8b830',8,10,4,3);fin(c);oy=-2;break}
 case'poster':{[c,g]=O(16,22);const t=o.tone||'#3a5a8a';px(g,'#f4f1ea',1,1,14,20);px(g,t,2,2,12,13);px(g,shade(t,.4),4,5,8,6);px(g,'#24222a',3,17,10,1);px(g,'#24222a',3,19,7,1);oy=0;break}
 case'banner':{[c,g]=O(16,28);const t=o.tone||'#5b3a8c';px(g,'#c9a24a',0,0,16,2);px(g,t,2,2,12,22);px(g,t,2,24,5,3);px(g,t,9,24,5,3);px(g,'#efe6cc',5,8,6,8);px(g,'#efe6cc',4,9,2,3);oy=0;break}
 case'rail':{[c,g]=O(16,12);px(g,'#3a3a44',0,2,16,2);px(g,'#3a3a44',0,8,16,1);for(let x=1;x<16;x+=5)px(g,'#3a3a44',x,2,2,10);oy=4;break}
 case'cubicle':{[c,g]=O(32,26);px(g,'#9aa0aa',0,0,32,14);px(g,'#b8bec8',0,0,32,2);px(g,'#7a5a3a',2,14,28,4);px(g,'#24222a',10,4,10,8);px(g,'#7ad0a0',11,5,8,5);px(g,'#5a5a66',4,18,3,8);px(g,'#5a5a66',25,18,3,8);px(g,'#f4f1ea',22,10,5,4);fin(c);oy=16-26;break}
 case'cooler':{[c,g]=O(12,26);px(g,'#9cc8e6',2,0,8,9);px(g,'#c9e2f0',2,0,2,9);px(g,'#e8e8ec',1,9,10,17);px(g,'#5a9ae0',4,12,2,2);px(g,'#e05a5a',7,12,2,2);fin(c);ox=2;oy=16-26;break}
 case'rack':{[c,g]=O(32,26);const t=o.tone||'#d9534f';px(g,'#8a8a92',1,2,30,1);px(g,'#8a8a92',2,2,1,24);px(g,'#8a8a92',29,2,1,24);for(let i=0;i<6;i++){const cc=i%2?t:shade(t,.3);px(g,cc,4+i*4,3,4,15);px(g,shade(cc,-.2),4+i*4,16,4,2)}px(g,'#5a5a66',0,24,32,2);fin(c);oy=16-26;break}
 case'mannequin':{[c,g]=O(12,28);px(g,'#e8dcc8',4,0,4,5);px(g,'#c0573a',2,6,8,9);px(g,'#3a3a44',3,15,6,7);px(g,'#8a8a92',5,22,2,4);px(g,'#5a5a66',2,26,8,2);fin(c);ox=2;oy=16-28;break}
 case'stool':{[c,g]=O(10,14);ell(g,'#c0262c',5,2,4,2);px(g,'#c0c0c8',4,4,2,8);px(g,'#8a8a92',1,12,8,2);fin(c);ox=3;oy=2;break}
 case'jukebox':{[c,g]=O(16,28);px(g,'#c0262c',1,6,14,22);ell(g,'#e8b820',8,7,7,6);px(g,'#ffd84a',3,4,10,4);px(g,'#7ad0ff',4,13,8,6);px(g,'#ff6fb0',3,21,10,2);fin(c);oy=16-28;break}
 case'booth':{[c,g]=O(32,22);px(g,'#c0262c',0,0,32,10);px(g,'#e04a4a',0,0,32,2);px(g,'#e8e2d4',4,8,24,8);px(g,'#9a9aa4',15,16,2,6);px(g,'#f4f1ea',8,9,4,3);px(g,'#c0262c',0,12,3,10);px(g,'#c0262c',29,12,3,10);fin(c);oy=-6;break}
 case'dino':{[c,g]=O(96,56);const b='#efe6cc',bd='#cfc4a4';px(g,'#7a6a5a',4,50,88,6);px(g,'#9a8a7a',4,50,88,1);
  for(let x=14;x<70;x+=6){px(g,b,x,18+Math.abs(x-40)/6,2,14)}px(g,b,10,16,64,3);px(g,b,70,10,4,10);px(g,b,68,4,18,10);px(g,bd,70,10,16,3);for(let i=0;i<5;i++)px(g,'#ffffff',72+i*3,13,1,2);px(g,'#24222a',80,6,2,2);
  for(let i=0;i<10;i++)px(g,b,10-i,17+i*2,3,2);px(g,b,24,28,3,22);px(g,b,30,28,3,22);px(g,b,52,28,3,22);px(g,b,58,28,3,22);px(g,b,62,20,8,2);px(g,b,68,20,2,6);fin(c);oy=32-56;break}
 case'case':{[c,g]=O(16,26);px(g,'#7a5a3a',0,12,16,14);px(g,'#cfe6ef',1,0,14,12);px(g,'#ffffff',1,0,14,1);px(g,'#b8a07a',4,6,8,5);px(g,'#9a8a6a',6,4,4,2);fin(c);oy=16-26;break}
 case'hospbed':{[c,g]=O(32,24);px(g,'#c0c0c8',0,8,32,6);px(g,'#f4f4f8',2,4,28,6);px(g,'#9cc8e6',14,4,16,6);px(g,'#f4f4f8',2,2,8,4);px(g,'#8a8a92',2,14,2,10);px(g,'#8a8a92',28,14,2,10);fin(c);oy=-8;break}
 case'camera':{[c,g]=O(16,28);px(g,'#24222a',2,2,12,9);px(g,'#4a4a56',12,4,4,5);px(g,'#7ad0ff',14,5,2,3);px(g,'#3a3a44',7,11,2,13);px(g,'#3a3a44',2,24,12,2);px(g,'#e05a5a',4,3,2,2);fin(c);oy=16-28;break}
 case'stagelight':{[c,g]=O(14,30);px(g,'#24222a',6,8,2,20);px(g,'#24222a',1,28,12,2);px(g,'#3a3a44',2,0,10,8);px(g,'#ffe9a0',3,6,8,2);fin(c);ox=1;oy=16-30;break}
 case'trunk':{[c,g]=O(16,16);px(g,'#7a4a28',0,4,16,12);px(g,'#9a6438',0,4,16,3);px(g,'#c9a24a',7,7,2,3);px(g,'#4a2e1a',0,9,16,1);fin(c);oy=0;break}
 case'dinoskull':{[c,g]=O(16,22);px(g,'#5a3a22',2,14,12,8);px(g,'#efe6cc',1,4,14,9);px(g,'#24222a',4,6,3,3);for(let i=0;i<5;i++)px(g,'#ffffff',3+i*2,12,1,2);fin(c);oy=16-22;break}
 case'board':{const W=o.w*16;[c,g]=O(W,26);px(g,'#24222a',0,2,W,24);px(g,'#3a3a44',0,2,W,2);for(let y=7;y<24;y+=4){px(g,'#ffd84a',4,y,W*.45|0,2);px(g,'#7ae08a',W*.6|0,y,W*.3|0,2)}oy=0;break}
 case'gatedesk':{[c,g]=O(32,20);px(g,'#3a4a6a',0,4,32,16);px(g,'#5a6a8a',0,4,32,2);px(g,'#e8e8ec',2,0,28,5);px(g,'#24222a',20,0,8,4);fin(c);oy=-4;break}
 case'seats':{[c,g]=O(48,18);for(let i=0;i<3;i++){px(g,'#2a3a5a',i*16+1,0,14,8);px(g,'#3a4a6a',i*16+1,8,14,5)}px(g,'#8a8a92',0,13,48,2);px(g,'#8a8a92',4,15,2,3);px(g,'#8a8a92',42,15,2,3);fin(c);oy=-2;break}
 case'clocktower':{[c,g]=O(32,96);px(g,'#c9a86a',4,24,24,72);px(g,'#b09058',4,24,4,72);for(let y=40;y<92;y+=10)px(g,'#7a6440',8,y,16,6);px(g,'#c9a86a',2,14,28,12);ell(g,'#f4efe2',16,20,7,6);px(g,'#24222a',16,15,1,6);px(g,'#24222a',16,20,4,1);
  for(let i=0;i<10;i++)px(g,'#5a5a4a',6+i,13-i,20-i*2,1);px(g,'#5a5a4a',15,0,2,4);fin(c);oy=16-96;break}
 case'phonebox':{[c,g]=O(16,34);px(g,'#c0262c',1,2,14,32);px(g,'#e04a4a',1,2,3,32);px(g,'#24222a',2,0,12,3);px(g,'#f4f1ea',3,4,10,3);for(let y=9;y<30;y+=5)px(g,'#9cc8e6',4,y,8,4);fin(c);oy=16-34;break}
 case'bus':{[c,g]=O(48,34);px(g,'#c0262c',0,2,48,30);px(g,'#e04a4a',0,2,48,2);px(g,'#24222a',0,17,48,1);for(let x=3;x<46;x+=9){px(g,'#9cc8e6',x,5,7,8);px(g,'#9cc8e6',x,20,7,7)}px(g,'#1c1c22',6,28,8,6);px(g,'#1c1c22',34,28,8,6);fin(c);oy=16-34;break}
 case'cab':{const sp=carSprite('#24222a',false);c=sp.l;oy=16-c.height+1;break}
 case'palm':{[c,g]=O(32,44);for(let i=0;i<26;i++)px(g,i%4<2?'#8a6a3a':'#7a5a2a',14+Math.round(Math.sin(i/6)*2),16+i,4,1);
  const lf='#3e9a4a';for(const[dx,dy]of[[-12,4],[12,4],[-10,-2],[10,-2],[0,-6]])for(let i=0;i<12;i++)px(g,i%3?lf:'#2f7a3a',16+dx*i/12,14+dy*i/12+Math.abs(i-6)/3,3,2);ell(g,'#7a5a2a',16,16,2,2);fin(c);ox=-8;oy=16-44;break}
 case'pingpong':{[c,g]=O(32,20);px(g,'#2f6b3a',0,2,32,10);px(g,'#ffffff',0,2,32,1);px(g,'#ffffff',15,2,2,10);px(g,'#f4f1ea',0,6,32,1);px(g,'#3a3a44',3,12,2,8);px(g,'#3a3a44',27,12,2,8);px(g,'#ffffff',22,0,2,2);fin(c);oy=-4;break}
 case'fountain':{[c,g]=O(48,44);ell(g,'#8a8a92',24,32,23,11);ell(g,'#5aa0d0',24,31,20,8);ell(g,'#8ac8f0',20,29,10,3);px(g,'#9a9aa4',20,12,8,20);ell(g,'#8a8a92',24,12,9,4);ell(g,'#5aa0d0',24,11,7,2);
  for(let i=0;i<6;i++){px(g,'#bfe4fa',22-i*2,4+i*2,2,2);px(g,'#bfe4fa',25+i*2,4+i*2,2,2)}px(g,'#bfe4fa',23,0,2,10);fin(c);oy=32-44;break}
 default:{const t=fp(o);let w=o.w||1,h=o.h||1;if(t.length){w=Math.max(...t.map(q=>q[0]))-o.x+1;h=Math.max(...t.map(q=>q[1]))-o.y+1}[c,g]=O(w*16,h*16)}
 }
 return{c,ox,oy:oy??0}}
const carCache={};
function carSprite(col,taxi){const k=col+taxi;if(carCache[k])return carCache[k];const[c,g]=mk(34,22);
 px(g,col,1,9,32,8);px(g,shade(col,.25),1,9,32,2);px(g,shade(col,-.2),1,15,32,2);px(g,col,8,2,17,8);px(g,shade(col,.2),8,2,17,1);
 px(g,'#9cc3dc',10,4,6,5);px(g,'#9cc3dc',18,4,6,5);px(g,'#c9e2f0',10,4,2,2);px(g,'#c9e2f0',18,4,2,2);
 px(g,'#1c1c22',4,15,7,6);px(g,'#1c1c22',23,15,7,6);px(g,'#8a8a92',6,17,3,2);px(g,'#8a8a92',25,17,3,2);
 px(g,'#fff3b0',1,10,2,3);px(g,'#e0484c',31,10,2,3);
 if(taxi){for(let x=4;x<30;x+=4){px(g,'#1c1c22',x,12,2,1);px(g,'#1c1c22',x+2,13,2,1)}px(g,'#f4f1ea',13,0,8,3);px(g,'#1c1c22',14,1,6,1)}
 outline(c);return carCache[k]={l:c,r:mirror(c)}}

/* ===================== ART: characters ===================== */
const charCache={};
function hdKey(look,id){return(look&&look.hd)||HD_CAST[id]}
// v1.4: everyone without their own HD sheet (townspeople, Eddie, the usher) is drawn from the player
// templates, keeping their colours; short hair varies between three cuts so crowds don't look cloned
function npcLook(L,id){const h=[...JSON.stringify(L)+(id||'')].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
 const short=['buzz','shaggy','buzz','shaggy','spiky'][h%5],st={long:'long',bob:'shaggy',bun:'ponytail',bald:'bald',short}[L.style||'short']||short;
 return Object.assign({},L,{player:true,style:st,freckles:h%5===3,outfit:L.outfit||'pants',pants:L.pants||'#3a3a44'})}
function charSprites(look,id){if(look&&look.player){if(PL.ready)return playerSprites(look);look=procLook(look)}const hk=hdKey(look,id);if(hk&&hdSprites[hk])return hdSprites[hk];
 if(PL.ready&&look&&!look.animal&&!(id&&customSprites[id]))return playerSprites(npcLook(look,id));if(id&&customSprites[id])return customSprites[id];const k=JSON.stringify(look);if(charCache[k])return charCache[k];
 const out={down:[],up:[],left:[],right:[]};
 for(const dir of['down','up','left'])for(let f=0;f<3;f++)out[dir].push(drawChar(look,dir,f));
 out.right=out.left.map(mirror);return charCache[k]=out}
function drawChar(L,dir,f){if(L.animal)return drawAnimal(L.animal,dir,f);const[c,g]=mk(16,24);
 const sk=L.skin,hr=L.hair,sh=L.shirt,pa=L.pants||'#3a3a44',so=L.shoes||'#2a2024',skD=shade(sk,-.15),shD=shade(sh,-.2),hrD=shade(hr,-.22),ink='#1a1a2a';
 const fem=!!L.fem,skirt=L.outfit==='skirt'||L.outfit==='dress',skc=L.outfit==='dress'?sh:(L.skirt||pa),legc=skirt?skD:pa;
 const st=L.style||'short',longH=st==='long',bob=st==='bob';
 const bx=fem?5:4,bw=fem?6:8;
 const legs=()=>{if(dir==='left'){if(f===0){px(g,legc,6,19,3,3);px(g,so,5,22,4,1)}else if(f===1){px(g,legc,4,19,2,3);px(g,so,3,22,3,1);px(g,legc,8,19,2,2);px(g,so,8,21,3,1)}else{px(g,legc,8,19,2,3);px(g,so,7,22,3,1);px(g,legc,4,19,2,2);px(g,so,4,21,3,1)}}
  else{const a=f===1?-1:0,b=f===2?-1:0,w=skirt?1:2;px(g,legc,6-w+1,19,w,3+a);px(g,legc,9,19,w,3+b);px(g,so,5,22+a,2,1);px(g,so,9,22+b,2,1)}};
 const lower=()=>{if(skirt){if(dir==='left'){px(g,skc,4,16,8,3);px(g,shade(skc,-.2),4,18,8,1)}else{px(g,skc,bx-1,16,bw+2,3);px(g,shade(skc,-.2),bx-1,18,bw+2,1);px(g,shade(skc,.15),bx,16,2,2)}}else px(g,pa,5,17,6,2)};
 if(dir==='left'){
  if(longH)px(g,hr,8,3,4,11);
  legs();lower();px(g,sh,fem?6:5,11,fem?5:6,skirt?5:6);px(g,shD,9,11,2,skirt?5:6);if(L.apron)px(g,'#efeadc',5,13,3,4);
  const sw=f===1?-1:f===2?1:0;px(g,shD,7+sw,11,2,5);px(g,sk,7+sw,16,2,1);
  px(g,sk,4,2,7,7);px(g,sk,5,9,5,1);px(g,sk,7,10,2,1);px(g,skD,9,3,2,6);px(g,sk,3,5,1,2);px(g,ink,5,5,1,2);
  if(fem){px(g,ink,4,5,1,1);px(g,'#c4524c',4,8,2,1);px(g,'#ea9c8e',6,7,1,1)}else px(g,shade(sk,-.3),4,8,2,1);
  if(st!=='bald'){px(g,hr,4,1,7,3);px(g,hr,8,2,3,6);px(g,hr,4,1,2,3);if(bob){px(g,hr,8,2,4,8);px(g,hrD,9,8,3,1)}if(longH)px(g,hr,9,3,3,6)}else px(g,skD,4,1,7,1);
  if(st==='bun')px(g,hr,10,1,3,3);
 } else if(dir==='down'){
  legs();lower();px(g,sh,bx,11,bw,skirt?5:6);px(g,shD,bx+bw-2,11,2,skirt?5:6);px(g,sk,7,10,2,1);if(fem)px(g,sk,7,11,2,1);if(L.apron)px(g,'#efeadc',bx+1,13,bw-2,4);
  const la=f===1?-1:0,ra=f===2?-1:0;px(g,sh,bx-1,11,1,4+la);px(g,sh,bx+bw,11,1,4+ra);px(g,sk,bx-1,15+la,1,2);px(g,sk,bx+bw,15+ra,1,2);
  px(g,sk,4,2,8,7);px(g,sk,5,9,6,1);px(g,ink,6,5,1,2);px(g,ink,9,5,1,2);
  if(fem){px(g,ink,5,5,1,1);px(g,ink,10,5,1,1);px(g,'#ea9c8e',5,7,1,1);px(g,'#ea9c8e',10,7,1,1);px(g,'#c4524c',7,8,2,1)}else{px(g,ink,6,4,1,1);px(g,ink,9,4,1,1);px(g,shade(sk,-.3),7,8,2,1)}
  if(st==='bald'){px(g,skD,4,1,8,1);px(g,sk,3,5,1,2);px(g,sk,12,5,1,2)}
  else{px(g,hr,4,1,8,2);px(g,hr,3,2,1,3);px(g,hr,12,2,1,3);px(g,hrD,7,1,1,1);
   if(longH){px(g,hr,4,3,2,1);px(g,hr,10,3,2,1);px(g,hr,2,3,2,11);px(g,hr,12,3,2,11);px(g,hrD,2,12,2,2);px(g,hrD,12,12,2,2)}
   else if(bob){px(g,hr,4,3,8,1);px(g,hr,3,3,1,7);px(g,hr,12,3,1,7);px(g,hr,2,5,1,4);px(g,hr,13,5,1,4);px(g,hrD,3,9,1,1);px(g,hrD,12,9,1,1)}
   else{px(g,hr,4,3,1,1);px(g,hr,11,3,1,1)}}
  if(st==='bun'){px(g,hr,4,3,8,1);px(g,hr,6,0,4,2)}
 } else {
  legs();lower();px(g,sh,bx,11,bw,skirt?5:6);px(g,shD,bx,11,2,skirt?5:6);px(g,sk,7,10,2,1);
  const la=f===1?-1:0,ra=f===2?-1:0;px(g,sh,bx-1,11,1,4+la);px(g,sh,bx+bw,11,1,4+ra);px(g,sk,bx-1,15+la,1,2);px(g,sk,bx+bw,15+ra,1,2);
  px(g,sk,4,2,8,8);px(g,sk,3,5,1,2);px(g,sk,12,5,1,2);
  if(st!=='bald'){px(g,hr,4,1,8,8);px(g,hr,3,2,1,3);px(g,hr,12,2,1,3);px(g,hrD,4,8,8,1);if(longH){px(g,hr,3,2,10,12);px(g,hrD,3,13,10,1)}if(bob){px(g,hr,3,2,10,8);px(g,hrD,3,9,10,1)}}else px(g,skD,4,7,8,3);
  if(st==='bun')px(g,hr,6,0,4,3);
 }
 dressUp(g,L,dir,f,sk);
 outline(c);return c}
// Easter-egg outfits and hats, drawn over the base character
function dressUp(g,L,dir,f,sk){const ink='#1a1a2a',side=dir==='left',back=dir==='up';
 if(L.leather){const hi='#7a7888',mid='#45434f';px(g,mid,5,17,6,1);if(side){px(g,hi,6,18,1,3);px(g,mid,7,17,1,1)}else{px(g,hi,6,18,1,2+(f===1?0:1));px(g,hi,10,18,1,2+(f===2?0:1));px(g,'#c9c4d2',7,17,1,1)}}
 if(L.costume==='armadillo'){const a='#8a8a8a',ad='#6a6a6a',al='#a8a8a8';px(g,a,3,4,10,17);for(let y=7;y<20;y+=3)px(g,ad,3,y,10,1);px(g,al,4,4,3,16);
  if(!back){px(g,sk,side?4:5,6,side?4:6,4);px(g,ink,side?5:6,7,1,1);if(!side)px(g,ink,9,7,1,1);px(g,al,side?1:6,9,side?4:4,3);px(g,'#4a4a4a',side?1:7,10,1,1)}
  px(g,al,4,1,2,4);px(g,al,10,1,2,4);px(g,'#e0a0a0',4,2,1,2);px(g,'#e0a0a0',11,2,1,2);if(back)for(let i=0;i<6;i++)px(g,a,7,21+i%3,2,1)}
 if(L.costume==='box'){px(g,'#c9a06a',2,6,12,16);px(g,'#b08850',2,6,12,2);px(g,'#a07840',12,6,2,16);px(g,'#e8d8a8',2,14,12,1);if(!back){if(side)px(g,ink,4,10,2,1);else{px(g,ink,5,10,2,1);px(g,ink,9,10,2,1)}}}
 if(L.costume==='layers'){const cs=['#5a7a5a','#c0573a','#3a5a8a','#e8b830'];for(let i=0;i<4;i++)px(g,cs[i],2+(i%2),10+i*2,12-(i%2)*2,3);px(g,'#7a5a3a',2,12,1,6);px(g,'#7a5a3a',13,12,1,6);px(g,'#e8b830',4,10,8,2);px(g,'#3a5a8a',4,0,8,3);px(g,'#5a7aa8',4,0,8,1)}
 if(L.hat==='turkey'){const b='#b86a2c',bd='#9a5422';for(let y=0;y<9;y++){const w=y<2?6:y<7?10:8;px(g,y%3?b:bd,8-w/2,y,w,1)}px(g,'#f4ead2',2,6,2,2);px(g,'#f4ead2',12,6,2,2);
  if(!back){px(g,'#151515',side?3:4,6,side?4:8,2);if(!side)px(g,'#151515',7,6,2,1)}px(g,'#c0262c',6,0,4,2);px(g,'#e8b820',10,1,1,3)}
 if(L.hat==='veil'){px(g,'#f4f1ea',3,1,1,14);px(g,'#f4f1ea',12,1,1,14);if(back||side)px(g,'#f4f1ea',side?8:3,2,side?4:10,13);px(g,'#e8b820',5,0,6,1);px(g,'#ff9ad0',7,0,2,1)}
 if(L.hat==='wig'){const w='#f0d070',wd='#d8b050';px(g,w,3,0,10,4);if(back)px(g,w,2,1,12,13);else if(side){px(g,w,7,1,6,12);px(g,wd,11,4,2,8)}else{px(g,w,2,2,2,11);px(g,w,12,2,2,11);px(g,wd,2,11,2,2);px(g,wd,12,11,2,2);px(g,w,4,3,3,1);px(g,w,9,3,3,1)}}
 if(L.held){const hx=side?5:back?11:12,hy=side?14:13;switch(L.held){
  case'umbrella':px(g,'#3a3a44',hx,hy-8,1,10);px(g,'#c0262c',hx-1,hy-9,3,5);px(g,'#ffffff',hx,hy-8,1,3);break;
  case'hugsy':px(g,'#24222a',hx-1,hy,4,5);px(g,'#f4f1ea',hx,hy+1,2,3);px(g,'#f0a030',hx,hy+2,1,1);break;
  case'bag':px(g,'#7a4a28',hx-1,hy+1,4,4);px(g,'#3a2414',hx,hy,2,1);break;
  case'purse':px(g,'#e8c070',hx-1,hy+1,4,3);px(g,'#3a2414',hx,hy+2,1,1);px(g,'#3a2414',hx+1,hy,1,1);break;
  case'paddle':px(g,'#c0262c',hx-1,hy-3,3,3);px(g,'#9a6438',hx,hy,1,3);break;
  case'mug':px(g,'#f4f1ea',hx-1,hy,3,3);px(g,'#f4f1ea',hx+2,hy+1,1,1);break;
  case'puck':px(g,'#1c1c22',hx-1,hy+1,3,2);break}}
 if(L.hat==='unionjack'){px(g,'#1a3a8a',4,0,8,3);px(g,'#f4f1ea',4,1,8,1);px(g,'#f4f1ea',7,0,2,3);px(g,'#c0262c',7,0,1,3);px(g,'#c0262c',4,1,8,1);px(g,'#1a3a8a',3,3,10,1)}
 if(L.hat==='redcap'){px(g,'#c0262c',4,0,8,3);px(g,'#e04a4a',5,0,4,1);if(!back)px(g,'#9a1c20',side?1:4,3,side?5:8,1)}
 if(L.camera&&!back){px(g,'#24222a',6,13,4,3);px(g,'#7ad0ff',7,14,1,1);px(g,'#24222a',5,11,1,2);px(g,'#24222a',10,11,1,2)}
 if(L.map&&!back&&!side){px(g,'#f4f1ea',11,13,4,4);px(g,'#7ab04a',12,14,2,1);px(g,'#5b9bd5',12,16,2,1)}}
function drawAnimal(k,dir,f){const[c,g]=mk(16,24);const duck=k==='duck',body=duck?'#f6f4ee':'#f5d84a',bD=duck?'#d9d6cc':'#d9b82e',beak='#f0962a',ink='#1a1a2a';
 const fy=f?-1:0,cx=8,by=duck?19:20,hx=dir==='left'?(duck?4:5):dir==='right'?(duck?12:11):8,hy=duck?13:16;
 px(g,beak,6,22,2,1+(f===1?0:0));px(g,beak,9,22,2,1);
 if(duck){ell(g,body,cx,by+fy,5,3);ell(g,bD,cx+1,by+1+fy,3,1);px(g,body,hx-1,hy+2+fy,3,4);ell(g,body,hx,hy+fy,2,2)}else{ell(g,body,cx,by+fy,4,3);ell(g,bD,cx+1,by+1+fy,2,1);ell(g,body,hx,hy+fy,2,2)}
 if(dir==='left'){px(g,beak,hx-4+(duck?0:1),hy+fy,2+(duck?1:0),1);px(g,ink,hx-1,hy-1+fy,1,1)}else if(dir==='right'){px(g,beak,hx+2+(duck?0:0),hy+fy,2+(duck?1:0),1);px(g,ink,hx+1,hy-1+fy,1,1)}
 else if(dir==='down'){px(g,beak,hx-1,hy+1+fy,2,1);px(g,ink,hx-2,hy-1+fy,1,1);px(g,ink,hx+1,hy-1+fy,1,1)}
 outline(c);return c}
const customSprites={},hdSprites={},hdItems={},hdProps={};
const HD_CW=176,HD_CH=192,HD_DRAW=1.2; // HD characters draw 20% larger than the 16x24 cell, anchored at the feet
function loadHD(){
 for(const[key,file]of Object.entries(HD_SPRITES)){const src='sprites/hd/'+file+'.png';const im=new Image();im.onload=()=>{const out={hd:true,down:[],up:[],left:[],right:[]};
   ['down','up','left','right'].forEach((d,row)=>{for(let f=0;f<3;f++){const[c,g]=mk(HD_CW,HD_CH);g.drawImage(im,f*HD_CW,row*HD_CH,HD_CW,HD_CH,0,0,HD_CW,HD_CH);c.hd=true;out[d].push(c)}});
   hdSprites[key]=out;if(typeof npcs!=='undefined')for(const n of npcs)if(hdKey(n.look,n.id)===key)n.spr=out};im.src=src}
 for(const[kind,src]of Object.entries(HD_PROPS)){const im=new Image();im.onload=()=>{const[c,g]=mk(im.width,im.height);g.drawImage(im,0,0);c.hd=true;hdProps[kind]=c};im.src=src}
 for(const[id,src]of Object.entries(HD_ITEMS)){const im=new Image();im.onload=()=>{const[c,g]=mk(im.width,im.height);g.drawImage(im,0,0);c.hd=true;hdItems[id]=c;delete itemCache[id];for(const k in picCache)delete picCache[k]};im.src=src}}
/* v1.2: the player character is built from colour-keyed template sheets (tools/prep_player.py).
 * Each sheet is a label map: every pixel says which part it is (skin, shirt, hair...), and
 * playerSprites() paints the parts in the colours the player picked, then adds outfits and wearables. */
const PL={ready:false,meta:null,sheets:{}},playerCache={};
const P_OUT=1,P_SKIN=2,P_SKIN2=3,P_SKIN3=4,P_SHIRT=5,P_SHIRT2=6,P_PANTS=7,P_SHOES=8,P_SHOES2=9,P_HAIR=10,P_HAIR2=11,P_FRECKLE=12,P_SKIRT=20,P_SKIRT2=21,P_SHINE=22;
const STYLE_MAP={bob:'shaggy',short:'buzz',bun:'ponytail'};   // hairstyles from saves made before v1.2
function loadPlayerArt(){fetch('sprites/player/meta.json').then(r=>r.json()).then(meta=>{const names=['base','freckles',...meta.styles];let left=names.length;
 for(const n of names){const im=new Image();im.onload=()=>{const[c,g]=mk(im.width,im.height);g.drawImage(im,0,0);const d=g.getImageData(0,0,im.width,im.height).data,lab=new Uint8Array(im.width*im.height);
  for(let i=0;i<lab.length;i++)lab[i]=Math.round(d[i*4]/20);PL.sheets[n]={w:im.width,lab};
  if(--left===0){PL.meta=meta;PL.ready=true;if(S)refreshPlayer();else player.spr=charSprites(lookFromPick());if(typeof npcs!=='undefined')for(const n of npcs)if(!(n.spr&&n.spr.hd))n.spr=charSprites(n.look,n.id);if(state==='title')drawPreview()}};im.src='sprites/player/'+n+'.png'}}).catch(()=>{})}
function hexRGB(h){const n=parseInt(h.slice(1,7),16);return[n>>16,n>>8&255,n&255]}
function playerSprites(L){
 let style=STYLE_MAP[L.style]||L.style||'bald',hair=L.hair||'#4a3426';
 if(L.hat==='wig'){style='shaggy';hair='#f0d070'}                 // Monica's diner wig is a hair swap
 if(!PL.meta.styles.includes(style))style='bald';
 const key=JSON.stringify([style,hair,L.skin,L.shirt,L.pants,L.outfit,!!L.freckles,!!L.leather,L.hat,L.costume,L.held]);if(playerCache[key])return playerCache[key];
 const sk=L.skin||'#f1c9a5',sh=L.shirt||'#5b9bd5',pa=L.leather?'#1d1b22':(L.pants||'#3b4a6b'),outfit=L.leather?'pants':(L.outfit||'pants'),skc=outfit==='dress'?sh:(L.skirt||pa);
 const C=[];C[P_OUT]='#1e1a2e';C[P_SKIN]=sk;C[P_SKIN2]=shade(sk,-.12);C[P_SKIN3]=shade(sk,-.24);C[P_SHIRT]=sh;C[P_SHIRT2]=shade(sh,-.22);C[P_PANTS]=pa;C[P_SHOES]='#3b302c';C[P_SHOES2]='#2a221f';
 C[P_HAIR]=hair;C[P_HAIR2]=shade(hair,-.3);C[P_FRECKLE]=shade(sk,-.36);C[P_SKIRT]=skc;C[P_SKIRT2]=shade(skc,-.2);C[P_SHINE]='#6e6c7c';
 const RGB=C.map(c=>c&&hexRGB(c));
 const sheet=PL.sheets[style==='bald'?'base':style],fr=PL.sheets.freckles,[CW,CH]=PL.meta.cell,W=sheet.w;
 const out={hd:true,player:true,down:[],up:[],left:[],right:[]};
 ['down','up','left','right'].forEach((d,r)=>{for(let f=0;f<3;f++){
  const lab=new Uint8Array(CW*CH);let py0=CH,py1=-1;
  for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){const i=(r*CH+y)*W+f*CW+x;let v=sheet.lab[i];if(L.freckles&&fr.lab[i]===P_FRECKLE&&(v===P_SKIN||v===P_SKIN2))v=P_FRECKLE;lab[y*CW+x]=v;if(v===P_PANTS){if(y<py0)py0=y;if(y>py1)py1=y}}
  if(py1>0&&outfit!=='pants'){ // skirts and dresses: bare legs (the no-pants look) with a flared skirt on top
   const end=py0+Math.round((py1-py0)*(outfit==='dress'?.58:.42)),fill=[];
   for(let y=py0;y<=end;y++){let x0=-1,x1=-1;for(let x=0;x<CW;x++)if(lab[y*CW+x]===P_PANTS){if(x0<0)x0=x;x1=x}if(x0<0)continue;const fl=Math.round((y-py0)/(end-py0+1)*3);
    for(let x=Math.max(0,x0-fl);x<=Math.min(CW-1,x1+fl);x++){const k=y*CW+x,v=lab[k];if(v===0||v===P_PANTS||v===P_OUT)fill.push([k,y===end?P_SKIRT2:P_SKIRT])}}
   for(const[k,v]of fill)lab[k]=v;
   for(let k=0;k<lab.length;k++)if(lab[k]===P_PANTS)lab[k]=P_SKIN2;
   const isSk=v=>v===P_SKIRT||v===P_SKIRT2,add=[];
   for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){const k=y*CW+x;if(lab[k]!==0)continue;if((x>0&&isSk(lab[k-1]))||(x<CW-1&&isSk(lab[k+1]))||(y>0&&isSk(lab[k-CW]))||(y<CH-1&&isSk(lab[k+CW])))add.push(k)}
   for(const k of add)lab[k]=P_OUT;
   for(let x=0;x<CW;x++)for(let y=end+1;y<CH;y++){const k=y*CW+x;if(isSk(lab[k-CW])&&lab[k]!==0&&lab[k]!==P_OUT){lab[k]=P_OUT;break}}}
  if(L.leather)for(let y=0;y<CH;y++)for(let x=2;x<CW;x++){const k=y*CW+x;if(lab[k]===P_PANTS&&lab[k-1]===P_PANTS&&lab[k-2]!==P_PANTS&&(y+x)%5)lab[k]=P_SHINE}
  const[c,g]=mk(CW,CH),id=g.createImageData(CW,CH),D=id.data;
  for(let k=0;k<lab.length;k++){const col=RGB[lab[k]];if(!col)continue;D[k*4]=col[0];D[k*4+1]=col[1];D[k*4+2]=col[2];D[k*4+3]=255}
  g.putImageData(id,0,0);playerOverlays(g,L,d,f,PL.meta.anchors[d][f]);c.hd=true;out[d].push(c)}});
 return playerCache[key]=out}
// Hats, costumes and held items are still the 16x24 pixel props, scaled onto the HD body:
// hats to the head, costumes to the whole figure, held things to the front hand.
const HAT_LIFT={unionjack:1.6,redcap:1.6,veil:.6};
function playerOverlays(g,L,d,f,a){const parts=[];if(L.hat&&L.hat!=='wig')parts.push(['head',{hat:L.hat}]);if(L.costume)parts.push(['body',{costume:L.costume}]);if(L.held)parts.push(['hand',{held:L.held}]);
 const side=d==='left'||d==='right',flip=d==='right';
 for(const[kind,sub]of parts){const[c,pg]=mk(16,24);dressUp(pg,sub,flip?'left':d,f,L.skin||'#f1c9a5');outline(c);const src=flip?mirror(c):c;
  const fx=x=>flip?16-x:x;let dx,dy,dw,dh;
  if(kind==='head'){const[h0,h1]=side?[fx(4),fx(11)].sort((p,q)=>p-q):[4,12],[x0,y0,x1,y1]=a.head,lift=HAT_LIFT[sub.hat]||0,sx=(x1-x0+1)/(h1-h0),sy=(y1-y0+1)/8*(lift>1?.7:1);dx=x0-h0*sx;dy=Math.max(-sy*.3,y0-(1+lift)*sy);dw=16*sx;dh=24*sy}
  else if(kind==='body'){const[x0,y0,x1,y1]=a.body,sx=(x1-x0+1)/11,sy=(y1-y0+1)/21;dx=x0-3*sx;dy=y0-1*sy;dw=16*sx;dh=24*sy}
  else{const[,by0,,by1]=a.body,s2=(by1-by0)/22*.62,hx=side?fx(5):d==='up'?11:12;dx=a.hand[0]-hx*s2;dy=a.hand[1]-16*s2;dw=16*s2;dh=24*s2}
  g.imageSmoothingEnabled=false;g.drawImage(src,dx,dy,dw,dh)}}
// when the player art can't load (single-file copy), fall back to the old generated look
const FALLBACK_STYLE={ponytail:'bun',puffy:'bob',shaggy:'short',spiky:'short',buzz:'short'};
function procLook(L){const st=STYLE_MAP[L.style]||L.style;return Object.assign({},L,{style:FALLBACK_STYLE[st]||st,fem:L.fem!==undefined?L.fem:['long','ponytail'].includes(st)})}
// draw any icon/sprite into a box, smoothing only HD art (the procedural art stays crisp)
function art(g,src,x,y,w,h){g.imageSmoothingEnabled=!!src.hd;if(src.hd){g.imageSmoothingQuality='high';const k=Math.min(w/src.width,h/src.height),dw=src.width*k,dh=src.height*k;x+=(w-dw)/2;y+=(h-dh)/2;w=dw;h=dh}g.drawImage(src,x,y,w,h);g.imageSmoothingEnabled=false}
function itemArt(id){return hdItems[id]||itemIcon(id)}
function loadCustomSprites(){for(const[id,src]of Object.entries(SPRITE_FILES)){const im=new Image();im.onload=()=>{const out={down:[],left:[],right:[],up:[]};['down','left','right','up'].forEach((d,row)=>{for(let f=0;f<3;f++){const[c,g]=mk(16,24);g.drawImage(im,f*16,row*24,16,24,0,0,16,24);out[d].push(c)}});customSprites[id]=out;for(const n of npcs)if(n.id===id)n.spr=out};im.src=src}}

/* ===================== ART: collectibles (32x32) ===================== */
const itemCache={};
function itemIcon(id){if(itemCache[id])return itemCache[id];const[c,g]=mk(32,32);
 if(hdItems[id]){art(g,hdItems[id],0,0,32,32);return itemCache[id]=c}
 switch(id){
 case'mug':px(g,'#f4f1ea',6,9,17,18);px(g,'#ffffff',6,9,17,2);px(g,'#5a3420',7,10,15,2);px(g,'#d9d4c8',19,11,4,16);px(g,'#d9d4c8',7,26,15,1);px(g,'#f4f1ea',23,13,5,2);px(g,'#f4f1ea',26,13,2,10);px(g,'#f4f1ea',23,21,5,2);px(g,'#cf3a2a',6,16,17,2);for(let i=0;i<3;i++){px(g,'#ffffff',10+i*4,4-(i%2),1,3);px(g,'#ffffff',11+i*4,2+(i%2),1,2)}break;
 case'trifle':px(g,'#cfe6ef',6,8,20,18);px(g,'#fffaf0',7,8,18,3);px(g,'#7a4a2a',7,11,18,4);for(const x of[9,14,20])px(g,'#5cb85c',x,12,2,2);px(g,'#e8c98a',7,15,18,3);px(g,'#c0392b',7,18,18,3);px(g,'#f3e3b0',7,21,18,4);px(g,'#e04a5a',12,6,3,3);px(g,'#e04a5a',18,6,3,3);px(g,'#cfe6ef',12,26,8,2);px(g,'#cfe6ef',9,28,14,2);px(g,'#ffffff',7,9,1,15);break;
 case'painting':px(g,'#b8862e',2,3,28,24);px(g,'#e0b04a',2,3,28,2);px(g,'#7a5418',4,5,24,20);px(g,'#2b2a3f',5,6,22,18);ell(g,'#4a3a6a',12,14,7,6);ell(g,'#6a3a4a',21,17,5,5);px(g,'#3a5a4a',6,20,20,3);px(g,'#f2f2f2',10,11,4,3);px(g,'#f2f2f2',18,11,4,3);px(g,'#111',12,11,2,3);px(g,'#111',20,11,2,3);px(g,'#a33',12,17,8,1);px(g,'#a33',11,16,1,1);px(g,'#a33',20,16,1,1);px(g,'#3a2a10',14,27,4,3);break;
 case'turkey':px(g,'#d8d8e0',2,25,28,3);px(g,'#ececf2',2,25,28,1);ell(g,'#9a5422',16,19,11,7);ell(g,'#b86a2c',15,18,9,5);ell(g,'#d38a45',12,16,4,2);px(g,'#b86a2c',3,20,6,4);px(g,'#f4ead2',1,20,2,2);px(g,'#b86a2c',23,20,6,4);px(g,'#f4ead2',29,20,2,2);
  px(g,'#151515',9,13,6,3);px(g,'#151515',17,13,6,3);px(g,'#151515',15,13,2,1);px(g,'#3a3a4a',10,13,2,1);px(g,'#3a3a4a',18,13,2,1);px(g,'#c0262c',12,6,8,6);px(g,'#e0484c',12,6,8,1);px(g,'#24222a',15,5,2,1);px(g,'#e8b820',20,7,1,5);px(g,'#e8b820',19,11,3,2);break;
 case'dog':ell(g,'#f2f2ec',15,21,7,6);px(g,'#f2f2ec',11,10,8,14);ell(g,'#f2f2ec',15,9,5,5);px(g,'#f2f2ec',18,9,8,4);px(g,'#24222a',25,9,2,2);px(g,'#24222a',16,7,2,2);px(g,'#d8d8d0',10,3,3,6);px(g,'#d8d8d0',12,14,3,12);px(g,'#f2f2ec',9,25,5,3);px(g,'#f2f2ec',17,25,5,3);px(g,'#c9a24a',14,14,4,1);px(g,'#d8d8d0',2,27,28,2);break;
 case'hugsy':ell(g,'#24222a',16,17,9,11);ell(g,'#f4f1ea',16,19,6,8);px(g,'#f4f1ea',12,9,3,3);px(g,'#f4f1ea',17,9,3,3);px(g,'#24222a',13,10,1,1);px(g,'#24222a',18,10,1,1);px(g,'#f0a030',14,12,4,2);px(g,'#f0a030',10,27,5,2);px(g,'#f0a030',17,27,5,2);px(g,'#24222a',5,15,3,8);px(g,'#24222a',24,15,3,8);break;
 case'frame':px(g,'#e2b82a',5,5,22,22);px(g,'#f2d45a',5,5,22,2);for(const[x,y]of[[3,3],[25,3],[3,25],[25,25],[14,2],[14,27],[2,14],[27,14]])px(g,'#e2b82a',x,y,4,3);px(g,'#c89a1a',8,8,16,16);px(g,'#5b3a8c',11,11,10,10);px(g,'#24222a',14,14,4,4);break;
 case'cup':px(g,'#9a6a38',2,22,28,7);px(g,'#b8844a',2,22,28,2);px(g,'#7a4a28',2,28,28,1);px(g,'#8a8a92',15,21,2,2);px(g,'#e8b88a',12,13,8,9);px(g,'#3e8f45',12,16,8,6);px(g,'#e8b88a',10,16,2,4);px(g,'#e8b88a',20,16,2,4);ell(g,'#e8b88a',16,10,4,3);px(g,'#1a1a2a',14,9,1,1);px(g,'#1a1a2a',17,9,1,1);for(let i=0;i<7;i++)px(g,'#ff6fb0',12+i,1+(i%3),1,7);ell(g,'#ff6fb0',16,4,4,3);break;
 case'pants':px(g,'#1d1b22',9,4,14,6);px(g,'#1d1b22',9,10,6,19);px(g,'#1d1b22',17,10,6,19);px(g,'#5a5866',10,5,2,22);px(g,'#5a5866',18,11,2,16);px(g,'#9a98a8',10,8,1,6);px(g,'#0c0b10',9,4,14,1);px(g,'#8a8a96',15,5,2,2);break;
 case'armadillo':ell(g,'#8a8a8a',15,18,11,8);for(let x=8;x<24;x+=4)px(g,'#6a6a6a',x,11,1,14);ell(g,'#a8a8a8',27,20,3,3);px(g,'#24222a',28,19,1,1);px(g,'#a8a8a8',4,16,3,10);px(g,'#7a7a7a',8,25,4,4);px(g,'#7a7a7a',19,25,4,4);break;
 case'headshot':px(g,'#f4f1ea',5,3,22,26);px(g,'#cfd6dc',7,5,18,18);ell(g,'#8a6a5a',16,12,5,5);px(g,'#4a3426',11,6,10,4);px(g,'#3a4a6a',9,18,14,5);px(g,'#24222a',9,25,14,1);px(g,'#24222a',11,27,10,1);break;
 case'bone':ell(g,'#e8dcc0',8,9,4,4);ell(g,'#e8dcc0',11,7,3,3);ell(g,'#e8dcc0',24,23,4,4);ell(g,'#e8dcc0',21,25,3,3);for(let i=0;i<14;i++)px(g,'#e8dcc0',9+i,9+i,4,4);for(let i=0;i<14;i++)px(g,'#c9bc9e',10+i,12+i,2,1);break;
 case'card':px(g,'#f4f1ea',3,8,26,16);px(g,'#ffffff',3,8,26,2);px(g,'#3a5a8a',6,12,12,2);px(g,'#8a8a92',6,16,18,1);px(g,'#8a8a92',6,19,14,1);px(g,'#3a5a8a',22,11,4,4);break;
 case'bag':px(g,'#7a4a28',5,10,22,20);px(g,'#9a6438',5,10,22,2);px(g,'#5a3418',5,28,22,2);px(g,'#3a2414',10,4,2,7);px(g,'#3a2414',20,4,2,7);px(g,'#3a2414',10,4,12,2);px(g,'#f4f1ea',9,17,14,4);break;
 case'puck':ell(g,'#1c1c22',16,18,11,6);ell(g,'#3a3a44',16,15,11,6);ell(g,'#4a4a56',13,13,5,2);px(g,'#c0262c',13,14,6,2);px(g,'#3a5ab0',15,13,2,4);break;
 case'wig':ell(g,'#f0d070',16,15,12,11);ell(g,'#f8e090',13,10,6,5);for(let x=5;x<28;x+=3)px(g,'#d8b050',x,20+(x%2)*2,2,6);ell(g,'#f8e090',22,14,3,3);px(g,'#d8b050',8,26,16,2);break;
 case'umbrella':ell(g,'#c0262c',16,12,13,8);px(g,'#ffffff',4,12,25,8);ell(g,'#c0262c',16,12,13,8);for(let x=4;x<29;x+=6)ell(g,'#e04a4a',x+3,12,2,1);px(g,'#ffffff',0,0,0,0);px(g,'#3a3a44',15,12,2,15);px(g,'#3a3a44',12,26,4,2);px(g,'#3a3a44',12,24,2,2);px(g,'#3a3a44',15,2,2,3);break;
 case'hat':ell(g,'#1a3a8a',16,15,11,9);px(g,'#f4f1ea',5,13,22,4);px(g,'#f4f1ea',14,6,4,18);px(g,'#c0262c',5,14,22,2);px(g,'#c0262c',15,6,2,18);px(g,'#1a3a8a',4,22,24,4);px(g,'#c0262c',4,22,24,1);break;
 case'veil':px(g,'#f4f1ea',10,4,12,4);px(g,'#e8b820',11,3,10,2);for(let i=0;i<20;i++)px(g,i%2?'#ffffff':'#e8e8f0',8-i/4,8+i,16+i/2,1);ell(g,'#ff9ad0',16,6,2,2);break;
 case'paddle':ell(g,'#c0262c',13,13,10,10);ell(g,'#e04a4a',11,11,5,5);px(g,'#9a6438',19,20,4,9);px(g,'#7a4a28',20,22,3,8);ell(g,'#f4f1ea',27,6,3,3);break;
 case'shell':for(let i=0;i<9;i++)px(g,i%2?'#f2c0a0':'#f8dcc4',16-i*1.4,6+i*1.6,3+i*2.8,2);px(g,'#e0a080',13,22,6,4);for(let i=0;i<5;i++)px(g,'#d08a6a',8+i*4,9+Math.abs(i-2)*2,1,12-Math.abs(i-2)*2);break;
 case'cracker':ell(g,'#cfe6ef',16,18,12,11);ell(g,'#e6f4fa',16,18,10,9);px(g,'#5aa0d0',6,22,20,6);ell(g,'#e8a84a',16,18,6,3);px(g,'#e8a84a',21,16,4,5);px(g,'#24222a',13,17,1,1);px(g,'#ffffff',8,9,16,2);break;
 case'broom':for(let i=0;i<20;i++)px(g,'#9a6438',6+i,3+i,2,2);for(let i=0;i<8;i++)px(g,i%2?'#d8b050':'#c8a040',22+i*.5-4+i,20+i/2,3,10-i/2);px(g,'#7a4a28',20,20,6,3);break;
 case'porsche':px(g,'#c0262c',4,4,10,10);px(g,'#e8b820',7,7,4,4);px(g,'#8a8a92',14,8,6,2);px(g,'#c0c0c8',20,6,6,6);px(g,'#9a9aa4',22,12,3,14);px(g,'#9a9aa4',24,18,4,2);px(g,'#9a9aa4',24,22,3,2);break;
 case'album':px(g,'#5a2a3a',4,4,24,24);px(g,'#7a3a4a',4,4,24,3);px(g,'#3a1a2a',4,4,3,24);px(g,'#e8d8b0',11,10,12,10);px(g,'#9cc8e6',13,12,8,6);px(g,'#c9a24a',11,23,12,2);break;
 case'bootie':for(let i=0;i<3;i++){const x=3+i*9,c=['#9cc8e6','#ffb0c8','#f2d45a'][i];px(g,c,x,10+i*2,7,10);px(g,c,x,18+i*2,10,5);px(g,'#ffffff',x,10+i*2,7,2)}break;
 case'purse':px(g,'#e8c070',4,12,24,15);for(let k=0;k<14;k++)ell(g,'#3a2414',6+((k*7)%21),14+((k*5)%11),1,1);px(g,'#3a2414',10,5,2,8);px(g,'#3a2414',20,5,2,8);px(g,'#3a2414',10,5,12,2);px(g,'#c9a24a',14,12,4,3);break;
 case'comb':px(g,'#8a5a2a',4,10,24,6);px(g,'#b07a3a',4,10,24,2);for(let x=5;x<28;x+=2)px(g,'#8a5a2a',x,16,1,8);px(g,'#4a3426',8,26,16,3);px(g,'#4a3426',6,27,4,2);px(g,'#4a3426',22,27,4,2);break;
 case'ashtray':ell(g,'#6a8aa8',16,20,13,6);ell(g,'#4a6a88',16,18,10,4);px(g,'#f4f1ea',8,15,9,2);px(g,'#e05a2a',16,15,1,2);px(g,'#c0c0c8',18,4,1,10);px(g,'#d8d8e0',17,2,2,3);px(g,'#f4f1ea',14,17,6,1);break;
 case'nametag':px(g,'#c0262c',2,6,28,20);px(g,'#ffffff',4,13,24,11);px(g,'#ffffff',4,8,24,3);px(g,'#24222a',7,16,4,4);px(g,'#24222a',13,16,4,4);px(g,'#24222a',19,16,4,4);px(g,'#24222a',7,21,16,1);break;
 case'trophy':px(g,'#e8b923',9,5,14,10);px(g,'#f7d860',11,6,4,7);px(g,'#e8b923',5,7,4,2);px(g,'#e8b923',23,7,4,2);px(g,'#e8b923',5,7,2,6);px(g,'#e8b923',25,7,2,6);px(g,'#c99418',13,15,6,5);px(g,'#e8b923',11,20,10,3);px(g,'#5a3a1e',9,23,14,5);px(g,'#f4f4f8',12,25,8,1);break;
 case'polaroid':px(g,'#f4f4f8',5,3,22,26);px(g,'#9cc8e6',7,5,18,16);px(g,'#d9782f',9,14,14,5);px(g,'#ef9a4e',9,14,14,1);px(g,'#7a4a28',7,19,18,2);px(g,'#c0262c',22,6,2,2);break;
 case'key':px(g,'#e2b82a',4,10,12,12);px(g,'#f2d45a',4,10,12,2);px(g,'#5b3a8c',8,14,4,4);px(g,'#e2b82a',16,14,13,4);px(g,'#e2b82a',22,18,3,5);px(g,'#e2b82a',27,18,2,4);px(g,'#c89a1a',16,17,13,1);break;
 }
 outline(c);return itemCache[id]=c}
function silhouette(src){const[c,g]=mk(src.width,src.height);g.drawImage(src,0,0);g.globalCompositeOperation='source-atop';px(g,'#3d3352',0,0,src.width,src.height);c.hd=src.hd;return c}

/* ===================== Picture questions (128x80 scenes, shown at 2x) ===================== */
const picCache={};
function picFloor(g,t,y0,y1=80){for(let y=y0;y<y1;y+=16)for(let x=0;x<128;x+=16)g.drawImage(tile(t,x/16,y/16),x,y)}
function picWall(g,t,h){for(let y=0;y<h;y+=16)for(let x=0;x<128;x+=16)g.drawImage(tile(t,x/16,y/16),x,y)}
const OB=(k,o)=>makeObj(Object.assign({kind:k,x:0,y:0},o||{})).c;
function put(g,c,x,y,sc=1){g.drawImage(c,x,y,c.width*sc,c.height*sc)}
const PIC_HD={armadillo:['armadillo','wallC','wood',40],box:['box','wallP','wood',34],cat:['sphynx','wallP','wood',40],chickduck:['chickduck','wallC','wood',30],
 cup:['cup','sky','grass',30],dino:['bone','wallH','marble',36],hat:['hat','skyL','walk',44],hugsy:['hugsy','wallC','wood',36],paddle:['paddle','sea','sand',24],
 poker:['poker','wallC','wood',36],rosita:['recliners','wallC','wood',30],sandwich:['moistmaker','wallC','carpet',40],smellycat:['smellycat','brick','road',50],
 taxi:['grantaxi','wallH','road',30],trifle:['trifle','wallP','wood',40],turkey:['turkey','wallP','tileK',36],wig:['wig','wallH','tileD',36],pants:['pants','tileK','tileD',48],dog:['dog','wallC','wood',36]};
function drawPicHD(key){const[id,wall,floor,hz]=PIC_HD[key],im=hdItems[id];const[b,bg]=mk(128,80);
 if(wall==='sky')px(bg,'#9cc8e6',0,0,128,hz);else if(wall==='skyL')px(bg,'#9cb0c8',0,0,128,hz);else if(wall==='sea'){px(bg,'#9cd0ee',0,0,128,hz*.55);px(bg,'#2f6fa8',0,hz*.55,128,hz*.45)}else picWall(bg,wall,hz);
 picFloor(bg,floor,hz);px(bg,'rgba(0,0,0,.18)',0,hz,128,2);
 const[c,g]=mk(256,160);g.imageSmoothingEnabled=false;g.drawImage(b,0,0,256,160);
 const H=128,k=Math.min(H/im.height,200/im.width),w=im.width*k,h=im.height*k,x=128-w/2,y=Math.min(150,hz*2+70)-h;
 g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(128,y+h-3,w*.42,7,0,0,Math.PI*2);g.fill();
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,x,y,w,h);g.imageSmoothingEnabled=false;return picCache[key]=c}
function drawPic(key){if(picCache[key])return picCache[key];if(PIC_HD[key]&&hdItems[PIC_HD[key][0]])return drawPicHD(key);const[c,g]=mk(128,80);
 switch(key){
 case'door20':{picWall(g,'wallH',64);picFloor(g,'wood',64);px(g,'#5c3a22',0,52,128,12);const d=OB('walldoor',{color:'#5b3a8c',num:'20',frame:true});put(g,d,48,-4,2);break}
 case'jcapt':{picWall(g,'wallC',32);picFloor(g,'wood',32);px(g,'#5c3a22',0,28,128,6);put(g,OB('tv'),40,6,1.5);put(g,OB('dogstatue'),94,2,1.5);put(g,OB('recliner'),28,40,1.5);put(g,OB('recliner'),70,40,1.5);break}
 case'perk':{picWall(g,'brick',30);picFloor(g,'wood',30);px(g,'#5c3a22',0,28,128,4);put(g,OB('window',{w:3}),72,0,1);put(g,OB('rug',{w:6,h:3}),12,36);put(g,OB('couch',{w:4}),24,26,1.25);put(g,OB('coffee',{w:2}),40,60);put(g,OB('armchair'),4,48);put(g,OB('armchair'),100,48);break}
 case'turkey':{picWall(g,'wallP',36);picFloor(g,'tileK',36);px(g,'#7a4a28',14,50,100,8);px(g,'#9a6438',14,50,100,2);put(g,itemIcon('turkey'),32,4,2);break}
 case'pants':{picWall(g,'tileK',48);picFloor(g,'tileD',48);px(g,'#f4f4f8',4,44,40,8);put(g,itemIcon('pants'),40,4,2);px(g,'#f4f1ea',100,40,12,22);px(g,'#9cc8e6',100,46,12,6);px(g,'#e8e2d4',8,30,14,14);px(g,'#ffffff',8,30,14,3);break}
 case'armadillo':{picWall(g,'wallC',40);picFloor(g,'wood',40);px(g,'#c9a24a',6,30,26,3);for(let i=0;i<9;i++){px(g,'#e8e2d4',7+i*3,18,1,12);px(g,'#ffd84a',7+i*3,15,1,3)}px(g,'#e8e2d4',18,12,1,18);put(g,itemIcon('armadillo'),48,10,2.2);break}
 case'chickduck':{picWall(g,'wallC',30);picFloor(g,'wood',30);const d=charSprites({animal:'duck'}),k=charSprites({animal:'chick'});put(g,d.right[0],24,16,3);put(g,k.left[0],70,26,2.5);break}
 case'taxi':{picWall(g,'wallH',30);picFloor(g,'road',30);px(g,'#c9c3b5',0,30,128,8);const t=carSprite('#f2c230',false).l;put(g,t,14,26,3);px(g,'#e05a7a',86,34,4,4);px(g,'#ffffff',90,36,3,3);break}
 case'trifle':{picWall(g,'wallP',40);picFloor(g,'wood',40);px(g,'#7a4a28',10,56,108,8);px(g,'#9a6438',10,56,108,2);put(g,itemIcon('trifle'),32,-2,2);break}
 case'dog':{picWall(g,'wallC',36);picFloor(g,'wood',36);px(g,'#5c3a22',0,32,128,6);put(g,OB('dogstatue'),44,-6,2.6);break}
 case'cup':{px(g,'#9cc8e6',0,0,128,30);picFloor(g,'grass',30);px(g,'#ffffff',0,52,128,2);put(g,itemIcon('cup'),32,2,2);break}
 case'hat':{px(g,'#9cb0c8',0,0,128,44);picFloor(g,'walk',44);put(g,OB('clocktower'),2,-18,1);put(g,OB('bus'),84,22,.9);put(g,itemIcon('hat'),36,6,2);break}
 case'cat':{picWall(g,'wallP',40);picFloor(g,'wood',40);px(g,'#e05a7a',30,58,68,8);const b='#e8b8a8',d='#d09888';ell(g,b,64,50,20,12);ell(g,b,64,30,13,11);for(const sx of[-1,1]){for(let i=0;i<10;i++)px(g,b,64+sx*(7+i/2)-1,12+i,3,2);px(g,'#f0c8c8',64+sx*10,16,2,5)}
  px(g,'#7ab04a',57,28,4,4);px(g,'#7ab04a',67,28,4,4);px(g,'#1a1a2a',58,29,2,2);px(g,'#1a1a2a',68,29,2,2);px(g,d,62,34,4,2);for(let i=0;i<3;i++)px(g,d,56,22+i*2,16,1);for(let i=0;i<4;i++)px(g,d,50+i*8,44,1,10);for(let i=0;i<16;i++)px(g,b,84+i,52-i/2,2,2);break}
 case'hugsy':{picWall(g,'wallC',36);picFloor(g,'wood',36);px(g,'#5a7aa8',10,34,108,30);px(g,'#7a9ac8',10,34,108,4);px(g,'#f4f1ea',14,30,36,12);put(g,itemIcon('hugsy'),56,8,2);break}
 case'sandwich':{picWall(g,'wallC',40);picFloor(g,'carpet',40);px(g,'#e8e8ec',96,6,26,60);px(g,'#ffffff',96,6,6,60);px(g,'#b8b8c0',96,30,26,1);
  const y=38;ell(g,'#f4f1ea',48,60,30,6);px(g,'#e8c07a',22,y,52,6);px(g,'#c0603a',20,y+6,56,4);px(g,'#7a4a28',22,y+10,52,6);px(g,'#5a3418',24,y+11,48,3);px(g,'#7ab04a',20,y+16,56,2);px(g,'#c0603a',22,y+18,52,3);px(g,'#e8c07a',22,y+21,52,6);px(g,'#f4e8c0',22,y,52,1);break}
 case'dino':{picWall(g,'wallH',36);picFloor(g,'marble',36);put(g,OB('dino'),8,6,1.15);break}
 case'poker':{px(g,'#a24a32',0,0,128,80);for(let x=6;x<128;x+=30)for(let y=6;y<80;y+=34){px(g,'#d8cbb0',x-1,y-1,22,28);px(g,'#2e3a52',x,y,20,26)}px(g,'#e9c46a',66,40,20,26);
  for(let i=0;i<60;i++){const x=4+i*1.1,y=78-i*.5;px(g,i%14<12?'#c8a06a':'#8a6a3a',x,y,2,2)}px(g,'#8a6a3a',68,47,4,4);px(g,'#c8a06a',70,49,8,2);break}
 case'wig':{picWall(g,'wallH',36);picFloor(g,'tileD',36);px(g,'#c0262c',6,40,40,20);put(g,OB('jukebox'),100,10,1.3);put(g,itemIcon('wig'),34,4,2);break}
 case'paddle':{px(g,'#2f6fa8',0,0,128,24);picFloor(g,'sand',24);put(g,OB('palm'),88,-10,1.2);put(g,OB('pingpong'),18,34,1.6);put(g,itemIcon('paddle'),60,30,1.4);break}
 case'smellycat':{picWall(g,'brick',50);picFloor(g,'road',50);px(g,'#6a6a72',8,40,30,22);px(g,'#4a4a56',8,40,30,3);const f='#c8a070',fd='#a0784a';ell(g,f,74,56,16,9);ell(g,f,62,44,9,8);px(g,f,55,34,3,5);px(g,f,66,34,3,5);px(g,'#1a1a2a',58,42,2,2);px(g,'#1a1a2a',64,42,2,2);px(g,fd,60,47,4,1);for(let i=0;i<8;i++)px(g,fd,64+i*4,50+(i%2)*3,2,6);for(let i=0;i<10;i++)px(g,f,88+i,52-i*1.2,2,2);
  for(const[x,y]of[[80,26],[94,30],[70,22]])for(let i=0;i<10;i++)px(g,'#7ab04a',x+Math.round(Math.sin(i)*2),y-i,1,1);px(g,'#a0602a',100,46,16,12);px(g,'#3a2414',106,49,4,4);px(g,'#6a4428',114,30,3,18);break}
 case'box':{picWall(g,'wallP',34);picFloor(g,'wood',34);px(g,'#7a4a28',0,60,128,8);px(g,'#c9a06a',40,16,50,48);px(g,'#b08850',40,16,50,6);px(g,'#a07840',86,16,4,48);px(g,'#1a1a2a',54,30,6,4);px(g,'#1a1a2a',70,30,6,4);px(g,'#e8d8a8',40,40,50,2);break}
 case'rosita':{picWall(g,'wallC',30);picFloor(g,'wood',30);put(g,OB('recliner'),40,4,2.6);break}
 case'perkout':{picWall(g,'wallC',36);picFloor(g,'wood',36);for(let i=0;i<4;i++){px(g,'#f4f4f8',8+i*30,10+(i%2)*6,24,28);px(g,['#c9e2f0','#f2d45a','#e8b8a8','#b8e0b0'][i],10+i*30,12+(i%2)*6,20,18)}px(g,'#c0262c',58,10,4,4);break}
 }
 outline(c,'#1c1626');return picCache[key]=c}

/* ===================== Audio ===================== */
let AC=null,muted=false;
function beep(f,d=.08,type='square',v=.035,when=0){if(muted)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime+when,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
const SFX={blip:()=>beep(900,.02,'square',.015),ok:()=>{beep(660,.08);beep(990,.14,'square',.035,.08)},bad:()=>{beep(220,.2,'sawtooth',.03);beep(180,.2,'sawtooth',.03,.1)},
 door:()=>{beep(330,.06);beep(495,.08,'square',.03,.07)},item:()=>[523,659,784,1047,1319].forEach((f,i)=>beep(f,.14,'triangle',.07,i*.1)),honk:()=>{beep(392,.12,'sawtooth',.025);beep(370,.14,'sawtooth',.025,.16)},bump:()=>beep(110,.05,'square',.02),sel:()=>beep(700,.04,'triangle',.04)};

/* ===================== Music: original pieces, synthesized (v1.9.6) =====================
 * Six short loops written for the game, played by small Web Audio instruments: a plucked guitar
 * (Karplus–Strong), an electric piano (FM), bass, vibes/celesta and light drums. */
const MAJ=[0,4,7],MIN=[0,3,7],MAJ7=[0,4,7,11],MIN7=[0,3,7,10],DOM7=[0,4,7,10],M9=[0,3,7,10,14],D9=[0,4,7,10,14],SUS=[0,5,7,10];
const C_=(r,q)=>({r,q});
// melody notes: [step (16ths), midi, length in 16ths]
const PIECES={
 village:{bpm:108,swing:0,chords:[C_(62,MAJ),C_(57,MAJ),C_(59,MIN),C_(55,MAJ),C_(62,MAJ),C_(57,MAJ),C_(55,MAJ),C_(57,MAJ)],style:'jangle',
  mel:[[[0,78,4],[4,81,2],[6,81,2],[8,83,4],[12,81,4]],[[0,76,6],[6,73,2],[8,76,4]],[[0,74,4],[4,78,4],[8,83,6],[14,81,2]],[[0,79,4],[4,78,2],[6,76,2],[8,74,8]],
   [[0,78,4],[4,81,2],[6,83,2],[8,86,4],[12,83,4]],[[0,85,6],[6,81,2],[8,76,8]],[[0,83,4],[4,81,4],[8,79,4],[12,78,4]],[[0,76,6],[6,78,2],[8,76,4]]],lead:'gtr'},
 perk:{bpm:92,swing:.55,chords:[C_(53,MAJ7),C_(50,DOM7),C_(55,MIN7),C_(48,DOM7),C_(57,MIN7),C_(50,DOM7),C_(55,MIN7),C_(53,MAJ7)],style:'jazz',
  mel:[[[0,84,4],[4,81,2],[6,79,2],[8,81,8]],[[0,78,4],[4,81,4],[8,84,8]],[[0,82,4],[4,81,2],[6,79,2],[8,77,4],[12,74,4]],[[0,76,6],[6,79,2],[8,82,8]],
   [[0,84,4],[4,86,2],[6,84,2],[8,81,8]],[[0,78,4],[4,81,4],[8,86,8]],[[0,82,4],[4,81,4],[8,79,4],[12,76,4]],[[0,77,12]]],lead:'vibes'},
 home:{bpm:76,swing:0,chords:[C_(48,MAJ7),C_(52,MIN7),C_(53,MAJ7),C_(53,[0,3,7,9]),C_(48,MAJ7),C_(57,MIN7),C_(50,MIN7),C_(55,SUS)],style:'mellow',mel:null},
 city:{bpm:100,swing:0,chords:[C_(52,M9),C_(52,M9),C_(57,D9),C_(57,D9),C_(52,M9),C_(52,M9),C_(48,MAJ7),C_(47,DOM7)],style:'funk',mel:null},
 travel:{bpm:100,swing:0,chords:[C_(55,MAJ),C_(48,MAJ),C_(55,MAJ),C_(50,MAJ),C_(52,MIN),C_(48,MAJ),C_(50,MAJ),C_(55,MAJ)],style:'island',
  mel:[[[0,83,4],[4,86,4],[8,83,2],[10,81,2],[12,79,4]],[[0,88,4],[4,84,4],[8,88,8]],[[0,86,4],[4,83,4],[8,79,8]],[[0,81,6],[6,83,2],[8,81,4],[12,78,4]],
   [[0,79,4],[4,83,4],[8,88,8]],[[0,88,4],[4,86,4],[8,84,8]],[[0,81,4],[4,83,4],[8,84,4],[12,81,4]],[[0,79,16]]],lead:'steel'},
 holiday:{bpm:120,swing:0,chords:[C_(48,MAJ),C_(57,MIN),C_(53,MAJ),C_(55,DOM7),C_(48,MAJ),C_(57,MIN),C_(53,MAJ),C_(55,DOM7)],style:'holiday',
  mel:[[[0,76,2],[2,79,2],[4,84,4],[8,83,2],[10,81,2],[12,79,4]],[[0,81,4],[4,84,4],[8,76,8]],[[0,77,2],[2,81,2],[4,84,4],[8,86,4],[12,84,4]],[[0,83,4],[4,79,4],[8,74,8]],
   [[0,76,2],[2,79,2],[4,84,4],[8,83,2],[10,81,2],[12,79,4]],[[0,81,2],[2,83,2],[4,84,4],[8,88,8]],[[0,86,4],[4,84,2],[6,81,2],[8,77,4],[12,86,4]],[[0,84,12]]],lead:'celesta'}};
const TUNE_PIECE={village:'village',perk:'perk',home:'home',city:'city',travel:'travel'};
const music={name:null,P:null,step:0,next:0,bus:null};
const mf=m=>440*Math.pow(2,(m-69)/12);
function musicBus(){if(music.bus)return music.bus;const comp=AC.createDynamicsCompressor(),g=AC.createGain(),rv=AC.createConvolver(),rg=AC.createGain(),sr=AC.sampleRate,len=sr*1.8,ir=AC.createBuffer(2,len,sr);
 for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3)}rv.buffer=ir;rg.gain.value=.22;g.gain.value=.55;
 g.connect(comp);g.connect(rv);rv.connect(rg);rg.connect(comp);comp.connect(AC.destination);return music.bus=g}
let noiseBuf=null;function noiseBuffer(){if(noiseBuf)return noiseBuf;const sr=AC.sampleRate,b=AC.createBuffer(1,sr,sr),d=b.getChannelData(0);for(let i=0;i<sr;i++)d[i]=Math.random()*2-1;return noiseBuf=b}
const ksCache={};
function ksBuf(m,dur,bright){const k=m+'|'+dur+'|'+bright;if(ksCache[k])return ksCache[k];const sr=AC.sampleRate,f=mf(m),Nf=sr/f-.5,N=Math.floor(Nf),fr=Nf-N,len=Math.floor(sr*dur),b=AC.createBuffer(1,len,sr),d=b.getChannelData(0);
 // Karplus–Strong with a fractional delay so every string is in tune (period = Nf + the half sample the averaging adds)
 let lp=0;for(let i=0;i<=N+1&&i<len;i++){const x=Math.random()*2-1;lp=lp+(x-lp)*bright;d[i]=lp}
 const decay=.994+.005*Math.min(1,48/m),rd=p=>{const i0=Math.floor(p),q=p-i0;return(d[i0]||0)*(1-q)+(d[i0+1]||0)*q};
 for(let i=N+2;i<len;i++){const p=i-Nf;d[i]=decay*.5*(rd(p)+rd(p-1))}return ksCache[k]=b}
function out(t,v){const g=AC.createGain();g.gain.setValueAtTime(v,t);g.connect(musicBus());return g}
function pluck(m,t,v,dur=1.4,bright=.55){const s=AC.createBufferSource();s.buffer=ksBuf(m,dur,bright);s.connect(out(t,v));s.start(t)}
function epiano(m,t,v,d=1.6){const c=AC.createOscillator(),mo=AC.createOscillator(),mg=AC.createGain(),g=out(t,0);c.frequency.value=mf(m);mo.frequency.value=mf(m);
 mg.gain.setValueAtTime(mf(m)*2.2,t);mg.gain.exponentialRampToValueAtTime(mf(m)*.3,t+.6);mo.connect(mg).connect(c.frequency);c.connect(g);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);c.start(t);mo.start(t);c.stop(t+d+.05);mo.stop(t+d+.05)}
function bell(m,t,v,d=1.2,parts=[[1,1],[2.76,.35],[5.4,.12]]){for(const[r,a]of parts){const o=AC.createOscillator(),g=out(t,0);o.type='sine';o.frequency.value=mf(m)*r;g.gain.setValueAtTime(v*a,t);g.gain.exponentialRampToValueAtTime(.0001,t+d/r**.5);o.connect(g);o.start(t);o.stop(t+d+.05)}}
function vibes(m,t,v,d=1.4){const o=AC.createOscillator(),g=out(t,0),tr=AC.createOscillator(),tg=AC.createGain();o.type='sine';o.frequency.value=mf(m);tr.frequency.value=5.5;tg.gain.value=v*.35;tr.connect(tg).connect(g.gain);
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);o.start(t);tr.start(t);o.stop(t+d+.05);tr.stop(t+d+.05)}
function bass(m,t,v,d=.45){const o=AC.createOscillator(),o2=AC.createOscillator(),f=AC.createBiquadFilter(),g=out(t,0);o.type='triangle';o2.type='sine';o.frequency.value=o2.frequency.value=mf(m);
 f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(180,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 o.connect(f);o2.connect(f);f.connect(g);o.start(t);o2.start(t);o.stop(t+d+.05);o2.stop(t+d+.05)}
function drum(kind,t,v){if(kind==='kick'){const o=AC.createOscillator(),g=out(t,v);o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);o.start(t);o.stop(t+.2);return}
 const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=out(t,v);s.buffer=noiseBuffer();const P={snare:['bandpass',2200,.14],brush:['bandpass',3200,.26],hat:['highpass',7500,.035],shaker:['highpass',5200,.06],ride:['highpass',6000,.3],bells:['highpass',8000,.14]}[kind];
 f.type=P[0];f.frequency.value=P[1];g.gain.setValueAtTime(kind==='brush'||kind==='shaker'?0:v,t);if(kind==='brush'||kind==='shaker')g.gain.linearRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+P[2]);
 s.connect(f).connect(g);s.start(t,Math.random()*.5);s.stop(t+P[2]+.02);if(kind==='bells')bell(98,t,v*.4,.15,[[1,1],[1.5,.6]])}
function voicing(c,lo){return c.q.map(i=>{let n=c.r+i;while(n<lo)n+=12;return n})}
// one 16th step of the current piece
function playStep(P,bar,st,t,loop){const c=P.chords[bar],spb=60/P.bpm/4,beat=st%4===0;
 const melOn=P.mel&&loop%2===1,mel=melOn&&P.mel[bar].filter(n=>n[0]===st);
 if(P.style==='jangle'){const v=voicing(c,55),arp=[v[0],v[2],v[0]+12,v[1]+12,v[2],v[1]+12,v[0]+12,v[2]];if(st%2===0)pluck(arp[(st/2)%8],t,.11,1.6,.6);
  if(st===0||st===8)v.forEach((n,i)=>pluck(n+12,t+i*.012,.05,1.2,.4));
  if(st===0||st===8)bass(c.r-12,t,.32,.5);if(st===6||st===14)bass(c.r-12+(st===14?7:0),t,.22,.3);
  if(st===0||st===8||st===10)drum('kick',t,.32);if(st===4||st===12)drum('snare',t,.12);if(st%2===0)drum('hat',t,.05)}
 else if(P.style==='jazz'){const v=voicing(c,58);if(st===2||st===10)v.slice(1).forEach(n=>epiano(n,t,.05,1.1));
  if(beat){const walk=[c.r,c.r+(c.q[1]),c.r+7,P.chords[(bar+1)%8].r+(st===12?-1:0)];bass(walk[st/4]-12,t,.3,.55)}
  if(st===0||st===8||st===4||st===12)drum('ride',t,.05);if(st===6||st===14)drum('ride',t,.035);if(st===4||st===12)drum('brush',t,.06)}
 else if(P.style==='mellow'){const v=voicing(c,55);if(st===0)v.forEach((n,i)=>epiano(n,t+i*.02,.045,2.6));
  const arp=[v[0]+12,v[1]+12,v[2]+12,v[3]!==undefined?v[3]+12:v[0]+24];if(st%4===2)pluck(arp[(st>>2)%4],t,.07,2,.35);if(st===0)bass(c.r-12,t,.22,1.2);if(st%4===0)drum('shaker',t,.025)}
 else if(P.style==='funk'){const v=voicing(c,60);if(st===4||st===12||st===7)v.slice(0,4).forEach((n,i)=>pluck(n,t+i*.006,.06,.22,.8));
  const bl=[[0,0],[3,12],[6,7],[8,0],[10,12],[13,10]];for(const[s2,iv]of bl)if(s2===st)bass(c.r-12+iv,t,.3,.25);
  if(st===0||st===6||st===10)drum('kick',t,.34);if(st===4||st===12)drum('snare',t,.14);drum('hat',t,st%2?.025:.045)}
 else if(P.style==='island'){const v=voicing(c,64);if([0,4,6,10,12,14].includes(st))v.forEach((n,i)=>pluck(n,t+i*.01*(st%4===0?1:-1)+.03,.06,.7,.75));
  if([0,6,8,14].includes(st))bass(c.r-12+(st===14?7:0),t,.26,.4);drum('shaker',t,st%2?.02:.035)}
 else if(P.style==='holiday'){const v=voicing(c,60);if(st%4===2)v.forEach(n=>bell(n,t,.03,.5,[[1,1],[2,.2]]));if(st===0||st===8)bass(c.r-12,t,.26,.4);if(st%2===0)drum('bells',t,.04);if(st===0||st===8)drum('kick',t,.2)}
 if(mel&&mel.length)for(const[,m,len]of mel){const d=len*spb*1.3;
  if(P.lead==='gtr')pluck(m,t,.13,Math.max(.8,d+.6),.5);else if(P.lead==='vibes')vibes(m,t,.07,Math.max(.9,d+.5));else if(P.lead==='steel')bell(m,t,.08,Math.max(.6,d),[[1,1],[2,.3],[3,.1]]);else bell(m,t,.07,Math.max(.8,d+.4))}}
function setTune(name){let key=TUNE_PIECE[name]||'city';const sea=season();if(sea==='winter'&&new Date().getMonth()===11&&(key==='village'||key==='city'))key='holiday';
 if(music.name===key)return;music.name=key;music.P=PIECES[key];music.step=0;if(AC)music.next=AC.currentTime+.2}
function musicTick(){if(!AC||!music.P||muted||state==='title')return;const P=music.P,spb=60/P.bpm/4;if(music.next<AC.currentTime)music.next=AC.currentTime+.05;
 while(music.next<AC.currentTime+.25){const st=music.step%16,bar=(music.step>>4)%8,loop=music.step>>7;const sw=(P.swing&&(st%4===2))?P.swing*spb*.66:0;
  try{playStep(P,bar,st,music.next+sw,loop)}catch(e){}music.next+=spb;music.step++}}
setInterval(musicTick,60);

/* ===================== Save ===================== */
let S=null;
function freshSave(name,look){return{v:1,name,look,items:{},stars:0,seen:{},zone:'village',x:15,y:10,dir:'up',talked:{},diff:pick.diff||'fan'}}
const DIFFS=[['casual','Casual','Mostly well-known moments. Great for a warm-up.'],['fan','Fan','The full mix, tough questions included.'],['super','Super Fan','Deep cuts only: cameos, quotes, seasons, ages. Worth more stars.']];
const qTags=q=>q.t.split(' ');const qStars=q=>{const t=qTags(q);return t.includes('sf')?3:t.includes('hard')?2:1};
function diffNote(d){return(DIFFS.find(x=>x[0]===d)||DIFFS[1])[2]}
function diffButtons(id,cur,onPick){const el=$(id);if(!el)return;el.innerHTML=DIFFS.map(([k,l])=>`<button data-k="${k}" title="${esc(diffNote(k))}" class="${k===cur?'on':''}">${l}</button>`).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{SFX.sel();onPick(b.dataset.k)})}
function setupHelpDiff(){if(!S)return;S.diff=S.diff||'fan';diffButtons('#hDiff',S.diff,k=>{S.diff=k;save();setupHelpDiff()});$('#hDiffNote').textContent=diffNote(S.diff)}
/* Profiles: every player on this device gets their own save, all kept in one store. */
const PKEY='friendsTrivia_profiles';
function loadStore(){let st=null;try{st=JSON.parse(localStorage.getItem(PKEY)||'null')}catch(e){}if(!st||!st.saves)st={cur:null,saves:{},imports:{}};st.imports=st.imports||{};
 try{const old=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(old&&old.v===1&&!st.saves[old.name]){st.saves[old.name]=old;st.cur=old.name}}catch(e){}return st}
function writeStore(st){try{localStorage.setItem(PKEY,JSON.stringify(st))}catch(e){}}
function save(){if(!S)return;S.zone=Zn?Zn.id:S.zone;S.x=player.x;S.y=player.y;S.dir=player.dir;S.updated=Date.now();const st=loadStore();st.saves[S.name]=S;st.cur=S.name;writeStore(st);try{localStorage.removeItem(SAVE_KEY)}catch(e){}}
function loadSave(){const st=loadStore();return st.cur&&st.saves[st.cur]||null}

/* ===================== Zones, collision, movement ===================== */
let Zn=null,solid=null,npcs=[],taxis=[],state='title',fadeT=0,clock=0;
const player={x:0,y:0,px:0,py:0,fx:0,fy:0,dir:'down',moving:false,t:0,step:0,sit:null,spr:null};
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},OPP={up:'down',down:'up',left:'right',right:'left'};
function rectT(x,y,w,h){const a=[];for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)a.push([i,j]);return a}
function fp(o){switch(o.kind){case'building':return rectT(o.x,o.y,o.w,o.h);
 case'couch':case'counter':case'kcounter':case'dtable':case'dinercounter':case'backcounter':return rectT(o.x,o.y,o.w,1);case'dinertable4':return rectT(o.x,o.y,3,2);case'tv':case'foosball':case'carcover':case'flat':case'cubicle':case'rack':case'booth':case'hospbed':case'gatedesk':case'pingpong':case'cab':return rectT(o.x,o.y,6,1);case'clocktower':return rectT(o.x,o.y,2,1);case'bus':return rectT(o.x,o.y,11,1);case'seats':case'canoe':return rectT(o.x,o.y,3,1);case'dino':return rectT(o.x,o.y,6,2);case'fountain':return rectT(o.x,o.y,3,2);case'car':case'grantaxi':return rectT(o.x-2,o.y,6,1);case'bench':case'coffee':return rectT(o.x,o.y,2,1);case'barricade':return rectT(o.x,o.y,o.w||4,1);
 case'subway':return rectT(o.x,o.y,2,2);case'bed':return rectT(o.x,o.y,2,2);case'dining':return rectT(o.x,o.y,3,2);case'rockmound':return rectT(o.x,o.y,6,2);case'entertain':return o.face?rectT(o.x,o.y,1,o.h||3):rectT(o.x,o.y,2,1);case'bathtub':case'desk':return rectT(o.x,o.y,2,1);
 case'menuboard':case'wallclock':case'splat':case'mural':case'flag':case'wreath':case'drapewindow':case'rug':case'wallsign':case'menu':case'window':case'frame':case'walldoor':case'bigwindow':case'board':case'towel':case'poster':case'banner':return[];default:return[[o.x,o.y]]}}
function setSolid(x,y,v){if(x>=0&&y>=0&&x<Zn.w&&y<Zn.h)solid[y*Zn.w+x]=v}
function gAt(x,y){return Zn.g[y*Zn.w+x]}
function isDoor(x,y){return Zn.doors.some(d=>d.x===x&&d.y===y)}
function loadZone(id,x,y,dir,nosave){Zn=ZONES[id];const eggNpcs=spawnEggs(nosave);solid=new Uint8Array(Zn.w*Zn.h);
 for(let i=0;i<Zn.g.length;i++)if(SOLID_T.has(Zn.g[i]))solid[i]=1;
 for(const o of Zn.objs){if(!o.spr)o.spr=makeObj(o);for(const[tx,ty]of fp(o))setSolid(tx,ty,1)}
 for(const d of Zn.doors)setSolid(d.x,d.y,0);
 for(const o of Zn.objs)if(o.kind==='subway')for(const[tx,ty]of fp(o))if(!Zn.acts.some(a=>a.x===tx&&a.y===ty))Zn.acts.push({x:tx,y:ty,type:'subway'});
 npcs=Zn.npcs.map(n=>Object.assign({},n,{px:n.x*16,py:n.y*16,home:{x:n.x,y:n.y,dir:n.dir},moving:false,t:0,wait:.5+R()*3,spr:charSprites(n.look,n.id)}));
 for(const e of eggNpcs)if(!npcs.some(n=>n.x===e.x&&n.y===e.y))npcs.push(Object.assign(e,{px:e.x*16,py:e.y*16,home:{x:e.x,y:e.y,dir:e.dir},moving:false,t:0,wait:1+R()*3,spr:charSprites(e.look)}));
 for(const e of EGGS)if(e.swap&&eggsHere.includes(e.id)){const n=npcs.find(q=>q.id===e.swap.npc);if(n){n.look=Object.assign({},n.look,e.look);n.spr=charSprites(n.look);n.egg=e.id}}
 if(S&&S.items)addFinaleCast();setTune(Zn.tune||'city');
 taxis=[];let k=0;for(const tr of Zn.taxiRows)for(let i=0;i<tr.n;i++){const taxi=(k++%3)!==2;taxis.push({row:tr.row,dir:tr.dir,x:(i+.3+R()*.4)*Zn.w*16/tr.n,sp:44+R()*16,honk:0,taxi,model:taxi?(k%2?'90':''):CAR_MODELS[k%4],col:taxi?'#f2c230':['#3b6fb6','#8f2f2f','#6a8f4a','#c9c9cf'][k%4],
  rows:tr.dir<0?[tr.row-1,tr.row]:[tr.row-1,tr.row],by:Zn.laneY?(tr.dir<0?Zn.laneY-3:Zn.laneY+38):tr.row*16+17})}
 player.x=player.fx=x;player.y=player.fy=y;player.px=x*16;player.py=y*16;player.dir=dir;player.moving=false;player.sit=null;clickPath=null;clickMark=null;
 $('#zoneTag').textContent=Zn.name;spawnWalkers();if(!nosave){S.zone=id;save()}}
function taxiAt(x,y){return taxis.some(t=>t.rows.includes(y)&&x*16<t.x+CAR_LEN&&x*16+16>t.x)}
function npcAt(x,y,skip){return npcs.find(n=>n!==skip&&n.x===x&&n.y===y)}
function blocked(x,y){if(x<0||y<0||x>=Zn.w||y>=Zn.h)return true;return!!(solid[y*Zn.w+x]||npcAt(x,y)||taxiAt(x,y))}
function heldDir(){return dirStack.length?dirStack[dirStack.length-1]:null}
let bumpT=0;
let subwayArmed=true,subwayTile=null;
function updPlayer(dt){if(!subwayArmed&&(!heldDir()||(subwayTile&&(player.x!==subwayTile[0]||player.y!==subwayTile[1]))))subwayArmed=true;
 if(player.moving){player.t+=dt*(running()?10:6.25);const k=Math.min(1,player.t);player.px=(player.fx+(player.x-player.fx)*k)*16;player.py=(player.fy+(player.y-player.fy)*k)*16;
  if(player.t>=1){player.moving=false;player.px=player.x*16;player.py=player.y*16;if(arrive())return}}
 if(player.moving||state!=='world'||player.sit)return;
 let d=heldDir();if(d){clickPath=null}else{d=nextPathDir(dt);if(!d)return}player.dir=d;const[dx,dy]=DIRS[d],tx=player.x+dx,ty=player.y+dy;
 if(blocked(tx,ty)&&subwayArmed&&Zn.acts.some(a=>a.x===tx&&a.y===ty&&a.type==='subway')){clickPath=null;clickMark=null;openSubway();return}
 if(blocked(tx,ty)){if(clickPath){clickPath.wait+=dt;if(clickPath.wait>.6){const g=clickPath.goal;clickPath=null;if(clickPath===null&&g)planPath(g.x,g.y,g.act,true)}return}bumpT-=dt;if(bumpT<=0){SFX.bump();bumpT=.35}return}
 if(clickPath)clickPath.wait=0;
 player.fx=player.x;player.fy=player.y;player.x=tx;player.y=ty;player.t=0;player.moving=true;player.step^=1}
function running(){return keys.Shift}
function arrive(){const d=Zn.doors.find(d=>d.x===player.x&&d.y===player.y);if(d){warp(d.to,d.tx,d.ty,d.dir);return true}return false}
const INTROS={perk:["Central Perk. It smells like coffee and muffins, and the orange couch is right there.","Talk to people (Space) to get quizzed. Win rounds to earn collectibles for your shelf."],
 hall:["Up the stairs. Apartment 20 is on the left (the purple door). Apartment 19 is on the right.","Nobody here ever seems to lock their door."],
 monica:["Monica's apartment. Everything is spotless, and you suddenly feel very aware of your shoes."],
 joey:["Joey and Chandler's place. Two recliners, one TV, a foosball table… and is that a duck?"],
 rossapt:["Ross's apartment. Yes, the one across the street. Yes, THAT one. He'd rather not talk about it."],
 midtown:["Midtown! Skyscrapers, department stores, and a lot of people walking very fast."],soho:["SoHo. Cobblestones, art galleries, and a chrome diner with a waitress you might recognize."],
 uptown:["Uptown. The Museum of Prehistoric History is right here, and Central Park is just across the street."],queens:["Long Island City, Queens. The Manhattan skyline is right across the river, and Silvercup Studios is right in front of you."],
 airport:["JFK Airport. Pick a gate to fly somewhere. Each trip has a friend and a souvenir waiting."],london:["London! Rain, red buses, and Joey in a very patriotic hat."],vegas:["Las Vegas. It's 3 a.m. Nobody is making good decisions."],
 barbados:["Barbados! Sun, sand, and some extremely competitive ping-pong."],montauk:["Montauk. A beach house, a long summer, and a very important day for Phoebe."],
 office:["Chandler's office. Rows of cubicles, a water cooler, and Chandler, the boss of all of it."],bloomies:["Bloomingdale's. Racks and racks of clothes you can't afford."],
 diner:["The Moondance Diner. Chrome, checkerboard floors, and a jukebox stuck in 1958."],museum:["The Museum of Prehistoric History. Ross's favorite place on Earth."],studio:["The set of Days of Our Lives. Lights, cameras, and Dr. Drake Ramoray."]};
function warp(to,x,y,dir){SFX.door();state='fade';fadeT=0;const f=$('#fade');f.style.opacity=1;setTimeout(()=>{loadZone(to,x,y,dir);setTimeout(()=>{f.style.opacity=0;state='world';const intro=INTROS[to];if(intro&&!S.talked[to+'Intro']){S.talked[to+'Intro']=1;if(to==='perk')S.talked.perkIntro=1;save();say(intro)}},120)},250)}

/* ===================== NPCs & taxis ===================== */
function updNpcs(dt){for(const n of npcs){
 if(n.moving){n.t+=dt*3.5;const k=Math.min(1,n.t);n.px=(n.fx+(n.x-n.fx)*k)*16;n.py=(n.fy+(n.y-n.fy)*k)*16;if(n.t>=1){n.moving=false;n.px=n.x*16;n.py=n.y*16}continue}
 if(!n.wander||n.busy||n.sit||!(state==='world'||state==='title'))continue;n.wait-=dt;if(n.wait>0)continue;n.wait=1+R()*3.5;
 const d=['up','down','left','right'][(R()*4)|0];n.dir=d;if(R()<.3)continue;const[dx,dy]=DIRS[d],tx=n.x+dx,ty=n.y+dy,[wx,wy,ww,wh]=n.wander;
 if(tx<wx||ty<wy||tx>=wx+ww||ty>=wy+wh||tx>=Zn.w||ty>=Zn.h)continue;if(solid[ty*Zn.w+tx]||npcAt(tx,ty,n)||isDoor(tx,ty)||taxiAt(tx,ty))continue;
 if((tx===player.x&&ty===player.y)||(player.moving&&tx===player.fx&&ty===player.fy))continue;
 if(n.walkOn&&!n.walkOn.includes(gAt(tx,ty)))continue;
 if(Zn.acts.some(a=>a.x===tx&&a.y===ty&&a.type==='couch'))continue;
 n.fx=n.x;n.fy=n.y;n.x=tx;n.y=ty;n.t=0;n.moving=true}}
function updTaxis(dt){const W=Zn.w*16;for(const t of taxis){
 const a=t.dir>0?t.x+CAR_LEN:t.x-14,b=t.dir>0?t.x+CAR_LEN+14:t.x;
 const pRow=t.rows.includes(player.y)||(player.moving&&t.rows.includes(player.fy))||t.rows.some(r=>Math.abs(player.py-r*16)<14);
 const p0=Math.min(player.px,player.x*16,player.fx*16),p1=Math.max(player.px,player.x*16,player.fx*16)+16;
 let stop=false;if(pRow&&p1>a&&p0<b){stop=true;if(t.honk<=0&&state==='world'){t.honk=2.2;SFX.honk()}}
 for(const o of taxis)if(o!==t&&o.row===t.row&&o.x+CAR_LEN>a&&o.x<b)stop=true;
 if(t.honk>0)t.honk-=dt;if(!stop)t.x+=t.dir*t.sp*dt;
 if(t.dir>0&&t.x>W+40)t.x=-CAR_LEN-40;if(t.dir<0&&t.x<-CAR_LEN-40)t.x=W+40}}

/* ===================== Dialogue ===================== */
let dq=[],dCur=null,dShown=0,dDone=null,dSel=0;
function fill(s){return String(s).replace(/\{name\}/g,S?S.name:'friend')}
function say(lines,done){dq=lines.map(l=>typeof l==='string'?{text:l}:l);dDone=done||null;state='dialog';$('#dlg').classList.remove('hidden');nextLine()}
function nextLine(){const l=dq.shift();if(!l){closeDialog();return}dCur=l;dCur.full=fill(l.text);dShown=0;dSel=0;
 $('#dlgName').textContent=l.who||'';$('#dlgName').classList.toggle('hidden',!l.who);$('#dlgChoices').innerHTML='';$('#dlgMore').classList.add('hidden');renderDlg()}
function renderDlg(){$('#dlgText').textContent=dCur.full.slice(0,Math.floor(dShown));
 const done=dShown>=dCur.full.length;$('#dlgMore').classList.toggle('hidden',!done||!!dCur.choices);
 if(done&&dCur.choices&&!$('#dlgChoices').children.length){$('#dlgChoices').innerHTML=dCur.choices.map((c,i)=>`<button data-i="${i}" class="${i===dSel?'sel':''}">${esc(c.label)}</button>`).join('');
  $('#dlgChoices').querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();choose(+b.dataset.i)})}}
function choose(i){const c=dCur.choices[i];SFX.sel();dq=[];$('#dlg').classList.add('hidden');state='world';dDone=null;c.fn&&c.fn()}
function dlgAdvance(){if(!dCur)return;if(dShown<dCur.full.length){dShown=dCur.full.length;renderDlg();return}if(dCur.choices){choose(dSel);return}SFX.blip();nextLine()}
function closeDialog(){$('#dlg').classList.add('hidden');dCur=null;state='world';const f=dDone;dDone=null;f&&f()}
function updDialog(dt){if(state!=='dialog'||!dCur)return;if(dShown<dCur.full.length){const p=Math.floor(dShown);dShown=Math.min(dCur.full.length,dShown+dt*55);if(Math.floor(dShown)!==p)renderDlg()}}
function moveSel(d){if(state==='dialog'&&dCur&&dCur.choices&&dShown>=dCur.full.length){dSel=(dSel+d+dCur.choices.length)%dCur.choices.length;$('#dlgChoices').querySelectorAll('button').forEach((b,i)=>b.classList.toggle('sel',i===dSel));SFX.blip()}}

/* ===================== Talk scripts ===================== */
const ITEM=id=>ITEMS.find(i=>i.id===id);
const AVAIL=['mug','trifle','painting','turkey','dog','hugsy','frame','cup'];
const TALK={
 gunther(n){const won=S.items.mug;
  if(!won)say([{who:'Gunther',text:"…Yeah?"},{who:'Gunther',text:"You're new. Okay. You want the big mug? Everybody wants the big mug."},
   {who:'Gunther',text:"Answer five questions about this place. Get four right and it's yours.",choices:[{label:"Let's do it",fn:()=>startTrivia({who:n,tags:'perk',n:5,need:4,reward:'mug',win:"…Fine. You earned it. Don't drop it.",lose:"Not bad. Not good either. Come back when you've been paying attention."})},{label:'Just a coffee, thanks',fn:()=>say([{who:'Gunther',text:"Coming up. Don't even think about the couch. It's always taken. Somehow."}])}]}]);
  else say([{who:'Gunther',text:"You again."},{who:'Gunther',text:"Want another round? No prizes. Just… for fun, I guess.",choices:[{label:'Quiz me (superfan round)',fn:()=>startTrivia({who:n,tags:'perk gunther',prefer:'gunther',n:5,need:4})},{label:'Maybe later',fn:()=>{}}]}])},
 rachel(n){const won=S.items.trifle;
  if(!won)say([{who:'Rachel',text:"Oh, hi! Sorry, I'm supposed to be working. I've been carrying this same latte around for twenty minutes."},
   {who:'Rachel',text:"Ooh, you want to do trivia? Okay, five questions, mostly about me. Get four and I'll give you something I made. With my own hands!",choices:[{label:'Bring it on',fn:()=>startTrivia({who:n,tags:'rachel',n:5,need:4,reward:'trifle',win:"You totally know me! Here, take this trifle. I made it from a recipe… mostly.",lose:"Aw, so close! Okay, go study and come back. I'll be here. Not working."})},{label:'Let you get back to work',fn:()=>say([{who:'Rachel',text:"Ha. Good one."}])}]}]);
  else say([{who:'Rachel',text:"Hey, {name}! Did you try the trifle? …You don't have to answer that."},{who:'Rachel',text:"Another round? Just for fun?",choices:[{label:'Sure',fn:()=>startTrivia({who:n,tags:'rachel',n:5,need:4})},{label:'Not now',fn:()=>{}}]}])},
 phoebe(n){const won=S.items.painting;
  if(!won)say([{who:'Phoebe',text:"Oh, hi! I'm between sets. Do you want to hear a song about a cat, or answer some questions?"},{who:'Phoebe',text:"…You want questions. That's okay, the cat doesn't take it personally."},
   {who:'Phoebe',text:"Five questions about me. Get four and you get one of my paintings. It's very… watchful.",choices:[{label:"I'm ready",fn:()=>startTrivia({who:n,tags:'phoebe',n:5,need:4,reward:'painting',win:"Yay! Here, take the painting. Hang it somewhere you don't sleep.",lose:"Hmm, your aura's a little cloudy today. Try again later!"})},{label:'Actually, play the song',fn:()=>say([{who:'Phoebe',text:"♪ …and it's not your fault… ♪"},{who:'Phoebe',text:"Thank you! I'll be here all week. Literally, I live nearby."}])}]}]);
  else say([{who:'Phoebe',text:"How's the painting? Is it still looking at you? Good. That means it likes you."},{who:'Phoebe',text:"Want to go again?",choices:[{label:'Yes!',fn:()=>startTrivia({who:n,tags:'phoebe',n:5,need:4})},{label:'Later',fn:()=>{}}]}])},
 monica(n){const won=S.items.cup;
  if(!won)say([{who:'Monica',text:"Oh, hi! Come in, come in. Coaster! There's a coaster right there."},{who:'Monica',text:"You want to play a game? Oh, I LOVE games. I'm not competitive. I'm just very, very good at winning."},
   {who:'Monica',text:"Five questions about me. Get four right and you can have the Geller Cup. Ross will be furious. That's a bonus.",choices:[{label:"Game on",fn:()=>startTrivia({who:n,tags:'monica',n:5,need:4,reward:'cup',win:"Okay, fine, you won. FAIR AND SQUARE. Take the cup before I change my mind.",lose:"Ha! I mean, oh no. Practice and come back. I'll be here. Cleaning."})},{label:'Maybe after dinner',fn:()=>say([{who:'Monica',text:"Dinner is at seven. Seven. Not seven-oh-five."}])}]}]);
  else say([{who:'Monica',text:"Is the Geller Cup somewhere safe? Somewhere Ross can't find it?"},{who:'Monica',text:"Rematch?",choices:[{label:'Rematch!',fn:()=>startTrivia({who:n,tags:'monica',n:5,need:4})},{label:'Not today',fn:()=>{}}]}])},
 ross(n){const won=S.items.frame;
  if(!won)say([{who:'Ross',text:"Hi! Okay, great timing. I've been working on a quiz. About all of us. With categories! Well, one category. It's all of us."},
   {who:'Ross',text:"Eight questions. Get six right and you win… the yellow frame off the peephole. Monica said I could offer it. Mostly.",choices:[{label:'Start the Apartment Quiz',fn:()=>startTrivia({who:n,tags:'all',n:8,need:6,reward:'frame',win:"Incredible! Here, take the frame. I'll explain it to Monica. Eventually.",lose:"Okay, that's okay. The cards will be here. I laminated them."})},{label:"Ask about dinosaurs",fn:()=>say([{who:'Ross',text:"Oh! Did you know some dinosaurs had feathers? …You're already leaving. That's fine."}])}]}]);
  else say([{who:'Ross',text:"I made more cards. Want to go again?",choices:[{label:'Sure',fn:()=>startTrivia({who:n,tags:'all',n:8,need:6})},{label:'Not now',fn:()=>{}}]}])},
 joey(n){const won=S.items.hugsy;
  if(!won)say([{who:'Joey',text:"Hey! How you doin'?"},{who:'Joey',text:"Trivia? Okay. Five questions, mostly about me. That's my best subject."},
   {who:'Joey',text:"Get four right and you can borrow Hugsy. BORROW. Get less than four and you owe me a sandwich.",choices:[{label:"You're on",fn:()=>startTrivia({who:n,tags:'joey',n:5,need:4,reward:'hugsy',win:"Whoa, you're good! Okay. Here's Hugsy. Be gentle. He's sensitive.",lose:"Ha! Sandwich. Meatball sub. No rush. Actually, a little rush."})},{label:"Is that a sandwich?",fn:()=>say([{who:'Joey',text:"Yes. And no, you can't have any."}])}]}]);
  else say([{who:'Joey',text:"How's Hugsy doing? Does he miss me? He misses me."},{who:'Joey',text:"Wanna go again?",choices:[{label:'Yeah',fn:()=>startTrivia({who:n,tags:'joey',n:5,need:4})},{label:'Later',fn:()=>{}}]}])},
 chandler(n){const won=S.items.dog;
  if(!won)say([{who:'Chandler',text:"Oh, good, a visitor. Quick, act natural. Joey's been practicing his 'smell the fart' acting all morning."},
   {who:'Chandler',text:"Could I BE more ready for trivia? Five questions about me. Get four right and you can take the dog."},
   {who:'Chandler',text:"The big white one. By the TV. Please. Take the dog.",choices:[{label:"Deal",fn:()=>startTrivia({who:n,tags:'chandler',n:5,need:4,reward:'dog',win:"Yes! It's yours. Quick, before Joey notices. …He's going to notice.",lose:"That's okay. I'll just keep living with it. Staring at me. Forever."})},{label:"Leave the dog alone",fn:()=>say([{who:'Chandler',text:"Sure. Sure. It's not like it watches me sleep."}])}]}]);
  else say([{who:'Chandler',text:"Joey asked where the dog went. I said it went to live on a farm."},{who:'Chandler',text:"Another round?",choices:[{label:'Sure',fn:()=>startTrivia({who:n,tags:'chandler',n:5,need:4})},{label:'Nope',fn:()=>{}}]}])},
 duck(n){say([{who:'Duck',text:"Quack."},{text:"(The duck looks at you like it knows something you don't.)"}])},
 chick(n){say([{who:'Chick',text:"Peep!"},{text:"(The chick runs a lap around your feet, then sits on your shoe.)"}])},
 cast(n){const sc=n.script,won=sc.reward&&S.items[sc.reward],who=sc.narrate?null:n.name;
  const eg=n.egg&&EGGS.find(q=>q.id===n.egg);if(eg)eggFound(eg.id);const pre=eg?eg.lines.map(l=>({who:l.who,text:l.text})):[];
  const go=rew=>startTrivia({who:n,tags:sc.tags,prefer:sc.prefer,n:sc.n||5,need:sc.need||4,reward:rew,win:sc.win,lose:sc.lose});
  if(!won){const L=pre.length?pre:sc.greet.map(t=>({who,text:t}));L.push({who,text:sc.offer,choices:[{label:sc.yes||"Let's do it",fn:()=>go(sc.reward)},{label:sc.no||'Not right now',fn:()=>say([{who,text:sc.noReply||'Okay, maybe later!'}])}]});say(L)}
  else say([...pre,{who,text:sc.again||(sc.narrate?"Try the challenge again, just for fun?":"Want to go again? Just for fun."),choices:[{label:'Sure',fn:()=>go(null)},{label:'Later',fn:()=>{}}]}])},
 egg(n){eggTalk(n.egg)},
 collect(n){collectAct(n.collect)},
 townie(n){const lines=n.lines.map(t=>({text:t}));
  if(n.quiz&&!n.asked){lines.push({text:"Hey, quick question, settle a bet for me?",choices:[{label:'Sure',fn:()=>{n.asked=true;startTrivia({who:n,tags:'easy',n:1,need:1,quick:true,win:"Ha! Knew it. Thanks!",lose:"Huh. Guess we both learned something."})}},{label:'No time',fn:()=>{}}]})}
  say(lines)}};
// v1.5: hidden collectibles. Find the spot, answer one question about it, and it goes on your shelf.
function giveItem(id){if(S.items[id])return;S.items[id]=Date.now();save();updHud();SFX.ok();toast('New collectible: '+ITEM(id).name)}
function collectAct(a){if(S.items[a.item]){say(a.have.split('\n'));return}
 const ch=shuffle(a.answers.map((t,i)=>({label:t,fn:()=>{if(i===0){giveItem(a.item);say([{text:a.win},{text:`(${ITEM(a.item).name} added to your shelf. Press C to see it.)`}])}else say([{text:a.lose}])}})));
 say([...a.lines.map(t=>({text:t})),{text:a.q,choices:ch}])}
function talkTo(n){if(!n.seated)n.dir=OPP[player.dir];(TALK[n.talk]||(n.script?TALK.cast:TALK.townie))(n)}

/* ===================== Click / tap to move ===================== */
let clickPath=null,clickMark=null;
function tileWalkable(x,y){return x>=0&&y>=0&&x<Zn.w&&y<Zn.h&&!solid[y*Zn.w+x]&&!npcAt(x,y)}
function bfs(sx,sy,goalFn){const W=Zn.w,prev=new Int32Array(W*Zn.h).fill(-1),q=[sy*W+sx];prev[sy*W+sx]=sy*W+sx;
 while(q.length){const i=q.shift(),x=i%W,y=(i/W)|0;if(goalFn(x,y)){const path=[];let k=i;while(k!==sy*W+sx){path.push(k);k=prev[k]}return path.reverse().map(k=>[k%W,(k/W)|0])}
  for(const[dx,dy]of[[0,-1],[0,1],[-1,0],[1,0]]){const nx=x+dx,ny=y+dy,ni=ny*W+nx;if(nx<0||ny<0||nx>=W||ny>=Zn.h||prev[ni]!==-1)continue;if(!tileWalkable(nx,ny))continue;if(isDoor(nx,ny)&&!goalFn(nx,ny))continue;prev[ni]=i;q.push(ni)}}
 return null}
function interactableAt(x,y){return npcAt(x,y)||Zn.acts.find(a=>a.x===x&&a.y===y)}
function planPath(tx,ty,act,quiet){if(!Zn)return;const here=player.x===tx&&player.y===ty;
 if(act){// walk next to it, then face it and interact
  const adj=(x,y)=>Math.abs(x-tx)+Math.abs(y-ty)===1;
  if(adj(player.x,player.y)){faceAndUse(tx,ty);return}
  const p=bfs(player.x,player.y,adj);if(!p){if(!quiet)SFX.bump();return}clickPath={steps:p,goal:{x:tx,y:ty,act:true},wait:0};clickMark={x:tx,y:ty,t:0};return}
 if(here)return;if(!tileWalkable(tx,ty)&&!isDoor(tx,ty)){// clicked a wall: go as close as possible
  let best=null,bd=1e9;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=tx+dx,y=ty+dy;if(tileWalkable(x,y)&&Math.abs(dx)+Math.abs(dy)<bd){bd=Math.abs(dx)+Math.abs(dy);best=[x,y]}}if(!best){if(!quiet)SFX.bump();return}[tx,ty]=best}
 const p=bfs(player.x,player.y,(x,y)=>x===tx&&y===ty);if(!p){if(!quiet)SFX.bump();return}clickPath={steps:p,goal:{x:tx,y:ty,act:false},wait:0};clickMark={x:tx,y:ty,t:0}}
function faceAndUse(tx,ty){const dx=tx-player.x,dy=ty-player.y;player.dir=dx>0?'right':dx<0?'left':dy>0?'down':'up';clickPath=null;clickMark=null;interact()}
function nextPathDir(){if(!clickPath)return null;if(!clickPath.steps.length){const g=clickPath.goal;clickPath=null;clickMark=null;if(g&&g.act)faceAndUse(g.x,g.y);return null}
 const[nx,ny]=clickPath.steps[0];if(Math.abs(nx-player.x)+Math.abs(ny-player.y)!==1){const g=clickPath.goal;clickPath=null;planPath(g.x,g.y,g.act,true);return null}
 clickPath.steps.shift();return nx>player.x?'right':nx<player.x?'left':ny>player.y?'down':'up'}
function onCanvasClick(e){if(state!=='world'||!Zn)return;if(player.sit){standUp();return}const r=cv.getBoundingClientRect();const sx=(e.clientX-r.left)/r.width*640,sy=(e.clientY-r.top)/r.height*416;
 const wx=sx/SC+cam.x,wy=sy/SC+cam.y;let tx=Math.floor(wx/16),ty=Math.floor(wy/16);
 // characters are drawn a little taller than their tile, so also check the tile below the click
 let tgt=interactableAt(tx,ty);if(!tgt&&npcAt(tx,ty+1)){ty++;tgt=npcAt(tx,ty)}
 if(tgt&&!(isDoor(tx,ty)&&!npcAt(tx,ty)))planPath(tx,ty,true);else planPath(tx,ty,false)}
cv.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;onCanvasClick(e)});

/* ===================== Interact & couch ===================== */
function interact(){if(player.sit){standUp();return}if(player.moving)return;
 const[dx,dy]=DIRS[player.dir],tx=player.x+dx,ty=player.y+dy;
 const n=npcAt(tx,ty);if(n){talkTo(n);return}
 const a=Zn.acts.find(a=>a.x===tx&&a.y===ty);if(!a)return;
 if(a.type==='msg'){
  // v1.9.5: sometimes someone's home after all, and they've got a question for you
  const key=Zn.id+':'+a.x+','+a.y;S.knock=S.knock||{};const today=new Date().toDateString();
  if(a.door&&Zn.taxiRows&&Zn.taxiRows.length&&S.knock[key]!==today&&Math.random()<.35){S.knock[key]=today;save();
   const who=pickOne(['A neighbor','The super','A very tired man in a robe','A lady with curlers','A kid with a popsicle']);
   say([{text:'(You knock. Footsteps. The door opens a crack.)'},{who,text:pickOne(["Oh, you're not the pizza guy. …Okay, since you're here. Quick question:","Hi. My roommate and I have a bet going. Settle it?","Hey! You look like you watch a lot of TV. Help me out."]),
    choices:[{label:'Sure',fn:()=>startTrivia({who:{name:who},tags:'easy',n:1,need:1,quick:true,win:"Ha! I knew it. Thanks, neighbor!",lose:"Huh. Well, now I don't know who wins the bet."})},{label:'Maybe later',fn:()=>say([{who,text:'Suit yourself.'},{text:'(The door closes.)'}])}]}]);return}
  say(a.text.split('\n'))}
 else if(a.type==='couch')sitCouch(tx,ty);
 else if(a.type==='quiz')TALK.cast({name:a.name,icon:a.icon,script:a.script});
 else if(a.type==='subway')openSubway();
 else if(a.type==='egg')eggTalk(a.egg);
 else if(a.type==='collect')collectAct(a);
 else if(a.type==='fly')say([{text:a.to==='airport'?'Head back to JFK?':`Board the flight to ${a.label}?`,choices:[{label:a.to==='airport'?'Head home':'Board ✈',fn:()=>travel(a.to==='airport'?'✈  Flying back to JFK…':`✈  Now boarding: ${a.label}`,a.to,a.tx,a.ty,a.dir)},{label:'Not yet',fn:()=>{}}]}]);
 else if(a.type==='counter'){const g=npcs.find(n=>n.id==='gunther');if(g){g.dir='down';talkTo(g)}}}
function sitCouch(x,y){player.sit={x,y,fx:player.x,fy:player.y};player.x=player.fx=x;player.y=player.fy=y;player.px=x*16;player.py=y*16;player.dir='down';SFX.sel();
 const seats=Zn.acts.filter(a=>a.type==='couch'&&a.y===y&&a.x!==x).map(a=>a.x);const pals=npcs.filter(n=>n.couch);
 pals.forEach((n,i)=>{n.sit={hx:n.x,hy:n.y,hd:n.dir};n.x=n.fx=seats[i];n.y=n.fy=y;n.px=n.x*16;n.py=n.y*16;n.dir='down';n.moving=false});
 if(finaleReady()){const done=S.items.key;say([{who:'Monica',text:"There you are! Everybody's here. All six of us. Well, seven, counting you."},{who:'Chandler',text:"Could this couch BE any more crowded?"},{who:'Joey',text:"Hey, how you doin'? …Sorry, habit."},{who:'Ross',text:"So we made one last quiz. About everything. Ten questions."},
  {who:'Rachel',text:done?"Want to do the last one again?":"Get eight right, and… well. We have something for you.",choices:[{label:"Let's do the last one",fn:()=>startTrivia({who:{name:'Everyone',couchIcon:true},tags:'all',n:10,need:8,reward:done?null:'key',win:"You did it! Everybody, keys on the counter. …Except one. That one's yours.",lose:"So close! The couch isn't going anywhere. Try again.",after:()=>{if(S.items.key)showCredits()}})},{label:'Just enjoy the moment',fn:()=>say([{text:"(Everyone's talking at once. Somebody's laughing. It's perfect.)"}])}]}]);return}
 const won=S.items.turkey;
 say([{who:'Phoebe',text:"Ooh, couch time! Scoot over."},{who:'Rachel',text:"I'm on my break. Technically. Gunther doesn't need to know."},
  {who:'Rachel',text:won?"Want to do the Couch Challenge again? Seven questions, about everyone.":"Okay, Couch Challenge: seven questions about all of us. Get five right and you get the turkey. Don't ask.",
   choices:[{label:"Start the Couch Challenge",fn:()=>startTrivia({who:{name:'The Couch',couchIcon:true},tags:'all',n:7,need:5,reward:won?null:'turkey',win:"YES! Couch champion! The turkey is yours. Sunglasses included.",lose:"Ooh, so close. The couch will be here when you're ready.",after:()=>say(["(Press Space to get up from the couch.)"])})},
    {label:'Couch Versus (2 players)',fn:()=>openVs(true)},
    {label:'Just hang out',fn:()=>say([{text:"(You sink into the orange couch. This really is the best spot.)"},{text:"(Press Space to get up.)"}])}]}])}
function standUp(){const s=player.sit;if(!s)return;let tx=s.x,ty=s.y+1;if(blocked(tx,ty)){tx=s.fx;ty=s.fy}player.x=player.fx=tx;player.y=player.fy=ty;player.px=tx*16;player.py=ty*16;player.sit=null;player.dir='down';
 for(const n of npcs)if(n.sit){const h=n.sit;n.sit=null;let hx=h.hx,hy=h.hy;if(npcAt(hx,hy,n)||(hx===player.x&&hy===player.y)){hx=n.home.x;hy=n.home.y}n.x=n.fx=hx;n.y=n.fy=hy;n.px=hx*16;n.py=hy*16;n.dir=h.hd}save()}

/* ===================== Trivia ===================== */
let TV=null;
function startTrivia(o){const tags=o.tags==='all'?null:o.tags.split(' '),d=S.diff||'fan',sfDeck=!!tags&&tags.includes('sf');
 let pool=QB.map((q,i)=>Object.assign({i},q)).filter(q=>!tags||tags.some(t=>qTags(q).includes(t)));
 // Difficulty: Casual drops tough + Super Fan questions, Fan drops Super Fan ones, Super Fan puts them first.
 // Only trim when enough questions are left to fill the round.
 const trim=f=>{const p=pool.filter(f);if(p.length>=o.n)pool=p};
 if(!sfDeck){if(d==='casual')trim(q=>!qTags(q).includes('sf')&&!qTags(q).includes('hard'));else if(d==='fan')trim(q=>!qTags(q).includes('sf'))}
 const lvl=q=>d==='super'&&!sfDeck?(qStars(q)>1?0:200):d==='casual'?(qTags(q).includes('easy')?0:60):0;
 shuffle(pool);const pk=q=>(o.prefer&&qTags(q).includes(o.prefer)?0:1000)+lvl(q)+(S.seen[q.i]||0)*40;pool.sort((a,b)=>pk(a)-pk(b));
 TV=Object.assign({qs:pool.slice(0,o.n),k:0,score:0,answered:false,res:[]},o);state='trivia';
 $('#triv').classList.remove('hidden');$('#triv').classList.toggle('quick',!!o.quick);$('#tvRes').classList.add('hidden');$('#tvBody').classList.remove('hidden');
 $('#tvName').textContent=o.who.name||(o.quick?'Quick Question':'Trivia');
 tvPortrait($('#tvPortrait'),o.who);TV.streak=0;$('#tvSay').textContent='';$('#tvStreak').textContent='';
 if(!o.quick){$('#tvCardT').textContent=tvTitle(o.who);const cd=$('#tvCard');cd.classList.remove('on');void cd.offsetWidth;cd.classList.add('on');cd.onclick=()=>cd.classList.remove('on')}

 renderQ()}
/* v1.9.2: the quiz is a little episode. A title card, a portrait that reacts, and a line in character after each answer. */
function pickOne(a){return a[(Math.random()*a.length)|0]}
function tvKey(w){const n=((w&&(w.id||w.name))||'').toLowerCase();for(const k of['rachel','monica','phoebe','ross','joey','chandler','gunther','janice','mike','eddie','heckles','richard','estelle','frank','judy','jack','tag'])if(n.includes(k))return k;return''}
const REACT={
 rachel:{ok:["Oh my God, yes!","See? You totally get me.","Ooh, somebody's been paying attention!"],no:["Um, no. Honey, no.","Okay, that was… a choice.","Noooo. But it's cute that you tried."],win:["You're amazing! Okay, it's yours. Don't let Ross touch it."],lose:["It's okay! I failed things too. Like… waitressing."]},
 monica:{ok:["Yes! I mean, obviously. But yes!","Correct! I'm putting that in the binder.","Perfect. Like a hospital corner."],no:["No! That's wrong! How is that wrong?!","Okay. Deep breath. We'll fix this.","That answer is going in the wrong-answer towel pile."],win:["I WIN! I mean… you win. We both win. But mostly me, for picking you."],lose:["Rematch. Right now. I've already laminated the cards."]},
 phoebe:{ok:["Yay! Your aura just went totally purple.","I knew you'd get that. Well, my grandmother's spirit did.","Ooh, correct! That's very good energy."],no:["That's okay. The wrong answers are just right answers in a past life.","Hmm. Mercury's probably in something.","No, but I still like you."],win:["You did it! I'm writing a song about you. It's mostly about a cat, but it's about you."],lose:["Don't worry. Smelly answers, smelly answers, it's not your fault."]},
 ross:{ok:["Yes! Correct! That's— that's exactly right!","Ha! See? Facts! Facts are great!","Yes. Thank you. Someone respects the material."],no:["No. No! That's— okay, that's not right.","Unagi. You need more unagi.","Wrong. And we were NOT on a break when I wrote this question."],win:["Okay, you won. Fair and square. I'll just… go update the index cards."],lose:["Hey, it's fine. You're still learning. Like the trilobite."]},
 joey:{ok:["Yeah! How YOU doin'!","Nice! That's right, right? Yeah, that's right.","Whoa. You're like a genius. Like a smart genius."],no:["Ooh. Moo answer. It doesn't matter.","Nah. But hey, you look good, so…","Wrong! Wait, what was the question?"],win:["You did it! Okay. You can borrow him. BORROW."],lose:["That's okay! You owe me a sandwich, though."]},
 chandler:{ok:["Could you BE any more right?","Correct. I'd clap, but I don't do sincere.","Look at you, knowing things."],no:["Oh good, a wrong answer. My favorite kind of answer.","Nope. I'd make a joke, but you're already sad.","That was not it. I'm not great at the comfort."],win:["You won. I'm handling it with mature, healthy humor. Please don't tell anyone."],lose:["You lost. Want a sarcastic comment? I have several."]},
 gunther:{ok:["…Yes.","Correct. Whatever."],no:["No.","…Wrong."],win:["Fine. Take it."],lose:["Try again. Or don't."]},
 '':{ok:["Nice!","That's right!","You know your stuff!"],no:["Not quite!","Ooh, so close.","Nope, but good guess!"],win:["Nicely done!"],lose:["Better luck next time!"]}};
function reactLines(w){return REACT[tvKey(w)]||REACT['']}
function tvTitle(w){const k=tvKey(w),n=(w&&w.name)||'Trivia';
 if(w&&w.couchIcon)return 'The One on the Couch';
 return k==='ross'?'The One With the Index Cards':k==='monica'?'The One Where Monica Has to Win':k==='gunther'?'The One Where Gunther Speaks':k==='joey'?"The One Where Joey Doesn't Share":k==='chandler'?'The One With the Sarcasm':k==='phoebe'?'The One With the Aura':k==='rachel'?'The One Where You Quiz Rachel':`The One With ${n}`}
// head-and-shoulders portrait, cropped from the character's front-facing sprite
function tvPortrait(c,w){const g=c.getContext('2d'),W=c.width;g.clearRect(0,0,W,W);
 if(w&&w.icon){art(g,itemArt(w.icon),W*.1,W*.1,W*.8,W*.8);return}
 if(w&&w.couchIcon){const s=makeObj({kind:'couch',w:3,x:0,y:0});g.imageSmoothingEnabled=false;g.drawImage(s.c,0,W*.25,W,W*.6);return}
 const im=w&&w.spr&&w.spr.down&&w.spr.down[0];if(!im)return;
 if(im.hd){g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';const dw=W*1.75,dh=dw*im.height/im.width;g.drawImage(im,(W-dw)/2,-dh*.17,dw,dh)}
 else{g.imageSmoothingEnabled=false;const dw=W*1.1,dh=dw*im.height/im.width;g.drawImage(im,(W-dw)/2,-dh*.02,dw,dh)}}
function tvReact(ok){const pw=$('#tvPw'),b=$('#tvBubble');pw.classList.remove('hop','shake');void pw.offsetWidth;pw.classList.add(ok?'hop':'shake');
 b.textContent=ok?pickOne(['❤️','✨','!','😄']):pickOne(['💧','?!','😬']);b.classList.add('on');clearTimeout(tvReact.t);tvReact.t=setTimeout(()=>b.classList.remove('on'),1400);
 $('#tvSay').textContent='“'+pickOne(reactLines(TV.who)[ok?'ok':'no'])+'”'}
function renderQ(){const q=TV.qs[TV.k];TV.answered=false;$('#tvSay').textContent='';TV.opts=shuffle(q.a.slice());
 $('#tvProg').innerHTML=TV.qs.map((_,i)=>`<i class="${i<TV.k?(TV.res[i]?'ok':'no'):i===TV.k?'cur':''}"></i>`).join('');
 $('#tvNeed').textContent=TV.quick?'':`Need ${TV.need} of ${TV.qs.length}`;
 $('#tvQ').textContent=q.q;const pc=$('#tvPic');if(q.pic){pc.classList.remove('hidden');const gg=pc.getContext('2d');gg.imageSmoothingEnabled=false;gg.clearRect(0,0,256,160);gg.drawImage(drawPic(q.pic),0,0,256,160)}else pc.classList.add('hidden');$('#tvFact').classList.add('hidden');$('#tvNext').classList.add('hidden');
 $('#tvOpts').innerHTML=TV.opts.map((a,i)=>`<button data-i="${i}"><b>${i+1}</b>${esc(a)}</button>`).join('');
 $('#tvOpts').querySelectorAll('button').forEach(b=>b.onclick=()=>answer(+b.dataset.i))}
function answer(i){if(!TV||TV.answered)return;const q=TV.qs[TV.k],ok=TV.opts[i]===q.a[0];TV.answered=true;TV.res=TV.res||[];TV.res[TV.k]=ok;
 S.seen[q.i]=(S.seen[q.i]||0)+1;
 $('#tvOpts').querySelectorAll('button').forEach((b,j)=>{b.disabled=true;if(TV.opts[j]===q.a[0])b.classList.add('right');else if(j===i)b.classList.add('wrong')});
 const gain=qStars(q);if(ok){TV.score++;S.stars+=gain;SFX.ok()}else SFX.bad();updHud();save();
 TV.streak=ok?(TV.streak||0)+1:0;$('#tvStreak').textContent=TV.streak>=3?`🔥 ${TV.streak} in a row!`:'';tvReact(ok);
 const f=$('#tvFact');f.innerHTML=(ok?'<b class="good">Correct!</b> '+(gain>1?`<span class="tvStars">+${'★'.repeat(gain)}</span> `:''):'<b class="bad">Not quite.</b> ')+(q.f?esc(q.f):ok?'':'The answer was '+esc(q.a[0])+'.')+(q.ep?`<span class="tvEp">📺 ${esc(q.ep)}</span>`:'');f.classList.remove('hidden');
 $('#tvNext').textContent=TV.k+1<TV.qs.length?'Next ▶':'Finish ▶';$('#tvNext').classList.remove('hidden');try{$('#tvNext').scrollIntoView({block:'nearest'})}catch(e){}}
function nextQ(){if(!TV||!TV.answered)return;TV.k++;if(TV.k<TV.qs.length)renderQ();else endTrivia()}
function endTrivia(){const won=TV.score>=TV.need;$('#tvBody').classList.add('hidden');const r=$('#tvRes');r.classList.remove('hidden');
 $('#tvProg').innerHTML=TV.qs.map((_,i)=>`<i class="${TV.res[i]?'ok':'no'}"></i>`).join('');
 let h=TV.quick?'':`<canvas class="rp" id="tvRP" width="132" height="132"></canvas><div class="score">${TV.score} / ${TV.qs.length}</div>`;
 const rl=reactLines(TV.who)[won?'win':'lose'];if(!TV.quick&&rl)h+=`<p class="rsay">“${esc(fill(pickOne(rl)))}”</p>`;
 h+=`<p>${esc(fill(won?(TV.win||'Nice work!'):(TV.lose||'Better luck next time!')))}</p>`;
 if(won&&TV.reward&&!S.items[TV.reward]){S.items[TV.reward]=Date.now();const it=ITEM(TV.reward);h+=`<div class="award"><canvas id="awardCv" width="64" height="64"></canvas><div><small>NEW COLLECTIBLE</small><b>${esc(it.name)}</b><span>${esc(it.desc)}</span><small>Added to your shelf. Press C to view it.</small></div></div>`;setTimeout(SFX.item,150)}
 h+=`<button id="tvDone">Continue ▶</button>`;r.innerHTML=h;
 const ac=$('#awardCv');if(ac){const g=ac.getContext('2d');art(g,itemArt(TV.reward),0,0,64,64)}
 $('#tvDone').onclick=closeTrivia;TV.finished=true;if($('#tvRP'))tvPortrait($('#tvRP'),TV.who);updHud();save()}
function closeTrivia(){$('#triv').classList.add('hidden');state='world';const a=TV&&TV.after;TV=null;if(a)a();else{const n=itemCount();if(finaleReady()&&!S.items.key&&!S.talked.finaleHint){S.talked.finaleHint=1;save();say(["You've found everything! Your phone buzzes: a text from Monica.","'Central Perk. The orange couch. Everybody's waiting. Don't be late!'"]);addFinaleCast()}else if(n>=10&&!S.talked.airportHint){S.talked.airportHint=1;save();say(["10 collectibles! The AirTrain to JFK Airport is now open on the subway map. Flights to London, Las Vegas, Barbados and Montauk await."])}else if(n===8&&!S.talked.subwayHint){S.talked.subwayHint=1;save();say(["The Village is all yours! Take the subway at Bleecker St to explore the rest of the city."])}}}


/* ===================== v1.9.3: the story in chapters, and the map ===================== */
const HOOD_OF_ZONE={village:'village',perk:'village',hall:'village',monica:'village',joey:'village',rossapt:'village',phoebe:'village',
 midtown:'midtown',office:'midtown',ralph:'midtown',bloomies:'midtown',soho:'soho',diner:'soho',uptown:'uptown',museum:'uptown',
 queens:'queens',studio:'queens',airport:'trips',london:'trips',vegas:'trips',barbados:'trips',montauk:'trips'};
const HOODS=[{id:'uptown',name:'Uptown',sub:'81 St · the Museum, Central Park',area:'1/1/2/3'},{id:'midtown',name:'Midtown',sub:"5 Av / 59 St · Chandler's office, Bloomingdale's, the Garden",area:'2/1/3/3'},
 {id:'village',name:'Greenwich Village',sub:'Bleecker St · Central Perk and the apartments',area:'3/1/4/3'},{id:'soho',name:'SoHo',sub:'Spring St · the Moondance Diner',area:'4/1/5/3'},
 {id:'queens',name:'Queens',sub:'Queensboro Plaza · Silvercup Studios',area:'2/3/3/4'},{id:'trips',name:'JFK & beyond',sub:'London · Las Vegas · Barbados · Montauk',area:'3/3/5/4'}];
function hoodOfItem(it){const f=it.from||'';
 if(/Last One/.test(f))return null;if(/London|Las Vegas|Barbados|Montauk/.test(f))return'trips';if(/Silvercup/.test(f))return'queens';
 if(/Museum|Central Park/.test(f))return'uptown';if(/Moondance/.test(f))return'soho';if(/Midtown|Madison|Bloomingdale|Ralph/.test(f))return'midtown';return'village'}
const CHAPTERS=[
 {t:'The One Where It All Begins',tx:"It's the gang's last year in the Village. Monica and Chandler are moving to the suburbs, and everyone's feeling sentimental. Collect a keepsake from every corner of their New York, starting at Central Perk and the apartments upstairs.",
  goal:()=>{const v=ITEMS.filter(i=>!i.bonus&&hoodOfItem(i)==='village');return`Keepsakes from the Village: ${v.filter(i=>S.items[i.id]).length} / ${v.length}`},done:()=>ITEMS.filter(i=>!i.bonus&&hoodOfItem(i)==='village'&&S.items[i.id]).length>=6},
 {t:'The One Around Town',tx:"Word's gotten around that you're collecting memories. Take the subway uptown, to Midtown, to SoHo and over to Queens. Everybody has a story, and something to give you.",
  goal:()=>`Collect ${Math.max(0,10-itemCount())} more to unlock the airport`,done:()=>itemCount()>=10},
 {t:'The One With All the Trips',tx:"You've earned some time off. Take the AirTrain to JFK: London, Las Vegas, Barbados and Montauk are waiting, and so is a friend in each one.",
  goal:()=>{const r=ITEMS.filter(i=>i.id!=='key'&&!i.bonus&&!S.items[i.id]).length;return r?`${r} keepsake${r>1?'s':''} left before the last one`:'Everything found!'},done:()=>finaleReady()},
 {t:'The Last One',tx:"You found everything. Everyone's meeting at Central Perk one last time before Monica and Chandler hand over their keys. Go sit on the couch.",goal:()=>S.items.key?'The end. (Or is it?)':'Everyone is waiting at Central Perk',done:()=>false}];
function chapterNow(){let c=0;while(c<CHAPTERS.length-1&&CHAPTERS[c].done())c++;return c}
function showChapter(c){const ch=CHAPTERS[c];$('#chapNum').textContent=`Chapter ${c+1}`;$('#chapT').textContent=ch.t;$('#chapTx').textContent=ch.tx;
 const el=$('#chapCard');el.classList.add('on');const prev=state;state='card';SFX.ok();el.onclick=()=>{el.classList.remove('on');state=prev==='card'?'world':prev}}
function checkChapter(){if(!S||state!=='world')return;if(S.chapter==null){S.chapter=chapterNow();save();return}
 const c=chapterNow();if(c>S.chapter){S.chapter=c;save();showChapter(c)}}
function openMap(){if(state==='world')openMap.sel=null;state='menu';const here=HOOD_OF_ZONE[Zn.id];const ch=S.chapter||0;
 $('#mapCh').textContent=`Chapter ${ch+1}: ${CHAPTERS[ch].t} · ${CHAPTERS[ch].goal()}`;
 const sel=openMap.sel&&HOODS.some(h=>h.id===openMap.sel)?openMap.sel:here;
 const info=id=>{const h=HOODS.find(q=>q.id===id),its=ITEMS.filter(i=>hoodOfItem(i)===id),miss=its.filter(i=>!S.items[i.id]),lock=id==='trips'&&itemCount()<10;
  return`<h3>${esc(h.name)}</h3><div>${esc(h.sub)}</div>`+(lock?`<p>🔒 Collect 10 keepsakes to unlock the airport (you have ${itemCount()}).</p>`:miss.length?`<p><b>Still to find (${miss.length})</b></p><ul>${miss.map(i=>`<li>${i.bonus?'✨ ':''}${esc(i.hint||i.from)}</li>`).join('')}</ul>`:'<p>✅ Everything here is on your shelf.</p>')};
 $('#mapGrid').innerHTML=HOODS.map(h=>{const its=ITEMS.filter(i=>hoodOfItem(i)===h.id),got=its.filter(i=>S.items[i.id]).length,lock=h.id==='trips'&&itemCount()<10;
  return`<div class="mz ${h.id===here?'here':''} ${h.id===sel?'sel':''} ${lock?'lock':''} ${got===its.length?'done':''}" data-h="${h.id}" style="grid-area:${h.area}"><h3>${h.id===here?'📍 ':''}${esc(h.name)}</h3><div class="pc">${lock?'🔒 Locked':`🏆 ${got} / ${its.length}`}</div></div>`}).join('');
 $('#mapInfo').innerHTML=info(sel);
 $('#mapGrid').querySelectorAll('.mz').forEach(el=>el.onclick=()=>{openMap.sel=el.dataset.h;SFX.sel();openMap()});
 $('#mapTip').textContent='Ride the subway between neighborhoods: walk into any green subway entrance. Bonus collectibles are hidden around the city.';
 $('#mapP').classList.remove('hidden')}


/* ===================== v1.9.4: Couch Versus (two players, one screen) ===================== */
const VS_CAST=['rachel','monica','phoebe','ross','joey','chandler'];
let VS=null,vsPrev='title';
function vsSpr(k){try{return charSprites(LK[k],k)}catch(e){return null}}
function vsDraw(c,k){tvPortrait(c,{spr:vsSpr(k)})}
function openVs(fromCouch){vsPrev=state;state='vs';VS={p:[{name:(S&&S.name)||'Player 1',k:'rachel',sc:0},{name:'Player 2',k:'joey',sc:0}],couch:!!fromCouch};
 $('#vs').classList.remove('hidden');$('#vsSetup').classList.remove('hidden');$('#vsGame').classList.add('hidden');$('#vsEnd').classList.add('hidden');
 if(S&&S.diff)$('#vsDiff').value=S.diff;vsSetup()}
function vsSetup(){$('#vsPlayers').innerHTML=VS.p.map((p,i)=>`<div class="vsP"><b>Player ${i+1}</b><br><input data-i="${i}" maxlength="12" value="${esc(p.name)}"><div class="vsPick">${VS_CAST.map(k=>`<button data-i="${i}" data-k="${k}" class="${p.k===k?'on':''}"><canvas width="100" height="100"></canvas>${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div></div>`).join('');
 $('#vsPlayers').querySelectorAll('.vsPick button').forEach(b=>{vsDraw(b.querySelector('canvas'),b.dataset.k);b.onclick=()=>{VS.p[+b.dataset.i].k=b.dataset.k;SFX.sel();vsSetup()}});
 $('#vsPlayers').querySelectorAll('input').forEach(inp=>inp.oninput=()=>{VS.p[+inp.dataset.i].name=inp.value.trim()||`Player ${+inp.dataset.i+1}`})}
function vsStart(){const n=+$('#vsN').value,d=$('#vsDiff').value;
 let pool=QB.map((q,i)=>Object.assign({i},q));const tg=q=>qTags(q);
 const trim=f=>{const p=pool.filter(f);if(p.length>=n)pool=p};
 if(d==='casual')trim(q=>!tg(q).includes('sf')&&!tg(q).includes('hard'));else if(d==='fan')trim(q=>!tg(q).includes('sf'));
 shuffle(pool);if(d==='super')pool.sort((a,b)=>qStars(b)-qStars(a));
 Object.assign(VS,{qs:pool.slice(0,n),k:0,turn:0,answered:false});VS.p.forEach(p=>p.sc=0);
 $('#vsSetup').classList.add('hidden');$('#vsGame').classList.remove('hidden');SFX.ok();vsRender()}
function vsHead(){$('#vsHead').innerHTML=VS.p.map((p,i)=>`<div class="vsS ${VS.turn===i&&!VS.over?'on':''}" id="vsS${i}"><canvas width="100" height="100"></canvas><div><b>${esc(p.name)}</b><span>${p.sc}</span></div></div>`).join('<div style="font-weight:900;color:#7a6a8a">VS</div>');
 VS.p.forEach((p,i)=>vsDraw($('#vsS'+i).querySelector('canvas'),p.k))}
function vsRender(){const q=VS.qs[VS.k];VS.answered=false;VS.opts=shuffle(q.a.slice());vsHead();
 const p=VS.p[VS.turn];$('#vsTurn').textContent=`${p.name}'s turn · question ${VS.k+1} of ${VS.qs.length}${qStars(q)>1?` · worth ${qStars(q)} points`:''}`;
 $('#vsQ').textContent=q.q;const pc=$('#vsPic');if(q.pic){pc.classList.remove('hidden');const g=pc.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,256,160);g.drawImage(drawPic(q.pic),0,0,256,160)}else pc.classList.add('hidden');
 $('#vsFact').innerHTML='';$('#vsNext').classList.add('hidden');
 $('#vsOptsA').innerHTML=VS.opts.map((a,i)=>`<button data-i="${i}"><b>${i+1}</b>${esc(a)}</button>`).join('');
 $('#vsOptsA').querySelectorAll('button').forEach(b=>b.onclick=()=>vsAnswer(+b.dataset.i))}
function vsAnswer(i){if(!VS||VS.answered)return;const q=VS.qs[VS.k],ok=VS.opts[i]===q.a[0],p=VS.p[VS.turn];VS.answered=true;
 $('#vsOptsA').querySelectorAll('button').forEach((b,j)=>{b.disabled=true;if(VS.opts[j]===q.a[0])b.classList.add('right');else if(j===i)b.classList.add('wrong')});
 if(ok){p.sc+=qStars(q);SFX.ok()}else SFX.bad();vsHead();const el=$('#vsS'+VS.turn);el.classList.add(ok?'hop':'shake');
 const rl=REACT[p.k]||REACT[''];$('#vsFact').innerHTML=`<b class="${ok?'good':'bad'}">${ok?'Correct!':'Not quite.'}</b> <i>“${esc(pickOne(rl[ok?'ok':'no']))}”</i> ${q.f?esc(q.f):ok?'':'The answer was '+esc(q.a[0])+'.'}${q.ep?`<span class="tvEp">📺 ${esc(q.ep)}</span>`:''}`;
 $('#vsNext').textContent=VS.k+1<VS.qs.length?'Next ▶':'Final score ▶';$('#vsNext').classList.remove('hidden')}
function vsNext(){if(!VS||!VS.answered)return;VS.k++;VS.turn=1-VS.turn;if(VS.k<VS.qs.length)vsRender();else vsEnd()}
function vsEnd(){VS.over=true;const[a,b]=VS.p,tie=a.sc===b.sc,w=a.sc>b.sc?a:b;$('#vsGame').classList.add('hidden');const e=$('#vsEnd');e.classList.remove('hidden');
 e.innerHTML=`<canvas id="vsWin" width="132" height="132"></canvas><div class="t">${tie?'The One Where Nobody Wins':`The One Where ${esc(w.name)} Wins`}</div><div class="sc">${esc(a.name)} ${a.sc} · ${b.sc} ${esc(b.name)}</div>
  <p><i>“${tie?"It's a tie. Which means you both get the couch. Scoot over.":esc(pickOne((REACT[w.k]||REACT['']).win))}”</i></p><button id="vsAgain">Rematch ▶</button><button id="vsSwap">New players</button><button id="vsQuit">Done</button>`;
 vsDraw($('#vsWin'),tie?'phoebe':w.k);SFX.ok();
 $('#vsAgain').onclick=()=>{VS.over=false;vsStart()};$('#vsSwap').onclick=()=>{VS.over=false;$('#vsEnd').classList.add('hidden');$('#vsSetup').classList.remove('hidden');vsSetup()};$('#vsQuit').onclick=closeVs}
function closeVs(){$('#vs').classList.add('hidden');VS=null;state=vsPrev==='vs'?'world':vsPrev;if(state==='dialog')state='world'}


/* ===================== v1.9.5: street life, day and night, the seasons ===================== */
let walkers=[],flakes=[],ambT=0;
const nightFacades={};
function loadNightArt(){for(const k of HD_FACADES){const im=new Image();im.onload=()=>{nightFacades[k]=im};im.src='sprites/village/night_'+k+'.png'}}
function timeMode(){try{return localStorage.getItem('friendsTrivia_time')||'auto'}catch(e){return'auto'}}
function cycleTime(){const m=['auto','day','dusk','night'],n=m[(m.indexOf(timeMode())+1)%m.length];try{localStorage.setItem('friendsTrivia_time',n)}catch(e){}
 toast(n==='auto'?'Time of day: follows your clock':'Time of day: '+n)}
// 0 = day … .55 = night; follows the real clock unless set with T
function darkness(){const m=timeMode();if(m==='day')return 0;if(m==='dusk')return .3;if(m==='night')return .55;
 const d=new Date(),h=d.getHours()+d.getMinutes()/60;if(h>=20||h<5.5)return .55;if(h>=18)return .3*(h-18)/2+.25*((h-18)/2);if(h<7)return .55*(7-h)/1.5;return 0}
function season(){const m=new Date().getMonth();return m===10?'autumn':(m===11||m<=1)?'winter':''}
function walkerLook(){const r=a=>a[(Math.random()*a.length)|0];const fem=Math.random()<.5;
 return{player:true,skin:r(SKINS),hair:r(HAIRS),style:fem?r(['long','ponytail','puffy','shaggy']):r(['shaggy','spiky','buzz','bald']),freckles:Math.random()<.2,
  shirt:r(['#3a5a8a','#8a3a3a','#5a7a4a','#c9a24a','#6a4a8a','#2a2a30','#c0573a','#e8e4d8','#4a6a7a']),pants:r(['#2b2b30','#3b4a6b','#5a4a3a','#3a3a44']),outfit:fem?r(OUTFITS):'pants'}}
function spawnWalkers(){walkers=[];flakes=[];if(!Zn.taxiRows||!Zn.taxiRows.length)return;
 const rows=[9,19].filter(r=>r<Zn.h&&Zn.g.slice(r*Zn.w,(r+1)*Zn.w).filter(t=>t==='walk').length>Zn.w*.6);
 for(const r of rows){const n=Math.max(2,Math.round(Zn.w/13));for(let i=0;i<n;i++)walkers.push({x:(i+Math.random()*.6)*Zn.w*16/n,row:r,dir:Math.random()<.5?-1:1,sp:15+Math.random()*10,spr:charSprites(walkerLook()),t:Math.random()*3,moving:true})}}
function updWalkers(dt){const W=Zn.w*16;for(const w of walkers){
 // they stop politely if you're standing right in front of them
 const ahead=w.dir>0?[w.x+10,w.x+24]:[w.x-10,w.x+6],py=player.py,blocked=Math.abs(py-w.row*16)<12&&player.px+12>ahead[0]&&player.px+4<ahead[1];
 w.moving=!blocked;if(w.moving){w.x+=w.dir*w.sp*dt;w.t+=dt}if(w.x>W+30)w.x=-30;if(w.x<-30)w.x=W+30}}
function drawAmbient(cx,cy,vw,vh,indoor,dt){if(indoor)return;const d=darkness(),sea=season(),T=clock;
 // December lights along the rooflines
 if(sea==='winter'&&new Date().getMonth()===11)for(const o of Zn.objs)if(o.kind==='building'&&o.hd&&hdFacades[o.hd]){const im=hdFacades[o.hd],w=o.w*16,h=im.height/8,top=(o.y+o.h)*16-h+5;
  if(o.x*16>cx+vw||o.x*16+w<cx)continue;const cols=['#ff4a4a','#4aff7a','#ffd84a','#5aa8ff'];
  ctx.strokeStyle='rgba(30,30,30,.6)';ctx.lineWidth=.5;ctx.beginPath();for(let x=0;x<=w;x+=2){const y=top+Math.sin(x/w*Math.PI*Math.max(2,o.w/3)*1)*1.5+1.5;x?ctx.lineTo(o.x*16+x,y):ctx.moveTo(o.x*16+x,y)}ctx.stroke();
  for(let x=3,i=0;x<w;x+=6,i++){const y=top+Math.sin(x/w*Math.PI*Math.max(2,o.w/3))*1.5+2.2,on=.55+.45*Math.sin(T*3+i*1.7);ctx.globalAlpha=on;ctx.fillStyle=cols[i%4];ctx.fillRect(o.x*16+x-.8,y-.8,1.6,1.6)}ctx.globalAlpha=1}
 if(d>0){ctx.save();ctx.globalCompositeOperation='multiply';ctx.fillStyle=`rgba(46,56,120,${Math.min(.85,d*1.5)})`;ctx.fillRect(cx-2,cy-2,vw+4,vh+4);ctx.restore();
  const a=Math.min(1,d*1.9);
  // lit windows
  for(const o of Zn.objs)if(o.kind==='building'&&o.hd&&nightFacades[o.hd]&&hdFacades[o.hd]){const im=hdFacades[o.hd],w=o.w*16,h=im.height/8,by=(o.y+o.h)*16;if(o.x*16>cx+vw||o.x*16+w<cx)continue;
   ctx.globalAlpha=a;ctx.imageSmoothingEnabled=true;ctx.drawImage(nightFacades[o.hd],o.x*16,by-h,w,h);ctx.imageSmoothingEnabled=false}
  ctx.globalAlpha=1;ctx.save();ctx.globalCompositeOperation='lighter';
  const glow=(x,y,r,c)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)};
  for(const o of Zn.objs){if(o.kind==='lamp')glow(o.x*16+8,o.y*16-18,30,`rgba(255,196,110,${.42*a})`);}
  for(const dd of Zn.doors)glow(dd.x*16+8,dd.y*16+6,16,`rgba(255,200,120,${.28*a})`);
  for(const t of taxis){const fx=t.dir>0?t.x+CAR_LEN-4:t.x+4,fy=t.by-9,g=ctx.createLinearGradient(fx,0,fx+t.dir*44,0);g.addColorStop(0,`rgba(255,240,190,${.26*a})`);g.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(fx,fy-2);ctx.lineTo(fx+t.dir*44,fy-10);ctx.lineTo(fx+t.dir*44,fy+8);ctx.lineTo(fx,fy+2);ctx.closePath();ctx.fill()}
  ctx.restore()}
 // falling leaves in November, snow in winter
 if(sea){if(flakes.length<46)flakes.push({x:cx+Math.random()*vw,y:cy-6,vx:(Math.random()-.5)*8,vy:sea==='winter'?10+Math.random()*10:14+Math.random()*10,ph:Math.random()*6,c:sea==='winter'?'#ffffff':['#d9782f','#b8462a','#e8b830','#8a5a2a'][(Math.random()*4)|0]});
  for(const f of flakes){f.y+=f.vy*dt;f.x+=(f.vx+Math.sin(T*2+f.ph)*(sea==='winter'?4:10))*dt;if(f.y>cy+vh+4||f.x<cx-10||f.x>cx+vw+10){f.y=cy-4;f.x=cx+Math.random()*vw}
   ctx.fillStyle=f.c;ctx.globalAlpha=sea==='winter'?.9:.95;if(sea==='winter')ctx.fillRect(f.x,f.y,1.2,1.2);else{ctx.save();ctx.translate(f.x,f.y);ctx.rotate(T*2+f.ph);ctx.fillRect(-1.2,-.7,2.4,1.4);ctx.restore()}}ctx.globalAlpha=1}}

/* ===================== Subway & travel ===================== */
const STOPS=[{id:'village',name:'Greenwich Village',sub:'Bleecker St · Central Perk, the apartments'},{id:'soho',name:'SoHo',sub:'Spring St · Moondance Diner'},
 {id:'midtown',name:'Midtown',sub:"5 Av / 59 St · Chandler's office, Bloomingdale's, the Garden"},{id:'uptown',name:'Uptown',sub:'81 St · the Museum, Central Park fountain'},
 {id:'queens',name:'Queens',sub:'Queensboro Plaza · Silvercup Studios'},{id:'airport',name:'JFK Airport',sub:'AirTrain · flights to London, Vegas, Barbados, Montauk',need:10}];
function itemCount(){return Object.keys(S.items).length}
function openSubway(){state='menu';const n=itemCount();$('#subway').classList.remove('hidden');
 $('#subList').innerHTML=STOPS.map(st=>{const here=Zn.id===st.id,lock=st.need&&n<st.need;return`<button data-id="${st.id}" ${here||lock?'disabled':''}><b>${esc(st.name)}${here?' · you are here':''}</b><small>${lock?`🔒 Collect ${st.need} items to unlock (you have ${n})`:esc(st.sub)}</small></button>`}).join('');
 $('#subList').querySelectorAll('button').forEach(b=>b.onclick=()=>{const z=ZONES[b.dataset.id],sp=z.subwaySpawn;closePanels();travel((b.dataset.id==='airport'?'🚆  AirTrain to ':'🚇  Next stop: ')+z.name,b.dataset.id,sp[0],sp[1],sp[2])})}
/* v1.9.1: a short clip when you take the subway: a '90s silver train rushes through the station */
function subwayClip(label,line,onCovered,onDone){const t=$('#travel'),cv=$('#travelCv'),g=cv.getContext('2d'),W=cv.width,H=cv.height;t.classList.add('on','clip');$('#travelText').textContent=label;
 const T0=performance.now(),DUR=2300,carW=230,cars=4,trainW=cars*carW,col=line.col;let covered=false;
 const P=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 function frame(now){const k=Math.min(1,(now-T0)/DUR);g.imageSmoothingEnabled=false;
  // station: tiled wall, mosaic band, platform edge
  P('#d9d2bf',0,0,W,H);for(let y=0;y<150;y+=10)for(let x=(y/10%2)*10;x<W;x+=20)P('#cfc7b2',x,y,10,10);
  P('#3a5a7a',0,26,W,14);for(let x=0;x<W;x+=12)P('#c9a24a',x+3,30,6,6);
  P('#20202a',0,46,W,26);g.fillStyle='#f4f1ea';g.font='bold 16px ui-monospace,Menlo,monospace';g.textAlign='center';g.textBaseline='middle';
  for(let x=W/4;x<W;x+=W/2)g.fillText(line.stop,x,59);
  for(let x=20;x<W;x+=70){P('#6a5a4a',x,72,10,98);P('#8a7a6a',x,72,3,98)}
  P('#2a2a30',0,150,W,70);P('#1a1a20',0,214,W,6);for(let x=0;x<W;x+=18)P('#4a3a2a',x,206,10,4);
  P('#9a9a9e',0,218,W,52);P('#f2c230',0,218,W,6);for(let x=0;x<W;x+=8)P('#c99a10',x,220,4,2);
  // the train: enters from the right, fast, eases out to the left
  const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,x0=W+40-(W+trainW+80)*e;
  for(let c=0;c<cars;c++){const x=x0+c*carW;if(x>W||x+carW<0)continue;
   P('#b8bcc4',x,96,carW-8,112);P('#d6d9df',x,96,carW-8,6);for(let r=0;r<6;r++)P('#a6aab2',x,128+r*12,carW-8,2);
   for(let w=0;w<4;w++){const wx=x+14+w*52;P('#2a3040',wx,110,34,26);P('#f4e9b0',wx+2,112,30,10);P('#e8dc9a',wx+2,122,30,12)}
   for(const d of[44,150]){P('#8a8e96',x+d,104,22,96);P('#2a3040',x+d+3,110,16,30)}
   P('#3a3a40',x+carW-8,104,8,96);P('#1a1a1e',x+10,200,carW-28,8);
   for(const wx of[x+30,x+carW-50]){g.fillStyle='#222';g.beginPath();g.arc(wx,208,8,0,7);g.fill()}
   if(c===0){g.fillStyle=col;g.beginPath();g.arc(x+20,150,13,0,7);g.fill();g.fillStyle='#fff';g.font='bold 15px Helvetica,Arial,sans-serif';g.fillText(line.id,x+20,151);P('#fff6c0',x+2,180,8,8)}
  }
  // speed streaks and sparks while it rushes past
  const sp=Math.sin(k*Math.PI);if(sp>.3){g.globalAlpha=sp*.35;for(let i=0;i<14;i++)P('#ffffff',(i*97+now*.9)%W,100+((i*37)%100),40,2);g.globalAlpha=1;
   for(let i=0;i<5;i++)if(Math.random()<.6)P('#ffd84a',x0+20+Math.random()*trainW*.9,208+Math.random()*6,3,2)}
  if(!covered&&k>.45){covered=true;onCovered()}
  if(k<1)requestAnimationFrame(frame);else{t.classList.remove('on','clip');onDone()}}
 requestAnimationFrame(frame);
 // a rumble that rises and fades
 try{if(AC){const n=AC.createBufferSource(),b=AC.createBuffer(1,AC.sampleRate*2.3,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++){const q=i/d.length;d[i]=(Math.random()*2-1)*Math.sin(Math.PI*q)*.25}
  n.buffer=b;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=380;n.connect(f).connect(AC.destination);n.start()}}catch(e){}
 setTimeout(()=>beep(880,.12,'square',.03),1500);setTimeout(()=>beep(698,.2,'square',.03),1650)}
const SUBWAY_LINES={village:{id:'6',col:'#2a9a4a',stop:'BLEECKER ST'},midtown:{id:'N',col:'#f2c230',stop:'5 AV / 59 ST'},soho:{id:'C',col:'#2a5ab8',stop:'SPRING ST'},
 uptown:{id:'B',col:'#f07a1a',stop:'81 ST – MUSEUM'},queens:{id:'7',col:'#9a3aa8',stop:'QUEENSBORO PLAZA'},airport:{id:'✈',col:'#3a6aa8',stop:'JFK AIRTRAIN'}};
function travel(text,to,x,y,dir){if(SUBWAY_LINES[to]){state='fade';SFX.door();
  subwayClip(text,SUBWAY_LINES[to],()=>loadZone(to,x,y,dir),()=>{state='world';const intro=INTROS[to];if(intro&&!S.talked[to+'Intro']){S.talked[to+'Intro']=1;save();say(intro)}});return}
 state='fade';const t=$('#travel');$('#travelText').textContent=text;t.classList.add('on');SFX.door();setTimeout(()=>beep(523,.18,'triangle',.05),300);setTimeout(()=>beep(659,.18,'triangle',.05),550);
 setTimeout(()=>{loadZone(to,x,y,dir);},700);setTimeout(()=>{t.classList.remove('on');state='world';const intro=INTROS[to];if(intro&&!S.talked[to+'Intro']){S.talked[to+'Intro']=1;save();say(intro)}},1600)}

/* ===================== Easter eggs ===================== */
let forceEggs=false,eggsHere=[];
function spawnEggs(nosave){Zn.objs=Zn.objs.filter(o=>!o.egg);Zn.acts=Zn.acts.filter(a=>!a.egg);const out=[];if(nosave&&!forceEggs)return out;
 eggsHere=[];
 for(const e of EGGS){if(e.zone!==Zn.id||!(forceEggs||R()<EGG_CHANCE))continue;eggsHere.push(e.id);
  for(const o of e.objs||[]){const ob=Object.assign({egg:e.id},o);ob.spr=makeObj(ob);Zn.objs.push(ob)}
  for(const[x,y]of e.acts||[])Zn.acts.push({x,y,type:'egg',egg:e.id});
  for(const n of e.npcs||[]){const[x,y]=n.spots[(R()*n.spots.length)|0];out.push({id:'egg_'+e.id+'_'+n.name,name:n.name,cast:!n.animal,x,y,dir:n.dir||'down',look:n.look,egg:e.id,talk:'egg',
   wander:n.wander?[Math.max(0,x-4),Math.max(0,y-3),9,7]:null,walkOn:n.animal?['grass','path']:['walk','path','grass']})}}
 return out}
function eggFound(id){if(!S.eggs)S.eggs={};if(S.eggs[id])return;S.eggs[id]=Date.now();save();const n=Object.keys(S.eggs).length;toast(`🥚 Secret sighting! (${n}/${EGGS.length})`);[784,988,1175].forEach((f,i)=>beep(f,.1,'triangle',.05,i*.08))}
function eggTalk(id){const e=EGGS.find(q=>q.id===id);eggFound(id);say(e.lines.map(l=>Object.assign({},l)))}
function eggIcon(e){const L=e.look||(e.npcs&&e.npcs[0].look),sp=L&&charSprites(L);
 if(e.id==='porsche'&&hdProps.carcover){const p=hdProps.carcover,[c,g]=mk(128,128),h=120*p.height/p.width;art(g,p,4,64-h/2,120,h);c.hd=true;return c}
 if(sp&&sp.hd){const[c,g]=mk(128,128),w=126*HD_CW/HD_CH;art(g,sp.down[0],64-w/2,2,w,126);c.hd=true;return c}
 const[c,g]=mk(32,32);g.imageSmoothingEnabled=false;if(e.id==='porsche'){const s=makeObj({kind:'carcover',x:0,y:0}).c;g.drawImage(s,0,6,32,s.height*32/s.width)}else{g.drawImage(sp.down[0],4,2,24,36)}return c}

/* ===================== Finale ===================== */
function finaleReady(){return ITEMS.every(i=>i.id==='key'||i.bonus||S.items[i.id])}
const FINALE_CAST=[['monica_f','Monica',3,11,'right',{skin:'#efc9a8',hair:'#2a1d17',style:'bob',fem:true,shirt:'#c0573a',pants:'#2b2b30'}],['chandler_f','Chandler',3,13,'right',{skin:'#efc9a8',hair:'#4a3426',style:'short',shirt:'#5a7a5a',pants:'#3b3b4a'}],
 ['joey_f','Joey',8,12,'left',{skin:'#e8bf9a',hair:'#2a1d17',style:'short',shirt:'#4a5a8a',pants:'#2b2b30'}],['ross_f','Ross',9,13,'left',{skin:'#efc9a8',hair:'#4a3426',style:'short',shirt:'#7a8a6a',pants:'#3b3b4a'}]];
function addFinaleCast(){if(Zn.id!=='perk'||!finaleReady())return;for(const[id,name,x,y,dir,look]of FINALE_CAST)if(!npcs.some(n=>n.id===id))npcs.push({id,name,cast:true,x,y,dir,look,seated:x===3&&y===13||x===8&&y===12,px:x*16,py:y*16,home:{x,y,dir},moving:false,t:0,wait:9,spr:charSprites(look,id),lines:["Go sit on the couch. Everybody's waiting!"]})}
function showCredits(){state='menu';const c=$('#credits');c.classList.remove('hidden');
 const main=ITEMS.filter(i=>!i.bonus),bon=ITEMS.filter(i=>i.bonus);$('#crStats').innerHTML=`<b>${main.filter(i=>S.items[i.id]).length}</b> of ${main.length} story collectibles · <b>${bon.filter(i=>S.items[i.id]).length}</b> of ${bon.length} superfan extras · <b>${Object.keys(S.eggs||{}).length}</b> of ${EGGS.length} secret sightings · <b>${S.stars}</b> correct answers`;
 $('#crNote').classList.toggle('hidden',!PERSONAL_NOTE);$('#crNote').textContent=PERSONAL_NOTE;$('#crBy').textContent=MADE_BY;
 const g=$('#crCv').getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,320,48);ITEMS.filter(it=>S.items[it.id]).forEach((it,i)=>art(g,itemArt(it.id),(i%13)*24+2,(i/13|0)*16,22,22));
 [523,659,784,659,784,1047].forEach((f,i)=>beep(f,.22,'triangle',.06,i*.18))}

/* ===================== Wearables ===================== */
const WEAR={turkey:{slot:'head',hat:'turkey'},hat:{slot:'head',hat:'unionjack'},veil:{slot:'head',hat:'veil'},wig:{slot:'head',hat:'wig'},
 armadillo:{slot:'body',costume:'armadillo'},pants:{slot:'body',pants:'#1d1b22',outfit:'pants',leather:true},
 umbrella:{slot:'hand',held:'umbrella'},hugsy:{slot:'hand',held:'hugsy'},bag:{slot:'hand',held:'bag'},purse:{slot:'hand',held:'purse'},paddle:{slot:'hand',held:'paddle'},mug:{slot:'hand',held:'mug'},puck:{slot:'hand',held:'puck'}};
function playerLook(){const L=Object.assign({player:true},S.look);for(const id of Object.values(S.equip||{})){const w=WEAR[id];if(!w||!S.items[id])continue;const{slot,...rest}=w;Object.assign(L,rest)}return L}
function refreshPlayer(){player.spr=charSprites(playerLook())}
function toggleWear(id){const w=WEAR[id];if(!w)return;S.equip=S.equip||{};if(S.equip[w.slot]===id){delete S.equip[w.slot];toast('Took off: '+ITEM(id).name)}else{S.equip[w.slot]=id;toast('Now wearing: '+ITEM(id).name);SFX.sel()}refreshPlayer();save();openColl()}
function drawDoll(){const c=$('#doll');if(!c)return;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,c.width,c.height);const sp=charSprites(playerLook());const w=sp.hd?Math.round(48*HD_CW/HD_CH):32;art(g,sp.down[0],0,0,w,48);art(g,sp.right[0],w+2,0,w,48)}

/* ===================== Leaderboard ===================== */
function statsOf(p){const items=p.items||{},main=ITEMS.filter(i=>!i.bonus),bon=ITEMS.filter(i=>i.bonus);const m=main.filter(i=>items[i.id]).length,b=bon.filter(i=>items[i.id]).length,e=Object.keys(p.eggs||{}).length,st=p.stars||0;
 return{name:p.name,m,b,e,st,done:!!items.key,zone:p.zone,score:m*100+b*150+e*50+st*5+(items.key?500:0),t:p.updated||0}}
function shareCode(){const x=statsOf(S);return'TOWTG1:'+btoa(unescape(encodeURIComponent(JSON.stringify({n:x.name,m:x.m,b:x.b,e:x.e,s:x.st,d:x.done?1:0,z:x.zone,t:Date.now()}))))}
function importCode(txt){const m=String(txt).trim().match(/TOWTG1:([A-Za-z0-9+/=]+)/);if(!m)return'That doesn\'t look like a score code. It should start with TOWTG1:';
 try{const o=JSON.parse(decodeURIComponent(escape(atob(m[1]))));if(!o.n)throw 0;const st=loadStore();st.imports[o.n]={name:String(o.n).slice(0,20),m:+o.m|0,b:+o.b|0,e:+o.e|0,st:+o.s|0,done:!!o.d,zone:o.z,score:(+o.m|0)*100+(+o.b|0)*150+(+o.e|0)*50+(+o.s|0)*5+(o.d?500:0),t:+o.t||Date.now(),imported:true};writeStore(st);return'Added '+o.n+'!'}catch(e){return'Hmm, that code didn\'t work. Try copying it again.'}}
function zoneName(id){return ZONES[id]?ZONES[id].name:'—'}
function openBoard(fromTitle){if(!fromTitle)state='menu';const st=loadStore();const rows=[...Object.values(st.saves).map(statsOf),...Object.values(st.imports).filter(i=>!st.saves[i.name])].sort((a,b)=>b.score-a.score);
 $('#board').classList.remove('hidden');
 $('#boardRows').innerHTML=rows.length?rows.map((r,i)=>`<tr class="${S&&r.name===S.name?'me':''}"><td>${['🥇','🥈','🥉'][i]||i+1}</td><td><b>${esc(r.name)}</b>${r.imported?' <small>(shared)</small>':''}</td><td><b>${r.score}</b></td><td>${r.m}/${ITEMS.filter(i=>!i.bonus).length}${r.b?` +${r.b}`:''}</td><td>${r.e}/${EGGS.length}</td><td>${r.st}</td><td>${r.done?'🔑 Finished!':esc(zoneName(r.zone))}</td></tr>`).join(''):'<tr><td colspan="7">No players yet!</td></tr>';
 $('#myCode').value=S?shareCode():'';$('#shareRow').classList.toggle('hidden',!S);$('#importMsg').textContent=''}
function closeBoard(){$('#board').classList.add('hidden');if(state==='menu')state='world'}

/* ===================== Collection & help ===================== */
function openColl(){state='menu';$('#coll').classList.remove('hidden');const got=ITEMS.filter(i=>S.items[i.id]).length;
 $('#collCount').textContent=`${got} / ${ITEMS.length}`;drawDoll();
 const card=it=>{const has=S.items[it.id],w=WEAR[it.id],on=w&&S.equip&&S.equip[w.slot]===it.id;return`<div class="card ${has?'got':''} ${it.bonus?'bonus':''}"><canvas data-id="${it.id}" width="128" height="128"></canvas><b>${has?esc(it.name):'???'}</b><small>${has?esc(it.desc):esc(it.hint)}</small><em>${esc(it.from)}</em>${has&&w?`<button class="wear ${on?'on':''}" data-wear="${it.id}">${on?'✓ Wearing · take off':(w.slot==='hand'?'Carry it':'Wear it')}</button>`:''}</div>`};
 $('#collGrid').innerHTML='<h3>The Story</h3>'+ITEMS.filter(i=>!i.bonus).map(card).join('')+'<h3>Superfan Extras <small>(optional, very hard)</small></h3>'+ITEMS.filter(i=>i.bonus).map(card).join('')+`<h3>Secret Sightings <small>(${Object.keys(S.eggs||{}).length} of ${EGGS.length} spotted, keep exploring!)</small></h3>`+EGGS.map(e=>{const f=S.eggs&&S.eggs[e.id];return`<div class="card egg ${f?'got':''}"><canvas data-egg="${e.id}" width="128" height="128"></canvas><b>${f?esc(e.title):'???'}</b><small>${esc(e.hint)}</small></div>`}).join('');
 $('#collGrid').querySelectorAll('button[data-wear]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleWear(b.dataset.wear)});
 $('#collGrid').querySelectorAll('canvas').forEach(c=>{const g=c.getContext('2d');if(c.dataset.egg){const e=EGGS.find(q=>q.id===c.dataset.egg),ic=eggIcon(e);art(g,S.eggs&&S.eggs[e.id]?ic:silhouette(ic),0,0,c.width,c.height);return}const ic=itemArt(c.dataset.id);art(g,S.items[c.dataset.id]?ic:silhouette(ic),0,0,c.width,c.height)})}
function closePanels(){if(!$('#subway').classList.contains('hidden')){subwayArmed=false;subwayTile=[player.x,player.y]}for(const id of['#coll','#help','#subway','#credits','#board','#mapP'])$(id).classList.add('hidden');state='world'}
function openHelp(){state='menu';setupHelpDiff();$('#help').classList.remove('hidden')}

/* ===================== HUD ===================== */
function updHud(){if(!S)return;$('#cntItems').textContent=`${Object.keys(S.items).length}/${ITEMS.length}`;$('#cntStars').textContent=S.stars}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}

/* ===================== Render ===================== */
let cam={x:0,y:0};
function draw(){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=Zn.bg;ctx.fillRect(0,0,cv.width,cv.height);
 const vw=VW*16,vh=VH*16;let cx=player.px+8-vw/2,cy=player.py+8-vh/2;
 cx=Zn.w*16<=vw?(Zn.w*16-vw)/2:clamp(cx,0,Zn.w*16-vw);cy=Zn.h*16<=vh?(Zn.h*16-vh)/2:clamp(cy,0,Zn.h*16-vh);cx=Math.round(cx);cy=Math.round(cy);cam={x:cx,y:cy};
 ctx.setTransform(SC*RS,0,0,SC*RS,-cx*SC*RS,-cy*SC*RS);ctx.imageSmoothingEnabled=false;
 const x0=Math.max(0,Math.floor(cx/16)),x1=Math.min(Zn.w-1,Math.floor((cx+vw)/16)),y0=Math.max(0,Math.floor(cy/16)),y1=Math.min(Zn.h-1,Math.floor((cy+vh)/16));
 const indoor=!Zn.taxiRows.length&&!Zn.g.includes('road');
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=Zn.g[y*Zn.w+x],G=(!indoor&&hdGround[t])||hdFloor[t];
  if(G){const n=t==='walk'?2:4,S=128;let sx,sy;if(t==='laneH'||t==='crossH'){sx=(x%4)*S;sy=0}else if(t==='laneV'||t==='crossV'){sx=0;sy=(y%4)*S}else if(t==='wains'||t==='wainsT'){sx=(x%4)*S;sy=0}else if(t==='stairs'){sx=0;sy=0}else{sx=(x%n)*S;sy=(y%n)*S}
   ctx.imageSmoothingEnabled=true;ctx.drawImage(G,sx,sy,S,S,x*16,y*16,16.05,16.05);ctx.imageSmoothingEnabled=false}
  else ctx.drawImage(tile(t,x,y),x*16,y*16);if(t==='walk')curb(x,y)}
 if(clickMark){clickMark.t+=.05;const a=.5+.4*Math.sin(clickMark.t*4),mx=clickMark.x*16+8,my=clickMark.y*16+12;ctx.fillStyle=`rgba(255,216,74,${a})`;ctx.beginPath();ctx.moveTo(mx,my-4);ctx.lineTo(mx+6,my);ctx.lineTo(mx,my+4);ctx.lineTo(mx-6,my);ctx.closePath();ctx.fill()}
 const vis=(x,y,w,h)=>x+w>=cx-40&&x<=cx+vw+40&&y+h>=cy-60&&y<=cy+vh+60;
 const L=[];
 for(const o of Zn.objs){const s=o.spr,dx=o.x*16+s.ox,dy=o.y*16+s.oy;if(!vis(dx,dy,s.c.width,s.c.height))continue;
  const isp=inSpec(o),hi=isp&&inImg(o,isp);
  if(hi&&(isp.box||isp.wall||isp.flat)){if(isp.flat){const w=hi.width/8,h=hi.height/8;smooth(true);ctx.drawImage(hi,dx+s.c.width/2-w/2,dy+s.c.height/2-h/2,w,h);smooth(false)}else drawFlat(hi,isp,dx,dy,s.c.width,s.c.height);
   if(o.kind==='walldoor'&&o.frame){px(ctx,'#e2b82a',dx+5,dy+12,6,6);px(ctx,'#f2d45a',dx+5,dy+12,6,1);px(ctx,'#3a2a10',dx+7,dy+14,2,2)}continue}
  if(hi){const fh=o.h||(['dino'].includes(o.kind)?2:1),by=isp.sl?(o.y+1)*16+2:dy+s.c.height-(o.lift||0);
   if(isp.sl){const W=(o.w||1)*16;L.push({y:(o.y+1)*16,d:()=>drawSliced(hi,o.x*16,by,W,isp.e)});continue}
   // keep furniture out of the walls beside it: slide it flush against a side wall instead of overlapping it
   let cx=dx+s.c.width/2;{const t=fp(o),hw=hi.width/16,ys=t.length?t.map(q=>q[1]):[o.y],xs=t.length?t.map(q=>q[0]):[o.x],x0=Math.min(...xs),x1=Math.max(...xs)+1,
    wallAt=x=>ys.some(y=>{const g=gAt(x,y);return x<0||x>=Zn.w||(SOLID_T.has(g)&&g!=='water')});
    if(wallAt(x0-1)&&cx-hw<x0*16)cx=x0*16+hw;else if(wallAt(x1)&&cx+hw>x1*16)cx=x1*16-hw}
   L.push({y:(o.y+fh)*16,d:()=>drawHDProp(hi,cx,by,!['stanchion','mic','coatrack','floorlamp','palm','clocktower','column'].includes(o.kind),isp.flip||(o.flip&&!isp.flip))});continue}
  if(o.low||o.kind==='wallsign'||o.kind==='menu'||o.kind==='window'||o.kind==='frame'||o.kind==='walldoor'||o.kind==='bigwindow'||o.kind==='board'||o.kind==='towel'||o.kind==='poster'||o.kind==='banner'){ctx.drawImage(s.c,dx,dy);continue}
  const fh=o.kind==='building'?o.h:(['subway','dino','fountain'].includes(o.kind)?2:1);const hp=hdProps[o.kind];
  if(o.kind==='building'&&o.hd&&hdFacades[o.hd]){const im=hdFacades[o.hd],w=o.w*16,h=im.height/8,by=(o.y+o.h)*16;
   L.push({y:(o.y+fh)*16,d:()=>{ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,o.x*16,by-h,w,h);ctx.imageSmoothingEnabled=false}});continue}
  const vk=o.kind==='tree'&&o.park?'tree_park':o.kind,vp=hdVProps[vk];
  if(vp&&o.kind!=='car'){const cx=dx+s.c.width/2,by=dy+s.c.height,shadow=!['fence','sign','subway','barricade'].includes(o.kind);
   if(o.kind==='barricade'){L.push({y:(o.y+fh)*16,d:()=>drawHDProp(vp,cx,by,true)});continue}
   L.push({y:(o.y+fh)*16,d:()=>drawHDProp(vp,cx,by,shadow)});continue}
  // v2.0: the London bus and the trip cabs at real-world size (bus art faces left, cab art faces right)
  if((o.kind==='bus'||o.kind==='cab')&&hdIn[o.kind]){const k=o.kind==='cab'&&o.yellow?'car_taxi90':o.kind,src=hdIn[k];
   const sp=vehInfo[k]||(vehInfo[k]=carInfo((()=>{const[c,g]=mk(src.width,src.height);g.drawImage(src,0,0);return c})(),k)),
    len=o.kind==='bus'?176:CAR_LEN,by=o.y*16+17,cx=o.x*16+(o.kind==='bus'?88:48),dir=o.dir||1,flip=o.kind==='bus'?dir>0:dir<0;
   L.push({y:by,d:()=>drawCar(sp,cx,by,flip,len*8/sp.l.width,null)});continue}
  if((o.kind==='car'&&hdVProps.car)||(o.kind==='grantaxi'&&hdIn.grantaxi)){const md=CAR_MODELS[o.model!==undefined?o.model:(o.x*7+o.y*3)%4],sp=o.kind==='grantaxi'?(grantaxiInfo||(grantaxiInfo=carInfo((()=>{const[c,g]=mk(hdIn.grantaxi.width,hdIn.grantaxi.height);g.drawImage(hdIn.grantaxi,0,0);return c})(),'grantaxi'))):(carHD(o.color,false,md)||carHD(o.color,false)),
   by=Zn.wide?(o.y===11?11*16+9:18*16-1):o.y*16+17,cx=o.x*16+17;L.push({y:by,d:()=>drawCar(sp,cx,by,(o.dir||1)<0,CAR_LEN/(sp.l.width/8),null)});continue}
  L.push({y:(o.y+fh)*16,d:hp?()=>{const w=s.c.width,h=w*hp.height/hp.width;ctx.imageSmoothingEnabled=true;ctx.drawImage(hp,dx,dy+s.c.height-h,w,h);ctx.imageSmoothingEnabled=false}:()=>ctx.drawImage(s.c,dx,dy)})}
 for(const t of taxis){if(!vis(t.x,t.by-40,CAR_LEN,44))continue;L.push({y:t.by,d:()=>{const hs=carHD(t.col,t.taxi,t.model)||carHD(t.col,t.taxi);if(hs){drawCar(hs,t.x+CAR_LEN/2,t.by,t.dir<0,CAR_LEN/(hs.l.width/8),null);return}const sp=carSprite(t.col,t.taxi);ctx.drawImage(t.dir>0?sp.r:sp.l,Math.round(t.x),t.row*16+16-21)}})}
 for(const n of npcs)L.push({y:n.py+16+.3,d:()=>drawChar2(n,n.spr,n.dir,n.moving?(n.t<.5?1+((n.x+n.y)&1):0):0,n.px,n.py,n.sit||n.seated)});
 L.push({y:player.py+16+.6,d:()=>drawChar2(null,player.spr,player.dir,player.moving?(player.t<.55?1+player.step:0):0,player.px,player.py,player.sit)});
 for(const w of walkers){if(!vis(w.x-8,w.row*16-24,32,40))continue;L.push({y:w.row*16+16+.2,d:()=>drawChar2(null,w.spr,w.dir<0?'left':'right',w.moving?((w.t*5|0)%2)+1:0,w.x,w.row*16,false)})}
 L.sort((a,b)=>a.y-b.y);for(const e of L)e.d();
 {const now=performance.now(),dt=Math.min(.05,(now-(ambT||now))/1000);ambT=now;drawAmbient(cx,cy,vw,vh,indoor,dt)}
 // screen-space text
 const k2=SC/2;ctx.setTransform(k2*RS,0,0,k2*RS,0,0);
 const W2=(wx,wy)=>[(wx-cx)*2,(wy-cy)*2];
 ctx.textAlign='center';ctx.textBaseline='middle';
 for(const n of npcs)if(n.busker){for(let i=0;i<2;i++){const ph=(clock*.6+i*.5)%1,[sx,sy]=W2(n.px+10+i*6+Math.sin(ph*6)*3,n.py-12-ph*18);ctx.globalAlpha=1-ph;ctx.font='bold 12px serif';ctx.fillStyle='#2a1a3a';ctx.fillText(i?'♫':'♪',sx,sy)}ctx.globalAlpha=1}
 for(const o of Zn.objs){if(o.kind==='building'&&o.sign){const hdS=o.hd&&hdFacades[o.hd]&&o.signLift;const[sx,sy]=hdS?W2(o.x*16+o.signCx,(o.y+o.h)*16-o.signLift):W2((o.x+(o.shopW||o.w)/2)*16,(o.y+o.h)*16-32+6.5);if(sx<-200||sx>640/k2+200)continue;ctx.font='bold 11px ui-monospace,Menlo,Consolas,monospace';if(hdS&&o.plate){const tw=Math.min(ctx.measureText(o.sign).width,o.signW*2)+16;ctx.fillStyle=o.signBg||'#1a1a1a';ctx.fillRect(sx-tw/2,sy-9,tw,17);ctx.strokeStyle='#c9a24a';ctx.lineWidth=1;ctx.strokeRect(sx-tw/2+.5,sy-8.5,tw-1,16)}ctx.fillStyle=o.signFg||'#f4e9c8';ctx.fillText(o.sign,sx,sy,hdS?o.signW*2:((o.shopW||o.w)*16-6)*2)}
  else if(o.kind==='walldoor'&&o.num&&hdIn.walldoor){const[sx,sy]=W2(o.x*16+8,o.y*16-18+8.5);ctx.font='bold 8px ui-monospace,Menlo,monospace';ctx.fillStyle='#e8c860';ctx.fillText(o.num,sx,sy)}
  else if(o.kind==='wallsign'){const[sx,sy]=W2((o.x+o.w/2)*16,13);ctx.font='italic bold 22px Georgia,serif';ctx.fillStyle='#f3e1b0';ctx.fillText(o.text,sx,sy)}
  else if(o.kind==='sign'){const[sx,sy]=W2(o.x*16+8,o.y*16-22);ctx.font='bold 9px ui-monospace,Menlo,monospace';const w=ctx.measureText(o.text).width+8;ctx.fillStyle='#2f7a4a';ctx.fillRect(sx-w/2,sy-7,w,14);ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(sx-w/2+1.5,sy-5.5,w-3,11);ctx.fillStyle='#fff';ctx.fillText(o.text,sx,sy+.5)}
  else if(o.kind==='gatedesk'){const[sx,sy]=W2(o.x*16+16,o.y*16-10);ctx.font='bold 9px ui-monospace,Menlo,monospace';const w=ctx.measureText(o.text).width+10;ctx.fillStyle='#1a2a4a';ctx.fillRect(sx-w/2,sy-7,w,14);ctx.fillStyle='#ffd84a';ctx.fillText(o.text,sx,sy+.5)}
  else if(o.kind==='subway'){const[sx,sy]=W2(o.x*16+16,o.y*16-6);ctx.font='bold 9px ui-monospace,Menlo,monospace';const w=ctx.measureText(o.text).width+10;ctx.fillStyle='#1c1c22';ctx.fillRect(sx-w/2,sy-7,w,14);ctx.fillStyle='#fff';ctx.fillText(o.text,sx,sy+.5)}}
 ctx.setTransform(RS,0,0,RS,0,0);const W3=(wx,wy)=>[(wx-cx)*SC,(wy-cy)*SC];
 for(const n of npcs){if(!n.cast)continue;let[sx,sy]=W3(n.px+8,n.py-(n.sit||n.seated?4:0)-12-(n.spr&&n.spr.hd?24*(HD_DRAW-1)+2:0));sy=Math.max(sy,26);ctx.font='bold 10px ui-monospace,Menlo,monospace';const w=ctx.measureText(n.name).width+10;
  ctx.fillStyle='rgba(28,20,40,.82)';rr(sx-w/2,sy-8,w,15,6);ctx.fill();ctx.fillStyle='#fff3c4';ctx.fillText(n.name,sx,sy);
  if(n.reward&&!S.items[n.reward]){const b=Math.sin(clock*4)*2;ctx.fillStyle='#ffd84a';rr(sx+w/2-2,sy-20+b,14,14,7);ctx.fill();ctx.fillStyle='#3a2a10';ctx.font='bold 11px ui-monospace,monospace';ctx.fillText('?',sx+w/2+5,sy-13+b)}}
 for(const n of npcs){if(n.cast||!n.quiz||n.asked)continue;const[sx,sy]=W3(n.px+8,n.py-16);const b=Math.sin(clock*4+n.x)*2;ctx.fillStyle='#ffffff';rr(sx-6,sy-7+b,12,12,6);ctx.fill();ctx.fillStyle='#5b3a8c';ctx.font='bold 10px ui-monospace,monospace';ctx.fillText('?',sx,sy-1+b)}
 for(const t of taxis)if(t.honk>1.2){const[sx,sy]=W3(t.x+CAR_LEN/2,t.by-40);ctx.font='bold 11px ui-monospace,monospace';ctx.fillStyle='#fff';rr(sx-24,sy-9,48,17,6);ctx.fill();ctx.fillStyle='#c0262c';ctx.fillText('HONK!',sx,sy)}
 ctx.textAlign='left'}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function curb(x,y){const R2=(xx,yy)=>xx>=0&&yy>=0&&xx<Zn.w&&yy<Zn.h&&ROADT.has(gAt(xx,yy));const X=x*16,Y=y*16;
 if(R2(x,y+1)){px(ctx,'#e6e1d6',X,Y+13,16,1);px(ctx,'#8b8578',X,Y+14,16,2)}if(R2(x,y-1)){px(ctx,'#8b8578',X,Y,16,2);px(ctx,'#e6e1d6',X,Y+2,16,1)}
 if(R2(x+1,y)){px(ctx,'#e6e1d6',X+13,Y,1,16);px(ctx,'#8b8578',X+14,Y,2,16)}if(R2(x-1,y)){px(ctx,'#8b8578',X,Y,2,16);px(ctx,'#e6e1d6',X+2,Y,1,16)}}
function drawChar2(n,spr,dir,f,x,y,sitting){x=Math.round(x);y=Math.round(y);
 if(!sitting){ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(x+8,y+15,5,2,0,0,7);ctx.fill()}
 const dy=sitting?-4:0;const img=spr[dir][f]||spr[dir][0];
 if(spr.hd){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const w=HD_CW/8*HD_DRAW,h=24*HD_DRAW,lx=x+8-w/2;if(sitting)ctx.drawImage(img,0,0,HD_CW,HD_CH*19/24,lx,y+11+dy-h*19/24,w,h*19/24);else ctx.drawImage(img,lx,y+16-h,w,h);ctx.imageSmoothingEnabled=false}
 else if(sitting){ctx.drawImage(img,0,0,16,19,x,y-8+dy,16,19)}else ctx.drawImage(img,x,y-8);
 if(n&&n.guitar&&!sitting&&!spr.hd){const gx=x+(n.dir==='left'?1:n.dir==='right'?5:3),gy=y+4;px(ctx,'#a0602a',gx,gy+2,7,5);px(ctx,'#c07a3a',gx,gy+2,7,1);px(ctx,'#3a2414',gx+3,gy+3,2,2);px(ctx,'#6a4428',gx+6,gy-1,6,1)}
 if(n&&n.guitar&&sitting&&!spr.hd){const gx=x+3,gy=y+2;px(ctx,'#a0602a',gx,gy,7,5);px(ctx,'#3a2414',gx+3,gy+1,2,2);px(ctx,'#6a4428',gx+6,gy-3,6,1)}}

/* ===================== Input ===================== */
const keys={};let dirStack=[];
const KMAP={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
function pushDir(d){dirStack=dirStack.filter(x=>x!==d);dirStack.push(d)}
function popDir(d){dirStack=dirStack.filter(x=>x!==d)}
function pressA(){if(state==='vs'){if(VS&&VS.answered)vsNext();return}if(state==='dialog')dlgAdvance();else if(state==='trivia'){if(TV&&TV.finished)closeTrivia();else nextQ()}else if(state==='menu')closePanels();else if(state==='world')interact()}
function pressB(){if(state==='vs'){closeVs();return}if(state==='menu')closePanels();else if(state==='dialog'&&dCur&&!dCur.choices)dlgAdvance();else if(state==='world'&&player.sit)standUp()}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;keys[e.key]=true;
 if(KMAP[e.code]){e.preventDefault();if(state==='dialog'){if(e.code.includes('Up')||e.code==='KeyW'||e.code.includes('Left')||e.code==='KeyA')moveSel(-1);else moveSel(1)}else pushDir(KMAP[e.code]);return}
 if(e.repeat)return;
 if(e.code==='Space'||e.code==='Enter'||e.code==='KeyZ'){e.preventDefault();if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();pressA()}
 else if(e.code==='Escape'||e.code==='KeyX'||e.code==='Backspace')pressB();
 else if(e.code==='KeyC'&&(state==='world'||state==='menu')){if(state==='menu')closePanels();else openColl()}
 else if(e.code==='KeyM'){if(state==='world')openMap();else if(state==='menu'&&!$('#mapP').classList.contains('hidden'))closePanels()}
 else if(e.code==='KeyN'){toggleMute()}
 else if(e.code==='KeyT'&&state==='world'){cycleTime()}
 else if(e.code==='KeyL'&&state==='world')openBoard();
 else if(e.code==='Equal'||e.code==='NumpadAdd')cycleZoom(1);
 else if(e.code==='Minus'||e.code==='NumpadSubtract')cycleZoom(-1);
 else if(state==='trivia'&&/^Digit[1-4]$/.test(e.code))answer(+e.code.slice(5)-1)
 else if(state==='vs'&&VS&&VS.qs&&!VS.over&&/^Digit[1-4]$/.test(e.code))vsAnswer(+e.code.slice(5)-1)});
addEventListener('keyup',e=>{keys[e.key]=false;if(KMAP[e.code])popDir(KMAP[e.code])});
addEventListener('blur',()=>{dirStack=[];for(const k in keys)keys[k]=false});
function toggleMute(){muted=!muted;$('#btnSnd').textContent=muted?'🔇':'🔊';toast(muted?'Sound off':'Sound on')}
let coarse=false,lastTS='';function syncTouch(){const k=state+coarse;if(k===lastTS)return;lastTS=k;$('#touch').classList.toggle('hidden',!coarse||!['world','dialog','fade'].includes(state))}
function setupTouch(){coarse=matchMedia('(pointer:coarse)').matches;$('#game').classList.toggle('touch',coarse);
 // Virtual joystick: drag the knob; the strongest axis picks the direction (always normal walking speed)
 const base=$('#joy'),knob=$('#joyKnob');let jid=null,jdir=null;
 const setDir=d=>{if(d===jdir)return;if(jdir)popDir(jdir);jdir=d;if(d){if(state==='dialog')moveSel(d==='up'||d==='left'?-1:1);else{pushDir(d);clickPath=null}}};
 const move=e=>{const r=base.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2;let dx=e.clientX-cx,dy=e.clientY-cy;const dist=Math.hypot(dx,dy),max=R*.62;
  if(dist>max){dx*=max/dist;dy*=max/dist}const k=r.width/110;knob.style.transform=`translate(${dx/k}px,${dy/k}px)`;
  setDir(dist<R*.22?null:Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))};
 const end=e=>{if(e.pointerId!==jid)return;jid=null;knob.style.transform='';setDir(null);base.classList.remove('on')};
 base.addEventListener('pointerdown',e=>{e.preventDefault();jid=e.pointerId;try{base.setPointerCapture(jid)}catch(_){}base.classList.add('on');move(e)});
 base.addEventListener('pointermove',e=>{if(e.pointerId===jid){e.preventDefault();move(e)}});
 base.addEventListener('pointerup',end);base.addEventListener('pointercancel',end);base.addEventListener('lostpointercapture',end);
 $('#btnA').addEventListener('pointerdown',e=>{e.preventDefault();pressA()});$('#btnB').addEventListener('pointerdown',e=>{e.preventDefault();pressB()})}
$('#dlg').addEventListener('click',()=>{if(state==='dialog'&&!(dCur&&dCur.choices))dlgAdvance()});
$('#tvNext').onclick=nextQ;
$('#btnVsT').onclick=()=>openVs(false);$('#vsGo').onclick=vsStart;$('#vsBack').onclick=closeVs;$('#vsNext').onclick=vsNext;
$('#btnMap').onclick=()=>{if(state==='world')openMap();else if(state==='menu')closePanels()};
$('#mapP').querySelector('.close').onclick=closePanels;
$('#btnColl').onclick=()=>{if(state==='world')openColl();else if(state==='menu')closePanels()};
$('#btnHelp').onclick=()=>{if(state==='world')openHelp()};
$('#btnSnd').onclick=toggleMute;
$('#btnZoom').onclick=()=>cycleZoom();
$('#btnBoard').onclick=()=>{if(state==='world')openBoard()};$('#btnBoardT').onclick=()=>openBoard(true);$('#boardClose').onclick=closeBoard;
$('#btnCopy').onclick=()=>{const t=$('#myCode');t.select();let ok=false;try{navigator.clipboard.writeText(t.value).then(()=>{$('#importMsg').textContent='Copied! Text it to her (or paste it anywhere).'}).catch(()=>{$('#importMsg').textContent='Select the code above and copy it.'});ok=true}catch(e){}if(!ok)$('#importMsg').textContent='Select the code above and copy it.'};
$('#btnImport').onclick=()=>{const m=importCode($('#importBox').value);$('#importBox').value='';openBoard(state!=='menu');$('#importMsg').textContent=m};
document.querySelectorAll('.close').forEach(b=>b.onclick=closePanels);

/* ===================== Title & boot ===================== */
const SHIRTS=['#d9534f','#f0ad4e','#5cb85c','#5b9bd5','#8e6bbf','#e07aa0'],SKINS=['#f1c9a5','#e0ac7e','#c68a5a','#8d5a3b','#5e3a26'],HAIRS=['#2a1d17','#4a3426','#7a4b2a','#c9a253','#b5462a'],STYLES=['long','ponytail','puffy','shaggy','spiky','buzz','bald'],FRECKLES=['no freckles','freckles'],OUTFITS=['pants','skirt','dress'];
let pick={shirt:3,skin:0,hair:2,style:0,freckles:0,outfit:0,diff:'fan'};
function lookFromPick(){return{player:true,skin:SKINS[pick.skin],hair:HAIRS[pick.hair],style:STYLES[pick.style],shirt:SHIRTS[pick.shirt],pants:'#3b4a6b',freckles:pick.freckles===1,outfit:OUTFITS[pick.outfit]}}
function drawPreview(){const c=$('#preview'),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,c.width,c.height);const sp=charSprites(lookFromPick());const w=sp.hd?Math.round(72*HD_CW/HD_CH):48;art(g,sp.down[0],0,0,w,72);art(g,sp.right[0],w+8,0,w,72)}
function setupTitle(){const sw=(id,arr,key,isCol=true)=>{$(id).innerHTML=arr.map((v,i)=>`<button data-i="${i}" class="${i===pick[key]?'on':''}" ${isCol?`style="background:${v}"`:''}>${isCol?'':v}</button>`).join('');
  $(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{pick[key]=+b.dataset.i;SFX.sel();setupTitle()})};
 sw('#pShirt',SHIRTS,'shirt');sw('#pSkin',SKINS,'skin');sw('#pHair',HAIRS,'hair');
 // v1.9: the text choices are drop-downs, so the whole title screen fits without scrolling
 const dd=(id,opts,cur,on)=>{const el=$(id);el.innerHTML=opts.map(([v,l])=>`<option value="${v}" ${String(v)===String(cur)?'selected':''}>${l}</option>`).join('');el.onchange=()=>{SFX.sel();on(el.value)}};
 const cap=t=>t[0].toUpperCase()+t.slice(1);
 dd('#pStyle',STYLES.map((t,i)=>[i,cap(t)]),pick.style,v=>{pick.style=+v;setupTitle()});
 dd('#pBuild',FRECKLES.map((t,i)=>[i,cap(t)]),pick.freckles,v=>{pick.freckles=+v;setupTitle()});
 dd('#pOutfit',OUTFITS.map((t,i)=>[i,cap(t)]),pick.outfit,v=>{pick.outfit=+v;setupTitle()});
 dd('#pDiff',DIFFS.map(([k,l])=>[k,l]),pick.diff,v=>{pick.diff=v;setupTitle()});
 $('#pDiffNote').textContent=diffNote(pick.diff);drawPreview();
 const st=loadStore(),list=Object.values(st.saves).sort((a,b)=>(b.updated||0)-(a.updated||0));
 // saved players: one drop-down and a Continue button, however many there are
 $('#profList').innerHTML=list.length?`<div class="pl">Saved players</div><div id="contRow"><select id="pCont">${list.map(p=>`<option value="${esc(p.name)}">${esc(p.name)} · ${Object.keys(p.items||{}).length}/${ITEMS.length} · ${p.stars||0}★</option>`).join('')}</select><button id="btnCont">Continue ▶</button></div>`:'';
 if(list.length)$('#btnCont').onclick=()=>{const p=loadStore().saves[$('#pCont').value];if(p)begin(p,false)}}
function begin(s,isNew){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume();music.next=AC.currentTime+.2}catch(e){}S=s;S.equip=S.equip||{};S.eggs=S.eggs||{};refreshPlayer();$('#title').classList.add('hidden');$('#hud').classList.remove('hidden');
 // v1.8 widened the streets by three rows; saves from before then are moved to match
 if(!S.v18){if(ZONES[S.zone]&&ZONES[S.zone].wide&&S.y>=15)S.y+=3;S.v18=1}
 loadZone(S.zone||'village',S.x??15,S.y??10,S.dir||'up');
 if(solid[player.y*Zn.w+player.x]){let best=null;for(let r=1;r<12&&!best;r++)for(let dy=-r;dy<=r&&!best;dy++)for(let dx=-r;dx<=r;dx++){const x=player.x+dx,y=player.y+dy;if(x>=0&&y>=0&&x<Zn.w&&y<Zn.h&&!solid[y*Zn.w+x]){best=[x,y];break}}
  if(best){player.x=player.fx=best[0];player.y=player.fy=best[1];player.px=best[0]*16;player.py=best[1]*16}}
 state='world';updHud();
 if(isNew)say([{text:`Welcome to the Village, ${S.name}!`},{text:"That's Central Perk right in front of you. Walk up to the door to go inside."},{text:"Arrows or WASD to move (hold Shift to hurry). Space to talk. C opens your collectibles shelf, and M opens the map."},{text:"Find people with a ? over their heads. They want to quiz you."}]);
 if(isNew){S.chapter=0;save();const el=$('#chapCard');$('#chapNum').textContent='Chapter 1';$('#chapT').textContent=CHAPTERS[0].t;$('#chapTx').textContent=CHAPTERS[0].tx;el.classList.add('on');SFX.ok();el.onclick=()=>el.classList.remove('on')}}
$('#btnNew').onclick=()=>{let nm=($('#pName').value||'').trim().slice(0,14)||'Friend';const st=loadStore();if(st.saves[nm]){let k=2;while(st.saves[nm+' '+k])k++;nm=(nm.slice(0,11)+' '+k)}begin(freshSave(nm,lookFromPick()),true)};
function confirmNew(){const b=$('#btnNew');if(b.dataset.arm){delete b.dataset.arm;return true}b.dataset.arm=1;b.textContent='Overwrite saved game? Click again';setTimeout(()=>{delete b.dataset.arm;b.textContent='New Game ▶'},3000);return false}


// Size the game to the part of the screen that's actually visible (mobile browser toolbars cover the rest)
function fit(){const vv=window.visualViewport,w=vv?vv.width:innerWidth,h=vv?vv.height:innerHeight;const s=Math.min(w/640,h/416)*.98;const g=$('#game');g.style.transform=`scale(${s})`;$('#holder').style.width=640*s+'px';$('#holder').style.height=416*s+'px';
 const wr=$('#wrap');wr.style.height=h+'px';wr.style.top=(vv?vv.offsetTop:0)+'px'}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,300));if(window.visualViewport){visualViewport.addEventListener('resize',fit);visualViewport.addEventListener('scroll',fit)}
let last=performance.now(),saveT=0;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;clock+=dt;if(((clock*4)|0)!==loop.k){loop.k=(clock*4)|0;checkChapter()}
 if(Zn&&S&&state!=='title'){updPlayer(dt);updNpcs(dt);updTaxis(dt);updWalkers(dt);updDialog(dt);saveT+=dt;if(saveT>5){saveT=0;save()}draw()}
 syncTouch();requestAnimationFrame(loop)}
try{const z=+localStorage.getItem('friendsTrivia_zoom');if([1,2,3].includes(z))setZoom(z,true);else setZoom(2,true)}catch(e){setZoom(2,true)}
fit();setupTitle();setupTouch();loadCustomSprites();loadHD();loadPlayerArt();loadVillageArt();loadInteriorArt();loadNightArt();
// title-screen backdrop: render the village behind the menu
player.spr=charSprites(lookFromPick());loadZone('village',15,10,'up',true);state='title';
(function titleBg(){if(state!=='title')return;clock+=.016;updNpcs(.016);updTaxis(.016);drawTitleBg();requestAnimationFrame(titleBg)})();
function drawTitleBg(){const sv=S;S={items:{},stars:0};player.px=15*16;player.py=10*16;draw();S=sv}
requestAnimationFrame(loop);
window.__game={get state(){return state},get S(){return S},get player(){return player},get npcs(){return npcs},get zone(){return Zn&&Zn.id},interact,pressA,answer,warp,openColl,closePanels,startTrivia,sitCouch};
