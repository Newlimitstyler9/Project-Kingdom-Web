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
const SKIN_COLORS={fair:['f9d5ba','e4a47c','cc8665','99423c','faece7'],warm:['f3c89f','d99467','bb704c','85413b','fff0d9'],tan:['d8a777','b97850','92553d','693a32','f2c7a1'],brown:['ad7655','874f3c','663c30','492d2c','d9a17d'],deep:['80513d','663d32','4c302a','35252a','ac7558']};
const HAIR_COLORS={brown:['463125','37271d','563d2d','241913','6b4c38'],black:['302b2a','242122','423839','1c1a1d','554a48'],auburn:['693b2c','512c25','804b32','342021','a0643e'],blond:['a17b4e','795e3d','bd975e','504332','d6b777'],silver:['858482','636767','a5a4a0','44494a','c7c2b6']};
const BOOT_COLORS={brown:['60432e','422f25','825c3c','9f744c'],dark:['454344','303032','606064','777276'],tan:['97724f','73563c','b58c62','d2ac7b']};
function recolored(part,kind,choice){const key=part+':'+kind+':'+choice;if(tinted.has(key))return tinted.get(key);const original=images[part],canvas=document.createElement('canvas');canvas.width=original.width;canvas.height=original.height;const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(original,0,0);const pixels=g.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;
 const src=kind==='skin'?['f9d5ba','e4a47c','cc8665','99423c','faece7']:kind==='hair'?['463125','37271d','563d2d','241913','6b4c38']:['60432e','422f25','825c3c','9f744c'];
 const dst=(kind==='skin'?SKIN_COLORS:kind==='hair'?HAIR_COLORS:BOOT_COLORS)[choice]||src;
 const replace=new Map(src.map((color,i)=>[parseInt(color,16),parseInt(dst[i],16)]));
 for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const rgb=(data[i]<<16)|(data[i+1]<<8)|data[i+2],next=replace.get(rgb);if(next===undefined)continue;data[i]=next>>16;data[i+1]=(next>>8)&255;data[i+2]=next&255}
 g.putImageData(pixels,0,0);tinted.set(key,canvas);return canvas}
for(const part of [...PARTS.map(layer=>`resident-v1-${layer}`),...["male","female"].flatMap(body=>PLAYER_PARTS.map(layer=>`player-v2-${body}-${layer}`)),...["bob","curly","braid"].flatMap(style=>["back","front"].map(layer=>`player-v2-hair-${style}-${layer}`))]){
 const img=new Image();images[part]=img;
 const resident=part.startsWith("resident-v1-");
 img.onload=()=>{if(img.naturalWidth!==384||img.naturalHeight!==(resident?576:48))failed=true};
 img.onerror=()=>{failed=true};
 img.src=`assets/${part}.png?v=1`;
}
const gearImages={};
for(const name of ['chain-male','chain-female','plate-torso-male','plate-torso-female','plate-legs-male','plate-legs-female','plate-arms-male','plate-arms-female','gloves-male','gloves-female','plate-boots-male','plate-boots-female','kettle','armet','leather-torso-male','leather-torso-female','leather-hood','leather-boots-male','leather-boots-female']){const img=new Image();gearImages[name]=img;img.src='assets/gear/'+name+'.png?v=1'}
const heldSprites=new Map();
const equipmentSheet=new Image();equipmentSheet.src='assets/held-equipment.png?v=1';
const directionalEquipment=new Image();directionalEquipment.src='assets/held-equipment-front-back.png?v=3';
const shieldBack=new Image();shieldBack.src='assets/shield-back.png?v=1';
const shieldRear=new Image();shieldRear.src='assets/shield-rear.png?v=1';
const rankTrim=new Image();rankTrim.src='assets/greyford-rank-trim.png?v=1';
const equipmentCells={pick:0,hoe:1,ironSword:2,steelSword:3,knife:4,steelDagger:5,spear:6,torch:7,ironAxe:8,steelAxe:9,steelPick:10,woodShield:11,ironShield:12,axe:13};
// Hand anchors follow the actual LPC pixels for idle, first stride and second stride.
// The right hand is viewer-left when facing down, viewer-right when facing up.
// In profile the main hand leads the body, so a drawn weapon stays visible.
const GRIP={down:[[5,32],[5,31],[5,33]],left:[[7,31],[7,30],[6,33]],right:[[25,32],[25,31],[26,33]],up:[[27,31],[27,30],[28,32]]};
const OFFGRIP={down:[[27,32],[27,33],[27,31]],left:[[13,32],[13,33],[14,31]],right:[[19,31],[19,32],[18,31]],up:[[5,31],[5,32],[5,30]]};
function handAnchor(direction,frame,bodyType,offhand=false){const frames=(offhand?OFFGRIP:GRIP)[direction]||GRIP.down;const index=Number.isInteger(frame)?frame%3:0;const [x,y]=frames[index];return [x,y+(bodyType==='female'&&direction!=='up'?1:0)]}
function heldSprite(id,direction=null){
 const directional=(direction==='down'||direction==='up')&&directionalEquipment.complete&&directionalEquipment.naturalWidth===24*14;
 const key=id+':'+(directional?direction:'side');
 if(heldSprites.has(key))return heldSprites.get(key);
 const cell=equipmentCells[id];if(cell===undefined||!equipmentSheet.complete||equipmentSheet.naturalWidth!==24*14)return null;
 const c=document.createElement('canvas');c.width=24;c.height=32;
 const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(directional?directionalEquipment:equipmentSheet,cell*24,direction==='up'&&directional?32:0,24,32,0,0,24,32);
 heldSprites.set(key,c);return c;
}
function drawHeld(ctx,id,px,py,size,direction,appearance){
 const sprite=heldSprite(id,direction);if(!sprite)return;
 const scale=size/32,crouch=appearance.crouch===true,guard=appearance.guard===true;
 const swing=Number.isFinite(appearance.attackPhase)?Math.max(0,Math.min(1,appearance.attackPhase)):null;
 const [handX,handY0]=handAnchor(direction,appearance._frame,appearance.bodyType),handY=handY0+(crouch?4:0);
 const viewerLeft=direction==='left'||direction==='down';
 const pivotX=px-size/2+(handX-(direction==='right'?3:0))*scale;
 const pivotY=py+size*.12-47*scale+handY*scale;
 const upright=['axe','ironSword','steelSword','knife','steelDagger','spear','ironAxe','steelAxe','torch'].includes(id);
 const frontBack=direction==='down'||direction==='up';
 const groundTool=['axe','ironAxe','steelAxe','pick','hoe','steelPick'].includes(id);
 const rest=frontBack&&groundTool?2.3:frontBack?0:id==='torch'?0:upright?.25:2.3;
 let angle=rest;
 if(guard)angle=id==='torch'?0:upright?.25:.85;
 else if(swing!==null){const ease=t=>t*t*(3-2*t);if(upright)angle=rest+(id==='torch'?.2:1.3)*Math.sin(Math.PI*swing);else angle=swing<.3?2.3-1.55*ease(swing/.3):swing<.78?.75+1.55*ease((swing-.3)/.48):2.3}
 if(upright?(direction==='down'||direction==='left'):viewerLeft)angle=-angle;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(pivotX),Math.round(pivotY));ctx.rotate(angle);if(!viewerLeft)ctx.scale(-1,1);
 ctx.drawImage(sprite,Math.round(-12*scale),Math.round(-23*scale),Math.round(24*scale),Math.round(32*scale));ctx.restore();
}
function drawOffhand(ctx,id,px,py,size,direction,appearance){
 const sprite=heldSprite(id);if(!sprite)return;
 const scale=size/32,crouch=appearance.crouch===true,guard=appearance.guard===true;
 const [handX,handY0]=handAnchor(direction,appearance._frame,appearance.bodyType,true),handY=handY0+(crouch?4:0);
 const x=px-size/2+handX*scale,y=py+size*.12-47*scale+handY*scale;
 if(direction==='up'){
  if(!shieldRear.complete||shieldRear.naturalWidth!==48)return;
  const cell=id==='ironShield'?1:0;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(shieldRear,cell*24,0,24,32,Math.round(x-9*scale),Math.round(y-21*scale),Math.round(24*scale),Math.round(32*scale));
  return;
 }
 if(direction==='left'||direction==='right'){
  if(!shieldBack.complete||shieldBack.naturalWidth!==16)return;
  const cell=id==='ironShield'?1:0;
  ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y));
  if(direction==='right')ctx.scale(-1,1);
  ctx.drawImage(shieldBack,cell*8,0,8,28,Math.round(-4*scale),Math.round((-14-(guard?4:0))*scale),Math.round(8*scale),Math.round(28*scale));
  ctx.restore();return;
 }
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y));
 if(direction==='right')ctx.scale(-1,1);
 ctx.drawImage(sprite,Math.round(-10*scale),Math.round((-12-(guard?4:0))*scale),Math.round(20*scale),Math.round(27*scale));ctx.restore();
}
function drawBack(ctx,id,px,py,size,direction,appearance){
 const sprite=heldSprite(id);if(!sprite)return;
 const scale=size/32,up=direction==='up',crouch=appearance.crouch===true;
 const x=px-size/2+(up?17:direction==='down'?17:19)*scale,y=py+size*.12-47*scale+(crouch?31:28)*scale;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y));ctx.rotate(direction==='right'?-.9:.9);
 if(id==='axe'){if(direction!=='right')ctx.scale(-1,1);ctx.drawImage(sprite,Math.round(-12*scale),Math.round(-17*scale),Math.round(20*scale),Math.round(25*scale))}
 else ctx.drawImage(sprite,Math.round(-12*scale),Math.round(-17*scale),Math.round(24*scale),Math.round(32*scale));
 ctx.restore();
}
function ready(){return !failed&&Object.entries(images).every(([part,img])=>img.complete&&img.naturalWidth===384&&img.naturalHeight===(part.startsWith("resident-v1-")?576:48))}
function clothingSheet(part,tint){const key=part+':'+tint;if(tinted.has(key))return tinted.get(key);const original=images[part],canvas=document.createElement('canvas');canvas.width=original.width;canvas.height=original.height;const g=canvas.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;g.drawImage(original,0,0);
 if(part.startsWith('player-v2-')&&/^#[\da-f]{6}$/i.test(tint)){
  const target=[1,3,5].map(i=>parseInt(tint.slice(i,i+2),16)),torso=part.endsWith('-torso');
  const ramp=torso?new Map([[0x4d4a5d,.42],[0x958080,.62],[0xc4b59f,.82],[0xe5e6c7,1],[0xffffff,1.17]]):new Map([[0x3c312c,.42],[0x5b4738,.62],[0x7d6346,.82],[0x9f7f58,1],[0xb69367,1.17]]);
  const pixels=g.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;
  for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const color=(data[i]<<16)|(data[i+1]<<8)|data[i+2],factor=ramp.get(color);if(!factor)continue;for(let c=0;c<3;c++)data[i+c]=Math.min(255,Math.round(target[c]*factor))}
  g.putImageData(pixels,0,0);
 }else{g.globalCompositeOperation='multiply';g.fillStyle=tint;g.fillRect(0,0,canvas.width,canvas.height);g.globalCompositeOperation='destination-in';g.drawImage(original,0,0)}
 tinted.set(key,canvas);return canvas}
function render(ctx,id,x,y,size,direction,moving,walkTimeMs,appearance={}){
 if(!ready()||!Number.isInteger(id)||id<0||id>=PEOPLE.length)return false;
 const lifeScale=appearance.lifeScale;
 if(Number.isFinite(lifeScale)&&lifeScale>0&&lifeScale<1){
  ctx.save();ctx.translate(x*size,y*size);ctx.scale(lifeScale,lifeScale);ctx.translate(-x*size,-y*size);
  const drawn=render(ctx,id,x,y,size,direction,moving,walkTimeMs,{...appearance,lifeScale:1});
  ctx.restore();return drawn;
 }
 const pose=KingdomPlayerFrames.select(direction,moving,walkTimeMs+(id===12?0:id*47));
 const equippedView={...appearance,_frame:pose.frame};
 const scale=size/32,px=Math.round(x*size),py=Math.round(y*size);
 const shadowY=Math.round(py+size*.12),underwear=appearance.underwear===true,crouch=appearance.crouch===true;
 const drawHeight=Math.round(48*scale),destX=Math.round(px-size/2),destY=Math.round(shadowY-drawHeight+scale);
 if(!appearance._noShadow){ctx.fillStyle="#23352c88";ctx.beginPath();ctx.ellipse(px,shadowY,size*.22,size*.07,0,0,Math.PI*2);ctx.fill()}
 if(crouch){
  const key=JSON.stringify([id,pose.frame,underwear,appearance.bodyType,appearance.hair,appearance.hairStyle,appearance.hairColor,appearance.skinTone,appearance.bootColor,appearance.torso,appearance.legs,appearance.torsoTint,appearance.legTint,appearance.gear]);
  const stable=!Number.isFinite(appearance.attackPhase)&&Object.values(gearImages).every(img=>img.complete);
  let bent=stable?crouchCache.get(key):null;
  if(!bent){
   const source=document.createElement('canvas');source.width=32;source.height=52;
   render(source.getContext('2d'),id,.5,1.375,32,direction,moving,walkTimeMs,{...appearance,crouch:false,handItem:null,offhandItem:null,backItem:null,_noShadow:true});
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
  if(appearance.backItem&&direction!=='up')drawBack(ctx,appearance.backItem,px,py,size,direction,equippedView);
  if(appearance.offhandItem&&direction==='up')drawOffhand(ctx,appearance.offhandItem,px,py,size,direction,equippedView);
  if(appearance.handItem&&(direction==='up'||direction==='right'))drawHeld(ctx,appearance.handItem,px,py,size,direction,equippedView);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(bent,0,1,32,48,destX,destY,size,drawHeight);
  if(appearance.backItem&&direction==='up')drawBack(ctx,appearance.backItem,px,py,size,direction,equippedView);
  if(appearance.handItem&&direction!=='up'&&direction!=='right')drawHeld(ctx,appearance.handItem,px,py,size,direction,equippedView);
  if(appearance.offhandItem&&direction!=='up')drawOffhand(ctx,appearance.offhandItem,px,py,size,direction,equippedView);
  if(appearance.handItem){const [hx,hy]=handAnchor(direction,pose.frame,appearance.bodyType);ctx.save();ctx.beginPath();ctx.rect(Math.round(destX+(hx-2)*scale),Math.round(destY+(hy+2)*scale),Math.round(4*scale),Math.round(4*scale));ctx.clip();ctx.drawImage(bent,0,1,32,48,destX,destY,size,drawHeight);ctx.restore()}
  return true;
 }
 const attackLean=id===12&&Number.isFinite(appearance.attackPhase)?Math.sin(appearance.attackPhase*Math.PI)*.13:0;
 if(attackLean){ctx.save();ctx.translate(px,shadowY-11*scale);ctx.rotate((direction==='left'||direction==='up'?-1:1)*attackLean);ctx.translate(-px,-shadowY+11*scale)}
 ctx.imageSmoothingEnabled=false;
 const drawGear=(name,tint=null)=>{const original=gearImages[name];if(!original?.complete||original.naturalWidth!==576||original.naturalHeight!==256)return;let img=original;if(tint){const key=name+':'+tint;if(!tintedGear.has(key)){const canvas=document.createElement('canvas');canvas.width=576;canvas.height=256;const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(original,0,0);g.globalCompositeOperation='multiply';g.fillStyle=tint;g.fillRect(0,0,576,256);g.globalCompositeOperation='destination-in';g.drawImage(original,0,0);tintedGear.set(key,canvas)}img=tintedGear.get(key)}const frame=pose.frame,row=[2,1,3,0][Math.floor(frame/3)],col=[0,2,6][frame%3];ctx.drawImage(img,col*64+16,row*64+12,32,52,destX,destY,Math.round(size),drawHeight)};
 const draw=(part,row,tint=null)=>{const source=tint?clothingSheet(part,tint):images[part];ctx.drawImage(source,pose.frame*32,row*48,32,48,destX,destY,Math.round(size),drawHeight)};
 if(id===12&&appearance.backItem&&direction!=='up')drawBack(ctx,appearance.backItem,px,py,size,direction,equippedView);
 if(id===12&&appearance.offhandItem&&direction==='up')drawOffhand(ctx,appearance.offhandItem,px,py,size,direction,equippedView);
 if(id===12&&appearance.handItem&&(direction==='up'||direction==='right'))drawHeld(ctx,appearance.handItem,px,py,size,direction,equippedView);
 if(id===12){
  const body=appearance.bodyType==="female"?"female":"male";
  const hairStyle=appearance.hairStyle,hairBody=hairStyle==='tied'?'female':hairStyle==='short'?'male':body,hairVisible=appearance.hair!==false&&hairStyle!=='bald';
  const hairPart=layer=>['bob','curly','braid'].includes(hairStyle)?`hair-${hairStyle}-${layer}`:`${hairBody}-hair-${layer}`;
  const layer=part=>draw(`player-v2-${body}-${part}`,0);
  const custom=(part,kind,choice)=>{const key=`player-v2-${part}`,source=choice===(kind==='skin'?'fair':'brown')?images[key]:recolored(key,kind,choice);ctx.drawImage(source,pose.frame*32,0,32,48,destX,destY,Math.round(size),drawHeight)};
  if(!underwear&&hairVisible)custom(hairPart('back'),'hair',appearance.hairColor||'brown');
  custom(body+'-base','skin',appearance.skinTone||'fair');custom(body+'-head','skin',appearance.skinTone||'fair');
  if(underwear){layer("underwear");if(attackLean)ctx.restore();return true}
  if(appearance.legs!==false)draw(`player-v2-${body}-legs`,0,appearance.legTint||null);
  const gear=appearance.gear||{},steel='#c0e2ed',hide='#b68c63';
  if(gear.legs==='ironGreaves'||gear.legs==='steelGreaves')drawGear('plate-legs-'+body,gear.legs==='steelGreaves'?steel:null);
  if(appearance.torso!==false)draw(`player-v2-${body}-torso`,0,appearance.torsoTint||null);
  if(gear.torso==='leatherJerkin')drawGear('leather-torso-'+body);
  if(gear.torso==='chainHauberk')drawGear('chain-'+body);
  if(gear.torso==='plateCuirass'||gear.torso==='steelCuirass'){const tint=gear.torso==='steelCuirass'?steel:null;drawGear('plate-torso-'+body,tint);drawGear('plate-arms-'+body,tint)}
  custom(body+'-feet','boots',appearance.bootColor||'brown');
  if(gear.feet==='leatherBoots')drawGear('leather-boots-'+body,hide);
  if(gear.feet==='ironBoots'||gear.feet==='steelBoots')drawGear('plate-boots-'+body,gear.feet==='steelBoots'?steel:null);
  if(gear.hands==='leatherGloves')drawGear('gloves-'+body,hide);
  if(gear.hands==='ironGauntlets'||gear.hands==='steelGauntlets')drawGear('gloves-'+body,gear.hands==='steelGauntlets'?steel:null);
  if(hairVisible&&!['plateHelm','steelHelm','leatherHood'].includes(gear.head))custom(hairPart('front'),'hair',appearance.hairColor||'brown');
  if(gear.head==='leatherHood')drawGear('leather-hood',hide);
  if(gear.head==='ironKettleHelm')drawGear('kettle');
  if(gear.head==='plateHelm'||gear.head==='steelHelm')drawGear('armet',gear.head==='steelHelm'?steel:null);
  if(appearance.backItem&&direction==='up')drawBack(ctx,appearance.backItem,px,py,size,direction,equippedView);
  if(appearance.handItem&&direction!=='up'&&direction!=='right')drawHeld(ctx,appearance.handItem,px,py,size,direction,equippedView);
  if(appearance.offhandItem&&direction!=='up')drawOffhand(ctx,appearance.offhandItem,px,py,size,direction,equippedView);
  // Only the fingers cross the grip. Redrawing the whole forearm here hides
  // the blade and torch shaft, especially in the side-facing frames.
  const redrawGripArm=offhand=>{const [hx,hy]=handAnchor(direction,pose.frame,body,offhand);ctx.save();ctx.beginPath();ctx.rect(Math.round(destX+(hx-2)*scale),Math.round(destY+(hy-2)*scale),Math.round(4*scale),Math.round(5*scale));ctx.clip();custom(body+'-base','skin',appearance.skinTone||'fair');if(gear.hands==='leatherGloves')drawGear('gloves-'+body,hide);if(gear.hands==='ironGauntlets'||gear.hands==='steelGauntlets')drawGear('gloves-'+body,gear.hands==='steelGauntlets'?steel:null);ctx.restore()};
  if(appearance.handItem&&direction!=='up')redrawGripArm(false);
  if(attackLean)ctx.restore();
  return true;
 }
 const layer=part=>draw(`resident-v1-${part}`,id);
 if(!underwear&&appearance.hair!==false&&PEOPLE[id].bodyType==="female")layer("hair-back");
 layer("base");layer("head");
 if(!underwear){
  if(appearance.legs!==false)draw('resident-v1-legs',id,appearance.legTint||null);
  if(appearance.torso!==false){draw('resident-v1-torso',id,appearance.torsoTint||null);const rank={noble:0,officer:1,merchant:2}[appearance.rankTrim];if(rank!==undefined&&rankTrim.complete&&rankTrim.naturalWidth===384)ctx.drawImage(rankTrim,pose.frame*32,rank*48,32,48,destX,destY,Math.round(size),drawHeight)}
  layer("feet");
  if(appearance.hair!==false)layer("hair-front");
 }
 if(attackLean)ctx.restore();
 return true;
}
root.KingdomCharacterSystem={PEOPLE,PARTS,PLAYER_PARTS,images,gearImages,render,get ready(){return ready()},get failed(){return failed}};
})(window);
