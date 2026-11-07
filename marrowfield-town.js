// Small agricultural town south of Dunmere. Its residents keep homes, work, and finite goods.
(function(root){'use strict';
const people=Object.freeze([
 {id:'mara',name:'Mara Reed',role:'field keeper',sprite:1,home:'marrow-croft',work:'fields',line:'We lost the north harvest to rain once. I keep seed back now.',x:69.5,y:132.5},
 {id:'doran',name:'Doran Reed',role:'grain steward',sprite:4,home:'marrow-croft',work:'marrow-granary',line:'Every sack has a mark. If one goes missing, I know whose cart took it.',x:67.5,y:152.5},
 {id:'isolde',name:'Isolde Fen',role:'innkeeper',sprite:5,home:'marrow-inn',work:'marrow-inn',line:'Carters sleep here when the road north is too wet for a wagon.',x:65.5,y:143.5},
 {id:'fenn',name:'Fenn Vale',role:'baker',sprite:8,home:'marrow-hall',work:'marrow-bakehouse',line:'The first loaves go to the farm crews. Travelers can buy what remains.',x:78.5,y:152.5},
 {id:'corin',name:'Corin Vale',role:'reeve',sprite:7,home:'marrow-hall',work:'marrow-hall',line:'This town keeps the south road fed. A late cart makes trouble in Greyford.',x:48.5,y:142.5}
]);
function create(bag,purse){let met=new Set(),heard=new Set(),stock={bread:6,grain:12,ale:5},till=12;
 function snapshot(){return {version:1,met:[...met],heard:[...heard],stock:{...stock},till}}
 function restore(data){if(!data||data.version!==1||!data.stock||!['bread','grain','ale'].every(id=>Number.isInteger(data.stock[id])&&data.stock[id]>=0)||!Number.isInteger(data.till)||data.till<0)return false;met=new Set((data.met||[]).filter(id=>people.some(p=>p.id===id)));heard=new Set((data.heard||[]).filter(id=>typeof id==='string'&&id.length<80));stock={...data.stock};till=data.till;return true}
 function buy(id){const price={bread:2,grain:3,ale:2}[id];if(!price||stock[id]<1)return {ok:false,message:'That is out of stock.'};if(purse.snapshot().coins<price)return {ok:false,message:'You need '+price+' copper.'};if(!bag.add(id,1))return {ok:false,message:'Your pack is full.'};if(!purse.debit(price)){bag.takeItem(id,1);return {ok:false,message:'Payment failed.'}}stock[id]--;till+=price;return {ok:true,message:'Bought '+bag.defs[id].name+' for '+price+' copper.'}}
 function sell(id){if(id!=='grain'||!bag.slots.some(s=>s?.id===id&&!s.meta?.stolenFrom))return {ok:false,message:'The granary only buys clean grain.'};if(till<1)return {ok:false,message:'The granary till is empty.'};const index=bag.slots.findIndex(s=>s?.id===id&&!s.meta?.stolenFrom);bag.take(index,1);stock.grain++;till--;purse.credit(1);return {ok:true,message:'Sold one grain for 1 copper.'}}
 function location(person,hour){if(hour>=22||hour<6)return {inside:person.home};if(person.id==='mara'){const route=[[69.5,130.5],[73.5,131.5],[72.5,135.5],[67.5,134.5]],phase=performance.now()/4800,i=Math.floor(phase)%route.length,t=phase%1,a=route[i],b=route[(i+1)%route.length];return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,moving:true}}
  if(hour>=8&&hour<17)return {inside:person.work};if(person.id==='isolde'&&hour<22)return {inside:person.work};const phase=performance.now()/6500,t=Math.abs(phase%2-1);return {x:person.x+t*.8,y:person.y,moving:true}}
 function outside(hour){return people.flatMap(p=>{const q=location(p,hour);return q.inside?[]:[{...p,...q}]})}
 function inside(room,hour){return people.filter(p=>location(p,hour).inside===room)}
 function meet(id){met.add(id)}function knows(id){return met.has(id)}function hasHeard(id,topic){return heard.has(id+':'+topic)}function hear(id,topic){heard.add(id+':'+topic)}
 return {people,stock,buy,sell,location,outside,inside,meet,knows,hasHeard,hear,snapshot,restore};
}
root.MarrowfieldTown={create,people};
})(window);
