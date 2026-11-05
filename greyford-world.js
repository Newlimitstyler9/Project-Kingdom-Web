// Greyford's first local simulation. Names, homes, work, stock, travel, and reports are persistent facts.
(function(root){"use strict";
const homes=[
 {id:"vell-house",name:"Vell House",x:57,y:18,w:7,h:5,beds:4,household:"Vell"},
 {id:"pell-house",name:"Pell House",x:28,y:19,w:6,h:5,beds:4,household:"Pell"},
 {id:"reed-house",name:"Reed House",x:27,y:42,w:6,h:5,beds:3,household:"Reed"},
 {id:"forge-house",name:"Forge House",x:55,y:51,w:6,h:5,beds:3,household:"Ash"},
 {id:"clerk-house",name:"Clerk House",x:37,y:20,w:5,h:5,beds:2,household:"Hale"},
 {id:"guard-barracks",name:"Guard Barracks",x:68,y:19,w:6,h:5,beds:5,household:"garrison"},
 {id:"market-inn",name:"The Bridge Lantern",x:31,y:36,w:8,h:6,beds:8,household:"inn"},
 {id:"south-croft",name:"South Croft",x:25,y:61,w:6,h:5,beds:3,household:"Vale"},
 {id:"tanner-house",name:"Tanner House",x:21,y:17,w:5,h:4,beds:3,household:"Tanner",kind:"home"},
 {id:"mason-house",name:"Mason House",x:21,y:24,w:5,h:4,beds:4,household:"Mason",kind:"home"},
 {id:"fen-house",name:"Fen House",x:52,y:17,w:5,h:4,beds:3,household:"Fen",kind:"home"},
 {id:"dyer-house",name:"Dyer House",x:51,y:26,w:5,h:4,beds:3,household:"Dyer",kind:"home"},
 {id:"bridge-row-a",name:"Bridge Row I",x:20,y:39,w:5,h:4,beds:3,household:"Morn",kind:"home"},
 {id:"bridge-row-b",name:"Bridge Row II",x:20,y:45,w:5,h:4,beds:3,household:"Voss",kind:"home"},
 {id:"east-row-a",name:"East Row I",x:52,y:38,w:5,h:4,beds:3,household:"Kell",kind:"home"},
 {id:"east-row-b",name:"East Row II",x:51,y:43,w:5,h:4,beds:3,household:"Dane",kind:"home"},
 {id:"south-croft-two",name:"South Croft II",x:34,y:62,w:5,h:4,beds:3,household:"Tern",kind:"home"},
 {id:"south-croft-three",name:"South Croft III",x:55,y:62,w:5,h:4,beds:4,household:"Bale",kind:"home"}
];
const workplaces=[
 {id:"court",name:"March Court",x:57,y:27,w:8,h:6,type:"court"},
 {id:"warehouse",name:"Pell Storehouse",x:30,y:27,w:7,h:6,type:"warehouse"},
 {id:"smithy",name:"Ash Smithy",x:62,y:36,w:7,h:5,type:"smithy"},
 {id:"jail",name:"Gate Jail",x:68,y:47,w:6,h:5,type:"jail"},
 {id:"bakery",name:"Bridge Bakery",x:39,y:39,w:5,h:5,type:"bakery"},
 {id:"chapel",name:"Old Stone Chapel",x:67,y:26,w:6,h:5,type:"chapel"},
 {id:"stable",name:"Pell Stables",x:21,y:51,w:7,h:5,type:"stable"},
 {id:"weaver",name:"Dyer and Weaver",x:62,y:45,w:5,h:5,type:"weaver"},
 {id:"apothecary",name:"Fen Remedies",x:39,y:27,w:5,h:5,type:"apothecary"},
 {id:"granary",name:"Public Granary",x:29,y:51,w:7,h:5,type:"granary"},
 {id:"carpenter",name:"Bridge Carpentry",x:38,y:51,w:6,h:5,type:"carpenter"},
 {id:"tollhouse",name:"Bridge Tollhouse",x:21,y:30,w:5,h:4,type:"tollhouse"}
];
const offices=[
 {id:"march-judge",holder:"maera",scope:["court","defense"],reportsTo:null},
 {id:"town-bailiff",holder:"rafe",scope:["gates","market"],reportsTo:"march-judge"},
 {id:"provisioning-steward",holder:"alda",scope:["public-stores","purchase-orders"],reportsTo:"march-judge"},
 {id:"storekeeper",holder:"mira",scope:["weighing","warehouse-ledger"],reportsTo:"provisioning-steward"},
 {id:"toll-clerk",holder:"cassian",scope:["bridge-tariff","receipts"],reportsTo:"town-bailiff"}
];
const buildings=[...homes,...workplaces];
const decor=[
 {sprite:"marketStallBlue",x:43,y:22,w:2,h:2},
 {sprite:"marketStallGold",x:50,y:22,w:2,h:2},
 {sprite:"yardCart",x:18,y:63,w:2,h:2},
 {sprite:"yardLogs",x:70,y:42,w:2,h:2},
 {sprite:"yardTrough",x:67,y:42,w:2,h:2},
 {sprite:"bakerySackPile",x:36,y:52,w:2,h:2}
];
const people=[
 {id:"maera",name:"Duchess Maera Vell",age:42,sex:"female",home:"vell-house",work:"court",role:"march judge",status:"noble",sprite:3,kin:["elin"],x:61,y:34},
 {id:"elin",name:"Elin Vell",age:17,sex:"female",home:"vell-house",work:"court",role:"court apprentice",sprite:10,kin:["maera"],x:59,y:33},
 {id:"jorin",name:"Jorin Pell",age:39,sex:"male",home:"pell-house",work:"warehouse",role:"horse trader",sprite:2,spouse:"mira",kin:["mira","tavin"],x:33,y:34},
 {id:"mira",name:"Mira Pell",age:36,sex:"female",home:"pell-house",work:"warehouse",role:"merchant",sprite:6,spouse:"jorin",kin:["jorin","tavin"],x:36,y:34},
 {id:"tavin",name:"Tavin Pell",age:12,sex:"male",home:"pell-house",work:"pell-house",role:"child",sprite:11,kin:["jorin","mira"],x:29,y:25},
 {id:"orla",name:"Orla Reed",age:31,sex:"female",home:"reed-house",work:"warehouse",role:"carter",sprite:1,kin:["nia"],x:29,y:48},
 {id:"nia",name:"Nia Reed",age:9,sex:"female",home:"reed-house",work:"reed-house",role:"child",sprite:8,kin:["orla"],x:27,y:48},
 {id:"brann",name:"Brann Ash",age:45,sex:"male",home:"forge-house",work:"smithy",role:"smith",sprite:0,spouse:"sella",kin:["sella"],x:66,y:42},
 {id:"sella",name:"Sella Ash",age:43,sex:"female",home:"forge-house",work:"smithy",role:"forge bookkeeper",sprite:5,spouse:"brann",kin:["brann"],x:65,y:43},
 {id:"cassian",name:"Cassian Hale",age:28,sex:"male",home:"clerk-house",work:"court",role:"toll clerk",sprite:9,kin:[],x:40,y:26},
 {id:"alda",name:"Alda Fen",age:33,sex:"female",home:"clerk-house",work:"court",role:"provisioning steward",status:"town officer",sprite:10,kin:[],x:40,y:27},
 {id:"rafe",name:"Rafe Durn",age:34,sex:"male",home:"guard-barracks",work:"south-gate",role:"gate guard",sprite:7,kin:[],x:47,y:55},
 {id:"ida",name:"Ida Fen",age:26,sex:"female",home:"guard-barracks",work:"north-wall",role:"wall guard",sprite:3,kin:[],x:35,y:12},
 {id:"nellis",name:"Nellis Vale",age:37,sex:"female",home:"market-inn",work:"market-inn",role:"innkeeper",sprite:5,kin:["fel"],x:36,y:42},
 {id:"fel",name:"Fel Vale",age:14,sex:"male",home:"market-inn",work:"market-inn",role:"inn helper",sprite:11,kin:["nellis"],x:38,y:42},
 {id:"pavel",name:"Pavel Morn",age:32,sex:"male",home:"guard-barracks",work:"jail",role:"gaoler",sprite:7,kin:[],x:70,y:53},
 {id:"bren",name:"Bren Tor",age:29,sex:"male",home:"guard-barracks",work:"south-gate",role:"caravan escort",sprite:7,kin:[],x:47,y:54},
 {id:"toma",name:"Toma Tanner",age:46,sex:"male",home:"tanner-house",work:"tanner-house",role:"leatherworker",sprite:4,kin:["lysa"],x:23,y:22},
 {id:"lysa",name:"Lysa Tanner",age:19,sex:"female",home:"tanner-house",work:"weaver",role:"dyer's apprentice",sprite:8,kin:["toma"],x:64,y:51},
 {id:"edda",name:"Edda Mason",age:52,sex:"female",home:"mason-house",work:"mason-house",role:"stonemason",sprite:6,kin:[],x:23,y:29},
 {id:"jessa",name:"Jessa Morn",age:30,sex:"female",home:"bridge-row-a",work:"bakery",role:"baker",sprite:5,kin:[],x:42,y:45},
 {id:"osric",name:"Osric Vale",age:55,sex:"male",home:"south-croft",work:"chapel",role:"chapel keeper",sprite:9,kin:[],x:70,y:32},
 {id:"rinna",name:"Rinna Voss",age:24,sex:"female",home:"bridge-row-b",work:"stable",role:"stable hand",sprite:1,kin:[],x:24,y:57},
 {id:"yseld",name:"Yseld Dyer",age:41,sex:"female",home:"dyer-house",work:"weaver",role:"weaver",sprite:10,kin:[],x:64,y:51},
 {id:"beren",name:"Beren Fen",age:47,sex:"male",home:"fen-house",work:"apothecary",role:"healer",sprite:2,kin:[],x:41,y:33},
 {id:"dain",name:"Dain Kell",age:38,sex:"male",home:"east-row-a",work:"carpenter",role:"carpenter",sprite:0,kin:[],x:41,y:57},
 {id:"ula",name:"Ula Dane",age:34,sex:"female",home:"east-row-b",work:"granary",role:"grain clerk",sprite:3,kin:[],x:33,y:57},
 {id:"hobb",name:"Hobb Tern",age:43,sex:"male",home:"south-croft-two",work:"tollhouse",role:"bridge collector",sprite:7,kin:[],x:23,y:35}
];
const GATES=[
 {id:"north",x:47,y:12,axis:"horizontal",name:"North timber gate"},
 {id:"south",x:47,y:58,axis:"horizontal",name:"South road gate"},
 {id:"east",x:76,y:35,axis:"vertical",name:"East hill gate"},
 {id:"bridge",x:18,y:35,axis:"vertical",name:"Bridge gate"}
];
const WIDTH=96,HEIGHT=76;
function artBounds(b){return {left:b.x,right:b.x+b.w,top:b.y,bottom:b.y+b.h}}
function at(x,y){return buildings.find(b=>{const r=artBounds(b);return x>=r.left&&x<r.right&&y>=r.top&&y<r.bottom})}
function decorAt(x,y){return decor.find(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h)}
function gateAt(x,y){return GATES.find(g=>g.axis==='horizontal'?x>=g.x-1&&x<g.x+2&&y>=g.y-1&&y<g.y+1:x>=g.x-1&&x<g.x+1&&y>=g.y-1&&y<g.y+1)}
function wallAt(x,y){const north=y>=12&&y<14&&x>=18&&x<=76,south=y>=57&&y<59&&x>=18&&x<=76,west=x>=18&&x<20&&y>=12&&y<=58,east=x>=75&&x<77&&y>=12&&y<=58;if(!(north||south||west||east))return false;return !GATES.some(g=>g.axis==="horizontal"?Math.abs(y-g.y)<2&&Math.abs(x-g.x)<2:Math.abs(x-g.x)<2&&y>=g.y-1&&y<g.y+1)}
const lanes=[[[27.5,25.5],[66.5,25.5]],[[32.5,44.5],[50.5,44.5]],[[60.5,48.5],[61.5,53.5],[67.5,53.5]]];
function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)}
function mainRoadAt(x,y){return Math.abs(x-47.5)<1.7||Math.abs(y-35)<1.5&&x>=17&&x<=79||Math.abs(y-48)<1.2&&x>=28&&x<=61}
function laneAt(x,y){return lanes.some(lane=>lane.some((point,i)=>i&&segmentDistance(x,y,lane[i-1],point)<.63))}
function pathKey(x,y){return x+','+y}
const footpaths=new Set();
function roadAt(x,y){if(at(x,y)||decorAt(x,y)||wallAt(Math.floor(x),Math.floor(y)))return false;return mainRoadAt(x,y)||laneAt(x,y)||footpaths.has(pathKey(Math.floor(x),Math.floor(y)))}
function buildFootpaths(){
 for(const b of buildings){
  const start={x:Math.floor(b.x+b.w/2),y:b.y+b.h},queue=[start],seen=new Set([pathKey(start.x,start.y)]),previous=new Map();let goal=null;
  for(let i=0;i<queue.length&&i<1200;i++){
   const p=queue[i],centerX=p.x+.5,centerY=p.y+.5;
   if(mainRoadAt(centerX,centerY)||laneAt(centerX,centerY)||footpaths.has(pathKey(p.x,p.y))){goal=p;break}
   for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]){
    const nx=p.x+dx,ny=p.y+dy,key=pathKey(nx,ny);
    if(nx<19||nx>76||ny<14||ny>70||seen.has(key)||at(nx+.5,ny+.5)||decorAt(nx+.5,ny+.5)||wallAt(nx,ny))continue;
    seen.add(key);previous.set(key,pathKey(p.x,p.y));queue.push({x:nx,y:ny});
   }
  }
  if(!goal)continue;let key=pathKey(goal.x,goal.y),steps=0;
  while(key!==pathKey(start.x,start.y)&&steps++<80){const prior=previous.get(key);if(!prior)break;footpaths.add(key);key=prior}
  footpaths.add(pathKey(start.x,start.y));
 }
}
buildFootpaths();
function wallWalkAt(x,y){return y>=12&&y<14&&x>=18&&x<=76||y>=57&&y<59&&x>=18&&x<=76||x>=18&&x<20&&y>=12&&y<=58||x>=75&&x<77&&y>=12&&y<=58}
function pass(x,y,level=0,gatesOpen=true){if(x<0||y<0||x>=WIDTH||y>=HEIGHT)return false;if(level===1)return wallWalkAt(Math.floor(x),Math.floor(y));const northLip=y>=11&&y<12&&x>=18&&x<77&&!(x>=46&&x<49);if(northLip||wallAt(Math.floor(x),Math.floor(y))||at(x,y)||decorAt(x,y))return false;const g=gateAt(x,y);return !g||gatesOpen||g.id==="south"&&y>59}
function house(id){return buildings.find(b=>b.id===id)}
function porch(id){const b=house(id);if(!b)return {x:47.5,y:35.5};return {x:b.x+b.w/2,y:b.y+b.h+.9}}
function seeded(n){let x=(n^0x6b884e1)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}
function create(saved){
 let day=1,hour=6,grain=9,caravan={id:"marrow-grain-1",driver:"Orla Reed",escort:"Bren Tor",cargo:12,status:"approaching",progress:0},reports=[],events=[],met=[],gateOpen=true,orders=[],knowledge={},energy=Object.fromEntries(people.map(p=>[p.id,80]));
 if(saved&&(saved.version===1||saved.version===2)){day=Math.max(1,saved.day|0);hour=Math.min(23,Math.max(0,saved.hour|0));grain=Math.max(0,saved.grain|0);if(saved.caravan?.id===caravan.id)caravan={...caravan,...saved.caravan};reports=Array.isArray(saved.reports)?saved.reports.slice(0,30):[];events=Array.isArray(saved.events)?saved.events.slice(0,30):[];met=Array.isArray(saved.met)?saved.met.filter(id=>people.some(p=>p.id===id)):[];orders=Array.isArray(saved.orders)?saved.orders.slice(0,20):[];if(saved.knowledge&&typeof saved.knowledge==='object')for(const p of people){const entries=Array.isArray(saved.knowledge[p.id])?saved.knowledge[p.id].filter(k=>reports.some(r=>r.id===k.reportId)).slice(0,12).map(k=>({...k})):[];if(entries.length)knowledge[p.id]=entries}if(saved.energy&&typeof saved.energy==='object')for(const p of people)if(Number.isFinite(saved.energy[p.id]))energy[p.id]=Math.max(0,Math.min(100,saved.energy[p.id]))}
 if(saved?.version===1){
  const attack=events.find(e=>e.kind==="road-attack");
  if(attack){
   attack.id=caravan.id+':road-attack';attack.place="Marrowfield road";attack.actors=["orla","bren"];attack.shipment=caravan.id;attack.cargoLost=12-caravan.cargo;
   let report=reports.find(r=>r.id==="orla-witness");
   if(!report){report={id:attack.id,source:"Orla Reed",place:"Marrowfield road",arrived:null,detail:attack.detail};reports.push(report)}
   report.id=attack.id;report.eventId=attack.id;report.occurredAt=(attack.day-1)*24+attack.hour;
   learn("orla",report.id,"witnessed");learn("bren",report.id,"witnessed");
   if(Number.isFinite(report.arrived)&&report.arrived<=absolute())learn("rafe",report.id,"orla");
  }
 }
 gateOpen=hour>=6&&hour<22;
 function absolute(){return (day-1)*24+hour}
 function sleepHours(p){if(p.id==='rafe')return hour>=2&&hour<9;if(p.id==='pavel')return hour>=23||hour<7;return hour>=22||hour<6}
 function asleep(p){return sleepHours(p)||energy[p.id]<=18}
 function indoorOccupants(homeId){return people.filter(p=>p.home===homeId&&asleep(p)&&agents.get(p.id)?.inside&&agents.get(p.id)?.insideBuilding===homeId).map(p=>({...p,bedIndex:people.filter(q=>q.home===homeId).findIndex(q=>q.id===p.id),energy:energy[p.id],activity:'Sleeping in bed'}))}
 function insidePeople(buildingId){return people.filter(p=>{const a=agents.get(p.id);return a?.inside&&a.insideBuilding===buildingId&&!asleep(p)}).map(p=>{const a=agents.get(p.id);return {...p,x:a.roomX,y:a.roomY,facing:a.facing,moving:a.moving,walkMs:a.walkMs,activity:a.activity}})}
 function record(kind,detail,extra={}){if(!events.some(e=>e.kind===kind))events.push({id:caravan.id+':'+kind,kind,detail,day,hour,...extra})}
 function learn(personId,reportId,from){if(!knowledge[personId])knowledge[personId]=[];if(!knowledge[personId].some(k=>k.reportId===reportId))knowledge[personId].push({reportId,from,at:absolute()})}
 function tick(){
  hour++;if(hour===24){hour=0;day++}
  // Needs advance on the world clock even when no rendered agent is loaded.
  for(const p of people)energy[p.id]=Math.max(0,Math.min(100,energy[p.id]+(sleepHours(p)?15:-3)));
  const time=absolute();gateOpen=hour>=6&&hour<22;
  if(hour===7&&grain<20&&!orders.some(o=>o.status==="requested")){
   orders.push({id:"grain-"+day,item:"grain",quantity:Math.max(12,24-grain),requestedBy:"alda",day,hour,status:"requested",destination:"Pell Storehouse"});
   record("provision-order","Alda found only "+grain+" sacks in the public grain store and sent a purchase request to Marrowfield.");
  }
  if(["approaching","delayed","lost","arriving"].includes(caravan.status))caravan.progress++;
  if(caravan.progress===2&&caravan.status==="approaching")record("cart-on-road","Orla Reed and Bren Tor are bringing twelve grain sacks from Marrowfield.");
  if(caravan.progress===8&&caravan.status==="approaching"){
   const risk=seeded(day+874)%100;
   if(risk<35){caravan.status="arriving";record("road-clear","Orla's grain cart passed the ridge patrol without trouble.")}
   else{
    const lost=risk<78?3:12;caravan.cargo-=lost;caravan.status=lost===12?"lost":"delayed";
    const detail=lost===12?"Bandits seized the grain cart. Orla and Bren escaped and are returning on foot.":"Bandits struck Orla's grain cart. Bren drove them off, but three sacks were lost.";
    record("road-attack",detail,{place:"Marrowfield road",actors:["orla","bren"],shipment:caravan.id,cargoLost:lost});
    const reportId=caravan.id+':road-attack';reports.push({id:reportId,eventId:reportId,source:"Orla Reed",place:"Marrowfield road",occurredAt:time,arrived:null,detail});
    learn("orla",reportId,"witnessed");learn("bren",reportId,"witnessed");
   }
  }
  if(caravan.progress>=14&&["delayed","lost","arriving"].includes(caravan.status)){
   const attack=reports.find(r=>r.eventId===caravan.id+':road-attack');if(attack&&attack.arrived===null){attack.arrived=time;learn("rafe",attack.id,"orla");record("witness-returned","Orla reached the south gate and told Rafe what happened on the Marrowfield road.",{sourceEvent:attack.eventId,actors:["orla","rafe"]})}
   if(caravan.cargo>0){grain+=caravan.cargo;for(const order of orders)if(order.status==="requested")order.status=caravan.cargo>=order.quantity?"filled":"part-filled";record("grain-arrived",caravan.cargo+" sacks arrived at Pell Storehouse.");caravan.status="delivered"}
   else{caravan.status="missing";for(const order of orders)if(order.status==="requested")order.status="failed"}
  }
  for(const report of reports){if(report.arrived===null)continue;
   if(time>=report.arrived+2){learn("alda",report.id,"rafe");learn("mira",report.id,"alda");learn("maera",report.id,"alda");
    if(!orders.some(o=>o.id===caravan.id+':replacement')&&grain<20){const quantity=Math.max(12,24-grain);orders.push({id:caravan.id+':replacement',item:"grain",quantity,requestedBy:"alda",source:"Dunmere",day,hour,status:"requested",destination:"Pell Storehouse",sourceEvent:report.eventId});record("replacement-order","Alda requested "+quantity+" replacement grain sacks from Dunmere after Mira confirmed the shortage.",{sourceEvent:report.eventId,actors:["alda","mira"]})}
   }
   if(time>report.arrived&&hour>=18&&hour<22){learn("nellis",report.id,"orla");learn("jorin",report.id,"nellis")}
  }
  if(reports.some(r=>r.arrived!==null&&time>=r.arrived+14))record("court-inquiry","Maera ordered an inquiry into the road attack and missing grain.",{sourceEvent:caravan.id+':road-attack',actors:["maera","alda"]});
 }
 function advance(hours){const count=Math.min(24*30,Math.max(0,Math.floor(hours)));for(let i=0;i<count;i++)tick();return count}
 function snapshot(){return {version:2,day,hour,grain,caravan:{...caravan},reports:reports.map(r=>({...r})),events:events.map(e=>({...e})),orders:orders.map(o=>({...o})),knowledge:Object.fromEntries(Object.entries(knowledge).map(([id,entries])=>[id,entries.map(k=>({...k}))])),met:[...met],energy:{...energy},agents:people.map(p=>{const a=agents.get(p.id);return {id:p.id,x:a.x,y:a.y,level:a.level,inside:a.inside,insideBuilding:a.insideBuilding,roomX:a.roomX,roomY:a.roomY}})}}
 function introduce(id){if(!met.includes(id))met.push(id)}
 function knownReports(person){return (knowledge[person.id]||[]).map(k=>{const report=reports.find(r=>r.id===k.reportId);return report?{...report,heardFrom:k.from,heardAt:k.at}:null}).filter(Boolean)}
 let routineSeconds=0;
 const workActions={court:["Reviewing petitions","Consulting the court clerk","Meeting a visitor"],warehouse:["Checking incoming stock","Updating the store ledger","Inspecting a delivery"],smithy:["Working at the forge","Fetching iron and fuel","Checking finished work"],bakery:["Preparing bread","Tending the ovens","Setting out fresh loaves"],chapel:["Tending the chapel","Speaking with a parishioner","Cleaning the entrance"],stable:["Caring for the horses","Checking tack","Carrying feed"],weaver:["Working at the loom","Sorting cloth","Checking dyed yarn"],apothecary:["Preparing remedies","Gathering herbs","Helping a patient"],granary:["Counting grain sacks","Checking the stores","Recording a delivery"],carpenter:["Working at the bench","Fetching timber","Inspecting joinery"],tollhouse:["Collecting tolls","Checking the bridge","Writing receipts"],jail:["Keeping watch at the jail","Checking the cells","Speaking with the gate watch"],"market-inn":["Serving travelers","Fetching supplies","Greeting arrivals"]};
 const householdActions={leatherworker:["Working hides","Fetching tanning supplies","Checking finished leather"],stonemason:["Cutting stone","Sorting stone blocks","Checking masonry"]};
 function routine(p,place,phase){
  const q=porch(place);
  const activity=(workActions[place]||householdActions[p.role]||["Working: "+p.role,"Gathering supplies","Checking the worksite"])[phase];
  return {...q,level:0,indoors:true,building:place,phase,activity};
 }
 function schedule(p){
  if(asleep(p))return null;
  const phase=Math.floor((routineSeconds+people.findIndex(other=>other.id===p.id)*3)/12)%3;
  if(p.id==="ida")return {x:[25.5,37.5,53.5][phase],y:12.5,level:1,activity:"Patrolling the north wall"};
  if(p.id==="rafe")return {x:[46.5,47.5,49.5][phase],y:53.5+(phase===1?1:0),level:0,activity:gateOpen?"Watching the south gate":"On night watch"};
  if(p.id==="pavel"&&hour<18)return routine(p,"jail",phase);
  if(["orla","bren"].includes(p.id)&&["approaching","delayed","lost","arriving"].includes(caravan.status)&&caravan.progress>=2)return null;
  if(p.id==="bren")return {x:[45.5,47.5,48.5][phase],y:53.5,level:0,activity:caravan.status==="missing"?"Reporting the lost shipment":"Keeping watch by the road"};
  if(p.id==="orla"&&caravan.status==="missing")return {...porch(p.home),level:0,indoors:true,building:p.home,activity:"Recovering at home"};
  if(hour>=18&&hour<22&&["jorin","orla","cassian","nellis","fel"].includes(p.id)){
   const q=porch("market-inn");return {...q,level:0,indoors:true,building:"market-inn",activity:"At the inn"}
  }
  if(hour>=18&&hour<22){const q=porch(p.home);return {...q,level:0,indoors:true,building:p.home,activity:"At home"}}
  if(p.role==="child"){const q=porch(p.home);return {...q,x:q.x+(phase-1)*1.1,y:q.y+(phase===1?1.1:0),level:0,activity:"Playing near home"}}
  return routine(p,p.work,phase)
 }
 const agents=new Map();
 const initialTargets=targets();
 for(const [i,p] of people.entries()){
  const place=porch(p.home),savedAgent=Array.isArray(saved?.agents)?saved.agents.find(a=>a.id===p.id):null;
  const householdRank=people.filter(other=>other.home===p.home).findIndex(other=>other.id===p.id);
  let x=place.x,y=place.y,level=place.level||0;
  if(!pass(x,y,level,gateOpen)){x=place.x;y=place.y}
  agents.set(p.id,{x:savedAgent&&Number.isFinite(savedAgent.x)?savedAgent.x:x,y:savedAgent&&Number.isFinite(savedAgent.y)?savedAgent.y:y,level:savedAgent?.level===1?1:level,inside:savedAgent?!!savedAgent.inside:true,insideBuilding:savedAgent?.insideBuilding||(savedAgent?.inside?p.home:savedAgent?null:p.home),roomX:Number.isFinite(savedAgent?.roomX)?savedAgent.roomX:4.5+householdRank*1.5,roomY:Number.isFinite(savedAgent?.roomY)?savedAgent.roomY:7.5,away:!initialTargets.get(p.id),path:[],dodge:null,goalKey:'',facing:p.id==='ida'?'right':'down',moving:false,walkMs:0,activity:place.activity||'At home'});
 }
 function targets(){
  const taken=new Set(),out=new Map();
  for(const [i,p] of people.entries()){
   const sleep=asleep(p),base=sleep?{...porch(p.home),level:0,indoors:true,building:p.home,activity:'Going home to sleep'}:schedule(p);
   if(!base){out.set(p.id,null);continue}
   let picked=null;
   for(const [dx,dy] of [[0,0],[-1,0],[1,0],[0,1],[-1,1],[1,1],[-2,0],[2,0],[0,2],[-2,1],[2,1]]){
    const x=base.x+dx,y=base.y+dy,key=Math.round(x)+','+Math.round(y)+','+(base.level||0);
    if(!taken.has(key)&&pass(x,y,base.level||0,gateOpen)){picked={...base,x,y,sleep};taken.add(key);break}
   }
   out.set(p.id,picked||{...base,sleep});
  }
  return out;
 }
 function route(sx,sy,tx,ty,level,walkerId,avoid){
  const start=[Math.floor(sx),Math.floor(sy)],goal=[Math.floor(tx),Math.floor(ty)],startKey=pathKey(...start),goalKey=pathKey(...goal),queue=[start],previous=new Map([[startKey,null]]);
  for(let i=0;i<queue.length&&i<WIDTH*HEIGHT;i++){
   const [x,y]=queue[i],key=pathKey(x,y);if(key===goalKey)break;
   for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]){const nx=x+dx,ny=y+dy,nkey=pathKey(nx,ny);if(previous.has(nkey)||(avoid?.has(nkey)&&nkey!==goalKey)||!pass(nx+.5,ny+.5,level,true))continue;previous.set(nkey,key);queue.push([nx,ny])}
  }
  if(!previous.has(goalKey))return [];
  const path=[];let key=goalKey;while(key!==startKey){const [x,y]=key.split(',').map(Number);path.push({x:x+.5,y:y+.5});key=previous.get(key)}path.reverse();path.push({x:tx,y:ty});return path;
 }
 function step(dt,roomSpot,roomBlocked){
  routineSeconds+=Math.max(0,dt);
  const goals=targets(),occupied=new Set();
  for(const p of people){const a=agents.get(p.id),goal=goals.get(p.id);a.moving=false;
   if(!goal){a.away=true;continue}a.away=false;
   if(a.inside){
    if(goal.indoors&&a.insideBuilding===goal.building){
     a.activity=goal.sleep?'Sleeping in bed':goal.activity;
     if(!goal.sleep&&roomSpot){const station=roomSpot(goal.building,p.id,goal.phase||0,{x:a.roomX,y:a.roomY});if(station){const dx=station.x-a.roomX,dy=station.y-a.roomY,d=Math.hypot(dx,dy);if(d>.05){const move=Math.min(d,Math.max(0,dt)*1.15),nx=a.roomX+dx/d*move,ny=a.roomY+dy/d*move;const blocked=roomBlocked?.(goal.building,nx,ny)||people.some(other=>{if(other.id===p.id)return false;const o=agents.get(other.id);return o.inside&&o.insideBuilding===goal.building&&!asleep(other)&&Math.hypot(o.roomX-nx,o.roomY-ny)<.6});if(!blocked){a.roomX=nx;a.roomY=ny;a.moving=move>.001;a.facing=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';a.walkMs+=move/1.15*1000}}}}
     continue;
    }
    const q=porch(a.insideBuilding||p.home);for(const [dx,dy] of [[0,0],[-.9,0],[.9,0],[0,.9],[-.9,.9],[.9,.9]]){const sx=q.x+dx,sy=q.y+dy;if(pass(sx,sy,0,gateOpen)&&!people.some(other=>other.id!==p.id&&(()=>{const o=agents.get(other.id);return !o.inside&&!o.away&&o.level===0&&Math.hypot(o.x-sx,o.y-sy)<.65})())){a.x=sx;a.y=sy;break}}a.inside=false;a.insideBuilding=null;a.path=[];a.dodge=null;a.goalKey=''
   }
   if(a.level!==goal.level){if(a.level===1){a.x=40.5;a.y=15.5;a.level=0}else{a.x=40.5;a.y=12.5;a.level=1}a.path=[];a.dodge=null;a.goalKey=''}
   const key=goal.x.toFixed(2)+','+goal.y.toFixed(2)+','+goal.level;if(a.goalKey!==key){a.path=route(a.x,a.y,goal.x,goal.y,goal.level,p.id);a.goalKey=key}
   let budget=Math.min(.12,Math.max(0,dt))*1.7;
   while(budget>0&&(a.path.length||a.dodge)){const target=a.dodge||a.path[0],dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy);if(d<.05){if(a.dodge){a.dodge=null;a.path=route(a.x,a.y,goal.x,goal.y,goal.level,p.id)}else a.path.shift();continue}const move=Math.min(d,budget),nx=a.x+dx/d*move,ny=a.y+dy/d*move;if(!pass(nx,ny,a.level,true))break;const blocked=people.some(other=>other.id!==p.id&&(()=>{const o=agents.get(other.id);return !o.inside&&!o.away&&o.level===a.level&&Math.hypot(o.x-nx,o.y-ny)<.58&&Math.hypot(o.x-nx,o.y-ny)<Math.hypot(o.x-a.x,o.y-a.y)-.005})());if(blocked){const avoid=new Set(people.filter(other=>other.id!==p.id).flatMap(other=>{const o=agents.get(other.id);return !o.inside&&!o.away&&o.level===a.level?[pathKey(Math.floor(o.x),Math.floor(o.y))]:[]}));const detour=route(a.x,a.y,goal.x,goal.y,goal.level,p.id,avoid);if(detour.length&&(detour[0].x!==a.path[0]?.x||detour[0].y!==a.path[0]?.y)){a.dodge=null;a.path=detour}else if(!a.dodge){for(const [px,py] of [[-dy/d,dx/d],[dy/d,-dx/d]]){const sx=a.x+px*.85,sy=a.y+py*.85;if(pass(sx,sy,a.level,true)&&!people.some(other=>other.id!==p.id&&(()=>{const o=agents.get(other.id);return !o.inside&&!o.away&&o.level===a.level&&Math.hypot(o.x-sx,o.y-sy)<.75})())){a.dodge={x:sx,y:sy};break}}}break}a.x=nx;a.y=ny;budget-=move;a.moving=true;a.facing=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';a.walkMs+=move/1.7*1000;if(move>=d-.01){if(a.dodge){a.dodge=null;a.path=route(a.x,a.y,goal.x,goal.y,goal.level,p.id)}else a.path.shift()}}
   if(goal.indoors&&Math.hypot(a.x-goal.x,a.y-goal.y)<.55){a.inside=true;a.insideBuilding=goal.building;a.path=[];const station=roomSpot?.(goal.building,p.id,goal.phase||0);if(station){a.roomX=station.x;a.roomY=station.y}a.activity=goal.sleep?'Sleeping in bed':goal.activity}else a.activity=goal.activity;
   if(!a.inside)occupied.add(Math.round(a.x)+','+Math.round(a.y)+','+a.level);
  }
 }
 function peopleOnMap(){return people.flatMap(p=>{const a=agents.get(p.id);return a.inside||a.away?[]:[{...p,x:a.x,y:a.y,level:a.level,activity:a.activity,facing:a.facing,moving:a.moving,walkMs:a.walkMs}]})}
 function gatePassageAt(id){const g=GATES.find(g=>g.id===id);return !!g&&!gateOpen&&people.some(p=>{const a=agents.get(p.id);return a&&!a.inside&&!a.away&&Math.hypot(a.x-g.x,a.y-g.y)<2.1})}
 return {advance,step,snapshot,introduce,knownReports,schedule,peopleOnMap,insidePeople,indoorOccupants,gatePassageAt,get day(){return day},get hour(){return hour},get gateOpen(){return gateOpen},get caravan(){return caravan},get events(){return events},get grain(){return grain},get orders(){return orders}};
}
root.GreyfordWorld={WIDTH,HEIGHT,GATES,homes,workplaces,offices,buildings,decor,people,at,decorAt,gateAt,wallAt,wallWalkAt,roadAt,pass,house,porch,create};
})(window);
