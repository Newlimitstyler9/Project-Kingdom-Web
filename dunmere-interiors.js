// Separate, deterministic maps for Dunmere buildings and the north cave.
(function(root){"use strict";
const W=12,H=9;
const FURNITURE={
 home:[['bed',2,2,2,2],['bed',8,2,2,2],['hearth',2,5,2,1],['table',6,4,2,1]],
 tavern:[['counter',2,2,7,1],['table',2,5,2,1],['table',8,5,2,1],['hearth',9,2,1,2]],
 smithy:[['forge',2,2,2,2],['anvil',7,3,2,1],['rack',2,6,2,1]],
 mill:[['millstone',2,2,2,2],['sacks',8,2,2,1],['sacks',8,5,2,1]],
 bakery:[['oven',2,2,2,2],['counter',6,3,3,1],['sacks',8,6,2,1]],
 healer:[['bed',2,2,2,2],['shelf',8,2,2,1],['table',6,5,2,1]],
 weaver:[['loom',2,2,3,2],['shelf',8,2,2,1],['table',6,5,2,1]],
 guard:[['rack',2,2,2,1],['table',6,3,2,1],['bed',8,5,2,2]],
 cave:[['boulder',2,2,2,1],['boulder',8,5,2,1],['stone',8,2,1,1]]
};
const CAVE={id:'north-cave',name:'North Cave',kind:'cave',portal:{x:36.5,y:8.5}};
function furniture(ctx,f,size){
 const x=f.x*size,y=f.y*size,w=f.w*size,h=f.h*size;
 const box=(dx,dy,bw,bh,color)=>{ctx.fillStyle=color;ctx.fillRect(x+dx,y+dy,bw,bh)};
 if(f.type==='bed'){box(0,0,w,h,'#4b392b');box(4,4,w-8,h-8,'#738779');box(6,6,w-12,h*.28,'#ded4b5');box(6,h*.4,w-12,h*.48,'#856a6a');return}
 if(f.type==='table'||f.type==='counter'){box(0,0,w,h,'#4a3426');box(4,4,w-8,h-8,'#886541');box(7,6,w-14,3,'#b59162');if(f.type==='table'){box(w*.45,h*.3,10,8,'#d4be91');box(w*.48,h*.35,5,4,'#6b7659')}return}
 if(f.type==='hearth'||f.type==='forge'||f.type==='oven'){box(0,0,w,h,'#55564e');box(5,5,w-10,h-10,'#282d2c');box(w*.23,h*.42,w*.54,h*.4,f.type==='oven'?'#a1663e':'#af4d30');box(w*.42,h*.26,w*.18,h*.34,'#e6a751');return}
 if(f.type==='anvil'){box(0,h*.4,w,h*.34,'#414b4d');box(w*.2,h*.24,w*.6,h*.23,'#a4ada7');box(w*.4,h*.7,w*.2,h*.3,'#5c5046');return}
 if(f.type==='rack'||f.type==='shelf'){box(0,0,w,h,'#624932');for(let i=0;i<3;i++){box(4+i*w*.28,5,8,h-10,f.type==='rack'?'#9ba6a4':['#79915c','#a67c62','#b5a06a'][i])}return}
 if(f.type==='millstone'){ctx.fillStyle='#4a504d';ctx.beginPath();ctx.arc(x+w/2,y+h/2,w*.45,0,7);ctx.fill();ctx.fillStyle='#a9afa3';ctx.beginPath();ctx.arc(x+w/2,y+h/2,w*.34,0,7);ctx.fill();ctx.fillStyle='#555b56';ctx.beginPath();ctx.arc(x+w/2,y+h/2,w*.09,0,7);ctx.fill();return}
 if(f.type==='sacks'){for(let i=0;i<3;i++){box(i*w*.3+2,h*.2,w*.26,h*.65,'#9e8058');box(i*w*.3+4,h*.3,w*.18,3,'#d0b582')}return}
 if(f.type==='loom'){box(0,0,w,h,'#5d4738');box(6,6,w-12,h-12,'#9b8065');for(let i=0;i<6;i++)box(9+i*(w-18)/6,7,2,h-14,i%2?'#a66e65':'#776d9b');return}
 if(f.type==='boulder'||f.type==='stone'){ctx.fillStyle=f.type==='stone'?'#aab8ad':'#505b54';ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x+w*.15,y+h*.22);ctx.lineTo(x+w*.7,y);ctx.lineTo(x+w,y+h*.55);ctx.lineTo(x+w*.8,y+h);ctx.fill();box(w*.3,h*.25,w*.2,3,'#c2cbbf')}
}
function create(buildings){
 const rooms=Object.fromEntries([...buildings.map(b=>[b.id,{id:b.id,name:b.name,kind:b.kind,portal:{x:b.doorX+.5,y:b.doorY+.5}}]),[CAVE.id,CAVE]].map(([id,room])=>[id,{...room,width:W,height:H,furniture:(FURNITURE[room.kind]||FURNITURE.home).map(([type,x,y,w,h])=>({type,x,y,w,h}))}]));
 function get(id){return rooms[id]||null}
 function pass(room,x,y){if(!room||x<1.2||x>W-1.2||y<1.2||y>H-1.05)return false;return !room.furniture.some(f=>x>=f.x-.2&&x<f.x+f.w+.2&&y>=f.y-.2&&y<f.y+f.h+.2)}
 function slot(room,index){const candidates=[];for(const y of [3.5,4.5,5.5,6.5,2.5])for(const x of [3.5,5.5,7.5,9.5,4.5,6.5,8.5])if(pass(room,x,y)&&Math.hypot(x-5.5,y-7.3)>1.4)candidates.push({x,y});return candidates[index%candidates.length]||{x:5.5,y:5.5}}
 function nearPortal(x,y){return Object.values(rooms).find(r=>Math.hypot(x-r.portal.x,y-r.portal.y)<1.45)||null}
 function draw(ctx,room,size){
  const cave=room.kind==='cave',wall=cave?'#343c3a':'#514236',floor=cave?'#676b60':'#a5845e';
  ctx.fillStyle=wall;ctx.fillRect(0,0,W*size,H*size);
  ctx.fillStyle=floor;ctx.fillRect(size,size,(W-2)*size,(H-2)*size);
  ctx.fillStyle=cave?'#767b6d':'#b6956a';
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if((x*11+y*17)%7===0)ctx.fillRect(x*size+size*.2,y*size+size*.35,size*.22,size*.07);
  ctx.fillStyle=cave?'#252d2c':'#34291f';ctx.fillRect(5*size,8*size,size,12);
  ctx.fillStyle='#e6ce9f';ctx.font=`bold ${Math.round(size*.25)}px system-ui`;ctx.textAlign='center';ctx.fillText(room.name,W*size/2,size*.6);
  for(const f of room.furniture)furniture(ctx,f,size);
  ctx.fillStyle='#e8d3a7';ctx.font=`${Math.round(size*.22)}px system-ui`;ctx.fillText('EXIT',5.5*size,7.8*size);
 }
 return {rooms,get,pass,slot,nearPortal,draw,cave:CAVE};
}
root.KingdomInteriors={create};
})(window);
