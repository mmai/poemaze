import {h} from 'cycle-snabbdom'
import {isUp} from './utils'
import {pagesUrl} from 'settings'
import {assetsDir} from 'settings'

export function renderDashboard(showDashboard, isUpside, history, progressionVtree, aiLogoSvgVtree, aiSvgVtree){
  //We can't put the link directly on a.dashboardLink due to a cycle-dom bug on internet explorer
  const currentLeafId = history.length === 0 ? "0" : history[history.length-1].id;
  return h("aside#side-panel", {class: {active: showDashboard}}, [
      h("a.dashboardLink", {attrs: {href: showDashboard?"#main":"#dashboard"}}, [h("div.svgLogoContainer", [aiLogoSvgVtree])]),
      h("div.side-panel-content", [
          h("div.location", currentLeafId),
          aiSvgVtree,
          progressionVtree,
          h("script", ` function aiOpenMenu(e){ document.getElementById(e.dataset.target).classList.toggle('active'); } `),
        h('ul.navigation', [
            h("li", [
              buttonForList("historyList", "History"),
              h('ul#historyList', history.map(url =>
                h(`li.${isUp(url)?'ai-up':'ai-down'}`, [ h(`a`, {attrs: {href: `${url.id}`}}, `${url.word} (${url.id})`) ])
              ))
            ]),
            h("li", [h("a", {attrs:{href: "reset"}}, "Restart")]),
            h("li", [h("a", {attrs:{rel: "external", href: "http://github.com/mmai/arbre-integral"}}, "Source code")]),
          ]),
      ])
  ])
}

function buttonForList(listElement, caption){
  return h('button.trigger.reset', { attrs: { type:"button", onclick:"aiOpenMenu(this)", "data-target": listElement}}, caption)
}
