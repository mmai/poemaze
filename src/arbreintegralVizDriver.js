
const display = {
  circles: true,
}

/************************
 * Main visualization
 */
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
  return makeDriver(AI, vizRootElem, {});
}

/***********************
 * Logo visualization
 */
const logoVizRootElem = document.createElement('div');

//Minimal widget hosting the visualization root element used by the driver
export function LogoVizWidget() { this.type = 'Widget'; }
LogoVizWidget.prototype = {
  init: function () { return logoVizRootElem; },
  update: function (prev, elem) {},
};

//Driver
export function makeLogoVizDriver(AI){
  return makeDriver(AI, logoVizRootElem, {
      width: 120,
      height: 120,
      leafRadius: 0.3,
      circleRadius: 8,
      color_background: "black"
    });
}

/***********************
 * Common behavior
 */
//Driver
function makeDriver(AI, vizElem, {
    width = 480,
    height = 480,
    leafRadius = 2,
    circleRadius = 30,
    origin = {x:0, y:0},
    color_up = "rgb(72,122,189)",
    color_down = "rgb(128,120,48)",
    color_brothers = "#BBBBBB",
    color_default = "black",
    color_skeleton= "#DFDFDF",
    color_background= "whitesmoke"
  }){
  const two = new Two({width, height});
  two.appendTo(vizElem);

  const mainGroup = two.makeGroup();
  mainGroup.translation.set(two.width/2, two.height/2);



  const group = two.makeGroup();//group displaying visitor path

  const bground = two.makeCircle(0, 0, circleRadius * 7);
  bground.fill = color_background;
  bground.stroke = color_background;
  mainGroup.add(bground);

  mainGroup.add(drawSkeleton(two));
  mainGroup.add(group);

  let vizState = {
    displayedLeafs: {},
    neighborsIds: {},
    neighborsPathsIds: [],
    currentPositionId: [],
    isUpside: true,
  }

  //Store data needed for the animation
  let newState = {
    isUpside: true,
  }

  let animationLenth = 60; 
  let animationProgression = 0;
  let needUpdate = false;
  let doUpdate = false;
  two.bind('update', function(frameCount){
      if ( newState.isUpside != vizState.isUpside){
        if (animationProgression < animationLenth){
          let step = (animationProgression / animationLenth);
          let factor = newState.isUpside?(1 - step ):step;
          mainGroup.rotation = Math.PI * factor; 
          animationProgression += 1;
        } else {
          animationProgression = 0;
          vizState.isUpside = newState.isUpside;
        }
      }

      //If needed, the DOM will be updated at the next passage (after the current elements are set)
      if (doUpdate){ updateDOM(); doUpdate = false; }
      if (needUpdate){ doUpdate = true; needUpdate = false; }
  }).play();

  function updateDOM(){
    let neighborsElementsIds = Object.keys(vizState.neighborsIds);
    for (let eid of neighborsElementsIds){
      let elem = document.getElementById(eid);
      elem.setAttribute("class", "viz-neighbor");
      elem.setAttribute("data-neighbor-href", `${vizState.neighborsIds[eid].leaf.id}-${vizState.neighborsIds[eid].fromId}`);
    }
  }

  return function vizDriver(leafDisplayBuffer$){
    // return leafDisplay$.map(dleaf => {
        leafDisplayBuffer$.subscribe(leafDisplayBuffer => {
            (function delayDisplay() {
                //If leafDisplayBuffer.leaf exists, it's a single leafDisplay, there is not bufferization
                if (leafDisplayBuffer.leaf !== undefined){
                  displayLeaf(leafDisplayBuffer);
                }

                //We display the dleafs of the buffer until it is empty,
                //with a small delay between each display to get an animation effect
                if (leafDisplayBuffer.length) {
                  displayLeaf(leafDisplayBuffer.shift());
                  setTimeout(delayDisplay, 100);
                }
              })();
          });
      };

  function displayLeaf(dleaf){
    if (dleaf.reset) {
      group.remove(group.children);
      mainGroup.rotation = 0;
      vizState.displayedLeafs = {};
      vizState.isUpside = true;
    }

    newState.isUpside = dleaf.isUpside;

    const newLeaf = dleaf.leaf;
    const fromLeaf = AI.data[dleaf.fromId];

    //Remove neighbors, paths and positions of the previous leaf
    const toRemove = Object.keys(vizState.neighborsIds).concat(vizState.neighborsPathsIds).concat(vizState.currentPositionId);
    group.remove(group.children.filter(child => toRemove.indexOf(child.id) > -1 ));

    const joinLine = makeJoinLine(fromLeaf, newLeaf);
    if (joinLine) group.add(joinLine);

    const {leafElement, curPos} = makeLeaf(newLeaf);
    group.add(curPos);
    // group.add(leafElement);
    vizState.currentPositionId.push(curPos.id);

    //Add new neighbors
    vizState.neighborsIds = {};
    vizState.neighborsPathsIds = [];
    for (let name in dleaf.neighbors){
      const neighbor = dleaf.neighbors[name];
      const neighborFromLeaf = AI.data[neighbor.fromId];
      if (neighbor.leaf){
        //Add path to leaf
        // const joinLine = makeJoinLine(neighborFromLeaf, neighbor.leaf, true);
        // if (joinLine) group.add(joinLine);
        // vizState.neighborsPathsIds.push(joinLine.id);

        //Add leaf
        const leafElement = makeNeighborLeaf(neighbor.leaf);
        group.add(leafElement);
        vizState.neighborsIds[leafElement.id] = neighbor;
      }
    }
    needUpdate = true;
  }

  function makeLeaf (leaf){
    vizState.displayedLeafs[leaf.id] = true;
    const coords = AI.getCoords(leaf);
    const type = AI.getType(leaf);

    const pos = getPosFromCoords(coords);

    //Draw a point
    let circle = null;
    // circle = two.makeCircle(pos.x, pos.y, leafRadius);
    // const color = (type == 'UP')?color_up:color_down;
    // circle.fill = color;
    // circle.stroke = color;

    const circlePos = two.makeCircle(pos.x, pos.y, leafRadius * 2);
    circlePos.stroke = "black";
    circlePos.fill = color_background;

    return {leafElement:circle, curPos: circlePos};
  }

  function makeNeighborLeaf (leaf){
    const coords = AI.getCoords(leaf);
    const type = AI.getType(leaf);
    const pos = getPosFromCoords(coords);
    const circle = two.makeCircle(pos.x, pos.y, leafRadius * 2);

    const color = (type == 'UP')?color_up:color_down;
    circle.fill = color;
    circle.stroke = color;

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

  /**
   * Draw dots at each final tree node
   * @param {object} two - Two.js svg engine object
   */
  function drawSkeleton(two){
    const group = two.makeGroup();
    // group.translation.set(two.width/2, two.height/2);

    for (let circ = 0; circ < 7; circ++){
      const nbLeafs = Math.pow(2, circ);
      for (let pos = 1; pos <= nbLeafs; pos++){
        const svgpos = getPosFromCoords({circ, pos});

        const circle = two.makeCircle(svgpos.x, svgpos.y, leafRadius);
        circle.fill = color_skeleton;
        circle.stroke = color_skeleton;
        group.add(circle);
      }
    }
    return group;
  }
  /*********** Coordinates converters *******/
 
  function getPosFromCoords ({circ, pos}){
    if (circ < 1){
      return origin;
    }

    const nbLeafs = Math.pow(2, circ);
    const angleIncrement = Math.PI / (nbLeafs/2 + 1);

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



