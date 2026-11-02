// Structured, offline dialogue. Only world state can grant goods, knowledge or obligations.
(function(global){"use strict";
const version=1;
const personality={
 Aldric:{tone:"reserved",concern:"The charcoal supply is uncertain, and the forge needs fuel.",offer:"I could use help arranging charcoal for the forge."},
 Marta:{tone:"warm",concern:"The farm needs reliable hands before the next harvest.",offer:"Tend the western grain fields in three stages and I can pay you a loaf from the pantry."},
 Oswin:{tone:"cautious",concern:"Traders are watching grain prices and the road to the bridge.",offer:"I might have a delivery worth discussing."},
 Edda:{tone:"kind",concern:"People keep coming to me tired and hungry.",offer:"If you gather useful herbs, we could talk."},
 Borin:{tone:"practical",concern:"The mill only runs when there is grain to process.",offer:"The mill could use someone dependable."},
 Nell:{tone:"friendly",concern:"The tavern needs customers, supplies, and a steady fire.",offer:"There's always something to do at the Hearth & Hound."}
};
function create(world,options={}){
 const states=Object.create(null),history=[],seed=options.seed||874;
 let playerName="traveler";
 for(const r of world.residents)states[r.id]={met:false,knowsName:false,familiarity:0,trust:0,affection:0,respect:0,suspicion:0,promises:[],memories:[],lastTalkDay:0};
 function get(id){if(!states[id])throw Error("Unknown resident");return states[id]}
 function remember(id,type,detail){const s=get(id),m={day:world.snapshot().day,type,detail};s.memories.unshift(m);s.memories.length=Math.min(s.memories.length,20);history.unshift({id,...m});history.length=Math.min(history.length,100)}
 function context(r){const snap=world.snapshot(),bits=[];if(r.hunger>60)bits.push("I'm hungry and thinking about my next meal.");if(r.energy<28)bits.push("I'm worn out and would rather be resting.");if(r.activity==="Working"||r.activity==="Traveling to work")bits.push("I've got work to attend to.");if(r.activity==="At the tavern")bits.push("I came here for a bit of company.");if(snap.bread<10)bits.push("Bread is running short in Dunmere.");if(snap.grain<18)bits.push("The village grain stores are low.");return bits[0]||personality[r.name]?.concern||"It's been an ordinary day so far."}
 function response(id,topic){
 const r=world.residents[id],s=get(id),p=personality[r.name]||{tone:"neutral",offer:"I'm occupied with my own work."};
 const known=s.knowsName,display=known?r.name:"Stranger",line=(text,choices)=>({speaker:display,text,choices});
 const opt=(id,label)=>({id,label});
 if(topic==="open"){
 if(!s.met)return line(r.activity==="Sleeping"?"You're waking me? What is it?":r.activity==="Working"?"Can this wait? I'm in the middle of something.":"Don't think we've met. Are you new around here?",[opt("introduce","Introduce yourself"),opt("askName","Ask their name"),opt("work","Ask about work"),opt("leave","Leave")]);
 const overdue=s.promises.find(p=>!p.fulfilled&&world.snapshot().day>p.day+2);
 if(overdue)return line("You said you'd help with "+overdue.subject+". I haven't forgotten.",[opt("promise","Talk about your promise"),opt("work","Ask about their work"),opt("smalltalk","Make conversation"),opt("leave","Leave")]);
 return line(s.trust>=12?"Good to see you again.":s.suspicion>10?"You again. What do you want?":"Hello again. What's on your mind?",[opt("smalltalk","Ask how their day is going"),opt("work","Ask about work"),opt("help","Offer help"),opt("promise","Discuss commitments"),opt("leave","Leave")]);
 }
 if(topic==="introduce"){if(!s.met){s.met=true;s.familiarity+=5;s.trust+=2;remember(id,"meeting","Met the traveler and exchanged introductions.")}return line("Well met. I'm "+r.name+". "+(r.activity==="Working"?"I'm trying to finish my work.":"What brings you to Dunmere?"),[opt("sayName","Tell them your name"),opt("smalltalk","Ask about their day"),opt("work","Ask what they do"),opt("leave","Leave")])}
 if(topic==="askName"){s.met=true;s.knowsName=true;s.familiarity+=3;remember(id,"name","Shared their name with the traveler.");return line("I'm "+r.name+". And you?",[opt("sayName","Introduce yourself"),opt("smalltalk","Make conversation"),opt("leave","Leave")])}
 if(topic==="sayName"){s.met=true;s.knowsName=true;s.familiarity+=4;s.trust+=1;remember(id,"introduction","Learned the traveler's name.");return line("Good to meet you. Not everyone stops to introduce themselves.",[opt("smalltalk","Ask about their day"),opt("work","Ask about their work"),opt("leave","Leave")])}
 if(topic==="smalltalk"){s.familiarity+=2;s.affection+=r.sociability>=60?2:0;remember(id,"conversation","Shared a short conversation.");return line(context(r),[opt("work","Ask about work"),opt("help","Offer help"),opt("leave","Say goodbye")])}
 if(topic==="work"){return line("I work as a "+r.job+". "+context(r),[opt("help","Ask if they need help"),opt("persuade","Ask them to trust you with a task (Persuasion)"),opt("smalltalk","Change the subject"),opt("leave","Leave")])}
 if(topic==="help"){return line(p.offer,[opt("commit","Promise to help"),opt("work","Ask for more details"),opt("leave","Not right now")])}
 if(topic==="commit"){const subject=r.job==="smith"?"charcoal deliveries":r.job==="farmer"?"farm labor":r.job==="merchant"?"a trade errand":r.job+" work";if(!s.promises.some(p=>p.subject===subject&&!p.fulfilled)){s.promises.push({subject,day:world.snapshot().day,fulfilled:false});remember(id,"promise","Traveler promised help with "+subject);s.trust+=2}return line(r.name==="Marta"?"Go to the western fields, west of town. Tend three sections there, then the pantry will pay you a loaf.":"I'll remember your offer. Come back when you're ready to follow through.",[opt("smalltalk","Talk about something else"),opt("leave","Leave")])}
 if(topic==="promise"){const pending=s.promises.filter(p=>!p.fulfilled);return line(pending.length?"You offered to help with "+pending.map(p=>p.subject).join(", ")+". I still need that done.":"We haven't made any arrangements yet.",[...(r.name==="Aldric"&&pending.some(p=>p.subject==="charcoal deliveries")?[opt("deliverCharcoal","Deliver three charcoal")]:[]),opt("work","Discuss work"),opt("leave","Leave")])}
 if(topic==="persuade"){const day=world.snapshot().day;const roll=1+((seed+id*13+day*7+s.familiarity*3+s.respect*5)%20),bonus=Math.floor(s.trust/10)+2,dc=12+(s.suspicion>10?3:0),success=roll+bonus>=dc;if(success){s.trust+=4;s.respect+=3;remember(id,"skill","Traveler made a convincing request.");}else{s.suspicion+=2;remember(id,"skill","Traveler tried unsuccessfully to gain confidence.");}return line("Persuasion: d20 "+roll+" + "+bonus+" vs DC "+dc+". "+(success?"All right. You seem capable. Let's talk about the work.":"I don't know you well enough to agree to that."),[opt("help","Discuss helping"),opt("leave","Leave")])}
 if(topic==="leave")return line("Until next time.",[]);
 return response(id,"open");
 }
 function choose(id,topic){const s=get(id);s.lastTalkDay=world.snapshot().day;const result=response(id,topic);if(s.met&&topic==="introduce")s.knowsName=true;return result}
 function snapshot(){return {version,playerName,states:JSON.parse(JSON.stringify(states)),history:history.slice(0,50)}}
 function restore(data){if(!data||data.version!==version||!data.states)return false;for(const r of world.residents){const saved=data.states[r.id];if(!saved)continue;const s=get(r.id);for(const key of ["met","knowsName","familiarity","trust","affection","respect","suspicion","lastTalkDay"])if(typeof saved[key]===typeof s[key])s[key]=saved[key];s.promises=Array.isArray(saved.promises)?saved.promises.slice(0,20).filter(p=>typeof p.subject==="string"&&typeof p.day==="number"):[];s.memories=Array.isArray(saved.memories)?saved.memories.slice(0,20):[]}return true}
 return {get,choose,snapshot,restore,displayName(id){const r=world.residents[id];return get(id).knowsName?r.name:"Stranger"},context};
}
global.KingdomDialogue={create};
})(window);
