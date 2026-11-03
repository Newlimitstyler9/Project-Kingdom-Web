// Grid bag v1: data-driven 2-bit (four-color) pixel icons, touch drag, tap-select, context actions.
(function(global){"use strict";
const defs=global.KingdomItemCatalog.defs;
const COLS=5,ROWS=4,SLOTS=COLS*ROWS;
function create(actions,options={}){
 let slots=Array(SLOTS).fill(null),equipped=null,ground=[],version=1;
 function add(id,count){if(!defs[id]||defs[id].portable===false||!Number.isInteger(count)||count<=0)return false;const copy=slots.map(s=>s?{...s}:null);let left=count;for(let i=0;i<SLOTS;i++)if(copy[i]?.id===id&&copy[i].count<defs[id].stack){let n=Math.min(left,defs[id].stack-copy[i].count);copy[i].count+=n;left-=n;if(!left)break}for(let i=0;i<SLOTS&&left;i++)if(!copy[i]){let n=Math.min(left,defs[id].stack);copy[i]={id,count:n};left-=n}if(left)return false;slots=copy;return true}
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
 function restore(data){if(!data||data.version!==1||!Array.isArray(data.slots)||data.slots.length!==SLOTS)return false;const clean=data.slots.map(s=>s&&defs[s.id]&&defs[s.id].portable!==false&&Number.isInteger(s.count)&&s.count>0&&s.count<=defs[s.id].stack?{id:s.id,count:s.count}:null);slots=clean;equipped=typeof data.equipped==="string"&&defs[data.equipped]?.slot&&defs[data.equipped].portable!==false?data.equipped:null;ground=Array.isArray(data.ground)?data.ground.filter(x=>defs[x.id]&&defs[x.id].portable!==false&&x.count===1).slice(0,50):[];reconcile();return true}
 function pixel(id){const d=defs[id];let rects="";d.art.forEach((line,y)=>[...line].forEach((c,x)=>{if(c!=="."&&Number(c)>0)rects+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+d.palette[Number(c)]+'"/>'}));return '<svg viewBox="0 0 16 13" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'+rects+'</svg>'}
 return {defs,add,count,takeItem,move,act,take,reconcile,snapshot,restore,pixel,get slots(){return slots.map(x=>x?{...x}:null)},get equipped(){return equipped},get ground(){return ground.slice()},get weight(){return slots.reduce((n,s)=>n+(s?s.count*defs[s.id].weight:0),0)}};
}
global.KingdomBag={create};
})(window);
