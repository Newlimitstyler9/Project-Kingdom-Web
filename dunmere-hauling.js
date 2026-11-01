// Visible food hauling jobs. This prototype records physical carriers and conserves cargo.
(function(global){"use strict";
function create(world,food){
 const sites={farm:"farm",mill:"mill",bakery:"inn",market:"market"};
 const stock={farm:{grain:24},mill:{grain:0,flour:0},bakery:{flour:0,bread:0},market:{bread:0}};
 const jobs=[{worker:9,from:"farm",to:"mill",item:"grain",amount:3},{worker:4,from:"mill",to:"bakery",item:"flour",amount:2},{worker:8,from:"bakery",to:"market",item:"bread",amount:3}];
 const carriers=jobs.map(j=>({...j,stage:"pickup",cargo:0,completed:0}));
 function step(arrived){
  for(const c of carriers){
   if(c.stage==="pickup"&&arrived(c.worker,sites[c.from])){
    const n=Math.min(c.amount,stock[c.from][c.item]||0);if(n>0){stock[c.from][c.item]-=n;c.cargo=n;c.stage="delivery"}
   }else if(c.stage==="delivery"&&arrived(c.worker,sites[c.to])){
    stock[c.to][c.item]=(stock[c.to][c.item]||0)+c.cargo;c.cargo=0;c.completed++;c.stage="pickup";
   }
  }
 }
 function process(){
  if(stock.mill.grain>=2){stock.mill.grain-=2;stock.mill.flour+=2}
  if(stock.bakery.flour>=2){stock.bakery.flour-=2;stock.bakery.bread+=3}
  // A finite daily harvest enters the farm stock. The seasonal model remains
  // authoritative for nutrition; this logistics slice is not yet its input source.
  stock.farm.grain+=6;
 }
 function destination(worker){const c=carriers.find(x=>x.worker===worker);return c?sites[c.stage==="pickup"?c.from:c.to]:null}
 function snapshot(){return {stock:JSON.parse(JSON.stringify(stock)),carriers:carriers.map(c=>({...c}))}}
 return {step,process,destination,snapshot};
}
global.DunmereHauling={create};
})(window);
