// LPC building and furniture sprite crops. Source credits are linked from character-art-credits.html.
(function(root){"use strict";
const {sheets,crops}=root.KingdomAssetRegistry;
const images={};for(const [id,url] of Object.entries(sheets)){const image=new Image();image.src=url;images[id]=image}
function draw(ctx,id,x,y,w,h){const crop=crops[id];if(!crop)return false;const [sheet,sx,sy,sw,sh]=crop,img=images[sheet];if(!img.complete||!img.naturalWidth)return false;ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);return true}
function drawHorse(ctx,facing,frame,x,y,w,h){const img=images.horse;if(!img.complete||!img.naturalWidth)return false;const row={up:4,left:5,down:6,right:7}[facing]??4;ctx.drawImage(img,(frame%4)*128,row*128,128,128,x,y,w,h);return true}
function drawGable(ctx,id,centerX,y,width,height){
 const crop=crops[id];if(!crop)return false;
 const [sheet,sx,sy,sw,sh]=crop,img=images[sheet];if(!img.complete||!img.naturalWidth)return false;
 const ridge=367,leftWidth=ridge-sx,rightWidth=sw-leftWidth;
 const center=Math.round(centerX),half=Math.round(width/2);
 ctx.drawImage(img,sx,sy,leftWidth,sh,center-half,y,half,height);
 ctx.drawImage(img,ridge,sy,rightWidth,sh,center,y,half,height);
 return true;
}
root.KingdomInnSprites={draw,drawHorse,drawGable,get ready(){return Object.values(images).every(img=>img.complete&&img.naturalWidth>0)}};
})(window);
