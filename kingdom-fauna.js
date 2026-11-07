// Persistent, bounded animal actors. The renderer uses each source sheet's native frame grid.
(function(root){'use strict';
const BOUNDS={cow:[128,128,4,4],sheep:[128,128,4,4],pig:[128,128,4,4],chicken:[32,32,4,4],dog:[32,32,3,4],cat:[32,32,3,4],deer:[32,32,3,4],rabbit:[72,72,4,8]};
const ROWS={cow:{up:0,left:1,down:2,right:3},sheep:{up:0,left:1,down:2,right:3},pig:{up:0,left:1,down:2,right:3},chicken:{up:0,left:1,down:2,right:3},dog:{down:0,left:1,right:2,up:3},cat:{down:0,left:1,right:2,up:3},deer:{up:0,left:1,down:2,right:3},rabbit:{up:0,left:1,down:2,right:3}};
const DISPLAY={cow:[2,2],sheep:[1.5,1.5],pig:[1.5,1.5],chicken:[.85,.85],dog:[1.1,1.1],cat:[.85,.85],deer:[1.25,1.25],rabbit:[.8,.8]};
const SOURCES={cow:'cow-walk.png',sheep:'sheep-walk.png',pig:'pig-walk.png',chicken:'chicken-walk.png',dog:'cat-dog.png',cat:'cat-dog.png',deer:'deer-walk.png',rabbit:'rabbit-walk.png'};
const images={};
const opaqueFrames={};
function measureFrames(kind,image){
 const [w,h,columns]=BOUNDS[kind],canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const {data,width}=ctx.getImageData(0,0,canvas.width,canvas.height),frames=[];
 let span=1;
 for(let row=0;row<4;row++)for(let frame=0;frame<columns;frame++){
  const left=(kind==='cat'?3*w:0)+frame*w,top=(kind==='dog'?4*h:0)+row*h;
  let minX=w,minY=h,maxX=-1,maxY=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[((top+y)*width+left+x)*4+3]>0){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
  const bounds=maxX<0?{x:0,y:0,w,h}:{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1};
  frames[row*columns+frame]=bounds;span=Math.max(span,bounds.w,bounds.h);
 }
 opaqueFrames[kind]={frames,span};
}
for(const [kind,file] of Object.entries(SOURCES)){const image=new Image();image.onload=()=>measureFrames(kind,image);image.src='assets/fauna/'+file;images[kind]=image}
const fenceImage=new Image();fenceImage.src='assets/greyford-paddock-fence.png?v=1';
// Coordinates are world tiles. A pen has a walkable gate on its west side.
const pens={westfield:{x:58,y:82,w:20,h:11,gateY:87,capacity:12,owner:'westfield'},dunmereHens:{x:45,y:35,w:7,h:6,gateY:38,capacity:7,owner:'dunmere'},greyfordHens:{x:151,y:121,w:7,h:7,gateY:124,capacity:7,owner:'greyford'}};
const seeds=[
 ['cow-1','cow',63,85,3,'female','westfield'],['cow-2','cow',68,85,3,'male','westfield'],['sheep-1','sheep',60,87,3,'female','westfield'],['sheep-2','sheep',63,89,3,'male','westfield'],['pig-1','pig',72,86,3,'female','westfield'],['pig-2','pig',75,89,3,'male','westfield'],
 ['hen-1','chicken',47,37,2,'female','dunmereHens'],['hen-2','chicken',49,37,2,'female','dunmereHens'],['hen-3','chicken',47,39,2,'female','dunmereHens'],['rooster-1','chicken',49,39,2,'male','dunmereHens'],
 ['grey-hen-1','chicken',153,123,2,'female','greyfordHens'],['grey-hen-2','chicken',155,123,2,'female','greyfordHens'],['grey-rooster','chicken',154,125,2,'male','greyfordHens'],
 ['dog-1','dog',165,117,4],['cat-1','cat',189,95,3],
 ['deer-1','deer',18,22,7],['deer-2','deer',93,68,7],['deer-3','deer',236,156,7],
 ['rabbit-1','rabbit',26,23,5],['rabbit-2','rabbit',97,69,5],['rabbit-3','rabbit',235,160,5]
];
function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function insidePen(pen,x,y){return x>=pen.x+1&&x<pen.x+pen.w-1&&y>=pen.y+1&&y<pen.y+pen.h-1}
function fenceAt(x,y){return Object.values(pens).some(p=>{const px=Math.floor(x),py=Math.floor(y);if(px<p.x||px>=p.x+p.w||py<p.y||py>=p.y+p.h)return false;if(py===p.y||py===p.y+p.h-1)return true;if(px===p.x&&py===p.gateY)return false;return px===p.x||px===p.x+p.w-1})}
function create(saved,pass=()=>true){const animals=seeds.map(([id,kind,x,y,radius,sex,penId])=>({id,kind,sex:sex||null,penId:penId||null,ageDays:30,pregnancyDue:0,x:x+.5,y:y+.5,homeX:x+.5,homeY:y+.5,radius,goalX:x+.5,goalY:y+.5,facing:'down',moving:false,walkMs:0,wait:0,decision:0}));
 const stocks={westfield:{milk:0,wool:0,rawBeef:0,rawPork:0,hide:0},dunmereHens:{eggs:0,rawChicken:0},greyfordHens:{eggs:0,rawChicken:0}};let lastDay=0,nextBirth=1;
 function restore(data){if(!data||![1,2].includes(data.version)||!Array.isArray(data.animals))return false;if(data.version===2){const savedIds=new Set(data.animals.map(a=>a?.id));for(let i=animals.length-1;i>=0;i--)if(!savedIds.has(animals[i].id))animals.splice(i,1)}for(const raw of data.animals){let a=animals.find(entry=>entry.id===raw?.id);if(!a&&data.version===2&&typeof raw?.id==='string'&&/^born-\d+$/.test(raw.id)&&pens[raw.penId]&&['cow','sheep','pig','chicken'].includes(raw.kind)&&animals.length<80){const pen=pens[raw.penId];a={id:raw.id,kind:raw.kind,sex:raw.sex==='male'?'male':'female',penId:raw.penId,ageDays:0,pregnancyDue:0,x:pen.x+2.5,y:pen.y+2.5,homeX:pen.x+2.5,homeY:pen.y+2.5,radius:2,goalX:pen.x+2.5,goalY:pen.y+2.5,facing:'down',moving:false,walkMs:0,wait:0,decision:0};animals.push(a)}if(a&&Number.isFinite(raw.x)&&Number.isFinite(raw.y)&&pass(raw.x,raw.y)&&(a.penId?insidePen(pens[a.penId],raw.x,raw.y):Math.hypot(raw.x-a.homeX,raw.y-a.homeY)<=a.radius+1)){a.x=raw.x;a.y=raw.y;a.goalX=Number.isFinite(raw.goalX)?raw.goalX:a.homeX;a.goalY=Number.isFinite(raw.goalY)?raw.goalY:a.homeY;a.decision=Math.max(0,raw.decision|0);if(data.version===2){a.ageDays=Math.max(0,raw.ageDays|0);a.pregnancyDue=Math.max(0,raw.pregnancyDue|0);if(a.penId&&Number.isFinite(raw.homeX)&&Number.isFinite(raw.homeY)&&insidePen(pens[a.penId],raw.homeX,raw.homeY)){a.homeX=raw.homeX;a.homeY=raw.homeY}if(a.penId&&Number.isFinite(raw.radius))a.radius=Math.max(1,Math.min(4,raw.radius))}}}if(data.version===2){lastDay=Math.max(0,data.lastDay|0);nextBirth=Math.max(1,data.nextBirth|0);for(const [id,items] of Object.entries(stocks))for(const key of Object.keys(items)){const quantity=data.stocks?.[id]?.[key];if(Number.isInteger(quantity)&&quantity>=0)items[key]=quantity}}return true}
 if(saved)restore(saved);
 function choose(a,pass){a.decision++;for(let tryIndex=0;tryIndex<12;tryIndex++){const salt=hash(a.id+':'+a.decision+':'+tryIndex),angle=(salt%6283)/1000,reach=.6+((salt>>>12)%100)/100*a.radius;const x=a.homeX+Math.cos(angle)*reach,y=a.homeY+Math.sin(angle)*reach;if((!a.penId||insidePen(pens[a.penId],x,y))&&pass(x,y,a)&&!animals.some(other=>other!==a&&Math.hypot(other.x-x,other.y-y)<.7)){a.goalX=x;a.goalY=y;return}}a.goalX=a.homeX;a.goalY=a.homeY}
 function step(dt,player,pass){if(!Number.isFinite(dt)||dt<=0)return;for(const a of animals){const wild=a.kind==='deer'||a.kind==='rabbit',near=wild&&player&&Math.hypot(player.x-a.x,player.y-a.y)<3.5;if(near){const dx=a.x-player.x,dy=a.y-player.y,length=Math.hypot(dx,dy)||1;a.goalX=a.x+dx/length*2.5;a.goalY=a.y+dy/length*2.5;a.wait=0}else if(a.wait>0){a.wait=Math.max(0,a.wait-dt);a.moving=false;continue}else if(Math.hypot(a.goalX-a.x,a.goalY-a.y)<.15)choose(a,pass);
  const dx=a.goalX-a.x,dy=a.goalY-a.y,distance=Math.hypot(dx,dy);if(distance<.1){a.wait=.6+(hash(a.id+':'+a.decision)%200)/100;a.moving=false;continue}const speed=near?(a.kind==='rabbit'?3.4:2.7):a.kind==='chicken'||a.kind==='rabbit'?1.25:a.kind==='cow'||a.kind==='sheep'||a.kind==='pig'?.65:1.05,travel=Math.min(distance,speed*dt),nx=a.x+dx/distance*travel,ny=a.y+dy/distance*travel;
  if(Math.hypot(nx-a.homeX,ny-a.homeY)>a.radius||a.penId&&!insidePen(pens[a.penId],nx,ny)||!pass(nx,ny,a)||animals.some(other=>other!==a&&Math.hypot(other.x-nx,other.y-ny)<.65)){a.wait=.25;choose(a,pass);a.moving=false;continue}a.x=nx;a.y=ny;a.moving=true;a.walkMs+=travel/speed*1000;if(Math.abs(dx)>Math.abs(dy))a.facing=dx<0?'left':'right';else a.facing=dy<0?'up':'down';
 }}
 function advanceDay(day){
  if(!Number.isInteger(day)||day<=lastDay)return [];
  const events=[];
  for(let date=lastDay+1;date<=day;date++)for(const [penId,pen] of Object.entries(pens)){
   const herd=animals.filter(a=>a.penId===penId);
   for(const a of herd){
    a.ageDays++;
    if(a.kind==='cow'&&a.sex==='female'&&a.ageDays>=12&&hash(a.id+':milk:'+date)%100<65)stocks[penId].milk=Math.min(24,stocks[penId].milk+1);
    if(a.kind==='sheep'&&a.ageDays>=12&&date%5===0)stocks[penId].wool=Math.min(24,stocks[penId].wool+1);
    if(a.kind==='chicken'&&a.sex==='female'&&a.ageDays>=6&&hash(a.id+':egg:'+date)%100<65)stocks[penId].eggs=Math.min(24,stocks[penId].eggs+1);
    if(a.pregnancyDue===date){
     a.pregnancyDue=0;
     if(herd.length<pen.capacity&&animals.length<80){
      const offset=hash(a.id+':birth:'+date)%4;
      const child={...a,id:'born-'+nextBirth++,sex:hash(a.id+':sex:'+date)%2?'male':'female',ageDays:0,pregnancyDue:0,
       x:Math.min(pen.x+pen.w-2.5,a.x+.5+(offset%2)),y:Math.min(pen.y+pen.h-2.5,a.y+.5+Math.floor(offset/2)),
       homeX:a.homeX,homeY:a.homeY,goalX:a.homeX,goalY:a.homeY,radius:a.radius,decision:0,walkMs:0,moving:false};
      animals.push(child);herd.push(child);
      events.push({kind:'birth',penId,animal:child.id,species:a.kind});
     }
    }else if(!a.pregnancyDue&&a.sex==='female'&&a.ageDays>=(a.kind==='chicken'?6:12)&&herd.length<pen.capacity&&
      herd.some(other=>other.kind===a.kind&&other.sex==='male'&&other.ageDays>=(a.kind==='chicken'?6:12))&&
      hash(a.id+':breed:'+date)%100<(a.kind==='chicken'?10:7)){
     a.pregnancyDue=date+({cow:12,sheep:7,pig:6,chicken:5}[a.kind]||8);
    }
   }
  }
  lastDay=day;
  return events;
 }
 function slaughter(id,penId){const index=animals.findIndex(a=>a.id===id&&a.penId===penId);if(index<0)return null;const a=animals[index];animals.splice(index,1);const yieldByKind={cow:{rawBeef:8,hide:2},pig:{rawPork:6,hide:1},sheep:{hide:1},chicken:{rawChicken:1}}[a.kind];if(!yieldByKind)return null;const yieldGoods=Object.fromEntries(Object.entries(yieldByKind).map(([key,value])=>[key,a.ageDays<12?Math.max(1,Math.floor(value/2)):value]));for(const [key,value] of Object.entries(yieldGoods))stocks[penId][key]=(stocks[penId][key]||0)+value;return yieldGoods}
 function stock(penId){return stocks[penId]?{...stocks[penId]}:null}
 function takeStock(penId,item,amount){if(!Number.isInteger(amount)||amount<1||!stocks[penId]||!Object.hasOwn(stocks[penId],item)||stocks[penId][item]<amount)return false;stocks[penId][item]-=amount;return true}
 function list(){return animals.map(a=>({...a}))}
 function near(x,y,radius=.55){return animals.find(a=>Math.hypot(a.x-x,a.y-y)<radius+(['cow','deer'].includes(a.kind)?.25:0))||null}
 function snapshot(){return {version:2,lastDay,nextBirth,stocks:Object.fromEntries(Object.entries(stocks).map(([id,items])=>[id,{...items}])),animals:animals.map(a=>({id:a.id,kind:a.kind,sex:a.sex,penId:a.penId,ageDays:a.ageDays,pregnancyDue:a.pregnancyDue,x:a.x,y:a.y,homeX:a.homeX,homeY:a.homeY,radius:a.radius,goalX:a.goalX,goalY:a.goalY,decision:a.decision}))}}
 return {step,list,near,advanceDay,slaughter,stock,takeStock,snapshot,restore};
}
function draw(ctx,animal,size){const image=images[animal.kind];if(!image?.complete||!image.naturalWidth)return false;const [w,h,columns]=BOUNDS[animal.kind],row=ROWS[animal.kind][animal.facing]??0,frame=animal.moving?Math.floor(animal.walkMs/180)%columns:0,[drawW,drawH]=DISPLAY[animal.kind],sourceX=animal.kind==='cat'?3*w:0,sourceY=animal.kind==='dog'?4*h:0;
 const bounds=opaqueFrames[animal.kind]?.frames[row*columns+frame]||{x:0,y:0,w,h};
 const span=opaqueFrames[animal.kind]?.span||Math.max(w,h),baby=animal.ageDays<6?.55:animal.ageDays<12?.72:1;
 const scale=Math.min(drawW,drawH)*size*baby/span,width=bounds.w*scale,height=bounds.h*scale,x=animal.x*size-width/2,y=animal.y*size-height*.84;
 ctx.imageSmoothingEnabled=false;ctx.drawImage(image,sourceX+frame*w+bounds.x,sourceY+row*h+bounds.y,bounds.w,bounds.h,x,y,width,height);return true}
function drawPens(ctx,size,front=false,offsetX=0,offsetY=0,filter=()=>true){if(!fenceImage.complete||!fenceImage.naturalWidth)return;const tile=(sprite,x,y)=>ctx.drawImage(fenceImage,sprite*16,0,16,16,Math.round((x-offsetX)*size),Math.round((y-offsetY)*size),size+1,size+1);for(const pen of Object.values(pens)){if(!filter(pen))continue;if(front){for(let x=pen.x+1;x<pen.x+pen.w-1;x++)tile(0,x,pen.y+pen.h-1);tile(5,pen.x,pen.y+pen.h-1);tile(6,pen.x+pen.w-1,pen.y+pen.h-1);continue}for(let y=pen.y+1;y<pen.y+pen.h-1;y++){if(y!==pen.gateY)tile(1,pen.x,y);tile(2,pen.x+pen.w-1,y)}for(let x=pen.x+1;x<pen.x+pen.w-1;x++)tile(0,x,pen.y);tile(3,pen.x,pen.y);tile(4,pen.x+pen.w-1,pen.y)}}
root.KingdomFauna={create,draw,drawPens,fenceAt,insidePen,pens,images,seeds};
})(typeof window!=='undefined'?window:globalThis);
