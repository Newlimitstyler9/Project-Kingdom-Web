// NPCs use the original thirteen-row sheets. Both playable body types use
// independently authored LPC layers aligned to the same twelve-pose grid.
(function(root){"use strict";
const PARTS=Object.freeze(["base-male","base-female","head","hair","headwear","torso","legs","hands"]);
const PLAYER_PARTS=Object.freeze(["hair-back","base","head","underwear","legs","torso","feet","hair-front"]);
const PEOPLE=Object.freeze([
 ["Aldric","smith"],["Marta","farmer","female"],["Oswin","merchant"],
 ["Edda","healer","female"],["Borin","miller"],["Nell","innkeeper","female"],
 ["Tessa","trader","female"],["Garrick","guard"],["Iris","baker","female"],
 ["Rowan","laborer"],["Bea","weaver","female"],["Edric","farmhand"],
 ["Player","traveler"]
].map(([name,role,bodyType="male"],row)=>Object.freeze({name,role,bodyType,row})));
const images={};let failed=false;
for(const part of [...PARTS,...["male","female"].flatMap(body=>PLAYER_PARTS.map(layer=>`player-v2-${body}-${layer}`))]){
 const img=new Image();
 images[part]=img;
 const playerPart=part.startsWith("player-v2-");
 const height=playerPart?48:624;
 img.onload=()=>{if(img.naturalWidth!==384||img.naturalHeight!==height)failed=true};
 img.onerror=()=>{failed=true};
 img.src=playerPart?`assets/${part}.png?v=2`:`assets/character-${part}-v1.png?v=3`;
}
function ready(){return !failed&&Object.entries(images).every(([part,img])=>img.complete&&img.naturalWidth===384&&img.naturalHeight===(part.startsWith("player-v2-")?48:624))}
function render(ctx,id,x,y,size,direction,moving,walkTimeMs,appearance={}){
 if(!ready()||!Number.isInteger(id)||id<0||id>=PEOPLE.length)return false;
 const pose=KingdomPlayerFrames.select(direction,moving,walkTimeMs+(id===12?0:id*47));
 const scale=size/32,px=Math.round(x*size),py=Math.round(y*size);
 const shadowY=Math.round(py+size*.12),underwear=appearance.underwear===true;
 const destX=Math.round(px-size/2);
 const destY=Math.round(shadowY-(id===12?47:(underwear?44:45))*scale);
 const width=Math.round(size),height=Math.round(48*scale);
 ctx.fillStyle="#23352c88";
 ctx.beginPath();ctx.ellipse(px,shadowY,size*.22,size*.07,0,0,Math.PI*2);ctx.fill();
 ctx.imageSmoothingEnabled=false;
 const draw=(part,row)=>{if(row===null)return;ctx.drawImage(images[part],pose.frame*32,row*48,32,48,destX,destY,width,height)};
 if(id===12){
  const body=appearance.bodyType==="female"?"female":"male";
  const layer=part=>draw(`player-v2-${body}-${part}`,0);
  if(!underwear&&appearance.hair!==false)layer("hair-back");
  layer("base");
  layer("head");
  if(underwear){layer("underwear");return true}
  if(appearance.legs!==false)layer("legs");
  if(appearance.torso!==false)layer("torso");
  layer("feet");
  if(appearance.hair!==false)layer("hair-front");
  return true;
 }
 const bareLegs=underwear||appearance.legs===false;
 const bareTorso=underwear||appearance.torso===false;
 const bald=appearance.hair===false;
 const bodyType=appearance.bodyType||PEOPLE[id].bodyType;
 if(bareLegs||bareTorso||bald)draw(bodyType==="female"?"base-female":"base-male",id);
 if(underwear)return true;
 if(!bareLegs)draw("legs",id);
 if(!bareTorso)draw("torso",id);
 if(!bareTorso)draw("hands",id);
 if(!bald)draw("head",id);
 if(appearance.hair!==false)draw("hair",id);
 if(appearance.headwear!==false)draw("headwear",id);
 return true;
}
root.KingdomCharacterSystem={PEOPLE,PARTS,PLAYER_PARTS,images,render,get ready(){return ready()},get failed(){return failed}};
})(window);
