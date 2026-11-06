// Player identity and starting attributes. Only validated palette keys reach the renderer.
(function(root){'use strict';
const options=Object.freeze({
 body:['male','female'],hair:['short','buzzcut','high-and-tight','bedhead','tied','bob','curly','braid','bald'],
 skin:['fair','warm','tan','brown','deep'],
 hairColor:['black','brown','auburn','blond','silver'],
 shirt:['cream','sage','blue','rust','plum'],
 pants:['brown','charcoal','olive','navy','umber'],
 boots:['brown','dark','tan']
});
const labels={might:'Might',endurance:'Endurance',agility:'Agility'};
const colors={shirt:{cream:'#e5e6c7',sage:'#9ebc85',blue:'#88a9c3',rust:'#ad4c37',plum:'#a48bab'},pants:{brown:'#8b7057',charcoal:'#61636b',olive:'#7e835b',navy:'#606f8d',umber:'#a77955'}};
const defaults={version:1,created:false,name:'Wanderer',body:'male',hair:'short',skin:'fair',hairColor:'brown',shirt:'cream',pants:'brown',boots:'brown',stats:{might:1,endurance:1,agility:1}};
function cleanName(value){return String(value||'').trim().replace(/\s+/g,' ').slice(0,24)||'Wanderer'}
function create(saved){let state=JSON.parse(JSON.stringify(defaults));if(saved)restore(saved);
 function restore(data){if(!data||data.version!==1)return false;state={...defaults,created:data.created===true,name:cleanName(data.name),stats:{...defaults.stats}};for(const [key,allowed] of Object.entries(options))if(allowed.includes(data[key]))state[key]=data[key];for(const key of Object.keys(labels)){const n=Number(data.stats?.[key]);state.stats[key]=Number.isInteger(n)?Math.max(1,Math.min(5,n)):1}if(Object.values(state.stats).reduce((a,b)=>a+b,0)>9)state.stats={...defaults.stats};return true}
 function snapshot(){return {...state,stats:{...state.stats}}}
 function set(key,value){if(key==='name'){state.name=cleanName(value);return true}if(key in labels){if(state.created)return false;const n=Number(value),total=Object.values(state.stats).reduce((a,b)=>a+b,0)-state.stats[key]+n;if(!Number.isInteger(n)||n<1||n>5||total>9)return false;state.stats[key]=n;return true}if(!options[key]?.includes(value))return false;state[key]=value;return true}
 function finish(){state.created=true;return snapshot()}
 return {snapshot,restore,set,finish,get name(){return state.name},get created(){return state.created},get stats(){return {...state.stats}},get appearance(){return {...state,stats:undefined}}};
}
root.KingdomCharacterCreator={create,options,labels,colors,defaults,cleanName};
})(window);
