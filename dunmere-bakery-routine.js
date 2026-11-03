// Iris performs a visible work circuit in the bakery without creating phantom stock.
(function(root){"use strict";
const stations=[
 {x:8.5,y:4.65,task:"Serving customers",pause:2.4,facing:"down"},
 {x:4.55,y:4.65,task:"Checking the oven",pause:1.7,facing:"left"},
 {x:4.75,y:4.85,task:"Kneading dough",pause:3.1,facing:"down"},
 {x:4.55,y:4.65,task:"Loading the oven",pause:2.0,facing:"left"}
];
function create(){
 let x=stations[0].x,y=stations[0].y,index=0,wait=stations[0].pause,facing="down",moving=false,walkMs=0;
 function step(dt,pass){
  if(!Number.isFinite(dt)||dt<=0)return snapshot();
  moving=false;
  if(wait>0){wait=Math.max(0,wait-dt);return snapshot()}
  const next=stations[(index+1)%stations.length],dx=next.x-x,dy=next.y-y,d=Math.hypot(dx,dy);
  if(d<.04){index=(index+1)%stations.length;x=next.x;y=next.y;facing=next.facing;wait=next.pause;return snapshot()}
  const travel=Math.min(d,1.1*dt),nx=x+dx/d*travel,ny=y+dy/d*travel;
  if(pass(nx,ny)){x=nx;y=ny;moving=true;walkMs+=travel/1.1*1000;facing=Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up"}
  return snapshot();
 }
 function snapshot(){return {x,y,facing,moving,walkMs,task:moving?"Walking to "+stations[(index+1)%stations.length].task.toLowerCase():stations[index].task}}
 return {step,snapshot};
}
root.KingdomBakeryRoutine={create};
})(window);
