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
function validate(){const defs=root.KingdomItemCatalog?.defs;if(!defs)return false;for(const recipe of Object.values({...recipes,...planned,...production})){if(!recipe.name||!recipe.category||!recipe.ingredients||!recipe.output)return false;for(const [id,n] of Object.entries({...recipe.ingredients,...(recipe.fuel||{}),...recipe.output}))if(!defs[id]||!Number.isInteger(n)||n<1)return false}return true}
if(!validate())throw Error("Recipe catalog references an unknown item");
function craft(bag,id){const recipe=recipes[id];if(!recipe)return {ok:false,message:"Recipe is not available yet."};for(const [item,n] of Object.entries(recipe.ingredients))if(bag.count(item)<n)return {ok:false,message:"Need "+n+" "+root.KingdomItemCatalog.defs[item].name.toLowerCase()+"."};const backup=bag.snapshot();for(const [item,n] of Object.entries(recipe.ingredients))if(!bag.takeItem(item,n)){bag.restore(backup);return {ok:false,message:"Missing ingredients."}}for(const [item,n] of Object.entries(recipe.output))if(!bag.add(item,n)){bag.restore(backup);return {ok:false,message:"Your bag is full."}}return {ok:true,message:"Crafted "+recipe.name+"."}}
root.KingdomCraft={recipes,planned,production,craft,validate};
})(window);
