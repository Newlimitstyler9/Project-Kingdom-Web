// Local-only diagnostics for the Dunmere browser prototype. No network reporting.
(function(global) {
"use strict";
const entries=[], max=180, counters={pathFailures:0,blockedMoves:0,routeAttempts:0,simSteps:0,jsErrors:0};
let fps=0,frameMs=0,lastSample=0,frames=0,elapsed=0;
function add(level,message,details) {
 const entry={at:new Date().toISOString(),level,message:String(message),details:details||""};
 entries.push(entry);if(entries.length>max)entries.shift();
 if(level==="error")counters.jsErrors++;
}
global.addEventListener("error",e=>add("error",e.message,e.filename+":"+e.lineno+":"+e.colno));
global.addEventListener("unhandledrejection",e=>add("error","Unhandled promise rejection",String(e.reason)));
function frame(dt) {frames++;elapsed+=dt;if(elapsed>=1){fps=Math.round(frames/elapsed);frameMs=Math.round(elapsed/frames*1000*10)/10;frames=0;elapsed=0;lastSample=Date.now()}}
function report(state) {
 const base={build:"dunmere-living-0.6",url:location.pathname,userAgent:navigator.userAgent,viewport:{w:innerWidth,h:innerHeight,dpr:devicePixelRatio},performance:{fps,frameMs,lastSample},counters:{...counters},world:state,events:entries.slice(-80)};
 return JSON.stringify(base,null,2);
}
async function copy(state) {
 const payload=report(state);
 try {if(navigator.clipboard&&global.isSecureContext){await navigator.clipboard.writeText(payload);return true}}
 catch(e){add("warn","Clipboard unavailable",String(e))}
 const el=document.createElement("textarea");el.value=payload;el.style.position="fixed";el.style.left="-9999px";document.body.append(el);el.select();let ok=false;try{ok=document.execCommand("copy")}catch(e){add("warn","Fallback copy failed",String(e))}el.remove();return ok;
}
global.KingdomDebug={add,frame,report,copy,counters,get fps(){return fps},get frameMs(){return frameMs},get entries(){return entries.slice()}};
add("info","Diagnostics initialized; local only");
})(window);
