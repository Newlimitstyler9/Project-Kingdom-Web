// Persistent room containers. Item movement is committed only after both sides can accept it.
(function(root){"use strict";
const initial={rented:{},travelers:{bread:1,ale:1,stick:2}};
function create(bag){
 let boxes=structuredClone(initial),details={rented:{},travelers:{}},stolen=0;
 const defs=bag.defs;
 function validBox(id){return id==='rented'||id==='travelers'}
 function contents(id){return validBox(id)?{...boxes[id]}:null}
 function deposit(id,item,count=1){
  if(id!=='rented')return {ok:false,message:'This chest belongs to another guest.'};
  if(!defs[item]||defs[item].portable===false||!Number.isInteger(count)||count<1||(defs[item].stack===1&&count!==1)||bag.count(item)<count)return {ok:false,message:'You do not have that item.'};
  const total=Object.values(boxes.rented).reduce((n,v)=>n+v,0);
  if(total+count>20)return {ok:false,message:'The chest is full.'};
  const before=bag.snapshot(),moved=[];
  for(let n=0;n<count;n++){const index=bag.slots.findLastIndex(slot=>slot?.id===item);if(index<0||!bag.take(index,1)){bag.restore(before);return {ok:false,message:'Only items in your pack can be stored.'}}moved.push(before.slots[index]?.meta?{...before.slots[index].meta}:null)}
  (details.rented[item]||=[]).push(...moved);
  boxes.rented[item]=(boxes.rented[item]||0)+count;
  return {ok:true,message:'Stored '+count+' '+defs[item].name.toLowerCase()+'.'};
 }
 function withdraw(id,item,count=1,sneaking=false){
  if(!validBox(id)||!Number.isInteger(count)||count<1||!defs[item]||(boxes[id][item]||0)<count)return {ok:false,message:'That item is not in the chest.'};
  if(id==='travelers'&&!sneaking)return {ok:false,message:'That belongs to the travelers. Sneak to take it.'};
  const before=bag.snapshot(),entries=details[id][item]||[];
  for(let n=0;n<count;n++)if(!bag.add(item,1,entries[n]||null)){bag.restore(before);return {ok:false,message:'Your bag is full.'}}
  if(entries.length){entries.splice(0,count);if(!entries.length)delete details[id][item]}
  boxes[id][item]-=count;if(boxes[id][item]===0)delete boxes[id][item];
  if(id==='travelers')stolen+=count;
  return {ok:true,message:id==='travelers'?'You quietly took '+defs[item].name.toLowerCase()+'.':'Took '+defs[item].name.toLowerCase()+'.'};
 }
 function snapshot(){return {version:3,boxes:structuredClone(boxes),details:structuredClone(details),stolen}}
 function restore(data){
  if(!data||![1,2,3].includes(data.version)||!data.boxes||typeof data.boxes!=='object')return false;
  const clean={rented:{},travelers:{}};
  for(const id of Object.keys(clean)){const source=data.boxes[id];if(!source||typeof source!=='object'||Array.isArray(source))return false;
   for(const [item,count] of Object.entries(source))if(defs[item]&&defs[item].portable!==false&&Number.isInteger(count)&&count>0&&count<=20)clean[id][item]=count;
  }
  boxes=clean;details={rented:{},travelers:{}};if(data.version>=2&&data.details)for(const id of Object.keys(details))for(const [item,entries] of Object.entries(data.details[id]||{}))if(defs[item]&&Array.isArray(entries)&&entries.length<=clean[id][item]){const sanitised=entries.map(m=>{if(!m||typeof m!=='object')return null;const out={quality:Math.max(1,Math.min(5,Number(m.quality)||1)),maker:String(m.maker||'Unknown').slice(0,40)};if(typeof m.uid==='string'&&/^(ash-piece|greyford-property)-[1-9]\d*$/.test(m.uid))out.uid=m.uid;if(Number.isFinite(m.condition))out.condition=Math.max(0,Math.min(100,Math.round(m.condition)));if(typeof m.owner==='string'&&/^(player|ash-smithy|greyford:[a-z0-9-]+)$/.test(m.owner))out.owner=m.owner;if(typeof m.stolenFrom==='string'&&/^(ash-smithy|greyford:[a-z0-9-]+)$/.test(m.stolenFrom))out.stolenFrom=m.stolenFrom;if(Number.isInteger(m.stolenAt))out.stolenAt=m.stolenAt;return out});details[id][item]=data.version===2?[...sanitised,...Array(clean[id][item]-sanitised.length).fill(null)]:sanitised}stolen=Number.isInteger(data.stolen)&&data.stolen>=0?data.stolen:0;return true;
 }
 return {contents,deposit,withdraw,snapshot,restore,get stolen(){return stolen}};
}
root.KingdomRoomStorage={create};
})(window);
