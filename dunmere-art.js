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
  if(kind==="forest"){r(ctx,17,31,7,19,P.wood);r(ctx,19,34,3,15,P.woodLight);for(const [cx,cy,w,h,c] of [[6,16,29,20,P.leaf],[10,8,22,19,P.leaf2],[4,24,32,12,P.leaf],[14,11,15,9,P.leafHi],[8,24,12,8,P.leaf2],[24,28,8,6,P.leafHi]])r(ctx,cx,cy,w,h,c)}
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
 },kind==="forest"?40:32,kind==="forest"?56:48);
 // Sprite images are 48px tall but rocks/brush/grass occupy only the bottom
 // third of that canvas. Anchoring the full transparent image to the tile
 // left an enormous gap above its ground shadow. Anchor visible pixels instead.
 const visibleBottom={forest:50,brush:35,stones:33,grass:33}[kind]||48;
 const groundY=baseY-Math.round(2*scale);
 if(kind!=="grass"){
   g.fillStyle=P.shadow;g.beginPath();
   g.ellipse(baseX,groundY,size*(kind==="forest"?.20:.25),size*.08,0,0,Math.PI*2);g.fill();
 }
 const width=Math.round((kind==="forest"?40:32)*scale),height=Math.round((kind==="forest"?56:48)*scale);
 g.drawImage(art,Math.round(baseX-width/2),Math.round(groundY-visibleBottom*scale),width,height);
}
function crop(g,x,y,size,growth){for(let i=0;i<3;i++){const bx=(x+.18+i*.29)*size,by=(y+.83)*size,h=Math.max(4,growth/100*size*.6);r(g,bx,by-h,size*.07,h,growth>=90?"#c4a65a":"#4e783b");r(g,bx-size*.07,by-h*.65,size*.12,size*.07,"#81944c")}}
function building(g,b,size,open=false){const x=b.x*size,y=b.y*size,w=b.w*size,h=b.h*size;
 if(b.kind==='tavern'&&root.KingdomInnSprites?.ready){const sprites=root.KingdomInnSprites;
  for(let i=0;i<2;i++)sprites.draw(g,'innTimber',x+i*w/2,y+size*1.24,w/2,size*2.76);
  r(g,x,y+size*2.54,w,size*.1,'#503323');
  for(const px of [.62,3.8])sprites.draw(g,'innWindow',x+size*px,y+size*2.07,size*.6,size*.58);
  sprites.draw(g,'innDoor',b.doorX*size+size*.12,b.doorY*size-size*.16,size*.76,size*1.16);
  return;
 }
 const stone=['mill','smithy','guard'].includes(b.kind),wall=stone?'#9b9888':'#b4976d',beam=stone?'#626b68':'#76543a';
 r(g,x,y,w,h,beam);r(g,x+size*.12,y+size*.12,w-size*.24,h-size*.24,wall);
 for(let row=1;row<b.h;row++)r(g,x+4,y+row*size-2,w-8,3,"#876848");
 for(let col=0;col<b.w;col++){r(g,x+col*size,y,3,h,beam)}
 for(const side of [1,3]){r(g,x+side*size+size*.24,y+size*2.25,size*.47,size*.36,'#493b2d');r(g,x+side*size+size*.29,y+size*2.3,size*.37,size*.24,'#d0b779')}
 r(g,b.doorX*size+size*.12,b.doorY*size+size*.05,size*.76,size*.94,"#3e3229");
 r(g,b.doorX*size+size*.7,b.doorY*size+size*.5,4,4,"#e2bf82");
 if(b.kind==='smithy'){r(g,x+size*.45,y+size*2.72,size*.8,size*.23,'#353b39');r(g,x+size*.66,y+size*2.61,size*.39,size*.18,'#6a7271')}
 if(b.kind==='bakery'){r(g,x+size*3.5,y+size*2.78,size*.35,size*.2,'#a46a3e');r(g,x+size*3.95,y+size*2.78,size*.35,size*.2,'#a46a3e')}
 if(open){r(g,x+size*1.2,y+size*1.3,size*.8,size*.6,"#59402d");r(g,x+size*3,y+size*1.2,size*.7,size*.7,"#665744");return}
 // Roof drawn separately after exterior characters, preventing roof bleed-through.
}
function roof(g,b,size){const x=b.x*size,y=b.y*size,w=b.w*size,h=(b.h-1)*size;
 const spriteInn=b.kind==='tavern'&&root.KingdomInnSprites?.ready;
 if(!spriteInn){
 const dark=['mill','smithy','guard'].includes(b.kind),roof=dark?'#535b5b':b.kind==='tavern'?'#75493c':'#806546',ridge=dark?'#89908b':'#b59a69';
 const left=x+size*.08,top=y+size*.12,width=w-size*.16,height=h-size*.05,mid=top+height*.48;
 r(g,left,top,width,height,roof);
 r(g,left+size*.14,top+size*.1,width-size*.28,height*.37,dark?'#69716f':b.kind==='tavern'?'#8a5a47':'#9b7c50');
 r(g,left+size*.14,mid+size*.04,width-size*.28,height*.4,dark?'#434d50':b.kind==='tavern'?'#624036':'#725a3d');
 r(g,left,mid-2,width,5,ridge);
 for(let i=0;i<10;i++){
  const xx=left+size*.25+(i*37)%(width-size*.5),yy=top+size*.28+(i*23)%(height-size*.55);
  r(g,xx,yy,size*.28,2,dark?'#78817d':'#b69a68');
 }
 r(g,left,top,width,5,ridge);r(g,left,top+height-5,width,5,dark?'#374145':'#56432f');
 if(['smithy','bakery','tavern'].includes(b.kind)){r(g,x+size*3.7,y-size*.14,size*.33,size*.55,'#776a5c');r(g,x+size*3.6,y-size*.2,size*.53,size*.12,'#4c4843')}
 }
 if(b.kind==='tavern'){
  const sprites=root.KingdomInnSprites;
  if(sprites?.ready)sprites.draw(g,'innGableRoof',x-size*.18,y-size*.33,w+size*.36,size*2.48);
  sprites?.draw(g,'innChimney',x+size*3.45,y-size*.22,size*.33,size*.7);
  // An actual hanging inn sign replaces the painted rectangle on the facade.
  sprites?.draw(g,'innSign',x+size*.23,y+size*2.57,size*.95,size*.83);
  for(const tx of [2.05,3.08]){const px=x+size*tx,py=y+size*3.22;if(!sprites?.draw(g,'sconce',px-size*.18,py-size*.43,size*.36,size*.43)){r(g,px-7,py+1,14,4,'#4d3c2e');r(g,px-2,py-14,4,7,'#e2a455')}}
  return;
 }
 g.textAlign='center';g.font='bold 10px system-ui';g.lineWidth=3;g.strokeStyle='#263027';g.fillStyle='#f3dfaf';
 const label=b.kind==='home'?b.name:b.name.replace("Dunmere ",'');
 g.strokeText(label,x+w/2,y+size*3.45);g.fillText(label,x+w/2,y+size*3.45);
}
function innYard(g,props,size){const sprites=root.KingdomInnSprites;if(!sprites?.ready)return;for(const prop of props)sprites.draw(g,prop.sprite,prop.x*size,prop.y*size,prop.w*size,prop.h*size)}
function villageSite(g,p,size,road){
 const x=p.x*size,y=p.y*size;
 if(p.kind==='farm'){
  for(let yy=16;yy<=22;yy++)for(let xx=3;xx<=10;xx++){
   if(road(xx,yy))continue;
   r(g,xx*size+3,yy*size+size*.16,size-6,size*.66,'#66543b');
   for(let k=0;k<3;k++)r(g,xx*size+7,yy*size+size*(.25+k*.17),size-14,2,'#9e8558');
  }
  g.fillStyle='#e9d49e';g.font='bold 11px system-ui';g.fillText('WESTFIELD',x-size*2,y-size*2.8);
 }else if(p.kind==='market'){
  for(const [dx,awning] of [[-2.3,'#9f654e'],[2.3,'#bd9a5d']]){
   const bx=x+dx*size,by=y-size*.6;
   r(g,bx-size*.65,by,size*1.3,size*.55,'#72513a');
   r(g,bx-size*.76,by-size*.23,size*1.52,size*.23,awning);
   for(const side of [-.55,.5])r(g,bx+side*size,by-size*.16,size*.06,size*.79,'#664b36');
  }
 }else if(p.kind==='public'){
  // A well and two benches make the green a visible shared place to rest.
  const wx=20*size,wy=24*size;
  r(g,wx+size*.1,wy+size*.12,size*.8,size*.63,'#696c61');
  r(g,wx+size*.19,wy+size*.2,size*.62,size*.3,'#263f48');
  r(g,wx+size*.07,wy+size*.1,size*.86,size*.11,'#aaa794');
  for(const bx of [17,22]){r(g,bx*size,24*size+size*.6,size*.85,size*.13,'#8e704d');r(g,bx*size+size*.1,24*size+size*.73,size*.1,size*.13,'#564536');r(g,bx*size+size*.64,24*size+size*.73,size*.1,size*.13,'#564536')}
 }else if(p.kind==='smithy'){
  r(g,x+size*3,y+size*.8,size*.65,size*.35,'#424745');
  r(g,x+size*3.13,y+size*.64,size*.38,size*.22,'#a4aaa2');
  r(g,x+size*3.04,y+size*1.5,size*.56,size*.48,'#514036');
  r(g,x+size*3.16,y+size*1.4,size*.32,size*.2,'#cd6f39');
 }else if(p.kind==='mill'){
  const bx=(p.x-2.8)*size,by=(p.y-.1)*size;
  g.strokeStyle='#5b4934';g.lineWidth=5;g.beginPath();g.arc(bx,by,size*.58,0,Math.PI*2);g.stroke();
  r(g,bx-size*.5,by-2,size,4,'#79634a');r(g,bx-2,by-size*.5,4,size,'#79634a');
 }else if(p.kind==='healer'){
  for(let i=0;i<2;i++){r(g,(p.x+2.8)*size,y+size*(.4+i*.8),size*.73,size*.38,'#66543e');r(g,(p.x+2.8)*size+size*.23,y+size*(.28+i*.8),size*.25,size*.25,'#66864c')}
 }else if(p.kind==='weaver'){
  r(g,x+size*3,y+size*.8,size*.7,size*.3,'#644e3a');
  r(g,x+size*3.1,y+size*.67,size*.5,size*.18,'#947da1');
 }else if(p.kind==='guard'){
  r(g,x+size*2.8,y+size*.4,size*.13,size*.95,'#604735');
  r(g,x+size*2.93,y+size*.4,size*.47,size*.57,'#6b7792');
 }else if(p.kind==='bakery'){
  r(g,x+size*3,y+size*.8,size*.7,size*.3,'#6e5036');
  for(let i=0;i<3;i++)r(g,x+size*(3.05+i*.18),y+size*.73,size*.14,size*.12,'#d5b37a');
 }else if(p.kind==='tavern'){
  for(const dx of [-2.9,3]){r(g,x+dx*size,y+size*.9,size*.6,size*.17,'#76583e');r(g,x+(dx+.1)*size,y+size*1.07,size*.08,size*.19,'#5a4636')}
 }else if(p.kind==='home'){
  // Small household gardens echo the toft-and-croft plots behind the lane.
  for(let i=0;i<2;i++){r(g,(p.x+3)*size,y+size*(.4+i*.7),size*.68,size*.2,'#66513b');r(g,(p.x+3)*size+size*.18,y+size*(.29+i*.7),size*.17,size*.2,'#73864f')}
 }
}
function water(g,x,y,size){const px=x*size,py=y*size;r(g,px,py,size+1,size+1,'#4b7178');
 for(let i=0;i<3;i++){const rx=(x*11+y*7+i*13)%25;r(g,px+rx,py+size*(.2+i*.25),size*.27,2,'#8cb1aa')}
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
root.KingdomArt={terrain,plant,crop,building,roof,innYard,villageSite,water,shelter,person,resource,palette:P};
})(window);
