// Both complete sprite sheets use twelve 32x48 cells: idle and two strides
// for each facing direction. Every pose has its own full-body pixels.
(function(root){"use strict";
const FRAMES=Object.freeze({down:[0,1,2],left:[3,4,5],right:[6,7,8],up:[9,10,11]});
const STRIDE_SEQUENCE=[1,0,2,0];
const PHASE_MS=145;
function select(direction,moving,walkTimeMs){
 const facing=Object.prototype.hasOwnProperty.call(FRAMES,direction)?direction:"down";
 const phase=moving?STRIDE_SEQUENCE[Math.floor(Math.max(0,walkTimeMs)/PHASE_MS)%4]:0;
 return {frame:FRAMES[facing][phase],direction:facing};
}
function resolveDirection(previous,dx,dy){
 if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)<.22)return previous;
 const ax=Math.abs(dx),ay=Math.abs(dy),currentHorizontal=previous==="left"||previous==="right";
 const horizontal=currentHorizontal?ax>=ay*.73:ax>ay*1.35;
 if(horizontal){if(ax<.24)return previous;return dx<0?"left":"right"}
 if(ay<.24)return previous;return dy<0?"up":"down";
}
root.KingdomPlayerFrames={select,resolveDirection};
})(window);
