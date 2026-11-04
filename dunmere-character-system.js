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
const tinted=new Map();
for(const part of [...PARTS.map(layer=>`resident-v1-${layer}`),...["male","female"].flatMap(body=>PLAYER_PARTS.map(layer=>`player-v2-${body}-${layer}`))]){
 const img=new Image();images[part]=img;
 const resident=part.startsWith("resident-v1-");
 img.onload=()=>{if(img.naturalWidth!==384||img.naturalHeight!==(resident?576:48))failed=true};
 img.onerror=()=>{failed=true};
 img.src=`assets/${part}.png?v=1`;
}
const gearImages={};
for(const name of ['chain-male','chain-female','plate-torso-male','plate-torso-female','plate-legs-male','plate-legs-female','plate-arms-male','plate-arms-female','gloves-male','gloves-female','plate-boots-male','plate-boots-female','kettle','armet']){const img=new Image();gearImages[name]=img;img.src='assets/gear/'+name+'.png?v=1'}
function ready(){return !failed&&Object.entries(images).every(([part,img])=>img.complete&&img.naturalWidth===384&&img.naturalHeight===(part.startsWith("resident-v1-")?576:48))}
function clothingSheet(part,tint){const key=part+':'+tint;if(tinted.has(key))return tinted.get(key);const original=images[part],canvas=document.createElement('canvas');canvas.width=original.width;canvas.height=original.height;const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(original,0,0);g.globalCompositeOperation='multiply';g.fillStyle=tint;g.fillRect(0,0,canvas.width,canvas.height);g.globalCompositeOperation='destination-in';g.drawImage(original,0,0);tinted.set(key,canvas);return canvas}
function render(ctx,id,x,y,size,direction,moving,walkTimeMs,appearance={}){
 if(!ready()||!Number.isInteger(id)||id<0||id>=PEOPLE.length)return false;
 const pose=KingdomPlayerFrames.select(direction,moving,walkTimeMs+(id===12?0:id*47));
 const scale=size/32,px=Math.round(x*size),py=Math.round(y*size);
 const shadowY=Math.round(py+size*.12),underwear=appearance.underwear===true,crouch=appearance.crouch===true;
 const drawHeight=Math.round(48*scale*(crouch?.78:1)),destX=Math.round(px-size/2),destY=Math.round(shadowY-drawHeight+scale);
 ctx.fillStyle="#23352c88";ctx.beginPath();ctx.ellipse(px,shadowY,size*.22,size*.07,0,0,Math.PI*2);ctx.fill();
 ctx.imageSmoothingEnabled=false;
 const drawGear=name=>{const img=gearImages[name];if(!img?.complete||img.naturalWidth!==576||img.naturalHeight!==256)return;const frame=pose.frame,row=[2,1,3,0][Math.floor(frame/3)],col=[0,2,6][frame%3];ctx.drawImage(img,col*64+16,row*64+12,32,52,destX,destY,Math.round(size),drawHeight)};
 const draw=(part,row,tint=null)=>{const source=tint?clothingSheet(part,tint):images[part];ctx.drawImage(source,pose.frame*32,row*48,32,48,destX,destY,Math.round(size),drawHeight)};
 if(id===12){
  const body=appearance.bodyType==="female"?"female":"male";
  const layer=part=>draw(`player-v2-${body}-${part}`,0);
  if(!underwear&&appearance.hair!==false)layer("hair-back");
  layer("base");layer("head");
  if(underwear){layer("underwear");return true}
  if(appearance.legs!==false)draw(`player-v2-${body}-legs`,0,appearance.legTint||null);
  if(appearance.gear?.legs==='ironGreaves')drawGear('plate-legs-'+body);
  if(appearance.torso!==false)draw(`player-v2-${body}-torso`,0,appearance.torsoTint||null);
  if(appearance.gear?.torso==='chainHauberk')drawGear('chain-'+body);
  if(appearance.gear?.torso==='plateCuirass'){drawGear('plate-torso-'+body);drawGear('plate-arms-'+body)}
  layer("feet");
  if(appearance.gear?.feet==='ironBoots')drawGear('plate-boots-'+body);
  if(appearance.gear?.hands==='ironGauntlets')drawGear('gloves-'+body);
  if(appearance.hair!==false&&appearance.gear?.head!=='plateHelm')layer("hair-front");
  if(appearance.gear?.head==='ironKettleHelm')drawGear('kettle');
  if(appearance.gear?.head==='plateHelm')drawGear('armet');
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
 return true;
}
root.KingdomCharacterSystem={PEOPLE,PARTS,PLAYER_PARTS,images,gearImages,render,get ready(){return ready()},get failed(){return failed}};
})(window);
