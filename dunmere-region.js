// Playable Brooklands geography around Dunmere. Seeded terrain and sparse saved changes.
(function(root){"use strict";
// Keep the original 128x96 sector at its exact coordinates so older saves remain valid.
const width=256,height=192;
const greyfordBounds={x:130,y:72,w:96,h:76};
function greyfordLocal(x,y){return {x:x-greyfordBounds.x,y:y-greyfordBounds.y}}
function inGreyford(x,y){const q=greyfordLocal(x,y);return q.x>=0&&q.y>=0&&q.x<greyfordBounds.w&&q.y<greyfordBounds.h}
const sites={
 dunmere:{name:'Dunmere',x:64.5,y:47.5,kind:'settlement'},
 greyford:{name:'Greyford',x:178.5,y:107.5,kind:'settlement'},
 marrowfield:{name:'Marrowfield',x:68.5,y:155.5,kind:'settlement'},
 mill:{name:'Brook Mill',x:49.5,y:55.5,kind:'mill'},
 westfield:{name:'Westfield',x:63.5,y:68.5,kind:'field'},
 timber:{name:'Eastwood Timber Yard',x:104.5,y:67.5,kind:'timber'},
 mine:{name:'North Ridge Mine',x:107.5,y:22.5,kind:'mine'},
 start:{name:'Wilderness Trail',x:25.5,y:78.5,kind:'start'},
 marrowRoad:{name:'Marrowfield Road',x:55.5,y:151.5,kind:'road'},
 southMeadow:{name:'South Meadow',x:105.5,y:165.5,kind:'meadow'},
 hollowwood:{name:'Hollowwood',x:237.5,y:154.5,kind:'woods'},
 ridgePass:{name:'North Ridge Pass',x:184.5,y:34.5,kind:'pass'}
};
const structures=[
 {id:'western-cottage',name:'West Cottage',kind:'cottage',interior:'cottage1',x:59,y:34,w:5,h:4,doorX:61,doorY:37},
 {id:'regional-inn',name:'Dunmere Inn',kind:'tavern',interior:'inn',x:53,y:40,w:5,h:4,doorX:55,doorY:43},
 {id:'regional-bakery',name:'Bakehouse',kind:'bakery',interior:'bakery',x:72,y:40,w:5,h:4,doorX:74,doorY:43},
 {id:'eastern-cottage',name:'East Cottage',kind:'cottage',interior:'cottage4',x:68,y:34,w:5,h:4,doorX:70,doorY:37},
  {id:'regional-mill',name:'Brook Mill',kind:'mill',interior:'mill',x:47,y:49,w:5,h:4,doorX:49,doorY:52},
  {id:'marrow-inn',name:'The Threshing Rest',kind:'tavern',type:'market-inn',visual:'greyford',interior:'marrow-inn',x:62,y:137,w:7,h:5,doorX:65,doorY:141},
  {id:'marrow-granary',name:'Marrowfield Granary',kind:'granary',type:'granary',visual:'greyford',interior:'marrow-granary',x:63,y:146,w:8,h:5,doorX:67,doorY:150},
  {id:'marrow-croft',name:'Reed Croft',kind:'home',type:'home',visual:'greyford',interior:'marrow-croft',x:72,y:137,w:5,h:4,doorX:74,doorY:140},
  {id:'marrow-bakehouse',name:'South Oven',kind:'bakery',type:'bakery',visual:'greyford',interior:'marrow-bakehouse',x:75,y:146,w:6,h:5,doorX:78,doorY:150},
  {id:'marrow-hall',name:'Marrowfield Hall',kind:'court',type:'court',visual:'greyford',interior:'marrow-hall',x:45,y:136,w:7,h:5,doorX:48,doorY:140}
];
const props=[
 {sprite:'marketStallBlue',x:58,y:49,w:2,h:3},
 {sprite:'marketStallGold',x:69,y:49,w:2,h:3},
 {sprite:'yardCart',x:78,y:44,w:2,h:2},
 {sprite:'yardLogs',x:77,y:42,w:1.5,h:1.5},
 {sprite:'bakerySackPile',x:76,y:45,w:1.3,h:1},
 {sprite:'yardTrough',x:50,y:44,w:1.7,h:1},
 {sprite:'yardCart',x:57,y:138,w:2,h:2},
 {sprite:'bakerySackPile',x:60,y:146,w:1.5,h:1.5},
 {sprite:'yardLogs',x:72,y:148,w:1.5,h:1.5},
 {sprite:'yardTrough',x:82,y:143,w:1.8,h:1},
 {sprite:'marketStallGold',x:82,y:150,w:2,h:3}
];
const routes=[
 [[7,47],[30,47],[44,47],[64,47],[87,48],[102,51],[117,52]],
 [[25,79],[34,76],[46.5,73.5],[52,70],[55,68],[55,55],[49,55]],
 [[55,44],[55,47]],[[74,44],[74,47]],
 [[61,38],[59,43],[59,47]],[[70,38],[69,43],[69,47]],
 [[101,51],[102,39],[105,29],[107,22]],
 [[117,52],[120,70],[116,87],[116,107],[130,107],[148,107]],
 [[102,51],[104,68]],[[49,55],[55,55],[59,53],[60,52],[64,47]],
 [[55,68],[57.5,68.5]]
  ,[[55,143],[60,143],[65,143],[65,142]]
  ,[[65,143],[74,143],[74,141]]
  ,[[55,153],[67,153],[67,151]]
  ,[[67,153],[78,153],[78,151]]
  ,[[55,143],[53,143],[48,143],[48,141]]
 ,[[55,190],[55,151],[55,94],[55,68]],
 [[55,151],[73,156],[105,165],[139,167]],
 [[117,52],[146,53],[170,59],[205,62],[235,64]],
 [[104,68],[134,75],[157,89],[211,132],[237,154]],
 [[107,22],[120,23],[140,19],[164,26],[184,34],[215,39]]
];
function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)}
function road(x,y){const greenRing=Math.abs(Math.hypot(x+.5-63.5,y+.5-44.5)-5.3)<.66;return greenRing||routes.some(route=>route.some((point,i)=>i&&segmentDistance(x+.5,y+.5,route[i-1],point)<.67))}
function brook(y){return 44+2.3*Math.sin(y*.12)+1.2*Math.sin(y*.37)}
function greyRiver(y){const localY=y-72,outside=y<72?y-72:y>=148?y-148:0;return 141+1.1*Math.sin(localY*.095)+.6*Math.sin(localY*.31)+1.3*Math.sin(outside*.045)}
function pond(x,y,cx,cy,rx,ry){const edge=1+.1*Math.sin(x*.53+y*.17)+.07*Math.cos(y*.41-x*.23);return ((x-cx)/rx)**2+((y-cy)/ry)**2<edge}
function creek(x,y){if(y<84||y>101)return false;const center=44+(y-85)*2.45+1.6*Math.sin(y*.41);return Math.abs(x-center)<.75}
function hash(x,y){let v=(x*73856093^y*19349663^874)>>>0;v^=v>>>13;v=Math.imul(v,1274126177)>>>0;return v}
const marrowTrees=new Set(['57,135','85,139','85,155','59,159']);
function zone(x,y){
  if(pond(x,y,110,17,40,28)||pond(x,y,182,29,53,24))return 'ridge';
  if(pond(x,y,237,154,18,28))return 'hollowwood';
  if(pond(x,y,110,153,33,27))return 'southMeadow';
  if(pond(x,y,73,143,31,30))return 'marrowFields';
  if(pond(x,y,205,72,33,25))return 'eastwood';
  if(pond(x,y,25,142,32,40))return 'wilderness';
  if(pond(x,y,20,20,22,20))return 'commonWoods';
  if(pond(x,y,22,76,24,21))return 'wilderness';
 if(x>57&&x<81&&y>57&&y<82)return 'westfield';
  if(pond(x,y,100,60,24,24))return 'eastwood';
 if(x>52&&x<77&&y>34&&y<58)return 'dunmere';
 return 'meadow';
}
function baseTile(x,y){
 if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=width||y>=height)return null;
 if(inGreyford(x+.5,y+.5))return {area:'greyford',road:false,water:false,bridge:false,cover:null,terrain:'soil'};
  const area=zone(x,y),path=road(x,y);
  const water=Math.abs(x+.5-brook(y+.5))<1.25||!inGreyford(x+.5,y+.5)&&Math.abs(x+.5-greyRiver(y+.5))<3.5&&(y<72||y>=148)||pond(x+.5,y+.5,90,94,8,5)||pond(x+.5,y+.5,199,162,9,6)||pond(x+.5,y+.5,29,118,5,4)||creek(x+.5,y+.5);
  const bridge=water&&path;
 const nearSite=Object.values(sites).some(s=>Math.hypot(x+.5-s.x,y+.5-s.y)<2.4)||x>=99&&x<=111&&y>=57&&y<=66||x>=102&&x<=113&&y>=14&&y<=21||x>=45&&x<=54&&y>=48&&y<=55;
 const n=hash(x,y),trees=['commonWoods','wilderness','eastwood','hollowwood'].includes(area);
 let cover=null;
 if(!path&&!water&&!nearSite){
  if(marrowTrees.has(x+','+y)||trees&&n%7===0)cover='forest';
  else if(area==='ridge'&&n%6===0)cover='stones';
  else if(!['westfield','marrowFields'].includes(area)&&n%31===0)cover='brush';
 }
 return {area,road:path,water,bridge,cover,terrain:area==='ridge'?'rock':'soil'};
}
function nearSite(x,y,max=2){return Object.entries(sites).find(([,s])=>Math.hypot(x-s.x,y-s.y)<max)?.[0]||null}
function create(){const gathered={},felled=new Set(),treeHits=new Map();
 function tile(x,y){const t=baseTile(x,y);if(t&&felled.has(x+','+y))return {...t,cover:null,stump:true};return t}
 function pass(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||x<1||y<1||x>=width-1||y>=height-1)return false;if(inGreyford(x,y)&&root.GreyfordWorld){const q=greyfordLocal(x,y);return root.GreyfordWorld.pass(q.x,q.y,0,true)}const t=tile(Math.floor(x),Math.floor(y));const mineRock=x>=96&&x<119&&y>=13&&y<22&&!(x>=106&&x<109&&y>=19);const timberShed=x>=100&&x<109&&y>=59&&y<65;const oakTrunk=Math.hypot(x-63.5,y-45.7)<.7;return !!t&&(!t.water||t.bridge)&&t.cover!=='forest'&&!mineRock&&!timberShed&&!oakTrunk&&!structures.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)&&!props.some(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h)}
 function nearestTree(x,y,max=1.55){let best=null,distance=max;for(let yy=Math.floor(y)-2;yy<=Math.floor(y)+2;yy++)for(let xx=Math.floor(x)-2;xx<=Math.floor(x)+2;xx++){if(tile(xx,yy)?.cover!=='forest')continue;const d=Math.hypot(xx+.5-x,yy+.5-y);if(d<distance){best={x:xx,y:yy};distance=d}}return best}
 function chopTree(x,y,bag){const tree=nearestTree(x,y);if(!tree)return {ok:false,message:'No tree is in reach.'};if(!['axe','ironAxe','steelAxe'].includes(bag.equipped))return {ok:false,message:'Equip an axe to cut this tree.'};const key=tree.x+','+tree.y,needed=bag.equipped==='axe'?3:2,hits=(treeHits.get(key)||0)+1;if(hits<needed){treeHits.set(key,hits);return {ok:true,felled:false,tree,message:'You strike the trunk ('+hits+'/'+needed+').'}}const before=bag.snapshot();if(!bag.add('wood',2)||!bag.add('stick',1)){bag.restore(before);treeHits.set(key,needed-1);return {ok:false,message:'Your bag is full.'}}treeHits.delete(key);felled.add(key);return {ok:true,felled:true,tree,message:'The tree falls. You collect two wood and a stick.'}}
 function gather(site,day,bag){if(!['timber','mine'].includes(site))return {ok:false,message:'No resource to gather here.'};if(gathered[site]===day)return {ok:false,message:'You have gathered what is loose here today.'};const item=site==='timber'?'wood':'stone',tools=site==='timber'?['axe','ironAxe','steelAxe']:['pick','steelPick'];if(!tools.includes(bag.equipped))return {ok:false,message:'Equip a '+(site==='timber'?'axe':'pick')+' first.'};if(!bag.add(item,2))return {ok:false,message:'Your bag is full.'};gathered[site]=day;return {ok:true,message:'Collected 2 '+item+' near '+sites[site].name+'.'}}
 function snapshot(){return {version:2,gathered:{...gathered},felled:[...felled]}}
 function restore(data){if(!data||![1,2].includes(data.version)||!data.gathered||typeof data.gathered!=='object')return false;for(const key of ['timber','mine'])if(data.gathered[key]!==undefined&&(!Number.isInteger(data.gathered[key])||data.gathered[key]<1))return false;Object.assign(gathered,data.gathered);if(data.version===2&&Array.isArray(data.felled))for(const key of data.felled.slice(0,2000)){if(typeof key!=='string'||!/^\d{1,3},\d{1,3}$/.test(key))continue;const [x,y]=key.split(',').map(Number);if(baseTile(x,y)?.cover==='forest')felled.add(key)}return true}
  return {width,height,greyfordBounds,inGreyford,greyfordLocal,sites,structures,props,road,brook,greyRiver,zone,tile,pass,nearSite,nearestTree,chopTree,gather,snapshot,restore};}
root.KingdomRegion={create};
})(window);
