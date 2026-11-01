(function(root){"use strict";
const recipes={
 pick:{name:"Stone pick",ingredients:{stone:2,stick:2},output:{pick:1}},
 hoe:{name:"Wooden hoe",ingredients:{wood:1,stick:2},output:{hoe:1}},
 axe:{name:"Stone axe",ingredients:{stone:2,stick:2},output:{axe:1}}
};
function craft(bag,id){const recipe=recipes[id];if(!recipe)return {ok:false,message:"Unknown recipe."};for(const [item,n] of Object.entries(recipe.ingredients))if(bag.count(item)<n)return {ok:false,message:"Need "+n+" "+item+"."};const backup=bag.snapshot();for(const [item,n] of Object.entries(recipe.ingredients))if(!bag.takeItem(item,n)){bag.restore(backup);return {ok:false,message:"Missing ingredients."}}for(const [item,n] of Object.entries(recipe.output))if(!bag.add(item,n)){bag.restore(backup);return {ok:false,message:"Your bag is full."}}return {ok:true,message:"Crafted "+recipe.name+"."}}
root.KingdomCraft={recipes,craft};
})(window);
