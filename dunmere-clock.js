(function(root){"use strict";
function create(secondsPerHour=20){
 let accumulator=0;
 function advance(delta,speed,onHour){if(!Number.isFinite(delta)||delta<0)return 0;if(speed===0)return 0;accumulator+=Math.min(delta,.25)*speed;let ticks=0;while(accumulator>=secondsPerHour&&ticks<12){accumulator-=secondsPerHour;onHour();ticks++}return ticks}
 function snapshot(){return {version:1,accumulator,secondsPerHour}}
 function restore(data){if(!data||data.version!==1||data.secondsPerHour!==secondsPerHour||!Number.isFinite(data.accumulator)||data.accumulator<0||data.accumulator>secondsPerHour*12)return false;accumulator=data.accumulator;return true}
 return {advance,snapshot,restore};
}
root.KingdomClock={create};
})(window);
