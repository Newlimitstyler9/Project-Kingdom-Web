// Shared item definitions: stable IDs, gameplay rules, and existing bag art.
(function(root){"use strict";
const defs={
 charcoal:{name:"Charcoal",type:"material",stack:20,weight:.4,art:["................","......111.......","....112211......","...12222211.....","..1223332211....","..1233333221....","..1233233221....","..1223333221....","...122332211....","....112221......","......111.......","................"],palette:["#00000000","#101415","#252a2b","#454b4c"]},
 bread:{name:"Bread",type:"food",stack:10,weight:.3,nutrition:32,shelfLife:5,art:["................","......111.......","....122221......","...12222221.....","..1223223221....","..1232223221....","..1222222221....","...12222221.....","....111111......","................"],palette:["#00000000","#4a3327","#b07a42","#e8bd78"]},
 ale:{name:"Ale serving",type:"drink",stack:10,weight:.5,art:["................","...11111111.....","...12222221.11..","...12333321.121.","...12333321.121.","...12333321.11..","...12333321.....","....122221......",".....1111.......","................"],palette:["#00000000","#493522","#9d6a35","#ddad59"]},
 axe:{name:"Stone axe",type:"tool",stack:1,weight:1.6,slot:"hand",art:[".....111........","...1122211......","..122222221.....",".1222222221.....","..122222221.....","...1113311......",".......31.......",".......31.......",".......31.......",".......31.......",".......31.......",".......31.......",".......11......."],palette:["#00000000","#343934","#929c92","#a5784c"]},
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
// Player-milled flour uses the same item ID as the village stock ledger.
defs.flour={...defs.flour,portable:true,phase:'playable',art:[
 '................','.....111111.....','....12222221....','...1223333221...','...1233333321...','...1233233321...','...1233333321...','...1233333321...','....12222221....','.....111111.....','................'
],palette:['#00000000','#54483b','#bdac8a','#eee2bd']};
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
defs.torch={...defs.torch,portable:true,phase:'playable',art:['.......3........','......232.......','......232.......','.......1........','......111.......','.......1........','.......1........','.......1........','.......1........','.......1........','................'],palette:['#00000000','#67452c','#d88435','#ffe18b']};
// Starter gear uses the same body-layer silhouettes for both player models.
const gearArt={
 tunic:["................",".....111111.....","...112222211....","..11223332211...","..12222222221...","..12222222221...","...122222221....","....1111111.....","................"],
 trousers:["................","....1111111.....","....1222221.....","....1221221.....","....121.121.....","....121.121.....","....111.111.....","................"],
 blade:[".......3........",".......3........","......232.......","......232.......","......232.......","......232.......","......232.......",".......1........","......111.......",".......1........",".......1........","................"],
 spear:[".......3........","......232.......","......232.......",".......1........",".......1........",".......1........",".......1........",".......1........",".......1........",".......1........","................"],
 dagger:["................",".......3........","......232.......","......232.......",".......1........","......111.......",".......1........","................"],
 axe:["..33333.........","..322223........","..322223........","...2223.........","....11..........",".....1..........","......1.........",".......1........","........1.......","................"],
 ore:["................","......111.......","....112221......","...12223221.....","....122221......",".....1111.......","................"],
 helmet:["................",".....111111.....","...1122222211...","..122233332221..","..122222222221..","...1111111111...","....1......1....","................"],
 gauntlet:["................","....11....11....","...1221..1221...","...1221..1221...","....11....11....","................"],
 boots:["................","....11....11....","...1221..1221...","...1221..1221...","..11111..11111..","................"],
 ingot:["................","...11111111.....","..1222222221....","..1233333321....","...11111111.....","................"]
};
const gear={
 roughTunic:{name:'Rough linen tunic',type:'clothing',slot:'torso',set:'travelerLinen',tier:1,weight:.7,defense:0,tint:'#8f9e74',art:gearArt.tunic,palette:['#00000000','#473d31','#a9a076','#ded3a2']},
 paddedJack:{name:'Quilted jack',type:'armor',slot:'torso',set:'quiltedGuard',tier:2,weight:2.1,defense:2,tint:'#846b56',art:gearArt.tunic,palette:['#00000000','#493a2c','#926f50','#c9a179']},
 travelTrousers:{name:'Linen travel trousers',type:'clothing',slot:'legs',set:'travelerLinen',tier:1,weight:.6,defense:0,tint:'#767a5c',art:gearArt.trousers,palette:['#00000000','#3e4035','#82846b','#b8ad87']},
 reinforcedLeggings:{name:'Quilted leggings',type:'armor',slot:'legs',set:'quiltedGuard',tier:2,weight:1.5,defense:1,tint:'#775d4e',art:gearArt.trousers,palette:['#00000000','#44352d','#8d6b53','#c59d78']},
 chainHauberk:{name:'Iron chain hauberk',type:'armor',slot:'torso',set:'chainGuard',tier:3,weight:5.2,defense:4,visual:'chain',art:gearArt.tunic,palette:['#00000000','#3c4344','#8a9494','#cbd0cb']},
 ironKettleHelm:{name:'Iron kettle helm',type:'armor',slot:'head',set:'chainGuard',tier:3,weight:2.2,defense:2,visual:'kettle',art:gearArt.helmet,palette:['#00000000','#3d4649','#849294','#c9d0ce']},
 ironGauntlets:{name:'Iron gauntlets',type:'armor',slot:'hands',set:'plateGuard',tier:4,weight:1.6,defense:2,visual:'gauntlets',art:gearArt.gauntlet,palette:['#00000000','#3d4649','#849294','#c9d0ce']},
 ironGreaves:{name:'Iron greaves',type:'armor',slot:'legs',set:'plateGuard',tier:4,weight:3.5,defense:3,visual:'plate-legs',art:gearArt.trousers,palette:['#00000000','#3d4649','#849294','#c9d0ce']},
 ironBoots:{name:'Iron sabatons',type:'armor',slot:'feet',set:'plateGuard',tier:4,weight:2.3,defense:2,visual:'plate-boots',art:gearArt.boots,palette:['#00000000','#3d4649','#849294','#c9d0ce']},
 plateCuirass:{name:'Iron plate cuirass',type:'armor',slot:'torso',set:'plateGuard',tier:4,weight:6.5,defense:6,visual:'plate-torso',art:gearArt.tunic,palette:['#00000000','#3d4649','#849294','#c9d0ce']},
 plateHelm:{name:'Iron armet',type:'armor',slot:'head',set:'plateGuard',tier:4,weight:2.8,defense:3,visual:'armet',art:gearArt.helmet,palette:['#00000000','#3d4649','#849294','#c9d0ce']},
 hide:{name:'Animal hide',type:'material',stack:10,weight:1,art:gearArt.tunic,palette:['#00000000','#3b2b21','#836047','#b58a61']},
 leather:{name:'Tanned leather',type:'material',stack:20,weight:.5,art:gearArt.tunic,palette:['#00000000','#33271f','#765037','#b18452']},
 steelBillet:{name:'Steel billet',type:'material',stack:20,weight:.7,art:gearArt.ingot,palette:['#00000000','#263e4a','#779fac','#d5e8e9']},
 leatherHood:{name:'Leather hood',type:'armor',slot:'head',set:'leatherScout',tier:2,weight:.6,defense:1,visual:'leather-hood',art:gearArt.helmet,palette:['#00000000','#362a20','#76523a','#b58b59']},
 leatherJerkin:{name:'Leather jerkin',type:'armor',slot:'torso',set:'leatherScout',tier:2,weight:2.2,defense:3,visual:'leather-torso',art:gearArt.tunic,palette:['#00000000','#362a20','#76523a','#b58b59']},
 leatherGloves:{name:'Leather gloves',type:'armor',slot:'hands',set:'leatherScout',tier:2,weight:.4,defense:1,visual:'leather-gloves',art:gearArt.gauntlet,palette:['#00000000','#362a20','#76523a','#b58b59']},
 leatherLeggings:{name:'Leather leggings',type:'armor',slot:'legs',set:'leatherScout',tier:2,weight:1.7,defense:2,tint:'#674c35',art:gearArt.trousers,palette:['#00000000','#362a20','#76523a','#b58b59']},
 leatherBoots:{name:'Leather boots',type:'armor',slot:'feet',set:'leatherScout',tier:2,weight:1.2,defense:1,visual:'leather-boots',art:gearArt.boots,palette:['#00000000','#362a20','#76523a','#b58b59']},
 steelHelm:{name:'Steel armet',type:'armor',slot:'head',set:'steelGuard',tier:5,weight:2.6,defense:4,visual:'steel-helm',art:gearArt.helmet,palette:['#00000000','#263e4a','#779fac','#d5e8e9']},
 steelCuirass:{name:'Steel cuirass',type:'armor',slot:'torso',set:'steelGuard',tier:5,weight:6.1,defense:8,visual:'steel-torso',art:gearArt.tunic,palette:['#00000000','#263e4a','#779fac','#d5e8e9']},
 steelGauntlets:{name:'Steel gauntlets',type:'armor',slot:'hands',set:'steelGuard',tier:5,weight:1.5,defense:3,visual:'steel-gloves',art:gearArt.gauntlet,palette:['#00000000','#263e4a','#779fac','#d5e8e9']},
 steelGreaves:{name:'Steel greaves',type:'armor',slot:'legs',set:'steelGuard',tier:5,weight:3.3,defense:4,visual:'steel-legs',art:gearArt.trousers,palette:['#00000000','#263e4a','#779fac','#d5e8e9']},
 steelBoots:{name:'Steel sabatons',type:'armor',slot:'feet',set:'steelGuard',tier:5,weight:2.2,defense:3,visual:'steel-boots',art:gearArt.boots,palette:['#00000000','#263e4a','#779fac','#d5e8e9']},
 steelSword:{name:'Steel sword',type:'weapon',slot:'hand',tier:5,weight:1.4,attack:8,art:gearArt.blade,palette:['#00000000','#425262','#83a7b7','#e3f0e9']},
 steelAxe:{name:'Steel axe',type:'weapon',slot:'hand',tier:5,weight:1.8,attack:7,art:gearArt.axe,palette:['#00000000','#58412d','#83a7b7','#e3f0e9']},
 steelDagger:{name:'Steel dagger',type:'weapon',slot:'hand',tier:5,weight:.6,attack:5,art:gearArt.dagger,palette:['#00000000','#425262','#83a7b7','#e3f0e9']},
 steelPick:{name:'Steel pick',type:'tool',slot:'hand',tier:5,weight:1.5,attack:3,art:itemArt.pick,palette:['#00000000','#425262','#83a7b7','#e3f0e9']},
 woodShield:{name:'Wooden shield',type:'armor',slot:'offhand',tier:1,weight:2.3,defense:2,art:['................','.....111111.....','...1122222211...','..112222222211..','..122233322221..','..122233322221..','..122233322221..','...122222221....','....1222221.....','.....12221......','......111.......','................'],palette:['#00000000','#3b2b24','#98633b','#d0ab71']},
 ironShield:{name:'Iron-bound shield',type:'armor',slot:'offhand',tier:3,weight:3.4,defense:4,art:['................','.....111111.....','...1122222211...','..112222222211..','..122233322221..','..122233322221..','..122233322221..','...122222221....','....1222221.....','.....12221......','......111.......','................'],palette:['#00000000','#343d40','#849394','#d7dfdb']},
 ironOre:{name:'Iron ore',type:'material',stack:20,weight:.8,art:gearArt.ore,palette:['#00000000','#414442','#717b78','#b5a38a']},
 ironIngot:{name:'Iron ingot',type:'material',stack:20,weight:.7,art:gearArt.ingot,palette:['#00000000','#3e4545','#89918b','#d1c7ab']},
 ironSword:{name:'Iron sword',type:'weapon',slot:'hand',tier:2,weight:1.5,attack:5,art:gearArt.blade,palette:['#00000000','#563b2b','#858f91','#d9e0d6']},
 ironAxe:{name:'Iron axe',type:'weapon',slot:'hand',tier:2,weight:1.9,attack:4,art:gearArt.axe,palette:['#00000000','#5b402d','#8e9695','#d3d5cc']}
};
for(const [id,def] of Object.entries(gear))defs[id]={stack:1,phase:'playable',...def};
for(const [id,art] of [['knife',gearArt.dagger],['spear',gearArt.spear]])defs[id]={...defs[id],portable:true,phase:'playable',art,palette:['#00000000','#503d2d','#858c84','#d6d4ba']};
defs.knife.name='Stone dagger';defs.knife.attack=2;defs.knife.tier=1;defs.spear.attack=3;defs.spear.tier=1;
for(const definition of Object.values(defs))if(!definition.phase)definition.phase="playable";
function validate(){for(const [id,definition] of Object.entries(defs)){if(!/^[a-z][A-Za-z0-9]*$/.test(id)||!definition.name||!definition.type||!Number.isInteger(definition.stack)||definition.stack<1||!Number.isFinite(definition.weight)||definition.weight<0)return false;if(definition.phase==="playable"&&(!Array.isArray(definition.art)||!Array.isArray(definition.palette)))return false}return true}
const worldStockStart={grain:350,flour:40,wellWater:80,bread:45,vegetables:120,beans:200,eggs:18,fish:8,preserves:180,seed:20,wood:60};
if(!validate()||Object.keys(worldStockStart).some(id=>!defs[id]))throw Error("Invalid item catalog");
root.KingdomItemCatalog={defs,worldStockStart,validate,get:id=>defs[id]||null,ids:()=>Object.keys(defs)};
})(window);
