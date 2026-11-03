// Playable Brooklands geography around Dunmere. Seeded terrain and sparse saved changes.
(function(root){"use strict";
const width=128,height=96;
const sites={
 dunmere:{name:'Dunmere',x:64.5,y:47.5,kind:'settlement'},
 mill:{name:'Brook Mill',x:49.5,y:55.5,kind:'mill'},
 westfield:{name:'Westfield',x:63.5,y:68.5,kind:'field'},
 timber:{name:'Eastwood Timber Yard',x:104.5,y:67.5,kind:'timber'},
 mine:{name:'North Ridge Mine',x:107.5,y:22.5,kind:'mine'},
 start:{name:'Wilderness Trail',x:25.5,y:78.5,kind:'start'}
};
const structures=[
 {id:'western-cottage',name:'West Cottage',kind:'cottage',x:59,y:34,w:5,h:4,doorX:61,doorY:37},
 {id:'regional-inn',name:'Dunmere Inn',kind:'tavern',x:53,y:40,w:5,h:4,doorX:55,doorY:43},
 {id:'regional-bakery',name:'Bakehouse',kind:'bakery',x:72,y:40,w:5,h:4,doorX:74,doorY:43},
 {id:'eastern-cottage',name:'East Cottage',kind:'cottage',x:68,y:34,w:5,h:4,doorX:70,doorY:37},
 {id:'regional-mill',name:'Brook Mill',kind:'mill',x:47,y:49,w:5,h:4,doorX:49,doorY:52}
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
 [[25,79],[34,76],[47,73],[54,62],[64,47]],
 [[55,44],[55,47]],[[74,44],[74,47]],
 [[61,38],[59,43],[59,47]],[[70,38],[69,43],[69,47]],
 [[101,51],[102,39],[105,29],[107,22]],
 [[102,51],[104,68]],[[49,55],[55,55],[59,53],[60,52]]
];
function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)}
function road(x,y){const greenRing=Math.abs(Math.hypot(x+.5-63.5,y+.5-44.5)-5.3)<.66;return greenRing||routes.some(route=>route.some((point,i)=>i&&segmentDistance(x+.5,y+.5,route[i-1],point)<.67))}
function brook(y){return 44+2.3*Math.sin(y*.12)+1.2*Math.sin(y*.37)}
function hash(x,y){let v=(x*73856093^y*19349663^874)>>>0;v^=v>>>13;v=Math.imul(v,1274126177)>>>0;return v}
function zone(x,y){
 if(x>76&&y<31)return 'ridge';
 if(((x-20)/22)**2+((y-20)/20)**2<1)return 'commonWoods';
 if(((x-22)/24)**2+((y-76)/21)**2<1)return 'wilderness';
 if(x>57&&x<81&&y>57&&y<82)return 'westfield';
 if(((x-100)/24)**2+((y-60)/24)**2<1)return 'eastwood';
 if(x>52&&x<77&&y>34&&y<58)return 'dunmere';
 return 'meadow';
}
function tile(x,y){
 if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=width||y>=height)return null;
 const area=zone(x,y),path=road(x,y),water=Math.abs(x+.5-brook(y+.5))<1.25;
 const bridge=water&&path&&(Math.abs(y-47)<2||Math.abs(y-73)<2);
 const nearSite=Object.values(sites).some(s=>Math.hypot(x+.5-s.x,y+.5-s.y)<2.4)||x>=99&&x<=111&&y>=57&&y<=66||x>=102&&x<=113&&y>=14&&y<=21||x>=45&&x<=54&&y>=48&&y<=55;
 const n=hash(x,y),trees=['commonWoods','wilderness','eastwood'].includes(area);
 let cover=null;
 if(!path&&!water&&!nearSite){
  if(trees&&n%7===0)cover='forest';
  else if(area==='ridge'&&n%6===0)cover='stones';
  else if(area!=='westfield'&&n%31===0)cover='brush';
 }
 return {area,road:path,water,bridge,cover,terrain:area==='ridge'?'rock':'soil'};
}
function pass(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||x<1||y<1||x>=width-1||y>=height-1)return false;const t=tile(Math.floor(x),Math.floor(y));const mineRock=x>=102&&x<113&&y>=15&&y<21&&!(x>=106&&x<109&&y>=19);const timberShed=x>=100&&x<109&&y>=59&&y<65;return !!t&&(!t.water||t.bridge)&&t.cover!=='forest'&&t.cover!=='stones'&&!mineRock&&!timberShed&&!structures.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)&&!props.some(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h)}
function nearSite(x,y,max=2){return Object.entries(sites).find(([,s])=>Math.hypot(x-s.x,y-s.y)<max)?.[0]||null}
function create(){const gathered={};function gather(site,day,bag){if(!['timber','mine'].includes(site))return {ok:false,message:'No resource to gather here.'};if(gathered[site]===day)return {ok:false,message:'You have gathered what is loose here today.'};const item=site==='timber'?'wood':'stone',tool=site==='timber'?'axe':'pick';if(bag.equipped!==tool)return {ok:false,message:'Equip a '+tool+' first.'};if(!bag.add(item,2))return {ok:false,message:'Your bag is full.'};gathered[site]=day;return {ok:true,message:'Collected 2 '+item+' near '+sites[site].name+'.'}}
 function snapshot(){return {version:1,gathered:{...gathered}}}
 function restore(data){if(!data||data.version!==1||!data.gathered||typeof data.gathered!=='object')return false;for(const key of ['timber','mine'])if(data.gathered[key]!==undefined&&(!Number.isInteger(data.gathered[key])||data.gathered[key]<1))return false;Object.assign(gathered,data.gathered);return true}
 return {width,height,sites,structures,props,road,brook,zone,tile,pass,nearSite,gather,snapshot,restore};}
root.KingdomRegion={create};
})(window);
