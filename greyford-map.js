// Greyford is authored on the same 32 px game grid as Brooklands.
(function(root){"use strict";
const castle=new Image();castle.src="assets/greyford-stone-pieces.png?v=2";
const sheet=new Image();sheet.src="assets/kenney-roguelike-sheet.png";
const styles={court:['stone','slate'],warehouse:['timber','brown'],smithy:['stone','slate'],jail:['stone','slate'],bakery:['plaster','light'],chapel:['stone','slate'],stable:['timber','brown'],weaver:['timber','light'],apothecary:['plaster','light'],granary:['timber','brown'],carpenter:['timber','brown'],tollhouse:['stone','slate']};
const homeStyles={'vell-house':['stone','slate'],'pell-house':['timber','brown'],'reed-house':['plaster','light'],'forge-house':['timber','brown'],'clerk-house':['plaster','light'],'guard-barracks':['stone','slate'],'market-inn':['timber','brown'],'south-croft':['plaster','brown'],'tanner-house':['timber','brown'],'mason-house':['stone','slate'],'fen-house':['plaster','light'],'dyer-house':['timber','light'],'bridge-row-a':['plaster','brown'],'bridge-row-b':['timber','brown'],'east-row-a':['plaster','light'],'east-row-b':['timber','brown'],'south-croft-two':['plaster','brown'],'south-croft-three':['plaster','light']};
const wallTiles={plaster:[17,18,19],stone:[27,28,29],timber:[34,35,40]};
const roofTiles={brown:[[20,21],[25,21],[21,21],[20,22],[25,22],[21,22],[20,23],[22,22],[21,23]],slate:[[27,21],[32,21],[28,21],[27,22],[32,22],[28,22],[27,23],[29,22],[28,23]],light:[[34,21],[39,21],[35,21],[34,22],[39,22],[35,22],[34,23],[36,22],[35,23]]};
function tile(ctx,col,row,x,y,size){if(sheet.complete&&sheet.naturalWidth)ctx.drawImage(sheet,col*17,row*17,16,16,Math.round(x*size),Math.round(y*size),size+1,size+1)}
function drawBuilding(ctx,b,size,alpha=1){
 if(!sheet.complete||!sheet.naturalWidth)return;
 const [wallKind,roofKind]=styles[b.type]||homeStyles[b.id]||['plaster','brown'],wall=wallTiles[wallKind],roof=roofTiles[roofKind],door=Math.floor(b.w/2);
 ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;
 for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++)tile(ctx,wall[x===0?0:x===b.w-1?2:1],15,b.x+x,b.y+y,size);
 for(let x=0;x<b.w;x++){
  const pos=x===0?0:x===b.w-1?2:1;
  for(let y=0;y<3;y++){const [col,row]=roof[y*3+pos];tile(ctx,col,row,b.x+x,b.y-1+y,size)}
  if(x>0&&x<b.w-1&&x!==door&&(x===1||x===b.w-2||b.w>=8&&x===door-2)&&!['warehouse','stable','granary','jail'].includes(b.type)){
   tile(ctx,wallKind==='stone'?40:46,wallKind==='stone'?4:5,b.x+x,b.y+b.h-2,size);
   if(b.h>=6)tile(ctx,wallKind==='stone'?40:46,wallKind==='stone'?4:5,b.x+x,b.y+2,size);
  }
  if(x!==door)tile(ctx,wall[1],16,b.x+x,b.y+b.h-1,size);
 }
 tile(ctx,b.type==='court'||b.type==='chapel'?40:33,b.type==='court'||b.type==='chapel'?7:1,b.x+door,b.y+b.h-1,size);
 ctx.restore();
}
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
 for(const b of map.buildings)drawBuilding(ctx,b,size);
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
   if(!sim.gateOpen&&!sim.gatePassageAt(g.id)){ctx.fillStyle="#765037";ctx.fillRect(gx-size*.6,gy-size*.35,size*1.2,size*.85);ctx.fillStyle="#a67950";for(let i=0;i<4;i++)ctx.fillRect(gx-size*.54+i*size*.29,gy-size*.3,size*.055,size*.75)}
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
  for(const prop of map.decor)root.KingdomInnSprites.draw(ctx,prop.sprite,prop.x*size,prop.y*size,prop.w*size,prop.h*size);
 }
 const list=sim.peopleOnMap();
 for(const a of list.filter(a=>a.level===0))drawPerson(ctx,a,size,player,character);
 character(ctx,player.x,player.y,size,player.facing,player.moving,player.walkMs,player.appearance);
 for(const b of map.buildings)if(player.x>=b.x-.2&&player.x<b.x+b.w+.2&&player.y>=b.y-1&&player.y<b.y+b.h)drawBuilding(ctx,b,size,.52);
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
root.GreyfordMap={draw,get ready(){return castle.complete&&!!castle.naturalWidth&&sheet.complete&&!!sheet.naturalWidth}};
})(window);
