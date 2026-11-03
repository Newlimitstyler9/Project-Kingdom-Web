// Persistent room containers. Item movement is committed only after both sides can accept it.
(function(root){"use strict";
const initial={rented:{},travelers:{bread:1,ale:1,stick:2}};
function create(bag){
 let boxes=structuredClone(initial),stolen=0;
 const defs=bag.defs;
 function validBox(id){return id==='rented'||id==='travelers'}
 function contents(id){return validBox(id)?{...boxes[id]}:null}
 function deposit(id,item,count=1){
  if(id!=='rented')return {ok:false,message:'This chest belongs to another guest.'};
  if(!defs[item]||defs[item].portable===false||!Number.isInteger(count)||count<1||bag.count(item)<count)return {ok:false,message:'You do not have that item.'};
  const total=Object.values(boxes.rented).reduce((n,v)=>n+v,0);
  if(total+count>20)return {ok:false,message:'The chest is full.'};
  if(!bag.takeItem(item,count))return {ok:false,message:'Could not move that item.'};
  boxes.rented[item]=(boxes.rented[item]||0)+count;
  return {ok:true,message:'Stored '+count+' '+defs[item].name.toLowerCase()+'.'};
 }
 function withdraw(id,item,count=1,sneaking=false){
  if(!validBox(id)||!Number.isInteger(count)||count<1||!defs[item]||(boxes[id][item]||0)<count)return {ok:false,message:'That item is not in the chest.'};
  if(id==='travelers'&&!sneaking)return {ok:false,message:'That belongs to the travelers. Sneak to take it.'};
  if(!bag.add(item,count))return {ok:false,message:'Your bag is full.'};
  boxes[id][item]-=count;if(boxes[id][item]===0)delete boxes[id][item];
  if(id==='travelers')stolen+=count;
  return {ok:true,message:id==='travelers'?'You quietly took '+defs[item].name.toLowerCase()+'.':'Took '+defs[item].name.toLowerCase()+'.'};
 }
 function snapshot(){return {version:1,boxes:structuredClone(boxes),stolen}}
 function restore(data){
  if(!data||data.version!==1||!data.boxes||typeof data.boxes!=='object')return false;
  const clean={rented:{},travelers:{}};
  for(const id of Object.keys(clean)){const source=data.boxes[id];if(!source||typeof source!=='object'||Array.isArray(source))return false;
   for(const [item,count] of Object.entries(source))if(defs[item]&&defs[item].portable!==false&&Number.isInteger(count)&&count>0&&count<=20)clean[id][item]=count;
  }
  boxes=clean;stolen=Number.isInteger(data.stolen)&&data.stolen>=0?data.stolen:0;return true;
 }
 return {contents,deposit,withdraw,snapshot,restore,get stolen(){return stolen}};
}
root.KingdomRoomStorage={create};
})(window);
