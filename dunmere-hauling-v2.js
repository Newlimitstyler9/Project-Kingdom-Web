(function(root){"use strict";
function create(world,food){
 const recipes=root.KingdomCraft?.production;if(!recipes)throw Error('Recipe catalog must load before village hauling');
 const locations={farm:"farm",mill:"mill",bakery:"bakery",market:"market"};
 const stock={farm:{grain:24},mill:{grain:0,flour:0},bakery:{flour:0,bread:0}};
 const carriers=[
 {worker:9,source:"farm",target:"mill",item:"grain",capacity:6},
 {worker:4,source:"mill",target:"bakery",item:"flour",capacity:4},
 {worker:8,source:"bakery",target:"market",item:"bread",capacity:6}
 ].map(c=>({...c,phase:"pickup",cargo:0,deliveries:0}));
 let harvested=0,milled=0,baked=0,delivered=0;
 function harvest(n){if(!Number.isInteger(n)||n<0)throw Error("Invalid harvest");stock.farm.grain+=n;harvested+=n}
 function receiveGrain(n){if(!Number.isInteger(n)||n<=0)throw Error("Invalid grain delivery");stock.mill.grain+=n;return stock.mill.grain}
 function destination(id){const c=carriers.find(c=>c.worker===id);const hour=world.snapshot().hour;return c&&hour>=8&&hour<17&&(c.phase==="delivery"||(stock[c.source][c.item]||0)>0)?locations[c.phase==="pickup"?c.source:c.target]:null}
 function step(arrived){
  const hour=world.snapshot().hour;if(hour<8||hour>=17)return;
  for(const c of carriers){
   if(c.phase==="pickup"){
    if(!arrived(c.worker,locations[c.source]))continue;
    const n=Math.min(c.capacity,stock[c.source][c.item]||0);
    if(n){stock[c.source][c.item]-=n;c.cargo=n;c.phase="delivery"}
   }else if(arrived(c.worker,locations[c.target])){
    if(c.item==="bread"){food.transferIn("bread",c.cargo);delivered+=c.cargo}
    else stock[c.target][c.item]=(stock[c.target][c.item]||0)+c.cargo;
    c.cargo=0;c.phase="pickup";c.deliveries++;
   }
  }
 }
 function process(){
  const mill=recipes.mill,bake=recipes.bread;
  const millBatches=Math.min(8,Math.floor(stock.mill.grain/mill.ingredients.grain));
  stock.mill.grain-=mill.ingredients.grain*millBatches;stock.mill.flour+=mill.output.flour*millBatches;milled+=mill.output.flour*millBatches;
  const target=Math.max(0,36-food.snapshot().stocks.bread-stock.bakery.bread);
  const batches=Math.min(8,Math.floor(stock.bakery.flour/bake.ingredients.flour),Math.ceil(target/bake.output.bread));
  const neededWater=batches*bake.ingredients.wellWater,neededWood=batches*bake.fuel.wood;
  const villageStock=food.snapshot().stocks;
  if(batches&&villageStock.wellWater>=neededWater&&villageStock.wood>=neededWood){
   food.withdraw("wellWater",neededWater);food.withdraw("wood",neededWood);
   stock.bakery.flour-=bake.ingredients.flour*batches;stock.bakery.bread+=bake.output.bread*batches;baked+=bake.output.bread*batches;
  }
 }
 function snapshot(){return {stock:JSON.parse(JSON.stringify(stock)),carriers:carriers.map(c=>({...c})),harvested,milled,baked,delivered}}
 function restore(data){if(!data||!data.stock||!Array.isArray(data.carriers)||data.carriers.length!==carriers.length)return false;for(const site of Object.keys(stock)){if(!data.stock[site])return false;for(const item of Object.keys(stock[site]))if(!Number.isInteger(data.stock[site][item])||data.stock[site][item]<0)return false}for(let i=0;i<carriers.length;i++){const c=data.carriers[i];if(c.worker!==carriers[i].worker||!["pickup","delivery"].includes(c.phase)||!Number.isInteger(c.cargo)||c.cargo<0)return false}for(const site of Object.keys(stock))Object.assign(stock[site],data.stock[site]);for(let i=0;i<carriers.length;i++)Object.assign(carriers[i],data.carriers[i]);harvested=data.harvested;milled=data.milled;baked=data.baked;delivered=data.delivered;return true}
return {harvest,receiveGrain,destination,step,process,snapshot,restore};
}
root.DunmereHaulingV2={create};
})(window);
