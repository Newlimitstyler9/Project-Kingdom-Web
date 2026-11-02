// Finite Hearth & Hound stock and coin transfers. No item is created by buying.
(function(root){"use strict";
const PRICES=Object.freeze({bread:3,ale:2});
function create(world,food,bag){
 const state={version:1,seeded:false,coins:10,till:0,stock:{bread:0,ale:0}};
 function seed(){
  if(state.seeded)return false;
  const bread=Math.min(5,food.snapshot().stocks.bread);
  const ale=Math.min(7,world.snapshot().ale);
  if(bread>0&&!food.withdraw('bread',bread))return false;
  if(ale>0&&!world.withdrawAle(ale)){if(bread)food.transferIn('bread',bread);return false}
  const nell=world.residents[5],float=Math.min(6,nell.coins);
  nell.coins-=float;state.till=float;state.stock.bread=bread;state.stock.ale=ale;state.seeded=true;
  return true;
 }
 function buy(item){
  const price=PRICES[item];if(!price)return {ok:false,message:'That is not sold here.'};
  if(state.stock[item]<1)return {ok:false,message:'The inn is out of '+item+'.'};
  if(state.coins<price)return {ok:false,message:'You need '+price+' copper for '+item+'.'};
  if(!bag.add(item,1))return {ok:false,message:'Your bag is full.'};
  state.stock[item]--;state.coins-=price;state.till+=price;
  return {ok:true,message:'Bought '+item+' for '+price+' copper. '+state.stock[item]+' left in the inn.'};
 }
 function sellBread(){
  if(bag.count('bread')<1)return {ok:false,message:'You have no bread to sell.'};
  if(state.till<1)return {ok:false,message:'Nell has no copper in the till.'};
  if(!bag.takeItem('bread',1))return {ok:false,message:'Could not remove bread from your bag.'};
  state.stock.bread++;state.till--;state.coins++;
  return {ok:true,message:'Sold one loaf to Nell for 1 copper.'};
 }
 function pay(amount){
  if(!Number.isInteger(amount)||amount<1)return {ok:false,message:'Invalid room price.'};
  if(state.coins<amount)return {ok:false,message:'You need '+amount+' copper to rent a room.'};
  state.coins-=amount;state.till+=amount;
  return {ok:true,message:'Paid '+amount+' copper for a room.'};
 }
 function snapshot(){return {version:1,seeded:state.seeded,coins:state.coins,till:state.till,stock:{...state.stock}}}
 function restore(data){if(!data||data.version!==1||data.seeded!==true||![data.coins,data.till,data.stock?.bread,data.stock?.ale].every(n=>Number.isInteger(n)&&n>=0))return false;state.seeded=true;state.coins=data.coins;state.till=data.till;state.stock={bread:data.stock.bread,ale:data.stock.ale};return true}
 return {seed,buy,sellBread,pay,snapshot,restore,get prices(){return PRICES}};
}
root.KingdomInnShop={create};
})(window);
