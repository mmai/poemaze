const leafRadius = 2;
const circleRadius = 30;
const origin = {x:200, y:200};
const color_up = "green";
const color_down = "brown";
const color_brothers = "gray";
const color_default = "black";

//Root element displayed by the cyclejs widget and used in the driver by the Two.js library 
const vizRootElem = document.createElement('div');

//Minimal widget hosting the visualization root element used by the driver
export function VizWidget() { this.type = 'Widget'; }
VizWidget.prototype = {
  init: function () { return vizRootElem; },
  update: function (prev, elem) {},
};

//Driver
export function makeVizDriver(AI){
  const two = new Two({});
  two.appendTo(vizRootElem);

  return function vizDriver(leafDisplay$){
    leafDisplay$
      .subscribe(dleaf => {
          if (dleaf.reset) two.clear();

          const newLeaf = AI.data[dleaf.leafId];
          const fromLeaf = AI.data[dleaf.fromId];

          const gleaf = makeLeaf(newLeaf);

          const joinLine = makeJoinLine(fromLeaf, newLeaf);
          two.update();
        });
    };

  function makeLeaf (leaf){
    const coords = AI.getCoords(leaf);
    const type = AI.getType(leaf);
    // console.log(coords);

    const pos = getPosFromCoords(coords);
    // console.log(pos);

    const circle = two.makeCircle(pos.x, pos.y, leafRadius);
    const color = (type == 'UP')?color_up:color_down;
    circle.fill = color;
    circle.stroke = color;
    return circle;
  }

  function makeJoinLine(fromLeaf, toLeaf) {
    let coordsFrom = AI.getCoords(fromLeaf);
    let coordsTo = AI.getCoords(toLeaf);

    let joinLine;
    if (coordsFrom.circ == coordsTo.circ && coordsFrom.pos != coordsTo.pos){
      //Reverse arc direction if destination is 'before' start leaf
      let diff = coordsTo.pos - coordsFrom.pos;
      if ( diff == -1 || diff > 1 ){
        let tmp = coordsFrom;
        coordsFrom = coordsTo;
        coordsTo = tmp;
      }

      joinLine = makeArcBetweenLeafs(coordsFrom, coordsTo);
      joinLine.stroke = color_brothers;
    } else {
      joinLine = makeLineBetweenLeafs(coordsFrom, coordsTo);
      joinLine.stroke = (AI.getType(fromLeaf) == 'UP')?color_up:color_down;
    }

    return joinLine;
  }

  function makeArcBetweenLeafs (from, to){
    const posfrom = getPosFromCoords(from);
    const posto = getPosFromCoords(to);
    // const line = two.makeLine(posfrom.x, posfrom.y, posto.x, posto.y);

    const radius = Math.sqrt(Math.pow(posto.x - origin.x, 2) + Math.pow(posto.y - origin.y, 2));

    let polarfrom = polarCoords({x: posfrom.x - origin.x, y:origin.y - posfrom.y});
    let polarto = polarCoords({x: posto.x - origin.x, y:origin.y - posto.y});

    const line = two.makeArcSegment(
      origin.x, origin.y,
      radius, radius + 0.1,
      // 0, twoAngle(polarto.angle - polarfrom.angle),
      // 0, polarto.angle - polarfrom.angle,
      0, polarfrom.angle - polarto.angle,
    );
    line.rotation = -twoAngle(polarto.angle);
    return line;
  }

  function twoAngle(angle){
    return Math.PI/2 + angle ;
  }

  function polarCoords(pos){
    const r = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2)); 
    const angle = 2 * Math.atan(pos.y/(pos.x + r));
    return {r:r, angle:angle};
  }

  function makeLineBetweenLeafs (from, to){
    const posfrom = getPosFromCoords(from);
    const posto = getPosFromCoords(to);
    const line = two.makeLine(posfrom.x, posfrom.y, posto.x, posto.y);
    return line;
  }

  function getPosFromCoords ({circ, pos}){
    if (circ < 1){
      return origin;
    }

    const nbLeafs = Math.pow(2, circ);
    const angleIncrement = Math.PI / (nbLeafs/2 + 1);
    let angle = Math.PI - pos * angleIncrement;
    if (pos > nbLeafs/2) {
      angle -= angleIncrement; 
    }
    const radial = circleRadius * circ; 
    return {
      x: origin.x + radial * Math.cos(angle),
      y: origin.y - radial * Math.sin(angle)
    };
  }
}


