// Separate, deterministic maps for Dunmere buildings and the north cave.
(function(root){"use strict";
const W=12,H=9,INN_W=16,INN_H=12;
const FURNITURE={
 home:[['bed',2,2,2,2],['bed',8,2,2,2],['hearth',5,1.3,2,1.5],['table',6,4,2,1]],
 tavern:[['wallShelf',1.2,1.14,2.3,.8],['hearth',11.8,1.35,1.8,1.9],['counter',2,3,6,1],['table',2,5,2,1],['table',7,5,2,1],['table',11,5,2,1],['bench',2,6,2,.35],['bench',7,6,2,.35],['bench',11,6,2,.35],['stairs',12.5,8,2,2]],
 upstairs:[['bed',1.12,1.76,1.7,2.65],['bed',9.12,1.76,1.7,2.65],['table',4.8,3.1,1.5,.85],['table',12.4,3.1,1.5,.85],['chest',1.25,4.08,1.3,1],['chest',9.25,4.08,1.3,1]],
 smithy:[['forge',2,2,2,2],['anvil',7,3,2,1],['rack',2,6,2,1]],
 mill:[['millstone',2.15,2.5,2.4,2.1],['wallShelf',8.1,1.15,2.4,.72],['sacks',8,2.7,2,1.15],['sacks',8.2,5.25,1.65,1],['table',3.2,5.2,2.8,1.1]],
 bakery:[['oven',1.55,1.1,2.65,2.75],['wallShelf',8.25,1.35,2.55,.72],['counter',5,3.25,3,1.05],['sacks',8.8,2.55,1.8,1.4],['table',3.1,5.1,2.8,1.15]],
 healer:[['bed',2,2,2,2],['wallShelf',8,.18,2,.72],['table',6,5,2,1]],
 weaver:[['loom',2,2,3,2],['wallShelf',8,.18,2,.72],['table',6,5,2,1]],
 guard:[['rack',2,2,2,1],['table',6,3,2,1],['bed',8,5,2,2]],
 cave:[['boulder',2,2,2,1],['boulder',8,5,2,1],['stone',8,2,1,1]]
};
const CAVE={id:'north-cave',name:'North Cave',kind:'cave',portal:{x:36.5,y:8.5}};
let millstoneArt=null;
function millstoneSprite(){
 if(millstoneArt)return millstoneArt;
 const c=document.createElement('canvas');c.width=48;c.height=44;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 g.fillStyle='#4a382b';g.fillRect(8,34,32,7);g.fillRect(14,39,5,5);g.fillRect(30,39,5,5);
 g.fillStyle='#4a4d49';g.beginPath();g.ellipse(24,21,22,17,0,0,7);g.fill();
 g.fillStyle='#91958a';g.beginPath();g.ellipse(24,18,21,15,0,0,7);g.fill();
 g.fillStyle='#c0bba8';g.beginPath();g.ellipse(24,17,16,11,0,0,7);g.fill();
 g.strokeStyle='#777b73';g.lineWidth=2;g.beginPath();g.ellipse(24,17,12,8,0,0,7);g.stroke();
 for(let i=0;i<35;i++){const px=7+(i*19%34),py=8+(i*13%21);if(((px-24)/18)**2+((py-17)/12)**2>1)continue;g.fillStyle=i%3?'#9fa194':'#d1c9b0';g.fillRect(px,py,2,1)}
 g.fillStyle='#49392b';g.fillRect(22,2,4,16);g.fillStyle='#8a6745';g.fillRect(23,2,2,15);g.fillStyle='#4b514d';g.fillRect(20,15,8,6);
 millstoneArt=c;return c;
}
function furniture(ctx,f,size){
 const x=f.x*size,y=f.y*size,w=f.w*size,h=f.h*size;
 const box=(dx,dy,bw,bh,color)=>{ctx.fillStyle=color;ctx.fillRect(x+dx,y+dy,bw,bh)};
 if(f.type==='bed'){box(0,0,w,h,'#4b392b');box(4,4,w-8,h-8,'#738779');box(6,6,w-12,h*.28,'#ded4b5');box(6,h*.4,w-12,h*.48,'#856a6a');return}
 if(f.type==='table'||f.type==='counter'){box(0,0,w,h,'#4a3426');box(4,4,w-8,h-8,'#886541');box(7,6,w-14,3,'#b59162');if(f.type==='table'){box(w*.45,h*.3,10,8,'#d4be91');box(w*.48,h*.35,5,4,'#6b7659')}return}
 if(f.type==='bench'){box(0,0,w,h,'#4b3325');box(4,2,w-8,h-4,'#8b6643');box(7,h-3,4,7,'#62442d');box(w-11,h-3,4,7,'#62442d');return}
 if(f.type==='barrel'){ctx.fillStyle='#533a2a';ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w*.44,h*.46,0,0,7);ctx.fill();box(w*.12,h*.27,w*.76,4,'#a78d67');box(w*.12,h*.7,w*.76,4,'#a78d67');box(w*.35,h*.2,w*.3,h*.1,'#b28b57');return}
 if(f.type==='hearth'||f.type==='forge'||f.type==='oven'){box(0,0,w,h,'#55564e');box(5,5,w-10,h-10,'#282d2c');box(w*.23,h*.42,w*.54,h*.4,f.type==='oven'?'#a1663e':'#af4d30');box(w*.42,h*.26,w*.18,h*.34,'#e6a751');return}
 if(f.type==='anvil'){box(0,h*.4,w,h*.34,'#414b4d');box(w*.2,h*.24,w*.6,h*.23,'#a4ada7');box(w*.4,h*.7,w*.2,h*.3,'#5c5046');return}
 if(f.type==='rack'||f.type==='wallShelf'){box(0,0,w,h,'#624932');for(let i=0;i<3;i++){box(4+i*w*.28,5,8,h-10,f.type==='rack'?'#9ba6a4':['#79915c','#a67c62','#b5a06a'][i])}return}
 if(f.type==='millstone'){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(millstoneSprite(),x,y,w,h);ctx.restore();return}
 if(f.type==='sacks'){for(let i=0;i<3;i++){box(i*w*.3+2,h*.2,w*.26,h*.65,'#9e8058');box(i*w*.3+4,h*.3,w*.18,3,'#d0b582')}return}
 if(f.type==='loom'){box(0,0,w,h,'#5d4738');box(6,6,w-12,h-12,'#9b8065');for(let i=0;i<6;i++)box(9+i*(w-18)/6,7,2,h-14,i%2?'#a66e65':'#776d9b');return}
 if(f.type==='boulder'||f.type==='stone'){ctx.fillStyle=f.type==='stone'?'#aab8ad':'#505b54';ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x+w*.15,y+h*.22);ctx.lineTo(x+w*.7,y);ctx.lineTo(x+w,y+h*.55);ctx.lineTo(x+w*.8,y+h);ctx.fill();box(w*.3,h*.25,w*.2,3,'#c2cbbf')}
}
function greyfordHomeFurniture(count){
 const beds=[[1.5,2],[4,2],[6.5,2],[9,2],[1.5,5]].slice(0,Math.max(1,Math.min(5,count||2))).map(([x,y])=>['bed',x,y,1.65,2.3]);
 return [...beds,['table',6,5,2,1],['hearth',9.4,5.2,1.2,1.3]];
}
function create(buildings){
 const upstairs={id:'inn-upstairs',name:'Hearth & Hound · guest rooms',kind:'upstairs',portal:null};
 const rooms=Object.fromEntries([...buildings.map(b=>[b.id,{id:b.id,name:b.name,kind:b.kind,portal:{x:b.doorX+.5,y:b.doorY+.5},greyfordBuilding:b.greyfordBuilding||null,beds:b.beds||0}]),[CAVE.id,CAVE],...(buildings.some(b=>b.id==='inn')?[[upstairs.id,upstairs]]:[])].map(([id,room])=>[id,{...room,width:['tavern','upstairs'].includes(room.kind)?INN_W:W,height:['tavern','upstairs'].includes(room.kind)?INN_H:H,furniture:(room.greyfordBuilding&&room.kind==='home'?greyfordHomeFurniture(room.beds):FURNITURE[room.kind]||FURNITURE.home).map(([type,x,y,w,h])=>({type,x,y,w,h})),lights:room.kind==='tavern'?[{x:3.7,y:1.7,type:'wall-candle'},{x:9.4,y:1.7,type:'wall-candle'},{x:12.7,y:2.45,type:'hearth'}]:room.kind==='upstairs'?[{x:6.5,y:1.7,type:'wall-candle'},{x:14.5,y:1.7,type:'wall-candle'}]:[]}]));
 function get(id){return rooms[id]||null}
 function pass(room,x,y){const minY=room?.kind==='tavern'?2.25:room?.kind==='bakery'?3.05:1.2;if(!room||x<1.2||x>room.width-1.2||y<minY||y>room.height-1.05)return false;if(room.kind==='upstairs'&&((y>6.8&&y<7.45&&Math.abs(x-4.5)>.55&&Math.abs(x-11.5)>.55)||(x>7.7&&x<8.3&&y<7.4)))return false;return !room.furniture.some(f=>!['wallShelf','stairs'].includes(f.type)&&x>=f.x-.2&&x<f.x+f.w+.2&&y>=f.y-.2&&y<f.y+f.h+.2)}
 function slot(room,index){if(room.kind==='tavern'&&index===0)return {x:4.5,y:2.55};if(room.kind==='bakery'&&index===0)return {x:8.5,y:4.5};const candidates=[];for(const y of room.kind==='tavern'?[4.5,5.5,6.5,7.5,8.5,9.5]:[4.5,5.5,6.5,3.5,2.5])for(const x of room.kind==='tavern'?[3.5,5.5,7.5,9.5,11.5,13.5,4.5,6.5,8.5,10.5,12.5]:[3.5,5.5,7.5,9.5,4.5,6.5,8.5])if(pass(room,x,y)&&Math.hypot(x-room.width/2,y-room.height-1.7)>1.4)candidates.push({x,y});return candidates[(room.kind==='tavern'?index-1:index)%candidates.length]||{x:5.5,y:5.5}}
 function nearPortal(x,y){return Object.values(rooms).find(r=>r.portal&&Math.hypot(x-r.portal.x,y-r.portal.y)<1.45)||null}
 function draw(ctx,room,size,details={}){
  const cave=room.kind==='cave',wall=cave?'#343c3a':'#514236',floor=cave?'#676b60':'#a5845e';
  const rw=room.width,rh=room.height;
  ctx.fillStyle=wall;ctx.fillRect(0,0,rw*size,rh*size);
  ctx.fillStyle=floor;ctx.fillRect(size,size,(rw-2)*size,(rh-2)*size);
  const sprites=root.KingdomInnSprites;
  if(['tavern','upstairs','bakery','mill','home'].includes(room.kind)&&sprites?.ready){
   // Complete floor and back-wall tiles. All furnishings share these source pixels.
   for(let y=1;y<rh-1;y++)for(let x=1;x<rw-1;x++)sprites.draw(ctx,(x+y)%3?'floorA':'floorB',x*size,y*size,size,size);
   for(let x=1;x<rw-1;x++)for(let y=1;y<=(['bakery','mill','home'].includes(room.kind)?2:1);y++)sprites.draw(ctx,x%3?'wallA':'wallB',x*size,y*size,size,size);
   if(room.kind==='tavern')sprites.draw(ctx,'wallWindows',7*size,1.05*size,2.2*size,1.35*size);
   else if(room.kind==='home')sprites.draw(ctx,'guestWindow',8.2*size,1.06*size,1.05*size,.96*size);
   else if(room.kind==='bakery')sprites.draw(ctx,'bakeryWindow',5.5*size,1.22*size,1.22*size,1.16*size);
   else if(room.kind==='mill')sprites.draw(ctx,'bakeryWindow',5.5*size,1.22*size,1.22*size,1.16*size);
   else{for(const x of [3.5,11.5])sprites.draw(ctx,'guestWindow',x*size,1.02*size,1.05*size,.96*size);ctx.fillStyle='#674a35';ctx.fillRect(8*size,size*.98,size*.22,6.55*size);for(let x=1;x<rw-1;x++)if(Math.abs(x-4.5)>.6&&Math.abs(x-11.5)>.6)ctx.fillRect(x*size,7*size,size,size*.42)}
  }
  for(const light of room.lights){const x=light.x*size,y=light.y*size,radius=light.type==='hearth'?size*2.6:size*1.7;const glow=ctx.createRadialGradient(x,y,0,x,y,radius);glow.addColorStop(0,'#f5ad5140');glow.addColorStop(1,'#f5ad5100');ctx.fillStyle=glow;ctx.fillRect(x-radius,y-radius,radius*2,radius*2)}
  if(!['tavern','upstairs','bakery','mill','home'].includes(room.kind)){ctx.fillStyle=cave?'#767b6d':'#b6956a';for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if((x*11+y*17)%7===0)ctx.fillRect(x*size+size*.2,y*size+size*.35,size*.22,size*.07)}
  if(room.kind==='tavern'&&sprites?.ready)sprites.draw(ctx,'innDoor',7.1*size,10.72*size,.8*size,1.06*size);
  else if(room.kind==='upstairs'){ctx.fillStyle='#523927';ctx.fillRect(7.1*size,10.8*size,.8*size,.18*size)}
  else if(room.kind==='bakery'&&sprites?.ready)sprites.draw(ctx,'bakeryDoor',5.1*size,7.8*size,.8*size,1.05*size);
  else{ctx.fillStyle=cave?'#252d2c':'#34291f';ctx.fillRect(5*size,8*size,size,12)}
  ctx.fillStyle='#e6ce9f';ctx.font=`bold ${Math.round(size*.25)}px system-ui`;ctx.textAlign='center';ctx.fillText(room.name,rw*size/2,size*.6);
  for(const f of room.furniture){
   if(f.type==='wallShelf'&&sprites?.ready){sprites.draw(ctx,room.kind==='bakery'?'bakeryWallShelf':'cupboard',f.x*size,f.y*size,f.w*size,f.h*size);continue}
   if(room.kind==='mill'&&sprites?.ready){
    if(f.type==='sacks'){sprites.draw(ctx,'bakerySackPile',f.x*size,f.y*size,f.w*size,f.h*size);continue}
    if(f.type==='table'){sprites.draw(ctx,'bakeryBench',f.x*size,f.y*size,f.w*size,f.h*size);continue}
   }
   if(room.kind==='bakery'&&sprites?.ready){
    if(f.type==='oven'){const x=f.x*size,y=f.y*size,w=f.w*size,h=f.h*size;sprites.draw(ctx,'bakeryOvenMain',x,y,w*55/64,h);sprites.draw(ctx,'bakeryOvenRight',x+w*55/64,y+h/3,w*9/64,h*2/3);continue}
    if(f.type==='counter'){sprites.draw(ctx,'counter',f.x*size,f.y*size,f.w*size,f.h*size);continue}
    if(f.type==='sacks'){sprites.draw(ctx,'bakerySackPile',f.x*size,f.y*size,f.w*size,f.h*size);continue}
    if(f.type==='table'){sprites.draw(ctx,'bakeryBench',f.x*size,f.y*size,f.w*size,f.h*size);continue}
   }
   if(room.kind==='home'&&sprites?.ready){
    if(f.type==='bed'){sprites.draw(ctx,'guestBed',f.x*size,(f.y-.25)*size,f.w*size,2.45*size);continue}
    if(f.type==='hearth'){sprites.draw(ctx,'hearth',f.x*size,f.y*size,f.w*size,f.h*size);sprites.draw(ctx,'fire',(f.x+.48)*size,(f.y+.77)*size,.95*size,.45*size);continue}
    if(f.type==='table'){sprites.draw(ctx,'table',f.x*size,f.y*size,f.w*size,1.13*size);continue}
   }
   if(room.kind==='tavern'&&sprites?.ready){
    if(f.type==='counter'){for(let i=0;i<3;i++)sprites.draw(ctx,'counter',(2+i*2)*size,2.96*size,2*size,1.12*size);continue}
    if(f.type==='hearth'){sprites.draw(ctx,'hearth',11.83*size,1.43*size,1.78*size,1.8*size);sprites.draw(ctx,'fire',12.27*size,2.34*size,.88*size,.45*size);continue}
    if(f.type==='table'){sprites.draw(ctx,'table',f.x*size,4.89*size,2*size,1.22*size);continue}
    if(f.type==='bench'){for(let i=0;i<2;i++)sprites.draw(ctx,'stool',(f.x+.18+i*.94)*size,6.05*size,.72*size,.72*size);continue}
    if(f.type==='stairs'){sprites.draw(ctx,'stairStep',12.5*size,8*size,2*size,1.6*size);ctx.fillStyle='#ead1a3';ctx.font=`bold ${Math.round(size*.19)}px system-ui`;ctx.fillText('UPSTAIRS',13.5*size,9.8*size);continue}
   }
   if(room.kind==='upstairs'&&sprites?.ready){
    if(f.type==='bed'){sprites.draw(ctx,'guestBed',f.x*size,f.y*size,1.7*size,2.65*size);continue}
    if(f.type==='table'){sprites.draw(ctx,'table',f.x*size,f.y*size,1.45*size,.85*size);continue}
    if(f.type==='chest'){sprites.draw(ctx,'guestChest',f.x*size,f.y*size,f.w*size,f.h*size);continue}
   }
   furniture(ctx,f,size);
  }
  if(room.kind==='tavern'){
   const stock=details.shop?.stock||{bread:0,ale:0};
   // Sprite goods are tied to the saved stock ledger; a sold loaf disappears from view.
   if(sprites?.ready){
    for(let i=0;i<Math.min(stock.bread,5);i++)sprites.draw(ctx,'bread',(2.24+i*.96)*size,3.28*size,.52*size,.45*size);
    for(let i=0;i<Math.min(stock.ale,3);i++)sprites.draw(ctx,'ale',(7.14+i*.25)*size,3.23*size,.34*size,.45*size);
    sprites.draw(ctx,'ale',3.12*size,5.11*size,.35*size,.4*size);
    sprites.draw(ctx,'ale',8.05*size,5.11*size,.35*size,.4*size);
   }
  }
  if(room.kind==='bakery'&&sprites?.ready){
   for(let i=0;i<Math.min(5,details.bakery?.bread||0);i++)sprites.draw(ctx,'bread',(5.22+i*.5)*size,3.15*size,.42*size,.4*size);
   sprites.draw(ctx,'bakerySack',7.8*size,5.54*size,.65*size,.7*size);
   if(details.bakeryTask==='Kneading dough'){
    ctx.fillStyle='#d9c7a0';for(const [x,y,w,h] of [[3.82,5.3,.42,.19],[4.45,5.35,.4,.16]]){ctx.beginPath();ctx.ellipse(x*size,y*size,w*size,h*size,0,0,Math.PI*2);ctx.fill()}
   }
   if(details.bakeryTask==='Loading the oven'||details.bakeryTask==='Checking the oven')sprites.draw(ctx,'fire',2.28*size,2.8*size,1.15*size,.38*size);
  }
  if(room.kind==='upstairs'){
   ctx.fillStyle='#d7bd91';ctx.font=`bold ${Math.round(size*.24)}px system-ui`;ctx.fillText('YOUR ROOM',4.5*size,7.85*size);ctx.fillText('TRAVELERS',11.5*size,7.85*size);
   if(sprites?.ready){sprites.draw(ctx,'ale',5.1*size,3.15*size,.28*size,.32*size);sprites.draw(ctx,'ale',12.7*size,3.15*size,.28*size,.32*size)}
  }
  for(const light of room.lights)if(light.type==='wall-candle'){const x=light.x*size,y=light.y*size;if(!(room.kind==='tavern'&&sprites?.draw(ctx,'candle',x-size*.2,y-size*.43,size*.4,size*.58))){ctx.fillStyle='#4c3928';ctx.fillRect(x-7,y-2,14,5);ctx.fillStyle='#d8c696';ctx.fillRect(x-2,y-12,4,11);ctx.fillStyle='#efa74d';ctx.fillRect(x-2,y-18,4,6);ctx.fillStyle='#fff0a7';ctx.fillRect(x-1,y-16,2,3)}}
  if(!['tavern','upstairs'].includes(room.kind)){ctx.fillStyle='#e8d3a7';ctx.font=`${Math.round(size*.22)}px system-ui`;ctx.fillText('EXIT',5.5*size,7.8*size)}
 }
 return {rooms,get,pass,slot,nearPortal,draw,cave:CAVE};
}
root.KingdomInteriors={create};
})(window);
