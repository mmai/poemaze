import {svg, h} from '@cycle/dom';
import {circToCartesian, cartesianToPolar} from './arbreintegralGeometry'

export function makeAiSvgComponent(AI, {
    origin, width, height,
    leafRadius, circleRadius,
    color_default, color_background,
    color_up, color_down,
    color_brothers,
    color_skeleton,
  }){

  const getCoordsFromPos = pos => circToCartesian(origin, circleRadius, pos)

  const skeletonVtree = drawSkeleton();
  let pathsVtree = []

  let vizState = {
    displayedLeafs: {},
    neighborsIds: {},
    neighborsPathsIds: [],
    currentPositionId: [],
    isUpside: true,
  }

  return function AiSvgComponent({props$}) {
    let rotation = 0

    const visitedLeaf$ = props$.map(state => {
        let fromId = state.visitedLeafs[state.currentLeafId];
        if (fromId === undefined && state.currentLeafId === "0") fromId = "0";
        return {
          reset: Object.keys(state.visitedLeafs).length < 1,
          leaf: state.leafInfos.leaf,
          neighbors: state.leafInfos.neighbors,
          fromId: fromId,
          isUpside: state.isUpside,
        };
      })
    .filter(leaf => leaf.fromId !== undefined)
    .distinctUntilChanged()

    const vtree$ = visitedLeaf$.map(dleaf => {
        if (dleaf.reset) {
          pathsVtree = []
          vizState.displayedLeafs = {};
          vizState.isUpside = true;
        }

        const {rotation, animationClass} = getRotationAnimationInfo(dleaf)

        const newLeaf = dleaf.leaf;
        const fromLeaf = AI.data[dleaf.fromId];
        pathsVtree = amendPathsVtree(AI, pathsVtree, newLeaf, fromLeaf)

        const transform = `translate(${width/2},${height/2}), rotate(${rotation})`
        return svg(`svg#logoviz`, {class: animationClass, width, height }, [
            skeletonVtree,
            svg('g', {transform}, pathsVtree)
          ])
      })

    return {
      DOM: vtree$
    };
  }

  function amendPathsVtree(AI, pathsVtree, newLeaf, fromLeaf){
    const coords = AI.getCoords(newLeaf);
    const type = AI.getType(newLeaf);

    const {x, y} = getCoordsFromPos(coords);
    pathsVtree.push(
      // svg('circle', {cx:x, cy:y, r:leafRadius*2, stroke: "black", fill:color_background})
      // svg('circle', {cx:x, cy:y, r:leafRadius*2, stroke: "black", fill:color_background})
      makeJoinLine(fromLeaf, newLeaf)
    )
    return pathsVtree;
  }

  function getRotationAnimationInfo(dleaf){
    let rotation = dleaf.isUpside ? 0 : 180

    //do we need to do a rotation animation ?
    let animationClass = ""
    if (dleaf.isUpside != vizState.isUpside){
      //Add a class for CSS animation (for IE browser support)
      animationClass = 'viz-animate'
      vizState.isUpside = dleaf.isUpside
      //Invert the value of rotation : we want the value of the start of the animation
      rotation = rotation == 180 ? 0 : 180
    }

    return {rotation, animationClass}
  }

  function makeJoinLine(fromLeaf, toLeaf) {
    let coordsFrom = AI.getCoords(fromLeaf);
    let coordsTo = AI.getCoords(toLeaf);
    let strokeColor = (AI.getType(fromLeaf) == 'UP')?color_up:color_down;

    let joinLine;
    if (coordsFrom.circ == coordsTo.circ && coordsFrom.pos != coordsTo.pos){
      //Reverse arc direction if destination is 'before' start leaf
      let diff = coordsTo.pos - coordsFrom.pos;
      if ( diff == -1 || diff > 1 ){
        let tmp = coordsFrom;
        coordsFrom = coordsTo;
        coordsTo = tmp;
      }

      joinLine = makeArcBetweenLeafs(coordsFrom, coordsTo, strokeColor);
    } else {
      joinLine = makeLineBetweenLeafs(coordsFrom, coordsTo, strokeColor);
    }

    return joinLine;
  }

  function makeArcBetweenLeafs (from, to, color){
    const posfrom = getCoordsFromPos(from);
    const posto = getCoordsFromPos(to);

    const radius = Math.sqrt(Math.pow(posto.x - origin.x, 2) + Math.pow(posto.y - origin.y, 2));

    let polarfrom = cartesianToPolar({x: posfrom.x - origin.x, y:origin.y - posfrom.y});
    let polarto = cartesianToPolar({x: posto.x - origin.x, y:origin.y - posto.y});

    return svg('path', {
        d: describeSvgArc(radius, 0 - polarfrom.angle, 0 - polarto.angle),
        stroke: color,
        'stroke-width': 1
      })
  }

  function makeLineBetweenLeafs (from, to, color){
    const posfrom = getCoordsFromPos(from);
    const posto = getCoordsFromPos(to);
    return svg('line', {x1:posfrom.x, y1:posfrom.y, x2:posto.x, y2:posto.y, stroke:color, 'stroke-width':1 });
  }

/**
 * Draw dots at each final tree node
 */
 function drawSkeleton(){
   let points = []
   for (let circ = 0; circ < 7; circ++){
     const nbLeafs = Math.pow(2, circ);
     for (let pos = 1; pos <= nbLeafs; pos++){
       const {x, y} = getCoordsFromPos({circ, pos});
       points[points.length] = svg('circle', {cx:x, cy:y, r:leafRadius, fill:color_skeleton})
       // circle.stroke = color_skeleton;
     }
   }

   return svg('g', {transform:`translate(${width/2},${height/2})`}, [
       svg('circle', { fill: color_background, cx: 0, cy: 0, r: circleRadius * 7 }),
       ...points
     ]);
 }
}

/**
 * SVG arc circle path description
 * @param {number} radius - radius of the circle
 * @param {number} startAngle - angle of the starting point in radians
 * @param {number} endAngle - angle of the ending point in radians
 * @return {string}
 */
function describeSvgArc(radius, startAngle, endAngle){
  return [
    "M", radius * Math.cos(startAngle), radius * Math.sin(startAngle), 
    "A",
    radius,
    radius,
    0,
    endAngle - startAngle <= Math.PI / 2 ? "0" : "1",
    1, 
    radius * Math.cos(endAngle), radius * Math.sin(endAngle), 
  ].join(" ");
}

