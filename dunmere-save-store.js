(function(root){"use strict";
function create(storage,key){
 function valid(raw){if(!raw)return null;try{const d=JSON.parse(raw);return d&&d.version===1&&d.town&&d.food&&d.hauling&&Array.isArray(d.actors)?d:null}catch(e){return null}}
 function save(value){try{const raw=JSON.stringify(value);if(!valid(raw))return false;storage.setItem(key+".pending",raw);if(storage.getItem(key+".pending")!==raw)return false;const old=storage.getItem(key);if(valid(old))storage.setItem(key+".backup",old);storage.setItem(key,raw);storage.removeItem(key+".pending");return true}catch(e){return false}}
 function load(){for(const suffix of ["",".pending",".backup"]){const result=valid(storage.getItem(key+suffix));if(result)return result}return null}
 return {save,load};
}
root.KingdomSaveStore={create};
})(window);
