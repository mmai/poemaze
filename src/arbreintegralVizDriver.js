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
    const coordsFrom = AI.getCoords(fromLeaf);
    const coordsTo = AI.getCoords(toLeaf);

    let joinLine;
    if (coordsFrom.circ == coordsTo.circ && coordsFrom.pos != coordsTo.pos){
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
    let anglefrom = Math.acos((posfrom.x - origin.x)/radius);
    let angleto = Math.acos((posto.y - origin.y)/radius);
    const line = two.makeArcSegment(
      origin.x, origin.y,
      radius, radius + 0.1,
      anglefrom, angleto
    );
    return line;
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


