// One physical Marrowfield grain contract. Hours are the town's game clock.
(function(root){"use strict";
const outward=[[55.5,188.5],[55.5,151.5],[55.5,68.5],[55.5,52.5]];
function pointAlong(points,fraction){
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 let remaining=Math.max(0,Math.min(1,fraction))*lengths.reduce((a,b)=>a+b,0);
 for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]||i===lengths.length-1){const t=lengths[i]?remaining/lengths[i]:0;return {x:points[i][0]+(points[i+1][0]-points[i][0])*t,y:points[i][1]+(points[i+1][1]-points[i][1])*t,facing:Math.abs(points[i+1][0]-points[i][0])>Math.abs(points[i+1][1]-points[i][1])?(points[i+1][0]<points[i][0]?'left':'right'):(points[i+1][1]<points[i][1]?'up':'down')}}remaining-=lengths[i]}
}
function create(hauling){
 let trip=null,delivered=0,stolen=0,missed=0,delayedRuns=0,suspendedUntilDay=0,lastHour=0,report=null;
 const scheduled=day=>day>=1&&(day-1)%4===0;
 function step(day,hour){
  const now=day*24+hour;if(now<=lastHour)return;lastHour=now;
  if(report&&now>=report.at){report.ready=true}
  if(hour===6&&scheduled(day)){if(day<suspendedUntilDay){delayedRuns++;return}trip={day,status:'outbound',cargo:12,origin:'Marrowfield',destination:'Brook Mill',horse:'Moss',driver:'Hale',owner:'Marta’s Marrowfield supplier',attackAt:null,lootTaken:0};return}
  if(!trip)return;
  if(trip.status==='outbound'&&hour>=10&&day===trip.day)trip.status='at-mill';
  if(trip.status==='at-mill'&&hour>=11&&day===trip.day){hauling.receiveGrain(trip.cargo);delivered+=trip.cargo;trip.cargo=0;trip.status='returning'}
  if(trip.status==='returning'&&hour>=18&&day===trip.day)trip.status='home';
  if(trip.status==='abandoned'&&now>=trip.attackAt+48){missed+=trip.cargo;trip.cargo=0;trip.status='recovered'}
 }
 function position(day,hour){
  if(!trip)return null;
  if(trip.status==='outbound')return pointAlong(outward,(day===trip.day?hour-6:0)/4);
  if(trip.status==='at-mill'||trip.status==='returning'){
   if(trip.status==='at-mill'||hour<14)return {x:55.5,y:52.5,facing:'left'};
   return pointAlong([...outward].reverse(),(hour-14)/4);
  }
  if(trip.status==='abandoned')return {...trip.attackPosition};
  return null;
 }
 function raid(day,hour){
  if(!trip||trip.status!=='outbound'||trip.cargo<=0)return {ok:false,message:'There is no loaded grain cart to stop.'};
  const at=position(day,hour);trip.status='abandoned';trip.attackPosition=at;trip.attackAt=day*24+Math.floor(hour);
  suspendedUntilDay=day+5;report={at:(day+1)*24+8,ready:false,day,kind:'road attack',witness:'Hale'};
  return {ok:true,message:'Hale flees toward Marrowfield. The cart is stopped, and its grain will not reach Brook Mill. Word may reach Dunmere tomorrow.'};
 }
 function take(bag,quantity=3){
  if(!trip||trip.status!=='abandoned'||trip.cargo<=0)return {ok:false,message:'No grain is left in the cart.'};
  const amount=Math.min(quantity,trip.cargo);if(!bag.add('grain',amount))return {ok:false,message:'Your bag has no room for the grain.'};
  trip.cargo-=amount;trip.lootTaken+=amount;stolen+=amount;
  return {ok:true,amount,message:'You take '+amount+' grain. '+trip.cargo+' remain in the cart.'};
 }
 function snapshot(){return {version:1,trip:trip?{...trip,attackPosition:trip.attackPosition?{...trip.attackPosition}:undefined}:null,delivered,stolen,missed,delayedRuns,suspendedUntilDay,lastHour,report:report?{...report}:null}}
 function restore(data){if(!data||data.version!==1||!Number.isInteger(data.delivered)||data.delivered<0||!Number.isInteger(data.stolen)||data.stolen<0||!Number.isInteger(data.missed)||data.missed<0||!Number.isInteger(data.delayedRuns)||data.delayedRuns<0||!Number.isInteger(data.suspendedUntilDay)||data.suspendedUntilDay<0||!Number.isInteger(data.lastHour)||data.lastHour<0)return false;
  if(data.trip&&(!Number.isInteger(data.trip.day)||data.trip.day<1||!['outbound','at-mill','returning','home','abandoned','recovered'].includes(data.trip.status)||!Number.isInteger(data.trip.cargo)||data.trip.cargo<0||data.trip.cargo>12))return false;
  trip=data.trip?{...data.trip,attackPosition:data.trip.attackPosition?{...data.trip.attackPosition}:undefined}:null;delivered=data.delivered;stolen=data.stolen;missed=data.missed;delayedRuns=data.delayedRuns;suspendedUntilDay=data.suspendedUntilDay;lastHour=data.lastHour;report=data.report?{...data.report}:null;return true}
 return {step,position,raid,take,snapshot,restore};
}
root.KingdomGrainRoute={create};
})(window);
