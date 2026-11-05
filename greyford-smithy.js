// Ash Smithy: finite materials, front and back stock, paid orders, and timed work.
(function(root){"use strict";
const GOODS={ironAxe:{price:8,hours:2},ironSword:{price:12,hours:3},ironShield:{price:14,hours:3},ironKettleHelm:{price:10,hours:3}};
const BUY_MATERIAL={ironOre:1,charcoal:1,wood:1,ironIngot:3,leather:2};
const SELL_MATERIAL={ironOre:{price:2},charcoal:{price:2},wood:{price:2},ironIngot:{price:5},leather:{price:4}};
const MATERIALS=['ironOre','charcoal','wood','ironIngot','leather'];
function create(bag,purse){
 const state={version:3,materials:{ironOre:12,charcoal:8,wood:8,ironIngot:4,leather:2},pieces:[],nextPiece:1,till:24,orders:[],active:null,nextOrder:1,lastWorkAt:-1,thefts:[]};
 const seed={display:{ironAxe:1,ironShield:1,ironKettleHelm:1},chest:{ironAxe:1,ironSword:1}};
 function makePiece(id,location,at=-1){const piece={uid:'ash-piece-'+state.nextPiece++,id,location,quality:2,condition:100,maker:'Brann Ash',owner:'ash-smithy',madeAt:at};state.pieces.push(piece);return piece}
 for(const [location,goods] of Object.entries(seed))for(const [id,qty] of Object.entries(goods))for(let n=0;n<qty;n++)makePiece(id,location);
 function pieces(id,location){return state.pieces.filter(p=>(!id||p.id===id)&&(!location||p.location===location)).map(p=>({...p}))}
 const count=(id,location)=>state.pieces.filter(p=>p.id===id&&(!location||p.location===location)).length;
 const recipe=id=>root.KingdomCraft.production[id];
 const name=id=>root.KingdomItemCatalog.defs[id]?.name||id;
 function requirements(id){const r=recipe(id);return {...r.ingredients,...(r.fuel||{})}}
 function missing(id){return Object.entries(requirements(id)).filter(([part,qty])=>(state.materials[part]||0)<qty).map(([part,qty])=>qty+' '+name(part).toLowerCase())}
 function canMake(id){return missing(id).length===0}
 function order(id){
  if(!GOODS[id])return {ok:false,message:'Brann does not make that here.'};
  if(state.orders.filter(o=>o.status!=='collected').length>=5)return {ok:false,message:'The order book is full for now.'};
  const cost=GOODS[id].price;if(!purse.debit(cost))return {ok:false,message:'You need '+cost+' copper to pay for the order.'};
  state.till+=cost;const number=state.nextOrder++;const o={id:'ash-'+number,item:id,status:'queued',placedAt:state.lastWorkAt,readyAt:null};
  state.orders.push(o);
  return {ok:true,message:'Sella writes commission #'+number+' in the book. Brann will make a new '+name(id).toLowerCase()+' when materials and time allow.'};
 }
 function available(id){return SELL_MATERIAL[id]?(state.materials[id]||0):count(id,'display')+count(id,'chest')}
 function steal(uid,{sneaking=false,at=-1,witnesses=[]}={}){
  const piece=state.pieces.find(p=>p.uid===uid&&p.location==='chest');
  if(!piece)return {ok:false,message:'That piece is not in the stock chest.'};
  if(!sneaking)return {ok:false,message:'You need to crouch before trying to take stock.'};
  if(!bag.add(piece.id,1,{uid:piece.uid,quality:piece.quality,condition:piece.condition,maker:piece.maker,owner:piece.owner,stolenFrom:'ash-smithy',stolenAt:at}))return {ok:false,message:'Your bag has no room for it.'};
  state.pieces=state.pieces.filter(p=>p.uid!==uid);
  const seen=[...new Set(witnesses.filter(id=>typeof id==='string'))];
  const theft={uid:piece.uid,id:piece.id,at,witnesses:seen,identified:seen.length>0,detectedAt:seen.length?at:null,reportedAt:null,resolvedAt:null};
  state.thefts.push(theft);
  return {ok:true,theft:{...theft},message:seen.length?'Someone saw you take '+name(piece.id).toLowerCase()+'.':'You took '+name(piece.id).toLowerCase()+'. No one reacted.'};
 }
 function detectThefts(at,staffPresent){
  if(!staffPresent)return [];
  const found=state.thefts.filter(t=>t.detectedAt===null);
  for(const theft of found)theft.detectedAt=at;
  return found.map(t=>({...t}));
 }
 function pendingReports(){return state.thefts.filter(t=>t.detectedAt!==null&&t.reportedAt===null).map(t=>({...t,witnesses:[...t.witnesses]}))}
 function markReported(uid,at){const theft=state.thefts.find(t=>t.uid===uid&&t.reportedAt===null);if(!theft)return false;theft.reportedAt=at;return true}
 function restitution(){const open=state.thefts.filter(t=>t.identified&&t.reportedAt!==null&&t.resolvedAt===null);return open.reduce((sum,t)=>sum+(GOODS[t.id]?.price||0)+4,0)}
 function settleThefts(at){const due=restitution();if(!due)return {ok:false,message:'No identified smithy theft is awaiting restitution.'};if(!purse.debit(due))return {ok:false,message:'The bailiff demands '+due+' copper in restitution and fines.'};for(const t of state.thefts)if(t.identified&&t.reportedAt!==null&&t.resolvedAt===null)t.resolvedAt=at;state.till+=due;return {ok:true,message:'You paid '+due+' copper. The Ash family has been compensated; the complaint is settled.'}}
 function trade(basket){
  const buys=basket?.buy||{},sells=basket?.sell||{};
  if(!Object.keys(buys).length&&!Object.keys(sells).length)return {ok:false,message:'Choose goods to buy or sell first.'};
  let cost=0,payout=0;
  for(const [id,n] of Object.entries(buys)){const offer=GOODS[id]||SELL_MATERIAL[id];if(!offer||!Number.isInteger(n)||n<1||n>available(id))return {ok:false,message:'That stock is no longer available.'};cost+=offer.price*n}
  for(const [id,n] of Object.entries(sells)){if(!BUY_MATERIAL[id]||!Number.isInteger(n)||n<1||n>bag.slots.reduce((sum,slot)=>sum+(slot?.id===id?slot.count:0),0))return {ok:false,message:'You do not have those goods in your pack.'};payout+=BUY_MATERIAL[id]*n}
  const net=cost-payout;
  if(net>purse.snapshot().coins)return {ok:false,message:'You need '+net+' copper after your sales.'};
  if(net<0&&state.till< -net)return {ok:false,message:'The smithy till cannot cover that sale.'};
  const nextWeight=bag.weight+Object.entries(buys).reduce((sum,[id,n])=>sum+root.KingdomItemCatalog.defs[id].weight*n,0)-Object.entries(sells).reduce((sum,[id,n])=>sum+root.KingdomItemCatalog.defs[id].weight*n,0);
  if(nextWeight>bag.capacity+.0001)return {ok:false,message:'Your pack would be over its carry limit.'};
  const before=bag.snapshot();
  for(const [id,n] of Object.entries(sells))if(!bag.takeItem(id,n)){bag.restore(before);return {ok:false,message:'The sale could not be completed.'}}
  const moved=[];
  for(const [id,n] of Object.entries(buys))for(let i=0;i<n;i++){
   const piece=GOODS[id]?state.pieces.find(p=>p.id===id&&!moved.includes(p.uid)&&['display','chest'].includes(p.location)):null;
   if(piece)moved.push(piece.uid);
   if(!bag.add(id,1,piece?{uid:piece.uid,quality:piece.quality,condition:piece.condition,maker:piece.maker,owner:'player'}:null)){bag.restore(before);return {ok:false,message:'Make space in your pack before trading.'}}
  }
  if(net>0&&!purse.debit(net)){bag.restore(before);return {ok:false,message:'You need '+net+' copper.'}}
  if(net<0&&!purse.credit(-net)){bag.restore(before);return {ok:false,message:'The payment could not be completed.'}}
  for(const [id,n] of Object.entries(buys))if(SELL_MATERIAL[id])state.materials[id]-=n;
  state.pieces=state.pieces.filter(p=>!moved.includes(p.uid));
  for(const [id,n] of Object.entries(sells))state.materials[id]+=n;
  state.till+=net;
  return {ok:true,message:net>0?'Trade settled: paid '+net+' copper.':net<0?'Trade settled: received '+(-net)+' copper.':'Trade settled with an even exchange.'};
 }
 function collect(id){const o=state.orders.find(v=>v.id===id);if(!o||o.status!=='ready')return {ok:false,message:'That order is not ready.'};
  const piece=state.pieces.find(p=>p.uid===o.pieceUid&&p.location==='commission');if(!piece)return {ok:false,message:'Sella cannot find that commissioned piece.'};
  if(!bag.add(o.item,1,{uid:piece.uid,quality:piece.quality,condition:piece.condition,maker:piece.maker,owner:'player'}))return {ok:false,message:'Your bag is full; Sella keeps your order safe.'};
  state.pieces=state.pieces.filter(p=>p.uid!==piece.uid);o.status='collected';return {ok:true,message:'Collected '+name(o.item).toLowerCase()+' from Sella.'};
 }
 function nextJob(){
  const order=state.orders.find(o=>o.status==='queued');let item=order?.item;
  if(!item)item=Object.keys(GOODS).find(id=>count(id,'display')<1&&count(id,'chest')<2);
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
  else if(job.orderId){const o=state.orders.find(v=>v.id===job.orderId);if(o){const piece=makePiece(job.item,'commission',at);o.status='ready';o.readyAt=at;o.pieceUid=piece.uid}else makePiece(job.item,'chest',at)}
  else makePiece(job.item,count(job.item,'display')<1?'display':'chest',at);
  return true;
 }
 function snapshot(){return {version:3,materials:{...state.materials},pieces:state.pieces.map(p=>({...p})),nextPiece:state.nextPiece,front:Object.fromEntries(Object.keys(GOODS).map(id=>[id,count(id,'display')])),back:Object.fromEntries(Object.keys(GOODS).map(id=>[id,count(id,'chest')])),till:state.till,orders:state.orders.map(o=>({...o})),active:state.active?{...state.active}:null,nextOrder:state.nextOrder,lastWorkAt:state.lastWorkAt,thefts:state.thefts.map(t=>({...t,witnesses:[...t.witnesses]}))}}
 function restore(data){
  if(!data||![1,2,3].includes(data.version)||!Number.isInteger(data.till)||data.till<0||!Number.isInteger(data.nextOrder)||data.nextOrder<1||!Number.isInteger(data.lastWorkAt))return false;
  // Older saves had only axes and swords; keep their counts while adding new stock types.
  for(const bucket of ['materials','front','back'])for(const id of bucket==='materials'?MATERIALS:Object.keys(GOODS))if(data[bucket]?.[id]!==undefined&&(!Number.isInteger(data[bucket][id])||data[bucket][id]<0))return false;
  if(data.version>=2&&(!Array.isArray(data.pieces)||!Number.isInteger(data.nextPiece)||data.nextPiece<1||data.pieces.length>200||data.pieces.some(p=>!GOODS[p.id]||!['display','chest','commission'].includes(p.location)||typeof p.uid!=='string'||!p.uid.startsWith('ash-piece-'))||new Set(data.pieces.map(p=>p.uid)).size!==data.pieces.length))return false;
  if(data.version===3&&(!Array.isArray(data.thefts)||data.thefts.length>100||data.thefts.some(t=>!GOODS[t.id]||typeof t.uid!=='string'||!Array.isArray(t.witnesses)||!Number.isInteger(t.at))))return false;
  if(!Array.isArray(data.orders)||data.orders.length>100||data.orders.some(o=>!GOODS[o.item]||!['queued','working','ready','collected'].includes(o.status)))return false;
  if(data.active&&(!['ironIngot',...Object.keys(GOODS)].includes(data.active.item)||!Number.isInteger(data.active.hoursLeft)||data.active.hoursLeft<1))return false;
  state.materials={...state.materials,...data.materials};
  if(data.version>=2){state.pieces=data.pieces.map(p=>({...p}));state.nextPiece=data.nextPiece}
  else{state.pieces=[];state.nextPiece=1;for(const [bucket,location] of [['front','display'],['back','chest']])for(const id of Object.keys(GOODS))for(let n=0;n<(data[bucket]?.[id]||0);n++)makePiece(id,location);for(const o of data.orders)if(o.status==='ready')o.pieceUid=makePiece(o.item,'commission',o.readyAt).uid}
  state.till=data.till;state.orders=data.orders.map(o=>({...o}));state.active=data.active?{...data.active}:null;state.nextOrder=data.nextOrder;state.lastWorkAt=data.lastWorkAt;state.thefts=data.version===3?data.thefts.map(t=>({...t,witnesses:[...t.witnesses]})):[];return true;
 }
 return {trade,available,pieces,steal,detectThefts,pendingReports,markReported,restitution,settleThefts,order,collect,advance,snapshot,restore,missing,get prices(){return GOODS},get tradePrices(){return {...GOODS,...SELL_MATERIAL}},get materialPrices(){return BUY_MATERIAL}};
}
root.KingdomGreyfordSmithy={create};
})(window);
