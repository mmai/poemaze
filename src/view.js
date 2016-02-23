import {h} from '@cycle/dom';

import {renderDashboard} from './views/dashboard'
import {renderCover}     from './views/cover'
import {renderPoem}      from './views/poem';
import {renderEnd}       from './views/end'
import {renderPdf}       from './views/pdf';

// export default function view(state, history, progressionVtree, aiLogoSvgVTree, aiSvgVTree){
export default function view(dashboardView, state){
  let views = [];
  // let dashboardView = renderDashboard(state.showDashboard, state.isUpside, history, progressionVtree, aiLogoSvgVTree, aiSvgVTree);
  if (window.aiPageType === "wordpress") {
    views.push(h('div'))//XXX if not present, it seems to harm virtual-dom (it makes fail e2e test "poem is made of 3 circles divs" for example), I don't know exactly why :-( ...
    views.push(dashboardView)
  } else if (state.pathname === 'pdf') {
    if (state.editionId === "pending") {
      views.push(h('div', "Edition des documents..."));
    } else {
      views.push(renderPdf(state.editionId));
    }
    views.push(dashboardView)
  } else {
    switch (state.history.length){
    case 0:
      views.push(renderPoem(state.isUpside, state.leafInfos))
      views.push(renderCover());
      break;
    case 126:
      views.push(renderEnd(state.leafInfos));
      views.push(dashboardView);
      break;
    default:
      // views.push(renderEnd(state.leafInfos));
      views.push(renderPoem(state.isUpside, state.leafInfos))
      views.push(dashboardView);
    }
  }
  return h("div#maincontainer", views)
  // return h("div", 'Page non trouvée');
}

