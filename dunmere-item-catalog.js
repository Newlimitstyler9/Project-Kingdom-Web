// Shared item definitions: stable IDs, gameplay rules, and existing bag art.
(function(root){"use strict";
const defs={
 charcoal:{name:"Charcoal",type:"material",stack:20,weight:.4,art:["................","......111.......","....112211......","...12222211.....","..1223332211....","..1233333221....","..1233233221....","..1223333221....","...122332211....","....112221......","......111.......","................"],palette:["#00000000","#101415","#252a2b","#454b4c"]},
 bread:{name:"Bread",type:"food",stack:10,weight:.3,nutrition:32,shelfLife:5,art:["................","......111.......","....122221......","...12222221.....","..1223223221....","..1232223221....","..1222222221....","...12222221.....","....111111......","................"],palette:["#00000000","#4a3327","#b07a42","#e8bd78"]},
 ale:{name:"Ale serving",type:"drink",stack:10,weight:.5,art:["................","...11111111.....","...12222221.11..","...12333321.121.","...12333321.121.","...12333321.11..","...12333321.....","....122221......",".....1111.......","................"],palette:["#00000000","#493522","#9d6a35","#ddad59"]},
 axe:{name:"Stone axe",type:"tool",stack:1,weight:1.6,slot:"hand",art:["....111.........","...122211.......","..12222211......","..12332221......","...122221.......","....1112........",".......2........",".......2........",".......2........",".......2........",".......2........",".......2........","................"],palette:["#00000000","#2c3535","#8e9690","#d3d3bf"]},
 stick:{name:"Stick",type:"material",stack:20,weight:.2,art:["................","............1...","...........12...","..........12....",".........12.....","........12......",".......12.......","......12........",".....12.........","....12..........","...12...........","..11............"],palette:["#00000000","#453528","#99734a","#d1aa73"]}
};
for(const [id,name,weight] of [["wood","Wood",.8],["stone","Stone",.9],["seed","Grain seed",.05],["grain","Grain",.2],["pick","Stone pick",1.5],["hoe","Wooden hoe",1.2]])defs[id]={name,type:id==="pick"||id==="hoe"?"tool":"material",slot:id==="pick"||id==="hoe"?"hand":undefined,stack:id==="pick"||id==="hoe"?1:20,weight,art:["................",".....1111.......","....122221......","...12333321.....","...12333321.....","....122221......",".....1111.......","................"],palette:["#00000000","#3d332a","#92764d","#c4a477"]};
const itemArt={
 wood:["................","..111111111111..","..122222222221..","..123323323321..","..122222222221..","..111111111111..","................"],
 stone:["................",".....11111......","...112222211....","..1223333221....","...12222221.....",".....1111.......","................"],
 seed:["................","....1....1......","...121..121.....","....2....2......","......121.......",".......2........","................"],
 grain:["................","......1.........",".....121........","....12121.......","...1212121......","....12121.......",".....121........","......1.........","................"],
 hoe:["........1111....",".....1112221....","...11122211.....","......11........","......2.........","......2.........","......2.........","......2.........","......2.........","................"],
 pick:["..111111111.....","...1222221......",".....111........","......2.........","......2.........","......2.........","......2.........","......2.........","................"]
};
for(const [id,art] of Object.entries(itemArt))defs[id].art=art;
for(const id of ["wood","seed","grain"])defs[id].palette=["#00000000","#483423","#98704a","#d9b675"];
for(const id of ["stone","pick"])defs[id].palette=["#00000000","#30383a","#838b88","#c1c5b9"];

const worldGoods={
 flour:{name:"Flour",type:"material",stack:20,weight:.25},
 wellWater:{name:"Well water",type:"material",stack:20,weight:1},
 vegetables:{name:"Vegetables",type:"food",stack:20,weight:.4,nutrition:18,shelfLife:9},
 beans:{name:"Beans",type:"food",stack:20,weight:.2,nutrition:28,shelfLife:30},
 eggs:{name:"Eggs",type:"food",stack:12,weight:.1,nutrition:20,shelfLife:5},
 fish:{name:"Fresh fish",type:"food",stack:10,weight:.5,nutrition:30,shelfLife:3},
 preserves:{name:"Dried vegetables",type:"food",stack:10,weight:.4,nutrition:25,shelfLife:90}
};
for(const [id,definition] of Object.entries(worldGoods))defs[id]={...definition,portable:false,phase:"world-stock"};
const planned={
 tinder:{name:"Tinder",type:"material",stack:20,weight:.05},
 fiber:{name:"Plant fiber",type:"material",stack:20,weight:.1},
 flint:{name:"Flint",type:"material",stack:20,weight:.2},
 clay:{name:"Clay",type:"material",stack:20,weight:.4},
 hide:{name:"Hide",type:"material",stack:10,weight:1},
 cloth:{name:"Cloth",type:"material",stack:20,weight:.3},
 dirtyWater:{name:"Vessel of unclean water",type:"container",stack:1,weight:1.6,vesselState:"unclean"},
 cleanWater:{name:"Vessel of clean water",type:"container",stack:1,weight:1.6,vesselState:"clean",returnsOnDrink:"waterVessel"},
 waterVessel:{name:"Water vessel",type:"container",stack:1,weight:.6},
 campfire:{name:"Campfire kit",type:"placeable",stack:1,weight:2},
 tent:{name:"Travel tent",type:"placeable",stack:1,weight:4},
 bedroll:{name:"Bedroll",type:"placeable",stack:1,weight:2},
 torch:{name:"Torch",type:"tool",stack:1,weight:.7,slot:"hand"},
 knife:{name:"Stone knife",type:"weapon",stack:1,weight:.5,slot:"hand"},
 spear:{name:"Wooden spear",type:"weapon",stack:1,weight:1.6,slot:"hand"},
 cookedFish:{name:"Cooked fish",type:"food",stack:10,weight:.4,nutrition:35,shelfLife:2}
};
for(const [id,definition] of Object.entries(planned))defs[id]={...definition,portable:false,phase:"planned"};
// The first wilderness camp uses materials from the starting grove and salvaged canvas.
const campArt={
 fiber:["................","...2.....2......","....2...2.......","....2..2........",".....22.........","......2.........",".....122........","....11122.......",".....111........","......1.........","................"],
 cloth:["................","...11111111.....","...12222221.....","...12332221.....","...12232221.....","...12222221.....","...11111111.....","................"],
 campfire:["................","......33........",".....3333.......","......23........","....111111......","...12222221.....","....111111......","................"],
 tent:["................",".......1........","......121.......",".....12221......","....1222221.....","...122332221....","..11111111111...","................"],
 bedroll:["................","...11111111.....","..1222222221....","..1233333321....","..1222222221....","...11111111.....","................"]
};
for(const [id,art] of Object.entries(campArt)){
 defs[id]={...defs[id],portable:true,phase:"playable",art,palette:id==='campfire'?["#00000000","#54463a","#d6813b","#f6d070"]:id==='fiber'?["#00000000","#5b7540","#9eb66a","#d1c783"]:["#00000000","#473f33","#b19b71","#ded0a8"]};
}
for(const definition of Object.values(defs))if(!definition.phase)definition.phase="playable";
function validate(){for(const [id,definition] of Object.entries(defs)){if(!/^[a-z][A-Za-z0-9]*$/.test(id)||!definition.name||!definition.type||!Number.isInteger(definition.stack)||definition.stack<1||!Number.isFinite(definition.weight)||definition.weight<0)return false;if(definition.phase==="playable"&&(!Array.isArray(definition.art)||!Array.isArray(definition.palette)))return false}return true}
const worldStockStart={grain:350,flour:40,wellWater:80,bread:45,vegetables:120,beans:200,eggs:18,fish:8,preserves:180,seed:20,wood:60};
if(!validate()||Object.keys(worldStockStart).some(id=>!defs[id]))throw Error("Invalid item catalog");
root.KingdomItemCatalog={defs,worldStockStart,validate,get:id=>defs[id]||null,ids:()=>Object.keys(defs)};
})(window);
