// One pose index and ground anchor for every character part. Each sheet has
// thirteen rows: twelve named residents followed by the player.
(function(root){"use strict";
const PARTS=Object.freeze(["base-male","base-female","head","hair","beard","headwear","torso","legs"]);
const PEOPLE=Object.freeze([
 ["Aldric","smith"],["Marta","farmer"],["Oswin","merchant"],
 ["Edda","healer"],["Borin","miller"],["Nell","innkeeper"],
 ["Tessa","trader"],["Garrick","guard"],["Iris","baker"],
 ["Rowan","laborer"],["Bea","weaver"],["Edric","farmhand"],
 ["Player","traveler"]
].map(([name,role],row)=>Object.freeze({name,role,row})));
const images={};let failed=false;
for(const part of PARTS){
 const img=new Image();
 images[part]=img;
 img.onload=()=>{if(img.naturalWidth!==384||img.naturalHeight!==624)failed=true};
 img.onerror=()=>{failed=true};
 img.src="assets/character-"+part+"-v1.png?v=1";
}
function ready(){return !failed&&PARTS.every(part=>images[part].complete&&images[part].naturalWidth===384&&images[part].naturalHeight===624)}
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
 if(bareLegs||bareTorso||bald)draw(appearance.bodyType==="female"?"base-female":"base-male",id);
 if(underwear)return true;
 if(!bareLegs)draw("legs",id);
 if(!bareTorso)draw("torso",id);
 if(!bald)draw("head",id);
 if(appearance.beard!==false)draw("beard",id);
 if(appearance.hair!==false)draw("hair",id);
 if(appearance.headwear!==false)draw("headwear",id);
 return true;
}
root.KingdomCharacterSystem={PEOPLE,PARTS,images,render,get ready(){return ready()},get failed(){return failed}};
})(window);
