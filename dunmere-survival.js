(function(root){"use strict";
function create(){let hunger=12,energy=90,stamina=100,daysRested=0,lastMeal=0;
 function hour(){hunger=Math.min(100,hunger+1);energy=Math.max(0,energy-1)}
 function eat(n){if(!Number.isFinite(n)||n<=0)return false;hunger=Math.max(0,hunger-n);lastMeal++;return true}
 function sleep(hours){if(!Number.isInteger(hours)||hours<1||hours>12)return false;energy=Math.min(100,energy+hours*9);stamina=100;hunger=Math.min(100,hunger+Math.floor(hours/2));daysRested++;return true}
 function exert(seconds,weightRatio=0){if(!Number.isFinite(seconds)||seconds<0)return false;stamina=Math.max(0,stamina-seconds*(22+Math.max(0,weightRatio)*12));return stamina>0}
 function recover(seconds,moving=false){if(!Number.isFinite(seconds)||seconds<0)return false;stamina=Math.min(100,stamina+seconds*(moving?8:16)*(hunger>85?.55:1));return true}
 function save(){return {version:1,hunger,energy,stamina,daysRested,lastMeal}}
 function restore(d){if(!d||d.version!==1||![d.hunger,d.energy,d.daysRested,d.lastMeal].every(Number.isFinite))return false;hunger=Math.max(0,Math.min(100,d.hunger));energy=Math.max(0,Math.min(100,d.energy));stamina=Number.isFinite(d.stamina)?Math.max(0,Math.min(100,d.stamina)):100;daysRested=d.daysRested;lastMeal=d.lastMeal;return true}
 return {hour,eat,sleep,exert,recover,save,restore,get hunger(){return hunger},get energy(){return energy},get stamina(){return stamina}};
}
root.KingdomSurvival={create};
})(window);
