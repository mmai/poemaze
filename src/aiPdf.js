import {env} from 'settings'
import createElement from 'virtual-dom/create-element'

/**
 * Extract the svg cover representation from the global aiSvgComponent virtual-dom 
 *
 * @param {object} svgVtree aiSvgComponent virtual dom
 *
 * @return {string}
 */
export function cleanSvgCover(svgVtree){
  return createElement(svgVtree).outerHTML
}

/**
 * Construct the request params to call the wordpress API on pdf generation
 *
 * @param {Object} svgCover
 * @param {Array} leafLinks
 * @return {Object}
 */
export function makePdfApiParams(svgCover, leafLinks){
  let path = leafLinks.map(getLeafIndex).join('-');
  let url = `wp-json/arbreintegral/v1/path/${path}`;
  if (env === 'dev') { url =  'fakeapi.json'; }
  return {
    url,
    method: 'POST',
    eager: true, //XXX if 'eager: false', it makes  4 requests to the backend...
    send: {
      'svg': svgCover
    }
  }
}

/**
 * Translate leaf path to an integer via its binary representation
 *
 * @param {Object} leafLink
 * @return {number}
 */
 function getLeafIndex(leafLink){
   const path = leafLink.pathname
   //replace initial '0' by '1'
   //ex : "0101" => "1101"
   const binaryPath = "1" + path.slice(1);
   //Convert to decimal base integer
   return parseInt(binaryPath, 2)
 }
