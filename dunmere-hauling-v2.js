(function(root){"use strict";
function create(world,food){
 const locations={farm:"farm",mill:"mill",bakery:"inn",market:"market"};
 const stock={farm:{grain:24},mill:{grain:0,flour:0},bakery:{flour:0,bread:0}};
 const carriers=[
 {worker:9,source:"farm",target:"mill",item:"grain",capacity:6},
 {worker:4,source:"mill",target:"bakery",item:"flour",capacity:4},
 {worker:8,source:"bakery",target:"market",item:"bread",capacity:6}
 ].map(c=>({...c,phase:"pickup",cargo:0,deliveries:0}));
 let harvested=0,milled=0,baked=0,delivered=0;
 function harvest(n){if(!Number.isInteger(n)||n<0)throw Error("Invalid harvest");stock.farm.grain+=n;harvested+=n}
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
  const millBatches=Math.min(8,Math.floor(stock.mill.grain/2));
  stock.mill.grain-=2*millBatches;stock.mill.flour+=2*millBatches;milled+=2*millBatches;
  const target=Math.max(0,36-food.snapshot().stocks.bread-stock.bakery.bread);
  const batches=Math.min(8,Math.floor(stock.bakery.flour/2),Math.ceil(target/3));
  if(batches&&food.withdraw("wood",batches)){
   stock.bakery.flour-=2*batches;stock.bakery.bread+=3*batches;baked+=3*batches;
  }
 }
 function snapshot(){return {stock:JSON.parse(JSON.stringify(stock)),carriers:carriers.map(c=>({...c})),harvested,milled,baked,delivered}}
 function restore(data){if(!data||!data.stock||!Array.isArray(data.carriers)||data.carriers.length!==carriers.length)return false;for(const site of Object.keys(stock)){if(!data.stock[site])return false;for(const item of Object.keys(stock[site]))if(!Number.isInteger(data.stock[site][item])||data.stock[site][item]<0)return false}for(let i=0;i<carriers.length;i++){const c=data.carriers[i];if(c.worker!==carriers[i].worker||!["pickup","delivery"].includes(c.phase)||!Number.isInteger(c.cargo)||c.cargo<0)return false}for(const site of Object.keys(stock))Object.assign(stock[site],data.stock[site]);for(let i=0;i<carriers.length;i++)Object.assign(carriers[i],data.carriers[i]);harvested=data.harvested;milled=data.milled;baked=data.baked;delivered=data.delivered;return true}
return {harvest,destination,step,process,snapshot,restore};
}
root.DunmereHaulingV2={create};
})(window);
