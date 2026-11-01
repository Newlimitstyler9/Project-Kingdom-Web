// Deterministic land use. Every terrain change has a physical prerequisite.
(function(root){"use strict";
const W=40,H=32;
const definitions={brush:{tool:"axe",work:2,yield:{stick:2}},forest:{tool:"axe",work:4,yield:{wood:3,stick:1}},stones:{tool:"pick",work:3,yield:{stone:2}}};
function create(bag=null){
 const tiles=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>{
  const hash=(x*73856093^y*19349663)>>>0;
  const water=x<3&&y>24,rock=hash%53===0,forest=hash%13===0,brush=hash%7===0;
  return {terrain:water?"water":rock?"rock":"soil",cover:water?null:rock?"stones":forest?"forest":brush?"brush":null,owner:null,prepared:false,crop:null,growth:0,structure:null,fertility:55+hash%36,moisture:45+hash%35,work:0};
 }));
 const inventory={wood:0,stick:0,stone:0,seed:8},tools={axe:true,hoe:true,pick:false};
 let day=1,harvests=0;
 function count(id){return bag?bag.count(id):(inventory[id]||0)}
 function gain(id,n){if(!bag){inventory[id]=(inventory[id]||0)+n;return true}return bag.add(id,n)}
 function spend(id,n){if(count(id)<n)return false;if(bag)return bag.takeItem(id,n);inventory[id]-=n;return true}
 function hasTool(id){return bag?bag.equipped===id:!!tools[id]}
 function available(){return bag?Object.fromEntries(["wood","stick","stone","seed","grain"].map(id=>[id,count(id)])):{...inventory}}

 function at(x,y){return Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<W&&y<H?tiles[y][x]:null}
 function valid(t){return t&&t.terrain==="soil"}
 function change(x,y,action){
  const t=at(x,y);if(!t)return {ok:false,message:"Outside the world."};if(action!=="gather"&&!valid(t))return {ok:false,message:"This terrain cannot be cultivated."};
  if(t.owner!==null&&t.owner!=="player")return {ok:false,message:"This land belongs to someone else."};
  if(action==="claim"){if(x>=5&&x<=34&&y>=5&&y<=27)return {ok:false,message:"Dunmere village land is not yours to claim."};if(t.owner)return {ok:false,message:"Already claimed."};t.owner="player";return {ok:true,message:"Claimed a plot of unoccupied land."}}
  if(action==="gather"&&t.owner===null){if(t.cover==="brush"){if(!gain("stick",1))return {ok:false,message:"Your bag is full."};t.cover=null;return {ok:true,message:"Picked up a loose stick."}}if(t.cover==="stones"){if(!gain("stone",1))return {ok:false,message:"Your bag is full."};t.cover=null;return {ok:true,message:"Collected a loose stone."}}return {ok:false,message:"Nothing loose to gather here."}}
  if(t.owner!=="player")return {ok:false,message:"You must secure rights to this land first."};
  if(action==="clear"){if(!t.cover)return {ok:false,message:"Nothing to clear."};const d=definitions[t.cover];if(!hasTool(d.tool))return {ok:false,message:"Requires "+d.tool+"."};t.work++;if(t.work<d.work)return {ok:true,message:"Clearing in progress ("+t.work+"/"+d.work+")."};if(bag){const before=bag.snapshot();for(const [item,n] of Object.entries(d.yield))if(!gain(item,n)){bag.restore(before);return {ok:false,message:"Your bag is full."}}}else for(const [item,n] of Object.entries(d.yield))gain(item,n);t.cover=null;t.work=0;return {ok:true,message:"Land cleared. Materials collected."}}
  if(action==="build"){if(t.cover||t.crop||t.prepared)return {ok:false,message:"Clear and leave the ground empty before building."};if(t.structure?.complete)return {ok:false,message:"A structure already occupies this plot."};if(!t.structure){if(count("wood")<3||count("stick")<2)return {ok:false,message:"A timber shelter requires 3 wood and 2 sticks."};spend("wood",3);spend("stick",2);t.structure={type:"shelter",progress:0,complete:false}}t.structure.progress++;if(t.structure.progress>=4){t.structure.complete=true;return {ok:true,message:"Timber shelter completed."}}return {ok:true,message:"Building shelter ("+t.structure.progress+"/4 work stages)."}}
  if(action==="till"){if(t.structure)return {ok:false,message:"Cannot cultivate underneath a structure."};if(t.cover)return {ok:false,message:"Clear the ground first."};if(!hasTool("hoe"))return {ok:false,message:"Requires a hoe."};if(t.crop)return {ok:false,message:"Harvest the existing crop first."};t.prepared=true;return {ok:true,message:"Soil tilled and ready for sowing."}}
  if(action==="plant"){if(!t.prepared||t.cover||t.crop)return {ok:false,message:"Prepare empty soil first."};if(count("seed")<1)return {ok:false,message:"You need seeds."};spend("seed",1);t.crop="grain";t.growth=0;t.prepared=false;return {ok:true,message:"Grain seed planted."}}
  if(action==="harvest"){if(!t.crop||t.growth<100)return {ok:false,message:"Crop is not ripe."};const amount=Math.max(1,Math.floor(t.fertility/25));if(!gain("grain",amount))return {ok:false,message:"Your bag is full."};harvests+=amount;t.crop=null;t.growth=0;t.fertility=Math.max(20,t.fertility-4);return {ok:true,message:"Harvested "+amount+" grain."}}
  return {ok:false,message:"Unknown land action."};
 }
 function advanceDay(){day++;for(const row of tiles)for(const t of row){if(t.crop){const gain=t.moisture<20?0:Math.max(1,Math.floor(t.fertility/16));t.growth=Math.min(100,t.growth+gain);t.moisture=Math.max(0,t.moisture-2)}else if(day%10===0)t.fertility=Math.min(95,t.fertility+1);if(day%6===0)t.moisture=Math.min(90,t.moisture+12)}}
 function save(){return {version:1,day,harvests,inventory:available(),tools:{...tools},tiles:tiles.map(row=>row.map(t=>({...t})))}}
 function restore(data){if(!data||data.version!==1||!Array.isArray(data.tiles)||data.tiles.length!==H||!data.tiles.every(row=>Array.isArray(row)&&row.length===W)||!Number.isInteger(data.day)||data.day<1)return false;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=data.tiles[y][x];if(!t||!["soil","water","rock"].includes(t.terrain)||!Number.isFinite(t.fertility)||!Number.isFinite(t.moisture))return false}for(let y=0;y<H;y++)for(let x=0;x<W;x++)Object.assign(tiles[y][x],data.tiles[y][x]);day=data.day;harvests=data.harvests;if(!bag)Object.assign(inventory,data.inventory);Object.assign(tools,data.tools);return true}
 return {at,change,advanceDay,save,restore,get inventory(){return available()},tools,get day(){return day},get harvests(){return harvests}};
}
root.KingdomLand={create};
})(window);
