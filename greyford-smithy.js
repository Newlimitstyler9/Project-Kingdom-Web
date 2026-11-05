// Ash Smithy: finite materials, front and back stock, paid orders, and timed work.
(function(root){"use strict";
const GOODS={ironAxe:{price:8,hours:2},ironSword:{price:12,hours:3}};
const BUY_MATERIAL={ironOre:1,charcoal:1,wood:1,ironIngot:3};
const MATERIALS=['ironOre','charcoal','wood','ironIngot'];
function create(bag,purse){
 const state={version:1,materials:{ironOre:12,charcoal:8,wood:8,ironIngot:4},front:{ironAxe:1,ironSword:0},back:{ironAxe:1,ironSword:1},till:24,orders:[],active:null,nextOrder:1,lastWorkAt:-1};
 const recipe=id=>root.KingdomCraft.production[id];
 const name=id=>root.KingdomItemCatalog.defs[id]?.name||id;
 function requirements(id){const r=recipe(id);return {...r.ingredients,...(r.fuel||{})}}
 function missing(id){return Object.entries(requirements(id)).filter(([part,qty])=>(state.materials[part]||0)<qty).map(([part,qty])=>qty+' '+name(part).toLowerCase())}
 function canMake(id){return missing(id).length===0}
 function buy(id,source){
  if(!GOODS[id]||!['front','back'].includes(source))return {ok:false,message:'That item is not sold here.'};
  if(state[source][id]<1)return {ok:false,message:'None left in '+(source==='front'?'the display':'back stock')+'.'};
  const cost=GOODS[id].price;if(purse.snapshot().coins<cost)return {ok:false,message:'You need '+cost+' copper.'};
  if(!bag.add(id,1,{quality:2,maker:'Brann Ash'}))return {ok:false,message:'Your bag is full.'};
  if(!purse.debit(cost)){bag.takeItem(id,1);return {ok:false,message:'You need '+cost+' copper.'}}
  state[source][id]--;state.till+=cost;
  return {ok:true,message:'Sella brings you a '+name(id).toLowerCase()+' from '+(source==='front'?'the display':'the back room')+'.'};
 }
 function order(id){
  if(!GOODS[id])return {ok:false,message:'Brann does not make that here.'};
  if(state.orders.filter(o=>o.status!=='collected').length>=5)return {ok:false,message:'The order book is full for now.'};
  const cost=GOODS[id].price;if(!purse.debit(cost))return {ok:false,message:'You need '+cost+' copper to pay for the order.'};
  state.till+=cost;const number=state.nextOrder++;const o={id:'ash-'+number,item:id,status:'queued',placedAt:state.lastWorkAt,readyAt:null};
  if(state.back[id]>0){state.back[id]--;o.status='ready';o.readyAt=state.lastWorkAt}
  state.orders.push(o);
  return {ok:true,message:o.status==='ready'?'Sella reserves one from back stock. Your order is ready to collect.':'Sella writes order #'+number+' in the book. Brann will make it when materials and time allow.'};
 }
 function collect(id){const o=state.orders.find(v=>v.id===id);if(!o||o.status!=='ready')return {ok:false,message:'That order is not ready.'};
  if(!bag.add(o.item,1,{quality:2,maker:'Brann Ash'}))return {ok:false,message:'Your bag is full; Sella keeps your order safe.'};
  o.status='collected';return {ok:true,message:'Collected '+name(o.item).toLowerCase()+' from Sella.'};
 }
 function supply(id){
  const price=BUY_MATERIAL[id];if(!price)return {ok:false,message:'The smithy cannot use that.'};
  if(bag.count(id)<1)return {ok:false,message:'You have no '+name(id).toLowerCase()+'.'};
  if(state.till<price)return {ok:false,message:'The smithy till cannot pay for it.'};
  if(!bag.takeItem(id,1))return {ok:false,message:'Could not remove the material from your bag.'};
  state.materials[id]++;state.till-=price;purse.credit(price);
  return {ok:true,message:'Sella buys one '+name(id).toLowerCase()+' for '+price+' copper.'};
 }
 function nextJob(){
  const order=state.orders.find(o=>o.status==='queued');let item=order?.item;
  if(!item)item=Object.keys(GOODS).find(id=>state.front[id]<1&&state.back[id]<2);
  if(!item)return null;
  if(!canMake(item)){
   const smelt=recipe('ironIngot');
   if((state.materials.ironIngot||0)<(requirements(item).ironIngot||0)&&Object.entries(smelt.ingredients).every(([part,qty])=>state.materials[part]>=qty))item='ironIngot';
   else return null;
  }
  const inputs=requirements(item);for(const [part,qty] of Object.entries(inputs))state.materials[part]-=qty;
  if(order&&item===order.item)order.status='working';
  return {item,orderId:order&&item===order.item?order.id:null,hoursLeft:item==='ironIngot'?2:GOODS[item].hours};
 }
 function advance(day,hour,brannWorking){
  const at=(day-1)*24+hour;if(at<=state.lastWorkAt)return false;state.lastWorkAt=at;
  if(!brannWorking||hour<8||hour>=18)return false;
  if(!state.active)state.active=nextJob();if(!state.active)return false;
  state.active.hoursLeft--;
  if(state.active.hoursLeft>0)return true;
  const job=state.active;state.active=null;
  if(job.item==='ironIngot')state.materials.ironIngot++;
  else if(job.orderId){const o=state.orders.find(v=>v.id===job.orderId);if(o){o.status='ready';o.readyAt=at}else state.back[job.item]++}
  else if(state.front[job.item]<1)state.front[job.item]++;
  else state.back[job.item]++;
  return true;
 }
 function snapshot(){return {version:1,materials:{...state.materials},front:{...state.front},back:{...state.back},till:state.till,orders:state.orders.map(o=>({...o})),active:state.active?{...state.active}:null,nextOrder:state.nextOrder,lastWorkAt:state.lastWorkAt}}
 function restore(data){
  if(!data||data.version!==1||!Number.isInteger(data.till)||data.till<0||!Number.isInteger(data.nextOrder)||data.nextOrder<1||!Number.isInteger(data.lastWorkAt))return false;
  for(const bucket of ['materials','front','back'])for(const id of bucket==='materials'?MATERIALS:Object.keys(GOODS))if(!Number.isInteger(data[bucket]?.[id])||data[bucket][id]<0)return false;
  if(!Array.isArray(data.orders)||data.orders.length>100||data.orders.some(o=>!GOODS[o.item]||!['queued','working','ready','collected'].includes(o.status)))return false;
  if(data.active&&(!['ironIngot',...Object.keys(GOODS)].includes(data.active.item)||!Number.isInteger(data.active.hoursLeft)||data.active.hoursLeft<1))return false;
  for(const bucket of ['materials','front','back'])state[bucket]={...data[bucket]};state.till=data.till;state.orders=data.orders.map(o=>({...o}));state.active=data.active?{...data.active}:null;state.nextOrder=data.nextOrder;state.lastWorkAt=data.lastWorkAt;return true;
 }
 return {buy,order,collect,supply,advance,snapshot,restore,missing,get prices(){return GOODS},get materialPrices(){return BUY_MATERIAL}};
}
root.KingdomGreyfordSmithy={create};
})(window);
