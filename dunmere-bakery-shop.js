// Iris sells loaves transferred from Dunmere's food ledger; purchases move copper to her purse.
(function(root){"use strict";
function create(world,food,bag,wallet){
 const state={version:1,seeded:false,bread:0,lastRestockDay:0};
 function restock(){
  const day=world.snapshot().day;
  if(state.lastRestockDay>=day)return false;
  state.lastRestockDay=day;
  const quantity=Math.min(5-state.bread,food.snapshot().stocks.bread);
  if(quantity<=0)return false;
  if(!food.withdraw('bread',quantity))return false;
  state.bread+=quantity;return true;
 }
 function seed(){if(state.seeded)return false;state.seeded=true;return restock()}
 function buyBread(){
  if(state.bread<1)return {ok:false,message:'Iris is out of bread today.'};
  if(wallet.snapshot().coins<2)return {ok:false,message:'You need 2 copper for a loaf.'};
  if(!bag.add('bread',1))return {ok:false,message:'Your bag is full.'};
  if(!wallet.spendToResident(8,2)){bag.takeItem('bread',1);return {ok:false,message:'The payment could not be made.'}}
  state.bread--;return {ok:true,message:'Bought a loaf from Iris for 2 copper. '+state.bread+' left on her counter.'};
 }
 function snapshot(){return {...state}}
 function restore(data){if(!data||data.version!==1||data.seeded!==true||!Number.isInteger(data.bread)||data.bread<0||data.bread>5||!Number.isInteger(data.lastRestockDay)||data.lastRestockDay<1)return false;Object.assign(state,data);return true}
 return {seed,restock,buyBread,snapshot,restore};
}
root.KingdomBakeryShop={create};
})(window);
