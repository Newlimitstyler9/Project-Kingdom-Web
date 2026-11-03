// Dunmere NPC policy v1: deterministic daily routines + resident work priorities.
// No visual, economic, or browser dependencies. Original Project Kingdom implementation.
(function(root){"use strict";
const jobs=Object.freeze([
  {id:"forge",title:"Forging tools",place:"smith",capacity:1},
  {id:"fieldwork",title:"Tending fields",place:"farm",capacity:2,season:"growing"},
  {id:"winter-farm",title:"Repairing farm tools",place:"farm",capacity:2,season:"winter"},
  {id:"milling",title:"Milling grain",place:"mill",capacity:1},
  {id:"baking",title:"Baking bread",place:"bakery",capacity:1},
  {id:"hospitality",title:"Serving travelers",place:"inn",capacity:1},
  {id:"trade",title:"Running market stalls",place:"market",capacity:2},
  {id:"healing",title:"Treating villagers",place:"healer",capacity:1},
  {id:"guard",title:"Keeping watch",place:"guard",capacity:1},
  {id:"weaving",title:"Making cloth",place:"weaver",capacity:1},
  {id:"maintenance",title:"Repairing village paths",place:"green",capacity:1},
  {id:"gathering",title:"Collecting supplies",place:"farm",capacity:1}
]);
const defaultPriorities=Object.freeze({
  smith:{forge:1,maintenance:4},
  farmer:{fieldwork:1,"winter-farm":1,gathering:3},
  merchant:{trade:1},
  healer:{healing:1},
  miller:{milling:1},
  innkeeper:{hospitality:1},
  trader:{trade:1,gathering:4},
  guard:{guard:1,maintenance:3},
  baker:{baking:1},
  laborer:{maintenance:1,fieldwork:2,"winter-farm":2,gathering:3},
  weaver:{weaving:1},
  farmhand:{fieldwork:1,"winter-farm":1,gathering:2}
});
const routine=Object.freeze([
  {start:0,end:6,kind:"sleep"}, {start:6,end:8,kind:"morning"},
  {start:8,end:12,kind:"work"}, {start:12,end:13,kind:"meal"},
  {start:13,end:17,kind:"work"}, {start:17,end:18,kind:"walk"},
  {start:18,end:21,kind:"social"}, {start:21,end:22,kind:"walk"},
  {start:22,end:24,kind:"sleep"}
]);
function period(hour){return routine.find(row=>row.start<=hour&&hour<row.end)?.kind||"sleep"}
function seasonFor(day){return ["Spring","Summer","Autumn","Winter"][Math.floor(((day-1)%360)/90)]}
function makePriorities(role){return {...(defaultPriorities[role]||{})}}
function eligible(job,day){const season=seasonFor(day);return !job.season||(job.season==="winter"?season==="Winter":season!=="Winter")}
function choose(residents,day,hour,places,excludedIds=[]){
  if(period(hour)!=="work")return {};
  const remaining=new Map(jobs.filter(j=>eligible(j,day)).map(j=>[j.id,j.capacity]));
  const assignments={};
  const byPlace=Object.fromEntries(places.map(p=>[p.id,p]));
  // Fixed ID order is deterministic and prevents two workers reserving the same slot.
  for(const resident of [...residents].sort((a,b)=>a.id-b.id)){
    if(excludedIds.includes(resident.id))continue;
    const options=jobs.filter(j=>{
      const priority=resident.workPriorities?.[j.id];
      return Number.isInteger(priority)&&priority>=1&&priority<=4&&
        (remaining.get(j.id)||0)>0&&
        (!resident.allowedPlaces||resident.allowedPlaces.includes(j.place))&&
        (!resident.disabledJobs||!resident.disabledJobs.includes(j.id));
    }).sort((a,b)=>{
      const priority=resident.workPriorities[a.id]-resident.workPriorities[b.id];
      if(priority!==0)return priority;
      // Familiar workplaces are preferred when two jobs share a priority.
      const familiar=Number(b.place===resident.work)-Number(a.place===resident.work);
      if(familiar!==0)return familiar;
      const origin=byPlace[resident.home]||{x:0,y:0};
      const d=p=>Math.abs((byPlace[p.place]?.x||0)-origin.x)+Math.abs((byPlace[p.place]?.y||0)-origin.y);
      return d(a)-d(b)||a.id.localeCompare(b.id);
    });
    if(!options.length)continue;
    const job=options[0];remaining.set(job.id,remaining.get(job.id)-1);
    assignments[resident.id]={job:job.id,title:job.title,place:job.place,priority:resident.workPriorities[job.id]};
  }
  return assignments;
}
function plan(resident,day,hour,assignment){
  const mode=period(hour);
  if(mode==="sleep")return {destination:resident.home,activity:"Sleeping",task:null,mode};
  if(mode==="morning")return {destination:resident.home,activity:"Preparing for the day",task:null,mode};
  if(mode==="meal")return {destination:resident.home,activity:"Taking a meal break",task:null,mode};
  if(resident.job==="innkeeper"&&hour>=17&&hour<21)return {destination:"inn",activity:"Serving guests",task:"hospitality",mode:"work"};
  if(mode==="walk"){
    const destination=["green","market",resident.home,resident.home][(resident.id+day+(hour===21?1:0))%4];
    return {destination,activity:destination==="green"?"Taking a walk":destination==="market"?"Browsing the market":"Heading home",task:null,mode};
  }
  if(mode==="social"){
    const destination=[resident.home,"green","inn",resident.home][(resident.id+day)%4];
    return {destination,activity:destination==="inn"?"At the tavern":destination==="green"?"Chatting on the green":"Relaxing at home",task:null,mode};
  }
  if(assignment)return {destination:assignment.place,activity:"Working",task:assignment.job,mode};
  return {destination:resident.home,activity:"Seeking work",task:null,mode};
}
function setPriority(resident,jobId,value){
  if(!jobs.some(j=>j.id===jobId))return false;
  if(value!==null&&(!Number.isInteger(value)||value<1||value>4))return false;
  if(!resident.workPriorities)resident.workPriorities=makePriorities(resident.job);
  if(value===null)delete resident.workPriorities[jobId];
  else resident.workPriorities[jobId]=value;
  return true;
}
root.KingdomNpcAI={jobs,routine,period,seasonFor,makePriorities,choose,plan,setPriority};
})(window);
