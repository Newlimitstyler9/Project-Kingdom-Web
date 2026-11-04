// Tessa's finite carried hides. Copper goes to her purse; a purchase moves one real item.
(function(root){'use strict';
function create(world,bag,wallet){
 let stock=9;
 function buy(){
  if(stock<1)return {ok:false,message:'Tessa has no hides left in this shipment.'};
  if(wallet.snapshot().coins<2)return {ok:false,message:'You need 2 copper for a hide.'};
  if(!bag.add('hide',1))return {ok:false,message:'Your bag is full.'};
  if(!wallet.spendToResident(6,2)){bag.takeItem('hide',1);return {ok:false,message:'The payment could not be made.'}}
  stock--;return {ok:true,message:'Bought one hide from Tessa for 2 copper. '+stock+' remain.'};
 }
 function snapshot(){return {version:1,stock}}
 function restore(data){if(!data||data.version!==1||!Number.isInteger(data.stock)||data.stock<0||data.stock>9)return false;stock=data.stock;return true}
 return {buy,snapshot,restore};
}
root.KingdomHideTrade={create};
})(window);
