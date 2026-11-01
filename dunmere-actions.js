// Local, finite resource interactions and quest completion. No server dependency.
(function(global){"use strict";
function create(world,dialogue){
 const state={charcoal:0,collected:false,delivered:false,reward:0};
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
 function snapshot(){return {...state}}
 function restore(data){if(!data||typeof data!=="object")return false;state.collected=data.collected===true;state.delivered=data.delivered===true;state.charcoal=state.delivered?0:state.collected?Math.max(0,Math.min(3,Number.isInteger(data.charcoal)?data.charcoal:3)):0;return true}
 return {node,collect,deliver,discardCharcoal,snapshot,restore,get charcoal(){return state.charcoal}};
}
global.KingdomActions={create};
})(window);
