// Render the checked building template at the same world anchor as collision and doors.
(function(root){"use strict";
const template=root.KingdomBuildingTemplates;
const sheet=new Image();sheet.src='assets/kenney-roguelike-sheet.png';
function valid(){
 if(!template||template.tileSize!==16||template.spacing!==1||template.width!==5||template.height!==5||template.door[0]!==2||template.door[1]!==4)return false;
 return [...Object.values(template.layers),...Object.values(template.roofs)].every(layer=>layer.length===template.height&&layer.every(row=>row.length===template.width&&row.every(cell=>cell===null||Array.isArray(cell)&&cell.length===2&&Number.isInteger(cell[0])&&Number.isInteger(cell[1])&&cell[0]>=0&&cell[0]<57&&cell[1]>=0&&cell[1]<31)));
}
if(!valid())throw Error('Invalid modular building template');
function paint(g,b,size,layer){
 if(!sheet.complete||!sheet.naturalWidth)return false;
 const x0=Math.round((b.x+template.offset[0])*size),y0=Math.round((b.y+template.offset[1])*size);
 g.save();g.imageSmoothingEnabled=false;
 for(let y=0;y<template.height;y++)for(let x=0;x<template.width;x++){
  const cell=layer[y][x];if(!cell)continue;
  const [cx,cy]=cell;
  g.drawImage(sheet,cx*17,cy*17,16,16,x0+x*size,y0+y*size,size+1,size+1);
 }
 g.restore();return true;
}
function drawWalls(g,b,size){if(!paint(g,b,size,template.layers.wall))return false;paint(g,b,size,template.layers.openings);return true}
function drawRoof(g,b,size){const style=template.kindRoof[b.kind]||'brown';return paint(g,b,size,template.roofs[style])}
root.KingdomModularBuildings={template,valid,drawWalls,drawRoof,get ready(){return sheet.complete&&!!sheet.naturalWidth}};
})(window);
