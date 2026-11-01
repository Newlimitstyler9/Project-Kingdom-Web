(function(root){"use strict";
function create(){let hunger=12,energy=90,daysRested=0,lastMeal=0;
 function hour(){hunger=Math.min(100,hunger+1);energy=Math.max(0,energy-1)}
 function eat(n){if(!Number.isFinite(n)||n<=0)return false;hunger=Math.max(0,hunger-n);lastMeal++;return true}
 function sleep(hours){if(!Number.isInteger(hours)||hours<1||hours>12)return false;energy=Math.min(100,energy+hours*9);hunger=Math.min(100,hunger+Math.floor(hours/2));daysRested++;return true}
 function save(){return {version:1,hunger,energy,daysRested,lastMeal}}
 function restore(d){if(!d||d.version!==1||![d.hunger,d.energy,d.daysRested,d.lastMeal].every(Number.isFinite))return false;hunger=Math.max(0,Math.min(100,d.hunger));energy=Math.max(0,Math.min(100,d.energy));daysRested=d.daysRested;lastMeal=d.lastMeal;return true}
 return {hour,eat,sleep,save,restore,get hunger(){return hunger},get energy(){return energy}};
}
root.KingdomSurvival={create};
})(window);
