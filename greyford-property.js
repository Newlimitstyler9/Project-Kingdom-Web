// Persistent, owned goods for Greyford's bakery and households.
(function(root){'use strict';
const households={
 'vell-house':{bread:2,cloth:2},'pell-house':{bread:2,cloth:1},'reed-house':{bread:2,stick:2},
 'forge-house':{bread:2,leather:1},'clerk-house':{bread:2,cloth:1},'guard-barracks':{bread:4,wood:2},
 'tanner-house':{bread:1,leather:2},'mason-house':{bread:1,stone:2},'fen-house':{bread:2,cloth:1},
 'dyer-house':{bread:1,cloth:2},'bridge-row-a':{bread:2,flour:2},'bridge-row-b':{bread:1,cloth:1},
 'east-row-a':{bread:1,wood:2},'east-row-b':{bread:2,grain:2},'south-croft-two':{bread:1,wood:1},
 'south-croft-three':{bread:1,grain:2},'south-croft':{bread:2,cloth:1},'market-inn':{bread:3,ale:2}
};
const homeIds=new Set(root.GreyfordWorld.homes.map(h=>h.id));
const shops={
 'market-inn':{keeper:'nellis',hours:[8,23],goods:{bread:{buy:3,sell:1},ale:{buy:4,sell:1}},initial:{bread:8,ale:7},till:24},
 stable:{keeper:'rinna',hours:[7,18],goods:{torch:{buy:5,sell:2},bedroll:{buy:12,sell:5},leather:{buy:6,sell:3},wood:{buy:3,sell:1}},initial:{torch:3,bedroll:2,leather:4,wood:6},till:18},
 weaver:{keeper:'yseld',hours:[8,18],goods:{roughTunic:{buy:13,sell:5},travelTrousers:{buy:11,sell:4},cloth:{buy:5,sell:2},fiber:{buy:2,sell:1}},initial:{roughTunic:2,travelTrousers:2,cloth:7,fiber:5},till:20},
 apothecary:{keeper:'beren',hours:[8,18],goods:{herbalDraught:{buy:9,sell:3},cloth:{buy:6,sell:2},fiber:{buy:3,sell:1}},initial:{herbalDraught:4,cloth:4,fiber:6},till:14}
};
function freshShops(){return Object.fromEntries(Object.entries(shops).map(([id,rule])=>[id,{...rule.initial,till:rule.till}]))}
function create(bag,purse){
 const state={version:2,bakery:{bread:6,flour:8,wood:4,till:8,lastBakeAt:-1},homes:structuredClone(households),shops:freshShops(),thefts:[],nextTheft:1};
 function stock(id){return id==='bakery'?{...state.bakery}:shops[id]?{...state.shops[id]}:homeIds.has(id)?{...state.homes[id]}:null}
 function shopInfo(id){const rule=shops[id];return rule?{keeper:rule.keeper,hours:[...rule.hours],goods:structuredClone(rule.goods),stock:stock(id)}:null}
 function trade(id,side,item){
  const rule=shops[id],ledger=state.shops[id],offer=rule?.goods[item],def=root.KingdomItemCatalog.defs[item];
  if(!offer||!def||!['buy','sell'].includes(side))return {ok:false,message:'That trade is not offered here.'};
  const price=offer[side];
  if(side==='buy'){
   if(ledger[item]<1)return {ok:false,message:'That item is sold out.'};
   if(purse.snapshot().coins<price)return {ok:false,message:'You need '+price+' copper.'};
   const before=bag.snapshot(),kept=ledger.pieces?.[item]?.at(-1);
   const meta=def.stack===1?{...(kept||{uid:'greyford-piece-'+state.nextTheft,maker:id==='weaver'?'Yseld Dyer':id==='stable'?'Rinna Voss':id==='apothecary'?'Beren Fen':'Nellis Vale',quality:2}),owner:'player'}:null;
   if(!bag.add(item,1,meta))return {ok:false,message:'Your bag is full.'};
   if(!purse.debit(price)){bag.restore(before);return {ok:false,message:'Payment failed.'}}
   ledger[item]--;ledger.till+=price;
   if(meta){if(kept)ledger.pieces[item].pop();else state.nextTheft++}
   return {ok:true,message:'Bought '+def.name.toLowerCase()+' for '+price+' copper.'};
  }
  if(ledger.till<price)return {ok:false,message:'The shop has only '+ledger.till+' copper in its till.'};
  const slot=bag.slots.findIndex(entry=>entry?.id===item&&!entry.meta?.stolenFrom);
  if(slot<0)return {ok:false,message:'You have no legally owned '+def.name.toLowerCase()+' in your bag.'};
  const before=bag.snapshot(),sold=bag.slots[slot];
  if(!bag.take(slot,1))return {ok:false,message:'The item could not be moved.'};
  if(!purse.credit(price)){bag.restore(before);return {ok:false,message:'Payment failed.'}}
  ledger[item]++;ledger.till-=price;
  if(def.stack===1&&sold.meta){ledger.pieces??={};(ledger.pieces[item]??=[]).push({...sold.meta,uid:sold.meta.uid||'greyford-piece-'+state.nextTheft++,owner:'greyford:'+id})}
  return {ok:true,message:'Sold '+def.name.toLowerCase()+' for '+price+' copper.'};
 }
 function buyBread(){if(state.bakery.bread<1)return {ok:false,message:'Jessa has no bread left on the counter.'};if(purse.snapshot().coins<2)return {ok:false,message:'You need 2 copper for a loaf.'};const before=bag.snapshot();if(!bag.add('bread',1))return {ok:false,message:'Your bag is full.'};if(!purse.debit(2)){bag.restore(before);return {ok:false,message:'The payment could not be completed.'}}state.bakery.bread--;state.bakery.till+=2;return {ok:true,message:'Bought a loaf from Jessa for 2 copper. '+state.bakery.bread+' remain.'}}
 function sellSupply(item){if(!['flour','wood'].includes(item))return {ok:false,message:'Jessa is not buying that supply.'};if(state.bakery.till<1)return {ok:false,message:'Jessa has no copper left in her till.'};const slot=bag.slots.findIndex(s=>s?.id===item&&!s.meta?.stolenFrom);if(slot<0)return {ok:false,message:'You have no legally owned '+item+' in your pack.'};const before=bag.snapshot();if(!bag.take(slot,1))return {ok:false,message:'The supply could not be moved.'};if(!purse.credit(1)){bag.restore(before);return {ok:false,message:'The payment could not be completed.'}}state.bakery[item]++;state.bakery.till--;return {ok:true,message:'Sold one '+item+' to Jessa for 1 copper.'}}
 function bake(at,working){if(!working||at<=state.bakery.lastBakeAt)return false;state.bakery.lastBakeAt=at;const hour=at%24;if(hour<7||hour>=17||state.bakery.bread>=10||state.bakery.flour<1||state.bakery.wood<1)return false;state.bakery.flour--;state.bakery.bread++;if(hour%3===0)state.bakery.wood--;return true}
 function take(id,item,{sneaking=false,at=-1,witnesses=[]}={}){const source=id==='bakery'?state.bakery:shops[id]?state.shops[id]:state.homes[id];if(!source||!root.KingdomItemCatalog.defs[item]||!Number.isInteger(source[item])||source[item]<1)return {ok:false,message:'That item is not here.'};if(!sneaking)return {ok:false,message:'These goods belong to someone else. Crouch to try taking one.'};const uid='greyford-property-'+state.nextTheft;if(!bag.add(item,1,{uid,owner:'greyford:'+id,stolenFrom:'greyford:'+id,stolenAt:at}))return {ok:false,message:'Your bag is full.'};source[item]--;const found=[...new Set(witnesses.filter(w=>root.GreyfordWorld.people.some(p=>p.id===w)))];const theft={uid:'greyford-property-'+state.nextTheft++,building:id,id:item,at,witnesses:found,identified:found.length>0,detectedAt:found.length?at:null,reportedAt:null,resolvedAt:null};state.thefts.push(theft);return {ok:true,theft:{...theft,witnesses:[...found]},message:found.length?'Someone saw you take '+root.KingdomItemCatalog.defs[item].name.toLowerCase()+'.':'You took '+root.KingdomItemCatalog.defs[item].name.toLowerCase()+'. No one reacted.'}}
 function detect(at,present){const found=state.thefts.filter(t=>t.detectedAt===null&&t.resolvedAt===null&&present(t.building));for(const t of found)t.detectedAt=at;return found.map(t=>({...t,witnesses:[...t.witnesses]}))}
 function pendingReports(){return state.thefts.filter(t=>t.detectedAt!==null&&t.reportedAt===null).map(t=>({...t,witnesses:[...t.witnesses]}))}
 function markReported(uid,at){const theft=state.thefts.find(t=>t.uid===uid&&t.reportedAt===null);if(!theft)return false;theft.reportedAt=at;return true}
 function restitution(){return state.thefts.filter(t=>t.identified&&t.reportedAt!==null&&t.resolvedAt===null).reduce((sum,t)=>sum+(t.id==='bread'?2:4)+4,0)}
 function settle(at){const due=restitution();if(!due)return {ok:false,message:'No identified property complaint is awaiting payment.'};if(!purse.debit(due))return {ok:false,message:'The guard asks for '+due+' copper in restitution and fines.'};for(const t of state.thefts)if(t.identified&&t.reportedAt!==null&&t.resolvedAt===null)t.resolvedAt=at;return {ok:true,message:'You paid '+due+' copper to settle the property complaint.'}}
 function snapshot(){return {version:2,bakery:{...state.bakery},homes:structuredClone(state.homes),shops:structuredClone(state.shops),thefts:state.thefts.map(t=>({...t,witnesses:[...t.witnesses]})),nextTheft:state.nextTheft}}
 function restore(data){if(!data||![1,2].includes(data.version)||!data.bakery||!data.homes||!Array.isArray(data.thefts)||!Number.isInteger(data.nextTheft)||data.nextTheft<1||data.thefts.length>200)return false;for(const key of ['bread','flour','wood','till'])if(!Number.isInteger(data.bakery[key])||data.bakery[key]<0)return false;if(!Number.isInteger(data.bakery.lastBakeAt))return false;for(const [id,items] of Object.entries(households))for(const item of Object.keys(items))if(!Number.isInteger(data.homes[id]?.[item])||data.homes[id][item]<0)return false;if(data.thefts.some(t=>!homeIds.has(t.building)&&!shops[t.building]&&t.building!=='bakery'||!root.KingdomItemCatalog.defs[t.id]||!Array.isArray(t.witnesses)||!Number.isInteger(t.at)||typeof t.uid!=='string'))return false;if(data.version===2)for(const [id,rule] of Object.entries(shops)){const entry=data.shops?.[id];if(!entry||Object.keys({...rule.initial,till:0}).some(item=>!Number.isInteger(entry[item])||entry[item]<0||entry[item]>100000)||Object.entries(entry.pieces||{}).some(([item,pieces])=>!rule.initial.hasOwnProperty(item)||!Array.isArray(pieces)||pieces.length>entry[item]||pieces.some(piece=>!piece||typeof piece.uid!=='string'||!(/^(?:greyford-piece|ash-piece)-[1-9]\d*$/.test(piece.uid)))))return false}state.bakery={...data.bakery};state.homes=structuredClone(data.homes);state.shops=data.version===2?structuredClone(data.shops):freshShops();if(data.version===1){for(const item of ['bread','ale'])state.shops['market-inn'][item]=data.homes['market-inn'][item]}state.thefts=data.thefts.map(t=>({...t,witnesses:[...t.witnesses]}));state.nextTheft=data.nextTheft;return true}
 return {stock,shopInfo,trade,buyBread,sellSupply,bake,take,detect,pendingReports,markReported,restitution,settle,snapshot,restore};
}
root.KingdomGreyfordProperty={create};
})(window);
