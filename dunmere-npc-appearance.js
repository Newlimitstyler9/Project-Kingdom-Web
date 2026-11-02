// Twelve resident rows with distinct resident silhouettes, clothing, and repaired poses.
(function(root){"use strict";
const image=new Image();
let ready=false;
let failed=false;
image.onload=()=>{ready=image.naturalWidth===384&&image.naturalHeight===576;failed=!ready};
image.onerror=()=>{failed=true};
image.src="assets/dunmere-npcs-v5.png?v=5";
if(image.complete&&image.naturalWidth===384&&image.naturalHeight===576)ready=true;
function render(ctx,id,x,y,size,direction,moving,walkTimeMs){
 if(!ready||!Number.isInteger(id)||id<0||id>=12)return false;
 const pose=KingdomPlayerFrames.select(direction,moving,walkTimeMs+id*47);
 const scale=size/32,px=Math.round(x*size),py=Math.round(y*size);
 const shadowY=Math.round(py+size*.12);
 ctx.fillStyle="#23352c88";
 ctx.beginPath();ctx.ellipse(px,shadowY,size*.22,size*.07,0,0,Math.PI*2);ctx.fill();
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(image,pose.frame*32,id*48,32,48,
  Math.round(px-size/2),Math.round(shadowY-45*scale),Math.round(size),Math.round(48*scale));
 return true;
}
root.KingdomNpcAppearance={render,get ready(){return ready},get failed(){return failed},image};
})(window);
