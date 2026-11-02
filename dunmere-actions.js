// Local, finite resource interactions and quest completion. No server dependency.
(function(global){"use strict";
function create(world,dialogue){
 const state={charcoal:0,collected:false,delivered:false,reward:0,farmWork:0,farmDone:false};
 const node={x:27.5,y:22.5,quantity:3};
 function collect(x,y){
  if(Math.hypot(x-node.x,y-node.y)>1.8)return {ok:false,message:"Move closer to the charcoal sacks."};
  if(state.collected)return {ok:false,message:"The charcoal sacks have already been collected."};
  state.collected=true;state.charcoal+=node.quantity;
  return {ok:true,message:"You gathered 3 charcoal from the abandoned supply cache. Bring them to Aldric."};
 }
 function deliver(id){
  if(world.residents[id]?.name!=="Aldric")return {ok:false,message:"This delivery is meant for Aldric."};
  const s=dialogue.get(id),promise=s.promises.find(p=>p.subject==="charcoal deliveries"&&!p.fulfilled);
  if(!promise)return {ok:false,message:"You haven't agreed to help Aldric with charcoal."};
  if(state.delivered||state.charcoal<3)return {ok:false,message:"You need three charcoal to complete this delivery."};
  state.charcoal-=3;state.delivered=true;promise.fulfilled=true;promise.completedDay=world.snapshot().day;
  s.trust+=12;s.respect+=6;s.familiarity+=4;
  s.memories.unshift({day:world.snapshot().day,type:"fulfilled",detail:"Traveler delivered three charcoal to the forge."});
  // Charcoal is a finite physical delivery. No unbacked coin reward.
  return {ok:true,message:"Aldric takes the charcoal. 'You kept your word. I'll remember that.' Trust +12, respect +6."};
 }
 function discardCharcoal(n){if(!Number.isInteger(n)||n<=0||state.charcoal<n)return false;state.charcoal-=n;return true}
 function workFarm(x,y,food,bag){
  if(x<3||x>12||y<16||y>23)return {ok:false,message:"Work at the western fields."};
  const promise=dialogue.get(1).promises.find(p=>p.subject==="farm labor"&&!p.fulfilled);
  if(!promise)return {ok:false,message:"Talk to Marta and agree to help with the farm first."};
  if(state.farmDone)return {ok:false,message:"Your field work for Marta is complete."};
  if(state.farmWork<2){state.farmWork++;return {ok:true,message:["You weed the grain rows. One of three field tasks complete.","You clear the irrigation furrow. Two of three field tasks complete."][state.farmWork-1]}}
  if(!food.withdraw("bread",1))return {ok:false,message:"The village pantry has no bread to pay you yet."};
  if(!bag.add("bread",1)){food.transferIn("bread",1);return {ok:false,message:"Your bag is full. Make room for a loaf."}}
  state.farmWork=3;state.farmDone=true;promise.fulfilled=true;promise.completedDay=world.snapshot().day;
  const relation=dialogue.get(1);relation.trust+=8;relation.respect+=5;
  relation.memories.unshift({day:world.snapshot().day,type:"fulfilled",detail:"Traveler tended the western fields for Marta."});
  return {ok:true,message:"You finish tending the grain. Marta sends you a loaf from the village pantry. Bread +1, trust +8, respect +5."};
 }
 function snapshot(){return {...state}}
 function restore(data){if(!data||typeof data!=="object")return false;state.collected=data.collected===true;state.delivered=data.delivered===true;state.charcoal=state.delivered?0:state.collected?Math.max(0,Math.min(3,Number.isInteger(data.charcoal)?data.charcoal:3)):0;state.farmWork=Math.max(0,Math.min(3,Number.isInteger(data.farmWork)?data.farmWork:0));state.farmDone=data.farmDone===true;return true}
 return {node,collect,deliver,discardCharcoal,workFarm,snapshot,restore,get charcoal(){return state.charcoal}};
}
global.KingdomActions={create};
})(window);
