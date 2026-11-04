// Player and residents share the credited LPC pose grid, proportions and ground anchor.
(function(root){"use strict";
const PARTS=Object.freeze(["hair-back","base","head","legs","torso","feet","hair-front"]);
const PLAYER_PARTS=Object.freeze(["hair-back","base","head","underwear","legs","torso","feet","hair-front"]);
const PEOPLE=Object.freeze([
 ["Aldric","smith"],["Marta","farmer","female"],["Oswin","merchant"],
 ["Edda","healer","female"],["Borin","miller"],["Nell","innkeeper","female"],
 ["Tessa","trader","female"],["Garrick","guard"],["Iris","baker","female"],
 ["Rowan","laborer"],["Bea","weaver","female"],["Edric","farmhand"],
 ["Player","traveler"]
].map(([name,role,bodyType="male"],row)=>Object.freeze({name,role,bodyType,row})));
const images={};let failed=false;
const tinted=new Map(),tintedGear=new Map(),crouchCache=new Map();
for(const part of [...PARTS.map(layer=>`resident-v1-${layer}`),...["male","female"].flatMap(body=>PLAYER_PARTS.map(layer=>`player-v2-${body}-${layer}`))]){
 const img=new Image();images[part]=img;
 const resident=part.startsWith("resident-v1-");
 img.onload=()=>{if(img.naturalWidth!==384||img.naturalHeight!==(resident?576:48))failed=true};
 img.onerror=()=>{failed=true};
 img.src=`assets/${part}.png?v=1`;
}
const gearImages={};
for(const name of ['chain-male','chain-female','plate-torso-male','plate-torso-female','plate-legs-male','plate-legs-female','plate-arms-male','plate-arms-female','gloves-male','gloves-female','plate-boots-male','plate-boots-female','kettle','armet','leather-torso-male','leather-torso-female','leather-hood','leather-boots-male','leather-boots-female']){const img=new Image();gearImages[name]=img;img.src='assets/gear/'+name+'.png?v=1'}
const heldSprites=new Map();
function heldSprite(id){
 if(heldSprites.has(id))return heldSprites.get(id);
 if(id==='axe'){
  // A separate 20×25 world sprite keeps a readable stone head and a real hand grip.
  const c=document.createElement('canvas');c.width=20;c.height=25;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const blocks=(color,rects)=>{g.fillStyle=color;for(const [x,y,w,h] of rects)g.fillRect(x,y,w,h)};
  blocks('#302b25',[[10,3,4,22],[4,2,8,9],[2,4,11,5],[1,5,13,3]]);
  blocks('#775137',[[11,4,2,20]]);
  blocks('#b47c4a',[[11,6,1,17]]);
  // Chipped, tapered stone blade; the narrow end is lashed to the wooden haft.
  blocks('#46504c',[[5,2,6,1],[3,3,9,1],[2,4,10,1],[1,5,11,3],[2,8,10,1],[4,9,7,1],[6,10,4,1]]);
  blocks('#89948b',[[5,3,5,1],[4,4,7,1],[3,5,8,3],[4,8,7,1],[6,9,4,1]]);
  blocks('#c2c9ba',[[5,3,3,1],[3,5,4,1],[2,6,3,1],[4,8,3,1]]);
  blocks('#d5ddcb',[[1,6,1,1],[2,5,1,1]]);
  blocks('#4b3528',[[10,7,4,1],[10,10,4,1],[10,12,4,1]]);
  blocks('#c5ab7b',[[10,8,4,1],[10,11,4,1]]);
  blocks('#593c29',[[10,16,4,2],[10,22,4,2]]);
  heldSprites.set(id,c);return c;
 }
 const def=root.KingdomItemCatalog?.defs[id];
 if(!def?.art||!def.palette||def.slot!=='hand')return null;
 const c=document.createElement('canvas');c.width=16;c.height=13;
 const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 def.art.forEach((row,y)=>[...row].forEach((pixel,x)=>{const color=def.palette[Number(pixel)];if(pixel!=='.'&&color){g.fillStyle=color;g.fillRect(x,y,1,1)}}));
 heldSprites.set(id,c);return c;
}
function drawHeld(ctx,id,px,py,size,direction,appearance){
 const sprite=heldSprite(id);if(!sprite)return;
 const scale=size/32,crouch=appearance.crouch===true,guard=appearance.guard===true;
 const swing=Number.isFinite(appearance.attackPhase)?Math.max(0,Math.min(1,appearance.attackPhase)):null;
 if(id==='axe'){
  const left=direction==='left',mirror=left||direction==='down',up=direction==='up';
  // In the front view the character's right hand is on the viewer's left.
  const handX=mirror?8:up?23:24,handY=(up?27:28)+(crouch?4:0);
  const arc=swing===null?0:Math.sin(Math.PI*swing);
  const pivotX=px-size/2+(handX+(mirror?-2:2)*arc)*scale;
  const pivotY=py+size*.12-47*scale+(handY-3*arc)*scale;
  // The handle's grip pixel (12,17) stays anchored at the hand throughout the chop.
  let angle=.9;
  if(guard)angle=.55;
  else if(swing!==null){const ease=t=>t*t*(3-2*t);angle=swing<.2?.9-.3*ease(swing/.2):swing<.72?.6+2.05*ease((swing-.2)/.52):2.65-1.75*ease((swing-.72)/.28)}
  if(mirror)angle=-angle;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(pivotX),Math.round(pivotY));ctx.rotate(angle);
  if(mirror)ctx.scale(-1,1);
  ctx.drawImage(sprite,Math.round(-12*scale),Math.round(-17*scale),Math.round(20*scale),Math.round(25*scale));
  ctx.restore();
  // The fingers overlap the haft at its grip, rather than the haft covering the hand.
  ctx.fillStyle='#654839';ctx.fillRect(Math.round(pivotX-2*scale),Math.round(pivotY-scale),Math.max(2,Math.round(4*scale)),Math.max(2,Math.round(3*scale)));
  ctx.fillStyle='#d9a789';ctx.fillRect(Math.round(pivotX-scale),Math.round(pivotY-scale),Math.max(1,Math.round(2*scale)),Math.max(1,Math.round(2*scale)));
  return;
 }
 const offsets={down:[24,26,2.25],left:[8,27,-2.25],right:[24,27,2.25],up:[24,25,2.5]};
 const [handX,handY,baseAngle]=offsets[direction]||offsets.down;
 const armReach=swing===null?0:Math.sin(swing*Math.PI)*4;
 const pivotX=px-size/2+(handX+(direction==='left'?-armReach:armReach))*scale;
 const pivotY=py+size*.12-47*scale+(handY-(swing===null?0:Math.sin(swing*Math.PI)*3)+(crouch?5:0))*scale;
 const angle=guard?(direction==='left'?-1.45:1.45):swing===null?baseAngle:(direction==='left'?-1:1)*(2.8-swing*2.7);
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(pivotX),Math.round(pivotY));ctx.rotate(angle);
 const long=id==='spear',length=long?19:16,top=long?16:11;
 ctx.drawImage(sprite,Math.round(-8*scale),Math.round(-top*scale),Math.round(length*scale),Math.round(13*scale*(long?1.34:1)));
 ctx.restore();
}
function drawBack(ctx,id,px,py,size,direction,appearance){
 const sprite=heldSprite(id);if(!sprite)return;
 const scale=size/32,up=direction==='up',crouch=appearance.crouch===true;
 const x=px-size/2+(up?20:direction==='down'?20:19)*scale,y=py+size*.12-47*scale+(crouch?31:28)*scale;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y));ctx.rotate(.9);
 if(id==='axe')ctx.drawImage(sprite,Math.round(-12*scale),Math.round(-17*scale),Math.round(20*scale),Math.round(25*scale));
 else ctx.drawImage(sprite,Math.round(-8*scale),Math.round(-10*scale),Math.round(16*scale),Math.round(13*scale));
 ctx.restore();
}
function ready(){return !failed&&Object.entries(images).every(([part,img])=>img.complete&&img.naturalWidth===384&&img.naturalHeight===(part.startsWith("resident-v1-")?576:48))}
function clothingSheet(part,tint){const key=part+':'+tint;if(tinted.has(key))return tinted.get(key);const original=images[part],canvas=document.createElement('canvas');canvas.width=original.width;canvas.height=original.height;const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(original,0,0);g.globalCompositeOperation='multiply';g.fillStyle=tint;g.fillRect(0,0,canvas.width,canvas.height);g.globalCompositeOperation='destination-in';g.drawImage(original,0,0);tinted.set(key,canvas);return canvas}
function render(ctx,id,x,y,size,direction,moving,walkTimeMs,appearance={}){
 if(!ready()||!Number.isInteger(id)||id<0||id>=PEOPLE.length)return false;
 const pose=KingdomPlayerFrames.select(direction,moving,walkTimeMs+(id===12?0:id*47));
 const scale=size/32,px=Math.round(x*size),py=Math.round(y*size);
 const shadowY=Math.round(py+size*.12),underwear=appearance.underwear===true,crouch=appearance.crouch===true;
 const drawHeight=Math.round(48*scale),destX=Math.round(px-size/2),destY=Math.round(shadowY-drawHeight+scale);
 if(!appearance._noShadow){ctx.fillStyle="#23352c88";ctx.beginPath();ctx.ellipse(px,shadowY,size*.22,size*.07,0,0,Math.PI*2);ctx.fill()}
 if(crouch){
  const key=JSON.stringify([id,pose.frame,underwear,appearance.bodyType,appearance.hair,appearance.torso,appearance.legs,appearance.torsoTint,appearance.legTint,appearance.gear]);
  const stable=!Number.isFinite(appearance.attackPhase)&&Object.values(gearImages).every(img=>img.complete);
  let bent=stable?crouchCache.get(key):null;
  if(!bent){
   const source=document.createElement('canvas');source.width=32;source.height=52;
   render(source.getContext('2d'),id,.5,1.375,32,direction,moving,walkTimeMs,{...appearance,crouch:false,handItem:null,_noShadow:true});
   bent=document.createElement('canvas');bent.width=32;bent.height=52;
   const g=bent.getContext('2d');g.imageSmoothingEnabled=false;
   // Lower the torso while the boots stay planted. Shift each knee outward to make a squat.
   g.drawImage(source,0,1,32,27,0,7,32,27);
   g.drawImage(source,0,28,16,12,-2,31,16,12);
   g.drawImage(source,16,28,16,12,18,31,16,12);
   g.drawImage(source,0,40,16,9,-1,40,16,9);
   g.drawImage(source,16,40,16,9,17,40,16,9);
   if(stable){if(crouchCache.size>120)crouchCache.clear();crouchCache.set(key,bent)}
  }
  if(appearance.handItem&&direction==='up')drawHeld(ctx,appearance.handItem,px,py,size,direction,appearance);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(bent,0,1,32,48,destX,destY,size,drawHeight);
  if(appearance.backItem)drawBack(ctx,appearance.backItem,px,py,size,direction,appearance);
  if(appearance.handItem&&direction!=='up')drawHeld(ctx,appearance.handItem,px,py,size,direction,appearance);
  return true;
 }
 const attackLean=id===12&&Number.isFinite(appearance.attackPhase)?Math.sin(appearance.attackPhase*Math.PI)*.13:0;
 if(attackLean){ctx.save();ctx.translate(px,shadowY-11*scale);ctx.rotate((direction==='left'||direction==='up'?-1:1)*attackLean);ctx.translate(-px,-shadowY+11*scale)}
 ctx.imageSmoothingEnabled=false;
 const drawGear=(name,tint=null)=>{const original=gearImages[name];if(!original?.complete||original.naturalWidth!==576||original.naturalHeight!==256)return;let img=original;if(tint){const key=name+':'+tint;if(!tintedGear.has(key)){const canvas=document.createElement('canvas');canvas.width=576;canvas.height=256;const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(original,0,0);g.globalCompositeOperation='multiply';g.fillStyle=tint;g.fillRect(0,0,576,256);g.globalCompositeOperation='destination-in';g.drawImage(original,0,0);tintedGear.set(key,canvas)}img=tintedGear.get(key)}const frame=pose.frame,row=[2,1,3,0][Math.floor(frame/3)],col=[0,2,6][frame%3];ctx.drawImage(img,col*64+16,row*64+12,32,52,destX,destY,Math.round(size),drawHeight)};
 const draw=(part,row,tint=null)=>{const source=tint?clothingSheet(part,tint):images[part];ctx.drawImage(source,pose.frame*32,row*48,32,48,destX,destY,Math.round(size),drawHeight)};
 if(id===12&&appearance.handItem&&direction==='up')drawHeld(ctx,appearance.handItem,px,py,size,direction,appearance);
 if(id===12){
  const body=appearance.bodyType==="female"?"female":"male";
  const layer=part=>draw(`player-v2-${body}-${part}`,0);
  if(!underwear&&appearance.hair!==false)layer("hair-back");
  layer("base");layer("head");
  if(underwear){layer("underwear");if(attackLean)ctx.restore();return true}
  if(appearance.legs!==false)draw(`player-v2-${body}-legs`,0,appearance.legTint||null);
  const gear=appearance.gear||{},steel='#c0e2ed',hide='#b68c63';
  if(gear.legs==='ironGreaves'||gear.legs==='steelGreaves')drawGear('plate-legs-'+body,gear.legs==='steelGreaves'?steel:null);
  if(appearance.torso!==false)draw(`player-v2-${body}-torso`,0,appearance.torsoTint||null);
  if(gear.torso==='leatherJerkin')drawGear('leather-torso-'+body);
  if(gear.torso==='chainHauberk')drawGear('chain-'+body);
  if(gear.torso==='plateCuirass'||gear.torso==='steelCuirass'){const tint=gear.torso==='steelCuirass'?steel:null;drawGear('plate-torso-'+body,tint);drawGear('plate-arms-'+body,tint)}
  layer("feet");
  if(gear.feet==='leatherBoots')drawGear('leather-boots-'+body,hide);
  if(gear.feet==='ironBoots'||gear.feet==='steelBoots')drawGear('plate-boots-'+body,gear.feet==='steelBoots'?steel:null);
  if(gear.hands==='leatherGloves')drawGear('gloves-'+body,hide);
  if(gear.hands==='ironGauntlets'||gear.hands==='steelGauntlets')drawGear('gloves-'+body,gear.hands==='steelGauntlets'?steel:null);
  if(appearance.hair!==false&&!['plateHelm','steelHelm','leatherHood'].includes(gear.head))layer("hair-front");
  if(gear.head==='leatherHood')drawGear('leather-hood',hide);
  if(gear.head==='ironKettleHelm')drawGear('kettle');
  if(gear.head==='plateHelm'||gear.head==='steelHelm')drawGear('armet',gear.head==='steelHelm'?steel:null);
  if(appearance.backItem)drawBack(ctx,appearance.backItem,px,py,size,direction,appearance);
  if(appearance.handItem&&direction!=='up')drawHeld(ctx,appearance.handItem,px,py,size,direction,appearance);
  if(attackLean)ctx.restore();
  return true;
 }
 const layer=part=>draw(`resident-v1-${part}`,id);
 if(!underwear&&appearance.hair!==false&&PEOPLE[id].bodyType==="female")layer("hair-back");
 layer("base");layer("head");
 if(!underwear){
  if(appearance.legs!==false)layer("legs");
  if(appearance.torso!==false)layer("torso");
  layer("feet");
  if(appearance.hair!==false)layer("hair-front");
 }
 if(attackLean)ctx.restore();
 return true;
}
root.KingdomCharacterSystem={PEOPLE,PARTS,PLAYER_PARTS,images,gearImages,render,get ready(){return ready()},get failed(){return failed}};
})(window);
