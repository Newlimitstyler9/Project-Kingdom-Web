// Dunmere Town Simulation v0.1. Fixed-step, seeded, no rendering dependency.
(function(global){
"use strict";
function rng(seed){let x=seed>>>0||1;const next=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};next.state=()=>x>>>0;next.restore=n=>{if(Number.isInteger(n))x=n>>>0};return next}
const places=[
{id:"inn",name:"Hearth & Hound",kind:"tavern",x:14,y:12},
{id:"smith",name:"Aldric's Forge",kind:"smithy",x:25,y:12},
{id:"market",name:"Dunmere Market",kind:"market",x:18,y:17},
{id:"farm",name:"Westfield Farm",kind:"farm",x:7,y:19},
{id:"mill",name:"Brook Mill",kind:"mill",x:6,y:25},
{id:"bakery",name:"Iris's Bakehouse",kind:"bakery",x:14,y:26},
{id:"healer",name:"Edda's Herbal House",kind:"healer",x:33,y:13},
{id:"weaver",name:"Bea's Loom House",kind:"weaver",x:25,y:25},
{id:"guard",name:"Watch House",kind:"guard",x:33,y:26},
{id:"cottage1",name:"Forge Lane Cottage",kind:"home",x:6,y:6},
{id:"cottage2",name:"Market Lane Cottage",kind:"home",x:14,y:5},
{id:"cottage3",name:"Willow Cottage",kind:"home",x:25,y:6},
{id:"cottage4",name:"East Cottage",kind:"home",x:33,y:5},
{id:"cottage5",name:"Westfield Longhouse",kind:"home",x:6,y:12},
{id:"green",name:"Village Green",kind:"public",x:19,y:24}
];
const profiles=[
["Aldric","smith","cottage1","smith",65,25],
["Marta","farmer","cottage5","farm",75,45],
["Oswin","merchant","cottage2","market",35,70],
["Edda","healer","healer","healer",80,55],
["Borin","miller","mill","mill",50,40],
["Nell","innkeeper","inn","inn",90,65],
["Tessa","trader","cottage1","market",70,60],
["Garrick","guard","guard","guard",45,35],
["Iris","baker","bakery","bakery",85,60],
["Rowan","laborer","cottage5","farm",30,80],
["Bea","weaver","weaver","weaver",78,50],
["Edric","farmhand","cottage5","farm",68,40]
];
function create(seed=874){let foodSystem=null,logistics=null,lastAssignments={};const brain=global.KingdomNpcAI||null;const random=rng(seed),byId=Object.fromEntries(places.map(p=>[p.id,p]));let day=1,hour=6,grain=65,bread=30,ale=18,coins=140,logs=[],transactions=0;const residents=profiles.map((p,i)=>({id:i,name:p[0],job:p[1],home:p[2],work:p[3],sociability:p[4],discipline:100-p[5],coins:8+Math.floor(random()*12),hunger:10+Math.floor(random()*20),energy:85,social:65,place:p[2],activity:"Sleeping",currentTask:null,tasksCompleted:0,workPriorities:brain?brain.makePriorities(p[1]):{},friend:i===0?1:(i+1)%profiles.length,pet:i===1?"Bran":i===5?"Pip":null}));const pets=[{name:"Bran",owner:1,place:"cottage5"},{name:"Pip",owner:5,place:"inn"}];
function log(msg){logs.unshift("Day "+day+", "+String(hour).padStart(2,"0")+":00 · "+msg);logs.length=Math.min(logs.length,120)}
function work(r){if(foodSystem)return; if(r.job==="farmer"||r.job==="farmhand"){grain+=2;return}if(r.job==="miller"&&grain>=2){grain-=2;bread+=2;return}if(r.job==="baker"&&grain>=1){grain--;bread+=2;return}if(r.job==="innkeeper"&&grain>=1){grain--;ale++;return} }
function step(hasArrived=()=>true){hour++;if(hour>=24){hour=0;day++}const haulers=logistics?logistics.snapshot().carriers
 .map(c=>({worker:c.worker,job:c.item,place:logistics.destination(c.worker)}))
 .filter(c=>c.place!==null&&c.place!==undefined):[];
lastAssignments=brain?brain.choose(residents,day,hour,places,haulers.map(c=>c.worker)):{};
if(brain)for(const carrier of haulers){lastAssignments[carrier.worker]={job:"hauling",title:"Transporting "+carrier.job,place:carrier.place,priority:1}}
for(const r of residents){if(!foodSystem)r.hunger=Math.min(100,r.hunger+4);r.energy=Math.max(0,r.energy-2);r.social=Math.max(0,r.social-3);
let destination,activity;r.currentTask=null;
if(hour>=22||hour<6||r.energy<16){destination=r.home;activity="Sleeping";if(hasArrived(r,destination))r.energy=Math.min(100,r.energy+13);else activity="Traveling home"}
else if(r.hunger>=55&&(foodSystem||bread>0&&r.coins>=1)){destination=r.home;activity="Eating";if(!hasArrived(r,destination))activity="Traveling for food";else if(!foodSystem&&bread>0&&r.coins>=1){bread--;r.coins--;coins++;r.hunger=Math.max(0,r.hunger-50);transactions++;if(random()<.12)log(r.name+" bought bread for supper.")}else if(foodSystem){activity="Eating";}else if(activity==="Eating")activity="Seeking food"}
else if(brain){
const agenda=brain.plan(r,day,hour,lastAssignments[r.id]);destination=agenda.destination;activity=agenda.activity;r.currentTask=agenda.task;
if(agenda.mode==="work"&&r.currentTask){
  if(!hasArrived(r,destination))activity="Traveling to work";
  else if(r.energy>20&&random()<.75){work(r);r.tasksCompleted=(r.tasksCompleted||0)+1}
}else if(agenda.mode==="social"){
  if(r.social>=70||r.coins<2){destination=r.home;activity="At home";if(hasArrived(r,destination))r.energy=Math.min(100,r.energy+4)}
  else if(!hasArrived(r,destination))activity="Traveling to tavern";
  else {r.social=Math.min(100,r.social+25);r.coins-=2;coins+=2;transactions++;if(random()<.16)log(r.name+" visited the Hearth & Hound.")}
}else if(agenda.mode==="walk"){
  if(hasArrived(r,destination))r.social=Math.min(100,r.social+9);
  else activity="Walking to village green";
}else if(hasArrived(r,destination)){
  r.energy=Math.min(100,r.energy+(agenda.mode==="meal"?6:4));
}
}
else if(hour>=8&&hour<17){destination=r.work;activity="Working";if(!hasArrived(r,destination))activity="Traveling to work";else if(r.energy>20&&random()<.75){work(r);}}
else if(hour>=18&&hour<21&&r.social<70&&r.coins>=2){destination="inn";activity="At the tavern";if(!hasArrived(r,destination))activity="Traveling to tavern";else{r.social=Math.min(100,r.social+25);r.coins-=2;coins+=2;transactions++;if(random()<.16)log(r.name+" visited the Hearth & Hound.")}}
else if(hour===17||hour===21){destination="green";activity="Taking a walk";r.social=Math.min(100,r.social+9)}
else{destination=r.home;activity="At home";r.energy=Math.min(100,r.energy+4)}
if(destination!==r.place){r.place=destination;if(random()<.035)log(r.name+" headed to "+byId[destination].name+".")}r.activity=activity;
}
for(const pet of pets){const owner=residents[pet.owner];pet.place=owner.activity==="Taking a walk"||owner.activity==="At home"||owner.activity==="Sleeping"?owner.place:byId[owner.home].id}
if(hour===16){for(const r of residents){if((brain?(r.currentTask&&r.activity==="Working"&&hasArrived(r,r.place)):(r.place===r.work&&hasArrived(r,r.work)))&&coins>=2){r.coins+=2;coins-=2;transactions++;}}}
if(hour===12&&!foodSystem&&grain<20)log("The grain stores are running low.");if(hour===20){const pairs=residents.filter(r=>r.place==="inn"&&hasArrived(r,"inn"));if(pairs.length>1){const a=pairs[Math.floor(random()*pairs.length)],b=pairs.find(x=>x.id!==a.id);if(b)log(a.name+" and "+b.name+" talked over drinks.")}}
}
log("Dunmere awakens. The first households begin their day.");
function save(){return {version:1,day,hour,grain,bread,ale,coins,transactions,logs:[...logs],randomState:random.state(),residents:residents.map(r=>({...r})),pets:pets.map(p=>({...p}))}}
function restore(data){if(!data||data.version!==1||!Array.isArray(data.residents)||data.residents.length!==residents.length||!Array.isArray(data.pets)||data.pets.length!==pets.length||!Number.isInteger(data.day)||data.day<1||!Number.isInteger(data.hour)||data.hour<0||data.hour>23)return false;
day=data.day;hour=data.hour;grain=data.grain;bread=data.bread;ale=data.ale;coins=data.coins;transactions=data.transactions;logs=Array.isArray(data.logs)?data.logs.slice(0,120):[];random.restore(data.randomState);
for(let i=0;i<residents.length;i++){const previousHome=data.residents[i].home;Object.assign(residents[i],data.residents[i]);residents[i].home=profiles[i][2];residents[i].work=profiles[i][3];if(residents[i].place===previousHome)residents[i].place=residents[i].home;if(brain&&!residents[i].workPriorities)residents[i].workPriorities=brain.makePriorities(residents[i].job)}lastAssignments=brain?brain.choose(residents,day,hour,places):{};
for(let i=0;i<pets.length;i++)Object.assign(pets[i],data.pets[i]);return true}
return {places,residents,pets,save,restore,workBoard(){return JSON.parse(JSON.stringify(lastAssignments))},setWorkPriority(id,job,priority){return !!brain&&!!residents[id]&&brain.setPriority(residents[id],job,priority)},attachHauling(system){logistics=system},attachFood(system){foodSystem=system},step,advance(n){for(let i=0;i<n;i++)step()},snapshot(){const supply=foodSystem?foodSystem.snapshot().stocks:null;return {day,hour,season:brain?brain.seasonFor(day):null,workBoard:JSON.parse(JSON.stringify(lastAssignments)),grain:supply?supply.grain:grain,bread:supply?supply.bread:bread,ale,treasury:coins,transactions,logs:[...logs],residents:residents.map(r=>({...r})),pets:pets.map(p=>({...p}))}}};
}
global.DunmereTown={create};
})(window);
