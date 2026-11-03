// Authored village plan shared by rendering, navigation, and resident staging.
(function(root){"use strict";
const WIDTH=40,HEIGHT=32;
function create(places,residents=[]){
 const byId=Object.fromEntries(places.map(p=>[p.id,p]));
 const solid=Array.from({length:HEIGHT},()=>Array(WIDTH).fill(false));
 const buildings=[];
 for(const place of places){
  if(['public','market','farm'].includes(place.kind))continue;
  const x=place.x-2,y=place.y-2,w=5,h=4,doorX=x+2,doorY=y+h-1;
  const b={id:place.id,name:place.name,kind:place.kind,x,y,w,h,doorX,doorY};
  buildings.push(b);
  for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){
   if(xx>=0&&yy>=0&&xx<WIDTH&&yy<HEIGHT)
    solid[yy][xx]=(xx===x||xx===x+w-1||yy===y||yy===y+h-1)&&!(xx===doorX&&yy===doorY);
  }
 }
 const inn=buildings.find(b=>b.id==='inn');
 const innYard=inn?[
  {sprite:'yardTrough',x:inn.x+inn.w+.15,y:inn.y+.78,w:1.52,h:.76,blocked:[[inn.x+inn.w,inn.y+1]]},
  {sprite:'yardCart',x:inn.x+inn.w+.08,y:inn.y+2.25,w:1.82,h:1.42,blocked:[[inn.x+inn.w,inn.y+3],[inn.x+inn.w+1,inn.y+3]]},
  {sprite:'yardLogs',x:inn.x-1.53,y:inn.y+2.42,w:1.08,h:1.16,blocked:[[inn.x-2,inn.y+3]]}
 ]:[];
 for(const prop of innYard)for(const [px,py] of prop.blocked)if(px>=0&&py>=0&&px<WIDTH&&py<HEIGHT)solid[py][px]=true;
 const bakery=buildings.find(b=>b.id==='bakery');
 const bakeryYard=bakery?[
  {sprite:'yardLogs',x:bakery.x+bakery.w+.12,y:bakery.y+1.45,w:1.08,h:1.15,blocked:[[bakery.x+bakery.w,bakery.y+2]]},
  {sprite:'bakerySackPile',x:bakery.x+bakery.w+.8,y:bakery.y+2.4,w:1.0,h:1.05,blocked:[[bakery.x+bakery.w+1,bakery.y+3]]}
 ]:[];
 for(const prop of bakeryYard)for(const [px,py] of prop.blocked)if(px>=0&&py>=0&&px<WIDTH&&py<HEIGHT)solid[py][px]=true;
 const market=byId.market;
 const marketStalls=market?[
  {sprite:'marketStallBlue',x:market.x-3.05,y:market.y-.9,w:1.6,h:2.15,blocked:[15,16].flatMap(x=>[16,17,18].map(y=>[x,y]))},
  {sprite:'marketStallGold',x:market.x+2.05,y:market.y-.9,w:1.6,h:2.15,blocked:[20,21].flatMap(x=>[16,17,18].map(y=>[x,y]))}
 ]:[];
 for(const prop of marketStalls)for(const [px,py] of prop.blocked)solid[py][px]=true;
 solid[24][20]=true; // Stone well on the green.
 for(let y=25;y<HEIGHT;y++)for(let x=0;x<3;x++)solid[y][x]=true; // Brook and mill race.
 function goal(place,id=0){
  const p=byId[place],b=buildings.find(row=>row.id===place);
  if(!p)return [19.5,21.5];
  if(place==='farm')return [4.5+(id%4)*1.4,17.5+(Math.floor(id/4)%3)*1.4];
  if(place==='market'){
   const spots=[[17.5,16.5],[18.5,16.5],[22.5,16.5],[23.5,16.5],
    [22.5,17.5],[18.5,17.5],[17.5,17.5],[23.5,17.5],
    [17.5,18.3],[18.5,18.3],[22.5,18.3],[23.5,18.3]];
   return spots[id%spots.length];
  }
  if(place==='green'){
   const spots=[[18.5,22.5],[17.5,22.5],[20.5,22.5],[21.5,22.5],
    [17.5,24.5],[22.5,24.5],[21.5,24.5],[18.5,24.5],
    [17.5,25.5],[21.5,25.5],[18.5,25.5],[22.5,25.5]];
   return spots[id%spots.length];
  }
  if(b){
   const regulars=residents.filter(r=>r.home===place||r.work===place).map(r=>r.id);
   const order=[...regulars,...Array.from({length:12},(_,i)=>i).filter(i=>!regulars.includes(i))];
   const slot=order.indexOf(id);
   if(slot>=6)return [b.x+.5+(slot-6),b.y+b.h+.5];
   const slots=[[1.5,1.5],[2.5,1.5],[3.5,1.5],[1.5,2.3],[2.5,2.3],[3.5,2.3]];
   const [sx,sy]=slots[Math.max(0,slot)];return [b.x+sx,b.y+sy]}
  return [p.x+.5,p.y+.5];
 }
 function porch(place,id=0){
  const b=buildings.find(row=>row.id===place);
  if(!b)return goal(place,id);
  const household=residents.filter(r=>r.home===place).map(r=>r.id);
  const rank=Math.max(0,household.indexOf(id));
  return [b.x+1.5+Math.min(rank,2),b.doorY+1.45];
 }
 function road(x,y){
  if(x===19&&y>=8&&y<=28)return true;
  if([9,15,19,20,28].includes(y)&&x>=5&&x<=35)return true;
  if((x===10||x===29)&&y>=20&&y<=28)return true;
  return buildings.some(b=>{
   const lane=b.y<9?9:b.y<18?15:28;
   return x===b.doorX&&y>b.doorY&&y<=lane;
  });
 }
 return {width:WIDTH,height:HEIGHT,solid,buildings,innYard,bakeryYard,marketStalls,goal,porch,road};
}
root.DunmereVillageLayout={create};
})(window);
