// Outdoor night shade with a small warm clearing around a held torch.
(function(root){'use strict';
function shadeForHour(hour){return (hour>=21||hour<5)?0.42:(hour>=18||hour<7)?0.16:0}
function draw(ctx,width,height,hour,x,y,torchLit,now=0){
 const shade=shadeForHour(hour);if(!shade)return;
 if(!torchLit){ctx.fillStyle=`rgba(12,22,43,${shade})`;ctx.fillRect(0,0,width,height);return}
 const flicker=Math.sin(now*.018)*4+Math.sin(now*.031)*2;
 const radius=165+flicker;
 const dark=ctx.createRadialGradient(x,y,12,x,y,radius);
 dark.addColorStop(0,'rgba(12,22,43,0.02)');
 dark.addColorStop(.48,`rgba(12,22,43,${shade*.28})`);
 dark.addColorStop(1,`rgba(12,22,43,${shade})`);
 ctx.fillStyle=dark;ctx.fillRect(0,0,width,height);
 ctx.save();ctx.globalCompositeOperation='screen';
 const warm=ctx.createRadialGradient(x,y,0,x,y,72+flicker*.3);
 warm.addColorStop(0,'rgba(255,164,72,0.21)');
 warm.addColorStop(.55,'rgba(225,115,42,0.07)');
 warm.addColorStop(1,'rgba(225,115,42,0)');
 ctx.fillStyle=warm;ctx.fillRect(x-80,y-80,160,160);ctx.restore();
}
root.KingdomLighting={shadeForHour,draw};
})(window);
