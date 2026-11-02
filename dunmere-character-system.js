// One pose index and ground anchor for every character part. Each sheet has
// thirteen rows: twelve named residents followed by the player.
(function(root){"use strict";
const PARTS=Object.freeze(["base-male","base-female","head","hair","headwear","torso","legs","hands"]);
const FEMALE_PARTS=Object.freeze(["head","hair","torso","legs","hands"]);
const PEOPLE=Object.freeze([
 ["Aldric","smith"],["Marta","farmer","female"],["Oswin","merchant"],
 ["Edda","healer","female"],["Borin","miller"],["Nell","innkeeper","female"],
 ["Tessa","trader","female"],["Garrick","guard"],["Iris","baker","female"],
 ["Rowan","laborer"],["Bea","weaver","female"],["Edric","farmhand"],
 ["Player","traveler"]
].map(([name,role,bodyType="male"],row)=>Object.freeze({name,role,bodyType,row})));
const images={};let failed=false;
for(const part of [...PARTS,...FEMALE_PARTS.map(part=>"female-"+part)]){
 const img=new Image();
 images[part]=img;
 const height=part.startsWith("female-")?48:624;
 img.onload=()=>{if(img.naturalWidth!==384||img.naturalHeight!==height)failed=true};
 img.onerror=()=>{failed=true};
 img.src=(part.startsWith("female-")?"assets/female-player-"+part.slice(7):"assets/character-"+part)+"-v1.png?v=3";
}
function ready(){return !failed&&Object.entries(images).every(([part,img])=>img.complete&&img.naturalWidth===384&&img.naturalHeight===(part.startsWith("female-")?48:624))}
function render(ctx,id,x,y,size,direction,moving,walkTimeMs,appearance={}){
 if(!ready()||!Number.isInteger(id)||id<0||id>=PEOPLE.length)return false;
 const pose=KingdomPlayerFrames.select(direction,moving,walkTimeMs+(id===12?0:id*47));
 const scale=size/32,px=Math.round(x*size),py=Math.round(y*size);
 const shadowY=Math.round(py+size*.12),underwear=appearance.underwear===true;
 const destX=Math.round(px-size/2);
 const destY=Math.round(shadowY-(underwear?44:45)*scale);
 const width=Math.round(size),height=Math.round(48*scale);
 ctx.fillStyle="#23352c88";
 ctx.beginPath();ctx.ellipse(px,shadowY,size*.22,size*.07,0,0,Math.PI*2);ctx.fill();
 ctx.imageSmoothingEnabled=false;
 const draw=(part,row)=>{if(row===null)return;ctx.drawImage(images[part],pose.frame*32,row*48,32,48,destX,destY,width,height)};
 const bareLegs=underwear||appearance.legs===false;
 const bareTorso=underwear||appearance.torso===false;
 const bald=appearance.hair===false;
 const bodyType=appearance.bodyType||PEOPLE[id].bodyType;
 const femalePlayer=id===12&&bodyType==="female";
 const choose=part=>femalePlayer&&FEMALE_PARTS.includes(part)?"female-"+part:part;
 const row=femalePlayer?0:id;
 if(bareLegs||bareTorso||bald)draw(bodyType==="female"?"base-female":"base-male",id);
 if(underwear)return true;
 if(!bareLegs)draw(choose("legs"),row);
 if(!bareTorso)draw(choose("torso"),row);
 if(!bareTorso)draw(choose("hands"),row);
 if(!bald)draw(choose("head"),row);
 if(appearance.hair!==false)draw(choose("hair"),row);
 if(appearance.headwear!==false)draw("headwear",id);
 return true;
}
root.KingdomCharacterSystem={PEOPLE,PARTS,FEMALE_PARTS,images,render,get ready(){return ready()},get failed(){return failed}};
})(window);
