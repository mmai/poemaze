const leafRadius = 2;
const circleRadius = 30;
const origin = {x:0, y:0};
// const origin = {x:200, y:200};
const color_up = "green";
const color_down = "brown";
const color_brothers = "#BBBBBB";
const color_default = "black";

const display = {
  circles: true,
  rootPath: false,
  revealedBranches: false
}

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

  const group = two.makeGroup();
  group.translation.set(two.width/2, two.height/2);

  let displayedBranches = {};
  let previewBranches = {};
  let displayedLeafs = {};
  // let svgLeafs = {};
  let neighborsIds = {};
  let neighborsPathsIds = [];
  let currentPositionId = [];

  let currentType = "UP";
  let animType = "UP";
  let doAnim = false;

  let animationLenth = 60; 
  let animationProgression = 0;
  let needUpdate = false;
  let doUpdate = false;
  two.bind('update', function(frameCount){
      if ( doAnim && animType != currentType){
        if (animationProgression < animationLenth){
          let step = (animationProgression / animationLenth);
          let factor = (animType == "UP")?(1 - step ):step;
          group.rotation = Math.PI * factor; 
          animationProgression += 1;
        } else {
          currentType = animType;
          animationProgression = 0;
        }
      }

      //If needed, the DOM will be updated at the next passage (after the current elements are set)
      if (doUpdate){ updateDOM(); doUpdate = false; }
      if (needUpdate){ doUpdate = true; needUpdate = false; }
  }).play();

  function updateDOM(){
    let neighborsElementsIds = Object.keys(neighborsIds);
    for (let eid of neighborsElementsIds){
      let elem = document.getElementById(eid);
      elem.setAttribute("class", "viz-neighbor");
      elem.setAttribute("data-neighbor-href", `${neighborsIds[eid].leaf.id}-${neighborsIds[eid].fromId}`);
    }
  }

  return function vizDriver(leafDisplay$){
    // return leafDisplay$.map(dleaf => {
      leafDisplay$.subscribe(dleaf => {
          if (dleaf.reset) {
            group.remove(group.children);
            group.rotation = 0;
            displayedBranches = {};
            previewBranches = {};
            displayedLeafs = {};
            currentType = "UP";
          }

          const newLeaf = dleaf.leaf;

          const fromLeaf = AI.data[dleaf.fromId];

          //Remove neighbors, paths and positions of the previous leaf
          let toRemove = Object.keys(neighborsIds).concat(neighborsPathsIds).concat(currentPositionId);
          group.remove(group.children.filter(child => toRemove.indexOf(child.id) > -1 ));

          let {leafElement, type, isAnim, curPos} = makeLeaf(newLeaf);
          animType = type;
          doAnim = isAnim;
          if (animType == "ROOT"){
            animType = "UP";
          }
          group.add(curPos);
          group.add(leafElement);
          currentPositionId.push(curPos.id);
          // svgLeafs[gleaf.id] = newLeaf.id;

          //Add new neighbors
          neighborsIds = {};
          neighborsPathsIds = [];
          for (let name in dleaf.neighbors){
            let neighbor = dleaf.neighbors[name];
            let neighborFromLeaf = AI.data[neighbor.fromId];
            if (neighbor.leaf){
              //Add path to leaf
              let joinLine = makeJoinLine(neighborFromLeaf, neighbor.leaf, true);
              if (joinLine) group.add(joinLine);
              neighborsPathsIds.push(joinLine.id);
              //Add leaf
              let leafElement = makeNeighborLeaf(neighbor.leaf);
              group.add(leafElement);
              neighborsIds[leafElement.id] = neighbor;
            }
          }
          needUpdate = true;

          const joinLine = makeJoinLine(fromLeaf, newLeaf);
          if (joinLine) group.add(joinLine);

          if (display.rootPath){
            addPathFromRoot(newLeaf, group);
          }

          if (display.revealedBranches){
            const neighbors = AI.getNeighbors(newLeaf);
            revealBranchIfVisited(newLeaf, neighbors.leftChild.leaf);
            revealBranchIfVisited(newLeaf, neighbors.rightChild.leaf);
            revealBranchIfVisited(neighbors.parent.leaf, newLeaf);
          }

          // return neighborsIds; 
        });
    };

  function revealBranchIfVisited(parent, child){
    const key = parent.id + "-"  + child.id;
    if (displayedLeafs[parent.id] && displayedLeafs[child.id] && !displayedBranches[key]){
      let joinLine = makeJoinLine(parent, child);
      group.add(joinLine);
      displayedBranches[key] = true;
    }
  }

  function addPathFromRoot(leaf, group){
    const parent = AI.getParent(leaf);
    if (parent && parent.id != leaf.id){
      const key = parent.id + "-"  + leaf.id;
      if (!previewBranches[key] && !displayedBranches[key]){
        let joinLine = makeLineBetweenLeafs(AI.getCoords(parent), AI.getCoords(leaf));
        joinLine.stroke = color_brothers;

        group.add(joinLine);
        previewBranches[key] = true;
        addPathFromRoot(parent, group);
      }
    }
  }

  function makeLeaf (leaf){
    displayedLeafs[leaf.id] = true;
    const coords = AI.getCoords(leaf);
    const type = AI.getType(leaf);
    const isAnim = coords.circ == 4;
    // console.log(coords);

    const pos = getPosFromCoords(coords);
    // console.log(pos);

    const circle = two.makeCircle(pos.x, pos.y, leafRadius);
    const color = (type == 'UP')?color_up:color_down;
    circle.fill = color;
    circle.stroke = color;

    const circlePos = two.makeCircle(pos.x, pos.y, leafRadius * 3);
    circlePos.stroke = "blue";

    return {leafElement:circle, type: type, isAnim: isAnim, curPos: circlePos};
  }

  function makeNeighborLeaf (leaf){
    const coords = AI.getCoords(leaf);
    const pos = getPosFromCoords(coords);
    const circle = two.makeCircle(pos.x, pos.y, leafRadius * 2);
    circle.stroke = "gray";
    return circle;
  }

  function makeJoinLine(fromLeaf, toLeaf, isNeighbor = false) {
    let coordsFrom = AI.getCoords(fromLeaf);
    let coordsTo = AI.getCoords(toLeaf);

    let joinLine;
    if (coordsFrom.circ == coordsTo.circ && coordsFrom.pos != coordsTo.pos){
      if (display.circles){
        //Reverse arc direction if destination is 'before' start leaf
        let diff = coordsTo.pos - coordsFrom.pos;
        if ( diff == -1 || diff > 1 ){
          let tmp = coordsFrom;
          coordsFrom = coordsTo;
          coordsTo = tmp;
        }

        joinLine = makeArcBetweenLeafs(coordsFrom, coordsTo);
      }
    } else {
      joinLine = makeLineBetweenLeafs(coordsFrom, coordsTo);
    }

    if (joinLine){
      if (isNeighbor){
        joinLine.stroke = color_brothers;
      } else {
        joinLine.stroke = (AI.getType(fromLeaf) == 'UP')?color_up:color_down;
      }
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
      0, polarfrom.angle - polarto.angle,
    );
    line.rotation = 0 - Math.PI/2 - polarto.angle;
    return line;
  }

  function makeLineBetweenLeafs (from, to){
    const posfrom = getPosFromCoords(from);
    const posto = getPosFromCoords(to);
    const line = two.makeLine(posfrom.x, posfrom.y, posto.x, posto.y);
    return line;
  }

  /*********** Coordinates converters *******/
 
  function getPosFromCoords ({circ, pos}){
    if (circ < 1){
      return origin;
    }

    const nbLeafs = Math.pow(2, circ);
    const angleIncrement = Math.PI / (nbLeafs/2 + 1);
    const random = Math.random() * angleIncrement / nbLeafs;
    // let deviation = angleIncrement * 0.5 * (pos % 3 ? 1.2 : 0.9) * (circ % 2 ? 0.9 : 1.1);
    let deviation = angleIncrement * 0.5;
    let angle = Math.PI + deviation - pos * angleIncrement;
    if (pos > nbLeafs/2) {
      angle -= angleIncrement ; 
    }
    const radial = circleRadius * circ; 
    return {
      x: origin.x + radial * Math.cos(angle),
      y: origin.y - radial * Math.sin(angle)
    };
  }

  function polarCoords(pos){
    const r = Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2)); 
    const angle = 2 * Math.atan(pos.y/(pos.x + r));
    return {r:r, angle:angle};
  }

}


