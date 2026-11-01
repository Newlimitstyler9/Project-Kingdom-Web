// Project Kingdom pixel renderer v1. Square-grid, three-quarter silhouettes.
// Sprites are deterministic, pixel-aligned, cached offscreen canvases.
(function(root){"use strict";
const P={grass:"#637f4b",grass2:"#779057",grass3:"#425d3d",dirt:"#796348",path:"#a48b62",dark:"#283a2d",wood:"#715037",woodLight:"#a27a52",roof:"#6d493b",roofHi:"#9a6a4c",leaf:"#2e573d",leaf2:"#47784a",leafHi:"#7e9754",rock:"#858b85",rockHi:"#c1c1ae",skin:"#c99876",shirt:"#607f92",shadow:"#22352688",black:"#171c1d"};
const cache=new Map();
function sprite(name,draw,w=32,h=48){const key=name;if(cache.has(key))return cache.get(key);const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");g.imageSmoothingEnabled=false;draw(g);cache.set(key,c);return c}
function r(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h)}
function terrain(g,x,y,size,road){const px=x*size,py=y*size,seed=(x*73856093^y*19349663)>>>0;
 g.fillStyle=road?P.path:P.grass;g.fillRect(px,py,size+1,size+1);
 for(let i=0;i<6;i++){const u=((seed+i*31)%29)/32,v=((seed>>>3+i*17)%29)/32;g.fillStyle=road?(i%2?"#b69c73":"#8b7557"):(i%2?P.grass2:P.grass3);g.fillRect(px+Math.floor(u*size),py+Math.floor(v*size),Math.max(2,size/12|0),Math.max(2,size/16|0))}
}
function plant(g,kind,x,y,size,seed=0){const baseX=Math.round((x+.5)*size),baseY=Math.round((y+1)*size),scale=size/32;
 const art=sprite(kind,ctx=>{
  if(kind==="forest"){r(ctx,13,26,7,17,P.wood);r(ctx,15,30,3,12,P.woodLight);for(const [cx,cy,w,h,c] of [[6,12,20,17,P.leaf],[10,5,15,16,P.leaf2],[4,18,26,10,P.leaf],[15,9,11,8,P.leafHi],[8,17,9,6,P.leaf2],[19,22,7,5,P.leafHi]])r(ctx,cx,cy,w,h,c)}
  if(kind==="brush"){
   // This is a loose stick-gathering pile, not a green shrub. Keep the
   // crossed brown branches close to the soil and shade their upper edges.
   for(let i=0;i<11;i++){
     const x=5+i*2,y=22+Math.floor(i*.8);
     r(ctx,x,y,3,3,P.wood);
     r(ctx,x,y,2,1,P.woodLight);
   }
   for(let i=0;i<10;i++){
     const x=7+i*2,y=32-Math.floor(i*.85);
     r(ctx,x,y,3,3,P.wood);
     r(ctx,x,y,2,1,P.woodLight);
   }
   r(ctx,11,22,3,6,P.woodLight);
   r(ctx,21,25,2,5,P.wood);
  }
  if(kind==="stones"){r(ctx,5,25,24,8,"#4b5655");r(ctx,9,20,16,10,P.rock);r(ctx,13,20,9,3,P.rockHi);r(ctx,5,28,6,3,P.rockHi)}
  if(kind==="grass"){r(ctx,12,26,3,7,P.grass3);r(ctx,16,22,3,11,P.grass2);r(ctx,20,27,3,6,P.grass3)}
 },32,48);
 // Sprite images are 48px tall but rocks/brush/grass occupy only the bottom
 // third of that canvas. Anchoring the full transparent image to the tile
 // left an enormous gap above its ground shadow. Anchor visible pixels instead.
 const visibleBottom={forest:43,brush:35,stones:33,grass:33}[kind]||48;
 const groundY=baseY-Math.round(2*scale);
 if(kind!=="grass"){
   g.fillStyle=P.shadow;g.beginPath();
   g.ellipse(baseX,groundY,size*(kind==="forest"?.20:.25),size*.08,0,0,Math.PI*2);g.fill();
 }
 const width=Math.round(32*scale),height=Math.round(48*scale);
 g.drawImage(art,Math.round(baseX-width/2),Math.round(groundY-visibleBottom*scale),width,height);
}
function crop(g,x,y,size,growth){for(let i=0;i<3;i++){const bx=(x+.18+i*.29)*size,by=(y+.83)*size,h=Math.max(4,growth/100*size*.6);r(g,bx,by-h,size*.07,h,growth>=90?"#c4a65a":"#4e783b");r(g,bx-size*.07,by-h*.65,size*.12,size*.07,"#81944c")}}
function building(g,b,size,open=false){const x=b.x*size,y=b.y*size,w=b.w*size,h=b.h*size;
 r(g,x,y,w,h,P.wood);r(g,x+size*.12,y+size*.12,w-size*.24,h-size*.24,"#a18461");
 for(let row=1;row<b.h;row++)r(g,x+4,y+row*size-2,w-8,3,"#876848");
 for(let col=0;col<b.w;col++){r(g,x+col*size,y,3,h,"#684b37")}
 r(g,b.doorX*size+size*.12,b.doorY*size+size*.05,size*.76,size*.94,"#3e3229");
 r(g,b.doorX*size+size*.7,b.doorY*size+size*.5,4,4,"#e2bf82");
 if(open){r(g,x+size*1.2,y+size*1.3,size*.8,size*.6,"#59402d");r(g,x+size*3,y+size*1.2,size*.7,size*.7,"#665744");return}
 // Roof drawn separately after exterior characters, preventing roof bleed-through.
}
function roof(g,b,size){const x=b.x*size,y=b.y*size,w=b.w*size,h=(b.h-1)*size;
 r(g,x+size*.13,y+size*.17,w-size*.26,h-size*.1,P.roof);
 for(let i=0;i<Math.ceil(h/size);i++)r(g,x+size*.2,y+size*.25+i*size,w-size*.4,3,P.roofHi);
 r(g,x+size*.13,y+size*.17,w-size*.26,5,"#b1845d");
}
function shelter(g,x,y,size,progress,complete){const px=x*size,py=y*size;if(!complete){r(g,px+size*.15,py+size*.25,size*.7,size*.65,"#72523b");for(let i=0;i<Math.min(progress,4);i++)r(g,px+size*(.18+i*.17),py+size*.2,size*.08,size*.7,P.woodLight);return}
 r(g,px+size*.08,py+size*.25,size*.84,size*.7,P.wood);
 r(g,px+size*.14,py+size*.31,size*.72,size*.5,P.woodLight);
 r(g,px+size*.36,py+size*.56,size*.28,size*.39,"#342e28");
 r(g,px+size*.03,py+size*.1,size*.94,size*.22,P.roof);
 r(g,px+size*.1,py+size*.1,size*.8,size*.07,P.roofHi);
}
function person(g,x,y,size,color,dir,walk,tool){const art=sprite("person:"+color+":"+dir+":"+walk+":"+(tool||""),ctx=>{
 const shift=walk?2:0;r(ctx,10,35,5,8-shift,"#353733");r(ctx,19,35,5,8+shift,"#353733");r(ctx,8,20,18,18,color);r(ctx,10,16,14,7,"#493b32");r(ctx,10,8,14,13,P.skin);r(ctx,10,7,14,5,"#483b2f");r(ctx,7,22,4,12,P.skin);r(ctx,23,22,4,12,P.skin);
 if(dir==="left")r(ctx,9,15,2,2,P.black);else if(dir==="right")r(ctx,23,15,2,2,P.black);else if(dir==="down"){r(ctx,13,15,2,2,P.black);r(ctx,19,15,2,2,P.black)}
 if(tool){r(ctx,26,21,3,17,P.woodLight);r(ctx,23,19,9,5,P.rock)}
 },34,48);
 const scale=size/32,w=34*scale,h=48*scale,px=x*size,py=y*size;
 g.fillStyle=P.shadow;g.beginPath();g.ellipse(px,py+size*.12,size*.21,size*.08,0,0,Math.PI*2);g.fill();
 // All NPC feet rest on the same contact point as their floor shadow.
 g.drawImage(art,Math.round(px-w/2),Math.round(py+size*.12-44*scale),Math.round(w),Math.round(h));
}
function resource(g,name,x,y,size){const px=x*size,py=y*size;g.fillStyle=P.shadow;g.beginPath();g.ellipse(px,py+size*.13,size*.2,size*.07,0,0,Math.PI*2);g.fill();if(name==="charcoal"){r(g,px-10,py-6,20,12,P.black);r(g,px-7,py-10,10,7,"#34393b");r(g,px+3,py-4,5,3,"#596062")}else if(name==="wood"){r(g,px-13,py-5,26,9,P.wood);r(g,px-10,py-3,7,5,P.woodLight)}else if(name==="stone"){r(g,px-10,py-8,20,13,P.rock);r(g,px-7,py-8,9,3,P.rockHi)}}
root.KingdomArt={terrain,plant,crop,building,roof,shelter,person,resource,palette:P};
})(window);
