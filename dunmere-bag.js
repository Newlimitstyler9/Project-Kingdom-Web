// Grid bag v1: data-driven 2-bit (four-color) pixel icons, touch drag, tap-select, context actions.
(function(global){"use strict";
const defs={
 charcoal:{name:"Charcoal",type:"material",stack:20,weight:.4,art:["................","......111.......","....112211......","...12222211.....","..1223332211....","..1233333221....","..1233233221....","..1223333221....","...122332211....","....112221......","......111.......","................"],palette:["#00000000","#101415","#252a2b","#454b4c"]},
 bread:{name:"Bread",type:"food",stack:10,weight:.3,nutrition:20,art:["................","......111.......","....122221......","...12222221.....","..1223223221....","..1232223221....","..1222222221....","...12222221.....","....111111......","................"],palette:["#00000000","#4a3327","#b07a42","#e8bd78"]},
 ale:{name:"Ale cup",type:"drink",stack:10,weight:.5,art:["................","...11111111.....","...12222221.11..","...12333321.121.","...12333321.121.","...12333321.11..","...12333321.....","....122221......",".....1111.......","................"],palette:["#00000000","#493522","#9d6a35","#ddad59"]},
 axe:{name:"Stone axe",type:"tool",stack:1,weight:1.6,slot:"hand",art:["....111.........","...122211.......","..12222211......","..12332221......","...122221.......","....1112........",".......2........",".......2........",".......2........",".......2........",".......2........",".......2........","................"],palette:["#00000000","#2c3535","#8e9690","#d3d3bf"]},
 stick:{name:"Stick",type:"material",stack:20,weight:.2,art:["................","............1...","...........12...","..........12....",".........12.....","........12......",".......12.......","......12........",".....12.........","....12..........","...12...........","..11............"],palette:["#00000000","#453528","#99734a","#d1aa73"]}
};
for(const [id,name,weight] of [["wood","Wood",.8],["stone","Stone",.9],["seed","Grain seed",.05],["grain","Grain",.2],["pick","Stone pick",1.5],["hoe","Wooden hoe",1.2]])defs[id]={name,type:id==="pick"||id==="hoe"?"tool":"material",slot:id==="pick"||id==="hoe"?"hand":undefined,stack:id==="pick"||id==="hoe"?1:20,weight,art:["................",".....1111.......","....122221......","...12333321.....","...12333321.....","....122221......",".....1111.......","................"],palette:["#00000000","#3d332a","#92764d","#c4a477"]};
const itemArt={
 wood:["................","..111111111111..","..122222222221..","..123323323321..","..122222222221..","..111111111111..","................"],
 stone:["................",".....11111......","...112222211....","..1223333221....","...12222221.....",".....1111.......","................"],
 seed:["................","....1....1......","...121..121.....","....2....2......","......121.......",".......2........","................"],
 grain:["................","......1.........",".....121........","....12121.......","...1212121......","....12121.......",".....121........","......1.........","................"],
 hoe:["........1111....",".....1112221....","...11122211.....","......11........","......2.........","......2.........","......2.........","......2.........","......2.........","................"],
 pick:["..111111111.....","...1222221......",".....111........","......2.........","......2.........","......2.........","......2.........","......2.........","................"]
};
for(const [id,art] of Object.entries(itemArt))defs[id].art=art;
for(const id of ["wood","seed","grain"])defs[id].palette=["#00000000","#483423","#98704a","#d9b675"];
for(const id of ["stone","pick"])defs[id].palette=["#00000000","#30383a","#838b88","#c1c5b9"];
const COLS=5,ROWS=4,SLOTS=COLS*ROWS;
function create(actions,options={}){
 let slots=Array(SLOTS).fill(null),equipped=null,ground=[],version=1;
 function add(id,count){if(!defs[id]||!Number.isInteger(count)||count<=0)return false;const copy=slots.map(s=>s?{...s}:null);let left=count;for(let i=0;i<SLOTS;i++)if(copy[i]?.id===id&&copy[i].count<defs[id].stack){let n=Math.min(left,defs[id].stack-copy[i].count);copy[i].count+=n;left-=n;if(!left)break}for(let i=0;i<SLOTS&&left;i++)if(!copy[i]){let n=Math.min(left,defs[id].stack);copy[i]={id,count:n};left-=n}if(left)return false;slots=copy;return true}
 function count(id){return slots.reduce((n,s)=>n+(s?.id===id?s.count:0),0)+(equipped===id?1:0)}
 function takeItem(id,n){if(!Number.isInteger(n)||n<1||count(id)<n)return false;let left=n;for(let i=SLOTS-1;i>=0&&left;i--){if(slots[i]?.id!==id)continue;const qty=Math.min(left,slots[i].count);take(i,qty);left-=qty}if(left&&equipped===id){equipped=null;left--}return left===0}
 function move(from,to){if(from===to)return true;if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=SLOTS||to>=SLOTS||!slots[from])return false;let a=slots[from],b=slots[to];if(b?.id===a.id){let n=Math.min(a.count,defs[a.id].stack-b.count);b.count+=n;a.count-=n;if(!a.count)slots[from]=null;return n>0}slots[from]=b;slots[to]=a;return true}
 function take(slot,count){const item=slots[slot];if(!item||count<=0||count>item.count)return false;item.count-=count;if(!item.count)slots[slot]=null;return true}
 function act(slot,action){const item=slots[slot];if(!item)return {ok:false,message:"Empty slot."};const def=defs[item.id];
 if(action==="drop"){if(!take(slot,1))return {ok:false};ground.push({id:item.id,count:1});return {ok:true,message:"Dropped one "+def.name.toLowerCase()+"."}}
 if(action==="eat"){if(def.type!=="food")return {ok:false,message:"This item isn't edible."};take(slot,1);return {ok:true,nutrition:def.nutrition,message:"You ate "+def.name.toLowerCase()+"."}}
 if(action==="drink"){if(def.type!=="drink")return {ok:false,message:"This item isn't a drink."};take(slot,1);return {ok:true,message:"You drank a cup of ale."}}
 if(action==="equip"){if(!def.slot)return {ok:false,message:"This item cannot be equipped."};if(equipped!==null){if(!add(equipped,1))return {ok:false,message:"No room to unequip your current tool."}}equipped=item.id;take(slot,1);return {ok:true,message:"Equipped "+def.name+"."}}
 return {ok:false,message:"Unknown action."}}
 function reconcile(){const amount=actions.charcoal;const actual=slots.reduce((n,s)=>n+(s?.id==="charcoal"?s.count:0),0);if(amount>actual)add("charcoal",amount-actual);else if(amount<actual){let remaining=actual-amount;for(let i=SLOTS-1;i>=0&&remaining;i--)if(slots[i]?.id==="charcoal"){let n=Math.min(remaining,slots[i].count);take(i,n);remaining-=n}}}
 function snapshot(){return {version,slots:slots.map(s=>s?{...s}:null),equipped,ground:ground.map(x=>({...x}))}}
 function restore(data){if(!data||data.version!==1||!Array.isArray(data.slots)||data.slots.length!==SLOTS)return false;const clean=data.slots.map(s=>s&&defs[s.id]&&Number.isInteger(s.count)&&s.count>0&&s.count<=defs[s.id].stack?{id:s.id,count:s.count}:null);slots=clean;equipped=typeof data.equipped==="string"&&defs[data.equipped]?.slot?data.equipped:null;ground=Array.isArray(data.ground)?data.ground.filter(x=>defs[x.id]&&x.count===1).slice(0,50):[];reconcile();return true}
 function pixel(id){const d=defs[id];let rects="";d.art.forEach((line,y)=>[...line].forEach((c,x)=>{if(c!=="."&&Number(c)>0)rects+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+d.palette[Number(c)]+'"/>'}));return '<svg viewBox="0 0 16 13" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'+rects+'</svg>'}
 return {defs,add,count,takeItem,move,act,take,reconcile,snapshot,restore,pixel,get slots(){return slots.map(x=>x?{...x}:null)},get equipped(){return equipped},get ground(){return ground.slice()},get weight(){return slots.reduce((n,s)=>n+(s?s.count*defs[s.id].weight:0),0)}};
}
global.KingdomBag={create};
})(window);
