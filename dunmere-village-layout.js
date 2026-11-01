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
 solid[24][20]=true; // Stone well on the green.
 for(let y=25;y<HEIGHT;y++)for(let x=0;x<3;x++)solid[y][x]=true; // Brook and mill race.
 function goal(place,id=0){
  const p=byId[place],b=buildings.find(row=>row.id===place);
  if(!p)return [19.5,21.5];
  if(place==='farm')return [4.5+(id%4)*1.4,17.5+(Math.floor(id/4)%3)*1.4];
  if(place==='market'){
   const spots=[[16.5,16.5],[18.5,16.5],[20.5,16.5],[22.5,16.5],
    [16.5,18.3],[18.5,18.3],[22.5,18.3],[24.5,18.3],
    [16.5,20.1],[18.5,20.1],[20.5,20.1],[22.5,20.1]];
   return spots[id%spots.length];
  }
  if(place==='green'){
   const spots=[[17.5,22.5],[18.5,22.5],[20.5,22.5],[21.5,22.5],
    [17.5,24.5],[18.5,24.5],[21.5,24.5],[22.5,24.5],
    [17.5,25.5],[18.5,25.5],[21.5,25.5],[22.5,25.5]];
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
 return {width:WIDTH,height:HEIGHT,solid,buildings,goal,porch,road};
}
root.DunmereVillageLayout={create};
})(window);
