import {svg, h} from '@cycle/dom';
import {circToCartesian, cartesianToPolar} from './arbreintegralGeometry'

/**
 * AiSvgComponent factory 
 * @param {Object} AI - Arbre integral object
 * @param {Object} settings
 *
 * @return {function} - AiSvg Cycle.js component
 */
export function makeAiSvgComponent(AI, {
    origin, width, height,
    leafRadius, circleRadius,
    color_default, color_background,
    color_up, color_down,
    color_brothers,
    color_skeleton,
    displayNeighbors = true
  }){

  const getCoordsFromPos = pos => circToCartesian(origin, circleRadius, pos)

  const skeletonVtree = drawSkeleton();
  let pathsVtree = []

  /**
   * AiSvgComponent - Cycle.js component
   *
   * @param {visitedLeaf$} - component sources
   * @return {DOM}
   */
  return function AiSvgComponent({visitedLeaf$}) {
    let rotation = 0
    const vtree$ = visitedLeaf$.map(dleaf => {
        if (dleaf.reset) {
          pathsVtree = []
        }

        const newLeaf = dleaf.leaf;
        const fromLeaf = AI.data[dleaf.fromId];

        pathsVtree.push( makeJoinLine(fromLeaf, newLeaf))

        const {rotation, animationClass} = getRotationAnimationInfo(dleaf)
        const transform = `translate(${width/2},${height/2}), rotate(${rotation})`
        return svg('svg', {class: animationClass, width, height }, [
            skeletonVtree,
            svg('g', {transform}, [
                ...pathsVtree,
                currentPositionVtree(newLeaf),
                ...neighborsVtree(dleaf),
              ]),
          ])
      })

    return {
      DOM: vtree$
    };
  }

  /**
   * Virtual DOM of a SVG circle at the current position
   *
   * @param {AI leaf} leaf - current visited leaf
   * @return {vdom tree}
   */
  function currentPositionVtree(leaf){
    const coords = AI.getCoords(leaf);
    const {x, y} = getCoordsFromPos(coords);
    return svg('circle', {cx:x, cy:y, r:leafRadius*2, stroke: "black", fill:color_background})
  }

  /**
   * Virtual DOM of SVG circles for each neighbor of the leaf 
   *
   * @param {Object} dleaf - leaf informations
   * @return {vdom tree}
   */
  function neighborsVtree(dleaf){
    if (!displayNeighbors) return [];

    let vtree = []
    for (let name in dleaf.neighbors){
      const neighbor = dleaf.neighbors[name];
      if (neighbor.leaf){
        vtree.push(makeNeighborLeaf(neighbor))
      }
    }
    return vtree
  }

  /**
   * Virtual DOM of a SVG circle for a neighbor
   *
   * @param {leaf} neighbor
   * @return {vdom tree}
   */
  function makeNeighborLeaf (neighbor){
    const leaf = neighbor.leaf
    const coords = AI.getCoords(leaf);
    const {x, y} = getCoordsFromPos(coords);

    const type = AI.getType(leaf);
    const color = (type == 'UP')?color_up:color_down;

    return svg('circle', {
        cx: x, cy: y, r: leafRadius * 2,
        stroke: color, fill: color, class: 'viz-neighbor',
        attributes: {'data-neighbor-href': `${leaf.id}-${neighbor.fromId}`}
      }
    )
  }

  /**
   * getRotationAnimationInfo
   *
   * @param {object} dleaf - current leaf information
   * @return {number, string} - rotation angle and animation class name 
   */
  function getRotationAnimationInfo(dleaf){
    let rotation = dleaf.isUpside ? 0 : 180

    //do we need to do a rotation animation ?
    let animationClass = ""
    if (dleaf.needRotation){
      //Add a class for CSS animation (for IE browser support)
      animationClass = 'viz-animate-' + (dleaf.isUpside ? 'up':'down')
      //Invert the value of rotation : we want the value of the start of the animation
      rotation = rotation - 180
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
        fill: color_background,
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

