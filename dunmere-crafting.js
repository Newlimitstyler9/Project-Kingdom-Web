// Recipes reference the shared item catalog. Planned recipes stay out of the playable menu.
(function(root){"use strict";
const recipes={
 pick:{name:"Stone pick",category:"tool",ingredients:{stone:2,stick:2},output:{pick:1}},
 hoe:{name:"Wooden hoe",category:"tool",ingredients:{wood:1,stick:2},output:{hoe:1}},
 axe:{name:"Stone axe",category:"tool",ingredients:{stone:2,stick:2},output:{axe:1}},
 campfire:{name:"Campfire kit",category:"camp",ingredients:{stone:4,stick:2},output:{campfire:1}},
 tent:{name:"Travel tent",category:"camp",ingredients:{stick:4,cloth:4,fiber:2},output:{tent:1}},
 bedroll:{name:"Bedroll",category:"camp",ingredients:{cloth:3,fiber:2},output:{bedroll:1}}
};
const planned={
 tinder:{name:"Tinder bundle",category:"survival",ingredients:{fiber:2,stick:1},output:{tinder:1}},
 torch:{name:"Torch",category:"tool",ingredients:{stick:1,fiber:2,tinder:1},output:{torch:1}},
 knife:{name:"Stone knife",category:"weapon",ingredients:{stone:2,stick:1,fiber:1},output:{knife:1}},
 spear:{name:"Wooden spear",category:"weapon",ingredients:{stick:2,stone:1,fiber:1},output:{spear:1}},
 waterVessel:{name:"Fired clay vessel",category:"container",ingredients:{clay:3},fuel:{wood:1},output:{waterVessel:1},station:"kiln"},
 fillWater:{name:"Collect water",category:"survival",ingredients:{waterVessel:1},output:{dirtyWater:1},station:"waterSource"},
 boilWater:{name:"Boil water",category:"cooking",ingredients:{dirtyWater:1},fuel:{wood:1},output:{cleanWater:1},station:"campfire"},
 cookFish:{name:"Cook fish",category:"cooking",ingredients:{fish:1},fuel:{wood:1},output:{cookedFish:1},station:"campfire"}
};
const production={
 mill:{name:"Mill grain",category:"trade",ingredients:{grain:2},output:{flour:2},station:"mill"},
 bread:{name:"Bake bread",category:"trade",ingredients:{flour:2,wellWater:1},fuel:{wood:1},output:{bread:3},station:"oven"},
 preserves:{name:"Dry vegetables",category:"trade",ingredients:{vegetables:10},output:{preserves:9},station:"dryingRack"}
};
Object.assign(recipes,{knife:planned.knife,spear:planned.spear});
delete planned.knife;delete planned.spear;
Object.assign(production,{
 charcoal:{name:'Burn covered wood for charcoal',category:'material',ingredients:{wood:2},output:{charcoal:1},station:'campfire'},
 leather:{name:'Tan a hide',category:'material',ingredients:{hide:1,wood:1},output:{leather:1},station:'leatherBench',skill:'leatherworking',level:0},
 leatherHood:{name:'Leather hood',category:'armor',ingredients:{leather:1,cloth:1},output:{leatherHood:1},station:'leatherBench',skill:'leatherworking',level:1},
 leatherJerkin:{name:'Leather jerkin',category:'armor',ingredients:{leather:3,cloth:1},output:{leatherJerkin:1},station:'leatherBench',skill:'leatherworking',level:2},
 leatherGloves:{name:'Leather gloves',category:'armor',ingredients:{leather:1,cloth:1},output:{leatherGloves:1},station:'leatherBench',skill:'leatherworking',level:1},
 leatherLeggings:{name:'Leather leggings',category:'armor',ingredients:{leather:2,cloth:1},output:{leatherLeggings:1},station:'leatherBench',skill:'leatherworking',level:2},
 leatherBoots:{name:'Leather boots',category:'armor',ingredients:{leather:2,cloth:1},output:{leatherBoots:1},station:'leatherBench',skill:'leatherworking',level:2},
 steelBillet:{name:'Refine steel billet',category:'material',ingredients:{ironIngot:1,charcoal:2},output:{steelBillet:1},station:'forge',skill:'blacksmithing',level:5},
 steelHelm:{name:'Steel armet',category:'armor',ingredients:{steelBillet:3,cloth:1},output:{steelHelm:1},station:'anvil',skill:'blacksmithing',level:6},
 steelCuirass:{name:'Steel cuirass',category:'armor',ingredients:{steelBillet:5,cloth:2},output:{steelCuirass:1},station:'anvil',skill:'blacksmithing',level:7},
 steelGauntlets:{name:'Steel gauntlets',category:'armor',ingredients:{steelBillet:2,cloth:1},output:{steelGauntlets:1},station:'anvil',skill:'blacksmithing',level:6},
 steelGreaves:{name:'Steel greaves',category:'armor',ingredients:{steelBillet:3,cloth:1},output:{steelGreaves:1},station:'anvil',skill:'blacksmithing',level:6},
 steelBoots:{name:'Steel sabatons',category:'armor',ingredients:{steelBillet:2,cloth:1},output:{steelBoots:1},station:'anvil',skill:'blacksmithing',level:6},
 steelSword:{name:'Steel sword',category:'weapon',ingredients:{steelBillet:3,wood:1},output:{steelSword:1},station:'anvil',skill:'blacksmithing',level:7},
 steelAxe:{name:'Steel axe',category:'weapon',ingredients:{steelBillet:2,wood:1},output:{steelAxe:1},station:'anvil',skill:'blacksmithing',level:7},
 steelDagger:{name:'Steel dagger',category:'weapon',ingredients:{steelBillet:1,wood:1},output:{steelDagger:1},station:'anvil',skill:'blacksmithing',level:6},
 steelPick:{name:'Steel pick',category:'tool',ingredients:{steelBillet:2,wood:1},output:{steelPick:1},station:'anvil',skill:'blacksmithing',level:7},
 cloth:{name:'Weave rough cloth',category:'material',ingredients:{fiber:4},output:{cloth:1},station:'loom',skill:'tailoring',level:0},
 roughTunic:{name:'Rough linen tunic',category:'clothing',ingredients:{cloth:2,fiber:1},output:{roughTunic:1},station:'loom',skill:'tailoring',level:0},
 travelTrousers:{name:'Linen travel trousers',category:'clothing',ingredients:{cloth:2,fiber:1},output:{travelTrousers:1},station:'loom',skill:'tailoring',level:0},
 paddedJack:{name:'Quilted jack',category:'armor',ingredients:{cloth:4,fiber:2},output:{paddedJack:1},station:'loom',skill:'tailoring',level:2},
 reinforcedLeggings:{name:'Quilted leggings',category:'armor',ingredients:{cloth:3,fiber:2},output:{reinforcedLeggings:1},station:'loom',skill:'tailoring',level:2},
 ironIngot:{name:'Smelt iron',category:'material',ingredients:{ironOre:2,charcoal:1},output:{ironIngot:1},station:'forge',skill:'blacksmithing',level:0},
 ironAxe:{name:'Iron axe',category:'weapon',ingredients:{ironIngot:2,wood:1},output:{ironAxe:1},station:'anvil',skill:'blacksmithing',level:2},
 ironSword:{name:'Iron sword',category:'weapon',ingredients:{ironIngot:3,wood:1},output:{ironSword:1},station:'anvil',skill:'blacksmithing',level:3},
 chainHauberk:{name:'Iron chain hauberk',category:'armor',ingredients:{ironIngot:3,cloth:2},output:{chainHauberk:1},station:'anvil',skill:'blacksmithing',level:3},
 ironKettleHelm:{name:'Iron kettle helm',category:'armor',ingredients:{ironIngot:2},output:{ironKettleHelm:1},station:'anvil',skill:'blacksmithing',level:3},
 ironGauntlets:{name:'Iron gauntlets',category:'armor',ingredients:{ironIngot:2,cloth:1},output:{ironGauntlets:1},station:'anvil',skill:'blacksmithing',level:4},
 ironGreaves:{name:'Iron greaves',category:'armor',ingredients:{ironIngot:3,cloth:1},output:{ironGreaves:1},station:'anvil',skill:'blacksmithing',level:4},
 ironBoots:{name:'Iron sabatons',category:'armor',ingredients:{ironIngot:2,cloth:1},output:{ironBoots:1},station:'anvil',skill:'blacksmithing',level:4},
 plateCuirass:{name:'Iron plate cuirass',category:'armor',ingredients:{ironIngot:5,cloth:2},output:{plateCuirass:1},station:'anvil',skill:'blacksmithing',level:5},
 plateHelm:{name:'Iron armet',category:'armor',ingredients:{ironIngot:3},output:{plateHelm:1},station:'anvil',skill:'blacksmithing',level:5}
});
function validate(){const defs=root.KingdomItemCatalog?.defs;if(!defs)return false;for(const recipe of Object.values({...recipes,...planned,...production})){if(!recipe.name||!recipe.category||!recipe.ingredients||!recipe.output)return false;for(const [id,n] of Object.entries({...recipe.ingredients,...(recipe.fuel||{}),...recipe.output}))if(!defs[id]||!Number.isInteger(n)||n<1)return false}return true}
if(!validate())throw Error("Recipe catalog references an unknown item");
function make(bag,recipe,context={}){const level=recipe.skill?(Number(context.skills?.[recipe.skill])||0):0;if(level<(recipe.level||0))return {ok:false,message:'Need '+recipe.skill+' level '+recipe.level+'.'};const inputs={...recipe.ingredients,...(recipe.fuel||{})};for(const [item,n] of Object.entries(inputs))if(bag.count(item)<n)return {ok:false,message:"Need "+n+" "+root.KingdomItemCatalog.defs[item].name.toLowerCase()+"."};const backup=bag.snapshot();for(const [item,n] of Object.entries(inputs))if(!bag.takeItem(item,n)){bag.restore(backup);return {ok:false,message:"Missing ingredients."}}const quality=Math.max(1,Math.min(5,1+Math.floor((level+(Number(context.teacher)||0))/3)));for(const [item,n] of Object.entries(recipe.output)){const def=root.KingdomItemCatalog.defs[item],meta=def.slot&&recipe.skill?{quality,maker:String(context.maker||'Player')}:null;if(!bag.add(item,n,meta)){bag.restore(backup);return {ok:false,message:"Your bag is full."}}}if(inputs.charcoal)bag.commitCharcoal?.(inputs.charcoal);if(recipe.skill&&context.skills)context.skills[recipe.skill]=Math.min(20,level+1);return {ok:true,quality,message:"Made "+recipe.name.toLowerCase()+(recipe.skill?' (quality '+quality+').':' .').replace(' .','.')}}
function craft(bag,id){const recipe=recipes[id];return recipe?make(bag,recipe):{ok:false,message:"Recipe is not available yet."}}
function craftAtStation(bag,id,station,context={}){const recipe=production[id];if(!recipe||recipe.station!==station)return {ok:false,message:"This station cannot make that."};const result=make(bag,recipe,context);if(result.ok&&id==='mill')result.message='Ground two grain into two flour.';return result}
root.KingdomCraft={recipes,planned,production,craft,craftAtStation,validate};
})(window);
