// Local pedestrian spacing. Navigation chooses the route; this keeps bodies
// apart while following it and repairs overlapping positions in old saves.
(function(root){"use strict";
const RADIUS=.92;
function free(actors,id,x,y,walkable,radius=RADIUS){
 if(!walkable(x,y))return false;
 return actors.every((other,j)=>j===id||Math.hypot(x-other.x,y-other.y)>=radius);
}
function clearSegment(actors,id,fromX,fromY,toX,toY,walkable){
 const segments=Math.max(1,Math.ceil(Math.hypot(toX-fromX,toY-fromY)/.2));
 for(let n=1;n<=segments;n++){
  const t=n/segments;
  if(!free(actors,id,fromX+(toX-fromX)*t,fromY+(toY-fromY)*t,walkable))return false;
 }
 return true;
}
function spread(actors,walkable){
 for(let id=0;id<actors.length;id++){
  const a=actors[id];
  if(free(actors,id,a.x,a.y,walkable))continue;
  const originX=a.x,originY=a.y;
  for(let ring=1;ring<=5;ring++){
   let found=false;
   for(let n=0;n<24;n++){
    const angle=(n+(id%2)*.5)*Math.PI/12;
    const x=originX+Math.cos(angle)*ring*.48;
    const y=originY+Math.sin(angle)*ring*.48;
    if(free(actors,id,x,y,walkable)){
     a.x=x;a.y=y;a.path=[];a.destination=null;found=true;break;
    }
   }
   if(found)break;
  }
 }
}
function move(actors,id,waypoint,step,walkable){
 const a=actors[id],dx=waypoint[0]-a.x,dy=waypoint[1]-a.y;
 const distance=Math.hypot(dx,dy);
 if(distance<.001||step<=0)return false;
 const ux=dx/distance,uy=dy/distance;
 // A short sidestep lets walkers pass at junctions without abandoning their
 // path. The fixed order makes traffic deterministic across save/reload.
 const side=id%2?1:-1;
 for(const angle of [0,side*.65,-side*.65,side*1.3,-side*1.3]){
  const c=Math.cos(angle),s=Math.sin(angle);
  const x=a.x+(ux*c-uy*s)*step,y=a.y+(ux*s+uy*c)*step;
  if(clearSegment(actors,id,a.x,a.y,x,y,walkable)){a.x=x;a.y=y;return true}
 }
 return false;
}
root.KingdomNpcTraffic={RADIUS,free,spread,move};
})(window);
