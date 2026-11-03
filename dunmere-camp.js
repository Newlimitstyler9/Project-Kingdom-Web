// A small, persistent wilderness camp loop. All positions are region tile centers.
(function(root){"use strict";
const nodes=[
 {id:'branches',name:'Fallen branches',x:23.5,y:78.5,item:'stick',quantity:8,art:'brush'},
 {id:'stones',name:'Loose stones',x:26.5,y:80.5,item:'stone',quantity:4,art:'stones'},
 {id:'grasses',name:'Dry grasses',x:27.5,y:79.5,item:'fiber',quantity:6,art:'grass'}
];
function create(region){
 const gathered={},placed=[];
 function visibleNodes(day){return nodes.filter(n=>gathered[n.id]!==day&&!placed.some(p=>Math.hypot(p.x-n.x,p.y-n.y)<1.6))}
 function nearbyNode(x,y,day){return (day===undefined?nodes:visibleNodes(day)).find(n=>Math.hypot(n.x-x,n.y-y)<1.5)||null}
 function gather(node,day,bag){
  if(!node||!nodes.includes(node))return {ok:false,message:'No supplies here.'};
  if(gathered[node.id]===day)return {ok:false,message:'You already gathered these supplies today.'};
  if(!bag.add(node.item,node.quantity))return {ok:false,message:'Your bag is full.'};
  gathered[node.id]=day;
  return {ok:true,message:'Gathered '+node.quantity+' '+(node.item==='stick'?'sticks':node.item==='stone'?'stones':'bundles of plant fiber')+'.'};
 }
 function canPlace(kind,x,y){
  if(!['campfire','tent'].includes(kind))return false;
  const tile=region.tile(Math.floor(x),Math.floor(y));
  if(!tile||tile.road||tile.water||tile.cover||!region.pass(x,y))return false;
  for(let yy=Math.floor(y)-2;yy<=Math.floor(y)+2;yy++)for(let xx=Math.floor(x)-2;xx<=Math.floor(x)+2;xx++)if(region.tile(xx,yy)?.cover==='forest'&&Math.hypot(xx+.5-x,yy+.5-y)<1.8)return false;
  if(Math.hypot(x-region.sites.dunmere.x,y-region.sites.dunmere.y)<8)return false;
  return !placed.some(p=>Math.hypot(p.x-x,p.y-y)<(kind==='tent'||p.kind==='tent'?1.3:1.2));
 }
 function place(kind,x,y,bag){
  x=Math.floor(x)+.5;y=Math.floor(y)+.5;
  if(!canPlace(kind,x,y))return {ok:false,message:'Choose open ground away from roads, water, trees, and buildings.'};
  if(!bag.takeItem(kind,1))return {ok:false,message:'Craft a '+root.KingdomItemCatalog.defs[kind].name.toLowerCase()+' first.'};
  placed.push({kind,x,y});
  return {ok:true,message:kind==='tent'?(bag.count('bedroll')?'You pitched your tent. Your bedroll is ready for the night.':'You pitched your tent. Bring a bedroll to sleep here.'):'You set a campfire among the stones.'};
 }
 function nearby(x,y){return placed.find(p=>Math.hypot(p.x-x,p.y-y)<1.7)||null}
 function snapshot(){return {version:1,gathered:{...gathered},placed:placed.map(p=>({...p}))}}
 function restore(data){
  if(!data||data.version!==1||!Array.isArray(data.placed)||!data.gathered||typeof data.gathered!=='object')return false;
  for(const n of nodes)if(Number.isInteger(data.gathered[n.id])&&data.gathered[n.id]>0)gathered[n.id]=data.gathered[n.id];
  for(const p of data.placed.slice(0,24))if(['campfire','tent'].includes(p.kind)&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&canPlace(p.kind,p.x,p.y))placed.push({kind:p.kind,x:Math.floor(p.x)+.5,y:Math.floor(p.y)+.5});
  return true;
 }
 return {nodes,placed,visibleNodes,nearbyNode,gather,canPlace,place,nearby,snapshot,restore};
}
root.KingdomCamp={create};
})(window);
