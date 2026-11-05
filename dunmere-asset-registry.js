// Named, reviewed crops from source sheets. Tile coordinates use the Kenney 16 px grid with 1 px spacing.
(function(root){"use strict";
const sheets={furniture:'assets/inn-tavern-furniture.png',cooking:'assets/inn-tavern-cooking.png',deco:'assets/inn-tavern-deco.png',exterior:'assets/inn-medieval-exterior.png',interior:'assets/inn-medieval-interior.png',guestBed:'assets/inn-guest-bed.png?v=2',thatch:'assets/inn-thatch-roof.png',cottage:'assets/inn-cottage-wall.png',yard:'assets/inn-yard-decorations.png',doors:'assets/inn-windows-doors.png',containers:'assets/bakery-containers.png',horse:'assets/lpc-horse-brown.png?v=1'};
const crops={
 counter:['furniture',191,320,96,54],table:['furniture',320,192,64,43],stool:['furniture',578,198,32,32],
 cupboard:['furniture',423,0,80,64],
 bakeryWallShelf:['furniture',326,0,84,31],bakeryWindow:['interior',128,128,32,32],guestWindow:['interior',128,128,32,32],guestChest:['containers',0,256,32,32],
 stairStep:['furniture',896,192,96,32],guestBed:['guestBed',0,0,54,86],
 hearth:['cooking',128,80,96,80],fire:['cooking',64,160,32,30],
 barrel:['deco',0,0,32,32],candle:['deco',0,352,22,32],sconce:['deco',426,352,32,32],
 ale:['deco',0,540,32,34],bread:['deco',190,799,34,31],
 innRoof:['exterior',128,0,128,64],innWall:['exterior',128,128,128,80],
 innShingle:['exterior',128,0,32,48],
 innDoor:['doors',208,512,32,48],innWindow:['doors',545,255,30,33],
 innGableRoof:['thatch',310,240,120,110],innTimber:['cottage',2,0,92,128],
 bakeryRoof:['thatch',310,16,120,110],bakeryDoor:['doors',16,512,32,48],bakeryOvenMain:['cooking',240,64,55,96],bakeryOvenRight:['cooking',295,96,9,64],bakeryBench:['furniture',192,263,96,58],bakerySack:['containers',48,800,32,32],bakerySackPile:['containers',96,800,64,48],carriedSack:['containers',328,831,32,35],
 yardCart:['yard',192,510,92,74],yardTrough:['yard',422,530,90,48],yardLogs:['yard',455,640,57,60],innSign:['yard',254,36,34,30],
 farmWagon:['yard',192,1322,126,77],
 marketStallGold:['yard',192,800,64,160],marketStallBlue:['yard',32,800,64,160],
 floorA:['interior',0,192,32,32],floorB:['interior',32,192,32,32],
 wallA:['interior',0,128,32,32],wallB:['interior',32,128,32,32],wallWindows:['interior',96,128,64,64]
};
const categories={
 structure:['innRoof','innWall','innShingle','innGableRoof','innTimber','bakeryRoof'],
 opening:['bakeryWindow','guestWindow','innDoor','innWindow','bakeryDoor'],
 furniture:['counter','table','stool','cupboard','bakeryWallShelf','stairStep','guestBed','bakeryBench'],
 storage:['guestChest','barrel'],
 hearth:['hearth','fire','bakeryOvenMain','bakeryOvenRight'],
 lighting:['candle','sconce'],
 goods:['ale','bread','bakerySack','bakerySackPile','carriedSack'],
 transport:['yardCart','farmWagon'],
 market:['marketStallGold','marketStallBlue','innSign'],
 landscape:['yardTrough','yardLogs'],
 surface:['floorA','floorB','wallA','wallB','wallWindows']
};
const exterior=new Set(['innRoof','innWall','innShingle','innDoor','innWindow','innGableRoof','innTimber','bakeryRoof','bakeryDoor','yardCart','yardTrough','yardLogs','innSign','farmWagon','marketStallGold','marketStallBlue']);
const both=new Set(['fire','barrel','bread','bakerySack','bakerySackPile','carriedSack','sconce']);
const entries=Object.fromEntries(Object.entries(crops).map(([id,crop])=>{
 const category=Object.keys(categories).find(key=>categories[key].includes(id));
 if(!category)throw Error('Uncategorized sprite: '+id);
 return [id,{id,category,placement:exterior.has(id)?'exterior':both.has(id)?'both':'interior',sheet:crop[0],rect:crop.slice(1)}];
}));
const buildingTiles={
 walls:{plaster:[17,18,19],stone:[27,28,29],timber:[34,35,40]},
 roofs:{brown:[[20,21],[25,21],[21,21],[20,22],[25,22],[21,22],[20,23],[22,22],[21,23]],slate:[[27,21],[32,21],[28,21],[27,22],[32,22],[28,22],[27,23],[29,22],[28,23]],light:[[34,21],[39,21],[35,21],[34,22],[39,22],[35,22],[34,23],[36,22],[35,23]]},
 windows:{stone:[40,4],plaster:[46,5],timber:[46,5]},
 doors:{wood:[33,1],stone:[40,7]}
};
root.KingdomAssetRegistry={sheets,crops,entries,categories,buildingTiles};
})(window);
