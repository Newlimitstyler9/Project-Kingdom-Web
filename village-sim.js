// Project Kingdom: deterministic-ish prototype village schedule and job planner.
// This browser layer is a test harness; production simulation belongs in the C# core.
(function(){
const roles={
 Aldric:{role:'smith',home:[19.5,13.5],work:[19.5,13.5],social:[23.5,20.5],production:'tools'},
 Marta:{role:'farmer',home:[6.5,14.5],work:[11.5,24.5],social:[16.5,20.5],production:'food'},
 Oswin:{role:'merchant',home:[28.5,13.5],work:[29.5,22.5],social:[20.5,20.5],production:'trade'}
};
const world={hour:6,day:1,food:24,charcoal:5,iron:8,tools:0,coins:18,events:[],speed:1};
function log(message){world.events.unshift('Day '+world.day+', '+String(Math.floor(world.hour)).padStart(2,'0')+':00: '+message);world.events.length=Math.min(world.events.length,60)}
function start(npcs){npcs.forEach(n=>{const r=roles[n.name];if(!r)return;n.role=r.role;n.home=r.home;n.work=r.work;n.social=r.social;n.needs={hunger:25,fatigue:10,social:35};n.currentTask='Resting';n.plan='';n.taskTarget=r.home;n.taskUntil=0;n.lastActionDay=-1;n.lastMeal=-1;n.path=[];n.pathFrom='';n.goalKey='';});log('Dunmere begins its working day.');}
function choose(n){const h=world.hour;if(n.needs.hunger>65&&world.food>0){n.currentTask='Eating';n.taskTarget=n.home;return}
if(n.needs.fatigue>78||h<6||h>=22){n.currentTask='Sleeping';n.taskTarget=n.home;return}
if(n.needs.social>75||h>=19){n.currentTask='Socializing';n.taskTarget=n.social;return}
if(n.role==='smith'&&world.charcoal===0){n.currentTask='Seeking charcoal';n.taskTarget=n.social;return}
if(n.role==='merchant'&&world.food<12){n.currentTask='Seeking grain';n.taskTarget=n.work;return}
n.currentTask=n.role==='farmer'?'Farming':n.role==='smith'?'Smithing':'Trading';n.taskTarget=n.work}
function tick(npcs,deltaHours){world.hour+=deltaHours;while(world.hour>=24){world.hour-=24;world.day++}for(const n of npcs){if(!n.role)continue;n.needs.hunger=Math.min(100,n.needs.hunger+deltaHours*3.2);n.needs.fatigue=Math.min(100,n.needs.fatigue+deltaHours*2);n.needs.social=Math.min(100,n.needs.social+deltaHours*1.2);choose(n);
const arrived=Math.hypot(n.x-n.taskTarget[0],n.y-n.taskTarget[1])<.65;
if(!arrived)continue;
if(n.currentTask==='Sleeping'){n.needs.fatigue=Math.max(0,n.needs.fatigue-deltaHours*13)}
if(n.currentTask==='Eating'&&n.lastMeal!==world.day){if(world.food>0){world.food--;n.needs.hunger=Math.max(0,n.needs.hunger-62);n.lastMeal=world.day;log(n.name+' ate a meal at home.')}else log(n.name+' could not find food.')}
if(n.currentTask==='Socializing'){n.needs.social=Math.max(0,n.needs.social-deltaHours*9)}
if(n.lastActionDay!==world.day&&world.hour>=9&&world.hour<18){
 if(n.currentTask==='Farming'){world.food+=8;n.lastActionDay=world.day;log(n.name+' harvested eight food for the village.')}
 if(n.currentTask==='Smithing'&&world.iron>0&&world.charcoal>0){world.iron--;world.charcoal--;world.tools+=2;n.lastActionDay=world.day;log(n.name+' forged two tools using iron and charcoal.')}
 if(n.currentTask==='Trading'){n.lastActionDay=world.day;if(world.food<15&&world.coins>=4){world.coins-=4;world.food+=6;log(n.name+' purchased six grain for four coins.')}else{world.coins+=2;log(n.name+' earned two coins trading goods.')}}}
}}
function describe(n){return n.currentTask+' · Hunger '+Math.round(n.needs.hunger)+' · Fatigue '+Math.round(n.needs.fatigue)+' · Social '+Math.round(n.needs.social)}
window.KingdomVillage={world,start,tick,describe,log};
})();