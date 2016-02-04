import {h} from '@cycle/dom'
import createElement from 'virtual-dom/create-element';

export function renderPdf(editionId){
  return h('div#maincontainer', [ 
      h('h2', "Edition"),
      h('a', {href: `/aibooks/ArbreIntegral-${editionId}.pdf`}, `n° ${editionId}`),
    ]
  );
}

/**
 * Extract the svg cover representation from the global aiSvgComponent virtual-dom 
 *
 * @param {object} svgVtree aiSvgComponent virtual dom
 *
 * @return {string}
 */
export function cleanSvgCover(svgVtree){
  return createElement(svgVtree).outerHTML;
}
