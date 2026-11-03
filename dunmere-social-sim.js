// Dunmere social state: authored history, directed ties, and source-tracked knowledge.
(function(global){"use strict";
const people=[
 {name:"Aldric",age:38,household:"forge",kin:[6],traits:["reserved","dutiful"],goal:"Keep the forge supplied"},
 {name:"Marta",age:49,household:"westfield",kin:[9,11],traits:["patient","stubborn"],goal:"Keep the farm solvent"},
 {name:"Oswin",age:45,household:"market",kin:[],traits:["shrewd","cautious"],goal:"Keep his trade routes open"},
 {name:"Edda",age:61,household:"healer",kin:[],traits:["kind","observant"],goal:"Keep the village healthy"},
 {name:"Borin",age:46,household:"mill",kin:[],traits:["practical","proud"],goal:"Repair the mill before winter"},
 {name:"Nell",age:43,household:"inn",kin:[],traits:["sociable","discreet"],goal:"Make the inn a safe meeting place"},
 {name:"Tessa",age:32,household:"forge",kin:[0],traits:["ambitious","loyal"],goal:"Build a trade of her own"},
 {name:"Garrick",age:35,household:"watch",kin:[],traits:["watchful","fair"],goal:"Keep the roads safe"},
 {name:"Iris",age:28,household:"bakery",kin:[],traits:["generous","meticulous"],goal:"Keep bread affordable"},
 {name:"Rowan",age:22,household:"westfield",kin:[1,11],traits:["restless","clever"],goal:"Earn enough to travel"},
 {name:"Bea",age:39,household:"loom",kin:[],traits:["quiet","patient"],goal:"Keep the loom supplied"},
 {name:"Edric",age:51,household:"westfield",kin:[1,9],traits:["steady","protective"],goal:"Look after the longhouse"}
];
const initialFacts=[
 {id:"flood",text:"The last spring flood ruined part of Westfield's lower field.",knownBy:[1,9,11,4],public:true},
 {id:"forge_debt",text:"Aldric owes Oswin for a load of iron, and Tessa has offered to help repay it.",knownBy:[0,2,6],public:false},
 {id:"mill_gear",text:"Borin has been patching a worn mill gear until he can afford a replacement.",knownBy:[4,0],public:false},
 {id:"road_worry",text:"Garrick found tracks by the eastern road and is watching for trouble.",knownBy:[7,3],public:false}
];
const clone=x=>JSON.parse(JSON.stringify(x));
function create(world){
 const facts=clone(initialFacts);
 const knowledge=people.map((_,id)=>facts.filter(f=>f.knownBy.includes(id)).map(f=>({fact:f.id,source:"experienced",from:null,day:0,confidence:100})));
 const ties=people.map((p,i)=>people.map((q,j)=>({trust:i===j?100:p.kin.includes(j)?48:p.household===q.household?32:10,affection:i===j?100:p.kin.includes(j)?50:p.household===q.household?24:0,grievance:0})));
 // History gives a few relationships a reason beyond sharing a building.
 ties[1][8].trust=35;ties[8][1].trust=38; // Marta and Iris have helped feed each other.
 ties[2][0].trust=4;ties[0][2].trust=2;   // The iron debt makes both wary.
 ties[4][0].trust=27;ties[0][4].trust=29; // Borin and Aldric exchange repairs.
 ties[7][5].trust=31;ties[5][7].trust=27; // Garrick trusts Nell to handle sensitive news.
 let encounters=[],history=[],nextFact=1,privacyCheck=null,proximityCheck=null,playerPrivacyCheck=null;
 function knows(id,fact){return knowledge[id]?.find(k=>k.fact===fact)||null}
 function learn(id,fact,source,from,day,confidence){if(!people[id]||!facts.some(f=>f.id===fact)||knows(id,fact))return false;knowledge[id].unshift({fact,source,from,day,confidence});knowledge[id].length=Math.min(knowledge[id].length,32);return true}
 function record(observer,type,detail,place){if(!people[observer]||!["theft","assault"].includes(type)||typeof detail!=="string"||!detail.trim())return null;const {day,hour}=world.snapshot(),id="witness-"+(nextFact++);facts.push({id,text:detail.trim(),public:false,type,day,hour,place});learn(observer,id,"witnessed",null,day,100);return id}
 function privateEnough(a,b,place){const bystanders=world.residents.some(r=>r.id!==a&&r.id!==b&&r.place===place&&r.activity!=="Sleeping");return !bystanders&&(!privacyCheck||privacyCheck(a,b,place))}
 function conversation(a,b,place,day,hour){
  if(a===b||!people[a]||!people[b]||world.residents[a].place!==place||world.residents[b].place!==place)return null;
  const type=world.residents[a].activity==="Working"&&world.residents[b].activity==="Working"&&world.residents[a].work===place&&world.residents[b].work===place?"work chat":place==="inn"?"drinks":place===world.residents[a].home&&place===world.residents[b].home&&hour>=18&&hour<=21?"family meal":"talk";
  const chosen=[a,b].flatMap(speaker=>knowledge[speaker].filter(k=>!knows(speaker===a?b:a,k.fact)).map(k=>({speaker,listener:speaker===a?b:a,entry:k,fact:facts.find(f=>f.id===k.fact)})))
   .find(candidate=>candidate.fact.public||(ties[candidate.speaker][candidate.listener].trust>=25&&privateEnough(a,b,place)));
  let subject="their day",shared=null;
  if(chosen){subject=chosen.fact.id;shared=chosen.fact.id;learn(chosen.listener,chosen.fact.id,"heard",chosen.speaker,day,Math.max(35,chosen.entry.confidence-15));}
  for(const [x,y] of [[a,b],[b,a]]){ties[x][y].affection=Math.min(100,ties[x][y].affection+1);ties[x][y].trust=Math.min(100,ties[x][y].trust+1)}
  const event={day,hour,place,a,b,type,subject,shared};encounters.push(event);history.unshift(event);history.length=Math.min(history.length,100);return event;
 }
 function step(hasArrived=()=>true){const {day,hour}=world.snapshot();encounters=[];const eligible=world.residents.filter(r=>r.activity!=="Sleeping"&&!r.activity.startsWith("Traveling")&&hasArrived(r,r.place));
  const occupied=new Set();for(const a of eligible){if(occupied.has(a.id))continue;const candidates=eligible.filter(b=>b.id>a.id&&!occupied.has(b.id)&&b.place===a.place&&(!proximityCheck||proximityCheck(a.id,b.id,a.place))&&!history.some(e=>e.day===day&&e.a===a.id&&e.b===b.id)&&(a.place==="inn"||a.place==="green"||a.home===b.home&&hour>=18&&hour<=21||a.activity==="Working"&&b.activity==="Working"&&a.work===b.work&&a.work===a.place));
   candidates.sort((b,c)=>(ties[a.id][c.id].affection+ties[c.id][a.id].affection)-(ties[a.id][b.id].affection+ties[b.id][a.id].affection)||b.id-c.id);
   if(!candidates.length)continue;const b=candidates[0];const event=conversation(a.id,b.id,a.place,day,hour);if(event){occupied.add(a.id);occupied.add(b.id)}}return encounters;
 }
 function latest(id,includePrivate=false){const entries=knowledge[id]||[];for(const k of entries){const f=facts.find(x=>x.id===k.fact);if(f&&(f.public||includePrivate&&!!playerPrivacyCheck&&!world.residents.some(r=>r.id!==id&&r.place===world.residents[id].place&&r.activity!=="Sleeping")&&playerPrivacyCheck(id,world.residents[id].place)))return {text:f.text,source:k.source,from:k.from===null?null:people[k.from].name,confidence:k.confidence,day:k.day,fact:k.fact}}return null}
 function save(){return {version:1,facts:clone(facts),nextFact,knowledge:clone(knowledge),ties:clone(ties),encounters:clone(encounters),history:clone(history)}}
 function restore(data){if(!data||data.version!==1||!Array.isArray(data.knowledge)||data.knowledge.length!==people.length||!Array.isArray(data.ties)||data.ties.length!==people.length)return false;
  if(Array.isArray(data.facts)){facts.splice(0,facts.length,...data.facts.filter(f=>typeof f.id==="string"&&typeof f.text==="string").slice(0,128));nextFact=Number.isInteger(data.nextFact)&&data.nextFact>0?data.nextFact:1}
  for(let i=0;i<people.length;i++){if(!Array.isArray(data.knowledge[i])||!Array.isArray(data.ties[i])||data.ties[i].length!==people.length)return false;knowledge[i]=data.knowledge[i].filter(k=>facts.some(f=>f.id===k.fact)&&["experienced","heard","witnessed"].includes(k.source)&&Number.isInteger(k.day)).slice(0,32).map(clone);ties[i]=data.ties[i].map(t=>({trust:Number.isFinite(t.trust)?Math.max(0,Math.min(100,t.trust)):10,affection:Number.isFinite(t.affection)?Math.max(0,Math.min(100,t.affection)):0,grievance:Number.isFinite(t.grievance)?Math.max(0,Math.min(100,t.grievance)):0}));}
  encounters=Array.isArray(data.encounters)?data.encounters.slice(0,6).map(clone):[];history=Array.isArray(data.history)?data.history.slice(0,100).map(clone):[];return true}
 return {people,facts,knowledge,ties,knows,learn,record,conversation,step,latest,setPrivacyCheck(fn){privacyCheck=typeof fn==="function"?fn:null},setProximityCheck(fn){proximityCheck=typeof fn==="function"?fn:null},setPlayerPrivacyCheck(fn){playerPrivacyCheck=typeof fn==="function"?fn:null},active:()=>clone(encounters),save,restore};
}
global.DunmereSocial={create};
})(window);
