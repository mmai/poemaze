const leafRadius = 2;
const circleRadius = 30;
const origin = {x:200, y:200};
const color_up = "green";
const color_down = "brown";

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
          const newLeaf = AI.data[dleaf.leafId];
          const fromLeaf = AI.data[dleaf.fromId];

          const gleaf = makeLeaf(newLeaf);
          const linefrom = makeLineBetweenLeafs(fromLeaf, newLeaf);

          two.update();
        });
    };

  function makeLeaf (leaf){
    const coords = AI.getCoords(leaf);
    const type = AI.getType(leaf);
    console.log(coords);

    const pos = getPosFromCoords(coords);
    // console.log(pos);

    const circle = two.makeCircle(pos.x, pos.y, leafRadius);
    const color = (type == 'UP')?color_up:color_down;
    circle.fill = color;
    circle.stroke = color;
    return circle;
  }

  function makeLineBetweenLeafs (from, to){
    const posfrom = getPosFromCoords(AI.getCoords(from));
    const posto = getPosFromCoords(AI.getCoords(to));
    const line = two.makeLine(posfrom.x, posfrom.y, posto.x, posto.y);
    const color = (AI.getType(to) == 'UP')?color_up:color_down;
    line.stroke = color;
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


