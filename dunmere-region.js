// Playable Brooklands geography around Dunmere. Seeded terrain and sparse saved changes.
(function(root){"use strict";
// Keep the original 128x96 sector at its exact coordinates so older saves remain valid.
const width=256,height=192;
const sites={
 dunmere:{name:'Dunmere',x:64.5,y:47.5,kind:'settlement'},
 mill:{name:'Brook Mill',x:49.5,y:55.5,kind:'mill'},
 westfield:{name:'Westfield',x:63.5,y:68.5,kind:'field'},
 timber:{name:'Eastwood Timber Yard',x:104.5,y:67.5,kind:'timber'},
 mine:{name:'North Ridge Mine',x:107.5,y:22.5,kind:'mine'},
 start:{name:'Wilderness Trail',x:25.5,y:78.5,kind:'start'},
 marrowRoad:{name:'Marrowfield Road',x:55.5,y:151.5,kind:'road'},
 southMeadow:{name:'South Meadow',x:105.5,y:165.5,kind:'meadow'},
 hollowwood:{name:'Hollowwood',x:183.5,y:119.5,kind:'woods'},
 ridgePass:{name:'North Ridge Pass',x:184.5,y:34.5,kind:'pass'}
};
const structures=[
 {id:'western-cottage',name:'West Cottage',kind:'cottage',interior:'cottage1',x:59,y:34,w:5,h:4,doorX:61,doorY:37},
 {id:'regional-inn',name:'Dunmere Inn',kind:'tavern',interior:'inn',x:53,y:40,w:5,h:4,doorX:55,doorY:43},
 {id:'regional-bakery',name:'Bakehouse',kind:'bakery',interior:'bakery',x:72,y:40,w:5,h:4,doorX:74,doorY:43},
 {id:'eastern-cottage',name:'East Cottage',kind:'cottage',interior:'cottage4',x:68,y:34,w:5,h:4,doorX:70,doorY:37},
 {id:'regional-mill',name:'Brook Mill',kind:'mill',interior:'mill',x:47,y:49,w:5,h:4,doorX:49,doorY:52}
];
const props=[
 {sprite:'marketStallBlue',x:58,y:49,w:2,h:3},
 {sprite:'marketStallGold',x:69,y:49,w:2,h:3},
 {sprite:'yardCart',x:78,y:44,w:2,h:2},
 {sprite:'yardLogs',x:77,y:42,w:1.5,h:1.5},
 {sprite:'bakerySackPile',x:76,y:45,w:1.3,h:1},
 {sprite:'yardTrough',x:50,y:44,w:1.7,h:1}
];
const routes=[
 [[7,47],[30,47],[44,47],[64,47],[87,48],[102,51],[117,52]],
 [[25,79],[34,76],[46.5,73.5],[52,70],[55,68],[55,55],[49,55]],
 [[55,44],[55,47]],[[74,44],[74,47]],
 [[61,38],[59,43],[59,47]],[[70,38],[69,43],[69,47]],
 [[101,51],[102,39],[105,29],[107,22]],
 [[102,51],[104,68]],[[49,55],[55,55],[59,53],[60,52],[64,47]],
 [[55,68],[57.5,68.5]]
 ,[[55,190],[55,151],[55,94],[55,68]],
 [[55,151],[73,156],[105,165],[139,167]],
 [[117,52],[146,53],[170,59],[205,62],[235,64]],
 [[104,68],[134,75],[157,89],[183,119],[211,132]],
 [[107,22],[140,19],[164,26],[184,34],[215,39]]
];
function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)}
function road(x,y){const greenRing=Math.abs(Math.hypot(x+.5-63.5,y+.5-44.5)-5.3)<.66;return greenRing||routes.some(route=>route.some((point,i)=>i&&segmentDistance(x+.5,y+.5,route[i-1],point)<.67))}
function brook(y){return 44+2.3*Math.sin(y*.12)+1.2*Math.sin(y*.37)}
function hash(x,y){let v=(x*73856093^y*19349663^874)>>>0;v^=v>>>13;v=Math.imul(v,1274126177)>>>0;return v}
function zone(x,y){
 if(((x-110)/40)**2+((y-17)/28)**2<1||((x-182)/53)**2+((y-29)/24)**2<1)return 'ridge';
 if(((x-184)/31)**2+((y-119)/32)**2<1)return 'hollowwood';
 if(((x-110)/33)**2+((y-153)/27)**2<1)return 'southMeadow';
 if(((x-73)/31)**2+((y-143)/30)**2<1)return 'marrowFields';
 if(((x-205)/33)**2+((y-72)/25)**2<1)return 'eastwood';
 if(((x-25)/32)**2+((y-142)/40)**2<1)return 'wilderness';
 if(((x-20)/22)**2+((y-20)/20)**2<1)return 'commonWoods';
 if(((x-22)/24)**2+((y-76)/21)**2<1)return 'wilderness';
 if(x>57&&x<81&&y>57&&y<82)return 'westfield';
 if(((x-100)/24)**2+((y-60)/24)**2<1)return 'eastwood';
 if(x>52&&x<77&&y>34&&y<58)return 'dunmere';
 return 'meadow';
}
function baseTile(x,y){
 if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=width||y>=height)return null;
 const area=zone(x,y),path=road(x,y),water=Math.abs(x+.5-brook(y+.5))<1.25;
 const bridge=water&&path&&(Math.abs(y-47)<2||Math.abs(y-73)<2);
 const nearSite=Object.values(sites).some(s=>Math.hypot(x+.5-s.x,y+.5-s.y)<2.4)||x>=99&&x<=111&&y>=57&&y<=66||x>=102&&x<=113&&y>=14&&y<=21||x>=45&&x<=54&&y>=48&&y<=55;
 const n=hash(x,y),trees=['commonWoods','wilderness','eastwood','hollowwood'].includes(area);
 let cover=null;
 if(!path&&!water&&!nearSite){
  if(trees&&n%7===0)cover='forest';
  else if(area==='ridge'&&n%6===0)cover='stones';
  else if(!['westfield','marrowFields'].includes(area)&&n%31===0)cover='brush';
 }
 return {area,road:path,water,bridge,cover,terrain:area==='ridge'?'rock':'soil'};
}
function nearSite(x,y,max=2){return Object.entries(sites).find(([,s])=>Math.hypot(x-s.x,y-s.y)<max)?.[0]||null}
function create(){const gathered={},felled=new Set(),treeHits=new Map();
 function tile(x,y){const t=baseTile(x,y);if(t&&felled.has(x+','+y))return {...t,cover:null,stump:true};return t}
 function pass(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||x<1||y<1||x>=width-1||y>=height-1)return false;const t=tile(Math.floor(x),Math.floor(y));const mineRock=x>=102&&x<113&&y>=15&&y<21&&!(x>=106&&x<109&&y>=19);const timberShed=x>=100&&x<109&&y>=59&&y<65;const millArt=x>=45&&x<54&&y>=49&&y<54;const oakTrunk=Math.hypot(x-63.5,y-45.7)<.7;return !!t&&(!t.water||t.bridge)&&t.cover!=='forest'&&!mineRock&&!timberShed&&!millArt&&!oakTrunk&&!structures.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)&&!props.some(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h)}
 function nearestTree(x,y,max=1.55){let best=null,distance=max;for(let yy=Math.floor(y)-2;yy<=Math.floor(y)+2;yy++)for(let xx=Math.floor(x)-2;xx<=Math.floor(x)+2;xx++){if(tile(xx,yy)?.cover!=='forest')continue;const d=Math.hypot(xx+.5-x,yy+.5-y);if(d<distance){best={x:xx,y:yy};distance=d}}return best}
 function chopTree(x,y,bag){const tree=nearestTree(x,y);if(!tree)return {ok:false,message:'No tree is in reach.'};if(bag.equipped!=='axe')return {ok:false,message:'Equip an axe to cut this tree.'};const key=tree.x+','+tree.y,hits=(treeHits.get(key)||0)+1;if(hits<3){treeHits.set(key,hits);return {ok:true,felled:false,tree,message:'You strike the trunk ('+hits+'/3).'}}const before=bag.snapshot();if(!bag.add('wood',2)||!bag.add('stick',1)){bag.restore(before);treeHits.set(key,2);return {ok:false,message:'Your bag is full.'}}treeHits.delete(key);felled.add(key);return {ok:true,felled:true,tree,message:'The tree falls. You collect two wood and a stick.'}}
 function gather(site,day,bag){if(!['timber','mine'].includes(site))return {ok:false,message:'No resource to gather here.'};if(gathered[site]===day)return {ok:false,message:'You have gathered what is loose here today.'};const item=site==='timber'?'wood':'stone',tool=site==='timber'?'axe':'pick';if(bag.equipped!==tool)return {ok:false,message:'Equip a '+tool+' first.'};if(!bag.add(item,2))return {ok:false,message:'Your bag is full.'};gathered[site]=day;return {ok:true,message:'Collected 2 '+item+' near '+sites[site].name+'.'}}
 function snapshot(){return {version:2,gathered:{...gathered},felled:[...felled]}}
 function restore(data){if(!data||![1,2].includes(data.version)||!data.gathered||typeof data.gathered!=='object')return false;for(const key of ['timber','mine'])if(data.gathered[key]!==undefined&&(!Number.isInteger(data.gathered[key])||data.gathered[key]<1))return false;Object.assign(gathered,data.gathered);if(data.version===2&&Array.isArray(data.felled))for(const key of data.felled.slice(0,2000)){if(typeof key!=='string'||!/^\d{1,3},\d{1,3}$/.test(key))continue;const [x,y]=key.split(',').map(Number);if(baseTile(x,y)?.cover==='forest')felled.add(key)}return true}
 return {width,height,sites,structures,props,road,brook,zone,tile,pass,nearSite,nearestTree,chopTree,gather,snapshot,restore};}
root.KingdomRegion={create};
})(window);
