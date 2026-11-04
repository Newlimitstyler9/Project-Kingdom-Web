// Seasonal, household-level food model. Independent of the renderer.
(function(global){"use strict";
const catalog=global.KingdomItemCatalog;
const production=global.KingdomCraft?.production;
if(!catalog||!production)throw Error('Item and recipe catalogs must load before village food');
const types=Object.fromEntries(Object.entries(catalog.defs).filter(([,def])=>def.type==='food'&&def.shelfLife).map(([id,def])=>[id,{nutrition:def.nutrition,life:def.shelfLife}]));
function create(world,seed=874){
 const stores=world.residents.map(r=>({owner:r.id,food:{bread:2,vegetables:3,beans:2},hungryDays:0}));
 const publicStock={...catalog.worldStockStart};
 const plots=[{id:"westfield",crop:"grain",area:18,condition:80},{id:"gardens",crop:"vegetables",area:12,condition:85},{id:"beanfield",crop:"beans",area:12,condition:80}];
 let day=1,missed=0,spoiled=0,harvested=0,consumed=0,imports=0,logistics=null;
 const events=[];
 const add=(item,n)=>{publicStock[item]=(publicStock[item]||0)+n};
 function update(dayNumber){
  day=dayNumber;
  const season=Math.floor(((day-1)%360)/90),winter=season===3,harvest=season===2;
  // Explicit cultivation with seasonal productivity and soil condition.
  for(const p of plots){const yieldPerTile=p.crop==="grain"?2:1,seasonFactor=winter?0:harvest?2:1;
   if(day%2===0&&seasonFactor>0&&p.condition>25){const quantity=logistics&&p.crop==="grain"?Math.max(1,Math.floor(p.area*yieldPerTile*seasonFactor*.12)):p.area*yieldPerTile*seasonFactor;if(logistics&&p.crop==="grain")logistics.harvest(quantity);else add(p.crop,quantity);harvested+=quantity;p.condition=Math.max(25,p.condition-1)}
   if(day%30===0)p.condition=Math.min(90,p.condition+8);
  }
  // The village well refills a bounded clean-water store each day.
  publicStock.wellWater=Math.min(80,publicStock.wellWater+12);
  // Mill and bake from physical inputs, bounded by demand and fuel.
  const need=logistics?0:Math.max(0,Math.min(45,world.residents.length*3-publicStock.bread));
  const mill=production.mill,bake=production.bread,batches=Math.ceil(need/bake.output.bread);
  for(let i=0;i<batches;i++){if(publicStock.flour<bake.ingredients.flour&&publicStock.grain>=mill.ingredients.grain){publicStock.grain-=mill.ingredients.grain;publicStock.flour+=mill.output.flour}if(publicStock.flour<bake.ingredients.flour||publicStock.wellWater<bake.ingredients.wellWater||publicStock.wood<bake.fuel.wood)break;publicStock.flour-=bake.ingredients.flour;publicStock.wellWater-=bake.ingredients.wellWater;publicStock.wood-=bake.fuel.wood;publicStock.bread+=bake.output.bread}
  // Seasonal household gardens and village fishing replenish non-grain foods.
  if(day%2===0)add("eggs",5);
  if(day%2===0)add("fish",4);
  const preserve=production.preserves;
  if(day%5===0&&publicStock.vegetables>=preserve.ingredients.vegetables){publicStock.vegetables-=preserve.ingredients.vegetables;add("preserves",preserve.output.preserves)}
  // A small woodland fuel collection, dependent on the settlement's labor.
  if(world.residents.some(r=>r.job==="laborer"||r.job==="farmhand"))add("wood",8);
  // Spoilage is a real loss, not a reset.
  for(const [item,rate] of [["bread",.035],["vegetables",.012],["eggs",.025],["fish",.08]]){
   const n=Math.floor(publicStock[item]*rate);publicStock[item]-=n;spoiled+=n;
  }
  for(const h of stores){
   const r=world.residents[h.owner];let nutrition=0;
   // Food purchased or distributed from village stores to household stores.
   for(const item of ["vegetables","beans","bread","eggs","fish","preserves"]){
    if(nutrition>=30)break;
    let available=h.food[item]||0;
    if(available===0&&publicStock[item]>0){publicStock[item]--;h.food[item]=1;available=1}
    if(available>0){h.food[item]--;nutrition+=types[item].nutrition;consumed++}
   }
   r.hunger=Math.min(100,Math.max(0,r.hunger+(nutrition<25?28:-35)));if(nutrition<25){h.hungryDays++;missed++;if(h.hungryDays===1)events.push("Day "+day+": "+r.name+" could not obtain enough food.")}
   else h.hungryDays=0;
  }
  if(day%30===0)events.push("Day "+day+": food stores "+Object.entries(publicStock).filter(([k])=>types[k]).map(([k,v])=>k+" "+v).join(", "));
 }
 function snapshot(){return {day,season:["Spring","Summer","Autumn","Winter"][Math.floor(((day-1)%360)/90)],stocks:{...publicStock},plots:plots.map(x=>({...x})),households:stores.map(h=>({owner:h.owner,hungryDays:h.hungryDays,food:{...h.food}})),missedMeals:missed,spoiled,harvested,consumed,imports,events:events.slice(-30)}}
 function save(){return {version:1,day,missed,spoiled,harvested,consumed,imports,stocks:{...publicStock},plots:plots.map(p=>({...p})),households:stores.map(h=>({owner:h.owner,hungryDays:h.hungryDays,food:{...h.food}})),events:[...events]}}
function restore(data){if(!data||data.version!==1||!Array.isArray(data.plots)||data.plots.length!==plots.length||!Array.isArray(data.households)||data.households.length!==stores.length||!data.stocks)return false;
for(const key of Object.keys(publicStock))if(key!=="wellWater"&&(!Number.isInteger(data.stocks[key])||data.stocks[key]<0))return false;
if(data.stocks.wellWater!==undefined&&(!Number.isInteger(data.stocks.wellWater)||data.stocks.wellWater<0))return false;
day=data.day;missed=data.missed;spoiled=data.spoiled;harvested=data.harvested;consumed=data.consumed;imports=data.imports;
Object.assign(publicStock,data.stocks);if(logistics)publicStock.grain=0; // Old abstract grain never entered the physical mill pipeline.
if(data.stocks.wellWater===undefined)publicStock.wellWater=catalog.worldStockStart.wellWater;for(let i=0;i<plots.length;i++)Object.assign(plots[i],data.plots[i]);for(let i=0;i<stores.length;i++){stores[i].hungryDays=data.households[i].hungryDays;stores[i].food={...data.households[i].food}}events.splice(0,events.length,...(Array.isArray(data.events)?data.events.slice(-100):[]));return true}
return {update,snapshot,save,restore,attachLogistics(value){logistics=value;if(value)publicStock.grain=0},transferIn(item,quantity){if(!Object.hasOwn(publicStock,item)||!Number.isInteger(quantity)||quantity<=0||item==='grain'&&logistics)return false;add(item,quantity);return true},withdraw(item,quantity){if(!Number.isInteger(quantity)||quantity<=0||!Object.hasOwn(publicStock,item)||publicStock[item]<quantity)return false;publicStock[item]-=quantity;return true}};
}
global.DunmereFood={create};
})(window);
