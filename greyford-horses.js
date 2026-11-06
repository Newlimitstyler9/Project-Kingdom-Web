// Bracken is the tradeable horse; the Pell family's other two horses live in the same paddock.
(function(root){'use strict';
const ORIGIN={x:130,y:72};
const INITIAL={id:'bracken',name:'Bracken',kind:'farm cob',breed:'farm cob',coat:'brown',scale:1,runSpeed:3.5,carryKg:160,source:'Marrowfield consignment',seller:'jorin',owner:'jorin',keeper:'rinna',location:'paddock',x:90.5+ORIGIN.x,y:36.5+ORIGIN.y,facing:'left',hunger:18,thirst:15,fatigue:12,led:false,price:65,walkMs:0};
const STABLE_HERD=[{id:'moss',name:'Moss',kind:'moor pony',breed:'moor pony',coat:'grey',scale:.87,runSpeed:3.1,carryKg:80,owner:'jorin',keeper:'rinna',location:'paddock',x:92.7+ORIGIN.x,y:33.6+ORIGIN.y,facing:'right',walkMs:0},{id:'sable',name:'Sable',kind:'road palfrey',breed:'road palfrey',coat:'dun',scale:1.02,runSpeed:4.2,carryKg:110,owner:'jorin',keeper:'rinna',location:'paddock',x:88.8+ORIGIN.x,y:40.5+ORIGIN.y,facing:'left',walkMs:0}];
const ROUTES={
 bracken:[[90.5,36.5,'grazing',3],[88.8,36.2,'running',1],[90.5,36.5,'grazing',2]],
 moss:[[92.7,33.6,'grazing',3],[92.7,34.9,'running',1],[92.7,33.9,'walking',2]],
 sable:[[88.8,40.5,'grazing',3],[89.3,40.5,'drinking',3],[88.8,41.4,'grazing',2],[88.8,39.5,'running',1]]
};
function inPaddock(x,y){const lx=x-ORIGIN.x,ly=y-ORIGIN.y;return lx>87&&lx<94&&ly>30&&ly<43}
function create(purse,bag){
 let horse={...INITIAL,activity:'grazing',routeIndex:0,pause:2},stableHerd=STABLE_HERD.map(h=>({...h,activity:'grazing',routeIndex:0,pause:2})),trail=[],lastTrail=null,sellerTill=8;
 function view(){return {...horse}}
 function herd(){return [view(),...stableHerd.map(h=>({...h}))]}
 function nearAny(x,y,radius=2){return herd().some(h=>Math.hypot(h.x-x,h.y-y)<=radius)}
 function near(x,y,radius=2){return Math.hypot(horse.x-x,horse.y-y)<=radius}
 function buy(sellerPresent){if(horse.owner==='player')return {ok:false,message:'Bracken is already yours.'};if(!sellerPresent)return {ok:false,message:'Jorin must be here to witness the sale.'};if(horse.location!=='paddock')return {ok:false,message:'Bracken is away from the paddock.'};if(purse.snapshot().coins<horse.price)return {ok:false,message:'Jorin asks '+horse.price+' copper for Bracken. You have '+purse.snapshot().coins+'.'};if(!purse.debit(horse.price))return {ok:false,message:'The payment could not be completed.'};horse.owner='player';sellerTill+=horse.price;return {ok:true,message:'Jorin transfers Bracken to you for '+horse.price+' copper. Meet your horse in the fenced paddock beside the stable.'}}
 function lead(){if(horse.owner!=='player')return {ok:false,message:'Ask Jorin about buying Bracken first.'};if(horse.led)return {ok:false,message:'Bracken is already following your lead.'};if(horse.hunger>=85||horse.thirst>=85||horse.fatigue>=90)return {ok:false,message:'Bracken needs food, water, or rest before traveling.'};horse.led=true;horse.location='field';trail=[];lastTrail=null;return {ok:true,message:'You take Bracken’s lead. Walk through the open paddock gate together.'}}
 function tether(){if(horse.owner!=='player'||!horse.led)return {ok:false,message:'Bracken is not following you.'};horse.led=false;horse.location=inPaddock(horse.x,horse.y)?'paddock':'field';trail=[];lastTrail=null;return {ok:true,message:horse.location==='paddock'?'You leave Bracken in the paddock.':'You tether Bracken here.'}}
 function feed(){if(horse.owner!=='player')return {ok:false,message:'This horse belongs to Jorin.'};if(horse.hunger<=8)return {ok:false,message:'Bracken is not hungry.'};const slot=bag.slots.findIndex(item=>item?.id==='grain');if(slot<0)return {ok:false,message:'Bring a measure of grain to feed Bracken.'};if(!bag.take(slot,1))return {ok:false,message:'The grain could not be taken.'};horse.hunger=Math.max(0,horse.hunger-40);return {ok:true,message:'Bracken eats one measure of grain. Hunger is now '+horse.hunger+'.'}}
 function water(atPaddock){if(horse.owner!=='player')return {ok:false,message:'This horse belongs to Jorin.'};if(!atPaddock||!inPaddock(horse.x,horse.y))return {ok:false,message:'Water Bracken at the paddock trough.'};if(horse.thirst<=8)return {ok:false,message:'Bracken is not thirsty.'};horse.thirst=Math.max(0,horse.thirst-55);return {ok:true,message:'Bracken drinks from the paddock trough. Thirst is now '+horse.thirst+'.'}}
 function hour(){horse.hunger=Math.min(100,horse.hunger+4);horse.thirst=Math.min(100,horse.thirst+5);horse.fatigue=Math.max(0,Math.min(100,horse.fatigue+(horse.led?3:-7)));if(horse.led&&(horse.hunger>=85||horse.thirst>=85||horse.fatigue>=90)){horse.led=false;trail=[];lastTrail=null}}
 function movePaddockHorse(h,dt,player,canStand){
  if(h.location!=='paddock')return false;
  if(h.pause>0){h.pause=Math.max(0,h.pause-dt);h.activity=h.activity==='drinking'?'drinking':'grazing';return false}
  const route=ROUTES[h.id],next=route[(h.routeIndex+1)%route.length],tx=next[0]+ORIGIN.x,ty=next[1]+ORIGIN.y;
  const dx=tx-h.x,dy=ty-h.y,d=Math.hypot(dx,dy);
  if(d<.12){h.routeIndex=(h.routeIndex+1)%route.length;h.activity=next[2];h.pause=next[3];return false}
  const speed=next[2]==='running'?h.runSpeed||3.5:1.15,move=Math.min(d,dt*speed),nx=h.x+dx/d*move,ny=h.y+dy/d*move;
  const localX=nx-ORIGIN.x,localY=ny-ORIGIN.y;
  // Horse sprites are wider than their feet: keep the whole animal inside the rails and off both troughs.
  if(localX<88.7||localX>92.9||localY<33.4||localY>41.5||localX<91&&localY<34.7||localX>89.5&&localY>39.2)return false;
  if(herd().some(other=>other.id!==h.id&&Math.hypot(other.x-nx,other.y-ny)<2.65)||player&&Math.hypot(player.x-nx,player.y-ny)<1.4||canStand&&!canStand(nx,ny))return false;
  h.x=nx;h.y=ny;h.activity=next[2];h.facing=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';h.walkMs+=move/speed*1000;return true
 }
 function step(dt,player,canStand){
  if(dt<=0)return false;
  let moved=false;for(const h of [horse,...stableHerd])if(!h.led)moved=movePaddockHorse(h,dt,player,canStand)||moved;
  if(!horse.led||!player)return moved;
  const distance=Math.hypot(player.x-horse.x,player.y-horse.y);
  if(distance>13){horse.led=false;horse.location=inPaddock(horse.x,horse.y)?'paddock':'field';trail=[];lastTrail=null;return false}
  if(!lastTrail||Math.hypot(player.x-lastTrail.x,player.y-lastTrail.y)>.32){lastTrail={x:player.x,y:player.y};trail.push({...lastTrail});if(trail.length>80)trail.shift()}
  let target=trail[0];if(!target||distance<1.15)return false;
  let dx=target.x-horse.x,dy=target.y-horse.y,d=Math.hypot(dx,dy);
  if(d<.28){trail.shift();target=trail[0];if(!target)return false;dx=target.x-horse.x;dy=target.y-horse.y;d=Math.hypot(dx,dy)}
  const move=Math.min(d,dt*2.35),nx=horse.x+dx/d*move,ny=horse.y+dy/d*move;
  if(!canStand(nx,ny))return moved;
  horse.x=nx;horse.y=ny;horse.facing=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';horse.walkMs+=move/2.35*1000;horse.fatigue=Math.min(100,horse.fatigue+move*.12);return true
 }
 function snapshot(){return {version:3,horse:view(),stableHerd:stableHerd.map(h=>({...h})),sellerTill,trail:trail.map(p=>({...p}))}}
 function restore(data){const h=data?.horse;if(![1,2,3].includes(data?.version)||h?.id!=='bracken'||!['jorin','player'].includes(h.owner)||!['stable','paddock','field'].includes(h.location)||!['up','down','left','right'].includes(h.facing)||![h.x,h.y,h.hunger,h.thirst,h.fatigue,h.walkMs].every(Number.isFinite)||!Array.isArray(data.trail)||data.trail.length>80)return false;if(data.trail.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return false;if(data.version===3&&(!Array.isArray(data.stableHerd)||data.stableHerd.length!==2||data.stableHerd.some((a,i)=>a.id!==STABLE_HERD[i].id||![a.x,a.y,a.walkMs,a.routeIndex,a.pause].every(Number.isFinite)||a.x-ORIGIN.x<88.7||a.x-ORIGIN.x>92.9||a.y-ORIGIN.y<33.4||a.y-ORIGIN.y>41.5)))return false;const wasIndoor=h.location==='stable';horse={...INITIAL,activity:'grazing',routeIndex:0,pause:2,...h,location:wasIndoor?'paddock':h.location,x:wasIndoor?INITIAL.x:Math.max(1,Math.min(254,h.x)),y:wasIndoor?INITIAL.y:Math.max(1,Math.min(190,h.y)),hunger:Math.max(0,Math.min(100,h.hunger)),thirst:Math.max(0,Math.min(100,h.thirst)),fatigue:Math.max(0,Math.min(100,h.fatigue)),led:!wasIndoor&&h.led===true&&h.owner==='player'};stableHerd=data.version===3?data.stableHerd.map((a,i)=>({...STABLE_HERD[i],...a})):STABLE_HERD.map(a=>({...a,activity:'grazing',routeIndex:0,pause:2}));trail=wasIndoor?[]:data.trail.map(p=>({...p}));sellerTill=Number.isInteger(data.sellerTill)&&data.sellerTill>=0?data.sellerTill:8;lastTrail=trail.at(-1)||null;return true}
 return {view,herd,near,nearAny,buy,lead,tether,feed,water,hour,step,snapshot,restore};
}
root.KingdomGreyfordHorses={create};
})(window);
