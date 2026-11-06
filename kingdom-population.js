// Persistent household ledger. Calendar and causally triggered events drive changes; no random deaths or births.
(function(root){'use strict';
function stage(age){return age<2?'infant':age<4?'toddler':age<12?'child':age<18?'youth':age<50?'adult':age<65?'older adult':'elder'}
function create(seedPeople,seedHomes,saved){
 const calendar=root.KingdomCalendar;
 const homes=new Map(seedHomes.filter(h=>h.beds>0).map(h=>[h.id,{id:h.id,name:h.name,beds:h.beds,cribs:h.cribs||0,food:h.food||0,lastFedDay:0,lastInfantMealDay:0,unfedInfants:0,owner:h.owner||null}]));
 const people=new Map(seedPeople.map(p=>[p.id,{id:p.id,name:p.name,age:p.age,birthday:p.birthday||calendar.birthdayFor('greyford:'+p.id),sex:p.sex,home:p.home,work:p.work||null,role:p.role||null,parents:[...(p.parents||[])],spouse:p.spouse||null,alive:true,location:'greyford'}]));
 let events=[],nextId=1;
 if(saved?.version===1){
  for(const raw of Array.isArray(saved.people)?saved.people:[]){if(!raw||typeof raw.id!=='string'||typeof raw.name!=='string'||!Number.isFinite(raw.age))continue;const previous=people.get(raw.id)||{};people.set(raw.id,{...previous,...raw,birthday:raw.birthday||previous.birthday||calendar.birthdayFor('greyford:'+raw.id),age:Math.max(0,Math.min(120,raw.age)),parents:Array.isArray(raw.parents)?raw.parents.filter(id=>typeof id==='string'):[],alive:raw.alive!==false})}
  for(const raw of Array.isArray(saved.homes)?saved.homes:[]){const home=homes.get(raw?.id);if(home){home.owner=typeof raw.owner==='string'?raw.owner:null;home.cribs=Math.max(0,Math.min(home.beds,raw.cribs|0));home.food=Math.max(0,raw.food|0);home.lastFedDay=Math.max(0,raw.lastFedDay|0);home.lastInfantMealDay=Math.max(0,raw.lastInfantMealDay|0);home.unfedInfants=Math.max(0,raw.unfedInfants|0)}}
  events=Array.isArray(saved.events)?saved.events.filter(e=>e&&typeof e.id==='string').slice(-80):[];
  nextId=Math.max(1,saved.nextId|0);
 }
 function residents(homeId){return [...people.values()].filter(p=>p.alive&&p.location==='greyford'&&(!homeId||p.home===homeId))}
 function occupancy(homeId){return residents(homeId).length}
 function vacancy(homeId){const h=homes.get(homeId);return h?Math.max(0,h.beds-occupancy(homeId)):0}
 function cribVacancy(homeId){const h=homes.get(homeId);return h?Math.max(0,h.cribs-residents(homeId).filter(p=>p.age<2).length):0}
 function emptyHomes(){return [...homes.values()].filter(h=>occupancy(h.id)===0).map(h=>({...h}))}
 function addCrib(homeId){const h=homes.get(homeId);if(!h||vacancy(homeId)<1||h.cribs>=h.beds)return false;h.cribs++;return true}
 function foodNeed(homeId){return residents(homeId).reduce((n,p)=>n+(p.age<12?1:2),0)}
 function addFood(homeId,portions){const h=homes.get(homeId);if(!h||!Number.isInteger(portions)||portions<=0)return false;h.food+=portions;return true}
 function feedDay(homeId,day){const h=homes.get(homeId);if(!h||!Number.isInteger(day)||day<=h.lastFedDay)return null;const need=foodNeed(homeId),eaten=Math.min(need,h.food);h.food-=eaten;h.lastFedDay=day;return {need,eaten,shortfall:need-eaten}}
 function feedInfants(homeId,day,takeFood){const h=homes.get(homeId);if(!h||!Number.isInteger(day)||day<=h.lastInfantMealDay)return null;const need=residents(homeId).filter(p=>p.age<2).length;if(!need)return null;const fromHome=Math.min(need,h.food);h.food-=fromHome;const fromStock=takeFood?Math.max(0,Math.min(need-fromHome,takeFood(need-fromHome)|0)):0;const eaten=fromHome+fromStock;h.lastInfantMealDay=day;h.unfedInfants=need-eaten;if(h.unfedInfants)record('food-shortage',day,homeId,h.unfedInfants+' infant meal'+(h.unfedInfants===1?'':'s')+' missing in '+h.name);return {need,eaten,shortfall:h.unfedInfants}}
 function person(id){const p=people.get(id);return p?{...p,parents:[...p.parents]}:null}
 function record(kind,day,personId,detail){const event={id:'population:'+nextId++,kind,day:Math.max(1,day|0),personId,detail};events.push(event);if(events.length>80)events.shift();return event}
 function birth({name,sex,parents,home,day}){
  if(typeof name!=='string'||!name.trim()||!['male','female'].includes(sex)||!Array.isArray(parents)||!parents.length||!homes.has(home)||vacancy(home)<1||cribVacancy(home)<1)return null;
  if(!parents.every(id=>{const p=people.get(id);return p?.alive&&p.age>=18&&p.home===home&&p.location==='greyford'}))return null;
  const id='born-'+nextId++,baby={id,name:name.trim().slice(0,60),age:0,birthday:calendar.date(day).yearDay,sex,home,work:null,role:'infant',parents:[...new Set(parents)],spouse:null,alive:true,location:'greyford'};people.set(id,baby);record('birth',day,id,baby.name+' was born in '+homes.get(home).name);return person(id)
 }
 function birthday(id,day){const p=people.get(id);if(!p?.alive||!calendar.isBirthday(day,p.birthday)||p.lastBirthdayDay===day)return null;p.age=Math.min(120,p.age+2);p.lastBirthdayDay=day;if(p.age>=18&&['infant','toddler','child','youth'].includes(p.role))p.role='unemployed';else if(p.age>=12&&p.age<18)p.role='youth';else if(p.age>=4&&p.age<12)p.role='child';else if(p.age>=2&&p.age<4)p.role='toddler';record('birthday',day,id,p.name+' turned '+p.age);return person(id)}
 function advanceDay(day){const changed=[];for(const p of people.values())if(p.alive&&calendar.isBirthday(day,p.birthday)){const aged=birthday(p.id,day);if(aged)changed.push(aged)}return changed}
 function death(id,cause,day){const p=people.get(id);if(!p?.alive||!cause)return false;p.alive=false;p.role='deceased';record('death',day,id,p.name+' died: '+cause);for(const h of homes.values())if(h.owner===id){const heir=residents(h.id).find(r=>r.age>=18&&r.id!==id)||residents(h.id)[0];h.owner=heir?.id||null}return true}
 function move(id,home,day){const p=people.get(id);if(!p?.alive||!homes.has(home)||p.home===home||vacancy(home)<1||p.age<2&&cribVacancy(home)<1)return false;if(p.age<18&&!p.parents.some(parentId=>people.get(parentId)?.home===home&&people.get(parentId)?.alive))return false;const from=p.home;p.home=home;p.location='greyford';record('move',day,id,p.name+' moved from '+(homes.get(from)?.name||'elsewhere')+' to '+homes.get(home).name);return true}
 function depart(id,destination,day){const p=people.get(id);if(!p?.alive||!destination||destination==='greyford')return false;if(p.age<18&&!p.parents.some(parentId=>people.get(parentId)?.location===destination&&people.get(parentId)?.alive))return false;p.location=destination;p.home=null;record('departure',day,id,p.name+' left for '+destination);return true}
 function setWork(id,work,role,day){const p=people.get(id);if(!p?.alive||p.age<18||!work||!role)return false;p.work=work;p.role=role;record('work',day,id,p.name+' became '+role+' at '+work);return true}
 function snapshot(){return {version:1,nextId,people:[...people.values()].map(p=>({...p,parents:[...p.parents]})),homes:[...homes.values()].map(h=>({...h})),events:events.map(e=>({...e}))}}
 function summary(){const active=residents();return {residents:active.length,children:active.filter(p=>p.age<18).length,infants:active.filter(p=>p.age<2).length,adults:active.filter(p=>p.age>=18).length,openBeds:[...homes.keys()].reduce((n,id)=>n+vacancy(id),0),emptyHomes:emptyHomes().length,foodNeeded:[...homes.keys()].reduce((n,id)=>n+foodNeed(id),0)}}
 return {stage,person,residents,occupancy,vacancy,cribVacancy,emptyHomes,addCrib,foodNeed,addFood,feedDay,feedInfants,birth,birthday,advanceDay,death,move,depart,setWork,snapshot,summary,get events(){return events.map(e=>({...e}))}};
}
root.KingdomPopulation={stage,create};
})(typeof window!=='undefined'?window:globalThis);
