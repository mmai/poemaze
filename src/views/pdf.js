import {h} from '@cycle/dom'
import createElement from 'virtual-dom/create-element';

export function renderPdf(editionId){
  return h('div', [ 
      h('h2', `Edition du parcours ${editionId}`),
      h('a', {rel: "external", download: `ArbreIntegral-${editionId}-couverture.pdf`, href: `/aibooks/ArbreIntegral-${editionId}-couverture.pdf`}, `Télécharger la couverture`),
      h('a', {rel: "external", download: `ArbreIntegral-${editionId}.pdf`, href: `/aibooks/ArbreIntegral-${editionId}.pdf`}, `Télécharger le contenu`),
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
