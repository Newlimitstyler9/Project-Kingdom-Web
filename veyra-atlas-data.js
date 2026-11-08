// Authored continental geography for development. Coordinates are atlas units,
// not Brooklands tiles. The close-up playable map keeps its own stable anchors.
(function(root){'use strict';
const width=1400,height=900;
const polities={
 avelorn:{name:'Kingdom of Avelorn',color:'#c7aa70',terrain:'Vel basin · crofts · river towns'},
 brannoc:{name:'Kingdom of Brannoc',color:'#9babb0',terrain:'Storm coast · slate uplands · harbors'},
 dren:{name:'Free Marches of Dren',color:'#77946e',terrain:'Managed northern woods · charter villages'},
 vessari:{name:'Vessari League',color:'#80a9a4',terrain:'Gulf ports · salt pans · shipping'},
 tharic:{name:'Tharic Holds',color:'#a4a29a',terrain:'Mountain spine · ore · stone'},
 sareth:{name:'Sareth Principalities',color:'#c4a573',terrain:'Irrigated valleys · terraces · canals'},
 ordan:{name:'Ordan Confederacy',color:'#b3aa78',terrain:'Grasslands · herds · seasonal corridors'}
};
const sites=[
 {id:'velcourt',name:'Velcourt',polity:'avelorn',kind:'capital',x:750,y:615,water:'River Vel',purpose:'Royal court, archive, mint, and basin granaries',history:'Older river foundations sit beneath later royal stores; succession and debt now strain the court.'},
 {id:'greyford',name:'Greyford',polity:'avelorn',kind:'walled town',x:730,y:505,water:'River Vel bridge',purpose:'Market crossing, march court, warehouses, and tolls',history:'The AC 734 wall repair and RR 272 bridge levy left different evidence of who owes the crossing.',stage:'playable'},
 {id:'dunmere',name:'Dunmere',polity:'avelorn',kind:'village',x:655,y:450,water:'Dun Brook',purpose:'Small farming, mill, forge, and woodland village',history:'The RR 273 flood damaged the mill approach and left repair costs and cutting rights disputed.',stage:'playable'},
 {id:'bellmere',name:'Bellmere',polity:'avelorn',kind:'ferry hamlet',x:535,y:635,water:'Lower River Vel ferry',purpose:'Ferry, fish, reeds, and boat repair',history:'A flood moved one landing; the ferry household leases passage but does not own every bank.'},
 {id:'kingsford',name:'Kingsford',polity:'avelorn',kind:'bridge fort',x:880,y:400,water:'Upper River Vel bridge',purpose:'Guarded crossing, stabling, wheel and hoof repair',history:'The RR 272 duty schedule diverted some heavy carts to slower crossings.'},
 {id:'marrowfield',name:'Marrowfield',polity:'avelorn',kind:'grain village',x:675,y:575,water:'Spring-fed fields',purpose:'Grain, beans, seed reserve, carts, and fodder',history:'A seed debt and drainage loss in RR 273 make each household harvest matter.',stage:'early prototype'},
 {id:'cairnport',name:'Cairnport',polity:'brannoc',kind:'capital harbor',x:275,y:285,water:'Storm Coast harbor',purpose:'Queen Maire’s court, fisheries, naval stores',history:'The draft AC 493 quay rebuilding left layered stonework and later levy arguments.'},
 {id:'westhaven',name:'Westhaven',polity:'brannoc',kind:'shipyard town',x:280,y:375,water:'Storm Coast slipways',purpose:'Hull building, rope, coopers, chandlers',history:'Ship orders depend on actual Blackpine beams, pitch, iron, crews, and food.'},
 {id:'slatewick',name:'Slatewick',polity:'brannoc',kind:'quarry village',x:370,y:215,water:'Upland springs',purpose:'Slate and masonry cart work',history:'Quarry leases and wages are disputed; steep roads limit how much stone can leave.'},
 {id:'stormcross',name:'Stormcross',polity:'brannoc',kind:'coastal market',x:290,y:455,water:'Weather harbor',purpose:'Fish, stores, repair, lodging, timber transfer',history:'RR 272 storm damage raised storage costs; RR 273 diverted bridge traffic crowded the town.'},
 {id:'blackpine',name:'Blackpine',polity:'brannoc',kind:'timber village',x:435,y:345,water:'Forest tributary',purpose:'Ship beams, smaller logs, resin, charcoal',history:'Count Darran’s grant overlaps Dren common use; old stump lines mark earlier cuts.'},
 {id:'mootwood',name:'Mootwood',polity:'dren',kind:'assembly town',x:610,y:250,water:'Woodland springs',purpose:'Charter archive, moot hall, hostels, crafts',history:'Warden Hessa keeps coalition records, but copies and witnesses can disagree.'},
 {id:'pineharrow',name:'Pineharrow',polity:'dren',kind:'forest village',x:575,y:350,water:'Coppice stream',purpose:'Managed poles, planks, honey, grazing',history:'The RR 271 survey line clashes with household cutting turns and Brannoc demand.'},
 {id:'brackenmere',name:'Brackenmere',polity:'dren',kind:'marsh hamlet',x:455,y:235,water:'Northern marsh',purpose:'Reeds, fish, wet grazing, seasonal paths',history:'A path can be submerged for a season without being abandoned or unclaimed.'},
 {id:'northwatch',name:'Northwatch',polity:'dren',kind:'pass fort',x:790,y:245,water:'Protected pass spring',purpose:'Patrols, lodging, horse care, route reports',history:'The draft AC 842 closure and RR 273 interruption exposed thin grain and fodder stores.'},
 {id:'embercamp',name:'Embercamp',polity:'dren',kind:'seasonal camp',x:670,y:305,water:'Forest rill',purpose:'Managed charcoal kilns and mobile worker shelters',history:'Old kiln scars and coppice regrowth preserve rights after the camp moves.'},
 {id:'vessara',name:'Vessara',polity:'vessari',kind:'league capital',x:400,y:755,water:'Vessari Gulf port',purpose:'Counting houses, fleet contracts, credit, dock labor',history:'Draft AC 407 far-ledger practice connects ports without making creditors owners of pledged land.'},
 {id:'saltward',name:'Saltward',polity:'vessari',kind:'salt port',x:285,y:650,water:'Tidal salt pans',purpose:'Salt, fish preservation, coastal shipping',history:'Weather, wages, and brine access bound every salt shipment.'},
 {id:'loombridge',name:'Loombridge',polity:'vessari',kind:'textile town',x:495,y:725,water:'Lower Vel channel',purpose:'Guild looms, dyes, cloth market',history:'Craft standards and apprenticeships link distant workers without universal guild agreement.'},
 {id:'lantern-cay',name:'Lantern Cay',polity:'vessari',kind:'island hamlet',x:166,y:755,water:'Gulf island landing',purpose:'Pilots, beacon, channel guidance',history:'A dark beacon may mean delayed oil, storm damage, debt, or neglect; boats bring every supply.'},
 {id:'reedhaven',name:'Reedhaven',polity:'vessari',kind:'estuary village',x:435,y:675,water:'Vel estuary',purpose:'Barges, reeds, fish, changing shoals',history:'Charts can lag behind a shifting channel; pilots and fishers keep different records.'},
 {id:'stonehall',name:'Stonehall',polity:'tharic',kind:'council town',x:1070,y:245,water:'Highland spring',purpose:'Hold councils, stonework, public records',history:'High Speaker Dara mediates partnerships whose crews can refuse a joint decision.'},
 {id:'ironvein',name:'Ironvein',polity:'tharic',kind:'mine town',x:1135,y:325,water:'Mine drainage stream',purpose:'Iron ore, smelting, tools, apprenticeship',history:'Draft AC 318 partnership shares and old shafts survive in wage and safety claims.'},
 {id:'rimegate',name:'Rimegate',polity:'tharic',kind:'pass fort',x:970,y:290,water:'Snowmelt cistern',purpose:'Winter pass, caravan stores, tolls',history:'Snow and divided toll priorities can stop grain and iron in opposite directions.'},
 {id:'whitestone',name:'Whitestone',polity:'tharic',kind:'quarry village',x:1050,y:405,water:'Limestone springs',purpose:'Pale stone, mason teaching, steep cart work',history:'A master’s reputation needs finished arches and apprentices, not only rumor.'},
 {id:'coalbreak',name:'Coalbreak',polity:'tharic',kind:'charcoal village',x:985,y:365,water:'Foothill stream',purpose:'Fuel kilns for ore work',history:'A depleted rotation can idle Ironvein furnaces despite rich ore.'},
 {id:'neral',name:'Neral',polity:'sareth',kind:'court town',x:785,y:735,water:'Neral canal junction',purpose:'Water council, records, gardens, craft market',history:'Draft AC 236 shared-channel duties outlast the people who first negotiated them.'},
 {id:'nine-wells',name:'Nine Wells',polity:'sareth',kind:'scholarly town',x:870,y:785,water:'Nine reliable wells',purpose:'Healers, teachers, scribes, students',history:'Training and treatment depend on specific mentors, fees, beds, and case records.'},
 {id:'red-terrace',name:'Red Terrace',polity:'sareth',kind:'orchard village',x:690,y:770,water:'Terrace feeder',purpose:'Fruit, oil, shared channel upkeep',history:'Blocked water harms each terrace differently; old turns and wall repairs are evidence.'},
 {id:'kesh-canal',name:'Kesh Canal',polity:'sareth',kind:'canal village',x:935,y:710,water:'Managed locks',purpose:'Boat passage, lock keeping, irrigated fields',history:'A lock opened for barges can deprive a downstream field of its timed share.'},
 {id:'glassbank',name:'Glassbank',polity:'sareth',kind:'kiln town',x:1010,y:785,water:'South valley wells',purpose:'Clay, pigment minerals, ceramics',history:'The blue mineral bed has a surface lease; its deeper extent remains uncertain.'},
 {id:'ordamar',name:'Ordamar',polity:'ordan',kind:'assembly market',x:1110,y:575,water:'Grassland river crossing',purpose:'Seasonal council, horse, wool, caravan market',history:'First Rider Seran negotiates corridors with groups that retain their own herds.'},
 {id:'horsefold',name:'Horsefold',polity:'ordan',kind:'herding village',x:1180,y:520,water:'Pasture wells',purpose:'Breeding, tack, riding mentors',history:'Individual horses vary; breeding records, feed, injury, and training matter.'},
 {id:'stepwell',name:'Stepwell',polity:'ordan',kind:'caravan stop',x:1030,y:650,water:'Guarded deep well',purpose:'Water, storage, shelter, route fees',history:'Draft AC 578 well circuits constrain draw rights separately from grazing rights.'},
 {id:'rillgrass',name:'Rillgrass',polity:'ordan',kind:'seasonal camp',x:1215,y:625,water:'Seasonal rill',purpose:'Mobile herding households and grazing',history:'A vacant camp ring can still mark an active seasonal use right.'},
 {id:'eastgate',name:'Eastgate',polity:'ordan',kind:'border market fort',x:1235,y:445,water:'East road wells',purpose:'Customs, cart repair, fodder, guarded trade',history:'A weighed manifest and confiscation record may tell different versions of a seized load.'},
 {id:'salt-run',name:'Salt Run',polity:'ordan',kind:'seasonal salt camp',x:1110,y:735,water:'Saline basin',purpose:'Salt extraction under seasonal water limits',history:'Ordan use overlaps a Sareth survey claim; a rich basin still needs carts and drinkable water.'}
];
const roads=[
 ['dunmere','greyford'],['dunmere','bellmere'],['dunmere','marrowfield'],['greyford','kingsford'],['greyford','velcourt'],['greyford','pineharrow'],['greyford','bellmere'],['marrowfield','velcourt'],['velcourt','bellmere'],['velcourt','kingsford'],['velcourt','loombridge'],['velcourt','neral'],
 ['bellmere','stormcross'],['bellmere','reedhaven'],['kingsford','northwatch'],['kingsford','rimegate'],['pineharrow','mootwood'],['pineharrow','blackpine'],['mootwood','northwatch'],['mootwood','brackenmere'],['mootwood','embercamp'],['northwatch','rimegate'],
 ['blackpine','stormcross'],['blackpine','slatewick'],['stormcross','westhaven'],['westhaven','cairnport'],['cairnport','slatewick'],['reedhaven','loombridge'],['loombridge','vessara'],['vessara','saltward'],
 ['rimegate','stonehall'],['stonehall','ironvein'],['stonehall','whitestone'],['ironvein','coalbreak'],['whitestone','eastgate'],['neral','nine-wells'],['neral','red-terrace'],['neral','kesh-canal'],['kesh-canal','glassbank'],['kesh-canal','stepwell'],['stepwell','ordamar'],['stepwell','salt-run'],['ordamar','horsefold'],['ordamar','rillgrass'],['ordamar','eastgate'],['eastgate','horsefold']
].map(([from,to])=>({from,to,mode:'road'}));
const crossings=[
 {id:'vel-greyford',site:'greyford',mode:'bridge',river:'Vel',note:'Market bridge with disputed toll authority'},
 {id:'vel-kingsford',site:'kingsford',mode:'bridge',river:'Vel',note:'Fortified upstream stone span'},
 {id:'vel-bellmere',site:'bellmere',mode:'ferry',river:'Vel',note:'Lower ferry with daylight and flood limits'}
];
const waterways=[
 {from:'kingsford',to:'greyford',mode:'river',name:'Upper Vel cargo reach'},
 {from:'greyford',to:'velcourt',mode:'river',name:'Vel basin barges'},
 {from:'velcourt',to:'bellmere',mode:'river',name:'Lower Vel cargo reach'},
 {from:'bellmere',to:'reedhaven',mode:'river',name:'Estuary barges'}
];
const seaLanes=[
 {from:'vessara',to:'lantern-cay',mode:'ship',name:'Gulf pilots and supply boats'},
 {from:'saltward',to:'lantern-cay',mode:'ship',name:'Saltward beacon supply'},
 {from:'vessara',to:'cairnport',mode:'ship',name:'Coastal merchant passage'}
];
const futurePassages=[
 {id:'western-sea',from:'vessara',edge:'west',mode:'ship',note:'A later continent would require a ship, crew, stores, weather window, and landfall.'}
];
root.VeyraAtlas={version:1,width,height,polities,sites,roads,crossings,waterways,seaLanes,futurePassages};
})(typeof window==='undefined'?globalThis:window);
