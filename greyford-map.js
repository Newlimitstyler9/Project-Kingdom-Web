// Greyford is authored on the same 32 px game grid as Brooklands.
(function(root){"use strict";
const castle=new Image();castle.src="assets/greyford-stone-pieces.png?v=2";
const fittedGate=new Image();fittedGate.src="assets/greyford-fitted-gate.png?v=1";
const sheet=new Image();sheet.src="assets/kenney-roguelike-sheet.png";
const paddockFence=new Image();paddockFence.src="assets/greyford-paddock-fence.png?v=1";
const kit=new Image();kit.src="assets/greyford-modular-building-kit.png?v=1";
const visuals=root.GreyfordBuildingVisuals;
const {walls:wallTiles,roofs:roofTiles,windows,doors}=root.KingdomAssetRegistry.buildingTiles;
function tile(ctx,col,row,x,y,size){if(sheet.complete&&sheet.naturalWidth)ctx.drawImage(sheet,col*17,row*17,16,16,Math.round(x*size),Math.round(y*size),size+1,size+1)}
function kitTile(ctx,col,row,x,y,size){if(kit.complete&&kit.naturalWidth)ctx.drawImage(kit,col*16,row*16,16,16,Math.round(x*size),Math.round(y*size),size+1,size+1)}
function fence(ctx,sprite,x,y,size){if(paddockFence.complete&&paddockFence.naturalWidth)ctx.drawImage(paddockFence,sprite*16,0,16,16,Math.round(x*size),Math.round(y*size),size+1,size+1)}
function drawPaddockFence(ctx,map,size,front=false){const p=map.PADDOCK;if(front){for(let x=p.x+1;x<p.x+p.w-1;x++)fence(ctx,0,x,p.y+p.h-1,size);fence(ctx,5,p.x,p.y+p.h-1,size);fence(ctx,6,p.x+p.w-1,p.y+p.h-1,size);return}for(let y=p.y+1;y<p.y+p.h-1;y++){if(y!==p.gateY)fence(ctx,1,p.x,y,size);fence(ctx,2,p.x+p.w-1,y,size)}for(let x=p.x+1;x<p.x+p.w-1;x++)fence(ctx,0,x,p.y,size);fence(ctx,3,p.x,p.y,size);fence(ctx,4,p.x+p.w-1,p.y,size)}
function drawBuilding(ctx,b,size,alpha=1){
 if(!sheet.complete||!sheet.naturalWidth)return;
 const [wallKind,roofKind]=visuals.byType[b.type]||visuals.byBuilding[b.id]||['plaster','brown'],wall=wallTiles[wallKind],roof=roofTiles[roofKind],customWall=visuals.wallGroups[wallKind],customRoof=visuals.roofRows[roofKind],windowKind=visuals.wallWindows[wallKind]||wallKind,door=Math.floor(b.w/2);
 ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;
 for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){const pos=x===0?0:x===b.w-1?2:1;if(customWall!==undefined)kitTile(ctx,customWall*3+pos,3,b.x+x,b.y+y,size);else tile(ctx,wall[pos],15,b.x+x,b.y+y,size)}
 for(let x=0;x<b.w;x++){
  const pos=x===0?0:x===b.w-1?2:1;
  for(let y=0;y<3;y++){if(customRoof!==undefined)kitTile(ctx,y*3+pos,customRoof,b.x+x,b.y-1+y,size);else{const [col,row]=roof[y*3+pos];tile(ctx,col,row,b.x+x,b.y-1+y,size)}}
  if(x>0&&x<b.w-1&&x!==door&&(x===1||x===b.w-2||b.w>=8&&x===door-2)&&!['warehouse','granary','jail'].includes(b.type)){
   tile(ctx,...windows[windowKind],b.x+x,b.y+b.h-2,size);
   if(b.h>=6)tile(ctx,...windows[windowKind],b.x+x,b.y+2,size);
  }
  if(x!==door){if(customWall!==undefined)kitTile(ctx,customWall*3+1,4,b.x+x,b.y+b.h-1,size);else tile(ctx,wall[1],16,b.x+x,b.y+b.h-1,size)}
 }
 tile(ctx,...(b.type==='court'||b.type==='chapel'?doors.stone:doors.wood),b.x+door,b.y+b.h-1,size);
 ctx.restore();
}
function coverBehindBuilding(ctx,entity,size){for(const b of root.GreyfordWorld.buildings){if(entity.x<b.x-.5||entity.x>b.x+b.w+.5||entity.y<b.y-1.2||entity.y>=b.y+b.h-.1)continue;ctx.save();ctx.beginPath();ctx.rect((entity.x-1.05)*size,(entity.y-2.4)*size,2.1*size,2.55*size);ctx.clip();drawBuilding(ctx,b,size);ctx.restore()}}
function draw(ctx,sim,player,vw,vh,size,character,options={}){
 const map=root.GreyfordWorld,W=map.WIDTH,H=map.HEIGHT;
 const ox=options.originX||0,oy=options.originY||0;
 const camX=options.cameraX??Math.max(0,Math.min(W*size-vw,player.x*size-vw/2)),camY=options.cameraY??Math.max(0,Math.min(H*size-vh,player.y*size-vh/2));
 const localX=camX/size-ox,localY=camY/size-oy;
 const x0=Math.max(0,Math.floor(localX)-3),x1=Math.min(W,Math.ceil(localX+vw/size)+3),y0=Math.max(0,Math.floor(localY)-4),y1=Math.min(H,Math.ceil(localY+vh/size)+4);
 const wallAlpha=(x,y)=>{if(player.level!==0||player.y>=y+1.2)return 1;const distance=Math.hypot(player.x-(x+.5),player.y-(y+.5));return 1-.65*Math.max(0,1-distance/4)};
 if(!options.embedded){ctx.fillStyle="#687e55";ctx.fillRect(0,0,vw,vh)}ctx.save();ctx.translate(options.embedded?Math.round(ox*size):Math.round(ox*size-camX),options.embedded?Math.round(oy*size):Math.round(oy*size-camY));ctx.beginPath();ctx.rect(0,0,W*size,H*size);ctx.clip();ctx.imageSmoothingEnabled=false;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const nearRiver=x<13,bridge=y>=33&&y<=37&&x<20;
  if(nearRiver&&!bridge){root.KingdomArt.water(ctx,x,y,size);continue}
  if(nearRiver&&bridge){ctx.fillStyle='#49372d';ctx.fillRect(x*size,y*size,size+1,size+1);ctx.fillStyle=(y%2?'#866747':'#997653');ctx.fillRect(x*size,y*size+size*.08,size+1,size*.78);ctx.fillStyle='#c1a176';ctx.fillRect(x*size,y*size+size*.12,size+1,size*.08);ctx.fillStyle='#584638';ctx.fillRect(x*size,y*size+size*.82,size+1,size*.08);continue}
  root.KingdomArt.terrain(ctx,x,y,size,map.roadAt(x+.5,y+.5)||bridge,(rx,ry)=>map.roadAt(rx+.5,ry+.5));
  if(x>=20&&x<76&&y>=14&&y<57&&!map.roadAt(x+.5,y+.5)&&(x*11+y*17)%31===0)root.KingdomArt.plant(ctx,"grass",x,y,size);
  if(x>=6&&x<15&&y>=38&&y<57&&(x+y)%5===0)root.KingdomArt.plant(ctx,"grass",x,y,size);
 }
 for(const b of map.buildings)drawBuilding(ctx,b,size);
 drawPaddockFence(ctx,map,size);
 if(castle.complete&&castle.naturalWidth){
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(map.wallAt(x,y)){
   ctx.save();ctx.globalAlpha=wallAlpha(x,y);
   // Stone face and battlement are separate source-art slices; the top is walkable.
   ctx.fillStyle="#32333a66";ctx.fillRect(x*size+size*.12,y*size+size*.33,size,size);
   ctx.drawImage(castle,0,0,24,24,x*size,y*size,size+1,size+1);
   if(y===12||y===57)ctx.drawImage(castle,32,0,32,24,x*size,y*size-size*.72,size+1,size*.9);
   ctx.restore();
  }
  for(const g of map.GATES){
   if(g.axis==='vertical'){
    // From above, an east/west passage is a break in the stone wall, not a door face.
    const sx=g.id==='bridge'?18:75,sy=g.y-1;
    ctx.save();ctx.fillStyle='#282b30';ctx.globalAlpha=.26;
    ctx.fillRect(sx*size,sy*size,size*.09,size*2);
    ctx.fillRect((sx+1.91)*size,sy*size,size*.09,size*2);
    ctx.restore();
    continue;
   }
   const gx=(g.x+.5)*size,gy=g.y*size;
   ctx.save();ctx.globalAlpha=wallAlpha(g.x,g.y);
   // Pixel-edited timber leaves use the stone arch's exact transparent mask.
   if(!sim.gateOpen&&!sim.gatePassageAt(g.id)&&fittedGate.complete&&fittedGate.naturalWidth)
    ctx.drawImage(fittedGate,gx-size*1.5,gy-size,size*3,size*2);
   ctx.drawImage(castle,0,32,96,64,gx-size*1.5,gy-size,size*3,size*2);
   ctx.restore();
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
 for(const h of options.horses||[]){const scale=h.scale||1;root.KingdomInnSprites.drawHorse(ctx,h.facing,Math.floor(h.walkMs/170)%4,(h.x-1.6*scale)*size,(h.y-3.2*scale+.8)*size,3.2*scale*size,3.2*scale*size,h.coat)}
 const list=sim.peopleOnMap();
 for(const a of list.filter(a=>a.level===0)){drawPerson(ctx,a,size,player,character);coverBehindBuilding(ctx,a,size)}
 if(options.drawPlayer!==false){character(ctx,player.x,player.y,size,player.facing,player.moving,player.walkMs,player.appearance);coverBehindBuilding(ctx,player,size)}
 drawPaddockFence(ctx,map,size,true);
 // When the player is behind a wall, its raised stone lip must cover the sprite.
 if(options.drawPlayer!==false&&player.level===0&&castle.complete&&castle.naturalWidth){
  const wallRow=player.y<14&&player.y>=9?12:player.y<59&&player.y>=54?57:-1;
  if(wallRow>=0)for(let x=Math.max(18,Math.floor(player.x)-2);x<=Math.min(76,Math.floor(player.x)+2);x++){
   if(!map.wallAt(x,wallRow))continue;
   ctx.save();ctx.globalAlpha=wallAlpha(x,wallRow);
   ctx.drawImage(castle,0,0,24,24,x*size,wallRow*size,size+1,size+1);
   ctx.drawImage(castle,32,0,32,24,x*size,wallRow*size-size*.72,size+1,size*.9);ctx.restore();
  }
 }
 for(const a of list.filter(a=>a.level===1))drawPerson(ctx,a,size,player,character);
 if(player.level===1){
  ctx.fillStyle="#e8d09d";ctx.textAlign="center";ctx.font="bold 10px system-ui";ctx.fillText("WALL WALK",player.x*size,(player.y-1.2)*size);
 }
 const names=[["GREYFORD",48,27],["VEL BRIDGE",10,32],["MARCH COURT",61,26],["BRIDGE LANTERN",35,35]];
 ctx.textAlign="center";ctx.font="bold 10px system-ui";ctx.lineWidth=3;ctx.strokeStyle="#28362d";ctx.fillStyle="#f7e7bd";
 for(const [name,x,y] of names)root.KingdomArt.outlinedText(ctx,name,x*size,y*size);
 ctx.restore();
 return [camX,camY];
}
function drawPerson(ctx,a,size,player,character){
 character(ctx,a.x,a.y,size,a.facing||"down",a.moving,a.walkMs,{bodyType:a.sex,sprite:a.sprite});
 if(Math.hypot(a.x-player.x,a.y-player.y)<7){
  ctx.textAlign="center";ctx.font="bold 10px system-ui";ctx.lineWidth=3;ctx.strokeStyle="#26372d";ctx.fillStyle="#f4e5c3";
  root.KingdomArt.outlinedText(ctx,a.name,a.x*size,(a.y-1.1)*size);
 }
}
root.GreyfordMap={draw,get ready(){return castle.complete&&!!castle.naturalWidth&&fittedGate.complete&&!!fittedGate.naturalWidth&&sheet.complete&&!!sheet.naturalWidth&&paddockFence.complete&&!!paddockFence.naturalWidth&&kit.complete&&!!kit.naturalWidth}};
})(window);
