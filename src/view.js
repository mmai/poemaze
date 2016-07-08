import {h} from 'cycle-snabbdom'
import {lastLeafId} from 'settings'

import {renderDashboard} from './views/dashboard'
import {renderSourceForm} from './views/sourceForm'
import {renderCover}     from './views/cover'
import {renderPoem}      from './views/poem';
import {renderEnd}       from './views/end'
import {renderJourney}       from './views/journey';

// export default function view(state, history, progressionVtree, aiLogoSvgVTree, aiSvgVTree){
export default function view(dashboardView, state){
  let views = [];
  // let dashboardView = renderDashboard(state.showDashboard, state.isUpside, history, progressionVtree, aiLogoSvgVTree, aiSvgVTree);
  if (window.aiPageType === "wordpress") {
    views.push(h('div'))//XXX if not present, it seems to harm virtual-dom (it makes fail e2e test "poem is made of 3 circles divs" for example), I don't know exactly why :-( ...
    views.push(dashboardView)
  } else if (state.pathname === 'pdf') {
    views.push(renderPdf(state.editionId));
    views.push(dashboardView)
  } else if (state.pathname === 'newsource') {
    views.push(renderSourceForm());
    views.push(dashboardView)
  } else if (state.pathname === 'journey') {
    views.push(renderJourney(state.journey));
    views.push(dashboardView)
  } else if ( 0 === state.history.length){
    views.push(renderPoem(state.isUpside, state.leafInfos))
    views.push(renderCover());
  } else {
    // const isLastLeaf = true
    const isLastLeaf = state.leafInfos.leaf.id === lastLeafId
    views.push( isLastLeaf ? renderEnd(state.leafInfos) : renderPoem(state.isUpside, state.leafInfos) )
    views.push(dashboardView);
  }
  return h("div#ai-page", views)
}

