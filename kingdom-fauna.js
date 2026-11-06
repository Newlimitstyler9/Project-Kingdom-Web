// Persistent, bounded animal actors. The renderer uses each source sheet's native frame grid.
(function(root){'use strict';
const BOUNDS={cow:[128,128,4,4],sheep:[128,128,4,4],pig:[128,128,4,4],chicken:[32,32,4,4],dog:[32,32,3,4],cat:[32,32,3,4],deer:[32,32,3,4],rabbit:[72,72,4,8]};
const ROWS={cow:{up:0,left:1,down:2,right:3},sheep:{up:0,left:1,down:2,right:3},pig:{up:0,left:1,down:2,right:3},chicken:{up:0,left:1,down:2,right:3},dog:{down:0,left:1,right:2,up:3},cat:{down:0,left:1,right:2,up:3},deer:{up:0,left:1,down:2,right:3},rabbit:{up:0,left:1,down:2,right:3}};
const DISPLAY={cow:[2,2],sheep:[1.5,1.5],pig:[1.5,1.5],chicken:[.85,.85],dog:[1.1,1.1],cat:[.85,.85],deer:[1.25,1.25],rabbit:[.8,.8]};
const SOURCES={cow:'cow-walk.png',sheep:'sheep-walk.png',pig:'pig-walk.png',chicken:'chicken-walk.png',dog:'cat-dog.png',cat:'cat-dog.png',deer:'deer-walk.png',rabbit:'rabbit-walk.png'};
const images={};
for(const [kind,file] of Object.entries(SOURCES)){if(images[kind])continue;const image=new Image();image.src='assets/fauna/'+file;images[kind]=image}
const seeds=[
 ['cow-1','cow',63,85,3],['cow-2','cow',68,85,3],['sheep-1','sheep',59,87,3],['sheep-2','sheep',62,89,3],['pig-1','pig',73,86,3],
 ['hen-1','chicken',73,54,3],['hen-2','chicken',75,56,3],['hen-3','chicken',69,56,3],
 ['dog-1','dog',165,117,4],['cat-1','cat',189,94,3],
 ['deer-1','deer',18,22,7],['deer-2','deer',93,68,7],['deer-3','deer',236,156,7],
 ['rabbit-1','rabbit',26,23,5],['rabbit-2','rabbit',97,69,5],['rabbit-3','rabbit',235,160,5]
];
function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function create(saved){const animals=seeds.map(([id,kind,x,y,radius])=>({id,kind,x:x+.5,y:y+.5,homeX:x+.5,homeY:y+.5,radius,goalX:x+.5,goalY:y+.5,facing:'down',moving:false,walkMs:0,wait:0,decision:0}));
 function restore(data){if(data?.version!==1||!Array.isArray(data.animals))return false;for(const raw of data.animals){const a=animals.find(entry=>entry.id===raw?.id);if(a&&Number.isFinite(raw.x)&&Number.isFinite(raw.y)&&Math.hypot(raw.x-a.homeX,raw.y-a.homeY)<=a.radius+1){a.x=raw.x;a.y=raw.y;a.goalX=Number.isFinite(raw.goalX)?raw.goalX:a.homeX;a.goalY=Number.isFinite(raw.goalY)?raw.goalY:a.homeY;a.decision=Math.max(0,raw.decision|0)}}return true}
 if(saved)restore(saved);
 function choose(a,pass){a.decision++;for(let tryIndex=0;tryIndex<12;tryIndex++){const salt=hash(a.id+':'+a.decision+':'+tryIndex),angle=(salt%6283)/1000,reach=.6+((salt>>>12)%100)/100*a.radius;const x=a.homeX+Math.cos(angle)*reach,y=a.homeY+Math.sin(angle)*reach;if(pass(x,y,a)&&!animals.some(other=>other!==a&&Math.hypot(other.x-x,other.y-y)<.7)){a.goalX=x;a.goalY=y;return}}a.goalX=a.homeX;a.goalY=a.homeY}
 function step(dt,player,pass){if(!Number.isFinite(dt)||dt<=0)return;for(const a of animals){const wild=a.kind==='deer'||a.kind==='rabbit',near=wild&&player&&Math.hypot(player.x-a.x,player.y-a.y)<3.5;if(near){const dx=a.x-player.x,dy=a.y-player.y,length=Math.hypot(dx,dy)||1;a.goalX=a.x+dx/length*2.5;a.goalY=a.y+dy/length*2.5;a.wait=0}else if(a.wait>0){a.wait=Math.max(0,a.wait-dt);a.moving=false;continue}else if(Math.hypot(a.goalX-a.x,a.goalY-a.y)<.15)choose(a,pass);
  const dx=a.goalX-a.x,dy=a.goalY-a.y,distance=Math.hypot(dx,dy);if(distance<.1){a.wait=.6+(hash(a.id+':'+a.decision)%200)/100;a.moving=false;continue}const speed=near?(a.kind==='rabbit'?3.4:2.7):a.kind==='chicken'||a.kind==='rabbit'?1.25:a.kind==='cow'||a.kind==='sheep'||a.kind==='pig'?.65:1.05,travel=Math.min(distance,speed*dt),nx=a.x+dx/distance*travel,ny=a.y+dy/distance*travel;
  if(Math.hypot(nx-a.homeX,ny-a.homeY)>a.radius||!pass(nx,ny,a)||animals.some(other=>other!==a&&Math.hypot(other.x-nx,other.y-ny)<.65)){a.wait=.25;choose(a,pass);a.moving=false;continue}a.x=nx;a.y=ny;a.moving=true;a.walkMs+=travel/speed*1000;if(Math.abs(dx)>Math.abs(dy))a.facing=dx<0?'left':'right';else a.facing=dy<0?'up':'down';
 }}
 function list(){return animals.map(a=>({...a}))}
 function near(x,y,radius=.55){return animals.find(a=>Math.hypot(a.x-x,a.y-y)<radius+(['cow','deer'].includes(a.kind)?.25:0))||null}
 function snapshot(){return {version:1,animals:animals.map(a=>({id:a.id,x:a.x,y:a.y,goalX:a.goalX,goalY:a.goalY,decision:a.decision}))}}
 return {step,list,near,snapshot,restore};
}
function draw(ctx,animal,size){const image=images[animal.kind];if(!image?.complete||!image.naturalWidth)return false;const [w,h,columns]=BOUNDS[animal.kind],row=ROWS[animal.kind][animal.facing]??0,frame=animal.moving?Math.floor(animal.walkMs/180)%columns:0,[drawW,drawH]=DISPLAY[animal.kind],sourceX=animal.kind==='cat'?3*w:0,sourceY=animal.kind==='dog'?4*h:0;
 const width=drawW*size,height=drawH*size,x=animal.x*size-width/2,y=animal.y*size-height*.84;ctx.drawImage(image,sourceX+frame*w,sourceY+row*h,w,h,x,y,width,height);return true}
root.KingdomFauna={create,draw,images,seeds};
})(typeof window!=='undefined'?window:globalThis);
