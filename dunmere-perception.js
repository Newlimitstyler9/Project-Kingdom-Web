// Sight checks for local NPC knowledge. Callers decide who is in the same map.
(function(root){"use strict";
function visible(observer,target,options={}){
 if(!observer||!target||!Number.isFinite(observer.x)||!Number.isFinite(observer.y)||!Number.isFinite(target.x)||!Number.isFinite(target.y))return false;
 const dx=target.x-observer.x,dy=target.y-observer.y,distance=Math.hypot(dx,dy);
 const range=(options.range||5)*(options.sneaking?.65:1);
 if(distance>range)return false;
 if(distance>1.2){
  const facing={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[observer.facing||'down']||[0,1];
  if((dx*facing[0]+dy*facing[1])/distance<-.15)return false;
 }
 const blocked=options.blocked||(()=>false);
 const steps=Math.ceil(distance/.2);
 for(let n=1;n<steps;n++){
  const t=n/steps,x=observer.x+dx*t,y=observer.y+dy*t;
  if(Math.hypot(x-observer.x,y-observer.y)>.35&&Math.hypot(x-target.x,y-target.y)>.35&&blocked(x,y))return false;
 }
 return true;
}
function witnesses(people,target,options={}){
 return people.filter(person=>person.awake!==false&&visible(person,target,options));
}
root.KingdomPerception={visible,witnesses};
})(window);
