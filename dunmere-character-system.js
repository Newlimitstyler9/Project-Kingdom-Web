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
for(const part of [...PARTS.map(layer=>`resident-v1-${layer}`),...["male","female"].flatMap(body=>PLAYER_PARTS.map(layer=>`player-v2-${body}-${layer}`))]){
 const img=new Image();images[part]=img;
 const resident=part.startsWith("resident-v1-");
 img.onload=()=>{if(img.naturalWidth!==384||img.naturalHeight!==(resident?576:48))failed=true};
 img.onerror=()=>{failed=true};
 img.src=`assets/${part}.png?v=1`;
}
function ready(){return !failed&&Object.entries(images).every(([part,img])=>img.complete&&img.naturalWidth===384&&img.naturalHeight===(part.startsWith("resident-v1-")?576:48))}
function render(ctx,id,x,y,size,direction,moving,walkTimeMs,appearance={}){
 if(!ready()||!Number.isInteger(id)||id<0||id>=PEOPLE.length)return false;
 const pose=KingdomPlayerFrames.select(direction,moving,walkTimeMs+(id===12?0:id*47));
 const scale=size/32,px=Math.round(x*size),py=Math.round(y*size);
 const shadowY=Math.round(py+size*.12),underwear=appearance.underwear===true;
 const destX=Math.round(px-size/2),destY=Math.round(shadowY-47*scale);
 ctx.fillStyle="#23352c88";ctx.beginPath();ctx.ellipse(px,shadowY,size*.22,size*.07,0,0,Math.PI*2);ctx.fill();
 ctx.imageSmoothingEnabled=false;
 const draw=(part,row)=>{ctx.drawImage(images[part],pose.frame*32,row*48,32,48,destX,destY,Math.round(size),Math.round(48*scale))};
 if(id===12){
  const body=appearance.bodyType==="female"?"female":"male";
  const layer=part=>draw(`player-v2-${body}-${part}`,0);
  if(!underwear&&appearance.hair!==false)layer("hair-back");
  layer("base");layer("head");
  if(underwear){layer("underwear");return true}
  if(appearance.legs!==false)layer("legs");
  if(appearance.torso!==false)layer("torso");
  layer("feet");
  if(appearance.hair!==false)layer("hair-front");
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
root.KingdomCharacterSystem={PEOPLE,PARTS,PLAYER_PARTS,images,render,get ready(){return ready()},get failed(){return failed}};
})(window);
