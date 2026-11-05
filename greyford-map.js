// Greyford is authored on the same 32 px game grid as Brooklands.
(function(root){"use strict";
const castle=new Image();castle.src="assets/greyford-stone-pieces.png?v=1";
function draw(ctx,sim,player,vw,vh,size,character){
 const map=root.GreyfordWorld,W=map.WIDTH,H=map.HEIGHT;
 const camX=Math.max(0,Math.min(W*size-vw,player.x*size-vw/2)),camY=Math.max(0,Math.min(H*size-vh,player.y*size-vh/2));
 const x0=Math.max(0,Math.floor(camX/size)-3),x1=Math.min(W,Math.ceil((camX+vw)/size)+3),y0=Math.max(0,Math.floor(camY/size)-4),y1=Math.min(H,Math.ceil((camY+vh)/size)+4);
 ctx.fillStyle="#687e55";ctx.fillRect(0,0,vw,vh);ctx.save();ctx.translate(-Math.round(camX),-Math.round(camY));ctx.imageSmoothingEnabled=false;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const nearRiver=x<13,bridge=y>=33&&y<=37&&x<20;
  if(nearRiver&&!bridge){root.KingdomArt.water(ctx,x,y,size);continue}
  root.KingdomArt.terrain(ctx,x,y,size,map.roadAt(x+.5,y+.5)||bridge,(rx,ry)=>map.roadAt(rx+.5,ry+.5));
  if(x>=20&&x<76&&y>=14&&y<57&&!map.roadAt(x+.5,y+.5)&&(x*11+y*17)%31===0)root.KingdomArt.plant(ctx,"grass",x,y,size);
  if(x>=6&&x<15&&y>=38&&y<57&&(x+y)%5===0)root.KingdomArt.plant(ctx,"grass",x,y,size);
 }
 // Outer yards and buildings retain the existing Brooklands art scale.
 for(const b of map.buildings){
  const art=b.id==="market-inn"?"inn":b.id==="smithy"?"forge":b.id==="court"?"cottageLong":b.id==="warehouse"?"cottageLong":b.id==="jail"?"cottage":b.id==="guard-barracks"?"cottageLong":"cottageModest";
  root.KingdomArt.regionSite(ctx,art,b.x+b.w/2,b.y+b.h-1,size);
 }
 if(castle.complete&&castle.naturalWidth){
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(map.wallAt(x,y)){
   // Stone face and battlement are separate source-art slices; the top is walkable.
   ctx.fillStyle="#32333a66";ctx.fillRect(x*size+size*.12,y*size+size*.33,size,size);
   ctx.drawImage(castle,0,0,24,24,x*size,y*size,size+1,size+1);
   if(y===12||y===57)ctx.drawImage(castle,32,0,32,24,x*size,y*size-size*.72,size+1,size*.9);
  }
  for(const g of map.GATES){
   const gx=(g.x+.5)*size,gy=g.y*size;
   // Tall arched stone entrance, aligned with the passable road gap.
   ctx.drawImage(castle,0,32,96,88,gx-size*1.5,gy-size*1.8,size*3,size*2.75);
   if(!sim.gateOpen){ctx.fillStyle="#765037";ctx.fillRect(gx-size*.6,gy-size*.35,size*1.2,size*.85);ctx.fillStyle="#a67950";for(let i=0;i<4;i++)ctx.fillRect(gx-size*.54+i*size*.29,gy-size*.3,size*.055,size*.75)}
  }
 }
 // A navigable upper surface uses a different stone value from the wall face.
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(map.wallWalkAt(x,y)){
  ctx.fillStyle="#b5aa9a55";ctx.fillRect(x*size+size*.16,y*size+size*.08,size*.68,size*.25);
 }
 // Mark the two stair heads with source stone and a readable landing.
 for(const [sx,sy] of [[40,15],[69,54]]){
  if(castle.complete&&castle.naturalWidth)ctx.drawImage(castle,0,0,24,24,sx*size,sy*size,size,size);
  ctx.fillStyle="#d8c29a";ctx.fillRect(sx*size+size*.18,sy*size+size*.66,size*.64,size*.1);
 }
 // Market activity belongs along the road, not across it.
 if(root.KingdomInnSprites?.ready){
  for(const [name,x,y] of [["marketStallBlue",41,29],["marketStallGold",51,29],["yardCart",26,51],["yardLogs",63,51]])
   root.KingdomInnSprites.draw(ctx,name,x*size,y*size,2*size,2*size);
 }
 const list=sim.peopleOnMap();
 for(const a of list.filter(a=>a.level===0))drawPerson(ctx,a,size,player,character);
 character(ctx,player.x,player.y,size,player.facing,player.moving,player.walkMs,player.appearance);
 for(const b of map.buildings){const [bw,bh]=({"market-inn":[6.3,5.2],"smithy":[6.2,5],"court":[5.4,3.7],"warehouse":[5.4,3.7],"jail":[5.5,4.3],"guard-barracks":[5.4,3.7]})[b.id]||[4.9,3.8];const cx=b.x+b.w/2,base=b.y+b.h;if(Math.abs(player.x-cx)<bw/2+.2&&player.y<base&&player.y>base-bh-1){ctx.save();ctx.globalAlpha=.52;const art=b.id==="market-inn"?"inn":b.id==="smithy"?"forge":b.id==="court"||b.id==="warehouse"||b.id==="guard-barracks"?"cottageLong":b.id==="jail"?"cottage":"cottageModest";root.KingdomArt.regionSite(ctx,art,cx,base-1,size);ctx.restore()}}
 for(const a of list.filter(a=>a.level===1))drawPerson(ctx,a,size,player,character);
 if(player.level===1){
  ctx.fillStyle="#e8d09d";ctx.textAlign="center";ctx.font="bold 10px system-ui";ctx.fillText("WALL WALK",player.x*size,(player.y-1.2)*size);
 }
 const names=[["GREYFORD",48,27],["VEL BRIDGE",10,32],["MARCH COURT",61,26],["BRIDGE LANTERN",35,35]];
 ctx.textAlign="center";ctx.font="bold 10px system-ui";ctx.lineWidth=3;ctx.strokeStyle="#28362d";ctx.fillStyle="#f7e7bd";
 for(const [name,x,y] of names){ctx.strokeText(name,x*size,y*size);ctx.fillText(name,x*size,y*size)}
 ctx.restore();
 return [camX,camY];
}
function drawPerson(ctx,a,size,player,character){
 character(ctx,a.x,a.y,size,a.facing||"down",a.moving,a.walkMs,{bodyType:a.sex,sprite:a.sprite});
 if(Math.hypot(a.x-player.x,a.y-player.y)<7){
  ctx.textAlign="center";ctx.font="bold 10px system-ui";ctx.lineWidth=3;ctx.strokeStyle="#26372d";ctx.fillStyle="#f4e5c3";
  ctx.strokeText(a.name,a.x*size,(a.y-1.1)*size);ctx.fillText(a.name,a.x*size,(a.y-1.1)*size);
 }
}
root.GreyfordMap={draw,get ready(){return castle.complete&&!!castle.naturalWidth}};
})(window);
