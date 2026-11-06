// Fixed 16 px module grammar: nine roof tiles per finish, three wall tiles per finish.
(function(root){'use strict';
const byType={
 court:['limestone','blueSlate'],warehouse:['timber','brown'],smithy:['stone','slate'],jail:['stone','slate'],
 bakery:['ochre','clay'],chapel:['limestone','blueSlate'],stable:['ochre','moss'],
 weaver:['agedTimber','moss'],apothecary:['ochre','blueSlate'],granary:['timber','brown'],
 carpenter:['agedTimber','clay'],tollhouse:['stone','slate']
};
const byBuilding={
 'vell-house':['stone','slate'],'pell-house':['agedTimber','clay'],'reed-house':['ochre','moss'],
 'forge-house':['timber','brown'],'clerk-house':['plaster','light'],'guard-barracks':['limestone','blueSlate'],
 'market-inn':['agedTimber','clay'],'south-croft':['ochre','moss'],'tanner-house':['timber','brown'],
 'mason-house':['limestone','blueSlate'],'fen-house':['plaster','light'],'dyer-house':['agedTimber','moss'],
 'bridge-row-a':['plaster','brown'],'bridge-row-b':['timber','brown'],'east-row-a':['ochre','moss'],
 'east-row-b':['agedTimber','clay'],'south-croft-two':['plaster','brown'],'south-croft-three':['plaster','light']
};
root.GreyfordBuildingVisuals=Object.freeze({tileSize:16,roofRows:Object.freeze({moss:0,clay:1,blueSlate:2}),wallGroups:Object.freeze({ochre:0,agedTimber:1,limestone:2}),wallWindows:Object.freeze({ochre:'plaster',agedTimber:'timber',limestone:'stone'}),byType:Object.freeze(byType),byBuilding:Object.freeze(byBuilding)});
})(window);
