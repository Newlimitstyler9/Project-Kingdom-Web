// Greyford's first local simulation. Names, homes, work, stock, travel, and reports are persistent facts.
(function(root){"use strict";
const homes=[
 {id:"vell-house",name:"Vell House",x:57,y:18,w:7,h:5,beds:4,household:"Vell"},
 {id:"pell-house",name:"Pell House",x:28,y:19,w:6,h:5,beds:4,household:"Pell"},
 {id:"reed-house",name:"Reed House",x:25,y:42,w:6,h:5,beds:3,household:"Reed"},
 {id:"forge-house",name:"Forge House",x:55,y:51,w:6,h:5,beds:3,household:"Ash"},
 {id:"clerk-house",name:"Clerk House",x:37,y:20,w:5,h:5,beds:2,household:"Hale"},
 {id:"guard-barracks",name:"Guard Barracks",x:68,y:19,w:6,h:5,beds:5,household:"garrison"},
 {id:"market-inn",name:"The Bridge Lantern",x:31,y:36,w:8,h:6,beds:8,household:"inn"},
 {id:"south-croft",name:"South Croft",x:25,y:61,w:6,h:5,beds:3,household:"Vale"}
];
const workplaces=[
 {id:"court",name:"March Court",x:57,y:27,w:8,h:6,type:"court"},
 {id:"warehouse",name:"Pell Storehouse",x:30,y:27,w:7,h:6,type:"warehouse"},
 {id:"smithy",name:"Ash Smithy",x:62,y:36,w:7,h:5,type:"smithy"},
 {id:"jail",name:"Gate Jail",x:68,y:47,w:6,h:5,type:"jail"}
];
const offices=[
 {id:"march-judge",holder:"maera",scope:["court","defense"],reportsTo:null},
 {id:"town-bailiff",holder:"rafe",scope:["gates","market"],reportsTo:"march-judge"},
 {id:"provisioning-steward",holder:"alda",scope:["public-stores","purchase-orders"],reportsTo:"march-judge"},
 {id:"storekeeper",holder:"mira",scope:["weighing","warehouse-ledger"],reportsTo:"provisioning-steward"},
 {id:"toll-clerk",holder:"cassian",scope:["bridge-tariff","receipts"],reportsTo:"town-bailiff"}
];
const buildings=[...homes,...workplaces];
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
 {id:"bren",name:"Bren Tor",age:29,sex:"male",home:"guard-barracks",work:"south-gate",role:"caravan escort",sprite:7,kin:[],x:47,y:54}
];
const GATES=[
 {id:"north",x:47,y:12,axis:"horizontal",name:"North timber gate"},
 {id:"south",x:47,y:58,axis:"horizontal",name:"South road gate"},
 {id:"east",x:76,y:35,axis:"vertical",name:"East hill gate"},
 {id:"bridge",x:18,y:35,axis:"vertical",name:"Bridge gate"}
];
const WIDTH=96,HEIGHT=76;
const artSize={"market-inn":[6.3,5.2],"smithy":[6.2,5],"court":[5.4,3.7],"warehouse":[5.4,3.7],"jail":[5.5,4.3],"guard-barracks":[5.4,3.7]};
function artBounds(b){const [w,h]=artSize[b.id]||[4.9,3.8],cx=b.x+b.w/2,bottom=b.y+b.h;return {left:cx-w/2,right:cx+w/2,top:bottom-h,bottom}}
function at(x,y){return buildings.find(b=>{const r=artBounds(b);return x>=r.left&&x<r.right&&y>=r.top&&y<r.bottom})}
function gateAt(x,y){return GATES.find(g=>Math.hypot(x-g.x,y-g.y)<2.2)}
function wallAt(x,y){const north=y>=12&&y<14&&x>=18&&x<=76,south=y>=57&&y<59&&x>=18&&x<=76,west=x>=18&&x<20&&y>=12&&y<=58,east=x>=75&&x<77&&y>=12&&y<=58;if(!(north||south||west||east))return false;return !GATES.some(g=>g.axis==="horizontal"?Math.abs(y-g.y)<2&&Math.abs(x-g.x)<2:Math.abs(x-g.x)<2&&Math.abs(y-g.y)<2)}
function roadAt(x,y){return Math.abs(x-47.5)<1.7||Math.abs(y-35)<1.5&&x>=17&&x<=79||Math.abs(y-48)<1.2&&x>=28&&x<=61}
function wallWalkAt(x,y){return y>=12&&y<14&&x>=18&&x<=76||y>=57&&y<59&&x>=18&&x<=76||x>=18&&x<20&&y>=12&&y<=58||x>=75&&x<77&&y>=12&&y<=58}
function pass(x,y,level=0,gatesOpen=true){if(x<1||y<1||x>=WIDTH-1||y>=HEIGHT-1)return false;if(level===1)return wallWalkAt(Math.floor(x),Math.floor(y));if(wallAt(Math.floor(x),Math.floor(y))||at(x,y))return false;const g=gateAt(x,y);return !g||gatesOpen||g.id==="south"&&y>59}
function house(id){return buildings.find(b=>b.id===id)}
function porch(id){const b=house(id);if(!b)return {x:47.5,y:35.5};return {x:b.x+b.w/2,y:b.y+b.h+.9}}
function seeded(n){let x=(n^0x6b884e1)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}
function create(saved){
 let day=1,hour=6,grain=9,caravan={id:"marrow-grain-1",driver:"Orla Reed",escort:"Bren Tor",cargo:12,status:"approaching",progress:0},reports=[],events=[],met=[],gateOpen=true,orders=[];
 if(saved&&saved.version===1){day=Math.max(1,saved.day|0);hour=Math.min(23,Math.max(0,saved.hour|0));grain=Math.max(0,saved.grain|0);if(saved.caravan?.id===caravan.id)caravan={...caravan,...saved.caravan};reports=Array.isArray(saved.reports)?saved.reports.slice(0,30):[];events=Array.isArray(saved.events)?saved.events.slice(0,30):[];met=Array.isArray(saved.met)?saved.met.filter(id=>people.some(p=>p.id===id)):[];orders=Array.isArray(saved.orders)?saved.orders.slice(0,20):[]}
 gateOpen=hour>=6&&hour<22;
 function absolute(){return (day-1)*24+hour}
 function record(kind,detail){if(!events.some(e=>e.kind===kind))events.push({kind,detail,day,hour})}
 function tick(){
  hour++;if(hour===24){hour=0;day++}
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
   else if(risk<78){caravan.status="delayed";caravan.cargo=9;record("road-attack","Bandits struck Orla's grain cart. Bren drove them off, but three sacks were lost.")}
   else{caravan.status="lost";caravan.cargo=0;record("road-attack","Bandits seized the grain cart. Orla and Bren escaped and are returning on foot.")}
  }
  if(caravan.progress>=14&&["delayed","lost","arriving"].includes(caravan.status)){
   const attack=events.find(e=>e.kind==="road-attack");if(attack){reports.push({id:"orla-witness",source:"Orla Reed",place:"south gate",arrived:time,newsAt:time+2,detail:attack.detail});record("witness-returned","Orla reached the south gate and told Rafe what happened on the Marrowfield road.")}
   if(caravan.cargo>0){grain+=caravan.cargo;for(const order of orders)if(order.status==="requested")order.status=caravan.cargo>=order.quantity?"filled":"part-filled";record("grain-arrived",caravan.cargo+" sacks arrived at Pell Storehouse.");caravan.status="delivered"}
   else{caravan.status="missing";for(const order of orders)if(order.status==="requested")order.status="failed"}
  }
  if(reports.length&&time>=reports[0].arrived+14)record("court-inquiry","Maera ordered an inquiry into the road attack and missing grain.");
 }
 function advance(hours){const count=Math.min(24*30,Math.max(0,Math.floor(hours)));for(let i=0;i<count;i++)tick();return count}
 function snapshot(){return {version:1,day,hour,grain,caravan:{...caravan},reports:reports.map(r=>({...r})),events:events.map(e=>({...e})),orders:orders.map(o=>({...o})),met:[...met]}}
 function introduce(id){if(!met.includes(id))met.push(id)}
 function knownReports(person){const t=absolute();return reports.filter(r=>t>=r.newsAt&&(person.role==="innkeeper"||person.role==="court apprentice"||person.role==="gate guard"||person.role==="march judge"||person.role==="merchant"||person.id==="orla"))}
 function schedule(p){
  if(p.id==="ida")return {x:25+(Math.floor(absolute()/2)%2)*16,y:12.5,level:1,activity:"Patrolling the north wall"};
  if(p.id==="rafe")return {x:47.5,y:53.5,level:0,activity:gateOpen?"Watching the south gate":"On night watch"};
  if(p.id==="pavel")return {x:70.5,y:53,level:0,activity:"Keeping the jail"};
  if(["orla","bren"].includes(p.id)&&["approaching","delayed","lost","arriving"].includes(caravan.status)&&caravan.progress>=2)return null;
  if(p.id==="bren")return {x:45.5,y:53.5,level:0,activity:caravan.status==="missing"?"Reporting the lost shipment":"Keeping watch by the road"};
  if(p.id==="orla"&&caravan.status==="missing")return {x:28,y:48,level:0,activity:"Recovering at home"};
  if(hour>=22||hour<6)return null;
  if(hour>=18&&hour<22&&["jorin","orla","cassian","nellis","fel"].includes(p.id)){
   const q=porch("market-inn");return {...q,level:0,activity:"At the inn"}
  }
  if(hour>=18&&hour<22){const q=porch(p.home);return {...q,level:0,activity:"At home"}}
  if(p.role==="child"){const q=porch(p.home);return {...q,level:0,activity:"Near home"}}
  const q=porch(p.work);return {...q,x:q.x+(p.sprite%3-1)*.5,level:0,activity:"Working: "+p.role}
 }
 function peopleOnMap(){
  const occupied=new Set();return people.flatMap((p,i)=>{const place=schedule(p);if(!place)return [];
   let x=place.x+(i%3-1)*1.35,y=place.y+Math.floor(i/3)%2*.8;
   for(let n=0;n<12;n++){const key=Math.round(x)+","+Math.round(y);if(!occupied.has(key)&&pass(x,y,place.level,gateOpen)){occupied.add(key);break}x=place.x+(n%4-1.5)*1.3;y=place.y+Math.floor(n/4)*1.1}
   return [{...p,x,y,level:place.level,activity:place.activity,facing:p.id==="ida"?"right":"down",moving:false,walkMs:0}]
  })
 }
 return {advance,snapshot,introduce,knownReports,schedule,peopleOnMap,get day(){return day},get hour(){return hour},get gateOpen(){return gateOpen},get caravan(){return caravan},get events(){return events},get grain(){return grain},get orders(){return orders}};
}
root.GreyfordWorld={WIDTH,HEIGHT,GATES,homes,workplaces,offices,buildings,people,at,gateAt,wallAt,wallWalkAt,roadAt,pass,house,porch,create};
})(window);
