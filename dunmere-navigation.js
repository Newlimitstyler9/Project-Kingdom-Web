(function(root){"use strict";
function create(width,height,blocked){
 function walkable(x,y){return x>=1&&y>=1&&x<width-1&&y<height-1&&!blocked[Math.floor(y)]?.[Math.floor(x)]}
 function route(x,y,tx,ty){
  const start=[Math.floor(x),Math.floor(y)],end=[Math.floor(tx),Math.floor(ty)];
  const key=(a,b)=>a+","+b,queue=[start],seen=new Set([key(...start)]),previous=new Map();
  if(!walkable(start[0]+.5,start[1]+.5)||!walkable(end[0]+.5,end[1]+.5))return [];
  for(let i=0;i<queue.length;i++){
   const [cx,cy]=queue[i],current=key(cx,cy);
   if(cx===end[0]&&cy===end[1]){
    const path=[];let k=current;
    while(previous.has(k)){const [px,py]=k.split(",").map(Number);path.unshift([px+.5,py+.5]);k=previous.get(k)}
    return path;
   }
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=cx+dx,ny=cy+dy,k=key(nx,ny);
    if(!seen.has(k)&&walkable(nx+.5,ny+.5)){seen.add(k);previous.set(k,current);queue.push([nx,ny])}
   }
  }
  return [];
 }
 return {walkable,route};
}
root.KingdomNavigation={create};
})(window);
