const leafRadius = 2;
const circleRadius = 30;
const origin = {x:200, y:200};
const color_up = "green";
const color_down = "brown";

let vizRootElem = document.createElement('div');

export function VizWidget() {
  this.type = 'Widget';
}
VizWidget.prototype = {
  init: function () {
    return vizRootElem;
  },
  update: function (prev, elem) {
  },
};

export function makeVizDriver(AI){
  let two = new Two({});
  two.appendTo(vizRootElem);

  return function vizDriver(leafDisplay$){
    leafDisplay$
      .subscribe(dleaf => {
          let newLeaf = AI.data[dleaf.leafId];
          let fromLeaf = AI.data[dleaf.fromId];

          let gleaf = makeLeaf(newLeaf);
          let linefrom = makeLineBetweenLeafs(fromLeaf, newLeaf);

          two.update();
        });
    };

  function makeLeaf (leaf){
    let coords = AI.getCoords(leaf);
    let type = AI.getType(leaf);
    console.log(coords);

    let pos = getPosFromCoords(coords);
    // console.log(pos);

    let circle = two.makeCircle(pos.x, pos.y, leafRadius);
    let color = (type == 'UP')?color_up:color_down;
    circle.fill = color;
    circle.stroke = color;
    return circle;
  }

  function makeLineBetweenLeafs (from, to){
    let posfrom = getPosFromCoords(AI.getCoords(from));
    let posto = getPosFromCoords(AI.getCoords(to));
    let line = two.makeLine(posfrom.x, posfrom.y, posto.x, posto.y);
    let color = (AI.getType(to) == 'UP')?color_up:color_down;
    line.stroke = color;
    return line;
  }

  function getPosFromCoords ({circ, pos}){
    if (circ < 1){
      return origin;
    }

    let nbLeafs = Math.pow(2, circ);
    let angleIncrement = Math.PI / (nbLeafs/2 + 1);
    let angle = Math.PI - pos * angleIncrement;
    if (pos > nbLeafs/2) {
      angle -= angleIncrement; 
    }
    let radial = circleRadius * circ; 
    return {
      x: origin.x + radial * Math.cos(angle),
      y: origin.y - radial * Math.sin(angle)
    };
  }
}


