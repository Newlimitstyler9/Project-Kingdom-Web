// LPC building and furniture sprite crops. Source credits are linked from character-art-credits.html.
(function(root){"use strict";
const sheets={furniture:'assets/inn-tavern-furniture.png',cooking:'assets/inn-tavern-cooking.png',deco:'assets/inn-tavern-deco.png',exterior:'assets/inn-medieval-exterior.png',interior:'assets/inn-medieval-interior.png',guestBed:'assets/inn-guest-bed.png',thatch:'assets/inn-thatch-roof.png',cottage:'assets/inn-cottage-wall.png',yard:'assets/inn-yard-decorations.png',doors:'assets/inn-windows-doors.png',containers:'assets/bakery-containers.png'};
const crops={
 counter:['furniture',191,320,96,54],table:['furniture',320,190,64,54],stool:['furniture',578,198,32,32],
 cupboard:['furniture',423,0,80,64],
 stairStep:['furniture',896,192,96,32],guestBed:['guestBed',0,0,54,86],
 hearth:['cooking',128,80,96,80],fire:['cooking',64,160,32,30],
 barrel:['deco',0,0,32,32],candle:['deco',0,352,22,32],sconce:['deco',426,352,32,32],
 ale:['deco',0,540,32,34],bread:['deco',190,799,34,31],
 innRoof:['exterior',128,0,128,64],innWall:['exterior',128,128,128,80],
 innShingle:['exterior',128,0,32,48],innChimney:['exterior',160,0,16,64],
 innDoor:['doors',208,512,32,48],innWindow:['exterior',210,70,31,32],
 innGableRoof:['thatch',310,240,120,110],innTimber:['cottage',2,0,92,128],
 bakeryRoof:['thatch',310,16,120,110],bakeryDoor:['doors',16,512,32,48],bakeryOvenMain:['cooking',240,64,55,96],bakeryOvenRight:['cooking',295,96,9,64],bakeryBench:['furniture',192,263,96,58],bakerySack:['containers',48,800,32,32],bakerySackPile:['containers',96,800,64,48],
 yardCart:['yard',192,510,92,74],yardTrough:['yard',422,530,90,48],yardLogs:['yard',455,640,57,60],innSign:['yard',254,36,34,30],
 floorA:['interior',0,192,32,32],floorB:['interior',32,192,32,32],
 wallA:['interior',0,128,32,32],wallB:['interior',32,128,32,32],wallWindows:['interior',96,128,64,64]
};
const images={};for(const [id,url] of Object.entries(sheets)){const image=new Image();image.src=url;images[id]=image}
function draw(ctx,id,x,y,w,h){const crop=crops[id];if(!crop)return false;const [sheet,sx,sy,sw,sh]=crop,img=images[sheet];if(!img.complete||!img.naturalWidth)return false;ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);return true}
root.KingdomInnSprites={draw,get ready(){return Object.values(images).every(img=>img.complete&&img.naturalWidth>0)}};
})(window);
